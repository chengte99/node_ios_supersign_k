var mysql_supersign = require("../../database/mysql_supersign");
var Response = require("../Response");
var log = require("../../utils/log");
var redis_center = require("../../database/redis_center");

function get_app_info_by_sha1(sha1, ret_func){
    if(typeof(sha1) != "string" || sha1 == ""){
        ret_func(Response.INVAILD_PARAMS, null);
        return;
    }

    mysql_supersign.get_app_info_by_sha1(sha1, function(status, sql_result){
        if(status != Response.OK){
            ret_func(status, null);
            return;
        }

        if(sql_result.length <= 0){
            ret_func(Response.DB_SEARCH_EMPTY_OF_APP, null);
            return;
        }

        ret_func(Response.OK, sql_result[0]);
    })
}

function get_app_info_by_sitecode(site_code, ret_func){
    if(typeof(site_code) != "number"){
        ret_func(Response.INVAILD_PARAMS, null);
        return;
    }

    mysql_supersign.get_app_info_by_sitecode(site_code, function(status, sql_result){
        if(status != Response.OK){
            ret_func(status, null);
            return;
        }

        if(sql_result.length <= 0){
            ret_func(Response.DB_SEARCH_EMPTY_OF_APP, null);
            return;
        }

        ret_func(Response.OK, sql_result[0]);
    })
}

function get_uinfo_by_udid(udid, serial, model, version, ret_func){
    mysql_supersign.get_uinfo_by_udid(udid, function(status, sql_result){
        if(status != Response.OK){
            ret_func(status, null);
            return;
        }

        if(sql_result.length <= 0){
            mysql_supersign.add_uinfo_by_udid(udid, serial, model, version, function(status, sql_result){
                if(status != Response.OK){
                    ret_func(status, null);
                    return;
                }

                get_uinfo_by_udid(udid, serial, model, version, ret_func);
            });
        }else{
            ret_func(status, sql_result[0]);
        }
    });
}

function get_uinfo_by_id(id, ret_func){
    if(typeof(id) != "number"){
        ret_func(Response.INVAILD_PARAMS, null);
        return;
    }

    mysql_supersign.get_uinfo_by_id(id, function(status, sql_result){
        if(status != Response.OK){
            ret_func(status, null);
            return;
        }

        if(sql_result.length <= 0){
            // log.warn("該id 不在device_info內 ...");
            ret_func(Response.DB_SEARCH_EMPTY, null);
            return;
        }else{
            // log.info("id 在device_info內, 返回結果 ...");
            ret_func(status, sql_result[0]);
        }
    })
}

function get_devices_by_id(id, ret_func){
    if(typeof(id) != "number"){
        ret_func(Response.INVAILD_PARAMS, null);
        return;
    }

    mysql_supersign.get_devices_by_id(id, function(status, sql_result){
        if(status != Response.OK){
            ret_func(status, null);
            return;
        }

        if(sql_result.length <= 0){
            // log.info("no valid account ...");
            ret_func(Response.NO_VALID_ACCOUNT, null);
        }else{
            ret_func(status, sql_result[0]);
        }
    })
}

function get_valid_account(group, ret_func){
    mysql_supersign.get_valid_account(group, function(status, sql_result){
        if(status != Response.OK){
            ret_func(status, null);
            return;
        }

        if(sql_result.length <= 0){
            // log.info("no valid account ...");
            ret_func(Response.NO_VALID_ACCOUNT, null);
        }else{
            ret_func(status, sql_result[0]);
        }
    })
}

// 全域對應表
var global_acc_id_dic = {};

function get_accinfo_success(data, ret_func){
    for(var i = 0; i < data.length; i ++){
        // 將accinfo id&acc 寫入全域對應表
        global_acc_id_dic[data[i].id] = data[i].account;

        // 寫入redis
        redis_center.set_accinfo_inredis(data[i].id, {
            id: data[i].id,
            acc: data[i].account,
            cert: data[i].cert_name,
            bid: data[i].bundle_id,
            devices: data[i].devices,
            enable: data[i].is_enable,
            group: data[i].acc_group,
            expired: data[i].expired,
            days: data[i].days,
            reg: data[i].reg_content,
            err: data[i].err_record,
        });
    }
    
    ret_func(Response.OK, global_acc_id_dic);
}

function get_all_valid_accounts(group, ret_func){
    mysql_supersign.get_all_valid_accounts(group, function(status, sql_result){
        if(status != Response.OK){
            ret_func(status, null);
            return;
        }

        if(sql_result.length <= 0){
            // log.info("no valid account ...");
            ret_func(Response.NO_VALID_ACCOUNT, null);
        }else{
            get_accinfo_success(sql_result, ret_func);
        }
    })
}

