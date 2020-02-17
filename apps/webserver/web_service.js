var fs = require("fs");
var plist = require('plist');
var exec = require("child_process").exec;
var util = require("util");
var schedule = require("node-schedule");

// var sftp_client = require("../../utils/sftp");
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

// local
var local_mac_config = server_config.local_mac_config;
// end

var APP_DOWNLOAD_SCHEME = server_config.appfile_config.appfile_download_scheme;
var PUBLIC_URL = server_config.appfile_config.appfile_domain // kritars 自己測試用的ftp server
var TEST_SITE_URL = server_config.rundown_config.appfile_domain // 與內部組對接用的ftp server

function write_err(status, ret_func){
    var ret = {};
    ret.status = status;
    switch(status){
        case Response.INVAILD_PARAMS:
            ret.msg = "請求參數錯誤 ...";
            break;
        case Response.SYS_ERROR:
            ret.msg = "服務器系統錯誤 ...";
            break;
        case Response.DB_SEARCH_EMPTY:
            ret.msg = "DB查無資料 ...";
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
        case Response.NO_MAX_DEVICES_ACCOUNT:
            ret.msg = "無設備數達95的app帳號 ...";
            break;
        case Response.REQ_REPEAT:
            ret.msg = "短時間內請求重複 ...";
            break;
        case Response.MOPROVISION_DOWNLOAD_FAILED:
            ret.msg = "mobileprovision 不存在 描述文件下載異常 ...";
            break;
        case Response.DB_SEARCH_EMPTY_OF_APP:
            ret.msg = "DB查無app資料 ...";
            break;
        case Response.RESIGN_COMPLETE_TXT_NOT_EXIST:
            ret.msg = "重簽名完成.txt 不存在 簽名異常 ...";
            break;
        case Response.NO_THIS_ACCOUNT:
            ret.msg = "找不到該帳號 ...";
            break;
    }
    ret_func(ret);
}

