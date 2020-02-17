var plist = require('plist');
var fs = require("fs");
var util = require("util");
var exec = require("child_process").exec;

var log = require("../../utils/log");
var utils = require("../../utils/utils");

// ipa包名稱
var name = "my_518_1703";
var desc = "518";

log.info(utils.sha1(name));
log.info(utils.md5(name));

var xml = fs.readFileSync(__dirname + "/getudid.mobileconfig", "utf8");
var json = plist.parse(xml);
// log.info(json);

// log.warn(json.PayloadDisplayName);

json.PayloadContent.URL = "https://kritars.com/submit?params=" + utils.sha1(name);
json.PayloadContent.Challenge = desc;
json.PayloadDisplayName = "" + desc + "--【点击安装】";

var newxml = plist.build(json);
// var filename = "" + utils.md5(name) + ".mobileconfig";
var file_path = __dirname + "/" + utils.md5(name) + ".mobileconfig";
fs.writeFileSync(file_path, newxml);

// 進行簽名憑證動作
// openssl smime -sign -in ./d2cb56f8b25f102ef363ca7c9f151d1d.mobileconfig -out ./d2cb56f8b25f102ef363ca7c9f151d1dsigned.mobileconfig -signer ./domain.crt -inkey ./ybsnopass.key -certfile ./ssl.pem -outform der -nodetach
var signed_file_path = __dirname + "/" + utils.md5(name) + "signed" + ".mobileconfig";
var signer_path = __dirname + "/domain.crt";
var key_path =  __dirname + "/ybsnopass.key";
var cert_path =  __dirname + "/ssl.pem";

var sh = "openssl smime -sign -in %s -out %s -signer %s -inkey %s -certfile %s -outform der -nodetach";
var sh_cmd = util.format(sh, file_path, signed_file_path, signer_path, key_path, cert_path);
log.info(sh_cmd);

//运行 sh
exec(sh_cmd, function(error, stdout, stderr){
    if(error){
        log.info('error: ' + error);
    }

    if(stderr){
        log.info('stderr: ' + stderr);
    }

    // log.info('stdout: ' + stdout);
});