function get_max_devices_accounts(group, ret_func){
    var acc_array = [];
    for(var key in global_acc_id_dic){
        var acc_id = parseInt(key);
        log.info("acc_id = ", acc_id);
        redis_center.get_accinfo_inredis(acc_id, function(status, info){
            if(status != Response.OK){
                log.error("無此id = " + acc_id + " 的帳號資訊, get_accinfo_inredis status ...", status);
            }else{
                if(info.devices >= 95 && info.days < 30 && info.enable != 0 && info.group == group){
                    acc_array.push(global_acc_id_dic[key]);
                }
            }
        });
    }
    
    if(acc_array.length > 0){
        ret_func(Response.OK, acc_array);
    }else{
        ret_func(Response.NO_MAX_DEVICES_ACCOUNT, null);
    }

    // mysql_supersign.get_max_devices_accounts(group, function(status, sql_result){
    //     if(status != Response.OK){
    //         ret_func(status, null);
    //         return;
    //     }

    //     if(sql_result.length <= 0){
    //         // log.info("no valid account ...");
    //         ret_func(Response.NO_MAX_DEVICES_ACCOUNT, null);
    //     }else{
    //         ret_func(status, sql_result);
    //     }
    // })
}

function get_info_by_account(acc, ret_func){
    if(typeof(acc) != "string" || acc == ""){
        ret_func(Response.INVAILD_PARAMS, null);
        return;
    }

    mysql_supersign.get_info_by_account(acc, function(status, sql_result){
        if(status != Response.OK){
            ret_func(status, null);
            return;
        }

        if(sql_result.length <= 0){
            ret_func(Response.NO_VALID_ACCOUNT, null);
        }else{
            ret_func(status, sql_result);
        }
    })
}

function update_multi_value_by_id(id, reg_content, count, ret_func){
    if(typeof(id) != "number" || typeof(reg_content) != "string" || reg_content == "" || typeof(count) != "number"){
        ret_func(Response.INVAILD_PARAMS, null);
        return;
    }

    mysql_supersign.update_multi_value_by_id(id, reg_content, count, function(status, sql_result){
        if(status != Response.OK){
            ret_func(status, null);
            return;
        }

        ret_func(status, null);
    })
}

function update_devices_by_id(id, count, ret_func){
    if(typeof(id) != "number" || typeof(count) != "number"){
        ret_func(Response.INVAILD_PARAMS, null);
        return;
    }

    mysql_supersign.update_devices_by_id(id, count, function(status, sql_result){
        if(status != Response.OK){
            ret_func(status, null);
            return;
        }

        ret_func(status, null);
    })
}

function update_jsonstr_by_id_multi(values, ret_func){
    if(typeof(values) != "object"){
        ret_func(Response.INVAILD_PARAMS, null);
        return;
    }

    mysql_supersign.update_jsonstr_by_id_multi(values, function(status, sql_result){
        if(status != Response.OK){
            ret_func(status, null);
            return;
        }

        ret_func(status, null);
    })
}

function clean_sigh_by_udids_multi(udids, ret_func){
    if(typeof(udids) != "object"){
        ret_func(Response.INVAILD_PARAMS, null);
        return;
    }

    mysql_supersign.clean_sigh_by_udids_multi(udids, function(status, sql_result){
        if(status != Response.OK){
            ret_func(status, null);
            return;
        }

        ret_func(status, null);
    })
}

function clear_record_by_sid(serial, ret_func){
    if(typeof(serial) != "string"){
        ret_func(Response.INVAILD_PARAMS, null);
        return;
    }

    mysql_supersign.clear_record_by_sid(serial, function(status, sql_result){
        if(status != Response.OK){
            ret_func(status, null);
            return;
        }

        ret_func(status, null);
    })
}

function get_downloadApp_url(tag, ret_func){
    if(typeof(tag) != "string" || tag == ""){
        ret_func(Response.INVAILD_PARAMS, null);
        return;
    }

    mysql_supersign.get_downloadApp_url(tag, function(status, sql_result){
        if(status != Response.OK){
            ret_func(status, null);
            return;
        }

        if(sql_result.length <= 0){
            ret_func(Response.DB_SEARCH_EMPTY, null);
        }else{
            ret_func(status, sql_result[0]);
        }
    })
}

