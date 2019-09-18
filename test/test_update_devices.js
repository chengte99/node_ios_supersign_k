var fs = require("fs");
var exec = require("child_process").exec;

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

function mysql_exec(sql, callback){
    conn_pool.getConnection(function(err, conn){
        if(err){
            callback(-1, null);
            log.error("connection err: ", err);
            return;
        }

        conn.query(sql, function(sql_err, sql_result, field_desc){
            conn.release();

            if(sql_err){
                callback(-1, null);
                log.error("sql_err : ", sql_err);
                return;
            }

            if(sql_result.length <= 0){
                callback(-2, null);
                return;
            }

            callback(1, sql_result);
        });
    });
}

connect_to_server(center_database.host, center_database.port, center_database.db_name, center_database.user, center_database.password);

function get_account_list(callback){
    var sql_cmd = "select account from account_info where is_enable = 1";
    log.info(sql_cmd);
    mysql_exec(sql_cmd, function(status, result){
        if(status != 1){
            log.info("status = ", status);
            return;
        }

        log.info(result);
        callback(1, result);
    });
}

function update_account_devices(count, callback){
    var sql= "update account_info set account = \"%d\"";
    var sql_cmd = util.format(sql, count);
    log.info(sql_cmd);
    mysql_exec(sql_cmd, function(status, result){
        if(status != 1){
            log.info("status = ", status);
            return;
        }

        callback(1, null);
    });
}

function run_shell_cmd(cmd, callback){
    exec(cmd, function(error, stdout, stderr){
        if(error){
            callback(error);
        }else{
            callback(stdout);
        }
    });
}


get_account_list(function(status, result){
    if(status != 1){
        log.info("error ...");
        return;
    }

    var acc_list = result;
    for(var i = 0; i < acc_list.length; i ++){

        var sh = "ruby test_output.rb \"%s\"";
        var sh_cmd = util.format(sh, acc_list[i].account);
        log.info(sh_cmd);

        run_shell_cmd(sh_cmd, function(res){
            log.info("res = ", res);
        })


        
    }
});
