var mysql_supersign = require("../../database/mysql_supersign");
var Response = require("../Response");
var log = require("../../utils/log");

function get_app_name(sha1, ret_func){
    mysql_supersign.get_app_name_by_sha1(sha1, function(status, sql_result){
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

function get_uinfo(info, app_name, ret_func){
    mysql_supersign.get_uinfo_by_udid(info.UDID, function(status, sql_result){
        if(status != Response.OK){
            ret_func(status, null);
            return;
        }

        if(sql_result.length <= 0){
            log.info("udid empty, need create ...")
            mysql_supersign.add_uinfo_by_udid(info, function(status, sql_result){
                if(status != Response.OK){
                    ret_func(status, null);
                    return;
                }

                get_uinfo(info, app_name, ret_func);
            });
        }else{
            log.info("udid exist, return result ...")
            ret_func(status, sql_result[0]);
        }
    });
}

function get_valid_account(ret_func){
    mysql_supersign.get_valid_accounts_by_devices(function(status, sql_result){
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

function update_device_count_on_account_info(account, ret_func){
    mysql_supersign.update_device_count_on_account_info(account, function(status, sql_result){
        if(status != Response.OK){
            ret_func(status, null);
            return;
        }

        ret_func(status, null);
    })
}

function update_path_on_app_info(path, app_name, ret_func){
    mysql_supersign.update_path_on_app_info(path, app_name, function(status, sql_result){
        if(status != Response.OK){
            ret_func(status, null);
            return;
        }

        ret_func(status, null);
    })
}

function update_app_name_on_device_info(udid, app_name, ret_func){
    mysql_supersign.update_app_name_on_device_info(udid, app_name, function(status, sql_result){
        if(status != Response.OK){
            ret_func(status, null);
            return;
        }

        ret_func(status, null);
    })
}

function get_downloadApp_url(taskid, ret_func){
    mysql_supersign.get_downloadApp_url(taskid, function(status, sql_result){
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
    get_app_name: get_app_name,
    get_uinfo: get_uinfo,
    get_valid_account: get_valid_account,
    update_device_count_on_account_info: update_device_count_on_account_info,
    update_path_on_app_info: update_path_on_app_info,
    update_app_name_on_device_info: update_app_name_on_device_info,
    get_downloadApp_url: get_downloadApp_url,
}