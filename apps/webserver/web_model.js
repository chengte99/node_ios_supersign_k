var mysql_supersign = require("../../database/mysql_supersign");
var Response = require("../Response");
var log = require("../../utils/log");
var redis_center = require("../../database/redis_center");
var server_config = require("../server_config");
var local_mac_config = server_config.local_mac_config;

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

    for(var key in global_acc_id_dic){
        if(parseInt(key) == id){
            var acc_id = parseInt(key);
            redis_center.get_accinfo_inredis(acc_id, function(status, info){
                if(status != Response.OK){
                    log.error("無此id = " + acc_id + " 的帳號資訊, get_accinfo_inredis status ...", status);
                    ret_func(status, null);
                    return;
                }
                
                ret_func(Response.OK, info.devices);
            });
        }
    }
}

function balance_switch(group, times, ret_func){
    var acc_id = global_acc_id_array[global_acc_id_array_index];
    global_acc_id_array_index ++;
    // index等於帳號列表長度時歸零
    if(global_acc_id_array_index == global_acc_id_array.length){
        global_acc_id_array_index = 0;
    }

    redis_center.get_accinfo_inredis(acc_id, function(status, info){
        if(status != Response.OK){
            log.error("無此id = " + acc_id + " 的帳號資訊, get_accinfo_inredis status ...", status);
            ret_func(status, null);
            return;
        }

        if(info.devices < 95 && info.days < 30 && info.is_enable != 0 && info.acc_group == group){
            ret_func(Response.OK, info);
            return;
        }else{
            log.warn("不符合可用帳號條件, 獲取是否有下個帳號 ...");
            times ++;
            log.warn("times = ", times);
            if(times == global_acc_id_array.length){
                times = 0;
                ret_func(Response.NO_VALID_ACCOUNT, null);
                return;
            }

            balance_switch(group, times, ret_func);
        }
    });
}

function get_valid_account(group, ret_func){
    if(group != 2 && local_mac_config.balance_switch_acc == true){
        // balance_switch_acc = true時, group固定寫1（正常群組）
        balance_switch(1, 0, function(status, info){
            if(status != Response.OK){
                ret_func(status, null);
                return;
            }else{
                ret_func(Response.OK, info);
            }
        });
    }else{
        // balance_switch_acc = false時
        var count = 0;

        for(var key in global_acc_id_dic){
            var acc_id = parseInt(key);
            redis_center.get_accinfo_inredis(acc_id, function(status, info){
                if(status != Response.OK){
                    log.error("無此id = " + acc_id + " 的帳號資訊, get_accinfo_inredis status ...", status);
                    ret_func(status, null);
                    return;
                }

                count ++;
                if(info.devices < 95 && info.days < 30 && info.is_enable != 0){
                    ret_func(Response.OK, info);
                    return;
                }else{
                    log.warn("不符合可用帳號條件, 獲取是否有下個帳號 ...");
                    if(count == global_acc_id_array.length - 1){
                        count = 0;
                        ret_func(Response.NO_VALID_ACCOUNT, null);
                    }
                }
            });
        }
    }
}

// 全域對應表
var global_acc_id_dic = {};
var global_acc_id_array = [];
var global_acc_id_array_index = 0;

function get_accinfo_success(data, ret_func){
    for(var i = 0; i < data.length; i ++){
        // 將accinfo id&acc 寫入全域對應表
        global_acc_id_dic[data[i].id] = data[i].account;
        // 將acc_id依序寫入陣列
        global_acc_id_array.push(data[i].id);

        // 寫入redis
        redis_center.set_accinfo_inredis(data[i].id, {
            id: data[i].id,
            account: data[i].account,
            cert_name: data[i].cert_name,
            bundle_id: data[i].bundle_id,
            devices: data[i].devices,
            is_enable: data[i].is_enable,
            m_code: data[i].m_code,
            acc_group: data[i].acc_group,
            expired: data[i].expired,
            days: data[i].days,
            reg_content: data[i].reg_content,
            err_record: data[i].err_record,
        });
    }
    
    ret_func(Response.OK, global_acc_id_dic);
}

