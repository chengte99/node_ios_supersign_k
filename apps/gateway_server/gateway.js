var netbus = require("../../netbus/netbus");

var host = "127.0.0.1";
var port = 6080;

netbus.start_tcp_server(host, port, false);