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

function get_app_name_by_sha1(sha1, callback){
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

function add_uinfo_by_udid(info, callback){
    var sql = "insert into device_info (`model`, `udid`, `version`) values (\"%s\", \"%s\", \"%s\")";
    var sql_cmd = util.format(sql, info.PRODUCT, info.UDID, info.VERSION);
    log.info(sql_cmd);
    mysql_exec(sql_cmd, function(sql_err, sql_result, field_desc){
        if(sql_err){
            callback(Response.SYS_ERROR, null);
            return;
        }

        callback(Response.OK, null);
    })
}

function get_valid_accounts_by_devices(callback){
    var sql_cmd = "select * from account_info where devices != 100 and is_enable != 0 limit 1";
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

function update_device_count_on_account_info(account, callback){
    var sql = "update account_info set devices = devices+1 where account = \"%s\"";
    var sql_cmd = util.format(sql, account);
    log.info(sql_cmd);
    mysql_exec(sql_cmd, function(sql_err, sql_result, field_desc){
        if(sql_err){
            callback(Response.SYS_ERROR, null);
            return;
        }

        callback(Response.OK, null);
    })
}

function update_path_on_app_info(path, app_name, callback){
    var sql = "update app_info set resign_path = \"%s\" where app_name = \"%s\"";
    var sql_cmd = util.format(sql, path, app_name);
    log.info(sql_cmd);
    mysql_exec(sql_cmd, function(sql_err, sql_result, field_desc){
        if(sql_err){
            callback(Response.SYS_ERROR, null);
            return;
        }

        callback(Response.OK, null);
    })
}

function update_app_name_on_device_info(udid, app_name, callback){
    var sql = "update device_info set app_name = \"%s\" where udid = \"%s\"";
    var sql_cmd = util.format(sql, app_name, udid);
    log.info(sql_cmd);
    mysql_exec(sql_cmd, function(sql_err, sql_result, field_desc){
        if(sql_err){
            callback(Response.SYS_ERROR, null);
            return;
        }

        callback(Response.OK, null);
    })
}

function get_downloadApp_url(taskid, callback){
    var sql = "select resign_path from app_info where taskid = \"%s\"";
    var sql_cmd = util.format(sql, taskid);
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
    get_app_name_by_sha1: get_app_name_by_sha1,
    get_uinfo_by_udid: get_uinfo_by_udid,
    add_uinfo_by_udid: add_uinfo_by_udid,
    get_valid_accounts_by_devices: get_valid_accounts_by_devices,
    update_device_count_on_account_info: update_device_count_on_account_info,
    update_path_on_app_info: update_path_on_app_info,
    update_app_name_on_device_info: update_app_name_on_device_info,
    get_downloadApp_url: get_downloadApp_url,
}