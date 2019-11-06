var redis = require("redis");
var util = require("util");

var log = require("../utils/log");

var redis_client = null;

function connect_to_server(host, port, db_index){
    redis_client = redis.createClient({
        host: host,
        port: port,
        db: db_index
    });

    redis_client.on("error", function(err){
        log.error(err);
    });
}

function set_appinfo_inredis(){

}


