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

var name = "C38SHLVVHFY7";

console.log(sha1(name));
console.log(md5(name));

var encryptAES = function (key, iv, data) {
    var cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
    var crypted = cipher.update(data, 'utf8', 'binary');
    crypted += cipher.final('binary');
    // crypted = new Buffer(crypted, 'binary').toString('base64');
    crypted = Buffer.from(crypted, 'binary').toString('base64');
    return crypted;
};
 
var decryptAES = function (key, iv, crypted) {
    // crypted = new Buffer(crypted, 'base64').toString('binary');
    crypted = Buffer.from(crypted, 'base64').toString('binary');
    var decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
    var decoded = decipher.update(crypted, 'binary', 'utf8');
    decoded += decipher.final('utf8');
    return decoded;
};
 
var key = 'touchapp20180914';
console.log('加密的key:', key.toString('hex'));
var iv = '8105547186756005';
console.log('加密的iv:', iv);
var crypted = encryptAES(key, iv, name);
console.log("数据加密后:", crypted);
var dec = decryptAES(key, iv, crypted);
console.log("数据解密后:", dec);