var mysql = require("mysql");
var util = require("util");

var center_database = require("../apps/server_config").center_database;
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

function mysql_exec(sql){
    conn_pool.getConnection(function(err, conn){
        if(err){
            log.error("connection err: ", err);
            return;
        }

        conn.query(sql, function(sql_err, sql_result, field_desc){
            conn.release();

            if(sql_err){
                log.error("sql_err : ", sql_err);
                return;
            }

            if(sql_result.length > 0){
                log.info(sql_result);
            }else{
                log.info("sql_result.length = 0");
            }
        });
    })
}

connect_to_server(center_database.host, center_database.port, center_database.db_name, center_database.user, center_database.password);

var udid = "c3d699593eae5c0cb68a83ce4a458c0000000000";
var sql = "select * from device_uinfo where udid = \"%s\"";
var sql_cmd = util.format(sql, udid);
log.info(sql_cmd);

mysql_exec(sql_cmd);
