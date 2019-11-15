const fs = require('fs');
const zlib = require('zlib');
const file = process.argv[2];

var file_path = __dirname + "/../" + file;
console.log(file_path);
var out_path = __dirname + "/zlib.zz";

fs.createReadStream(file_path)
  .pipe(zlib.createGzip())
  .on('data', () => process.stdout.write('.'))
  .pipe(fs.createWriteStream(out_path))
  .on('finish', () => console.log('\nDone'));