function update_device_count_on_account_info(acc, devices, ret_func){
    if(typeof(acc) != "string" || acc == "" || typeof(devices) != "number"){
        ret_func(Response.INVAILD_PARAMS, null);
        return;
    }

    var acc_exist = false;

    for(var key in global_acc_id_dic){
        if(global_acc_id_dic[key] == acc){
            acc_exist = true;
            // 更新數據庫
            mysql_supersign.update_device_count_on_account_info(acc, devices, function(status, sql_result){
                if(status != Response.OK){
                    log.warn("update_device_count_on_account_info fail, Response: ", status);
                    ret_func(status, null);
                    return;
                }
            });

            // 更新redis
            var acc_id = parseInt(key);
            redis_center.get_accinfo_inredis(acc_id, function(status, info){
                if(status != Response.OK){
                    log.error("無此id = " + acc_id + " 的帳號資訊, get_accinfo_inredis status ...", status);
                    ret_func(status, null);
                    return;
                }else{
                    info.devices = devices;

                    // 寫回redis
                    redis_center.set_accinfo_inredis(acc_id, info);

                    ret_func(Response.OK, null);
                    return;
                }
            });
        }
    }

    if(!acc_exist){
        ret_func(Response.NO_THIS_ACCOUNT, null);
    }
}

function update_device_count_and_disable_account(acc, devices, ret_func){
    if(typeof(acc) != "string" || acc == "" || typeof(devices) != "number"){
        ret_func(Response.INVAILD_PARAMS, null);
        return;
    }

    var acc_exist = false;

    for(var key in global_acc_id_dic){
        if(global_acc_id_dic[key] == acc){
            acc_exist = true;
            // 更新數據庫
            mysql_supersign.update_device_count_and_disable_account(acc, devices, function(status, sql_result){
                if(status != Response.OK){
                    log.warn("update_device_count_and_disable_account fail, Response: ", status);
                    ret_func(status, null);
                    return;
                }
            });

            // 更新redis
            var acc_id = parseInt(key);
            redis_center.get_accinfo_inredis(acc_id, function(status, info){
                if(status != Response.OK){
                    log.error("無此id = " + acc_id + " 的帳號資訊, get_accinfo_inredis status ...", status);
                    ret_func(status, null);
                    return;
                }else{
                    // 停用
                    info.devices = devices;
                    info.enable = 0;

                    // 寫回redis
                    redis_center.set_accinfo_inredis(acc_id, info);

                    ret_func(Response.OK, null);
                    return;
                }
            });
        }
    }

    if(!acc_exist){
        ret_func(Response.NO_THIS_ACCOUNT, null);
    }
}

function update_all_valid_acc_days(ret_func){
    var id_list = [];
    for(var key in global_acc_id_dic){
        var acc_id = parseInt(key);
        id_list.push(acc_id);
    }

    mysql_supersign.update_days_on_account_info_multi(id_list, function(status, sql_result){
        if(status != Response.OK){
            log.warn("update_days_on_account_info_multi fail, Response: ", status);
            ret_func(status, null);
            return;
        }
    })

    var count = 0;
    for(var key in global_acc_id_dic){
        // 更新redis
        var acc_id = parseInt(key);
        redis_center.get_accinfo_inredis(acc_id, function(status, info){
            if(status != Response.OK){
                log.error("無此id = " + acc_id + " 的帳號資訊, get_accinfo_inredis status ...", status);
                ret_func(status, null);
                return;
            }else{
                // 停用
                info.days += 1;

                // 寫回redis
                redis_center.set_accinfo_inredis(acc_id, info);

                count ++;
                if(count == id_list.length){
                    // 已全數更新完
                    count = 0;
                    ret_func(Response.OK, null);
                }
            }
        });
    }
}

function disable_acc_by_acc(acc, objStr, ret_func){
    if(typeof(acc) != "string" || acc == "" || typeof(objStr) != "string" || objStr == ""){
        ret_func(Response.INVAILD_PARAMS, null);
        return;
    }

    var acc_exist = false;

    for(var key in global_acc_id_dic){
        if(global_acc_id_dic[key] == acc){
            acc_exist = true;
            // 更新數據庫
            mysql_supersign.disable_acc_and_record_err_by_acc(acc, objStr, function(status, sql_result){
                if(status != Response.OK){
                    log.warn("disable_acc_and_record_err_by_acc fail, Response: ", status);
                    ret_func(status, null);
                    return;
                }
            })

            // 更新redis
            var acc_id = parseInt(key);
            redis_center.get_accinfo_inredis(acc_id, function(status, info){
                if(status != Response.OK){
                    log.error("無此id = " + acc_id + " 的帳號資訊, get_accinfo_inredis status ...", status);
                    ret_func(status, null);
                    return;
                }else{
                    // 停用且紀錄原因
                    info.enable = 0;
                    info.err = objStr;

                    // 寫回redis
                    redis_center.set_accinfo_inredis(acc_id, info);

                    ret_func(Response.OK, null);
                    return;
                }
            });
        }
    }

    if(!acc_exist){
        ret_func(Response.NO_THIS_ACCOUNT, null);
    }
}

function add_new_resign_info(tag, path, ret_func){
    if(typeof(tag) != "string" || tag == "" || typeof(path) != "string" || path == ""){
        ret_func(Response.INVAILD_PARAMS, null);
        return;
    }

    mysql_supersign.add_new_resign_info(tag, path, function(status, sql_result){
        if(status != Response.OK){
            ret_func(status, null);
            return;
        }

        ret_func(status, null);
    })
}

