var fs = require("fs");
let Client = require('ssh2-sftp-client');

var log = require("../utils/log");

var local_file_path = __dirname + "/package.json";

// fs.access(local_file_path, fs.constants.F_OK, function(err){
//     if(err){
//         log.info("file isn't exist ...");
//     }else{
//         log.info("file exist ...");
//     }
// });

var remote_path = "/home/web_gs_pb/fun/apple.bckappgs.info/dev_188/12345";
var remote_file_path = remote_path + "/package.json";

var sftp_client = new Client();
sftp_client
    .connect({
        host: "210.68.95.161",
        port: 4005,
        username: "brilliantkevin99",
        password: "qaz123"
    })
    .then(function(){
        log.info("連線成功 ...");
        return sftp_client.exists(remote_path);
    })
    .then(function(exist){
        if(exist != "d"){
            return sftp_client.mkdir(remote_path);
        }
    })
    .then(function(){
        return sftp_client.fastPut(local_file_path, remote_file_path);
    })
    .then(function(){
        log.info("上傳成功 ...");
        return sftp_client.end();
    })
    .catch(function(err){
        log.error("err = ", err.message);
    })


