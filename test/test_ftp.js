var fs = require("fs");
var Client = require("ftp");

var server_config = require("../apps/server_config");
var log = require("../utils/log");

var ftp_config = server_config.ftp_file_server;

var local_dir_path = __dirname + "/dev_188/1572339697";
fs.access(local_dir_path, fs.constants.F_OK | fs.constants.W_OK, function(err){
    if(err){
        log.error(err);

        fs.mkdir(local_dir_path, {recursive: true}, function(err){
            if(err){
                log.error(err);
                return;
            }
        });
    }
});

var ftp_client = new Client();
ftp_client.on("ready", function(){    
    log.info("ftp file server已連線 ...");
});

ftp_client.on("ready", function(){
    ftp_client.get("/appfile/dev_188/1572339697/1572339697.plist", function(err, stream){
        if(err){
            log.error(err);
            return;
        }

        console.log("準備下載 ...");
        stream.once('close', function(){
            log.info("下載完成 ...");
            ftp_client.end();
        });
        stream.pipe(fs.createWriteStream(local_dir_path + "/1572339697.plist"));
    })
});

ftp_client.connect({
    host: ftp_config.host,
    port: ftp_config.port,
    user: ftp_config.username,
    password: ftp_config.password,
});