function get_all_valid_accounts(m_code, ret_func){
    mysql_supersign.get_all_valid_accounts(m_code, function(status, sql_result){
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

function get_max_devices_accounts(ret_func){
    var acc_array = [];
    var count = 0;
    for(var key in global_acc_id_dic){
        var acc_id = parseInt(key);
        // log.info("acc_id = ", acc_id);
        redis_center.get_accinfo_inredis(acc_id, function(status, info){
            if(status != Response.OK){
                log.error("無此id = " + acc_id + " 的帳號資訊, get_accinfo_inredis status ...", status);
                ret_func(status, null);
                return;
            }

            // 紀錄成功獲取redis的次數
            count ++;
            if(info.devices >= 95 && info.days < 30 && info.is_enable != 0){
                acc_array.push(info.account);                
            }
            
            if(count == global_acc_id_array.length - 1){
                count = 0;
                if(acc_array.length > 0){
                    ret_func(Response.OK, acc_array);
                }else{
                    ret_func(Response.NO_MAX_DEVICES_ACCOUNT, null);
                }
            }
        });
    }
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
    
    for(var key in global_acc_id_dic){
        if(parseInt(key) == id){
            // 更新redis
            redis_center.get_accinfo_inredis(id, function(status, info){
                if(status != Response.OK){
                    log.error("無此id = " + id + " 的帳號資訊, get_accinfo_inredis status ...", status);
                    ret_func(status, null);
                    return;
                }

                info.devices += count;

                // 寫回redis
                redis_center.set_accinfo_inredis(info.id, info);
            });

            // 更新數據庫
            mysql_supersign.update_devices_by_id(id, count, function(status, sql_result){
                if(status != Response.OK){
                    log.warn("update_devices_by_id fail, Response: ", status);
                    ret_func(status, null);
                    return;
                }

                ret_func(Response.OK, null);
            });
        }
    }
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

    for(var key in global_acc_id_dic){
        if(global_acc_id_dic[key] == acc){
            // 更新redis
            var acc_id = parseInt(key);
            redis_center.get_accinfo_inredis(acc_id, function(status, info){
                if(status != Response.OK){
                    log.error("無此id = " + acc_id + " 的帳號資訊, get_accinfo_inredis status ...", status);
                    ret_func(status, null);
                    return;
                }

                info.devices = devices;

                // 寫回redis
                redis_center.set_accinfo_inredis(info.id, info);
            });

            // 更新數據庫
            mysql_supersign.update_device_count_on_account_info(acc, devices, function(status, sql_result){
                if(status != Response.OK){
                    log.warn("update_device_count_on_account_info fail, Response: ", status);
                    ret_func(status, null);
                    return;
                }

                ret_func(Response.OK, null);
            });
        }
    }
}

function update_device_count_and_disable_account(acc, devices, ret_func){
    if(typeof(acc) != "string" || acc == "" || typeof(devices) != "number"){
        ret_func(Response.INVAILD_PARAMS, null);
        return;
    }

    for(var key in global_acc_id_dic){
        if(global_acc_id_dic[key] == acc){
            // 更新redis
            var acc_id = parseInt(key);
            redis_center.get_accinfo_inredis(acc_id, function(status, info){
                if(status != Response.OK){
                    log.error("無此id = " + acc_id + " 的帳號資訊, get_accinfo_inredis status ...", status);
                    ret_func(status, null);
                    return;
                }

                // 停用
                info.devices = devices;
                info.is_enable = 0;

                // 寫回redis
                redis_center.set_accinfo_inredis(info.id, info);
            });

            // 更新數據庫
            mysql_supersign.update_device_count_and_disable_account(acc, devices, function(status, sql_result){
                if(status != Response.OK){
                    log.warn("update_device_count_and_disable_account fail, Response: ", status);
                    ret_func(status, null);
                    return;
                }

                ret_func(Response.OK, null);
            });
        }
    }
}

function update_all_valid_acc_days(ret_func){
    var acc_id_array = [];
    var count = 0;
    for(var key in global_acc_id_dic){
        // 更新redis
        var acc_id = parseInt(key);
        redis_center.get_accinfo_inredis(acc_id, function(status, info){
            if(status != Response.OK){
                log.error("無此id = " + acc_id + " 的帳號資訊, get_accinfo_inredis status ...", status);
                ret_func(status, null);
                return;
            }

            // 紀錄成功獲取redis的次數
            count ++;

            if(info.devices < 95 && info.days < 30 && info.is_enable != 0){
                info.days += 1;

                // 寫回redis
                redis_center.set_accinfo_inredis(info.id, info);

                // acc_id_array 加入要更新天數的acc_id
                acc_id_array.push(info.id);
            }

            if(count == global_acc_id_array.length - 1){
                count = 0;
                // 已全數更新完redis，準備更新mysql
                if(acc_id_array.length > 0){
                    mysql_supersign.update_days_on_account_info_multi(acc_id_array, function(status, sql_result){
                        if(status != Response.OK){
                            log.warn("update_days_on_account_info_multi fail, Response: ", status);
                            ret_func(status, null);
                            return;
                        }

                        // 成功更新完mysql
                        ret_func(Response.OK, null);
                    })
                }else{
                    ret_func(Response.NO_VALID_ACCOUNT, null);
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

    for(var key in global_acc_id_dic){
        if(global_acc_id_dic[key] == acc){
            // 更新redis
            var acc_id = parseInt(key);
            redis_center.get_accinfo_inredis(acc_id, function(status, info){
                if(status != Response.OK){
                    log.error("無此id = " + acc_id + " 的帳號資訊, get_accinfo_inredis status ...", status);
                    ret_func(status, null);
                    return;
                }

                // 停用且紀錄原因
                info.is_enable = 0;
                info.err_record = objStr;

                // 寫回redis
                redis_center.set_accinfo_inredis(info.id, info);
            });

            // 更新數據庫
            mysql_supersign.disable_acc_and_record_err_by_acc(acc, objStr, function(status, sql_result){
                if(status != Response.OK){
                    log.warn("disable_acc_and_record_err_by_acc fail, Response: ", status);
                    ret_func(status, null);
                    return;
                }

                ret_func(Response.OK, null);
            });
        }
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

function update_acc_reg_content(id, device_ids, ret_func){
    if(typeof(id) != "number" || typeof(device_ids) != "object"){
        ret_func(Response.INVAILD_PARAMS, null);
        return;
    }
    
    for(var key in global_acc_id_dic){
        if(parseInt(key) == id){
            var acc_id = parseInt(key);
            // 更新redis
            redis_center.get_accinfo_inredis(acc_id, function(status, info){
                if(status != Response.OK){
                    log.error("無此id = " + acc_id + " 的帳號資訊, get_accinfo_inredis status ...", status);
                    ret_func(status, null);
                    return;
                }

                var reg_content = info.reg_content;
                var reg_content_json = JSON.parse(reg_content);
                for(var i = 0; i < device_ids.length; i ++){
                    var did = device_ids[i];
                    if(reg_content_json.udids.indexOf(did) == -1){
                        reg_content_json.udids.push(did);
                    }
                }
                var reg_content_str = JSON.stringify(reg_content_json);

                // 更新reg_content欄位
                info.reg_content = reg_content_str;

                // 更新redis
                redis_center.set_accinfo_inredis(info.id, info);

                // 更新數據庫
                mysql_supersign.update_reg_content_by_id(info.id, reg_content_str, function(status, sql_result){
                    if(status != Response.OK){
                        log.warn("update_reg_content_by_id fail, Response: ", status);
                        ret_func(status, null);
                        return;
                    }

                    ret_func(Response.OK, null);
                });
            });
        }
    }
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