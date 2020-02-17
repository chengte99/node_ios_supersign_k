var https = require("https");

var log = require("../utils/log");
var server_config = require("../apps/server_config");
/*
	[100] = "Continue",
		[101] = "Switching Protocols",
		[200] = "OK",
		[201] = "Created",
		[202] = "Accepted",
		[203] = "Non-Authoritative Information",
		[204] = "No Content",
		[205] = "Reset Content",
		[206] = "Partial Content",
		[300] = "Multiple Choices",
		[301] = "Moved Permanently",
		[302] = "Found",
		[303] = "See Other",
		[304] = "Not Modified",
		[305] = "Use Proxy",
		[307] = "Temporary Redirect",
		[400] = "Bad Request",
		[401] = "Unauthorized",
		[402] = "Payment Required",
		[403] = "Forbidden",
		[404] = "Not Found",
		[405] = "Method Not Allowed",
		[406] = "Not Acceptable",
		[407] = "Proxy Authentication Required",
		[408] = "Request Time-out",
		[409] = "Conflict",
		[410] = "Gone",
		[411] = "Length Required",
		[412] = "Precondition Failed",
		[413] = "Request Entity Too Large",
		[414] = "Request-URI Too Large",
		[415] = "Unsupported Media Type",
		[416] = "Requested range not satisfiable",
		[417] = "Expectation Failed",
		[500] = "Internal Server Error",
		[501] = "Not Implemented",
		[502] = "Bad Gateway",
		[503] = "Service Unavailable",
		[504] = "Gateway Time-out",
		[505] = "HTTP Version not supported",
}
*/
/*
callback(is_success, data/erro)
*/
// get请求的参数，是带在URL的地址上面的
function https_get(ip, port, url, params, callback) {
	// step1,创建一个 http.ClientRequest
	var options = {
		host: "127.0.0.1",
		port: port,
		path: url + "?" + params,
		method: "GET"
	};

	// 当有请求返回的时候，参数就会被传递为http.IncomingMessage
	var req = https.request(options, function(incoming_msg) {
		// console.log("respones status " + incoming_msg.statusCode);
		// 监听IncomingMessage的data事件，当收到服务器发过来的数据的时候，触发这个事件
		incoming_msg.on("data", function(data) {
			if (incoming_msg.statusCode === 200) {
				callback(true, data);
			}
		});
	});

	req.on("error", function(err){
		callback(false, err);
	});

	// 把这个请求发送出去
	req.end();
}

/*
https_get("127.0.0.1", 6080, "/login", "uname=blake&upwd=123456", function(is_ok, data) {
	if (is_ok) {
		console.log(data.toString());
	}
});
*/

// post可以带body数据传到服务器
function https_post(hostname, port, url, params, body, callback) {
	// step1,创建一个 http.ClientRequest
	var options = {
		hostname: hostname,
		// host: ip,
		port: port,
		// path: url + "?" + params,
		path: url,
		method: "POST",
		headers: {
			// "Content-Type": "application/x-www-form-urlencoded",
			"Content-Type": "application/json",
			"Content-Length": body.length
		}
	};

	var req = https.request(options, function(incoming_msg) {
		// console.log("respones status " + incoming_msg.statusCode);
		// 监听IncomingMessage的data事件，当收到服务器发过来的数据的时候，触发这个事件
		incoming_msg.on("data", function(data) {
			if (incoming_msg.statusCode === 200) {
				callback(true, data);
			}
		});
	});

	req.on("error", function(err){
		callback(false, err);
	});

	// step2 写入body数据
	req.write(body);

	// 发送请求
	req.end();
}

module.exports = {
    https_get: https_get,
    https_post: https_post,
}


// https_post("127.0.0.1", 6080, "/book", "filename=my_file.txt", "Hello Htpp Post", function(is_ok, data) {
// 	if (is_ok) {
// 		console.log("upload_success", data.toString());	
// 	}
// });

// var data = {
// 	udid_list:["0bc3bfbe3781a2917d4edc3733d052465d528e2a"],
// 	file_path:"itms-services://?action=download-manifest&url=https://appdownload.webpxy.info/dev_188/1572942535/1572942535.plist",
// 	ipa_path:"https://appdownload.webpxy.info/dev_188/1572942535/1572942535.ipa",
// 	app_name:"dev_188"
// }
// log.info(data);
// var json_data = JSON.stringify(data);
// log.info(json_data);

// var api_with_system_config = server_config.rundown_config.api_with_system_config;
// https_post(api_with_system_config.hostname, api_with_system_config.port, api_with_system_config.url, null, json_data, function(is_ok, data){
// 	if(is_ok){
// 		// log.warn(data);
// 		// log.warn(data.toString());
// 		// var json = JSON.parse(data.toString());
// 		// if(!json){
// 			// log.error("管理后台incoming_msg.statusCode = 200，但response無法解析 ...", data);
// 		// }else{
// 			// log.warn("管理后台incoming_msg.statusCode = 200，response成功解析 ...", json);
// 		// }
// 		log.warn("管理后台incoming_msg.statusCode = 200，response ...", data.toString());
// 	}
// })