var fs = require("fs");
var plist = require('plist');
var exec = require("child_process").exec;
var util = require("util");
var schedule = require("node-schedule");

var sftp_client = require("../../utils/sftp");
var Response = require("../Response");
var log = require("../../utils/log");
var web_model = require("./web_model");
var utils = require("../../utils/utils");
var http = require("../../netbus/http");
var https = require("../../netbus/https");

// ftp
var Client = require("ftp");
var server_config = require("../server_config");
var ftp_config = server_config.ftp_file_server;
// ftp end

var APP_DOWNLOAD_SCHEME = server_config.appfile_config.appfile_download_scheme;
var PUBLIC_URL = server_config.appfile_config.appfile_domain // kritars 自己測試用的ftp server
var TEST_SITE_URL = server_config.rundown_config.appfile_domain // 與內部組對接用的ftp server

function write_err(status, ret_func){
    var ret = {};
    ret.status = status;
    switch(status){
        case Response.INVAILD_PARAMS:
            ret.msg = "參數錯誤 ...";
            break;
        case Response.SYS_ERROR:
            ret.msg = "系統錯誤 ...";
            break;
        case Response.DB_SEARCH_EMPTY:
            ret.msg = "db找不到資料 ...";
            break;
        case Response.FILE_NOT_EXIST:
            ret.msg = "檔案不存在 ...";
            break;
        case Response.NO_VALID_ACCOUNT:
            ret.msg = "無可用app帳號 ...";
            break;
        case Response.STILL_UPLOAD:
            ret.msg = "仍在上傳中 ...";
            break;
        case Response.UPLOAD_FAILED:
            ret.msg = "上傳失敗 ...";
            break;
        case Response.APP_IS_EXIST:
            ret.msg = "app已存在且已簽過名 ...";
            break;
        case Response.RESIGN_QUEUE_IS_EMPTY:
            ret.msg = "目前佇列為空 ...";
            break;
        case Response.WRITESTREAM_ERROR:
            ret.msg = "文件寫入錯誤 ...";
            break;
        case Response.TIMESTAMP_INVALID:
            ret.msg = "app下載期限已過一年 ...";
            break;
        case Response.GET_REMOTE_FAILED:
            ret.msg = "獲取遠端檔案失敗 ...";
            break;
        case Response.LOCAL_MKDIR_FAILED:
            ret.msg = "本地創建目錄失敗 ...";
            break;
    }
    ret_func(ret);
}

//callback = (ret)
function get_loadxml(md5, callback){
    if(md5 == null || md5 == ""){
        write_err(Response.INVAILD_PARAMS, callback);
        return;
    }

    var mobileconfig_path = __dirname + "/../../www_root/mobileconfig/" + md5 + "signed.mobileconfig";
    if (!fs.existsSync(mobileconfig_path)){
        write_err(Response.FILE_NOT_EXIST, callback);
        return;
    }

    var ret = {};
    ret.status = Response.OK;
    ret.path = mobileconfig_path;
    callback(ret);
}

//callback = (ret)
function get_app_name_by_sha1(sha1, callback){
    if(sha1 == null || sha1 == ""){
        callback(Response.INVAILD_PARAMS, null);
        return;
    }

    web_model.get_app_info_by_sha1(sha1, callback);
}

