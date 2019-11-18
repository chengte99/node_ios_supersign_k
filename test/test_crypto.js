var crypto = require("crypto");

function base64_encode(content) {
    var buf = new Buffer(content);
    var base64 = buf.toString("base64");

    return base64;
}

function base64_decode(base64_str) {
    var buf = new Buffer(base64_str, "base64");
    return buf;
}

function md5(data) {
    var md5 = crypto.createHash("md5");
    md5.update(data);
    return md5.digest('hex'); 
}

function sha1(data) {
    var sha1 = crypto.createHash("sha1");
    sha1.update(data);
    return sha1.digest('hex'); 
}

var name = "APP_dbp_1604";

console.log(sha1(name));
console.log(md5(name));