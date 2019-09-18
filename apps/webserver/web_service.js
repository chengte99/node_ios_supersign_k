var fs = require("fs");
var exec = require("child_process").exec;
var util = require("util");

var Response = require("../Response");
var log = require("../../utils/log");
var web_model = require("./web_model");
var utils = require("../../utils/utils");

var APP_DOWNLOAD_SCHEME = "itms-services://?action=download-manifest&url="
var PUBLIC_URL = "https://apple.bckappgs.info"

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

        if(app_name == result.app_name){
            //與前次分發ipa相同，不需重簽名直接分發
            // log.info("app_name == result.app_name");
            callback(Response.OK, true);
        }else{
            //與前次分發ipa不同，需重簽名該ipa並分發
            // log.info("app_name != result.app_name", result.app_name);
            callback(Response.OK, false);
        }
    });
}

function update_all_info(ret, callback){
    if(ret == null){
        write_err(Response.INVAILD_PARAMS, callback);
        return;
    }

    // log.info(ret);
    process.chdir(process.cwd() + "/../");

    web_model.update_device_count_on_account_info(ret.account, function(status, result){
        if(status != Response.OK){
            write_err(status, callback);
            return;
        }

        web_model.update_path_on_app_info(ret.path, ret.app_name, function(status, result){
            if(status != Response.OK){
                write_err(status, callback);
                return;
            }

            web_model.update_app_name_on_device_info(ret.udid, ret.app_name, function(status, result){
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

var global_list = {}
var global_list_fid_key = 1;
global_list[1] = [];

function check_uploading_is_ok(fid, callback){
    var target_list = global_list[fid];
    if(target_list.length <= 0){
        callback(true);
        return;
    }

    for(var i = 0; i < target_list.length; i ++){
        // log.info(target_list);
        var tag = target_list[i];
        // log.info(tag);
        if(fs.existsSync(tag)){
            log.info("fs.exist ...");
            //上传中
            callback(false);
            return;
        }else{
            log.info("fs isn't exist ...");
            //已上传，删除该tag
            target_list[i] = null;
            delete target_list[i];
        }
    }

    //全数上传完
    log.info("all upload success ...");
    callback(true);
}


function create_and_distribution(info, app_name, app_version, app_taskid, app_fid, callback){
    if(info == null || app_name == null || app_name == "" || app_version == null || app_version == "" 
    || app_taskid == null || app_taskid == "" || app_fid == null){
        callback(Response.INVAILD_PARAMS, null);
        return;
    }

    //進行重簽名，並部署到file server
    log.info("create_and_distribution ...");

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
        ret.app_taskid = app_taskid;
        ret.app_fid = app_fid;

        ret.tag = utils.random_string(32);

        // ret.path = "itms-services://?action=download-manifest&url=https://apple.bckappgs.info/dev_188/devsport_ios/1.6.02/manifest.plist";
        ret.path = APP_DOWNLOAD_SCHEME + PUBLIC_URL + "/" + ret.app_name + "/devsport_ios/" + ret.app_version + "/manifest.plist";

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
            if(fs.existsSync(file_path)){
                log.info("Detect provisioning file ...");
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

                //将正在编译与上传的tag 记录
                global_list[ret.app_fid].push(file_path);

                update_all_info(ret, callback);
            }
        }, 1000);

    });
}

function get_exist_and_distribution(app_taskid, app_fid, callback){
    if(app_taskid == null || app_taskid == "" || app_fid == null){
        callback(Response.INVAILD_PARAMS, null);
        return;
    }

    //取得已存在file server的app路徑
    log.info("get_exist_and_distribution ...");

    var ret = {};
    ret.status = Response.OK;
    ret.app_fid = app_fid;
    ret.app_taskid = app_taskid;
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
        var app_taskid = result.taskid;
        var app_fid = result.fid;
        // log.info(app_name, app_version);
        check_uinfo_by_udid(dinfo, app_name, function(status, is_same){
            if(status != Response.OK){
                write_err(status, callback);
                return;
            }

            if(is_same){
                get_exist_and_distribution(app_taskid, app_fid, callback);
            }else{
                create_and_distribution(dinfo, app_name, app_version, app_taskid, app_fid, callback);
            }
            
        })
    });
}

function get_downloadApp_url(taskid, fid, callback){
    if(taskid == null || taskid == "" || fid == null || fid == ""){
        write_err(Response.INVAILD_PARAMS, callback);
        return;
    }

    check_uploading_is_ok(fid, function(is_ok){
        if(!is_ok){
            write_err(Response.STILL_UPLOAD, callback);
            return;
        }

        web_model.get_downloadApp_url(taskid, function(status, result){
            if(status != Response.OK){
                write_err(status, callback);
                return;
            }
    
            var ret = {};
            ret.status = Response.OK;
            ret.url = result.resign_path;
            callback(ret);
        })
    })
}

module.exports = {
    get_loadxml: get_loadxml,
    resign_ipa: resign_ipa,
    get_downloadApp_url: get_downloadApp_url,
}
