var express = require("express");
var plist = require('plist');

var web_service = require("./web_service");
var log = require("../../utils/log");
var Response = require("../Response");

var router = express.Router();
router.use(function timelog(req, res, next){
    // log.info("time :", Date.now());
    next();
});

router.get("", function(req, res){
    log.info(req.query);

    // res.sendFile(process.cwd() + "/www_root/home.html");
    res.render("home", {
        "title": "Hbs home title !",
        "h1": "Welcome Home, 自動安裝",
        "name": "kevin",
    })
})

router.get("/about", function(req, res){
    log.info(req.query);

    // res.sendFile(process.cwd() + "/www_root/home.html");
    res.render("about", {
        "title": "Hbs about title !",
        "h1": "Welcome About",
        "name": "kevin",
    })
})

// 前端ajax 傳tag_id來取得下載路徑
router.get("/downloadApp", function(req, res){
    log.info(req.query);

    if(req.query.tagID == null || req.query.tagID == ""){
        log.info("tagID = null or empty !!")
        return;
    }

    web_service.get_downloadApp_url(req.query.tagID, function(ret){
        if(ret.status != Response.OK){
            log.error("downloadApp error ...", ret.status);
            res.send(ret);
            return;
        }
        
        res.send(ret);
    });
});

// 前端ajax 傳device_id來取得app簽名狀況
router.get("/get_resign_status", function(req, res){
    log.info(req.query);

    if(req.query.dID == null || req.query.dID == "" || req.query.fid == null || req.query.fid == ""){
        log.info("dID = null or empty !!")
        return;
    }

    var dID = parseInt(req.query.dID);
    web_service.get_resign_status(dID, req.query.fid, function(ret){
        if(ret.status != Response.OK){
            log.error("get_resign_status error ...", ret.status);
            res.send(ret);
            return;
        }
        
        res.send(ret);
    });
});

// 前端href 取得.mobileconfig xml
router.get("/loadxml", function(req, res){
    // log.info(req.query.params);
    var md5 = req.query.params;
    //get mobileconfig
    web_service.get_loadxml(md5, function(ret){
        if(ret.status != Response.OK){
            // log.error("get_loadxml error ...", ret.status);
            res.send("get_loadxml error ...", ret.status);
            return;
        }

        res.download(ret.path);
        // res.download(process.cwd() + "/www_root/mobileconfig/" + md5 + "signed.mobileconfig");
    })
})

// 前端href 跳轉setting 描述檔畫面
router.get("/loadprovision", function(req, res){
    // log.info("/loadprovision ...");
    var path = process.cwd() + "/www_root/mobileconfig/embedded.mobileprovision";
    res.download(path);
})

// 裝置透過POST xml 傳送裝置資訊到服務器
router.post("/submit", function(req, res, next){
    // log.info(req.headers);
    // log.info(req.query.params);
    // log.info(req.body);

    //抓db判斷 params 是哪個 ipa 名稱
    var sha1 = req.query.params;

    req.setEncoding("utf8");
    var data = "";
    req.on("data", function(chunk){
        data += chunk;
    })

    req.on("end", function(){
        var t1 = data.split("<plist")[1];
        t1 = "<plist" + t1;

        var t2 = t1.split("plist>")[0];
        t2 = t2 + "plist>";

        // log.info(t2);
        var plist2json = plist.parse(t2);
        plist2json.SHA1 = sha1;
        // log.info(plist2json);

        web_service.resign_ipa(plist2json, function(ret){
            log.warn(ret);
            if(ret.status != Response.OK){
                if(ret.status == Response.APP_IS_EXIST){
                    log.info("app已簽過，分發上次的檔案 ...");
                    var r_url = "https://kritars.com?step=2&tagID=" + ret.ipa_name;
                    res.redirect(301, r_url);
                    return;
                }

                log.error("resign_ipa error ...", ret.status);
                res.send(ret.status);
                return;
            }
            
            // 排入佇列，返回device_id
            var r_url = "https://kritars.com?step=1&dID=" + ret.device_id + "&fid=" + ret.sha1;
            res.redirect(301, r_url);
        })
    })
})

// 管理後台收到device info後，透過api post json傳過來給重簽名後台
/* 
    var dinfo = {
        "UDID": "868a1cecfd7d01536d1b305b2594509a63fb4c4b",
        "PRODUCT": "iPhone9,4",
        "VERSION": "16G102",
        "SERIAL": "C39SVAE3HFY9",
        // 自定義
        "SHA1": "123123123123",
    }
*/
router.post("/action_sigh", function(req, res, next){
    // log.info(req.headers);
    // log.info(req.query);
    log.info(req.body);

    if (req.body) {
        //能正确解析 json 格式的post参数
        log.info("正确解析");
        var dinfo;
        dinfo = req.body;
        // res.send({"status":"success", "dinfo": req.body})
        web_service.resign_ipa_via_api(dinfo, function(ret){
            if(ret.status != Response.OK){
                log.error("resign_ipa_via_api error ...", ret.status);
                res.send(ret);
                return;
            }
    
            res.send(ret);
        });

    } else {
        //不能正确解析json 格式的post参数
        log.info("不正确解析");
        var body = '', dinfo;
        req.on('data', function (chunk) {
            body += chunk; //读取参数流转化为字符串
        });
        req.on('end', function () {
            //读取参数流结束后将转化的body字符串解析成 JSON 格式
            try {
                dinfo = JSON.parse(body);
            } catch (err) {
                dinfo = null;
            }
            // dinfo ? res.send({"status":"success", "dinfo": dinfo}) : res.send({"status":"error"});

            web_service.resign_ipa_via_api(dinfo, function(ret){
                if(ret.status != Response.OK){
                    log.error("resign_ipa_via_api error ...", ret.status);
                    res.send(ret);
                    return;
                }
        
                res.send(ret);
            });
        });
    }

})

