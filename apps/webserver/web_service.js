var fs = require("fs");
var plist = require('plist');
var exec = require("child_process").exec;
var util = require("util");

var sftp_client = require("../../utils/sftp");
var Response = require("../Response");
var log = require("../../utils/log");
var web_model = require("./web_model");
var utils = require("../../utils/utils");

var APP_DOWNLOAD_SCHEME = "itms-services://?action=download-manifest&url="
var PUBLIC_URL = "https://apple.bckappgs.info/"

function write_err(status, ret_func){
    var ret = {};
    ret.status = status;
    ret_func(ret);
}

//callback = (ret)
function get_loadxml(md5, callback){
    if(md5 == null || md5 == ""){
        write_err(Response.INVAILD_PARAMS, callback);
        return;
    }

    if (!fs.existsSync(process.cwd() + "/www_root/mobileconfig/" + md5 + "signed.mobileconfig")){
        write_err(Response.FILE_NOT_EXIST, callback);
        return;
    }

    var ret = {};
    ret.status = Response.OK;
    callback(ret);
}

//callback = (ret)
function get_app_name_by_sha1(sha1, callback){
    if(sha1 == null || sha1 == ""){
        callback(Response.INVAILD_PARAMS, null);
        return;
    }

    web_model.get_app_name(sha1, callback);
}

function check_uinfo_by_udid(info, app_name, callback){
    if(info == null || app_name == null || app_name == ""){
        callback(Response.INVAILD_PARAMS, null);
        return;
    }

    web_model.get_uinfo(info, app_name, function(status, result){
        if(status != Response.OK){
            callback(status, null);
            return;
        }

        if(result.app_name == app_name && result.ipa_name != ""){
            //與前次分發ipa相同，不需重簽名直接分發
            // log.info("app_name == result.app_name");
            callback(Response.OK, true, result.ipa_name);
        }else{
            //與前次分發ipa不同，需重簽名該ipa並分發
            // log.info("app_name != result.app_name", result.app_name);
            callback(Response.OK, false, null);
        }
    });
}

