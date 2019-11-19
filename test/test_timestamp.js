var utils = require("../utils/utils");
var log = require("../utils/log");

var timestamp = utils.timestamp();
var timestampStr = "" + timestamp

log.info("timestamp = ", timestamp);
log.info("timestampStr = ", timestampStr);

var date = "2020-05-10 00:00:00";

log.info("date = ", utils.date2timestamp(date));
