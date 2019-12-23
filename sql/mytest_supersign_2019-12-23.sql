# ************************************************************
# Sequel Pro SQL dump
# Version 5428
#
# https://www.sequelpro.com/
# https://github.com/sequelpro/sequelpro
#
# Host: 127.0.0.1 (MySQL 8.0.18)
# Database: mytest_supersign
# Generation Time: 2019-12-23 01:55:49 +0000
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

LOCK TABLES `account_info` WRITE;
/*!40000 ALTER TABLE `account_info` DISABLE KEYS */;

INSERT INTO `account_info` (`id`, `account`, `cert_name`, `bundle_id`, `devices`, `is_enable`, `group`, `expired`, `days`, `reg_content`, `err_record`)
VALUES
	(1,'shuping1985@protonmail.com','iPhone Distribution: SHUPING SHEN (9TU42WVRBD)','com.ios.newsign',6,0,0,1605145756,1,'{\"udids\":[]}',NULL),
	(2,'liaoyanchi3@gmail.com','iPhone Distribution: Yanchi Liao (LWVSG28AKF)','com.ios.newsign02',21,1,0,1605145756,5,'{\"udids\":[2,10]}',NULL),
	(3,'chiuyuting@protonmail.com','iPhone Distribution: CHIU YUTING (HC7EHZA6T8)','com.ios.newsign03',99,0,0,1605145756,12,'{\"udids\":[]}',NULL),
	(4,'estrelitali@aol.com','iPhone Distribution: Estrelita Li (8627HNWM95)','com.ios.newsign04',99,0,0,1589040000,1,'{\"udids\":[]}',NULL);

/*!40000 ALTER TABLE `account_info` ENABLE KEYS */;
UNLOCK TABLES;


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

LOCK TABLES `app_info` WRITE;
/*!40000 ALTER TABLE `app_info` DISABLE KEYS */;

INSERT INTO `app_info` (`id`, `app_name`, `app_desc`, `version`, `sha1_name`, `md5_name`, `site_code`)
VALUES
	(2,'dev_188','Kimber188','1603','b7c394fb1e8093c5635045f3ab777ee228d4638b','d2cb56f8b25f102ef363ca7c9f151d1d',1),
	(3,'BF178','\"\"','1.6.03','32e0094a9b171313bab097c04bda22fb138bb481','5c74293dca6c44a5088386c334b2b96e',3),
	(8,'Mowwo456','asdf66662342346','1.6.03','b441f8134346ef983b964e7c0bb0aa8b64a19ddc','da78ee9f8f12b69f7b1100c9ec7a85d6',4),
	(15,'BF178','asdf21934782446','1603','250486c1b5979d89ac49b89c3040e05cea99caf5','16ec1f220b04b52c632a5e52ab97e376',5),
	(47,'my_188_1603','SPORT','1603','dc404401f6ff8896374ba5da50f0fc13fe07e988','67437ffc0c33dd92b63c120c686db2d9',2),
	(51,'my_518_1604','518','1604','a20c9de43e7a7cd7bc93f71c3be47e42b50cb730','48381d4eaea7a782d88b1d7f95c6c005',36),
	(52,'APP_dbp_1604','devDBP','1604','e9e3b8e2a0ae36ab99560a1aa925f17c86900fca','cd9447ad40b515444f03ee7eb2b3546a',6),
	(53,'app_vn_1603','devVN','1100','07b3c9945f0381b1338f58c3460608cf827cfe77','10f1af178adc56e16a094677a1767934',7);

/*!40000 ALTER TABLE `app_info` ENABLE KEYS */;
UNLOCK TABLES;


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
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

LOCK TABLES `device_info` WRITE;
/*!40000 ALTER TABLE `device_info` DISABLE KEYS */;

