-- phpMyAdmin SQL Dump
-- version 4.5.2
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: 2017-07-31 08:17:06
-- 服务器版本： 5.5.21-log
-- PHP Version: 5.6.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `collection`
--

-- --------------------------------------------------------

--
-- 表的结构 `log`
--

CREATE TABLE `log` (
  `id` int(11) NOT NULL,
  `log` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- 表的结构 `post`
--

CREATE TABLE `post` (
  `id` int(11) NOT NULL,
  `biz` varchar(255) NOT NULL COMMENT '文章对应的公众号biz',
  `mid` int(10) UNSIGNED NOT NULL DEFAULT '0',
  `idx` int(10) UNSIGNED NOT NULL DEFAULT '0',
  `field_id` int(11) NOT NULL COMMENT '微信定义的一个id，每条文章唯一',
  `title` varchar(255) NOT NULL DEFAULT '' COMMENT '文章标题',
  `title_encode` text NOT NULL COMMENT '文章编码，防止文章出现emoji',
  `digest` varchar(500) NOT NULL DEFAULT '' COMMENT '文章摘要',
  `content_url` varchar(500) NOT NULL COMMENT '文章地址',
  `source_url` varchar(500) NOT NULL COMMENT '阅读原文地址',
  `cover` varchar(500) NOT NULL COMMENT '封面图片',
  `is_multi` int(11) NOT NULL COMMENT '是否多图文',
  `is_top` int(11) NOT NULL COMMENT '是否头条',
  `datetime` int(11) NOT NULL COMMENT '文章时间戳',
  `readNum` int(11) NOT NULL DEFAULT '1' COMMENT '文章阅读量',
  `likeNum` int(11) NOT NULL DEFAULT '0' COMMENT '文章点赞量'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- 表的结构 `tmplist`
--

CREATE TABLE `tmplist` (
  `id` int(11) UNSIGNED NOT NULL,
  `content_url` varchar(255) DEFAULT NULL COMMENT '文章地址',
  `load` int(11) DEFAULT '0' COMMENT '读取中标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- 表的结构 `weixin`
--

CREATE TABLE `weixin` (
  `id` int(11) NOT NULL,
  `biz` varchar(255) DEFAULT '' COMMENT '公众号唯一标识biz',
  `collect` int(11) DEFAULT '1' COMMENT '记录采集时间的时间戳'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `log`
--
ALTER TABLE `log`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `post`
--
ALTER TABLE `post`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tmplist`
--
ALTER TABLE `tmplist`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `content_url` (`content_url`);

--
-- Indexes for table `weixin`
--
ALTER TABLE `weixin`
  ADD PRIMARY KEY (`id`);

--
-- 在导出的表使用AUTO_INCREMENT
--

--
-- 使用表AUTO_INCREMENT `log`
--
ALTER TABLE `log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=384;
--
-- 使用表AUTO_INCREMENT `post`
--
ALTER TABLE `post`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=268;
--
-- 使用表AUTO_INCREMENT `tmplist`
--
ALTER TABLE `tmplist`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=268;
--
-- 使用表AUTO_INCREMENT `weixin`
--
ALTER TABLE `weixin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
