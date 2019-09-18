// var http = require("http");
var plist = require('plist');
var log = require("../utils/log");

var body = '<plist version="1.0">' + 
                '<dict>' +
                    '<key>IMEI</key>' +
                    '<string>12 123456 123456 7</string>' +
                    '<key>PRODUCT</key>' +
                    '<string>iPhone8,1</string>' +
                    '<key>UDID</key>' +
                    '<string>b59769e6c28b73b1195009d4b21cXXXXXXXXXXXX</string>' +
                    '<key>VERSION</key>' +
                    '<string>15B206</string>' +
                '</dict>' +
            '</plist>';

// console.log(body);
var plist2json = plist.parse(body)
log.info(plist2json);

// var postRequest = {
//     host: "127.0.0.1",
//     path: "/getudid",
//     port: 8080,
//     method: "POST",
//     headers: {
//         // 'Cookie': "cookie",
//         'Content-Type': 'text/xml',
//         'Content-Length': Buffer.byteLength(body)
//     }
// };

// var buffer = "";

// var req = http.request( postRequest, function( res )    {

//    console.log( res.statusCode );
//    var buffer = "";
//    res.on( "data", function( data ) { buffer = buffer + data; } );
//    res.on( "end", function( data ) { console.log( buffer ); } );

// });

// req.on('error', function(e) {
//     console.log('problem with request: ' + e.message);
// });

// req.write( body );
// req.end();