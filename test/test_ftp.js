var fs = require("fs");
var Client = require("ftp");

var server_config = require("../apps/server_config");
var log = require("../utils/log");

if(server_config.server_type != 0){
    var ftp_config = server_config.ftp_file_server_pro
}else{
    var ftp_config = server_config.ftp_file_server;
}

var local_dir_path = __dirname + "/../ios_sign/app_resource/dev_188/1572942535";
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

    ftp_client.get("/appfile/dev_188/1572942535/1572942535.plist", function(err, stream){
        if(err){
            log.error(err);
            return;
        }

        log.info("準備下載 ...");
        stream.once('close', function(){
            log.info("下載完成 ...");
            ftp_client.end();
        });

        stream.pipe(fs.createWriteStream(local_dir_path + "/1572942535.plist"));
    })
});

ftp_client.on("end", function(){
    log.info("ftp connection 已斷開 ...");
});

ftp_client.on("close", function(hadErr){
    if(hadErr){
        log.warn("ftp connection close ...", hadErr);
    }
});

ftp_client.on("error", function(err){
    if(err){
        log.error("ftp connection error ...", err);
    }
});

ftp_client.connect({
    host: ftp_config.host,
    port: ftp_config.port,
    user: ftp_config.username,
    password: ftp_config.password,
});