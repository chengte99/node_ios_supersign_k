var fs = require("fs");

var data = '菜鸟教程官网地址：www.runoob.com\n';

var data1 = '菜鸟教程官网地址：www.google.com\n';
var data2 = '菜鸟教程官网地址：www.googll.com\n';
var data3 = '菜鸟教程官网地址：www.googl3.com\n';
var data4 = '菜鸟教程官网地址：www.googl4.com\n';

var file_path = "" + process.cwd() + "/bbbte.txt";

// fs.writeFile(file_path, data, (err) => {
//   if (err) throw err;
//   console.log('文件已被保存');
// });


// fs.writeFile(file_path, data, {flag: "a+"}, function(err){
//     if (err) throw err;
//     console.log('文件已被更新');
// });

var writerStream = fs.createWriteStream(file_path, {flags: "a+"});

writerStream.write(data,'UTF8');

writerStream.write(data1,'UTF8');
writerStream.write(data2,'UTF8');
writerStream.write(data3,'UTF8');
writerStream.write(data4,'UTF8');

writerStream.end();

// 处理流事件 --> data, end, and error
writerStream.on('finish', function() {
    console.log("写入完成。");
});

writerStream.on('error', function(err){
   console.log(err.stack);
});

console.log("程序执行完毕");