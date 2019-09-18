var net = require("net");
var log = require("../utils/log");

var sock = net.connect({
    host: "127.0.0.1",
    port: 6080,
}, function(){
    log.info("connect to server");

    sock.write("kevin hello");
    sock.end();
})

sock.on("close", function(){
    log.info("session close...");
});

sock.on("error", function(err){
    log.error("session error...", err);
});

sock.on("end", function(){
    log.info("session end...");
});