var mysql = require("mysql");
var util = require("util");

var center_database = require("../apps/server_config").center_database;
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

function update_multi_rows(){
    var values = [2];
    var queries = '';
    
    values.forEach(function (item) {
        queries += mysql.format("UPDATE device_info SET jsonstr = NULL, time_valid = 0 WHERE id = ?; ", item);
    });
    console.log(queries);


    // var sql = "select account from account_info where devices = 99 and is_enable != 0";
    // // var sql_cmd = util.format(sql, tag, udid_data.list[i]);
    // log.info(sql);

    mysql_exec(queries, function(sql_err, sql_result, field_desc){
        if(sql_err){
            log.error(sql_err);
            return;
        }

        // log.info("sql_reult = ", sql_result);
    })
}

connect_to_server(center_database.host, center_database.port, center_database.db_name, center_database.user, center_database.password);

update_multi_rows();