// 透過執行ruby update_acc_devices.rb (apple帳號)，更新mysql account_info的裝置數。
router.post("/update_devices", function(req, res, next){
    // log.info(req.headers);
    // log.info(req.query);
    log.info(req.body);

    if (req.body) {
        //能正确解析 json 格式的post参数
        log.info("正确解析");
        var jsonStr;
        jsonStr = req.body;
        // res.send({"status":"success", "jsonStr": req.body})
        web_service.update_acc_devices(jsonStr, function(ret){
            if(ret.status != Response.OK){
                log.error("update_acc_devices ...", ret.status);
                res.send(ret);
                return;
            }
    
            res.send(ret);
        });
    } else {
        //不能正确解析json 格式的post参数
        log.info("不正确解析");
        var body = '', jsonStr;
        req.on('data', function (chunk) {
            body += chunk; //读取参数流转化为字符串
        });
        req.on('end', function () {
            //读取参数流结束后将转化的body字符串解析成 JSON 格式
            try {
                jsonStr = JSON.parse(body);
            } catch (err) {
                jsonStr = null;
            }
            // jsonStr ? res.send({"status":"success", "jsonStr": jsonStr}) : res.send({"status":"error"});
            web_service.update_acc_devices(jsonStr, function(ret){
                if(ret.status != Response.OK){
                    log.error("update_acc_devices ...", ret.status);
                    res.send(ret);
                    return;
                }
        
                res.send(ret);
            });
        });
    }
})

// 管理後台上傳app後，透過api post json傳過來給重簽名後台新增到DB
/* 
   {
       "app": "BF178",
       "name": "test_fileName_123"
       "ver": "1603",
       "sha1": "xxxxxx111",
       "md5": "ddddddd222",
   }
*/
router.post("/create_app", function(req, res, next){
    // log.info(req.headers);
    // log.info(req.query);
    log.info(req.body);
    
    if (req.body) {
        //能正确解析 json 格式的post参数
        log.info("正确解析");
        var dinfo;
        dinfo = req.body;
        // res.send({"status":"success", "dinfo": req.body})
        web_service.create_app_to_db(dinfo, function(ret){
            if(ret.status != Response.OK){
                log.error("create_app_to_db error ...", ret.status);
                res.send(ret);
                return;
            }
    
            res.send(ret);
        });
    } else {
        //不能正确解析json 格式的post参数
        log.info("不正确解析");
        var body = '', dinfo;
        req.on('data', function (chunk) {
            body += chunk; //读取参数流转化为字符串
        });
        req.on('end', function () {
            //读取参数流结束后将转化的body字符串解析成 JSON 格式
            try {
                dinfo = JSON.parse(body);
            } catch (err) {
                dinfo = null;
            }
            // dinfo ? res.send({"status":"success", "dinfo": dinfo}) : res.send({"status":"error"});
            web_service.create_app_to_db(dinfo, function(ret){
                if(ret.status != Response.OK){
                    log.error("create_app_to_db error ...", ret.status);
                    res.send(ret);
                    return;
                }
        
                res.send(ret);
            });
        });
    }
})

router.post("/valid_timestamp", function(req, res, next){
    // log.info(req.headers);
    // log.info(req.query);
    log.info(req.body);

    if (req.body) {
        //能正确解析 json 格式的post参数
        log.info("正确解析");
        var jsonStr;
        jsonStr = req.body;
        // res.send({"status":"success", "jsonStr": req.body})
        web_service.check_timestamp_valid(jsonStr, function(ret){
            if(ret.status != Response.OK){
                log.error("check_timestamp_valid error ...", ret.status);
                res.send(ret);
                return;
            }
    
            res.send(ret);
        });
    } else {
        //不能正确解析json 格式的post参数
        log.info("不正确解析");
        var body = '', jsonStr;
        req.on('data', function (chunk) {
            body += chunk; //读取参数流转化为字符串
        });
        req.on('end', function () {
            //读取参数流结束后将转化的body字符串解析成 JSON 格式
            try {
                jsonStr = JSON.parse(body);
            } catch (err) {
                jsonStr = null;
            }
            // jsonStr ? res.send({"status":"success", "jsonStr": jsonStr}) : res.send({"status":"error"});
            web_service.check_timestamp_valid(jsonStr, function(ret){
                if(ret.status != Response.OK){
                    log.error("check_timestamp_valid error ...", ret.status);
                    res.send(ret);
                    return;
                }
        
                res.send(ret);
            });
        });
    }
})

router.get("*", function(req, res){
    res.render("error", {
        "title": "Hbs error title !",
        "h1": "404 error not found",
        "name": "kevin",
    })
});

module.exports = router;