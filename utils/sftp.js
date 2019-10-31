var fs = require("fs");
let Client = require('ssh2-sftp-client');

var server_config = require("../apps/server_config");
var log = require("./log");

var sftp_config = server_config.sftp_file_server;

var sftp_client = new Client();
sftp_client.connect({
    host: sftp_config.host,
    port: sftp_config.port,
    username: sftp_config.username,
    password: sftp_config.password,
}).then(function(){
    log.info("sftp file server已連線 ...");
}).catch(function(err){
    log.error("err = ", err);
})

module.exports = sftp_client;
