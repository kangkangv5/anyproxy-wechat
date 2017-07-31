module.exports = {
    summary:"wechat",
    replaceServerResDataAsync: function(req,res,serverResData,callback){
        if(/mp\/profile_ext\?action=home/i.test(req.url)){ // 查看历史消息
            try {
                get_weixin_history(function(weixin){ // 获取要采集的所有公共号

                    var ret = /var msgList = \'(.*?)\';/.exec(serverResData.toString());
                    db_log(ret[1].html(false).html(false));
                    // 解析json
                    try{
                        var json = JSON.parse(ret[1].html(false));
                    } catch(e) {
                        var json = eval("("+ ret[1].html(false) + ")");
                    }

                    var list = json.list;
                    var content_url = "";
                    for(var i = 0; i<list.length; i++) {
                        console.log("Info:", list[i]["app_msg_ext_info"]);

                        var info = list[i]["app_msg_ext_info"];
                        if(!info) {continue;}
                        var dt = list[i]["comm_msg_info"]["datetime"];
                        if (info["is_multi"]) { // 是否是多图文
                            for (var j=0;j<info["multi_app_msg_item_list"].length; j++) {
                                content_url = info["multi_app_msg_item_list"][j]["content_url"].html(false);
                                info["multi_app_msg_item_list"][j]["datetime"] = dt;
                                info["multi_app_msg_item_list"][j]["is_multi"] = 1;
                                db_insert_post(info["multi_app_msg_item_list"][j]);
                                db_insert_tmplist(content_url);
                            }
                        } else {
                            content_url = info["content_url"].html(false);
                            info["datetime"] = dt;
                            db_insert_post(info);
                            db_insert_tmplist(content_url);
                        }
                    }


                    if(weixin) {
                        content_url = "https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz="+ weixin.biz +"&scene=124#wechat_redirect";
                        callback(jump(content_url, serverResData));
                    } else {
                        // 获取微信详细第一条
                        get_weixin_first(function(content_url){
                            if(content_url) {
                                callback(jump(content_url, serverResData));
                            } else {
                                callback(serverResData);
                            }
                        });
                    }
                });
            } catch (e) {
                console.log(e);
            }
        }
        else if(/s\?__biz/i.test(req.url)){
            // 获取微信详细第一条
            get_weixin_first(function(content_url){
                if(content_url) {
                    callback(jump(content_url, serverResData));
                } else {
                    callback(serverResData);
                }
            });
        }else if (/mp\/getappmsgext/i.test(req.url)){
            db_log('阅读数和点赞数地址：'+ join_url(req));
            var url = require('url');
            var q = url.parse(join_url(req), true).query;

            var json = JSON.parse(serverResData.toString().html(false));
            var read_num = json.appmsgstat.read_num;
            var like_num = json.appmsgstat.like_num;

            update_post_num([read_num, like_num, q.__biz, q.mid, q.idx]);

            callback(serverResData);
        }else{
            callback(serverResData);
        }

    },
    replaceRequestOption : function(req,option){
        var newOption = option;
        if(/google|btrace/i.test(newOption.headers.host)){
            newOption.hostname = "127.0.0.1";
            newOption.port     = "80";
        }

        if(/log\.tbs\.qq\.com/i.test(req.url)){
            newOption.hostname = "127.0.0.1";
            newOption.port     = "80";
        }
        return newOption;
    }
};

var client = null;
function db_con() {
    if(client != null) {
        return client;
    } else {
        var mysql = require('mysql');
        client = mysql.createConnection({host:'127.0.0.1',
            user:'root', password:'123456', database:'collection'});
        client.connect();
        return client;
    }
}

function db_log(str) {
    client = db_con();
    client.query('INSERT INTO log(log) VALUES (?)', str);
}

function db_insert_post(info){
    client = db_con();
    var url = require('url');
    content_url = info['content_url'].html(false);
    source_url = info['source_url'].html(false);
    db_log("正在添加详情：" + info['content_url'].html(false));
    var q = url.parse(content_url, true).query;
    client.query("SELECT count(*) AS count FROM post WHERE content_url = ?", [info['content_url']], function(error, results, fields){
        if (error) throw error;
        if(results[0].count < 1) {
            client.query("INSERT INTO post(`id`, `biz`,`mid`, `idx`, `field_id`, `title`, `title_encode`, `digest`, `content_url`, " +
                    "`source_url`, `cover`, `is_multi`, `is_top`, `datetime`, `readNum`, `likeNum`) " +
                    "VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0);",
                [q.__biz, q.mid, q.idx, info["fileid"], info["title"], info["title"], info["digest"], content_url, source_url,
                    info["cover"], info["is_multi"], 0, info["datetime"]]);
        }
    });
}

function db_insert_tmplist(content_url) {
    client = db_con();
    client.query("SELECT count(*) as count FROM tmplist WHERE `content_url`='" + content_url + "'",
    function (error, results, fields) {
        if(results[0].count < 1 && content_url.length > 0) {
            client.query("INSERT INTO tmplist(`content_url`, `load`) VALUES('"+ content_url +"', 0)");
        }
    });
}

function get_url() {
    client = db_con();
    client.query("DELETE FROM `tmplist` ORDER BY id DESC LIMIT 1");
    return client.query("SELECT content_url AS url FROM tmplist ORDER BY id DESC LIMIT 1");
}

// 更新阅读书和点赞数
function update_post_num(ls) {
    client = db_con();
    client.query("UPDATE `post` SET `readNum` = ?, `likeNum` = ? WHERE biz= ? AND mid= ? AND idx= ?", ls);
}

String.prototype.html = function(encode) {
    var replace =["&#39;", "'", "&quot;", '"', "&nbsp;", " ", "&gt;", ">", "&lt;", "<", "&amp;", "&", "&yen;", "¥", "\\\\", ""];
    if (encode) {
        replace.reverse();
    }
    for (var i=0,str=this;i< replace.length;i+= 2) {
        str=str.replace(new RegExp(replace[i],'g'),replace[i+1]);
    }
    return str;
};

// 获取微信历史消息
var weixin_list = null;
var weixin_index = 0;
function get_weixin_history(callback){
    if(weixin_list == null){
        weixin_index = 0;
        client = db_con();
        client.query("SELECT biz FROM weixin ORDER BY id ASC", function(error, results, fields){
            db_log("biz1:" + results[weixin_index].biz);
            weixin_list = results;
            callback(results[weixin_index]);
        });
    } else {
        weixin_index += 1;
        if(weixin_list && weixin_list[weixin_index]) {
            db_log("biz2:" + weixin_list[weixin_index].biz);
            callback(weixin_list[weixin_index]);
        } else {
            callback(null);
        }
    }
}

// 获取要采集的微信正序第一条
function get_weixin_first(callback) {
    client = db_con();
    client.query("SELECT content_url FROM tmplist WHERE `load`=0 ORDER BY id ASC LIMIT 1", function(error, results, fields){
        if(results && results.length > 0){
            client.query("UPDATE tmplist SET `load`=1 WHERE `load`=0 ORDER BY id ASC LIMIT 1", function(e, r, f){
                callback(results[0].content_url);
            });
        } else {
            callback(null);
        }
    })
}

function join_url(req) {
    if(req.url.indexOf("http") != 0) {
        return "http://" + req.headers.host + req.url.html(false);
    } else {
        return req.url;
    }
}

function jump(content_url, serverResData) {
    return '<script>setTimeout(function(){window.location.href="'+ content_url +'"}, 2000)</script>' + serverResData;
}