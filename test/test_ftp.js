var fs = require("fs");
var Client = require("ftp");
var server_config = require("../apps/server_config");
var log = require("../utils/log");

if(server_config.server_type != 0){
    var ftp_config = server_config.ftp_file_server_pro
}else{
    var ftp_config = server_config.ftp_file_server;
}

// var local_dir_path = __dirname + "/../ios_sign/app_resource/dev_188/1572942535";
// fs.access(local_dir_path, fs.constants.F_OK | fs.constants.W_OK, function(err){
//     if(err){
//         log.error(err);

//         fs.mkdir(local_dir_path, {recursive: true}, function(err){
//             if(err){
//                 log.error(err);
//                 return;
//             }
//         });
//     }
// });

var local_file_path = __dirname + "/../README.md";
var remote_file_name = "README.md";

var remote_file_path = "README.md";
var download_file_path = __dirname + "/../README.md.back";

var ftp_client = new Client();
ftp_client.on("ready", function(){
    log.info("ftp file server已連線 ...");

    if(server_config.server_type == 0){
        ftp_client.cwd("/appfile", function(err, cdir){
            if(err){
                log.error("err: ", err);
                return;
            }

            // log.info("cdir: ", cdir);
        })
    }
    
    // 印出當前路徑（每個ftp帳號預設路徑不同，該預設路徑為/ 根目錄）
    // ftp_client.pwd(function(err, path){
    //     if(err){
    //         log.error("err: ", err);
    //         return;
    //     }

    //     log.info("path :", path);
    // })
    
    // 印出當前路徑下所有文件
    // ftp_client.list(function(err, list){
    //     if(err){
    //         log.error("err: ", err);
    //         return;
    //     }

    //     log.info("list: ", list);
    // })

    // 上傳檔案
    // ftp_client.put(local_file_path, remote_file_name, function(err){
    //     if(err){
    //         log.error("put error: ", err);
    //         return;
    //     }

    //     log.info("上傳ipa成功 ...");
    // })

    // 下載檔案
    // ftp_client.get(remote_file_path, function(err, stream){
    //     if(err){
    //         log.error(err);
    //         return;
    //     }

    //     log.info("準備下載 ...");
    //     stream.once('close', function(){
    //         log.info("下載完成 ...");
    //         ftp_client.end();
    //     });

    //     stream.pipe(fs.createWriteStream(download_file_path));
    // })
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