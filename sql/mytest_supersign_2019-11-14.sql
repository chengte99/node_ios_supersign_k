# ************************************************************
# Sequel Pro SQL dump
# Version 5428
#
# https://www.sequelpro.com/
# https://github.com/sequelpro/sequelpro
#
# Host: 127.0.0.1 (MySQL 8.0.16)
# Database: mytest_supersign
# Generation Time: 2019-11-14 02:09:43 +0000
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
  `is_enable` int(11) NOT NULL DEFAULT '1' COMMENT '是否啟用，0-停用，1-啟用',
  `group` int(11) NOT NULL DEFAULT '0' COMMENT '帳號分流群組',
  `expired` int(11) NOT NULL DEFAULT '0' COMMENT '帳號續費時間戳加上一年(時間戳加31536000)',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

LOCK TABLES `account_info` WRITE;
/*!40000 ALTER TABLE `account_info` DISABLE KEYS */;

INSERT INTO `account_info` (`id`, `account`, `cert_name`, `bundle_id`, `devices`, `is_enable`, `group`, `expired`)
VALUES
	(1,'shuping1985@protonmail.com','iPhone Distribution: SHUPING SHEN (9TU42WVRBD)','com.ios.newsign',100,0,0,1605145756),
	(2,'liaoyanchi3@gmail.com','iPhone Distribution: Yanchi Liao (LWVSG28AKF)','com.ios.newsign02',27,1,0,1605145756),
	(3,'chiuyuting@protonmail.com','iPhone Distribution: CHIU YUTING (HC7EHZA6T8)','com.ios.newsign03',100,0,0,1605145756);

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
	(2,'dev_188','Kimber188','1.6.02','b7c394fb1e8093c5635045f3ab777ee228d4638b','d2cb56f8b25f102ef363ca7c9f151d1d',1),
	(3,'BF178','\"\"','1.6.03','32e0094a9b171313bab097c04bda22fb138bb481','5c74293dca6c44a5088386c334b2b96e',3),
	(8,'Mowwo456','asdf66662342346','1.6.03','b441f8134346ef983b964e7c0bb0aa8b64a19ddc','da78ee9f8f12b69f7b1100c9ec7a85d6',4),
	(15,'BF178','asdf21934782446','1603','250486c1b5979d89ac49b89c3040e05cea99caf5','16ec1f220b04b52c632a5e52ab97e376',5),
	(47,'APP_188_1603','devSPORT','1605','1d63817b0518437756bf3b35e987ee5a88c1a81c','4cbbe8ceabecd9aa4530f73ed490ffbd',2),
	(51,'app_518_1002','APP-2','1003','7d1de78a66d025214234f330ad99c5f2b3b2a216','9923d9280c435b5a11ac2d0c33f679ee',36);

/*!40000 ALTER TABLE `app_info` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table device_info
# ------------------------------------------------------------

DROP TABLE IF EXISTS `device_info`;

CREATE TABLE `device_info` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `model` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '""' COMMENT 'Product 名稱',
  `udid` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '""' COMMENT '裝置唯一碼',
  `version` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '""' COMMENT '裝置版本',
  `jsonstr` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '""' COMMENT '有重簽名的各app資訊(字串)',
  `time_valid` int(11) NOT NULL DEFAULT '0' COMMENT '裝置使用期限(時間戳加31536000)',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

LOCK TABLES `device_info` WRITE;
/*!40000 ALTER TABLE `device_info` DISABLE KEYS */;

