var fs = require("fs");
let Client = require('ssh2-sftp-client');

var server_config = require("../apps/server_config");
var log = require("../utils/log");

var sftp_config = server_config.sftp_file_server;

var app_name = "test";
var tag = "mytest";
var local_ipa_path = __dirname + "/my_188_1603.ipa";
var remote_dir_path = "/home/web_gs_pb/fun/apple.bckappgs.info/" + app_name + "/" + tag;
var remote_ipa_path = remote_dir_path + "/" + "my_upload.ipa";

var sftp_client = new Client();
sftp_client
    .connect({
        host: sftp_config.host,
        port: sftp_config.port,
        username: sftp_config.username,
        password: sftp_config.password,
    })
    .then(function(){
        log.info("sftp file server已連線 ...");

        return sftp_client.exists(remote_dir_path);
    })
    .then(function(exist){
        if(exist != "d"){
            return sftp_client.mkdir(remote_dir_path, true);
        }
    })
    .then(function(){
        return sftp_client.fastPut(local_ipa_path, remote_ipa_path);
    })
    .then(function(){
        log.info("upload ipa success");

        return sftp_client.end();
    })
    .catch(function(err){
        log.error("err = ", err);
    })