function add_new_to_app_info(app_info, ret_func){
    if(typeof(app_info) != "object"){
        ret_func(Response.INVAILD_PARAMS, null);
        return;
    }

    mysql_supersign.add_new_to_app_info(app_info, function(status, sql_result){
        if(status != Response.OK){
            ret_func(status, null);
            return;
        }

        ret_func(status, null);
    });
}

function update_app_to_app_info(app_info, ret_func){
    if(typeof(app_info) != "object"){
        ret_func(Response.INVAILD_PARAMS, null);
        return;
    }

    mysql_supersign.update_app_to_app_info(app_info, function(status, sql_result){
        if(status != Response.OK){
            ret_func(status, null);
            return;
        }

        ret_func(status, null);
    });
}

function update_device_info_by_udid(udid, jsonstr, charge_status, ret_func){
    if(typeof(udid) != "string" || udid == "" || typeof(charge_status) != "number"){
        ret_func(Response.INVAILD_PARAMS, null);
        return;
    }

    if(jsonstr == null){
        mysql_supersign.clean_jsonstr_by_udid(udid, function(status, sql_result){
            if(status != Response.OK){
                ret_func(status, null);
                return;
            }
    
            ret_func(status, null);
        });
    }else{
        mysql_supersign.update_device_info_by_udid(udid, jsonstr, charge_status, function(status, sql_result){
            if(status != Response.OK){
                ret_func(status, null);
                return;
            }
    
            ret_func(status, null);
        });
    }
}

function get_timestamp_valid_by_sid(sid, ret_func){
    if(typeof(sid) != "string" || sid == ""){
        ret_func(Response.INVAILD_PARAMS, null);
        return;
    }

    mysql_supersign.get_timestamp_valid_by_sid(sid, function(status, sql_result){
        if(status != Response.OK){
            ret_func(status, null);
            return;
        }

        if(sql_result.length <= 0){
            ret_func(Response.DB_SEARCH_EMPTY, null);
        }else{
            ret_func(status, sql_result[0]);
        }
    })
}

function update_acc_reg_content(acc_id, device_ids, ret_func){
    if(typeof(acc_id) != "number" || typeof(device_ids) != "object"){
        ret_func(Response.INVAILD_PARAMS, null);
        return;
    }

    mysql_supersign.get_reg_content_by_id(acc_id, function(status, sql_result){
        if(status != Response.OK){
            ret_func(status, null);
            return;
        }

        if(sql_result.length <= 0){
            ret_func(Response.DB_SEARCH_EMPTY, null);
            return;
        }
            
        var reg_content = sql_result[0].reg_content;
        var reg_content_json = JSON.parse(reg_content);
        for(var i = 0; i < device_ids.length; i ++){
            var id = device_ids[i];
            if(reg_content_json.udids.indexOf(id) == -1){
                reg_content_json.udids.push(id);
            }
        }
        var reg_content_str = JSON.stringify(reg_content_json);
        mysql_supersign.update_reg_content_by_id(acc_id, reg_content_str, function(status, sql_result){
            if(status != Response.OK){
                ret_func(status, null);
                return;
            }
    
            ret_func(status, null);
        })
    })
}

module.exports = {
    get_app_info_by_sha1: get_app_info_by_sha1,
    get_app_info_by_sitecode: get_app_info_by_sitecode,
    get_uinfo_by_udid: get_uinfo_by_udid,
    get_devices_by_id: get_devices_by_id,
    get_valid_account: get_valid_account,
    get_info_by_account: get_info_by_account,
    get_all_valid_accounts: get_all_valid_accounts,
    update_devices_by_id: update_devices_by_id,
    update_jsonstr_by_id_multi: update_jsonstr_by_id_multi,
    clean_sigh_by_udids_multi: clean_sigh_by_udids_multi,
    get_downloadApp_url: get_downloadApp_url,
    update_device_count_on_account_info: update_device_count_on_account_info,
    update_device_count_and_disable_account: update_device_count_and_disable_account,
    add_new_resign_info: add_new_resign_info,
    add_new_to_app_info: add_new_to_app_info,
    update_app_to_app_info: update_app_to_app_info,
    update_device_info_by_udid: update_device_info_by_udid,
    get_timestamp_valid_by_sid: get_timestamp_valid_by_sid,
    get_uinfo_by_id: get_uinfo_by_id,
    get_max_devices_accounts: get_max_devices_accounts,
    update_all_valid_acc_days: update_all_valid_acc_days,
    update_multi_value_by_id: update_multi_value_by_id,
    disable_acc_by_acc: disable_acc_by_acc,
    clear_record_by_sid: clear_record_by_sid,
    update_acc_reg_content: update_acc_reg_content,
}