INSERT INTO `device_info` (`id`, `model`, `udid`, `version`, `jsonstr`, `time_valid`)
VALUES
	(1,'iPhone10,6','c3d699593eae5c0cb68a83ce4a458c0000000000','15E217','\"\"',0),
	(2,'iPhone9,4','868a1cecfd7d01536d1b305b2594509a63fb4c4b','16G102','{\"app_resigned_info\":[{\"app_name\":\"APP_188_1603\",\"app_desc\":\"devSPORT\",\"app_ver\":\"1605\",\"ipa_name\":\"1573632619\",\"site_code\":2}],\"reg_acc_info\":{\"is_reg\":1,\"acc_id\":2,\"reg_account\":\"liaoyanchi3@gmail.com\",\"cert_name\":\"iPhone Distribution: Yanchi Liao (LWVSG28AKF)\",\"expired\":1605145756,\"bundle_id\":\"com.ios.newsign02\"}}',1605168619),
	(3,'iPhone9,4','95f26c79da29334dda96041054e0246e66307d1c','16F203','\"\"',0),
	(4,'iPhone7,2','0bc3bfbe3781a2917d4edc3733d052465d528e2a','14E304','{\"app_resigned_info\":[{\"app_name\":\"dev_188\",\"ipa_name\":\"1572942535\"}],\"reg_acc_info\":{\"is_reg\":1,\"acc_id\":2,\"reg_account\":\"liaoyanchi3@gmail.com\",\"cert_name\":\"iPhone Distribution: Yanchi Liao (LWVSG28AKF)\",\"bundle_id\":\"com.ios.newsign02\"}}',1604478535),
	(5,'iPhone9,4','5494eb626094411689a97b2249c7c97a9c913d26','16D39','{\"app_resigned_info\":[{\"app_name\":\"dev_188\",\"ipa_name\":\"1572856075\"},{\"app_name\":\"APP-22\",\"ipa_name\":\"1573104596\",\"site_code\":36},{\"app_name\":\"APP-23\",\"ipa_name\":\"1573109905\",\"site_code\":36},{\"app_name\":\"APP-24\",\"ipa_name\":\"1573119081\",\"site_code\":36},{\"app_name\":\"APP-26\",\"ipa_name\":\"1573184488\",\"site_code\":36}],\"reg_acc_info\":{\"is_reg\":1,\"acc_id\":2,\"reg_account\":\"liaoyanchi3@gmail.com\",\"cert_name\":\"iPhone Distribution: Yanchi Liao (LWVSG28AKF)\",\"bundle_id\":\"com.ios.newsign02\"}}',1604720488),
	(6,'iPhone11,6','E5B3C054-4D4F-42AE-BB5C-C1D7708C5798','17A577','\"\"',1571132588),
	(7,'iPhone11','A812998C-A48E-41B8-BEAC-099B2CFC4ECD','16G102','\"\"',1603185197),
	(9,'undefined','undefined','undefined','\"\"',0),
	(10,'iPhone11,6','00008020-000B683C01D1002E','17A577','{\"app_resigned_info\":[{\"app_name\":\"devSPORT\",\"ipa_name\":\"1573095385\",\"site_code\":2},{\"app_name\":\"APP-24\",\"ipa_name\":\"1573178905\",\"site_code\":36},{\"app_name\":\"APP-26\",\"ipa_name\":\"1573189498\",\"site_code\":36}],\"reg_acc_info\":{\"is_reg\":1,\"acc_id\":2,\"reg_account\":\"liaoyanchi3@gmail.com\",\"cert_name\":\"iPhone Distribution: Yanchi Liao (LWVSG28AKF)\",\"bundle_id\":\"com.ios.newsign02\"}}',1604725498),
	(11,'iPhone9,4','0f4b425e1c8729b39172db4b1073917825372c3e','16G102','\"\"',0),
	(12,'iPhone10,4','a1296a42f3a025e8d24a57030756f62313dd9a5b','16A404','{\"app_resigned_info\":[{\"app_name\":\"APP-24\",\"ipa_name\":\"1573178996\",\"site_code\":36}],\"reg_acc_info\":{\"is_reg\":1,\"acc_id\":2,\"reg_account\":\"liaoyanchi3@gmail.com\",\"cert_name\":\"iPhone Distribution: Yanchi Liao (LWVSG28AKF)\",\"bundle_id\":\"com.ios.newsign02\"}}',1604714996);

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
	(89,'1573632619','itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/APP_188_1603/1573632619/1573632619.plist');

/*!40000 ALTER TABLE `resign_ipa_info` ENABLE KEYS */;
UNLOCK TABLES;



/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
