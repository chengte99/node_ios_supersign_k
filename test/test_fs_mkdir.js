var fs = require("fs");

var local_dir_path = __dirname + "../../ios_sign/APP-16";
fs.access(local_dir_path, fs.constants.F_OK | fs.constants.W_OK, function(err){
    if(err){
        console.log(err);

        fs.mkdir(local_dir_path, {recursive: true}, function(err){
            if(err){
                console.log(err);
            }
        });
    }
});