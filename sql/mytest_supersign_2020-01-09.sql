# ************************************************************
# Sequel Pro SQL dump
# Version 5428
#
# https://www.sequelpro.com/
# https://github.com/sequelpro/sequelpro
#
# Host: 127.0.0.1 (MySQL 8.0.18)
# Database: mytest_supersign
# Generation Time: 2020-01-09 05:27:19 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
SET NAMES utf8mb4;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table account_info
# ------------------------------------------------------------

DROP TABLE IF EXISTS `account_info`;

CREATE TABLE `account_info` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `account` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '""' COMMENT 'apple帐号',
  `cert_name` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '""' COMMENT '證書名稱',
  `bundle_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '""' COMMENT 'appid',
  `devices` int(11) NOT NULL DEFAULT '0' COMMENT '设备数',
  `is_enable` int(11) NOT NULL DEFAULT '0' COMMENT '是否啟用，0-停用，1-啟用',
  `group` int(11) NOT NULL DEFAULT '0' COMMENT '帳號分流群組',
  `expired` int(11) NOT NULL DEFAULT '0' COMMENT '帳號到期日的時間戳',
  `days` int(11) NOT NULL DEFAULT '1' COMMENT '記錄在本地的帳號session期限',
  `reg_content` varchar(2048) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '{"udids":[]}' COMMENT '紀錄使用過該帳號的設備id',
  `err_record` varchar(2048) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'spaceship 登入失敗的回傳',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;



# Dump of table app_info
# ------------------------------------------------------------

DROP TABLE IF EXISTS `app_info`;

CREATE TABLE `app_info` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `app_name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '""' COMMENT 'app名稱，也是目錄檔案名稱(APP_XXX_1234)',
  `app_desc` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '""' COMMENT 'app顯示名稱(紀錄用)',
  `version` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '""' COMMENT 'app版本',
  `sha1_name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '""' COMMENT 'app_name 的sha1',
  `md5_name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '""' COMMENT 'app_name 的md5',
  `site_code` int(11) NOT NULL DEFAULT '0' COMMENT '管理後台的平台代號',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;



# Dump of table device_info
# ------------------------------------------------------------

DROP TABLE IF EXISTS `device_info`;

CREATE TABLE `device_info` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `model` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '""' COMMENT 'Product 名稱',
  `udid` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '""' COMMENT '裝置udid(唯一)',
  `serial` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '""' COMMENT '設備序號(唯一)',
  `version` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '""' COMMENT '裝置版本',
  `jsonstr` varchar(8192) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '有重簽名的各app資訊(字串)',
  `time_valid` int(11) NOT NULL DEFAULT '0' COMMENT '設備第一次簽名時間戳+31536000後為一年期限',
  `charge_status` int(11) DEFAULT '0' COMMENT '0-新用戶, 1-舊用戶',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;



# Dump of table resign_ipa_info
# ------------------------------------------------------------

DROP TABLE IF EXISTS `resign_ipa_info`;

CREATE TABLE `resign_ipa_info` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `ipa_name` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '""' COMMENT 'ipa名稱',
  `download_path` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '""' COMMENT '下載plist路徑',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;




/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
