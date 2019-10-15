var fs = require("fs");
let Client = require('ssh2-sftp-client');

var log = require("./log");

var sftp_client = new Client();
sftp_client.connect({
    host: "210.68.95.161",
    port: 4005,
    username: "brilliantkevin99",
    password: "qaz123"
}).then(function(){
    log.info("file server已連線 ...");
}).catch(function(err){
    log.error("err = ", err);
})

module.exports = sftp_client;
