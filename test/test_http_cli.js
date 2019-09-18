var http = require("http");
var log = require("../utils/log");

function exec_http_get(host, port, path, params, callback){
    var options = {
        host: "127.0.0.1",
        port: port,
        path: path + "?" + params,
        method: "GET", 
    }

    var req = http.request(options, function(incomingMsg){
        log.info("status: ", incomingMsg.statusCode);
        log.info("header: ", incomingMsg.headers);

        incomingMsg.on("data", function(data){
            if(incomingMsg.statusCode == 200){
                callback(true, data);
            }
        });
    });

    req.end();
}

function exec_http_post(host, port, path, params, body, callback){
    var options = {
        host: "127.0.0.1",
        port: port,
        path: path + "?" + params,
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
			"Content-Length": body.length
        }
    }

    var req = http.request(options, function(incomingMsg){
        log.info("status: ", incomingMsg.statusCode);
        log.info("header: ", incomingMsg.headers);

        incomingMsg.on("data", function(data){
            if(incomingMsg.statusCode == 200){
                callback(true, data);
            }
        });
    });

    req.write(body);
    req.end();
}

// exec_http_get("127.0.0.1", 6080, "/login", "uname=kevin&upwd=12345", function(is_ok, data){
//     if(is_ok){
//         log.info("data = ", data.toString());
//     }
// })

exec_http_post("127.0.0.1", 6080, "/login", "filename=myfile.txt", "HELLO BODY", function(is_ok, data){
    if(is_ok){
        log.info("data = ", data.toString());
    }
})