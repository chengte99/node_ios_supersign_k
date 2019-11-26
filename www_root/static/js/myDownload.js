var stepNum;

stepNum = getUrlParam('step');
setStepClass();

function setStepClass() {
    if (stepNum) {
        installEvent(stepNum);
    } else {
        installEvent(0);
    }
}

function installEvent(value){
    if (value === 0) {
        console.log("獲取mobileconfig 描述檔文件 ...");
        var loadxml = "/loadxml?params=" + down_session;
        setTimeout(function() {
            location.href = loadxml;
        }, 3000)

        setTimeout(function() {
            location.href = "/loadprovision";
        }, 6000)
    }else if(value == '1'){
        console.log("等待簽名且上傳，完成後分發檔案 ...");
        var t1 = setInterval(function(){
            $.ajax({
                url: "/get_resign_status?dID=" + getUrlParam("dID") + "&fid=" + getUrlParam("fid"),
                success: function(data, textStatus){
                    console.log("data = ", data);
                    if(data.status == 1 && typeof(data.url) != "undefined"){
                        clearInterval(t1);
                        setTimeout(function(){
                            location.href = "" + data.url;
                        }, 2000);
                    }
                },
                error: function(xhr, ajaxOptions, thrownError){
                    console.log(xhr.status);
                    console.log(thrownError);
                }
            });
        }, 10000);
    }else if(value == '2'){
        console.log("app已簽過，分發上次的檔案 ...");
        var t2 = setInterval(function(){
            $.ajax({
                url: "/downloadApp?tagID=" + getUrlParam("tagID"),
                success: function(data, textStatus){
                    console.log("data = ", data);
                    if(data.status == 1 && typeof(data.url) != "undefined"){
                        clearInterval(t2);
                        setTimeout(function(){
                            location.href = "" + data.url;
                        }, 2000);
                    }
                },
                error: function(xhr, ajaxOptions, thrownError){
                    console.log(xhr.status);
                    console.log(thrownError);
                }
            });
        }, 2000);
    }
}

function getUrlParam(name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
    var r = window.location.search.substr(1).match(reg);
    if (r != null)
        return unescape(r[2]);
    return null;
}