//callback = (ret)
function get_loadxml(md5, callback){
    if(typeof(md5) != "string" || md5 == ""){
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

function remove_local_files(local_plist_path, local_ipa_path){
    fs.unlink(local_plist_path, function(err){
        if(err){
            log.error(err);
        }

        log.info("刪除本地plist成功 ...");  
    })
    
    fs.unlink(local_ipa_path, function(err){
        if(err){
            log.error(err);
        }

        log.info("刪除本地ipa成功 ...");
    })
}

function ready_to_upload(ret, local_plist_path){
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

                ftp_client.put(local_plist_path, remote_plist_path, function(err){
                    if(err){
                        log.error("put error: ", err);
                        return;
                    }
            
                    log.info("上傳plist成功 ...");

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
        
        remove_local_files(local_plist_path, local_ipa_path);
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

function upload_mobileprovision(local_file_path){
    // ftp
    var remote_file_path = "/appfile/embedded.mobileprovision";

    var ftp_client = new Client();
    ftp_client.on("ready", function(){    
        log.info("ftp connection 已連線 ...");

        ftp_client.put(local_file_path, remote_file_path, function(err){
            if(err){
                log.error("put error: ", err);
                return;
            }
    
            log.info("上傳file成功 ...");
            ftp_client.end();
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
}

function remove_udid_from_cache_area_by_array(udids){
    for(var udid in udids){
        remove_udid_from_cache_area(udid);
    }
}

function remove_udid_from_cache_area(udid){
    // 將該udid請求從快取區清除
    if(udid_cache_area[udid]){
        udid_cache_area[udid] = null;
        delete udid_cache_area[udid];
    }
}

var global_cur_udid_index = 0;

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
                "acc_id": 2,
                "reg_account": "liaoyanchi3@gmail.com",
                "cert_name": "DEVELOPER .....",
                "bundle_id": "123123"
                "expired": 1605145756
            }
        }
    */

    if(global_cur_udid_index < ret.app_req_queue.length){
        var udid = ret.app_req_queue[global_cur_udid_index].udid;
        web_model.get_uinfo_by_udid(udid, null, null, null, function(status, result){
            if(status != Response.OK){
                // write_err(status, callback);
                // return;

                var err_ret = {};
                err_ret.status = status;
                err_ret.msg = "get_uinfo_by_udid error ...";
                err_ret.udid_list = ret.app_req_queue;
                err_ret.site_code = ret.site_code;
                callback(err_ret);
                return;
            }

            var json = JSON.parse(result.jsonstr);
            var charge_status = 0; // 0-新用戶, 1-舊用戶
            if(json){
                json.app_resigned_info.push({
                    "app_name": ret.app_name,
                    "app_desc": ret.app_desc,
                    "app_ver": ret.app_ver,
                    "ipa_name": ret.tag,
                    "site_code": ret.site_code,
                });

                if(json.reg_acc_info.reg_account == ret.account_info.account){
                    // 與前次簽名帳號相同，舊用戶重複下載
                    log.info("與前次簽名帳號相同，舊用戶重複下載 ...", udid);
                    ret.old_acc_list.push(udid);
                    charge_status = 1;
                }else{
                    // 與前次簽名帳號不同，視為新用戶下載
                    log.info("與前次簽名帳號不同，視為新用戶下載 ...", udid);
                    ret.new_acc_list.push(udid);

                    json.reg_acc_info = {
                        "acc_id": ret.account_info.acc_id,
                        "reg_account": ret.account_info.account,
                        "cert_name": ret.account_info.cert_name,
                        "expired": ret.account_info.expired,
                        "bundle_id": ret.account_info.bundle_id,
                    }

                }

                var jsonstr = JSON.stringify(json);
                // 更新數據庫
                web_model.update_device_info_by_udid(udid, jsonstr, charge_status, function(status, result){
                    if(status != Response.OK){
                        // write_err(status, callback);
                        // return;

                        var err_ret = {};
                        err_ret.status = status;
                        err_ret.msg = "update_device_info_by_udid error ...";
                        err_ret.udid_list = ret.app_req_queue;
                        err_ret.site_code = ret.site_code;
                        callback(err_ret);
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
                        "acc_id": ret.account_info.acc_id,
                        "reg_account": ret.account_info.account,
                        "cert_name": ret.account_info.cert_name,
                        "expired": ret.account_info.expired,
                        "bundle_id": ret.account_info.bundle_id,
                    }
                }

                // 新用戶下載
                log.info("新用戶下載 ...", udid);
                ret.new_acc_list.push(udid);
                
                var jsonstr = JSON.stringify(json);
                // 更新數據庫
                web_model.update_device_info_by_udid(udid, jsonstr, charge_status, function(status, result){
                    if(status != Response.OK){
                        // write_err(status, callback);
                        // return;

                        var err_ret = {};
                        err_ret.status = status;
                        err_ret.msg = "update_device_info_by_udid error ...";
                        err_ret.udid_list = ret.app_req_queue;
                        err_ret.site_code = ret.site_code;
                        callback(err_ret);
                        return;
                    };
                })
            }

            remove_udid_from_cache_area(udid);

            global_cur_udid_index ++;
            update_each_device_info_from_app_req_queue(ret, callback);
        })
    }else{
        log.info("app_req_queue 已全數更新完DB ")
        global_cur_udid_index = 0;
        ret.status = Response.OK;
        callback(ret);
    }
}

function update_all_info(ret, callback){
    // log.info(ret);
    // process.chdir(process.cwd() + "/../");

    web_model.add_new_resign_info(ret.tag, ret.path, function(status, result){
        if(status != Response.OK){
            // write_err(status, callback);
            // return;

            var err_ret = {};
            err_ret.status = status;
            err_ret.msg = "add_new_resign_info error ...";
            err_ret.udid_list = ret.app_req_queue;
            err_ret.site_code = ret.site_code;
            callback(err_ret);
            return;
        }

        // 更新該帳號的reg_content
        web_model.update_acc_reg_content(ret.account_info.acc_id, ret.app_req_id_queue, function(status, result){
            if(status != Response.OK){
                // write_err(status, callback);
                // return;

                var err_ret = {};
                err_ret.status = status;
                err_ret.msg = "update_acc_reg_content error ...";
                err_ret.udid_list = ret.app_req_queue;
                err_ret.site_code = ret.site_code;
                callback(err_ret);
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
    var fail_counts = 0;
    var b_interval = setInterval(function(){
        var end_resign_path = __dirname + "/../../ios_sign/app_resource/" + ret.app_name + "/" + ret.tag + ".txt";
        fs.access(end_resign_path, fs.constants.F_OK, function(err){
            if(err){
                if(fail_counts == 30){
                    // 偵測次數達30次(s)，重簽名app異常
                    clearInterval(b_interval);
                    log.warn("" + ret.tag + ".txt" + " 不存在 fail_counts 已達30次 ...");

                    var err_ret = {};
                    err_ret.status = Response.RESIGN_COMPLETE_TXT_NOT_EXIST;
                    err_ret.msg = "重簽名完成.txt 不存在 簽名異常 ...";
                    err_ret.udid_list = ret.app_req_queue;
                    err_ret.site_code = ret.site_code;
                    callback(err_ret);
                    return;
                }

                log.info("正在重签名app包 ...", fail_counts);
                fail_counts ++;
            }else{
                clearInterval(b_interval);
                log.info("已完成 " + ret.app_name + " 包的重签名作业，准备上传与更新数据库 ...");

                // 動態產生該tag的manifest.plist, 更改ipa路徑與title名稱
                var xml = fs.readFileSync(__dirname + "/../../ios_sign/manifest.plist", "utf8");
                var json = plist.parse(xml);
                // console.log(json.items[0].assets[0].url);
                
                json.items[0].assets[0].url = TEST_SITE_URL + ret.app_name + "/" + ret.tag + "/" + ret.tag + ".ipa";
                
                json.items[0].metadata.title = "" + ret.app_desc;
                var newxml = plist.build(json);
                var plist_path = __dirname + "/../../ios_sign/app_resource/" + ret.app_name + "/" + ret.tag + ".plist";
                fs.writeFileSync(plist_path, newxml);

                // 刪除end_resign_path 文件
                fs.unlink(end_resign_path, function(err){
                    if(err){
                        throw err;
                    }
    
                    log.info("删除 " + end_resign_path);
                });

                // 記錄到上傳列表
                global_upload_list[ret.tag] = {
                    status: 0,
                    tag: ret.tag,
                }

                // 進行上傳動作
                ready_to_upload(ret, plist_path);

                // 回應前端
                update_all_info(ret, callback);
            }
        });

    }, 1000);
}

function resign_ipa(dinfo, callback){
    var pattern_1 = new RegExp('^[A-Za-z0-9]{8}-[A-Za-z0-9]{16}$');
    var pattern_2 = new RegExp('^[A-Za-z0-9]{40}$');
    var pattern_3 = new RegExp('^[0-9]{4}$');

    if(dinfo == null 
    || typeof(dinfo.UDID) != "string" || dinfo.UDID == "" || (!dinfo.UDID.match(pattern_1) && !dinfo.UDID.match(pattern_2)) 
    || typeof(dinfo.PRODUCT) != "string" || dinfo.PRODUCT == "" 
    || typeof(dinfo.VERSION) != "string" || dinfo.VERSION == "" 
    || typeof(dinfo.SERIAL) != "string" || dinfo.SERIAL == "" || dinfo.SERIAL == "SN1234567890"
    || typeof(dinfo.SHA1) != "string" || dinfo.SHA1 == "" || !dinfo.SHA1.match(pattern_2)){
        write_err(Response.INVAILD_PARAMS, callback);
        return;
    }

    if(!udid_cache_area[dinfo.UDID]){
        // 短時間內第一次請求，加入快取區
        udid_cache_area[dinfo.UDID] = dinfo;

        web_model.get_app_info_by_sha1(dinfo.SHA1, function(status, result){
            if(status != Response.OK){
                write_err(status, callback);
                remove_udid_from_cache_area(dinfo.UDID);
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
                    write_err(ret.status, callback);
                    remove_udid_from_cache_area(dinfo.UDID);
                    return;
                }
    
                ret.sid = dinfo.SERIAL;
                // 已有簽過該app，不需再簽名
                if(ret.ipa_name != null && ret.ipa_name != ""){
                    ret.status = Response.APP_IS_EXIST;
                    ret.site_code = app_info.site_code;
                    ret.msg = "app已存在且已簽過名 ...";
                    callback(ret);
                    remove_udid_from_cache_area(dinfo.UDID);
                    return;
                }
    
                ret.msg = "已接收並排入簽名佇列 ...";
                ret.sha1 = dinfo.SHA1;
                callback(ret);
            });
        });
    }else{
        // 短時間內重複請求，仍在快取區，返回response
        write_err(Response.REQ_REPEAT, callback);
        return;
    }
}

function get_downloadApp_url(tag, callback){
    if(typeof(tag) != "string" || tag == ""){
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
    if(typeof(dID) != "number" || typeof(fid) != "string" || fid == ""){
        write_err(Response.INVAILD_PARAMS, callback);
        return;
    }

    // 先判斷是哪個app，取出app_name
    web_model.get_app_info_by_sha1(fid, function(status, result){
        if(status != Response.OK){
            write_err(status, callback);
            return;
        }

        var app_name = result.app_name;
        var download_name = "";

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
                        // log.info("名稱不符，跳過 ...");
                    }else{
                        // log.info("名稱相符，儲存ipa_name ...");
                        download_name = item.ipa_name;
                    }
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
    });
}

function acc_login_return(info, callback){
    if(typeof(info) != "object" || typeof(info.status) != "number" 
    || typeof(info.msg) != "string" || typeof(info.acc) != "string"){
        write_err(Response.INVAILD_PARAMS, callback);
        return;
    }

    if(info.status != Response.OK){
        // 登入失敗，修改該帳號的DB紀錄，in_enable 設為 0
        if(typeof(info.resultCode) != "number" || typeof(info.resultString) != "string"){
            write_err(Response.INVAILD_PARAMS, callback);
            return;
        }
        
        var obj = {"resultCode": info.resultCode, "resultString": info.resultString};
        log.info("acc_login_return 帳號登入失敗", obj);
        
        var objStr = JSON.stringify(obj);
        web_model.disable_acc_by_acc(info.acc, objStr, function(status, result){
            if(status != Response.OK){
                write_err(status, callback);
                return;
            }
    
            var ret = {};
            ret.status = Response.OK;
            ret.msg = "帳號登入失敗，更新帳號紀錄 ...";
            callback(ret);
        })
    }else{
        // 登入成功
        if(typeof(info.devices) != "number"){
            write_err(Response.INVAILD_PARAMS, callback);
            return;
        }

        log.info("acc_login_return 帳號登入正常");

        if(info.devices >= 95){
            web_model.update_device_count_and_disable_account(info.acc, info.devices, function(status, result){
                if(status != Response.OK){
                    write_err(status, callback);
                    return;
                }
        
                var ret = {};
                ret.status = Response.OK;
                ret.msg = "帳號登入成功, 設備數 >= 95, 停用帐号 ...";
                callback(ret);
            })
        }else{
            web_model.update_device_count_on_account_info(info.acc, info.devices, function(status, result){
                if(status != Response.OK){
                    write_err(status, callback);
                    return;
                }
        
                var ret = {};
                ret.status = Response.OK;
                ret.msg = "帳號登入成功, 更新設備數 ...";
                callback(ret);
            });
        }
    }
}

function reg_to_acc_return(info, callback){
    if(typeof(info) != "object" || typeof(info.status) != "number" 
    || typeof(info.msg) != "string" || typeof(info.acc) != "string"){
        write_err(Response.INVAILD_PARAMS, callback);
        return;
    }

    if(info.status != Response.OK){
        // 登入失敗，修改該帳號的DB紀錄，in_enable 設為 0

        // global_reg_to_acc 設為-1
        global_reg_to_acc = -1;

        if(typeof(info.resultCode) != "number" || typeof(info.resultString) != "string"){
            write_err(Response.INVAILD_PARAMS, callback);
            return;
        }
        
        var obj = {"resultCode": info.resultCode, "resultString": info.resultString};
        log.info("reg_to_acc_return 帳號登入失敗", obj);
        
        var objStr = JSON.stringify(obj);
        web_model.disable_acc_by_acc(info.acc, objStr, function(status, result){
            if(status != Response.OK){
                write_err(status, callback);
                return;
            }
    
            var ret = {};
            ret.status = Response.OK;
            ret.msg = "帳號登入失敗，更新帳號紀錄 ...";
            callback(ret);
        })
    }else{
        // 登入成功

        // global_reg_to_acc 設為1
        global_reg_to_acc = 1;

        if(typeof(info.devices) != "number"){
            write_err(Response.INVAILD_PARAMS, callback);
            return;
        }

        log.info("reg_to_acc_return 帳號登入正常");

        web_model.update_device_count_on_account_info(info.acc, info.devices, function(status, result){
            if(status != Response.OK){
                write_err(status, callback);
                return;
            }
    
            var ret = {};
            ret.status = Response.OK;
            ret.msg = "帳號登入成功, 更新設備數 ...";
            callback(ret);
        });
    }
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
        "app_desc": app_desc,
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
var app_req_id_queue_list = {};
/*
app_req_id_queue_list[app_id] = 
[
    device_id,
    ...
]
*/

var global_uuid = 1;

function add_data_to_acc_queue(dinfo, ainfo, device_acc_info, device_id, callback){
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

    // 判斷是否有uuid
    if(!dinfo.UUID){
        dinfo.UUID = global_uuid;
        global_uuid ++;
    }
    // end

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
            "uuid": dinfo.UUID,
            "device_id": device_id,
            "product": dinfo.PRODUCT,
            "version": dinfo.VERSION,
            "app_id": ainfo.app_id,
            "app_name": ainfo.app_name,
            "app_desc": ainfo.app_desc,
            "app_ver": ainfo.app_ver,
            "site_code": ainfo.site_code,
        })
    }

    var ret = {};
    ret.status = Response.OK;
    ret.device_id = device_id;
    callback(ret);
}

function check_udid_is_resigned(ainfo, dinfo, callback){
    // 判斷該dinfo 是否已存在db，是否已有簽過該app
    web_model.get_uinfo_by_udid(dinfo.UDID, dinfo.SERIAL, dinfo.PRODUCT, dinfo.VERSION, function(status, result){
        if(status != Response.OK){
            write_err(status, callback);
            return;
        }
        // log.warn(result);

        var now_time = parseInt(utils.timestamp());

        var device_id = result.id;
        if(result.jsonstr != null){
            log.info("有簽名紀錄 ...", result.jsonstr);
            var json = JSON.parse(result.jsonstr);
            var reg_acc_info = json.reg_acc_info;

            if(reg_acc_info.acc_id != 0){
                // 已註冊過apple帳號
                if(now_time > reg_acc_info.expired){
                    // 帳號已超過一年未續費，清除該設備的簽名資訊，重新抓取可用帳號
                    log.info("紀錄的帳號已超過一年未續費，清除該設備的簽名紀錄，重新抓取可用帳號進行簽名 ...");
                    
                    web_model.update_device_info_by_udid(dinfo.UDID, null, 0, function(status, result){
                        if(status != Response.OK){
                            write_err(status, callback);
                            return;
                        };

                        // 取一個有效的帳號來用
                        web_model.get_valid_account(local_mac_config.acc_group, function(status, result){
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

                            // 將該帳號設備數+1，以防滿了被其他請求取得
                            web_model.update_devices_by_id(device_acc_info.acc_id, 1, function(status, result){
                                if(status != Response.OK){
                                    write_err(status, callback);
                                    return;
                                }

                                // 加入acc佇列
                                add_data_to_acc_queue(dinfo, ainfo, device_acc_info, device_id, callback);
                            });
                        });
                    })
                    
                }else{
                    // 帳號未超過一年，判斷檔案
                    log.info("紀錄的帳號未超過一年，判斷簽名紀錄 ...");

                    // 將該設備註冊的帳號資訊抓出來
                    var device_acc_info = {
                        acc_id: reg_acc_info.acc_id,
                        account: reg_acc_info.reg_account,
                        cert_name: reg_acc_info.cert_name,
                        expired: reg_acc_info.expired,
                        bundle_id: reg_acc_info.bundle_id
                    }

                    var download_name = "";
                    var index = -1;
                    for(var i = 0; i < json.app_resigned_info.length; i ++){
                        if(json.app_resigned_info[i].site_code == ainfo.site_code){
                            log.info("紀錄有簽過site_code該app，判斷版本 ...");
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
                        }else{
                            log.info("紀錄查無此site_code，跳過 ...");
                        }
                    }
                    
                    if(download_name != null && download_name != ""){
                        // 有簽過該app 且download_name不為空
                        log.info("有簽過該app且版本號與最新版本相同，不需重簽名直接分發");
                        var ret = {};
                        ret.status = Response.OK;
                        ret.device_id = device_id;
                        ret.ipa_name = download_name;
                        ret.ipa_path = TEST_SITE_URL + ainfo.app_name + "/" + download_name + "/" + download_name + ".ipa";
                        callback(ret);
                        return;
                    }else{
                        // 更新該設備的jsonStr 內容
                        if(index != -1){
                            log.info("有簽過該app，但版本不符，移除原先紀錄並重簽名app");
                            json.app_resigned_info[index] = null;
                            json.app_resigned_info.splice(index, 1);

                            var jsonstr = JSON.stringify(json);
                            web_model.update_device_info_by_udid(dinfo.UDID, jsonstr, 0, function(status, result){
                                if(status != Response.OK){
                                    write_err(status, callback);
                                    return;
                                };

                                add_data_to_acc_queue(dinfo, ainfo, device_acc_info, device_id, callback);
                            })
                        }else{
                            log.info("沒簽過該app，加入重簽名佇列");

                            add_data_to_acc_queue(dinfo, ainfo, device_acc_info, device_id, callback);
                        }
                    }
                }
            }
        }else{
            // 未註冊過帳號，需要註冊帳號且重簽名app
            log.info("無簽名紀錄，需要註冊帳號且重簽名app ...");
    
            // 取一個有效的帳號來用
            web_model.get_valid_account(local_mac_config.acc_group, function(status, result){
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

                // 將該帳號設備數+1，以防滿了被其他請求取得
                web_model.update_devices_by_id(device_acc_info.acc_id, 1, function(status, result){
                    if(status != Response.OK){
                        write_err(status, callback);
                        return;
                    }

                    // 加入acc佇列
                    add_data_to_acc_queue(dinfo, ainfo, device_acc_info, device_id, callback);
                });
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
                app_queue_list[i].app_name = device_info.app_name;
                app_queue_list[i].app_desc = device_info.app_desc;
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
        // req_queue.push(device_info.udid);
        req_queue.push({
            udid: device_info.udid,
            uuid: device_info.uuid
        });
    }

    // 以下為device_id
    if(!app_req_id_queue_list[device_info.app_id]){
        app_req_id_queue_list[device_info.app_id] = [];
    }

    var app_req_id_queue_is_exist = false;
    var req_id_queue = app_req_id_queue_list[device_info.app_id];
    for(var i = 0; i < req_id_queue.length; i ++){
        var item = req_id_queue[i];
        if(item == device_info.device_id){
            // 已經在該app queue內
            app_req_id_queue_is_exist = true;
        }
    }

    if(!app_req_id_queue_is_exist){
        req_id_queue.push(device_info.device_id);
    }
}

function start_resign_app(account_info, app_info, callback){
    if(!app_req_queue_list[app_info.app_id] || app_req_queue_list[app_info.app_id].length <= 0){
        write_err(Response.RESIGN_QUEUE_IS_EMPTY, callback);
        return;
    }

    // 將佇列內容儲存
    var queue = app_req_queue_list[app_info.app_id];
    // 將原有佇列刪除
    app_req_queue_list[app_info.app_id] = null;
    delete app_req_queue_list[app_info.app_id];

    // 將佇列內容儲存
    var id_queue = app_req_id_queue_list[app_info.app_id];
    // 將原有佇列刪除
    app_req_id_queue_list[app_info.app_id] = null;
    delete app_req_id_queue_list[app_info.app_id];

    log.info("当前重签名伫列: " + app_info.app_name + "，app_id = " + app_info.app_id);
    log.info("当前 " + app_info.app_name + " 该重簽名佇列内的请求: ", queue);
    // log.info("当前 " + app_info.app_name + " 该重簽名佇列内的请求: ", id_queue);

    log.info("正对 " + app_info.app_name + " 执行重签名打包 ...");
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
    ret.app_req_id_queue = id_queue;
    ret.new_acc_list = [];
    ret.old_acc_list = [];
    // ret.path = "itms-services://?action=download-manifest&url=https://apple.bckappgs.info/dev_188/xxxxx/manifest.plist";

    ret.path = APP_DOWNLOAD_SCHEME + TEST_SITE_URL + ret.app_name + "/" + ret.tag + "/" + ret.tag + ".plist";
    ret.ipa_path = TEST_SITE_URL + ret.app_name + "/" + ret.tag + "/" + ret.tag + ".ipa";

    ready_to_sigh(ret, callback);
}

function start_resign_on_app_queue(account_info, mobileprovision_path, callback){
    // 判斷是否有acc佇列
    if(app_queue_list.length <= 0){
        // log.info("app 佇列為空, 直接返回 ...");
        write_err(Response.INVAILD_PARAMS, callback);
        return;
    }

    var app_info;
    app_info = app_queue_list[app_queue_index];

    // 開始簽名
    start_resign_app(account_info, app_info, function(ret){
        if(ret.status != Response.OK){
            if(ret.status == Response.RESIGN_QUEUE_IS_EMPTY){
                log.warn("" + app_info.app_name + " 重签名伫列为空 ...");
            }else{
                // 簽名異常，通知管理後台該次簽名的udid有哪些，顯示app已下架
                /*
                ret = {
                    status: 
                    msg:
                    udid_list: 
                    site_code: 
                }
                */
                log.error("start_resign_app error ...", ret.status);
                
                if(server_config.rundown_config.api_with_system){
                    var json_data = JSON.stringify(ret);
                    log.warn(json_data);
    
                    // post到管理後台
                    // https://api-518.webpxy.info/api/v2/request/sign_notify
                    var api_system_config = server_config.rundown_config.api_system_config;
                    var hostname, path;
                    if(global_notify_url == ""){
                        hostname = api_system_config.hostname;
                        path = api_system_config.url;
                    }else{
                        var n_url = new URL(global_notify_url);
                        hostname = n_url.hostname;
                        path = n_url.pathname;
                    }
                    
                    https.https_post(hostname, api_system_config.port, path, null, json_data, function(is_ok, data){
                        if(is_ok){
                            // log.warn("管理后台incoming_msg.statusCode = 200，response ...", data.toString());
                            log.warn("管理后台incoming_msg.statusCode = 200");
                        }
                    })
                }

                // 清掉udid_list內的快取區紀錄
                remove_udid_from_cache_area_by_array(ret.udid_list);
            }
        }else{
            // 判斷是否與內部組對接
            if(server_config.rundown_config.api_with_system){
                // 簽名完成且上傳，通知管理後台
                web_model.get_devices_by_id(account_info.acc_id, function(status, result){
                    if(status != Response.OK){
                        write_err(status, callback);
                        return;
                    }

                    // log.info(result.devices);
                    var data = {
                        status: Response.OK,
                        udid_list: ret.app_req_queue,
                        // file_path: ret.path,
                        ipa_path: ret.ipa_path,
                        app_name: ret.app_name,
                        site_code: ret.site_code,
                        sign_account: account_info.account,
                        device_num: result,
                        new_acc_list: ret.new_acc_list,
                        old_acc_list: ret.old_acc_list
                    };
                    var json_data = JSON.stringify(data);
                    log.warn(json_data);
    
                    // post到管理後台
                    // https://api-518.webpxy.info/api/v2/request/sign_notify
    
                    var api_system_config = server_config.rundown_config.api_system_config;
                    var hostname, path;
                    if(global_notify_url == ""){
                        hostname = api_system_config.hostname;
                        path = api_system_config.url;
                    }else{
                        var n_url = new URL(global_notify_url);
                        hostname = n_url.hostname;
                        path = n_url.pathname;
                    }
                    
                    https.https_post(hostname, api_system_config.port, path, null, json_data, function(is_ok, data){
                        if(is_ok){
                            // log.warn("管理后台incoming_msg.statusCode = 200，response ...", data.toString());
                            log.warn("管理后台incoming_msg.statusCode = 200");
                        }
                    })
                });
            }
        };
        
        app_queue_index ++;
        if(app_queue_index >= app_queue_list.length){
            log.info("已无重签名伫列，回到帐号注册伫列流程 ...");

            // 該次帳號佇列已全結束，刪除該次下載的.mobileprovision
            fs.unlink(mobileprovision_path, function(err){
                if(err){
                    throw err;
                }

                log.info("該次帳號佇列已全結束，删除 " + mobileprovision_path);
            });

            app_queue_index = 0;
            callback(ret);
        }else{
            log.info("2秒后往下一个重签名伫列 ...");
            setTimeout(function(){
                start_resign_on_app_queue(account_info, mobileprovision_path, callback);
            }, 2000);
        }
    });
}

function sort_acc_req_queue_by_app(account_info, acc_req_queue, mobileprovision_path, callback){
    log.info("分类不同app重签名伫列 ...");
    // 根據不同app 分類不同簽名佇列
    for(var i = 0; i < acc_req_queue.length; i ++){
        var device_info = acc_req_queue[i];
        add_data_to_app_queue(device_info);
    }

    // 開始跑app佇列 進行簽名
    start_resign_on_app_queue(account_info, mobileprovision_path, callback);
}

function reg_to_acc(account_info, callback){
    //進行重簽名，並部署到file server
    log.info("執行reg_to_acc.rb，对 " + account_info.account + " 帐号注册udid ...");

    var sh = "ruby ios_sign/reg_to_acc.rb \"%s\" \"%s\" \"%s\" \"true\" ";
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

    var ret = {};
    ret.status = Response.OK;
    ret.msg = "已執行reg_to_acc.rb 註冊udid中 ...";
    callback(ret);
}

var global_reg_to_acc = 0; // 0->初始值，1->正常，-1->不正常

function action_reg_to_apple(account_info, acc_req_queue, file_path, callback){
    if(file_path == null || file_path == ""){
        write_err(Response.INVAILD_PARAMS, callback);
        return;
    }

    reg_to_acc(account_info, function(ret){
        if(ret.status != Response.OK){
            // 非Response.OK
            write_err(ret.status, callback);
            return;
        }

        // Response.OK
        var b_interval = setInterval(function(){
            if(global_reg_to_acc == 1){
                // 檢查正常，開始簽名流程
                clearInterval(b_interval);
                global_reg_to_acc = 0;

                var mobileprovision_path = __dirname + "/../../ios_sign/account/" + account_info.acc_md5 + ".mobileprovision";
                var fail_counts = 0;
                var c_interval = setInterval(function(){
                    fs.access(mobileprovision_path, fs.constants.F_OK, function(err){
                        if(err){
                            if(fail_counts == 5){
                                // 失敗錯誤達5次
                                clearInterval(c_interval);
                                log.warn(".mobileprovision 不存在 fail_counts 已達5次 ...");
                                

                                // 將設備批次文件刪除
                                fs.unlink(file_path, function(err){
                                    if(err){
                                        throw err;
                                    }
        
                                    log.info("删除" + file_path);
                                });

                                write_err(Response.MOPROVISION_DOWNLOAD_FAILED, callback);
                                return;
                            }

                            log.info(account_info.acc_md5 + ".mobileprovision 不存在 ...");
                            fail_counts ++;
                        }else{
                            clearInterval(c_interval);
                            log.info(account_info.acc_md5 + ".mobileprovision 已下載至本地端 ...");
                            log.info(mobileprovision_path);
    
                            // 將設備批次文件刪除
                            fs.unlink(file_path, function(err){
                                if(err){
                                    throw err;
                                }
    
                                log.info("删除" + file_path);
                            });
    
                            sort_acc_req_queue_by_app(account_info, acc_req_queue, mobileprovision_path, callback);
                        }
                    });
                }, 1000);

            }else if (global_reg_to_acc == -1){
                // 檢查不正常，該帳號不可用
                clearInterval(b_interval);
                global_reg_to_acc = 0;

                log.error("帳號異常 error ...", account_info.account);
                // log.warn(account_info);
                // log.warn(acc_req_queue);
                // 將acc_queue_list內該帳號移除
                acc_queue_list[acc_queue_index] = null;
                acc_queue_list.splice(acc_queue_index, 1);

                // 將設備批次文件刪除
                fs.unlink(file_path, function(err){
                    if(err){
                        throw err;
                    }

                    log.info("删除" + file_path);
                });
    
                reinsert_to_new_acc_queue(acc_req_queue, function(ret){
                    if(ret.status != Response.OK){
                        log.error("reinsert_to_new_acc_queue error ...", ret.status);
                        write_err(status, callback);
                        return;
                    }

                    callback(ret);
                });
            }
        }, 1000);
    });
}

function ready_to_reg_apple(account_info, callback){
    if(!acc_req_queue_list[account_info.acc_id] || acc_req_queue_list[account_info.acc_id].length <= 0){
        write_err(Response.RESIGN_QUEUE_IS_EMPTY, callback);
        return;
    }

    // 將佇列內容另存
    var queue = acc_req_queue_list[account_info.acc_id];
    // 將原有佇列內容刪除
    acc_req_queue_list[account_info.acc_id] = null;
    delete acc_req_queue_list[account_info.acc_id];

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

// udid請求暫存區，避免短時間重複請求
var udid_cache_area = {};
/*
{
    udid: dinfo,
    udid: dinfo,
    ...
}
*/

var global_notify_url = "";

function resign_ipa_via_api(dinfo, callback){
    var pattern_1 = new RegExp('^[A-Za-z0-9]{8}-[A-Za-z0-9]{16}$');
    var pattern_2 = new RegExp('^[A-Za-z0-9]{40}$');
    var pattern_3 = new RegExp('^[0-9]{4}$');
    var pattern_4 = new RegExp('^[A-Za-z0-9]{8}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{12}$');

    if(dinfo == null 
    || typeof(dinfo.UDID) != "string" || dinfo.UDID == "" || (!dinfo.UDID.match(pattern_1) && !dinfo.UDID.match(pattern_2)) 
    || typeof(dinfo.PRODUCT) != "string" || dinfo.PRODUCT == "" 
    || typeof(dinfo.VERSION) != "string" || dinfo.VERSION == "" 
    || typeof(dinfo.SERIAL) != "string" || dinfo.SERIAL == "" || dinfo.SERIAL == "SN1234567890"
    || typeof(dinfo.SHA1) != "string" || dinfo.SHA1 == "" || !dinfo.SHA1.match(pattern_2)
    || typeof(dinfo.APP_VER) != "string" || dinfo.APP_VER == "" || !dinfo.APP_VER.match(pattern_3)
    || typeof(dinfo.SITE_CODE) != "number"
    || typeof(dinfo.NOTIFY_URL) != "string"
    || typeof(dinfo.UUID) != "string" || dinfo.UUID == "" || !dinfo.UUID.match(pattern_4)){
        write_err(Response.INVAILD_PARAMS, callback);
        return;
    }

    // 第一次為空時寫入通知網址。
    if(global_notify_url == ""){
        global_notify_url = dinfo.NOTIFY_URL;
    }

    if(!udid_cache_area[dinfo.UDID]){
        // 短時間內第一次請求，加入快取區
        udid_cache_area[dinfo.UDID] = dinfo;

        web_model.get_app_info_by_sha1(dinfo.SHA1, function(status, result){
            if(status != Response.OK){
                write_err(status, callback);
                remove_udid_from_cache_area(dinfo.UDID);
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
                    write_err(ret.status, callback);
                    remove_udid_from_cache_area(dinfo.UDID);
                    return;
                }
    
                ret.sid = dinfo.SERIAL;
                // 已有簽過該app，不需再簽名
                if(ret.ipa_name != null && ret.ipa_name != ""){
                    ret.status = Response.APP_IS_EXIST;
                    ret.site_code = app_info.site_code;
                    ret.msg = "app已存在且已簽過名 ...";
                    callback(ret);
                    remove_udid_from_cache_area(dinfo.UDID);
                    return;
                }
    
                ret.msg = "已接收並排入簽名佇列 ...";
                ret.sha1 = dinfo.SHA1;
                callback(ret);
            });
        });
    }else{
        // 短時間內重複請求，仍在快取區，返回response
        write_err(Response.REQ_REPEAT, callback);
        return;
    }
}

function check_app_is_exist(app_info, callback){
    web_model.get_app_info_by_sha1(app_info.sha1, function(status, result){ 
        if(status != Response.OK){
            if(status == Response.DB_SEARCH_EMPTY_OF_APP){
                // 無此app 紀錄，可新增
                callback(Response.OK, true, true);
                return;
            }else{
                callback(status, null, null);
                return;
            }
        }
        
        if(result.version == app_info.ver){
            // 已有此app 紀錄，且版本相同
            callback(Response.OK, false, false);
        }else{
            // 已有此app 紀錄，但版本不同
            callback(Response.OK, false, true);
        }
    });
}

function check_local_folder_exist(local_path, callback){
    fs.access(local_path, fs.constants.F_OK | fs.constants.W_OK, function(err){
        if(err){
            log.error(err);

            fs.mkdir(local_path, {recursive: true}, function(err){
                if(err){
                    log.error(err);
                    write_err(Response.LOCAL_MKDIR_FAILED, callback);
                    return;
                }

                var ret = {};
                ret.status = Response.OK;
                callback(ret);
            });
        }else{
            var ret = {};
            ret.status = Response.OK;
            callback(ret);
        }
    });
}   

function download_ipa_to_local(app_name, callback){
    if(typeof(app_name) != "string" || app_name == ""){
        write_err(Response.INVAILD_PARAMS, callback);
        return;
    }

    // fs 檢查本地目錄是否存在，無則創建目錄
    var local_dir_path = __dirname + "/../../ios_sign/app_resource/" + app_name;
    check_local_folder_exist(local_dir_path, function(result){
        if(result.status != Response.OK){
            write_err(result.status, callback);
            return;
        }

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
    })
}

function reset_sigh_record(info, callback){
    if(typeof(info) != "object" || typeof(info.ACCOUNT) != "string"){
        write_err(Response.INVAILD_PARAMS, callback);
        return;
    }

    web_model.get_info_by_account(info.ACCOUNT, function(status, result){
        if(status != Response.OK){
            write_err(status, callback);
            return;
        }

        // log.info(result[0].reg_content);
        var json_content = JSON.parse(result[0].reg_content);
        // log.info(json_content);
        
        // 依據content內的設備id，將設備的jsonstr 清空
        web_model.update_jsonstr_by_id_multi(json_content.udids, function(status, result){
            if(status != Response.OK){
                write_err(status, callback);
                return;
            }

            var ret = {};
            ret.status = Response.OK;
            ret.msg = "已清除該帳號的所有設備簽名紀錄 ...";
            callback(ret);
        })
    })
}

function clean_sigh_by_udid(info, callback){
    if(typeof(info) != "object" || typeof(info.UDID) != "object"){
        write_err(Response.INVAILD_PARAMS, callback);
        return;
    }

    web_model.clean_sigh_by_udids_multi(info.UDID, function(status, result){
        if(status != Response.OK){
            write_err(status, callback);
            return;
        }

        var ret = {};
        ret.status = Response.OK;
        ret.msg = "已清除udid的簽名紀錄 ...";
        callback(ret);
    })
}

function sync_local_file(sync_info, callback){
    if(sync_info == null 
    || typeof(sync_info.app_name) != "string" || sync_info.app_name == ""){
        write_err(Response.INVAILD_PARAMS, callback);
        return;
    }

    download_ipa_to_local(sync_info.app_name, function(ret){
        if(ret.status != Response.OK){
            write_err(ret.status, callback);
            return;
        }
        
        ret.msg = "已同步下載檔案包至本地端 ...";
        callback(ret);
        return;
    });
}

function create_app_to_db(app_info, callback){
    var pattern_1 = new RegExp('^[A-Za-z0-9]{8}-[A-Za-z0-9]{16}$');
    var pattern_2 = new RegExp('^[A-Za-z0-9]{40}$');
    var pattern_3 = new RegExp('^[0-9]{4}$');
    var pattern_4 = new RegExp('^[A-Za-z0-9]{32}$');

    if(app_info == null 
    || typeof(app_info.app_name) != "string" || app_info.app_name == "" 
    || typeof(app_info.app_desc) != "string" || app_info.app_desc == "" 
    || typeof(app_info.ver) != "string" || app_info.ver == "" || !app_info.ver.match(pattern_3)
    || typeof(app_info.sha1) != "string" || app_info.sha1 == "" || !app_info.sha1.match(pattern_2)
    || typeof(app_info.md5) != "string" || app_info.md5 == "" || !app_info.md5.match(pattern_4)
    || typeof(app_info.site_code) != "number"){
        write_err(Response.INVAILD_PARAMS, callback);
        return;
    }

    check_app_is_exist(app_info, function(status, is_empty, need_update){
        if(status != Response.OK){
            write_err(status, callback);
            return;
        }

        if(is_empty){
            log.info("無紀錄過此app，下載至簽名服務器本地端 ...", app_info);

            download_ipa_to_local(app_info.app_name, function(ret){
                if(ret.status != Response.OK){
                    write_err(ret.status, callback);
                    return;
                }

                // // 通知備用機器同步下載檔案包
                // var backup_mac_server_config = server_config.backup_mac_server_config;
                // var hostname = backup_mac_server_config.hostname;
                // var port = backup_mac_server_config.port;
                // var path = backup_mac_server_config.url;
                // var sync_json = {"app_name": app_info.app_name};
                // var sync_json_data = JSON.stringify(sync_json);
                // http.http_post(hostname, port, path, null, sync_json_data, function(is_ok, data){
                //     if(is_ok){
                //         // log.warn("管理后台incoming_msg.statusCode = 200，response ...", data.toString());
                //         log.warn("backup mac ... incoming_msg.statusCode = 200");
                //     }
                // })
                // // end

                web_model.add_new_to_app_info(app_info, function(status, result){
                    if(status != Response.OK){
                        write_err(status, callback);
                        return;
                    }

                    ret.msg = "無紀錄過此app，已下載至簽名服務器本地端 ...";
                    callback(ret);
                    return;
                })
            });
        }else{
            if(need_update){
                log.info("已紀錄過此app，但版本不同。重新下載至簽名服務器本地端 ...", app_info);

                download_ipa_to_local(app_info.app_name, function(ret){
                    if(ret.status != Response.OK){
                        write_err(ret.status, callback);
                        return;
                    }

                    // // 通知備用機器同步下載檔案包
                    // var backup_mac_server_config = server_config.backup_mac_server_config;
                    // var hostname = backup_mac_server_config.hostname;
                    // var port = backup_mac_server_config.port;
                    // var path = backup_mac_server_config.url;
                    // var sync_json = {"app_name": app_info.app_name};
                    // var sync_json_data = JSON.stringify(sync_json);
                    // http.http_post(hostname, port, path, null, sync_json_data, function(is_ok, data){
                    //     if(is_ok){
                    //         // log.warn("管理后台incoming_msg.statusCode = 200，response ...", data.toString());
                    //         log.warn("backup mac ... incoming_msg.statusCode = 200");
                    //     }
                    // })
                    // // end

                    web_model.update_app_to_app_info(app_info, function(status, result){
                        if(status != Response.OK){
                            write_err(status, callback);
                            return;
                        }
            
                        ret.msg = "已紀錄過此app，但版本不同。已重新下載至簽名服務器本地端 ...";
                        callback(ret);
                        return;
                    })
                });
                
            }else{
                log.info("已紀錄過此app，且版本相同，不需更新簽名服務器本地端檔案 ...", app_info);
                
                var ret = {};
                ret.status = Response.OK;
                ret.msg = "已紀錄過此app，且版本相同，不需更新簽名服務器本地端檔案 ...";
                callback(ret);
            }
        }
    });
}

function check_timestamp_valid(sid, timestamp, callback){
    if(typeof(sid) != "string" || sid == "" || typeof(timestamp) != "number"){
        write_err(Response.INVAILD_PARAMS, callback);
        return;
    }

    // 根據sid 找出 當時寫入的期限 (timestamp += 31536000)
    web_model.get_timestamp_valid_by_sid(sid, function(status, result){
        if(status != Response.OK){
            write_err(status, callback);
            return;
        }
        
        // log.info(result);
        // log.info(result.udid);
        // log.info(result.time_valid);
        var time_valid = result.time_valid;
        // log.info("time_valid = " + time_valid + ", timestamp = " + timestamp);
        if(timestamp > time_valid){
            // 已超過一年，更新db內該sid跟app_name, ipa_name 為空
            log.info("已超過一年，更新db內該sid跟app_name, ipa_name 為空 ...");
            web_model.clear_record_by_sid(sid, function(status, result){
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
            ret.udid = result.udid;
            callback(ret);
        }
    });
}

function start_verify_acc_state(queue){
    for(var i = 0; i < queue.length; i ++){
        var acc = queue[i];

        // ruby check2FA_valid.rb "liaoyanchi3@gmail.com"
        var sh = "ruby ios_sign/check2FA_valid.rb \"%s\" ";
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
    var rule1 = new schedule.RecurrenceRule();
    // 每天12時執行
    rule1.hour = 12;
    rule1.minute = 0;
    rule1.second = 0;

    var j1 = schedule.scheduleJob(rule1, function(){
        log.info("每日12時將已達95設備數的帳號進行驗證 ...");
        // 取出可用的帳號
        web_model.get_max_devices_accounts(function(status, result){
            if(status != Response.OK){
                if(status == Response.NO_MAX_DEVICES_ACCOUNT){
                    log.info("無已達95設備數的帳號 ...");
                }else{
                    log.error("get_max_devices_accounts error ...", status);
                }
            }

            log.info("已獲取帳號列表 ..." + result + ", 進行驗證更新 ...");
            // 檢查帳號登入是否正常
            start_verify_acc_state(result);
        })
    });

    var rule2 = new schedule.RecurrenceRule();
    // 每天13時執行
    rule2.hour = 13;
    rule2.minute = 0;
    rule2.second = 0;

    var j2 = schedule.scheduleJob(rule2, function(){
        log.info("每日13時更新帳號在本地端的session 天數 ...");
        // 取出可用的帳號
        web_model.update_all_valid_acc_days(function(status, result){
            if(status != Response.OK){
                if(status == Response.NO_VALID_ACCOUNT){
                    log.info("無可用帳號 ...");
                }else{
                    log.error("update_all_valid_acc_days error ...", status);
                }
            }
            
            log.info("已更新完可用帳號days ...");
        })
    });
}

function reinsert_to_new_acc_queue(device_queue, callback){
    log.info("待轉移佇列： ", device_queue);

    web_model.get_valid_account(local_mac_config.acc_group, function(status, result){
        if(status != Response.OK){
            write_err(status, callback);
            return;
        }

        var new_acc_info = {
            acc_id: result.id,
            account: result.account,
            cert_name: result.cert_name,
            expired: result.expired,
            bundle_id: result.bundle_id,
        }

        log.info("取得帳號： ", new_acc_info.account);

        // 確認該帳號是否已在acc_queue_list 內
        var acc_queue_is_exist = false;
        for(var i = 0; i < acc_queue_list.length; i ++){
            var id = acc_queue_list[i].acc_id;
            if(id == new_acc_info.acc_id){
                acc_queue_is_exist = true;
            }
        }
        // 若無則加入acc_queue_list
        if(!acc_queue_is_exist){
            acc_queue_list.push(new_acc_info);
        }

        if(!acc_req_queue_list[new_acc_info.acc_id]){
            acc_req_queue_list[new_acc_info.acc_id] = [];
        }

        // 計算剩餘可用設備數
        var remain_number = 95 - result.devices;  // 3 

        if(device_queue.length <= remain_number){
            // 伫列数量小于等于 剩馀可用数量，可全部用掉
            web_model.update_devices_by_id(new_acc_info.acc_id, device_queue.length, function(status, result){
                if(status != Response.OK){
                    write_err(status, callback);
                    return;
                }

                for(var i = 0; i < device_queue.length; i ++){
                    var acc_req_queue_is_exist = false;
                    var req_queue = acc_req_queue_list[new_acc_info.acc_id];
                    for(var j = 0; j < req_queue.length; j ++){
                        var item = req_queue[j];
                        if(item.udid == device_queue[i].udid){
                            // 已經在該app queue內
                            acc_req_queue_is_exist = true;
                        }
                    }
    
                    if(!acc_req_queue_is_exist){
                        req_queue.push(device_queue[i]);
                    }

                    if(i == device_queue.length - 1){
                        // 若伫列已转移完毕
                        device_queue = null;

                        log.info("待轉移佇列已全數轉移至新帳號佇列 ...");
                        var ret = {};
                        ret.status = Response.OK;
                        ret.msg = "待轉移佇列已全數轉移至新帳號佇列 ...";
                        callback(ret);
                    }
                }
            });
        }else{
            // 伫列数量大于 剩馀可用数量，不够用，需拆分可用的伫列及 重新获取新帐号的伫列
            var valid_queue = [];
            for(var i = 0; i < remain_number; i ++){
                var item = device_queue[i];
                valid_queue.push(item);
            }

            // 将valid_queue 排入转移流程
            web_model.update_devices_by_id(new_acc_info.acc_id, valid_queue.length, function(status, result){
                if(status != Response.OK){
                    write_err(status, callback);
                    return;
                }

                for(var i = 0; i < valid_queue.length; i ++){
                    var acc_req_queue_is_exist = false;
                    var req_queue = acc_req_queue_list[new_acc_info.acc_id];
                    for(var j = 0; j < req_queue.length; j ++){
                        var item = req_queue[j];
                        if(item.udid == valid_queue[i].udid){
                            // 已經在該app queue內
                            acc_req_queue_is_exist = true;
                        }
                    }
    
                    if(!acc_req_queue_is_exist){
                        req_queue.push(valid_queue[i]);
                    }

                    if(i == valid_queue.length - 1){
                        // 若伫列已转移完毕
                        valid_queue = null;

                        log.info("待轉移佇列已全數轉移至新帳號佇列 ...");
                        
                        // 将原始device_queue splice 去除已转移到valid_queue的item
                        log.info(device_queue.length);
                        device_queue.splice(0, remain_number);
                        log.info(device_queue.length);

                        // 将还没转移的device丢入 reinsert_to_new_acc_queue 重跑
                        setTimeout(function(){
                            log.info("該帳號可用設備數已滿，仍有未轉移設備資訊，0.5s後重新抓取");
                            reinsert_to_new_acc_queue(device_queue, callback);
                        }, 500);
                    }
                }
            });
        }
    })
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
            }else{
                log.error("ready_to_reg_apple error ...", ret.status);
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

function startup_config(){
    web_model.get_all_valid_accounts(local_mac_config.m_code, function(status, result){
        if(status != Response.OK){
            if(status == Response.NO_VALID_ACCOUNT){
                log.info("無可用帳號 ...");
            }else{
                log.error("get_all_valid_accounts error ...", status);
            }
        }else{
            log.info("已獲取可用的帳號，已存到redis server ...");
        }
    });
}

setTimeout(function(){
    log.info("服务器启动，5秒后开始跑帐号注册伫列 ...");
    startup_config();
    schedule_to_check_resign_queue();
}, 5000);

// 定時器
schedule_to_action();

module.exports = {
    get_loadxml: get_loadxml,
    resign_ipa: resign_ipa,
    get_downloadApp_url: get_downloadApp_url,
    acc_login_return: acc_login_return,
    reg_to_acc_return: reg_to_acc_return,

    resign_ipa_via_api: resign_ipa_via_api,
    create_app_to_db: create_app_to_db,
    sync_local_file: sync_local_file,
    reset_sigh_record: reset_sigh_record,
    clean_sigh_by_udid: clean_sigh_by_udid,

    check_timestamp_valid: check_timestamp_valid,
    get_resign_status: get_resign_status,
}
