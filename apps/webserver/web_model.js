var mysql_supersign = require("../../database/mysql_supersign");
var Response = require("../Response");
var log = require("../../utils/log");

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
            ret_func(Response.DB_SEARCH_EMPTY, null);
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
            ret_func(Response.DB_SEARCH_EMPTY, null);
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

function get_valid_account(ret_func){
    mysql_supersign.get_valid_account(function(status, sql_result){
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

function get_all_valid_accounts(ret_func){
    mysql_supersign.get_all_valid_accounts(function(status, sql_result){
        if(status != Response.OK){
            ret_func(status, null);
            return;
        }

        if(sql_result.length <= 0){
            // log.info("no valid account ...");
            ret_func(Response.NO_VALID_ACCOUNT, null);
        }else{
            ret_func(status, sql_result);
        }
    })
}

function get_max_devices_accounts(ret_func){
    mysql_supersign.get_max_devices_accounts(function(status, sql_result){
        if(status != Response.OK){
            ret_func(status, null);
            return;
        }

        if(sql_result.length <= 0){
            // log.info("no valid account ...");
            ret_func(Response.NO_MAX_DEVICES_ACCOUNT, null);
        }else{
            ret_func(status, sql_result);
        }
    })
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

    mysql_supersign.update_device_count_on_account_info(acc, devices, function(status, sql_result){
        if(status != Response.OK){
            ret_func(status, null);
            return;
        }

        ret_func(status, null);
    })
}

function update_days_on_account_info(acc, ret_func){
    if(typeof(acc) != "string" || acc == ""){
        ret_func(Response.INVAILD_PARAMS, null);
        return;
    }

    mysql_supersign.update_days_on_account_info(acc, function(status, sql_result){
        if(status != Response.OK){
            ret_func(status, null);
            return;
        }

        ret_func(status, null);
    })
}

function disable_acc_by_acc(acc, objStr, ret_func){
    if(typeof(acc) != "string" || acc == "" || typeof(objStr) != "string" || objStr == ""){
        ret_func(Response.INVAILD_PARAMS, null);
        return;
    }

    mysql_supersign.disable_acc_and_record_err_by_acc(acc, objStr, function(status, sql_result){
        if(status != Response.OK){
            ret_func(status, null);
            return;
        }

        ret_func(status, null);
    })
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

function update_device_info_by_udid(udid, jsonstr, time_valid, need_update_time, ret_func){
    if(typeof(udid) != "string" || udid == "" || typeof(time_valid) != "number" || typeof(need_update_time) != "boolean"){
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
        mysql_supersign.update_device_info_by_udid(udid, jsonstr, time_valid, need_update_time, function(status, sql_result){
            if(status != Response.OK){
                ret_func(status, null);
                return;
            }
    
            ret_func(status, null);
        });
    }
}

function get_timestamp_valid_by_udid(udid, ret_func){
    if(typeof(udid) != "string" || udid == ""){
        ret_func(Response.INVAILD_PARAMS, null);
        return;
    }

    mysql_supersign.get_timestamp_valid_by_udid(udid, function(status, sql_result){
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
    add_new_resign_info: add_new_resign_info,
    add_new_to_app_info: add_new_to_app_info,
    update_app_to_app_info: update_app_to_app_info,
    update_device_info_by_udid: update_device_info_by_udid,
    get_timestamp_valid_by_udid: get_timestamp_valid_by_udid,
    get_uinfo_by_id: get_uinfo_by_id,
    get_max_devices_accounts: get_max_devices_accounts,
    update_days_on_account_info: update_days_on_account_info,
    update_multi_value_by_id: update_multi_value_by_id,
    disable_acc_by_acc: disable_acc_by_acc,
}