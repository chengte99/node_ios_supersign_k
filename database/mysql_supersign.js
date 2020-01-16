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
        password: password,
        multipleStatements: true
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

function get_info_by_account(acc, callback){
    var sql = "select * from account_info where account = \"%s\" ";
    var sql_cmd = util.format(sql, acc);
    log.info(sql_cmd);
    mysql_exec(sql_cmd, function(sql_err, sql_result, field_desc){
        if(sql_err){
            callback(Response.SYS_ERROR, null);
            return;
        }

        callback(Response.OK, sql_result);
    })
}

function get_devices_by_id(id, callback){
    var sql = "select devices from account_info where id = %d";
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

function get_reg_content_by_id(id, callback){
    var sql = "select reg_content from account_info where id = %d";
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

function update_reg_content_by_id(id, reg_content, callback){
    var sql = "update account_info set reg_content = \'%s\' where id = %d ";
    var sql_cmd = util.format(sql, reg_content, id);
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
    var sql_cmd = "select * from account_info where devices < 95 and days < 30 and is_enable != 0 limit 1";
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
    var sql_cmd = "select * from account_info where devices < 95 and days < 30 and is_enable != 0";
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
    var sql_cmd = "select account from account_info where devices >= 95 and days < 30 and is_enable != 0";
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

function update_multi_value_by_id(id, reg_content, count, callback){
    var sql = "update account_info set reg_content = \'%s\', devices = devices+%d where id = %d ";
    var sql_cmd = util.format(sql, reg_content, count, id);
    log.info(sql_cmd);
    mysql_exec(sql_cmd, function(sql_err, sql_result, field_desc){
        if(sql_err){
            callback(Response.SYS_ERROR, null);
            return;
        }

        callback(Response.OK, null);
    })
}

function update_devices_by_id(id, count, callback){
    var sql = "update account_info set devices = devices+%d where id = %d ";
    var sql_cmd = util.format(sql, count, id);
    log.info(sql_cmd);
    mysql_exec(sql_cmd, function(sql_err, sql_result, field_desc){
        if(sql_err){
            callback(Response.SYS_ERROR, null);
            return;
        }

        callback(Response.OK, null);
    })
}

function update_jsonstr_by_id_multi(values, callback){
    var sql_cmd = "";
    values.forEach(function (item) {
        sql_cmd += mysql.format("UPDATE device_info SET jsonstr = NULL, time_valid = 0 WHERE id = ?; ", item);
    });
    
    log.info(sql_cmd);
    mysql_exec(sql_cmd, function(sql_err, sql_result, field_desc){
        if(sql_err){
            callback(Response.SYS_ERROR, null);
            return;
        }

        callback(Response.OK, null);
    })
}

function clean_sigh_by_udids_multi(udids, callback){
    var sql_cmd = "";
    udids.forEach(function (item) {
        sql_cmd += mysql.format("UPDATE device_info SET jsonstr = NULL, time_valid = 0 WHERE udid = ?; ", item);
    });
    
    log.info(sql_cmd);
    mysql_exec(sql_cmd, function(sql_err, sql_result, field_desc){
        if(sql_err){
            callback(Response.SYS_ERROR, null);
            return;
        }

        callback(Response.OK, null);
    });
}

function clear_record_by_sid(serial, callback){
    var sql = "update device_info set jsonstr = NULL, time_valid = 0 where serial = \"%s\" ";
    var sql_cmd = util.format(sql, serial);
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

function update_device_count_and_disable_account(acc, devices, callback){
    var sql = "update account_info set devices = %d, is_enable = 0 where account = \"%s\"";
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

function update_days_on_account_info_multi(id_list, callback){
    var sql_cmd = "";
    id_list.forEach(function (item) {
        sql_cmd += mysql.format("UPDATE account_info SET days = days+1 WHERE id = ?; ", item);
    });
    
    log.info(sql_cmd);
    mysql_exec(sql_cmd, function(sql_err, sql_result, field_desc){
        if(sql_err){
            callback(Response.SYS_ERROR, null);
            return;
        }

        callback(Response.OK, null);
    });
}

function disable_acc_and_record_err_by_acc(acc, objStr, callback){
    var sql = "update account_info set is_enable = 0, err_record = \'%s\' where account = \"%s\"";
    var sql_cmd = util.format(sql, objStr, acc);
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

function clean_jsonstr_by_udid(udid, callback){
    var sql = "update device_info set jsonstr = NULL where udid = \"%s\" ";
    var sql_cmd = util.format(sql, udid);
    log.info(sql_cmd);

    mysql_exec(sql_cmd, function(sql_err, sql_result, field_desc){
        if(sql_err){
            callback(Response.SYS_ERROR, null);
            return;
        }
    })

    callback(Response.OK, null);
}

function update_device_info_by_udid(udid, jsonstr, charge_status, callback){
    var sql = "update device_info set jsonstr = \'%s\', charge_status = %d where udid = \"%s\" ";
    var sql_cmd = util.format(sql, jsonstr, charge_status, udid);
    log.info(sql_cmd);
    mysql_exec(sql_cmd, function(sql_err, sql_result, field_desc){
        if(sql_err){
            callback(Response.SYS_ERROR, null);
            return;
        }
    })

    callback(Response.OK, null);
}

function get_timestamp_valid_by_sid(sid, callback){
    var sql = "select udid, time_valid from device_info where serial = \"%s\"";
    var sql_cmd = util.format(sql, sid);
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
    get_info_by_account: get_info_by_account,
    get_devices_by_id: get_devices_by_id,
    get_valid_account: get_valid_account,
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
    clean_jsonstr_by_udid: clean_jsonstr_by_udid,
    update_device_info_by_udid: update_device_info_by_udid,
    get_timestamp_valid_by_sid: get_timestamp_valid_by_sid,
    get_uinfo_by_id: get_uinfo_by_id,
    get_max_devices_accounts: get_max_devices_accounts,
    update_days_on_account_info_multi: update_days_on_account_info_multi,
    update_multi_value_by_id: update_multi_value_by_id,
    disable_acc_and_record_err_by_acc: disable_acc_and_record_err_by_acc,
    clear_record_by_sid: clear_record_by_sid,
    get_reg_content_by_id: get_reg_content_by_id,
    update_reg_content_by_id: update_reg_content_by_id,
}