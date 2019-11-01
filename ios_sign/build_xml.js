var plist = require('plist');
var fs = require("fs");
var util = require("util");
var exec = require("child_process").exec;

var log = require("../utils/log");
var utils = require("../utils/utils");

// ipa包名稱
var name = "1570613049";

// log.info(utils.sha1(name));
// log.info(utils.md5(name));

var xml = fs.readFileSync(__dirname + "/manifest.plist", "utf8");
var json = plist.parse(xml);
// console.log(json.items[0].assets[0].url);

console.log(json.items[0].metadata);
console.log(json.items[0].metadata.title);

// json.items[0].assets[0].url = "https://apple.bckappgs.info/dev_188/" + name + "/" + name + ".plist"
// json.items[0].metadata.title = "abckevin";
// var newxml = plist.build(json);
// var filename = "" + name + ".plist";
// fs.writeFileSync(__dirname + "/" + filename, newxml);


// // 進行簽名憑證動作
// // openssl smime -sign -in ./d2cb56f8b25f102ef363ca7c9f151d1d.mobileconfig -out ./d2cb56f8b25f102ef363ca7c9f151d1dsigned.mobileconfig -signer ./domain.crt -inkey ./ybsnopass.key -certfile ./ssl.pem -outform der -nodetach
// var after_sign_filename = "" + utils.md5(name) + "signed" + ".mobileconfig";
// var signer = "domain.crt";
// var key = "ybsnopass.key";
// var cert = "ssl.pem";

// var sh = "openssl smime -sign -in %s -out %s -signer %s -inkey %s -certfile %s -outform der -nodetach";
// var sh_cmd = util.format(sh, filename, after_sign_filename, signer, key, cert);
// log.info(sh_cmd);

// //运行 sh
// exec(sh_cmd, function(error, stdout, stderr){
//     if(error){
//         log.info('error: ' + error);
//     }

//     if(stderr){
//         log.info('stderr: ' + stderr);
//     }

//     // log.info('stdout: ' + stdout);
// });