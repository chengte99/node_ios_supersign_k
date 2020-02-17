var redis = require("redis");
var util = require("util");
var log = require("../utils/log");
var Response = require("../apps/Response");

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

function set_accinfo_inredis(id, uinfo){
    if(!redis_client){
        return;
    }

    var key = "supersign_center_acc_id_" + id;
    uinfo.id = uinfo.id.toString();
    uinfo.devices = uinfo.devices.toString();
    uinfo.is_enable = uinfo.is_enable.toString();
    uinfo.m_code = uinfo.m_code.toString();
    uinfo.acc_group = uinfo.acc_group.toString();
    uinfo.expired = uinfo.expired.toString();
    uinfo.days = uinfo.days.toString();

    log.info("redis_client hmset " + key);

    redis_client.hmset(key, uinfo, function(err){
        if(err){
            log.err(err);
        }
    });
}

function get_accinfo_inredis(id, callback){
    if(!redis_client){
        callback(Response.SYSTEM_ERROR, null);
        return;
    }

    var key = "supersign_center_acc_id_" + id;
    log.info("redis_client hgetall " + key);

    redis_client.hgetall(key, function(err, data){
        if(err){
            log.error(err);
            callback(Response.SYSTEM_ERROR, null);
            return;
        }

        var uinfo = data;
        uinfo.id = parseInt(uinfo.id);
        uinfo.devices = parseInt(uinfo.devices);
        uinfo.is_enable = parseInt(uinfo.is_enable);
        uinfo.m_code = parseInt(uinfo.m_code);
        uinfo.acc_group = parseInt(uinfo.acc_group);
        uinfo.expired = parseInt(uinfo.expired);
        uinfo.days = parseInt(uinfo.days);

        callback(Response.OK, uinfo);
    })
}

module.exports = {
    connect: connect_to_server,
    set_accinfo_inredis: set_accinfo_inredis,
    get_accinfo_inredis: get_accinfo_inredis,
}


