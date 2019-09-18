var plist = require('plist');
var fs = require("fs");
var log = require("../utils/log");
var utils = require("../utils/utils");

var name = "dev_188";
var xml = fs.readFileSync(process.cwd() + "/www_root/getudid.mobileconfig", "utf8");
var json = plist.parse(xml);

json.PayloadContent.URL = "https://kritars.com/submit?params=" + utils.sha1(name);
var newxml = plist.build(json);
// log.info(newxml);
fs.writeFileSync(process.cwd() + "/www_root/" + utils.md5(name) +".mobileconfig", newxml);

log.info(utils.sha1(name));
log.info(utils.md5(name));
