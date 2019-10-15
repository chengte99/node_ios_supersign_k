var express = require("express");
var path = require("path");
var fs = require("fs");
var bodyParser = require('body-parser');
var xmlparser = require('express-xml-bodyparser');
var http = require("http");
var https = require("https");
var hbs = require("hbs");

var privateKey = fs.readFileSync("./www_root/newssl/domain.key", "utf8");
var certificate = fs.readFileSync("./www_root/newssl/chained.pem", "utf8");
var credentials = {key: privateKey, cert: certificate};

var apps = require("./apps");
var server_config = require("../server_config");
var log = require("../../utils/log");

var mysql_supersign = require("../../database/mysql_supersign");
var center_database = server_config.center_database;
mysql_supersign.connect(center_database.host, center_database.port, center_database.db_name, center_database.user, center_database.password);

var app = express();

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

var http_config = server_config.webserver.http_config;
var https_config = server_config.webserver.https_config;

//設定view 副檔名hbs, 設定views 路徑, 設定partials 路徑
var staticFilePath = path.join(process.cwd() + "/www_root/static");
var viewsPath = path.join(process.cwd() + "/www_root/views");
var partialsPath = path.join(process.cwd() + "/www_root/partials");
app.set("view engine", "hbs");
app.set("views", viewsPath);
hbs.registerPartials(partialsPath);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.raw());
app.use(xmlparser());
//設定靜態資源路徑
app.use(express.static(staticFilePath));

app.use("/", apps);

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

// app.listen(http_config.port);

httpServer.listen(http_config.port, function(){
    log.info("HTTP server is running on: http://127.0.0.1:", http_config.port);
})

httpsServer.listen(https_config.port, function(){
    log.info("HTTPS server is running on: https://127.0.0.1:", https_config.port);
})

// log.info("start webserver ...", http_config.host, http_config.port);

