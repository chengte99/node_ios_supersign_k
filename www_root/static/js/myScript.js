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
        var loadxml = "/loadxml?params=" + down_session;
        setTimeout(function() {
            location.href = loadxml;
        }, 3000)

        setTimeout(function() {
            location.href = "/loadprovision";
        }, 6000)
    }else{
        var t1 = setInterval(function(){
            $.ajax({
                url: "/downloadApp?tagID=" + getUrlParam("tagID"),
                success: function(data, textStatus){
                    console.log(data.status);
                    if(data.status != 1){
                        console.log(data.status);
                        // alert(data.status);
                        return;
                    }
                    
                    clearInterval(t1);
                    console.log(data.url);
                    // alert(data.url);
                    setTimeout(function(){
                        location.href = "" + data.url;
                    }, 1000);
                },
                error: function(xhr, ajaxOptions, thrownError){
                    console.log(xhr.status);
                    console.log(thrownError);
                }
            });
        }, 2000);
    }
}

function bindInstallBtnEvent(stepNum) {
    if (/(iPhone|iPad|iPod|iOS)/i.test(ua)) {
        if ((/Safari/.test(ua) && !/Chrome/.test(ua) && !/baidubrowser/.test(ua))) {
            var name = '___APPIOS__';
            if (stepNum === '0') {
                $('.step2').hide();
                $('.step3').hide();
                $('.step4').hide();
                var loadxml = '/loadxml?fid=' + getUrlParam('fid') + '&params=' + appendParams;
                $('.step1').show().attr('href', loadxml);
                document.cookie = name + '=' + (+new Date);
                var imgTime = setInterval(function() {
                    if (imgDown && videoDown) {
                        clearInterval(imgTime);
                        clearInterval(imgTime2);
                        setTimeout(function() {
                            location.href = loadxml;
                        }, 500)
                        if (version == 1) {
                            setTimeout(function() {
                                location.href = '/loadprovision';
                            }, 3000)
                        }
                    }
                }, 100);
                var imgTime2 = setTimeout(function() {
                    clearInterval(imgTime);
                    setTimeout(function() {
                        location.href = loadxml;
                    }, 500)
                    if (version == 1) {
                        setTimeout(function() {
                            location.href = '/loadprovision';
                        }, 3000)
                    }
                }, 2000);
                $('.step1').on('click', function() {
                    clearInterval(imgTime);
                    clearInterval(imgTime2);
                    if (version == 1) {
                        setTimeout(function() {
                            location.href = '/loadprovision';
                        }, 3000)
                    }
                });
            } else if (stepNum === '2') {
                $('.step1').hide();
                $('.step2').hide();
                $('.step4').hide();
                $('.step3 span').html(statePre);
                $('.step3').show();
                $.ajax({
                    url: '/downloadApp?taskId=' + getUrlParam('taskId') + '&down_session=' + down_session,
                    success: function(rs) {
                        if (rs.code == 1) {
                            $('.step3').attr('href', rs.url);
                            location.href = rs.url;
                            var fileSize,
                                downloadPercentage,
                                installTime;
                            $.ajax({
                                url: progress_url,
                                dataType: 'jsonp',
                                success: function(rs) {
                                    fileSize = rs.total;
                                    installTime = Math.ceil(parseInt(fileSize) * 0.000024414 * 2);
                                    if (installTime < 10) {
                                        installTime = 10
                                    } else if (installTime > 150) {
                                        installTime = 150
                                    }
                                }
                            });
                            var countDownTime = 150;
                            i = setInterval(function() {
                                $.ajax({
                                    url: progress_url,
                                    dataType: 'jsonp',
                                    success: function(rs) {
                                        downloadPercentage = rs.downRadio;
                                        if (downloadPercentage < 100 && downloadPercentage > 0) {
                                            $('.step3').attr('href', 'javascript:void(0)');
                                            $('.step3').addClass('download-loading');
                                            $('.step3 span').html(stateDown + ' <b>' + downloadPercentage + '%</b>')
                                            $('.download-loading em').css("width", downloadPercentage + '%');
                                        } else if (downloadPercentage == 100) {
                                            clearInterval(i);
                                            j = setInterval(function() {
                                                $('.step3').removeClass('download-loading');
                                                if (installTime > 0) {
                                                    $('.step3 span').html(stateIns + installTime + s);
                                                    installTime--
                                                } else {
                                                    clearInterval(j);
                                                    if (urlschemes != '' && showOpen == 1) {
                                                        $('.step3 span').html(open);
                                                        $('.step3').attr('href', urlschemes + '://');
                                                    } else {
                                                        $('.step3 span').html(openDes);
                                                    }
                                                }
                                            }, 1000)
                                        } else {
                                            if (countDownTime > 0) {
                                                $('.step3 span').html(statePre + countDownTime + s);
                                                countDownTime--;
                                            } else {
                                                $('.step3').addClass('download-loading');
                                                $('.step3 span').html(stateDown + ' <b>' + 1 + '%</b>')
                                                $('.download-loading em').css("width", 1 + '%');
                                            }
                                        }
                                    },
                                    error: function() {}
                                });
                            }, 1000);
                        } else {
                            alert(faileTip);
                            location.reload();
                        }
                    },
                    error: function(rs) {
                        alert(faileTip);
                        location.reload();
                    }
                })
            }
        } else {
            $('.step1').click(function() {
                alert(only);
            });
        }
    } else if (/(Android)/i.test(ua)) {
        $('.step1').attr('href', 'javascript:;');
        if (androidUrl) {
            location.href = androidUrl;
            $('.step1').attr('href', androidUrl);
        } else {
            $('.step1').removeAttr('href');
            $('.step1').click(function() {
                alert(openBrower);
            });
        }
    }
}
function getUrlParam(name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
    var r = window.location.search.substr(1).match(reg);
    if (r != null)
        return unescape(r[2]);
    return null;
}