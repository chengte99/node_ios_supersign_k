var url = new URL("https://api-518.webpxy.info:443/app/v1/request/sign_complete?query=string#fragment");
// var url = new URL("http://domain.com:3000/path/to/something?query=string#fragment");

console.log("url.protocol: ", url.protocol);
console.log("url.hostname: ", url.hostname);
console.log("url.host: ", url.host);
console.log("url.port: ", url.port);
console.log("url.pathname: ", url.pathname);
console.log("url.search: ", url.search);
console.log("url.hash: ", url.hash);