INSERT INTO `device_info` (`id`, `model`, `udid`, `serial`, `version`, `jsonstr`, `time_valid`)
VALUES
	(1,'iPhone10,6','c3d699593eae5c0cb68a83ce4a458c0000000000','\"\"','15E217',NULL,0),
	(2,'iPhone9,4','868a1cecfd7d01536d1b305b2594509a63fb4c4b','\"\"','16G102','{\"app_resigned_info\":[{\"app_name\":\"my_518_1604\",\"app_desc\":\"518\",\"app_ver\":\"1604\",\"ipa_name\":\"1576219282\",\"site_code\":36}],\"reg_acc_info\":{\"is_reg\":1,\"acc_id\":2,\"reg_account\":\"liaoyanchi3@gmail.com\",\"cert_name\":\"iPhone Distribution: Yanchi Liao (LWVSG28AKF)\",\"expired\":1605145756,\"bundle_id\":\"com.ios.newsign02\"}}',1607755282),
	(3,'iPhone9,4','95f26c79da29334dda96041054e0246e66307d1c','\"\"','16F203',NULL,0),
	(4,'iPhone7,2','0bc3bfbe3781a2917d4edc3733d052465d528e2a','\"\"','14E304',NULL,0),
	(5,'iPhone9,4','5494eb626094411689a97b2249c7c97a9c913d26','\"\"','16D39',NULL,0),
	(6,'iPhone11,6','E5B3C054-4D4F-42AE-BB5C-C1D7708C5798','\"\"','17A577',NULL,0),
	(7,'iPhone11','A812998C-A48E-41B8-BEAC-099B2CFC4ECD','\"\"','16G102',NULL,0),
	(9,'undefined','undefined','\"\"','undefined',NULL,0),
	(10,'iPhone11,6','00008020-000B683C01D1002E','\"\"','17A577','{\"app_resigned_info\":[{\"app_name\":\"my_518_1604\",\"app_desc\":\"518\",\"app_ver\":\"1604\",\"ipa_name\":\"1576733670\",\"site_code\":36}],\"reg_acc_info\":{\"is_reg\":1,\"acc_id\":2,\"reg_account\":\"liaoyanchi3@gmail.com\",\"cert_name\":\"iPhone Distribution: Yanchi Liao (LWVSG28AKF)\",\"expired\":1605145756,\"bundle_id\":\"com.ios.newsign02\"}}',1608269670),
	(11,'iPhone9,4','0f4b425e1c8729b39172db4b1073917825372c3e','\"\"','16G102','{\"app_resigned_info\":[{\"app_name\":\"my_518_1604\",\"app_desc\":\"518\",\"app_ver\":\"1604\",\"ipa_name\":\"1575510857\",\"site_code\":36}],\"reg_acc_info\":{\"is_reg\":1,\"acc_id\":2,\"reg_account\":\"liaoyanchi3@gmail.com\",\"cert_name\":\"iPhone Distribution: Yanchi Liao (LWVSG28AKF)\",\"expired\":1605145756,\"bundle_id\":\"com.ios.newsign02\"}}',1607046857),
	(12,'iPhone10,4','a1296a42f3a025e8d24a57030756f62313dd9a5b','\"\"','16A404','{\"app_resigned_info\":[{\"app_name\":\"my_518_1604\",\"app_desc\":\"518\",\"app_ver\":\"1604\",\"ipa_name\":\"1575510878\",\"site_code\":36}],\"reg_acc_info\":{\"is_reg\":1,\"acc_id\":2,\"reg_account\":\"liaoyanchi3@gmail.com\",\"cert_name\":\"iPhone Distribution: Yanchi Liao (LWVSG28AKF)\",\"expired\":1605145756,\"bundle_id\":\"com.ios.newsign02\"}}',1607046878),
	(13,'iPhone10,6','32d086a424daf222c38b6aa06e8f482ff19a5380','G6WVPNB6JCLJ','16G77','{\"app_resigned_info\":[{\"app_name\":\"my_518_1604\",\"app_desc\":\"518\",\"app_ver\":\"1604\",\"ipa_name\":\"1575522787\",\"site_code\":36}],\"reg_acc_info\":{\"is_reg\":1,\"acc_id\":2,\"reg_account\":\"liaoyanchi3@gmail.com\",\"cert_name\":\"iPhone Distribution: Yanchi Liao (LWVSG28AKF)\",\"expired\":1605145756,\"bundle_id\":\"com.ios.newsign02\"}}',1607046857),
	(14,'iPhone9,4','d8b8e5c61443bea332024c014590682bd6ddc6ab','\"\"','15F79',NULL,0),
	(15,'iPhone9,4','fd4aa5a68334619dd8310684ddd5327256eb8519','\"\"','16E227',NULL,0),
	(16,'iPhone11,6','00008020-000110A23E39002E','\"\"','17B111',NULL,0),
	(17,'iPhone12,1','00008030-000E24C81E60802E','\"\"','17A878',NULL,0),
	(18,'iPhone12,1','00008030-0002449A02E0802E','\"\"','17A878',NULL,0),
	(19,'iPhone10,4','466ebc957d191fcee3d5eb2bbab77c8887bedae8','\"\"','17A878',NULL,0),
	(20,'iPhone12,5','92c982b60edc503aaebb6ff5e50e6c0100000000','\"\"','17B102',NULL,0),
	(21,'iPhone11,6','00008020-001128891A62002E','\"\"','16E227','{\"app_resigned_info\":[{\"app_name\":\"my_518_1604\",\"app_desc\":\"518\",\"app_ver\":\"1604\",\"ipa_name\":\"1575510857\",\"site_code\":36}],\"reg_acc_info\":{\"is_reg\":1,\"acc_id\":2,\"reg_account\":\"liaoyanchi3@gmail.com\",\"cert_name\":\"iPhone Distribution: Yanchi Liao (LWVSG28AKF)\",\"expired\":1605145756,\"bundle_id\":\"com.ios.newsign02\"}}',1607046857),
	(22,'iPhone9,3','1088da9b1b604efdbd4e26111c9e40706b964cb0','\"\"','16F203','{\"app_resigned_info\":[{\"app_name\":\"my_518_1604\",\"app_desc\":\"518\",\"app_ver\":\"1604\",\"ipa_name\":\"1575510900\",\"site_code\":36}],\"reg_acc_info\":{\"is_reg\":1,\"acc_id\":2,\"reg_account\":\"liaoyanchi3@gmail.com\",\"cert_name\":\"iPhone Distribution: Yanchi Liao (LWVSG28AKF)\",\"expired\":1605145756,\"bundle_id\":\"com.ios.newsign02\"}}',1607046900);

