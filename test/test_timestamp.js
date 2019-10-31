var utils = require("../utils/utils");
var log = require("../utils/log");

log.info(utils.timestamp());

var timestamp = utils.timestamp();
var timestampStr = "" + utils.timestamp();

log.info("timestamp = ", timestamp);
log.info("timestampStr = ", timestampStr);

// 1571729377
//   31536000

log.info(timestamp + 31536000);
log.info(parseInt(timestampStr) + 31536000);