function ready_to_upload(ret, local_plist_path){
    var local_ipa_path = process.cwd() + "/ios_sign/" + ret.app_name + "/" + ret.tag + ".ipa";
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

function update_all_info(ret, callback){
    if(ret == null){
        write_err(Response.INVAILD_PARAMS, callback);
        return;
    }

    // log.info(ret);
    process.chdir(process.cwd() + "/../");

    web_model.add_device_count_on_account_info(ret.account, function(status, result){
        if(status != Response.OK){
            write_err(status, callback);
            return;
        }

        // web_model.update_path_on_app_info(ret.path, ret.app_name, function(status, result){
        //     if(status != Response.OK){
        //         write_err(status, callback);
        //         return;
        //     }
        // })

        web_model.add_new_resign_info(ret.tag, ret.path, function(status, result){
            if(status != Response.OK){
                write_err(status, callback);
                return;
            }
            
            web_model.update_app_name_on_device_info(ret.udid, ret.app_name, ret.tag, function(status, result){
                if(status != Response.OK){
                    write_err(status, callback);
                    return;
                }
    
                ret.status = Response.OK;
                callback(ret);
            })
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


function create_and_distribution(info, app_name, app_version, callback){
    if(info == null || app_name == null || app_name == "" || app_version == null || app_version == ""){
        callback(Response.INVAILD_PARAMS, null);
        return;
    }

    //進行重簽名，並部署到file server
    log.info("進行重簽名流程 ...");

    web_model.get_valid_account(function(status, result){
        if(status != Response.OK){
            write_err(status, callback);
            return;
        }

        // log.info("result = ", result);

        var ret = {};
        ret.account = result.account;
        ret.cert_name = result.cert_name;
        ret.appid = result.bundle_id;

        ret.model = info.PRODUCT;
        ret.udid = info.UDID;
        ret.version = info.VERSION;

        ret.app_name = app_name;
        ret.app_version = app_version;

        // ret.tag = utils.random_string(32);
        ret.tag = "" + utils.timestamp();

        // ret.path = "itms-services://?action=download-manifest&url=https://apple.bckappgs.info/dev_188/xxxxx/manifest.plist";
        ret.path = APP_DOWNLOAD_SCHEME + PUBLIC_URL + ret.app_name + "/" + ret.tag + "/" + ret.tag + ".plist";

        process.chdir(process.cwd() + "/ios_sign");

        // var sh = "fastlane add_device model:\"%s\" udid:\"%s\" ipa:\"%s\" acc:\"%s\" appid:\"%s\" tag:\"%s\" ";
        // var sh_cmd = util.format(sh, ret.model, ret.udid, ret.app_name, ret.account, ret.appid, ret.tag);

        var sh = "ruby MySpaceship.rb \"%s\" \"%s\" \"%s\" \"%s\" \"%s\" \"%s\" ";
        var sh_cmd = util.format(sh, ret.account, ret.appid, ret.model, ret.udid, ret.app_name, ret.tag);
        log.info(sh_cmd);

        //运行spaceship 脚本
        exec(sh_cmd, function(error, stdout, stderr){
            if(error){
                log.info('error: ' + error);
            }

            if(stderr){
                log.info('stderr: ' + stderr);
            }

            // log.info('stdout: ' + stdout);
        });
        
        //每秒检查provisioning file是否下载完毕
        var sec = 0;
        var timer = setInterval(function(){
            log.info("in setInterval ...", sec);
            sec ++;

            var file_path = process.cwd() + "/" + ret.app_name + "/" + ret.tag + ".mobileprovision";
            fs.access(file_path, fs.constants.F_OK, function(err){
                if(err){
                    log.info("正在對帳號註冊udid並下載描述文件中 ...");
                }else{
                    log.info("已下載完成描述文件，準備重簽名app包 ...");
                    clearInterval(timer);

                    // 執行重簽名並上傳腳本
                    var sh = "sh resign_ipa_new.sh \"%s\" \"%s\" \"%s\" ";
                    var sh_cmd = util.format(sh, ret.app_name, ret.tag, ret.cert_name);
                    log.info(sh_cmd);

                    exec(sh_cmd, function(error, stdout, stderr){
                        if(error){
                            log.info('error: ' + error);
                        }
            
                        if(stderr){
                            log.info('stderr: ' + stderr);
                        }
            
                        // log.info('stdout: ' + stdout);
                    });
                    
                    ready_to_sigh(ret, callback);
                }
            });
        }, 1000);
    });
}

function ready_to_sigh(ret, callback){
    var sec = 0;
    var timer = setInterval(function(){
        log.info("in setInterval ...", sec);
        sec ++;

        var end_resign_path = process.cwd() + "/" + ret.app_name + "/" + ret.tag + ".txt";
        fs.access(end_resign_path, fs.constants.F_OK, function(err){
            if(err){
                log.info("正在重簽名app包 ...");
            }else{
                log.info("app包已重簽名完成，準備進行上傳 ...");
                clearInterval(timer);

                // 動態產生該tag的manifest.plist
                var xml = fs.readFileSync(process.cwd() + "/manifest.plist", "utf8");
                var json = plist.parse(xml);
                // console.log(json.items[0].assets[0].url);
                json.items[0].assets[0].url = PUBLIC_URL + ret.app_name + "/" + ret.tag + "/" + ret.tag + ".ipa";
                var newxml = plist.build(json);
                var plist_path = process.cwd() + "/" + ret.app_name + "/" + ret.tag + ".plist";
                fs.writeFileSync(plist_path, newxml);

                // 刪除end_resign_path
                var sh = "rm -rf \"%s\" ";
                var sh_cmd = util.format(sh, end_resign_path);
                log.info(sh_cmd);
                exec(sh_cmd, function(error, stdout, stderr){
                    if(error){
                        log.info('error: ' + error);
                    }
        
                    if(stderr){
                        log.info('stderr: ' + stderr);
                    }
        
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

function get_exist_and_distribution(ipa_name, callback){
    if(ipa_name == null || ipa_name == ""){
        callback(Response.INVAILD_PARAMS, null);
        return;
    }

    //取得已存在file server的app路徑
    log.info("get_exist_and_distribution ...");

    var ret = {};
    ret.status = Response.OK;
    ret.tag = ipa_name;
    callback(ret);
}

function resign_ipa(dinfo, sha1, callback){
    if(dinfo == null || sha1 == null || sha1 == ""){
        write_err(Response.INVAILD_PARAMS, callback);
        return;
    }

    get_app_name_by_sha1(sha1, function(status, result){
        if(status != Response.OK){
            write_err(status, callback);
            return;
        }
        
        var app_name = result.app_name;
        var app_version = result.version;
        // log.info(app_name, app_version);
        check_uinfo_by_udid(dinfo, app_name, function(status, is_exist, ipa_name){
            if(status != Response.OK){
                write_err(status, callback);
                return;
            }

            if(is_exist){
                get_exist_and_distribution(ipa_name, callback);
            }else{
                create_and_distribution(dinfo, app_name, app_version, callback);
            }
            
        })
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

function update_acc_devices(info, callback){
    if(info == null){
        write_err(Response.INVAILD_PARAMS, callback);
        return;
    }

    web_model.update_device_count_on_account_info(info, function(status, result){
        if(status != Response.OK){
            write_err(status, callback);
            return;
        }

        var ret = {};
        ret.status = Response.OK;
        callback(ret);
    })
}

function resign_ipa_via_api(dinfo, callback){
    if(dinfo == null){
        write_err(Response.INVAILD_PARAMS, callback);
        return;
    }

    get_app_name_by_sha1(dinfo.SHA1, function(status, result){
        if(status != Response.OK){
            write_err(status, callback);
            return;
        }
        
        var app_name = result.app_name;
        var app_version = result.version;
        // log.info(app_name, app_version);
        check_uinfo_by_udid(dinfo, app_name, function(status, is_exist, ipa_name){
            if(status != Response.OK){
                write_err(status, callback);
                return;
            }

            if(is_exist){
                get_exist_and_distribution(ipa_name, callback);
            }else{
                create_and_distribution(dinfo, app_name, app_version, callback);
            }
            
        })
    });
}

module.exports = {
    get_loadxml: get_loadxml,
    resign_ipa: resign_ipa,
    get_downloadApp_url: get_downloadApp_url,
    update_acc_devices: update_acc_devices,

    resign_ipa_via_api: resign_ipa_via_api,
}