/*!40000 ALTER TABLE `device_info` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table resign_ipa_info
# ------------------------------------------------------------

DROP TABLE IF EXISTS `resign_ipa_info`;

CREATE TABLE `resign_ipa_info` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `ipa_name` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '""' COMMENT 'ipa名稱',
  `download_path` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '""' COMMENT '下載plist路徑',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

LOCK TABLES `resign_ipa_info` WRITE;
/*!40000 ALTER TABLE `resign_ipa_info` DISABLE KEYS */;

INSERT INTO `resign_ipa_info` (`id`, `ipa_name`, `download_path`)
VALUES
	(1,'1570612610','itms-services://?action=download-manifest&url=https://apple.bckappgs.info/dev_188/1570612610/manifest.plist'),
	(2,'\"\"','\"\"'),
	(3,'1570613049','itms-services://?action=download-manifest&url=https://apple.bckappgs.info/dev_188/1570613049/manifest.plist'),
	(4,'1571038825','itms-services://?action=download-manifest&url=https://apple.bckappgs.info/dev_188/1571038825/1571038825.plist'),
	(5,'1571039123','itms-services://?action=download-manifest&url=https://apple.bckappgs.info/dev_188/1571039123/1571039123.plist'),
	(6,'1571041101','itms-services://?action=download-manifest&url=https://apple.bckappgs.info/dev_188/1571041101/manifest.plist'),
	(7,'1571046041','itms-services://?action=download-manifest&url=https://apple.bckappgs.info/dev_188/1571046041/manifest.plist'),
	(8,'1571047378','itms-services://?action=download-manifest&url=https://apple.bckappgs.info/dev_188/1571047378/1571047378.plist'),
	(9,'1571047559','itms-services://?action=download-manifest&url=https://apple.bckappgs.info/dev_188/1571047559/1571047559.plist'),
	(10,'1571132595','itms-services://?action=download-manifest&url=https://apple.bckappgs.info/dev_188/1571132595/1571132595.plist'),
	(11,'1571636560','itms-services://?action=download-manifest&url=https://apple.bckappgs.info/dev_188/1571636560/1571636560.plist'),
	(12,'1571649197','itms-services://?action=download-manifest&url=https://apple.bckappgs.info/dev_188/1571649197/1571649197.plist'),
	(13,'1572246450','itms-services://?action=download-manifest&url=https://apple.bckappgs.info/dev_188/1572246450/1572246450.plist'),
	(14,'1572247927','itms-services://?action=download-manifest&url=https://apple.bckappgs.info/dev_188/1572247927/1572247927.plist'),
	(15,'1572248153','itms-services://?action=download-manifest&url=https://apple.bckappgs.info/dev_188/1572248153/1572248153.plist'),
	(16,'1572248368','itms-services://?action=download-manifest&url=https://apple.bckappgs.info/dev_188/1572248368/1572248368.plist'),
	(17,'1572248576','itms-services://?action=download-manifest&url=https://apple.bckappgs.info/dev_188/1572248576/1572248576.plist'),
	(18,'1572248710','itms-services://?action=download-manifest&url=https://apple.bckappgs.info/dev_188/1572248710/1572248710.plist'),
	(19,'1572248777','itms-services://?action=download-manifest&url=https://apple.bckappgs.info/dev_188/1572248777/1572248777.plist'),
	(20,'1572249944','itms-services://?action=download-manifest&url=https://apple.bckappgs.info/dev_188/1572249944/1572249944.plist'),
	(21,'1572250805','itms-services://?action=download-manifest&url=https://apple.bckappgs.info/dev_188/1572250805/1572250805.plist'),
	(22,'1572332226','itms-services://?action=download-manifest&url=https://apple.bckappgs.info/dev_188/1572332226/1572332226.plist'),
	(23,'1572334664','itms-services://?action=download-manifest&url=https://apple.bckappgs.info/dev_188/1572334664/1572334664.plist'),
	(24,'1572335010','itms-services://?action=download-manifest&url=https://apple.bckappgs.info/dev_188/1572335010/1572335010.plist'),
	(25,'1572337873','itms-services://?action=download-manifest&url=https://apple.bckappgs.info/dev_188/1572337873/1572337873.plist'),
	(26,'1572339697','itms-services://?action=download-manifest&url=https://apple.bckappgs.info/dev_188/1572339697/1572339697.plist'),
	(27,'1572341180','itms-services://?action=download-manifest&url=https://apple.bckappgs.info/dev_188/1572341180/1572341180.plist'),
	(28,'1572490059','itms-services://?action=download-manifest&url=https://apple.bckappgs.info/dev_188/1572490059/1572490059.plist'),
	(29,'1572490183','itms-services://?action=download-manifest&url=https://apple.bckappgs.info/dev_188/1572490183/1572490183.plist'),
	(30,'1572491098','itms-services://?action=download-manifest&url=https://apple.bckappgs.info/dev_188/1572491098/1572491098.plist'),
	(31,'1572491296','itms-services://?action=download-manifest&url=https://apple.bckappgs.info/dev_188/1572491296/1572491296.plist'),
	(32,'1572491408','itms-services://?action=download-manifest&url=https://apple.bckappgs.info/dev_188/1572491408/1572491408.plist'),
	(33,'1572503460','itms-services://?action=download-manifest&url=https://apple.bckappgs.info/dev_188/1572503460/1572503460.plist'),
	(34,'1572503806','itms-services://?action=download-manifest&url=https://apple.bckappgs.info/dev_188/1572503806/1572503806.plist'),
	(35,'1572504017','itms-services://?action=download-manifest&url=https://apple.bckappgs.info/dev_188/1572504017/1572504017.plist'),
	(36,'1572509198','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/appfile/dev_188/1572509198/1572509198.plist'),
	(37,'1572509857','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/appfile/dev_188/1572509857/1572509857.plist'),
	(38,'1572510338','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/appfile/dev_188/1572510338/1572510338.plist'),
	(39,'1572510788','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/appfile/dev_188/1572510788/1572510788.plist'),
	(40,'1572511207','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/appfile/dev_188/1572511207/1572511207.plist'),
	(41,'1572511581','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/appfile/dev_188/1572511581/1572511581.plist'),
	(42,'1572511987','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/appfile/dev_188/1572511987/1572511987.plist'),
	(43,'1572512181','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/appfile/dev_188/1572512181/1572512181.plist'),
	(44,'1572584804','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/appfile/dev_188/1572584804/1572584804.plist'),
	(45,'1572585742','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/appfile/dev_188/1572585742/1572585742.plist'),
	(46,'1572586652','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/appfile/dev_188/1572586652/1572586652.plist'),
	(47,'1572587272','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/appfile/dev_188/1572587272/1572587272.plist'),
	(48,'1572587859','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/appfile/dev_188/1572587859/1572587859.plist'),
	(49,'1572596669','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/dev_188/1572596669/1572596669.plist'),
	(50,'1572850604','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/dev_188/1572850604/1572850604.plist'),
	(51,'1572851766','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/dev_188/1572851766/1572851766.plist'),
	(52,'1572852484','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/dev_188/1572852484/1572852484.plist'),
	(53,'1572854443','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/dev_188/1572854443/1572854443.plist'),
	(54,'1572854816','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/dev_188/1572854816/1572854816.plist'),
	(55,'1572855055','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/dev_188/1572855055/1572855055.plist'),
	(56,'1572856075','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/dev_188/1572856075/1572856075.plist'),
	(57,'1572931461','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/dev_188/1572931461/1572931461.plist'),
	(58,'1572932589','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/dev_188/1572932589/1572932589.plist'),
	(59,'1572942535','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/dev_188/1572942535/1572942535.plist'),
	(60,'1573008552','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/devSPORT/1573008552/1573008552.plist'),
	(61,'1573019123','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/APP-21/1573019123/1573019123.plist'),
	(62,'1573032032','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/devSPORT/1573032032/1573032032.plist'),
	(63,'1573093736','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/devSPORT/1573093736/1573093736.plist'),
	(64,'1573094747','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/devSPORT/1573094747/1573094747.plist'),
	(65,'1573095385','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/devSPORT/1573095385/1573095385.plist'),
	(66,'1573104596','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/APP-22/1573104596/1573104596.plist'),
	(67,'1573109905','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/APP-23/1573109905/1573109905.plist'),
	(68,'1573119081','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/APP-24/1573119081/1573119081.plist'),
	(69,'1573178905','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/APP-24/1573178905/1573178905.plist'),
	(70,'1573178996','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/APP-24/1573178996/1573178996.plist'),
	(71,'1573183215','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/devSPORT/1573183215/1573183215.plist'),
	(72,'1573184488','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/APP-26/1573184488/1573184488.plist'),
	(73,'1573189498','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/APP-26/1573189498/1573189498.plist'),
	(74,'1573203555','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/devSPORT/1573203555/1573203555.plist'),
	(75,'1573204111','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/devSPORT/1573204111/1573204111.plist'),
	(76,'1573438410','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/devSPORT/1573438410/1573438410.plist'),
	(77,'1573441888','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/devSPORT/1573441888/1573441888.plist'),
	(78,'1573442099','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/devSPORT/1573442099/1573442099.plist'),
	(79,'1573609756','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/APP_188_1603/1573609756/1573609756.plist'),
	(80,'1573610144','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/APP_188_1603/1573610144/1573610144.plist'),
	(81,'1573610942','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/APP_188_1603/1573610942/1573610942.plist'),
	(82,'1573611056','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/APP_188_1603/1573611056/1573611056.plist'),
	(83,'1573611624','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/APP_188_1603/1573611624/1573611624.plist'),
	(84,'1573611703','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/APP_188_1603/1573611703/1573611703.plist'),
	(85,'1573612575','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/APP_188_1603/1573612575/1573612575.plist'),
	(86,'1573612788','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/APP_188_1603/1573612788/1573612788.plist'),
	(87,'1573613406','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/APP_188_1603/1573613406/1573613406.plist'),
	(88,'1573613494','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/APP_188_1603/1573613494/1573613494.plist'),
	(89,'1573632619','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/APP_188_1603/1573632619/1573632619.plist'),
	(90,'1573810151','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/APP_188_1603/1573810151/1573810151.plist'),
	(91,'1573810633','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/APP_188_1603/1573810633/1573810633.plist'),
	(92,'1573810832','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/APP_188_1603/1573810832/1573810832.plist'),
	(93,'1573812282','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/APP_188_1603/1573812282/1573812282.plist'),
	(94,'1574041795','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/APP_dbp_1603/1574041795/1574041795.plist'),
	(95,'1574042525','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/app_vn_1603/1574042525/1574042525.plist'),
	(96,'1574043284','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/app_vn_1603/1574043284/1574043284.plist'),
	(97,'1574044185','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/APP_dbp_1604/1574044185/1574044185.plist'),
	(98,'1574058256','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/app_518_1126/1574058256/1574058256.plist'),
	(99,'1574067508','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/app_518_1126/1574067508/1574067508.plist'),
	(100,'1574067528','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/app_518_1126/1574067528/1574067528.plist'),
	(101,'1574067670','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/app_518_1126/1574067670/1574067670.plist'),
	(102,'1574067690','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/app_518_1126/1574067690/1574067690.plist'),
	(103,'1574068164','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/app_518_1127/1574068164/1574068164.plist'),
	(104,'1574068872','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/app_518_1127/1574068872/1574068872.plist'),
	(105,'1574128663','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/app_518_1128/1574128663/1574128663.plist'),
	(106,'1574129163','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/app_518_1129/1574129163/1574129163.plist'),
	(107,'1574129183','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/app_518_1129/1574129183/1574129183.plist'),
	(108,'1574135475','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/app_518_1129/1574135475/1574135475.plist'),
	(109,'1574153376','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/app_518_1130/1574153376/1574153376.plist'),
	(110,'1574153924','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/app_518_1131/1574153924/1574153924.plist'),
	(111,'1574154599','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/app_518_1132/1574154599/1574154599.plist'),
	(112,'1574154929','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/app_518_1133/1574154929/1574154929.plist'),
	(113,'1574155234','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/app_518_1134/1574155234/1574155234.plist'),
	(114,'1574155828','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/app_518_1135/1574155828/1574155828.plist'),
	(115,'1574156628','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/app_518_1137/1574156628/1574156628.plist'),
	(116,'1574156996','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/app_518_1138/1574156996/1574156996.plist'),
	(117,'1574215109','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/app_518_1139/1574215109/1574215109.plist'),
	(118,'1574216919','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/app_518_1140/1574216919/1574216919.plist'),
	(119,'1574217603','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/app_518_1141/1574217603/1574217603.plist'),
	(120,'1574219327','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/app_518_1142/1574219327/1574219327.plist'),
	(121,'1574231819','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/APP_dbp_1604/1574231819/1574231819.plist'),
	(122,'1574232291','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/APP_dbp_1604/1574232291/1574232291.plist'),
	(123,'1574326065','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/APP_dbp_1604/1574326065/1574326065.plist'),
	(124,'1574395435','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/app_518_1150/1574395435/1574395435.plist'),
	(125,'1574400348','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/APP_dbp_1604/1574400348/1574400348.plist'),
	(126,'1574403605','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/app_518_1150/1574403605/1574403605.plist'),
	(127,'1574404373','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/app_518_1150/1574404373/1574404373.plist'),
	(128,'1574407299','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/app_518_1150/1574407299/1574407299.plist'),
	(129,'1574407423','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/app_518_1151/1574407423/1574407423.plist'),
	(130,'1574407809','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/app_518_1151/1574407809/1574407809.plist'),
	(131,'1574409378','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/app_518_1151/1574409378/1574409378.plist'),
	(132,'1574653328','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/APP_dbp_1604/1574653328/1574653328.plist'),
	(133,'1574653469','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/APP_dbp_1604/1574653469/1574653469.plist'),
	(134,'1574911216','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_518_1604/1574911216/1574911216.plist'),
	(135,'1574911756','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_518_1604/1574911756/1574911756.plist'),
	(136,'1574911966','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_518_1604/1574911966/1574911966.plist'),
	(137,'1574912596','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_518_1604/1574912596/1574912596.plist'),
	(138,'1574912803','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_518_1604/1574912803/1574912803.plist'),
	(139,'1574913747','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_188_1603/1574913747/1574913747.plist'),
	(140,'1574915873','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_518_1604/1574915873/1574915873.plist'),
	(141,'1574916382','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_518_1604/1574916382/1574916382.plist'),
	(142,'1574916565','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_518_1604/1574916565/1574916565.plist'),
	(143,'1574916754','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_518_1604/1574916754/1574916754.plist'),
	(144,'1574919247','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_518_1604/1574919247/1574919247.plist'),
	(145,'1574919459','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_518_1604/1574919459/1574919459.plist'),
	(146,'1574925167','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_518_1604/1574925167/1574925167.plist'),
	(147,'1574926017','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_518_1604/1574926017/1574926017.plist'),
	(148,'1574926345','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_518_1604/1574926345/1574926345.plist'),
	(149,'1574996356','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_518_1604/1574996356/1574996356.plist'),
	(150,'1574996539','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_518_1604/1574996539/1574996539.plist'),
	(151,'1574999030','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_518_1604/1574999030/1574999030.plist'),
	(152,'1574999742','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_518_1604/1574999742/1574999742.plist'),
	(153,'1574999764','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_518_1604/1574999764/1574999764.plist'),
	(154,'1575003931','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_518_1604/1575003931/1575003931.plist'),
	(155,'1575003955','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_518_1604/1575003955/1575003955.plist'),
	(156,'1575014237','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_518_1604/1575014237/1575014237.plist'),
	(157,'1575014260','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_518_1604/1575014260/1575014260.plist'),
	(158,'1575015028','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/APP_dbp_1604/1575015028/1575015028.plist'),
	(159,'1575017833','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_518_1604/1575017833/1575017833.plist'),
	(160,'1575018531','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_518_1604/1575018531/1575018531.plist'),
	(161,'1575019225','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/APP_dbp_1604/1575019225/1575019225.plist'),
	(162,'1575020248','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/APP_dbp_1604/1575020248/1575020248.plist'),
	(163,'1575020417','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_518_1604/1575020417/1575020417.plist'),
	(164,'1575020588','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_518_1604/1575020588/1575020588.plist'),
	(165,'1575020599','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/APP_dbp_1604/1575020599/1575020599.plist'),
	(166,'1575253175','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_188_1603/1575253175/1575253175.plist'),
	(167,'1575253185','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_518_1604/1575253185/1575253185.plist'),
	(168,'1575253508','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_518_1604/1575253508/1575253508.plist'),
	(169,'1575253531','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_518_1604/1575253531/1575253531.plist'),
	(170,'1575254272','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_188_1603/1575254272/1575254272.plist'),
	(171,'1575254283','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_518_1604/1575254283/1575254283.plist'),
	(172,'1575254605','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_518_1604/1575254605/1575254605.plist'),
	(173,'1575255457','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_518_1604/1575255457/1575255457.plist'),
	(174,'1575255468','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_188_1603/1575255468/1575255468.plist'),
	(175,'1575259411','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_518_1604/1575259411/1575259411.plist'),
	(176,'1575259433','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_188_1603/1575259433/1575259433.plist'),
	(177,'1575265034','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_518_1604/1575265034/1575265034.plist'),
	(178,'1575265045','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_188_1603/1575265045/1575265045.plist'),
	(179,'1575353853','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_518_1604/1575353853/1575353853.plist'),
	(180,'1575426164','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_518_1604/1575426164/1575426164.plist'),
	(181,'1575426292','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_518_1604/1575426292/1575426292.plist'),
	(182,'1575426567','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_518_1604/1575426567/1575426567.plist'),
	(183,'1575426685','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_518_1604/1575426685/1575426685.plist'),
	(184,'1575427196','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_518_1604/1575427196/1575427196.plist'),
	(185,'1575427568','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_518_1604/1575427568/1575427568.plist'),
	(186,'1575428011','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_518_1604/1575428011/1575428011.plist'),
	(187,'1575428033','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_518_1604/1575428033/1575428033.plist'),
	(188,'1575428124','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_518_1604/1575428124/1575428124.plist'),
	(189,'1575510857','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_518_1604/1575510857/1575510857.plist'),
	(190,'1575510878','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_518_1604/1575510878/1575510878.plist'),
	(191,'1575510900','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_518_1604/1575510900/1575510900.plist'),
	(192,'1575522787','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_518_1604/1575522787/1575522787.plist'),
	(193,'1575870005','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_518_1604/1575870005/1575870005.plist'),
	(194,'1575872951','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_518_1604/1575872951/1575872951.plist'),
	(195,'1575877731','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_518_1604/1575877731/1575877731.plist'),
	(196,'1576219010','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_518_1604/1576219010/1576219010.plist'),
	(197,'1576219282','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_518_1604/1576219282/1576219282.plist'),
	(198,'1576733670','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/my_518_1604/1576733670/1576733670.plist');

/*!40000 ALTER TABLE `resign_ipa_info` ENABLE KEYS */;
UNLOCK TABLES;



/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
