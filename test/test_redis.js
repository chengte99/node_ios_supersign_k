var redis = require("redis");

// 创建一个client连接到了我们的redis server
var client = redis.createClient({
	host: "127.0.0.1",
	port: 6379,
	db: 0,
});


var key = "supersign_center_acc_id_" + 7;
console.log("client hgetall " + key);

client.hgetall(key, function(err, data){
    if(err){
        console.log("error :", err);
    }

    if(!data){
        console.log("empty list or set ...");
    }else{
        console.log("data = ", data);
    }
    
})
