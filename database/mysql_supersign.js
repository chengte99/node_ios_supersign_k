var mysql = require("mysql");
var util = require("util");

var Response = require("../apps/Response");
var log = require("../utils/log");

var conn_pool = null;
function connect_to_server(host, port, db_name, user, password){
    conn_pool = mysql.createPool({
        host: host,
        port: port,
        database: db_name,
        user: user,
        password: password
    });
}

function mysql_exec(sql, callback) {
	conn_pool.getConnection(function(err, conn) {
		if (err) {
			if(callback) {
				callback(err, null, null);
			}
			return;
        }
        
		conn.query(sql, function(sql_err, sql_result, fields_desic) {
            conn.release();

			if (sql_err) {
				if (callback) {
					callback(sql_err, null, null);
				}
				return;
            }
            
			if (callback) {
				callback(null, sql_result, fields_desic);
			}
		});
	});
}

function get_app_info_by_sha1(sha1, callback){
    var sql = "select * from app_info where sha1_name = \"%s\"";
    var sql_cmd = util.format(sql, sha1);
    log.info(sql_cmd);
    mysql_exec(sql_cmd, function(sql_err, sql_result, field_desc){
        if(sql_err){
            callback(Response.SYS_ERROR, null);
            return;
        }
        callback(Response.OK, sql_result);
    });
}

function get_app_info_by_sitecode(site_code, callback){
    var sql = "select * from app_info where site_code = %d";
    var sql_cmd = util.format(sql, site_code);
    log.info(sql_cmd);
    mysql_exec(sql_cmd, function(sql_err, sql_result, field_desc){
        if(sql_err){
            callback(Response.SYS_ERROR, null);
            return;
        }
        callback(Response.OK, sql_result);
    });
}

function get_uinfo_by_udid(udid, callback){
    var sql = "select * from device_info where udid = \"%s\"";
    var sql_cmd = util.format(sql, udid);
    log.info(sql_cmd);
    mysql_exec(sql_cmd, function(sql_err, sql_result, field_desc){
        if(sql_err){
            callback(Response.SYS_ERROR, null);
            return;
        }

        callback(Response.OK, sql_result);
    })
}

function get_uinfo_by_id(id, callback){
    var sql = "select * from device_info where id = %d";
    var sql_cmd = util.format(sql, id);
    log.info(sql_cmd);
    mysql_exec(sql_cmd, function(sql_err, sql_result, field_desc){
        if(sql_err){
            callback(Response.SYS_ERROR, null);
            return;
        }

        callback(Response.OK, sql_result);
    })
}

function add_uinfo_by_udid(udid, serial, model, version, callback){
    var sql = "insert into device_info (`model`, `udid`, `serial`, `version`) values (\"%s\", \"%s\", \"%s\", \"%s\")";
    var sql_cmd = util.format(sql, model, udid, serial, version);
    log.info(sql_cmd);
    mysql_exec(sql_cmd, function(sql_err, sql_result, field_desc){
        if(sql_err){
            callback(Response.SYS_ERROR, null);
            return;
        }

        callback(Response.OK, null);
    })
}

function get_valid_account(callback){
    var sql_cmd = "select * from account_info where devices < 99 and days < 30 and is_enable != 0 limit 1";
    // var sql_cmd = util.format(sql, udid);
    log.info(sql_cmd);
    mysql_exec(sql_cmd, function(sql_err, sql_result, field_desc){
        if(sql_err){
            callback(Response.SYS_ERROR, null);
            return;
        }

        callback(Response.OK, sql_result);
    })
}

function get_all_valid_accounts(callback){
    var sql_cmd = "select * from account_info where devices < 99 and days < 30 and is_enable != 0";
    // var sql_cmd = util.format(sql, udid);
    log.info(sql_cmd);
    mysql_exec(sql_cmd, function(sql_err, sql_result, field_desc){
        if(sql_err){
            callback(Response.SYS_ERROR, null);
            return;
        }

        callback(Response.OK, sql_result);
    })
}

function get_max_devices_accounts(callback){
    var sql_cmd = "select account from account_info where devices >= 99 and days < 30 and is_enable != 0";
    // var sql_cmd = util.format(sql, udid);
    log.info(sql_cmd);
    mysql_exec(sql_cmd, function(sql_err, sql_result, field_desc){
        if(sql_err){
            callback(Response.SYS_ERROR, null);
            return;
        }

        callback(Response.OK, sql_result);
    })
}

function add_device_count_on_account_info(account, reg_count, callback){
    var sql = "update account_info set devices = devices+%d where account = \"%s\"";
    var sql_cmd = util.format(sql, reg_count, account);
    log.info(sql_cmd);
    mysql_exec(sql_cmd, function(sql_err, sql_result, field_desc){
        if(sql_err){
            callback(Response.SYS_ERROR, null);
            return;
        }

        callback(Response.OK, null);
    })
}

