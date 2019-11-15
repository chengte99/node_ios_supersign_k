var mysql = require("mysql");
var util = require("util");

var center_database = require("../apps/server_config").center_database;
var log = require("../utils/log");
var Response = require("../apps/Response");

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

function test_sql_request(){
    var sql = "select account from account_info where devices = 99 and is_enable != 0";
    // var sql_cmd = util.format(sql, tag, udid_data.list[i]);
    log.info(sql);

    mysql_exec(sql, function(sql_err, sql_result, field_desc){
        if(sql_err){
            log.error(sql_err);
            return;
        }

        log.info("sql_reult = ", sql_result);
    })
}

connect_to_server(center_database.host, center_database.port, center_database.db_name, center_database.user, center_database.password);

test_sql_request();

// var udid = "c3d699593eae5c0cb68a83ce4a458c0000000000";
// var sql = "select * from device_uinfo where udid = \"%s\"";
// var sql_cmd = util.format(sql, udid);
// log.info(sql_cmd);

// mysql_exec(sql_cmd);


// var udid_data = {
//     list: [
//         "00008020-000B683C01D1002E",
//         "226a1cecfd7d01536d1b305b2594509a63fb4c4b",
//         "5494eb626094411689a97b2249c7c97a9c913d26",
//     ],
//     count: 3,
// }

// update_ipa_name_on_multiple_device_info(udid_data, "1571132588", function(status, result){
//     log.info("status = ", status);
// })