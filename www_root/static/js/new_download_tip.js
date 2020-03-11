/**
 * app下载类库
 * @author widuu
 */
$(function(){
    // 浏览器信息
    var UserAgent  = navigator.userAgent.toLowerCase(),
        IsIpad     = UserAgent.match(/ipad/i) == "ipad" || UserAgent.indexOf('macintosh') > -1 && ('ontouchend' in document),
        IsIphoneOs = UserAgent.match(/iphone os/i) == "iphone os",
        IsMidp     = UserAgent.match(/midp/i) == "midp", 
        IsUc7      = UserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4",  
        IsUc       = UserAgent.match(/ucweb/i) == "ucweb",
        IsAndroid  = UserAgent.match(/android/i) == "android",
        IsSafari   = UserAgent.match(/safari/i) == "safari",
        IsCE       = UserAgent.match(/windows ce/i) == "windows ce", 
        IsWechat   = UserAgent.match(/MicroMessenger/i) == "micromessenger",
        IsQQ       = UserAgent.match(/QQ\//i) == "qq/" && (UserAgent.match(/mqqbrowser/i) == "mqqbrowser" || UserAgent.match(/YYB_D/i) == "yyb_d"), 
        IsWM       = UserAgent.match(/windows mobile/i) == "windows mobile",
        loading    = null,
        IosVersion = '';

        
    /**
     * 生成二维码
     * @param {*} renderId 
     * @param {*} url 
     * @param {*} size 
     * @param {*} renderType 
     * @param {*} image 
     */
    function makeQrcode(renderId, url = '', size = 140, renderType = 'image', image = null){
        var options = {
            render: renderType,
            maxVersion: 40,
            ecLevel: 'L',
            left: 0,
            top: 0,
            size: size,
            fill: '#333333',
            background: '#fff',
            text: url,
            radius: 2,
            quiet: 1,
            mode: 4,
            mSize: 0.1,
            mPosX: 0.5,
            mPosY: 0.5,
            image: image
        }
        $(renderId).qrcode(options);
    }

    /**
     * 是否是 QQ 应用内打开
     * @return {Boolean} [true 是QQ内部打开]
     */
    function isQQApp(){
        var android = UserAgent.indexOf('android');
        var iphone = UserAgent.indexOf('iphone');
        if(android > 0){
            var qqapp_sq = UserAgent.indexOf('v1_and_sq');
            var qqapp_d = UserAgent.indexOf('yyb_d');
            var qq = UserAgent.indexOf('qq');
            if(qq > 0 && (qqapp_sq > 0 || qqapp_d > 0))
            {
                return true;
            }

            var qqbrowser = UserAgent.indexOf('mqqbrowser');
            var netType =  UserAgent.indexOf('nettype');
            var webp =  UserAgent.indexOf('webp');
            if(qqbrowser > 0 && netType > 0 && webp >0){
                return true;
            }
        }
        if(iphone > 0){
            var qqbrowser = UserAgent.indexOf('qq/');
            var netType =  UserAgent.indexOf('nettype');
            var newUc =  UserAgent.indexOf('ucbrowser');
            var newQq =  UserAgent.indexOf('mqqbrowser');
            // 添加uc
            // if(qqbrowser > 0 && netType > 0 || IsQQ || IsUc7 || IsUc || newUc > 0 || newQq > 0){
            if(qqbrowser > 0 && netType > 0 || IsQQ){
                return true;
            }
        }
        return false;
    }

    // 生成二维码
    makeQrcode('.show_qrcode', $('#down_qrcode_url').html(), 300, 'canvas');
    /**
     * 是否是手机浏览器
     * @return {Boolean} [description]
     */
    function isMobileBrowser() {
        let macPC = UserAgent.indexOf('macintosh');
        if(UserAgent.indexOf('macintosh') > -1 && ('ontouchend' in document)){
            //ios 13的ipad
            return true;
        }

        if(macPC > 0){
            return false;
        }
        let wow64   = UserAgent.indexOf('wow64');
        let wow32   = UserAgent.indexOf('wow32');
        let browser = UserAgent.indexOf('browser'); // 手机基本都存在
        if(wow64 > 0 || wow32 > 0){
            if(browser > 0){
                return true;
            }else{
                return false;
            }
        }
        return true;
    }

    // 实名认证
    if(isMobileBrowser() && !parseInt(userVerify)) {
        $('#trustit').show();
        $(".down_flag").hide();
    }

    /**
     * 禁止按钮 
     */
    function disableButton() {
        // 设置禁止下载
        canDownload = false;
        // 修改
        $('.down_flag').css({
            "background-color": "#ccc",
            "border-color": "#ccc",
            "color":'gray'
        });
        $(".down_flag").attr('onclick','#');
        $(".down_flag").html('不支持该设备');
        $(".down_flag").attr('disabled', true);
        $('.down_actions_btn').hide();
        $(".down_flag").eq(1).hide();
        $(".down_flag").eq(2).hide();
        $(".commenTips").css({'top' : '780px'});
        $("#iosSend").css({'height':'auto'});
    }
    // 如果是安卓，不显示提示
    deviceType != 1 && $(".commenTips").hide();
    // 根据设备是否显示
    if(IsIpad || IsIphoneOs){
        // 检测评估
        IosVersion = IsIphoneOs ? String(String(UserAgent.match(/iphone os [1-9]+_[0-9]+/)).match(/[1-9]+_[0-9]+/)).replace('_','0') : '';
        deviceType != 1 && disableButton();
        $('#browser_mask_img').attr('src', '/static/img/ios_browser.png');
    }else{
        // 安卓或者PC电脑不显示
        deviceType == 1 && disableButton();
        $('#browser_mask_img').attr('src', '/static/img/android_browser.png');
    }

    // 微信和QQ需要浏览器打开
    if(IsWechat || isQQApp()){
        $('.down_select').hide();
        $('.open-browser-mask').show();
        $(".commenTips").hide();
        return false;
    }

    //判断是不是在iPhone的Safair浏览器打开
    function isIphoneSafair(){
        var ua = navigator.userAgent.toLowerCase();
        //判断是不是在iPhone的Safair浏览器打开的本页面
        if (ua.indexOf('applewebkit') > -1 && ua.indexOf('safari') > -1 &&
            ua.indexOf('linux') === -1 && ua.indexOf('android') === -1 && ua.indexOf('chrome') === -1 &&
            ua.indexOf('ios') === -1 && ua.indexOf('browser') === -1) {
            return true
        }else{
            return false
        }
    }
    
    if(!IsWechat && !isQQApp() && !isIphoneSafair() && (IsIpad || IsIphoneOs) && methodWay != 0){
        $('.other_ua').show();
        $('#copyurl').text(window.location.href);
        // 复制卡号函数
        $('#copyBtn').click(function(){
            var Url2=document.getElementById("copyurl").innerText;
            var oInput = document.createElement('input');
            oInput.value = Url2;
            document.body.appendChild(oInput);
            oInput.select(); // 选择对象
            document.execCommand("Copy"); // 执行浏览器复制命令
            oInput.className = 'oInput';
            oInput.style.display='none';
            alert('复制成功');
        });
        return false;
    }
    

     // udid 安装步骤
     function stepWaiting(){
        $('#stepwaiting').attr('class','step-top on');
        $('#stepswing').attr('class','step-top');
        $('#stepfinish').attr('class','step-top');
        $('.customer_service').css('margin-top', '-26px');
        $('#stepinstalling').hide();
    }

    function stepSwing(){
        $('#stepwaiting').attr('class','step-top on');
        $('#stepswing').attr('class','step-top on');
        $('#stepfinish').attr('class','step-top');
        $('.customer_service').css('margin-top', '-26px');
        $('#stepinstalling').hide();
    }

    function stepFinish(){
        $('#stepwaiting').attr('class','step-top on');
        $('#stepswing').attr('class','step-top on');
        $('#stepfinish').attr('class','step-top on');
        $('.customer_service').css('margin-top', '-26px');
        $('#stepinstalling').hide();
    }

    function stepShow(){
        $('.step_mask').show();
        $('.steptip').show()
    }

    function stepUpShow(){
        $('.steptip').css('height','50%');
        $('.customer_service').css('margin-top','30px');
        $('#stepinstalling').show()
    }
    
    $('#close_error_msg').click(function(){
        $('.error-mask').hide();
    })
    // udidCallback = 1;
    // signType = 1;
    // udid = '00008030-000C11A83A50802E';
    // udid 安装
    if(udidCallback){ 
        // 如果有错误信息
        if(errorMsg){
            $('.error-mask').show();
            return false;
        }else{
            $('.down_flag').hide();
            $('.down_select').hide();
            $(".commenTips").hide();
            // 显示安装步骤
            stepShow();
            stepWaiting();
            // 付费安装，失败时候显示二维码
            // if(parseInt(cacheDownType) == 2){
            //     setTimeout(function(){
            //         $('.customer_service').show();
            //     }, 5000);
            // }
            if(signType == 1){
                // layer_mobile.open({ content: '正在使用vip1通道', skin: 'msg', time: 2 });
            }else{
                // layer_mobile.open({ content: '正在使用vip2通道', skin: 'msg', time: 2 });
            }
            // 新加安装方法，两种安装方法
            if(signType == 1){
                $.post('/device/install.html', { rapp_id: rappId, log_id: logId, udid: udid, short:urlShort }, function(res){
                    if(res.code == 1){
                        switch(res.data){
                            case 401:
                            case 402:
                                layer_mobile.open({ 
                                    content: res.msg, 
                                    skin: 'msg', 
                                    time: 2, 
                                    end:function(){
                                        setTimeout(function(){
                                            // if(res.url != ''){
                                            //     window.location.href = res.url;
                                            // }else{
                                                window.location.reload();
                                            // }
                                        }, 2000)
                                    } 
                                });
                                break;
                            case 200:
                                stepSwing();
                                var execGetPackage = setInterval(function(){
                                    $.post('/device/getPackage.html', { rapp_id: rappId, log_id: logId, udid: udid }, function(res){
                                        switch(res.data){
                                            case 200:
                                                stepFinish();
                                                setTimeout(stepUpShow(), 5000);
                                                clearInterval(execGetPackage);
                                                if(res.url != ''){
                                                    window.location.href = res.url;
                                                }
                                                break;
                                            case 201:
                                                stepSwing();
                                                break;
                                            default:
                                                clearInterval(execGetPackage);
                                                layer_mobile.open({ content: res.msg, skin: 'msg', time: 2 });
                                                break;
                                        }
                                    });
                                }, 2000);
                                return true;
                                break;
                            default:
                                layer_mobile.open({ content: res.msg, skin: 'msg', time: 2, end:function(){
                                        setTimeout(function(){
                                            window.location.reload();
                                        }, 2000)
                                    }
                                });
                                break;
                        }
                    }
                });
            }else{
                var execTinterval = setInterval(
                    function(){
                        $.post('/device/getStatus.html', { rapp_id: rappId, log_id: logId, udid: udid }, function(res){
                            if(res.code == 1){
                                switch(res.data){
                                    case 1002:
                                    case 1001:
                                        stepWaiting();
                                        break;
                                    case 1003:
                                        stepSwing();
                                        break;
                                    case 1000:
                                        clearInterval(execTinterval);
                                        stepFinish();
                                        requestPost(
                                            '/install/device.html',
                                            { udid: udid, rapp_id: rappId, log_id: logId, down_type: cacheDownType, password: password},
                                            function(res){
                                                if(res.url != ''){
                                                    window.location.href = res.url;
                                                }
                                            },
                                            function(res){
                                                layer_mobile.open({ content: res.msg, skin: 'msg', time: 2 });
                                                return false;
                                            }
                                        );
                                        setTimeout(stepUpShow(), 5000);
                                        break;
                                    case 1005:
                                        clearInterval(execTinterval);
                                        layer_mobile.open({ content: '安装错误，2秒后自动刷新重试', skin: 'msg', time: 2, end:function(){
                                                setTimeout(function(){
                                                    window.location.reload();
                                                }, 2000)
                                            } 
                                        });
                                        break;
                                }
                            }else{
                                clearInterval(execTinterval);
                                layer_mobile.open({ content: res.msg, skin: 'msg', time: 2 });
                            }
                        })
                    }
                    ,2000
                );
            }
        }
    }

    // 非手机浏览器
    if(!isMobileBrowser()){
        $('.down_select').hide();
        $('.down_flag').hide();
        $(".commenTips").hide();
    }

    /**
     * POST 请求
     * @param {*} url 
     * @param {*} params 
     * @param {*} callback 
     * @param {*} errorback 
     */
    function requestPost(url, params, callback, errorback) {
        var loading = layer_mobile.open({ type: 2 });
        // 提交修改
        $.post(url, params, function (response) {
            layer_mobile.close(loading);
            if (response.code == 0) {
                typeof errorback == "function" && errorback(response);
            } else {
                typeof callback  == "function" && callback(response);
            }
            return false;
        }).fail(function () {
            layer_mobile.close(loading);
            layer_mobile.open({ content: '网络服务错误，请稍后重试', skin: 'msg', time: 2 });
            return false;
        });
        return false;
    }

    // 付费下载切换
    $('.showVip').click(function(){
        $('.page_index').hide() && $('.page_pay').show() && $('.page_custom').hide();
    });

    // 返回下载页面
    $('.homeBtn').click(function(){
        $('.page_index').show() && $('.page_pay').hide() && $('.page_custom').hide();
    });

    // 普通安装返回页面
    $('.install_back_home').click(function(){
        $('.installingLayer').hide() && $('.down_select').show();
    });

    // 定制安装页面
    $('.customBtn').click(function(){
        $('.page_index').hide() && $('.page_pay').hide() && $('.page_custom').show();
    });

    // 关闭错误按钮
    $('.error_btn').click(function(){
        $('.error-mask').hide();
    });

    /**
     * 下载
     * @param {*} down_type 
     */
    function download(down_type) {
        // udid 回调安装
        if(udid && rappId == cacheRappId && logId == cacheLogId && isUdidPackage && signType == 0){
            return requestPost(
                '/install/device.html',
                { udid: udid, rapp_id: rappId, log_id: logId, down_type: down_type, password: password},
                function(res){
                    if(res.url != ''){
                        window.location.href = res.url;
                    }
                },
                function(res){
                    layer_mobile.open({ content: res.msg, skin: 'msg', time: 2 });
                    return false;
                }
            );
        }

        return requestPost(
            '/install.html',
            { rapp_id: rappId, down_type: down_type, device_type: deviceType, password: password, udid: udid },
            function(res){
                if(down_type == 0){
                    // 如果返回地址为空
                    if(res.url == ''){
                        layer_mobile.open({ content: '网络服务错误，请稍后重试', skin: 'msg', time: 2 });
                        return false;
                    }
                    // 安卓设备
                    if(deviceType == 2){
                        window.location.href = res.url;
                    }else{
                        // ios 和 udid 设备
                        window.location.href = res.url;
                        $('.down_select').hide() && $('.installingLayer').show();
                        // 自动跳转信息
                        setTimeout(function(){
                            window.location.href='/static/mobileprovision/app.mobileprovision';
                        }, 15000);
                    }
                }else{
                    // 加一个定制安装
                    if(down_type == 1 && template == 0){
                        window.location.href = res.url;
                        $('#resove').hide() && $('#resove_udid').show();
                        $('.down_select').hide() && $('.installingLayer').show();
                    }
                    window.location.href = res.url;
                    // 跳转新人
                    setTimeout(function(){
                        window.location.href='/static/mobileprovision/app.mobileprovision';
                    }, 4000);
                }
            },
            function(res){
                layer_mobile.open({ content: res.msg, skin: 'msg', time: 2 });
                return false;
            }
        );
    }

    /**
     * 下载按钮
     */
    $('.download_app').click(function(){
        // 禁止下载
        if(!canDownload){
            return false;
        }
        // 下载类型
        var down_type = $(this).data('type');
        // 密码提示
        if(downWay == 1){
            $('#verify_device_type').val(down_type);
            $('#download_pssword').modal({"backdrop":"static"}).css({
                "margin-top": function () {
                    var height = (document.body.clientHeight + document.body.scrollTop) / 2;
                    return height - 100;
                }
            });
            return false;
        }
        return download(down_type);
    });

    /**
     * 密码下载
     */
    $('.verify_pssword').click(function(){
        password = $('#verify_password').val();
        if($.trim(password) == ''){
            $('#verify_password').focus();
            layer_mobile.open({ content: '密码不能为空', skin: 'msg', time: 2 });
            return false;
        }
        // 隐藏下载框
        $('#download_pssword').modal('hide');
        var down_type = $('#verify_device_type').val();
        return download(down_type);
    })

    /**
     * 二维码
     */
    $('.customer_qrcode').click(function(){
        layer.open({
            type: 1,
            title: false,
            content: $('#customer_qrcode'),
            area: ['450px', '660px'],
            closeBtn: 0,
            shade: [0.6, '#000'],
            shadeClose: true,
            time: 0,
            anim: 4,
            success: function (layero, index) {
                $('.surebtn').click(function () {
                    layer.close(layer.index);
                })
            },
        });
    });

     // 免责声明弹窗
     $('.exemption').on('click', function () {
        layer.open({
            type: 1,
            title: false,
            content: $('#exemption'),
            area: ['450px', '600px'],
            closeBtn: 0,
            shade: [0.6, '#000'],
            shadeClose: true,
            time: 0,
            anim: 4,
            success: function (layero, index) {
                $('.surebtn').click(function () {
                    layer.close(layer.index);
                })
            },
        });
    });
    
    // ------ 老版本 ---- //
    new Vue({
        el: "#pc-report",
        data: {
            imgurl: '',
            schedule: 0
        },
        methods: {
            getFile: function (event) {
                let files = this.$refs.File.files;
                let file = files[0];
                obj = this;
                let fileSize = files[0].size / 1024 / 1024;
                let fileName = files[0].name;
                if (fileSize > 10) {
                    alert("选择的文件不能大于10Mb");
                    return false;
                }
                //获取文件后缀名
                let index = fileName.lastIndexOf(".");
                let suffix = fileName.substr(index + 1);
                if (suffix != 'jpg' && suffix != 'png' && suffix != 'gif' && suffix != 'jpeg') {
                    alert("选择的文件格式不对");
                    return false;
                }
                let type = $("input[name='radio-1-set']:checked").val();
                let content = $('#reason-report').val();
                let rname = $('input[name=rname]').val();
                let mobile = $('input[name=mobile]').val();

                //获取用户ip
                Ip = "{:getIP()}";
                let params = {
                    rappId: "{$appInfo->rappId}",
                    Ip: Ip,
                    mobile: mobile,
                    rname: rname,
                    content: content,
                    type: type
                };
                obj.$http.post(HTTP_HOST_API + 'user/reportImgToken', params).then(function (iconResult) {
                    let iconRes = JSON.parse(iconResult.bodyText);
                    if (iconRes.code == 1000) {
                        let iconTempFileName = iconRes.data.tmpFileName + '.png';
                        let iconToken = iconRes.data.upToken;
                        upload_file(file, iconTempFileName, iconToken, function (iconSuccess) {
                            layer.msg('图片上传成功')
                        })
                    }
                })
            },
        }
    })

    if (IsIpad || IsIphoneOs || IsMidp || IsUc7 || IsUc || IsAndroid || IsCE || IsWM) {

        $('.report').on('click', function () {
            window.location.href = "/index/download/mobile?rappId=" + rappId;
        })
    } else {
        // pc端举报弹窗
        $('.report').on('click', function () {
            layer.open({
                type: 1,
                title: false,
                content: $('#pc-report'),
                area: ['620px', '800px'],
                closeBtn: 0,
                shade: [0.6, '#000'],
                shadeClose: true,
                time: 0,
                anim: 4,
                success: function (layero, index) {
                    $('.surebtn').click(function () {
                        layer.close(layer.index);
                    })
                },
            });
        })
    }
})