function clear_appinfo_on_device_info(udid, callback){
    var sql = "update device_info set jsonstr = \"''\", time_valid = 0 where udid = \"%s\"";
    var sql_cmd = util.format(sql, udid);
    log.info(sql_cmd);
    mysql_exec(sql_cmd, function(sql_err, sql_result, field_desc){
        if(sql_err){
            callback(Response.SYS_ERROR, null);
            return;
        }

        callback(Response.OK, null);
    })
}

function get_downloadApp_url(tag, callback){
    var sql = "select download_path from resign_ipa_info where ipa_name = \"%s\"";
    var sql_cmd = util.format(sql, tag);
    log.info(sql_cmd);
    mysql_exec(sql_cmd, function(sql_err, sql_result, field_desc){
        if(sql_err){
            callback(Response.SYS_ERROR, null);
            return;
        }

        callback(Response.OK, sql_result);
    })
}

function update_device_count_on_account_info(acc, devices, callback){
    var sql = "update account_info set devices = %d where account = \"%s\"";
    var sql_cmd = util.format(sql, devices, acc);
    log.info(sql_cmd);
    mysql_exec(sql_cmd, function(sql_err, sql_result, field_desc){
        if(sql_err){
            callback(Response.SYS_ERROR, null);
            return;
        }

        callback(Response.OK, null);
    })
}

function update_days_on_account_info(acc, callback){
    var sql = "update account_info set days = days+1 where account = \"%s\"";
    var sql_cmd = util.format(sql, acc);
    log.info(sql_cmd);
    mysql_exec(sql_cmd, function(sql_err, sql_result, field_desc){
        if(sql_err){
            callback(Response.SYS_ERROR, null);
            return;
        }

        callback(Response.OK, null);
    })
}

function add_new_resign_info(tag, path, callback){
    var sql = "insert into resign_ipa_info (`ipa_name`, `download_path`) values (\"%s\", \"%s\")";
    var sql_cmd = util.format(sql, tag, path);
    log.info(sql_cmd);
    mysql_exec(sql_cmd, function(sql_err, sql_result, field_desc){
        if(sql_err){
            callback(Response.SYS_ERROR, null);
            return;
        }

        callback(Response.OK, null);
    })
}

function add_new_to_app_info(info, callback){
    var sql = "insert into app_info (`app_name`, `app_desc`, `version`, `sha1_name`, `md5_name`, `site_code`) values (\"%s\", \"%s\", \"%s\", \"%s\", \"%s\", %d)";
    var sql_cmd = util.format(sql, info.app_name, info.app_desc, info.ver, info.sha1, info.md5, info.site_code);
    log.info(sql_cmd);
    mysql_exec(sql_cmd, function(sql_err, sql_result, field_desc){
        if(sql_err){
            callback(Response.SYS_ERROR, null);
            return;
        }

        callback(Response.OK, null);
    })
}

function update_app_to_app_info(info, callback){
    var sql = "update app_info set app_name = \"%s\", app_desc = \"%s\", version = \"%s\", sha1_name = \"%s\", md5_name = \"%s\" where site_code = %d ";
    var sql_cmd = util.format(sql, info.app_name, info.app_desc, info.ver, info.sha1, info.md5, info.site_code);
    log.info(sql_cmd);
    mysql_exec(sql_cmd, function(sql_err, sql_result, field_desc){
        if(sql_err){
            callback(Response.SYS_ERROR, null);
            return;
        }

        callback(Response.OK, null);
    })
}

function update_device_info_by_udid(udid, jsonstr, time_valid, need_update_time, callback){
    var sql, sql_cmd;
    if(need_update_time){
        sql = "update device_info set jsonstr = \'%s\', time_valid = %d where udid = \"%s\" ";
        sql_cmd = util.format(sql, jsonstr, time_valid, udid);
    }else{
        sql = "update device_info set jsonstr = \'%s\' where udid = \"%s\" ";
        sql_cmd = util.format(sql, jsonstr, udid);
    }
    log.info(sql_cmd);

    mysql_exec(sql_cmd, function(sql_err, sql_result, field_desc){
        if(sql_err){
            callback(Response.SYS_ERROR, null);
            return;
        }
    })

    callback(Response.OK, null);
}

function get_timestamp_valid_by_udid(udid, callback){
    var sql = "select time_valid from device_info where udid = \"%s\"";
    var sql_cmd = util.format(sql, udid);
    log.info(sql_cmd);
    mysql_exec(sql_cmd, function(sql_err, sql_result, field_desc){
        if(sql_err){
            callback(Response.SYS_ERROR, null);
            return;
        }

        callback(Response.OK, sql_result);
    })
}

module.exports = {
    connect: connect_to_server,
    get_app_info_by_sha1: get_app_info_by_sha1,
    get_app_info_by_sitecode: get_app_info_by_sitecode,
    get_uinfo_by_udid: get_uinfo_by_udid,
    add_uinfo_by_udid: add_uinfo_by_udid,
    get_valid_account: get_valid_account,
    get_all_valid_accounts: get_all_valid_accounts,
    add_device_count_on_account_info: add_device_count_on_account_info,
    clear_appinfo_on_device_info: clear_appinfo_on_device_info,
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
}