function ready_to_upload(ret, local_plist_path){
    if(server_config.rundown_config.api_with_system){
        // ftp
        var local_ipa_path = __dirname + "/../../ios_sign/app_resource/" + ret.app_name + "/" + ret.tag + ".ipa";
        var remote_dir_path = "/appfile/" + ret.app_name + "/" + ret.tag;
        var remote_ipa_path = remote_dir_path + "/" + ret.tag + ".ipa";
        var remote_plist_path = remote_dir_path + "/" + ret.tag + ".plist";

        var ftp_client = new Client();
        ftp_client.on("ready", function(){    
            log.info("ftp connection 已連線 ...");

            ftp_client.mkdir(remote_dir_path, true, function(err){
                if(err){
                    log.error("mkdir error: ", err);
                    return;
                }
            
                ftp_client.put(local_ipa_path, remote_ipa_path, function(err){
                    if(err){
                        log.error("put error: ", err);
                        return;
                    }
            
                    log.info("上傳ipa成功 ...");
                    // fs.unlink(local_ipa_path, function(err){
                    //     if(err){
                    //         throw err;
                    //     }
    
                    //     // log.info("删除本地ipa成功 ...");
                    // });
    
                    ftp_client.put(local_plist_path, remote_plist_path, function(err){
                        if(err){
                            log.error("put error: ", err);
                            return;
                        }
                
                        log.info("上傳plist成功 ...");
                        // fs.unlink(local_plist_path, function(err){
                        //     if(err){
                        //         throw err;
                        //     }
        
                        //     // log.info("删除本地plist成功 ...");
                        // });
    
                        // 刪除上傳列表的紀錄
                        global_upload_list[ret.tag] = null;
                        delete global_upload_list[ret.tag];
    
                        ftp_client.end();
                    });
                });
            });
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
    }else{
        //sftp
        var local_ipa_path = __dirname + "/../../ios_sign/app_resource/" + ret.app_name + "/" + ret.tag + ".ipa";
        var remote_dir_path = "/home/web_gs_pb/fun/apple.bckappgs.info/" + ret.app_name + "/" + ret.tag;
        var remote_ipa_path = remote_dir_path + "/" + ret.tag + ".ipa";
        var remote_plist_path = remote_dir_path + "/" + ret.tag + ".plist";

        sftp_client
            .exists(remote_dir_path)
            .then(function(exist){
                if(exist != "d"){
                    return sftp_client.mkdir(remote_dir_path);
                }
            })
            .then(function(){
                return sftp_client.fastPut(local_ipa_path, remote_ipa_path);
            })
            .then(function(){
                log.info("上傳ipa 成功 ...");

                return sftp_client.fastPut(local_plist_path, remote_plist_path);
            })
            .then(function(){
                log.info("上傳plist 成功 ...");

                // 刪除上傳列表的紀錄
                global_upload_list[ret.tag] = null;
                delete global_upload_list[ret.tag];

                // return sftp_client.end();
            })
            .catch(function(err){
                log.error("err = ", err);
                log.error("err.message = ", err.message);
                global_upload_list[ret.tag].status = -1;
                global_upload_list[ret.tag].err_msg = err.message;
                // write_err(Response.UPLOAD_FAILED, callback);
            })
    }
}

function update_each_device_info_from_app_req_queue(ret, callback){
    // var ret = {};
    // ret.account_info = account_info;
    // ret.app_name = app_info.app_name;
    // ret.tag = resigned_app_name;
    // ret.app_req_queue = app_req_queue_list[app_info.app_id];
    // ret.path = "download_path";

    /*
        json = {
            app_resigned_info: [
                {
                    app_name: "dev_188",
                    app_desc: "188_SPORT"
                    app_ver: "1234",
                    ipa_name: "123456",
                    site_code: site_code,
                },
                ...
            ],
            reg_acc_info: {
                "is_reg": 1,
                "acc_id": 2,
                "reg_account": "liaoyanchi3@gmail.com",
                "cert_name": "DEVELOPER .....",
                "bundle_id": "123123"
                "expired": 1605145756
            }
        }
    */

    for(var i = 0; i < ret.app_req_queue.length; i ++){
        var udid = ret.app_req_queue[i];

        // 可以從redis取
        web_model.get_uinfo_by_udid(udid, null, null, function(status, result){
            if(status != Response.OK){
                write_err(status, callback);
                return;
            }

            var json = JSON.parse(result.jsonstr);
            if(json){
                json.app_resigned_info.push({
                    "app_name": ret.app_name,
                    "app_desc": ret.app_desc,
                    "app_ver": ret.app_ver,
                    "ipa_name": ret.tag,
                    "site_code": ret.site_code,
                });

                json.reg_acc_info = {
                    "is_reg": 1,
                    "acc_id": ret.account_info.acc_id,
                    "reg_account": ret.account_info.account,
                    "cert_name": ret.account_info.cert_name,
                    "expired": ret.account_info.expired,
                    "bundle_id": ret.account_info.bundle_id,
                }

                var jsonstr = JSON.stringify(json);
                // 重簽名時間戳加上一年，app有效期限
                var time_valid = parseInt(ret.tag) + 31536000;
                // 更新數據庫
                web_model.update_device_info_by_udid(udid, jsonstr, time_valid, false, function(status, result){
                    if(status != Response.OK){
                        write_err(status, callback);
                        return;
                    };
                })
            }else{
                json = {
                    "app_resigned_info": [
                        {
                            "app_name": ret.app_name,
                            "app_desc": ret.app_desc,
                            "app_ver": ret.app_ver,
                            "ipa_name": ret.tag,
                            "site_code": ret.site_code,
                        },
                    ],
                    "reg_acc_info": {
                        "is_reg": 1,
                        "acc_id": ret.account_info.acc_id,
                        "reg_account": ret.account_info.account,
                        "cert_name": ret.account_info.cert_name,
                        "expired": ret.account_info.expired,
                        "bundle_id": ret.account_info.bundle_id,
                    }
                }

                // json = {
                //     app_resigned_info: [],
                //     reg_acc_info: {},
                // }

                // json.app_resigned_info.push({
                //     "app_name": ret.app_name,
                //     "app_ver": ret.app_ver,
                //     "ipa_name": ret.tag,
                //     "site_code": ret.site_code,
                // });

                // json.reg_acc_info = {
                //     "is_reg": 1,
                //     "acc_id": ret.account_info.acc_id,
                //     "reg_account": ret.account_info.account,
                //     "cert_name": ret.account_info.cert_name,
                //     "expired": ret.account_info.expired,
                //     "bundle_id": ret.account_info.bundle_id,
                // };

                var jsonstr = JSON.stringify(json);
                var time_valid = parseInt(ret.tag) + 31536000;
                // 更新數據庫
                web_model.update_device_info_by_udid(udid, jsonstr, time_valid, true, function(status, result){
                    if(status != Response.OK){
                        write_err(status, callback);
                        return;
                    };
                })
            }

            if(i >= ret.app_req_queue.length){
                log.info("app_req_queue 已全數更新完DB ")
                ret.status = Response.OK;
                callback(ret);
            }
        })
    }
}

function update_all_info(ret, callback){
    if(ret == null){
        write_err(Response.INVAILD_PARAMS, callback);
        return;
    }

    // log.info(ret);
    // process.chdir(process.cwd() + "/../");

    web_model.add_device_count_on_account_info(ret.account_info.account, ret.app_req_queue.length, function(status, result){
        if(status != Response.OK){
            write_err(status, callback);
            return;
        }

        web_model.add_new_resign_info(ret.tag, ret.path, function(status, result){
            if(status != Response.OK){
                write_err(status, callback);
                return;
            }
            
            update_each_device_info_from_app_req_queue(ret, callback);
        })
    });
}

var global_upload_list = {}
/*
global_upload_list[tag] = {
    status: 0, // 0：未上傳，1：已上傳，-1：上傳失敗
    tag: "xxxxx",
    err_msg: "",
};
*/

function check_uploading_is_ok(tag, callback){
    var record = global_upload_list[tag];
    if(record){
        // 如果有記錄表示還在傳
        callback(false);
        return;
    }

    callback(true);
}

function ready_to_sigh(ret, callback){
    var sec = 0;
    var timer = setInterval(function(){
        log.info("in setInterval ...", sec);
        sec ++;

        var end_resign_path = __dirname + "/../../ios_sign/app_resource/" + ret.app_name + "/" + ret.tag + ".txt";
        fs.access(end_resign_path, fs.constants.F_OK, function(err){
            if(err){
                log.info("正在重簽名app包 ...");
            }else{
                log.info("app包已重簽名完成，準備進行上傳與更新DB ...");
                clearInterval(timer);

                // 動態產生該tag的manifest.plist, 更改ipa路徑與title名稱
                var xml = fs.readFileSync(__dirname + "/../../ios_sign/manifest.plist", "utf8");
                var json = plist.parse(xml);
                // console.log(json.items[0].assets[0].url);
                if(server_config.rundown_config.api_with_system){
                    json.items[0].assets[0].url = TEST_SITE_URL + ret.app_name + "/" + ret.tag + "/" + ret.tag + ".ipa";
                }else{
                    json.items[0].assets[0].url = PUBLIC_URL + ret.app_name + "/" + ret.tag + "/" + ret.tag + ".ipa";
                }
                json.items[0].metadata.title = "" + ret.app_desc;
                var newxml = plist.build(json);
                var plist_path = __dirname + "/../../ios_sign/app_resource/" + ret.app_name + "/" + ret.tag + ".plist";
                fs.writeFileSync(plist_path, newxml);

                // 刪除end_resign_path
                var sh = "rm -rf \"%s\" ";
                var sh_cmd = util.format(sh, end_resign_path);
                log.info(sh_cmd);
                exec(sh_cmd, function(error, stdout, stderr){
                    // if(error){
                    //     log.info('error: ' + error);
                    // }
        
                    // if(stderr){
                    //     log.info('stderr: ' + stderr);
                    // }
        
                    // log.info('stdout: ' + stdout);
                });

                // 記錄到上傳列表
                global_upload_list[ret.tag] = {
                    status: 0,
                    tag: ret.tag,
                }

                // 回應前端
                update_all_info(ret, callback);

                // 進行上傳動作
                ready_to_upload(ret, plist_path);
            }
        });

    }, 1000);
}

function resign_ipa(dinfo, callback){
    if(dinfo == null || dinfo.UDID == null || dinfo.UDID == "" || dinfo.PRODUCT == null 
    || dinfo.PRODUCT == "" || dinfo.VERSION == null || dinfo.VERSION == "" || dinfo.SERIAL == null 
    || dinfo.SERIAL == "" || dinfo.SHA1 == null || dinfo.SHA1 == ""){
        write_err(Response.INVAILD_PARAMS, callback);
        return;
    }

    get_app_name_by_sha1(dinfo.SHA1, function(status, result){
        if(status != Response.OK){
            write_err(status, callback);
            return;
        }
        
        var app_info = {
            app_id: result.id,
            app_name: result.app_name,
            app_desc: result.app_desc,
            app_ver: result.version,
            site_code: result.site_code
        };

        check_udid_is_resigned(app_info, dinfo, function(ret){
            if(ret.status != Response.OK){
                write_err(status, callback);
                return;
            }

            // 已有簽過該app，不需再簽名
            if(ret.ipa_name != null && ret.ipa_name != ""){
                ret.status = Response.APP_IS_EXIST;
                ret.site_code = app_info.site_code;
                ret.msg = "app已存在且已簽過名 ...";
                callback(ret);
                return;
            }

            ret.msg = "已接收並排入簽名佇列 ...";
            ret.sha1 = dinfo.SHA1;
            callback(ret);
        });
    });
}

function get_downloadApp_url(tag, callback){
    if(tag == null || tag == ""){
        write_err(Response.INVAILD_PARAMS, callback);
        return;
    }

    check_uploading_is_ok(tag, function(is_ok){
        if(!is_ok){
            write_err(Response.STILL_UPLOAD, callback);
            return;
        }

        web_model.get_downloadApp_url(tag, function(status, result){
            if(status != Response.OK){
                write_err(status, callback);
                return;
            }
            
            var ret = {};
            ret.status = Response.OK;
            ret.url = result.download_path;
            callback(ret);
        })
    })
}

function get_resign_status(dID, fid, callback){
    if(dID == null || fid == null || fid == ""){
        write_err(Response.INVAILD_PARAMS, callback);
        return;
    }

    // 先判斷是哪個app，取出app_name
    get_app_name_by_sha1(fid, function(status, result){
        if(status != Response.OK){
            write_err(status, callback);
            return;
        }

        var app_name = result.app_name;
        var download_name;

        // 透過id取得uinfo
        web_model.get_uinfo_by_id(dID, function(status, result){
            if(status != Response.OK){
                write_err(status, callback);
                return;
            }

            var jsonstr = result.jsonstr;
            var json = JSON.parse(jsonstr);
            if(json){
                // 已有內容，取得重簽名後ipa_name
                var queue = json.app_resigned_info;
                for(var i = 0; i < queue.length; i ++){
                    var item = queue[i];
                    if(item.app_name != app_name){
                        continue;
                    }

                    download_name = item.ipa_name;
                }

                if(download_name != null && download_name != ""){
                    // 取得下載路徑
                    get_downloadApp_url(download_name, function(ret){
                        if(ret.status != Response.OK){
                            write_err(ret.status, callback);
                            return;
                        }
    
                        callback(ret);
                    })
                }else{
                    // 無法下載路徑，直接返回
                    write_err(Response.FILE_NOT_EXIST, callback);
                    return;
                }

            }else{
                write_err(Response.FILE_NOT_EXIST, callback);
                return;
            }
        });
    }) 
}

function update_acc_devices(info, callback){
    if(info == null || info.acc == null || info.acc == "" || info.devices == null){
        write_err(Response.INVAILD_PARAMS, callback);
        return;
    }

    web_model.update_device_count_on_account_info(info.acc, info.devices, function(status, result){
        if(status != Response.OK){
            write_err(status, callback);
            return;
        }

        var ret = {};
        ret.status = Response.OK;
        ret.msg = "更新設備數成功 ...";
        callback(ret);
    })
}

// acc佇列
var acc_queue_list = [];
var acc_queue_index = 0;
/*
acc_queue_list = [
    {
        "acc_id": device_acc_info.acc_id,
        "account": device_acc_info.account,
        "cert_name": device_acc_info.cert_name,
        "expired": device_acc_info.expired,
        "bundle_id": device_acc_info.bundle_id,
    },
    ....
]
*/
// acc註冊佇列
var acc_req_queue_list = {};
/*
acc_req_queue_list[acc_id] = 
[
    {
        "udid": dinfo.UDID,
        "product": dinfo.PRODUCT,
        "version": dinfo.VERSION,
        "app_id": app_id,
        "app_name": app_name,
        "upload_name": upload_name,
        "app_ver": app_ver,
        "site_code": dinfo.SITE_CODE,
        
        "acc_id": device_acc_info.acc_id,
        "account": device_acc_info.account,
    },
    ...
]
*/

// app佇列
var app_queue_list = [];
var app_queue_index = 0;
/*
app_queue_list = [
    {
        "app_id": id,
        "app_name": app_name,
        "upload_name": upload_name,
        "app_ver": app_ver,
        "site_code": site_code,
    },
    ...
]
*/

// app重簽名佇列
var app_req_queue_list = {};
/*
app_req_queue_list[app_id] = 
[
    dinfo.UDID,
    ...
]
*/

function add_data_to_acc_queue(dinfo, ainfo, device_acc_info, device_id, charge_status, callback){
    // 檢查acc佇列，是否需push
    var acc_queue_is_exist = false;
    for(var i = 0; i < acc_queue_list.length; i ++){
        var id = acc_queue_list[i].acc_id;
        if(id == device_acc_info.acc_id){
            acc_queue_is_exist = true;
        }
    }

    if(!acc_queue_is_exist){
        acc_queue_list.push({
            "acc_id": device_acc_info.acc_id,
            "account": device_acc_info.account,
            "cert_name": device_acc_info.cert_name,
            "bundle_id": device_acc_info.bundle_id,
            "expired": device_acc_info.expired,
        });
    }

    if(!acc_req_queue_list[device_acc_info.acc_id]){
        acc_req_queue_list[device_acc_info.acc_id] = [];
    }

    var acc_req_queue_is_exist = false;
    var req_queue = acc_req_queue_list[device_acc_info.acc_id];
    for(var i = 0; i < req_queue.length; i ++){
        var item = req_queue[i];
        if(item.udid == dinfo.UDID){
            // 已經在該app queue內
            acc_req_queue_is_exist = true;
        }
    }

    if(!acc_req_queue_is_exist){
        req_queue.push({
            "udid": dinfo.UDID,
            "product": dinfo.PRODUCT,
            "version": dinfo.VERSION,
            "app_id": ainfo.app_id,
            "app_name": ainfo.app_name,
            "app_desc": ainfo.app_desc,
            "app_ver": ainfo.app_ver,
            "site_code": ainfo.site_code,
            
            // "acc_id": device_acc_info.acc_id,
            // "account": device_acc_info.account,
        })
    }

    var ret = {};
    ret.status = Response.OK;
    ret.device_id = device_id;
    ret.charge_status = charge_status;
    callback(ret);
}

function check_udid_is_resigned(ainfo, dinfo, callback){
    // 判斷該dinfo 是否已存在db，是否已有簽過該app
    web_model.get_uinfo_by_udid(dinfo.UDID, dinfo.PRODUCT, dinfo.VERSION, function(status, result){
        if(status != Response.OK){
            write_err(status, callback);
            return;
        }

        var now_time = parseInt(utils.timestamp());
        // 判断该设备距离第一次签名是否已超过一年，超过则重新收取费用。0-新用户，1-重复下载，2-重新收费
        var charge_status = -1;
        if(result.time_valid == 0){
            charge_status = 0;
        }else if(result.time_valid != 0 && now_time > result.time_valid){
            charge_status = 2;
        }else{
            charge_status = 1;
        }

        var device_id = result.id;
        var json = JSON.parse(result.jsonstr);
        if(json){
            var reg_acc_info = json.reg_acc_info;

            if(reg_acc_info.is_reg == 1 && reg_acc_info.acc_id != 0){
                // 已註冊過apple帳號

                if(now_time > reg_acc_info.expired){
                    // 帳號已超過一年未續費，清除該設備的簽名資訊，重新抓取可用帳號
                    log.info("帳號已超過一年未續費，清除該設備的簽名資訊，重新抓取可用帳號進行簽名 ...");

                    var jsonstr = '';
                    var time_valid = 0;
                    web_model.update_device_info_by_udid(dinfo.UDID, jsonstr, time_valid, false, function(status, result){
                        if(status != Response.OK){
                            write_err(status, callback);
                            return;
                        };

                        // 取一個有效的帳號來用
                        web_model.get_valid_account(function(status, result){
                            if(status != Response.OK){
                                write_err(status, callback);
                                return;
                            }

                            var device_acc_info = {
                                acc_id: result.id,
                                account: result.account,
                                cert_name: result.cert_name,
                                expired: result.expired,
                                bundle_id: result.bundle_id,
                            }

                            // 加入acc佇列
                            add_data_to_acc_queue(dinfo, ainfo, device_acc_info, device_id, charge_status, callback);
                        });
                    })
                    
                }else{
                    // 帳號未超過一年，判斷檔案
                    log.info("帳號未超過一年，判斷檔案 ...");

                    // 將該設備註冊的帳號資訊抓出來
                    var device_acc_info = {
                        acc_id: reg_acc_info.acc_id,
                        account: reg_acc_info.reg_account,
                        cert_name: reg_acc_info.cert_name,
                        expired: reg_acc_info.expired,
                        bundle_id: reg_acc_info.bundle_id
                    }

                    var download_name;
                    var index = -1;
                    for(var i = 0; i < json.app_resigned_info.length; i ++){
                        if(json.app_resigned_info[i].site_code == ainfo.site_code){
                            // 如果有簽過該app
                            if(json.app_resigned_info[i].app_ver == ainfo.app_ver){
                                // 紀錄的版本號與當前DB app_info的版本號相同
                                log.info("紀錄的版本號與當前DB app_info的版本號相同 ...");
                                download_name = json.app_resigned_info[i].ipa_name;
                            }else{
                                // 紀錄的版本號與當前DB app_info的版本號不同
                                log.info("紀錄的版本號與當前DB app_info的版本號不同 ...");
                                index = i;
                            }
                        }
                    }
                    
                    if(download_name != null && download_name != ""){
                        // 有簽過該app 且download_name不為空
                        log.info("有簽過該app 且download_name不為空，不需重簽名直接分發");
                        var ret = {};
                        ret.status = Response.OK;
                        ret.device_id = device_id;
                        ret.charge_status = charge_status;
                        ret.ipa_name = download_name;
                        ret.ipa_path = TEST_SITE_URL + ainfo.app_name + "/" + download_name + "/" + download_name + ".ipa";
                        callback(ret);
                        return;
                    }else{
                        // 未簽過該app，無download_name或download_name為空
                        log.info("未簽過該app，無download_name或download_name為空，重簽名app");

                        // 更新該設備的jsonStr 內容
                        if(index != -1){
                            json.app_resigned_info[index] = null;
                            json.app_resigned_info.splice(index, 1);

                            var jsonstr = JSON.stringify(json);
                            var time_valid = 999999;
                            web_model.update_device_info_by_udid(dinfo.UDID, jsonstr, time_valid, false, function(status, result){
                                if(status != Response.OK){
                                    write_err(status, callback);
                                    return;
                                };
                            })
                        }

                        // 加入acc佇列
                        add_data_to_acc_queue(dinfo, ainfo, device_acc_info, device_id, charge_status, callback);
                    }
                }
            }
        }else{
            // 未註冊過帳號，需要註冊帳號且重簽名app
            log.info("未註冊過帳號，需要註冊帳號且重簽名app");
    
            // 取一個有效的帳號來用
            web_model.get_valid_account(function(status, result){
                if(status != Response.OK){
                    write_err(status, callback);
                    return;
                }

                var device_acc_info = {
                    acc_id: result.id,
                    account: result.account,
                    cert_name: result.cert_name,
                    expired: result.expired,
                    bundle_id: result.bundle_id,
                }

                // 加入acc佇列
                add_data_to_acc_queue(dinfo, ainfo, device_acc_info, device_id, charge_status, callback);
            });
        }
    });
}

function add_data_to_app_queue(device_info){
    // 檢查acc佇列，是否需push
    var app_queue_is_exist = false;
    for(var i = 0; i < app_queue_list.length; i ++){
        var id = app_queue_list[i].app_id;
        if(id == device_info.app_id){
            if(app_queue_list[i].app_ver != device_info.app_ver){
                app_queue_list[i].app_ver = device_info.app_ver;
            }
            app_queue_is_exist = true;
        }
    }

    if(!app_queue_is_exist){
        app_queue_list.push({
            "app_id": device_info.app_id,
            "app_name": device_info.app_name,
            "app_desc": device_info.app_desc,
            "app_ver": device_info.app_ver,
            "site_code": device_info.site_code,
        });
    }

    if(!app_req_queue_list[device_info.app_id]){
        app_req_queue_list[device_info.app_id] = [];
    }

    var app_req_queue_is_exist = false;
    var req_queue = app_req_queue_list[device_info.app_id];
    for(var i = 0; i < req_queue.length; i ++){
        var item = req_queue[i];
        if(item.udid == device_info.udid){
            // 已經在該app queue內
            acc_req_queue_is_exist = true;
        }
    }

    if(!app_req_queue_is_exist){
        req_queue.push(device_info.udid);
    }
}

function start_resign_app(account_info, app_info, callback){
    // 將佇列內容儲存
    var queue = app_req_queue_list[app_info.app_id];
    // 將原有佇列刪除
    app_req_queue_list[app_info.app_id] = null;
    delete app_req_queue_list[app_info.app_id];
    
    if(!queue || queue.length <= 0){
        write_err(Response.RESIGN_QUEUE_IS_EMPTY, callback);
        return;
    }

    // log.info("目前佇列內資料: ", queue);

    var resigned_app_name = "" + utils.timestamp();
    // 執行重簽名並上傳腳本
    var sh = "sh ios_sign/resign_ipa_new.sh \"%s\" \"%s\" \"%s\" \"%s\" \"%s\" ";
    var sh_cmd = util.format(sh, app_info.app_name, app_info.app_name, account_info.acc_md5, account_info.cert_name, resigned_app_name);
    log.info(sh_cmd);

    exec(sh_cmd, function(error, stdout, stderr){
        // if(error){
        //     log.info('error: ' + error);
        // }

        // if(stderr){
        //     log.info('stderr: ' + stderr);
        // }

        // log.info('stdout: ' + stdout);
    });
    
    var ret = {};
    ret.account_info = account_info;
    ret.app_name = app_info.app_name;
    ret.app_desc = app_info.app_desc;    
    ret.app_ver = app_info.app_ver;
    ret.site_code = app_info.site_code;
    ret.tag = resigned_app_name;
    ret.app_req_queue = queue;
    // ret.path = "itms-services://?action=download-manifest&url=https://apple.bckappgs.info/dev_188/xxxxx/manifest.plist";
    if(server_config.rundown_config.api_with_system){
        ret.path = APP_DOWNLOAD_SCHEME + TEST_SITE_URL + ret.app_name + "/" + ret.tag + "/" + ret.tag + ".plist";
        ret.ipa_path = TEST_SITE_URL + ret.app_name + "/" + ret.tag + "/" + ret.tag + ".ipa";
    }else{
        ret.path = APP_DOWNLOAD_SCHEME + PUBLIC_URL + ret.app_name + "/" + ret.tag + "/" + ret.tag + ".plist";
        ret.ipa_path = PUBLIC_URL + ret.app_name + "/" + ret.tag + "/" + ret.tag + ".ipa";
    }

    ready_to_sigh(ret, callback);
}

function start_resign_on_app_queue(account_info, callback){
    // 判斷是否有acc佇列
    if(app_queue_list.length <= 0){
        // log.info("app 佇列為空, 直接返回 ...");
        write_err(Response.INVAILD_PARAMS, callback);
        return;
    }

    var app_info;
    app_info = app_queue_list[app_queue_index];
    log.info("当前重签名伫列: " + app_info.app_name + "，app_id = " + app_info.app_id);

    // 開始簽名
    start_resign_app(account_info, app_info, function(ret){
        if(ret.status != Response.OK){
            if(ret.status == Response.RESIGN_QUEUE_IS_EMPTY){
                log.info("" + app_info.app_name + " 重签名伫列为空 ...");
            }
        }else{
            // 判斷是否與內部組對接
            if(server_config.rundown_config.api_with_system){
                // 簽名完成且上傳，通知管理後台
                var data = {
                    udid_list: ret.app_req_queue,
                    // file_path: ret.path,
                    ipa_path: ret.ipa_path,
                    app_name: ret.app_name,
                    site_code: ret.site_code,
                };
                var json_data = JSON.stringify(data);
                log.warn(json_data);

                // post到管理後台
                /*
                https://mem518.webpxy.info/api/v1/request/sign_complete
                */
                var api_with_system_config = server_config.rundown_config.api_with_system_config;
                https.https_post(api_with_system_config.hostname, api_with_system_config.port, api_with_system_config.url, null, json_data, function(is_ok, data){
                    if(is_ok){
                        log.warn("管理后台incoming_msg.statusCode = 200，response ...", data.toString());
                    }
                })
            }
        };
        
        app_queue_index ++;
        if(app_queue_index >= app_queue_list.length){
            log.info("已无重签名伫列，回到帐号注册伫列流程 ...");
            app_queue_index = 0;
            callback(ret);
        }else{
            log.info("2秒后往下一个重签名伫列 ...");
            setTimeout(function(){
                start_resign_on_app_queue();
            }, 2000);
        }
    });
}

function sort_acc_req_queue_by_app(account_info, acc_req_queue, callback){
    log.info("分类不同app重签名伫列 ...");
    // 根據不同app 分類不同簽名佇列
    for(var i = 0; i < acc_req_queue.length; i ++){
        var device_info = acc_req_queue[i];
        add_data_to_app_queue(device_info);
    }

    // 開始跑app佇列 進行簽名
    start_resign_on_app_queue(account_info, callback);
}

function action_reg_to_apple(account_info, acc_req_queue, file_path, callback){
    if(file_path == null || file_path == ""){
        write_err(Response.INVAILD_PARAMS, callback);
        return;
    }

    //進行重簽名，並部署到file server
    log.info("进入帐号注册udid流程 ...");

    var sh = "ruby ios_sign/test_reg_to_apple.rb \"%s\" \"%s\" \"%s\" \"true\" ";
    var sh_cmd = util.format(sh, account_info.account, account_info.bundle_id, account_info.acc_md5);
    log.info(sh_cmd);

    //运行spaceship 脚本
    exec(sh_cmd, function(error, stdout, stderr){
        // if(error){
        //     log.info('error: ' + error);
        // }

        // if(stderr){
        //     log.info('stderr: ' + stderr);
        // }

        // log.info('stdout: ' + stdout);
    });

    //每秒检查provisioning file是否下载完毕
    var sec = 0;
    var timer = setInterval(function(){
        log.info("in setInterval ...", sec);
        sec ++;

        var mobileprovision_path = __dirname + "/../../ios_sign/account/" + account_info.acc_md5 + ".mobileprovision";
        fs.access(mobileprovision_path, fs.constants.F_OK, function(err){
            if(err){
                log.info("正对帐号注册udid并下载描述文件中 ...");
            }else{
                log.info("已下载完成描述文件，准备进入重签名app包流程 ...");
                clearInterval(timer);

                // 將設備批次文件刪除
                fs.unlink(file_path, function(err){
                    if(err){
                        throw err;
                    }

                    // log.info("设备批次文件已删除 ...");
                });

                sort_acc_req_queue_by_app(account_info, acc_req_queue, callback);
            }
        });
    }, 1000);
}

function ready_to_reg_apple(account_info, callback){
    // 將佇列內容儲存
    var queue = acc_req_queue_list[account_info.acc_id];
    // 將原有佇列刪除
    acc_req_queue_list[account_info.acc_id] = null;
    delete acc_req_queue_list[account_info.acc_id];
    
    if(!queue || queue.length <= 0){
        write_err(Response.RESIGN_QUEUE_IS_EMPTY, callback);
        return;
    }

    log.info("当前为帐号注册伫列: " + account_info.account + "，acc_id = " + account_info.acc_id);
    // log.info("目前佇列內資料: ", queue);
    
    // 加入帳號的md5到表內
    account_info.acc_md5 = utils.md5(account_info.account);

    var file_path = __dirname + "/../../ios_sign/account/" + account_info.acc_md5 + ".txt";
    var writeStream = fs.createWriteStream(file_path, {flags: "a+"});

    
    for(var i = 0; i < queue.length; i ++){
        var item = queue[i];

        // 寫入要跟apple 註冊的 app_name.txt
        var text = "" + item.udid + "%" + item.product + "\n";
        writeStream.write(text,'UTF8');
    }

    writeStream.end();
    writeStream.on('finish', function() {
        // log.info("udid列表寫入完成。");

        // 準備註冊apple 帳號
        action_reg_to_apple(account_info, queue, file_path, callback);
    });
    
    writeStream.on('error', function(err){
        // log.info("udid列表寫入錯誤。");
        write_err(Response.WRITESTREAM_ERROR, callback);
        return;
    });  
}

function resign_ipa_via_api(dinfo, callback){
    if(dinfo == null || dinfo.UDID == null || dinfo.UDID == "" || dinfo.PRODUCT == null 
    || dinfo.PRODUCT == "" || dinfo.VERSION == null || dinfo.VERSION == "" || dinfo.SERIAL == null 
    || dinfo.SERIAL == "" || dinfo.SHA1 == null || dinfo.SHA1 == "" || dinfo.APP_VER == null 
    || dinfo.APP_VER == "" || dinfo.SITE_CODE == null){
        write_err(Response.INVAILD_PARAMS, callback);
        return;
    }

    get_app_name_by_sha1(dinfo.SHA1, function(status, result){
        if(status != Response.OK){
            write_err(status, callback);
            return;
        }

        var app_info = {
            app_id: result.id,
            app_name: result.app_name,
            app_desc: result.app_desc,
            app_ver: result.version,
            site_code: result.site_code
        };

        check_udid_is_resigned(app_info, dinfo, function(ret){
            if(ret.status != Response.OK){
                write_err(status, callback);
                return;
            }

            // 已有簽過該app，不需再簽名
            if(ret.ipa_name != null && ret.ipa_name != ""){
                ret.status = Response.APP_IS_EXIST;
                ret.site_code = app_info.site_code;
                ret.msg = "app已存在且已簽過名 ...";
                callback(ret);
                return;
            }

            ret.msg = "已接收並排入簽名佇列 ...";
            ret.sha1 = dinfo.SHA1;
            callback(ret);
        });
    });
}

function check_app_is_exist(app_info, callback){
    web_model.get_app_info_by_sitecode(app_info.site_code, function(status, result){
    // web_model.get_app_info(app_info.site_code, function(status, result){
        if(status != Response.OK){
            if(status == Response.DB_SEARCH_EMPTY){
                // 無此app 紀錄，可新增
                callback(Response.OK, true, true);
                return;
            }else{
                callback(status, null, null);
                return;
            }
        }
        
        if(result.app_name == app_info.app_name){
            // 已有此app 紀錄，且檔名相同
            callback(Response.OK, false, false);
        }else{
            // 已有此app 紀錄，但檔名不同
            callback(Response.OK, false, true);
        }
    });
}

function download_ipa_to_local(app_name, callback){
    if(app_name == null || app_name == ""){
        write_err(Response.INVAILD_PARAMS, callback);
        return;
    }

    // fs 檢查本地目錄是否存在，無則創建目錄
    var local_dir_path = __dirname + "/../../ios_sign/app_resource/" + app_name;
    fs.access(local_dir_path, fs.constants.F_OK | fs.constants.W_OK, function(err){
        if(err){
            log.error(err);

            fs.mkdir(local_dir_path, {recursive: true}, function(err){
                if(err){
                    log.error(err);
                    write_err(Response.LOCAL_MKDIR_FAILED, callback);
                    return;
                }
            });
        }
    });

    // ftp 下載至本地目錄
    var local_ipa_path = local_dir_path + "/" + app_name + ".ipa";
    var remote_dir_path = "/appfile/" + app_name;
    var remote_ipa_path = remote_dir_path + "/" + app_name + ".ipa";

    var ftp_client = new Client();

    ftp_client.on("ready", function(){
        log.info("ftp connection 已連線 ...");

        ftp_client.get(remote_ipa_path, function(err, stream){
            if(err){
                log.error(err);
                ftp_client.end();

                write_err(Response.GET_REMOTE_FAILED, callback);
                return;
            }

            log.info("準備下載 ...");
            stream.once('close', function(){
                log.info("下載完成 ...");
                ftp_client.end();

                var ret = {};
                ret.status = Response.OK;
                callback(ret);
            });
            stream.pipe(fs.createWriteStream(local_ipa_path));
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
}

function create_app_to_db(app_info, callback){
    if(app_info == null || app_info.app_name == null || app_info.app_name == "" || app_info.app_desc == null 
    || app_info.app_desc == "" || app_info.ver == null || app_info.ver == "" || app_info.sha1 == null 
    || app_info.sha1 == "" || app_info.md5 == null || app_info.md5 == "" || app_info.site_code == null){
        write_err(Response.INVAILD_PARAMS, callback);
        return;
    }

    check_app_is_exist(app_info, function(status, is_empty, need_update){
        if(status != Response.OK){
            write_err(status, callback);
            return;
        }

        if(is_empty){
            log.info("無紀錄此app，新增至DB並下載至本地 ...");
            web_model.add_new_to_app_info(app_info, function(status, result){
                if(status != Response.OK){
                    write_err(status, callback);
                    return;
                }

                download_ipa_to_local(app_info.app_name, function(ret){
                    if(ret.status != Response.OK){
                        write_err(ret.status, callback);
                        return;
                    }

                    ret.msg = "無紀錄此app，新增至DB並下載至本地 ...";
                    callback(ret);
                    return;
                });
            })
        }else{
            if(need_update){
                log.info("已紀錄過此app，但檔名不同。DB更新檔名並重新下載 ...");
                web_model.update_app_to_app_info(app_info, function(status, result){
                    if(status != Response.OK){
                        write_err(status, callback);
                        return;
                    }
        
                    download_ipa_to_local(app_info.app_name, function(ret){
                        if(ret.status != Response.OK){
                            write_err(ret.status, callback);
                            return;
                        }
    
                        ret.msg = "已紀錄過此app，但檔名不同。DB更新檔名並重新下載 ...";
                        callback(ret);
                        return;
                    });
                })
            }else{
                log.info("已紀錄過此app，且檔名相同，不需更新 ...");
                
                var ret = {};
                ret.status = Response.OK;
                ret.msg = "已紀錄過此app，且檔名相同，不需更新 ...";
                callback(ret);
            }
        }
    });
}

function check_timestamp_valid(udid, timestamp, callback){
    if(udid == null || udid == "" || timestamp == null){
        write_err(Response.INVAILD_PARAMS, callback);
        return;
    }

    // 根據udid 找出 當時寫入的期限 (timestamp += 31536000)
    web_model.get_timestamp_valid_by_udid(udid, function(status, result){
        if(status != Response.OK){
            write_err(status, callback);
            return;
        }
        
        var time_valid = result.time_valid;
        // log.info("time_valid = " + time_valid + ", timestamp = " + timestamp);
        if(timestamp > time_valid){
            // 已超過一年，更新db內該udid跟app_name, ipa_name 為空
            log.info("已超過一年，更新db內該udid跟app_name, ipa_name 為空 ...");
            web_model.clear_appinfo_on_device_info(udid, function(status, result){
                if(status != Response.OK){
                    write_err(status, callback);
                    return;
                }

                write_err(Response.TIMESTAMP_INVALID, callback);
                return;
            });
        }else{
            // 仍在期限內
            var ret = {};
            ret.status = Response.OK;
            ret.msg = "設備期限仍在一年內 ...";
            callback(ret);
        }
    });
}

function start_verify_acc(queue){
    for(var i = 0; i < queue.length; i ++){
        var acc = queue[i];

        // ruby update_acc_devices.rb "liaoyanchi3@gmail.com"
        var sh = "ruby ios_sign/update_acc_devices.rb \"%s\" ";
        var sh_cmd = util.format(sh, acc);
        log.info(sh_cmd);

        //运行spaceship 脚本
        exec(sh_cmd, function(error, stdout, stderr){
            // if(error){
            //     log.info('error: ' + error);
            // }

            // if(stderr){
            //     log.info('stderr: ' + stderr);
            // }

            // log.info('stdout: ' + stdout);
        });
    }
}

function schedule_to_action(){
    var rule = new schedule.RecurrenceRule();

    // 每天0時執行
    rule.hour = 0;
    rule.minute = 0;
    rule.second = 0;

    var j = schedule.scheduleJob(rule, function(){
        // 取出devices數已達100的帳號進行驗證核對
        web_model.get_max_devices_accounts(function(status, result){
            if(status != Response.OK){
                if(status == Response.NO_MAX_DEVICES_ACCOUNT){
                    log.info("無設備數達100的app的帳號，無需檢查 ...");
                }else{
                    log.info("其他錯誤 ...", status);
                }
            }else{
                log.info("已獲取設備數達100的app的帳號 ...");
                // log.info(result);
                var acc_verify_list = [];
                for(var i = 0; i < result.length; i ++){
                    // console.log(result[i].account);
                    acc_verify_list.push(result[i].account);
                }

                start_verify_acc(acc_verify_list);
            }
        })
    });
}

function schedule_to_check_resign_queue(){
    // 判斷是否有acc佇列
    if(acc_queue_list.length <= 0){
        // acc伫列为空，5秒后重跑
        setTimeout(function(){
            schedule_to_check_resign_queue();
        }, 5000);
        return;
    }

    var account_info;
    account_info = acc_queue_list[acc_queue_index];

    ready_to_reg_apple(account_info, function(ret){
        if(ret.status != Response.OK){
            if(ret.status == Response.RESIGN_QUEUE_IS_EMPTY){
                // log.info("" + account_info.account + " 帐号注册伫列为空 ...");
            }
        }
        
        acc_queue_index ++;
        if(acc_queue_index >= acc_queue_list.length){
            acc_queue_index = 0;
        }

        // log.info("3 秒后往下一个帐号注册伫列 ...");
        setTimeout(function(){
            schedule_to_check_resign_queue();
        }, 3000);
    });
}

setTimeout(function(){
    log.info("服务器启动，5秒后开始跑帐号注册伫列 ...");
    schedule_to_check_resign_queue();
}, 5000);

// 每天定時檢查設備數已達100的可用帳號
schedule_to_action();

module.exports = {
    get_loadxml: get_loadxml,
    resign_ipa: resign_ipa,
    get_downloadApp_url: get_downloadApp_url,
    update_acc_devices: update_acc_devices,

    resign_ipa_via_api: resign_ipa_via_api,
    create_app_to_db: create_app_to_db,

    check_timestamp_valid: check_timestamp_valid,
    get_resign_status: get_resign_status,
}
