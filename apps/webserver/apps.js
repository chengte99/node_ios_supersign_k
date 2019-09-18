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

router.get("/downloadApp", function(req, res){
    log.info(req.query);

    if(req.query.taskID == null || req.query.taskID == "" || req.query.fid == null){
        log.info("taskID or fid = null or empty !!")
        return;
    }

    var fid = parseInt(req.query.fid);

    web_service.get_downloadApp_url(req.query.taskID, fid, function(ret){
        if(ret.status != Response.OK){
            log.error("get_loadxml error ...", ret.status);
            res.send(ret);
            return;
        }
        
        res.send(ret);
    });
});

router.get("/loadxml", function(req, res){
    // res.sendFile(process.cwd() + "/www_root/new_signed.mobileconfig");
    log.info(req.query.params);
    var md5 = req.query.params;
    //get mobileconfig
    web_service.get_loadxml(md5, function(ret){
        if(ret.status != Response.OK){
            log.error("get_loadxml error ...", ret.status);
            res.send("INVAILD OPT ...");
            return;
        }

        res.download(process.cwd() + "/www_root/mobileconfig/" + md5 + "signed.mobileconfig");
    })
})

router.post("/submit", function(req, res, next){
    // log.info(req.headers);
    log.info(req.query.params);
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
        // log.info(plist2json);

        web_service.resign_ipa(plist2json, sha1, function(ret){
            if(ret.status != Response.OK){
                log.error("resign_ipa error ...", ret.status);
                // res.send(ret.status);
                return;
            }

            var r_url = "https://kritars.com?step=2&taskID=" + ret.app_taskid + "&fid=" + ret.app_fid;
            res.redirect(301, r_url);
        })
    })
    
})

router.get("*", function(req, res){
    res.render("error", {
        "title": "Hbs error title !",
        "h1": "404 error not found",
        "name": "kevin",
    })
});

module.exports = router;