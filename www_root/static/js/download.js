var ceshi;
var stepNum;
var fid;
var ua = navigator.userAgent;
var unfold = '更多';
var packUp = '收起';
var copyTip = '链接复制成功，快去打开吧~';
var openBrower = '请在自带浏览器中打开此网页';
var unit = '万';
var more = '更多';
var statePre = '准备中...';
var stateDown = '下载中';
var stateIns = '安装中...';
var s = '秒';
var open = '打开';
var openDes = '在桌面打开';
var faileTip = '应用加载失败,请重试';
var only = '该应用只支持iOS,需在iOS设备Safari中访问及安装';
var lang = (navigator.systemLanguage ? navigator.systemLanguage : navigator.language);
var lang = lang.substr(0, 2);
if (!(lang == 'zh')) {
    unfold = 'more';
    packUp = 'pack up';
    copyTip = 'Copied successfully. Go and open it.';
    openBrower = 'Open this page in your own browser';
    unit = 'w';
    more = 'More';
    statePre = 'preparing...';
    stateDown = 'Downloading';
    stateIns = 'Installing...';
    open = 'Open';
    s = 's';
    openDes = 'Open on the desktop';
    faileTip = 'Failed to load, please try again';
    only = 'Only supports iOS and needs to be accessed and installed on iOS device Safari.';
}
$(function() {
    stepNum = getUrlParam('step');
    fid = getUrlParam('fid');
    if (!localStorage.getItem('__jx__app__id__') && fid) {
        localStorage.setItem('__jx__app__id__', fid)
    }
    $('.open-btn').on('click', function() {
        var $this = $(this);
        if ($this.html() == '展开' || $this.html() == 'more') {
            $this.html(packUp);
            $('.comment-con,.information-box').removeClass('hidden');
        } else {
            $('.comment-con,.information-box').addClass('hidden');
            $this.html(unfold);
        }
    })
    $('.mask-colsed').on('click', function() {
        $(this).parents('.mask-box').hide();
    })
    $('.file-info').on('click', function() {
        $('.file-box').show();
    });
    $('.colsed-btn').on('click', function() {
        $(this).parents('.file-box').hide();
    });
    var copyBtn = new ClipboardJS('.copy-url button');
    copyBtn.on('success', function(e) {
        alert(copyTip);
        $('.safari-tips').hide();
    });
    copyBtn.on('error', function(e) {
        console.log(e);
    });
    $('.arouse').click(function() {
        $('.step-tips').show();
        swiperFn();
    });
    if (/(iPhone|iPad|iPod|iOS)/i.test(ua)) {
        if ((/Safari/.test(ua) && !/Chrome/.test(ua) && !/baidubrowser/.test(ua))) {} else {
            var ual = ua.toLowerCase();
            var isWeixin = ual.indexOf('micromessenger') != -1;
            if (isWeixin) {
                $('.mask').show();
                $("html").add("body").css({
                    "overflow": "hidden"
                })
            } else {
                $('.safari-tips').show();
            }
        }
    } else if (/(Android)/i.test(ua)) {
        var ual = ua.toLowerCase();
        var isWeixin = ual.indexOf('micromessenger') != -1;
        if (isWeixin) {
            alert(openBrower)
        }
    } else {
        $('.contain-page').hide();
        $('.pc-box').show();
    }
    var downNum = parseInt($('.down-count').html());
    if (downNum < 10000) {
        downNum = parseFloat(downNum).toLocaleString()
    } else if (downNum < 100000) {
        downNum = (downNum / 10000).toFixed(2) + unit
    } else if (downNum < 1000000) {
        downNum = (downNum / 10000).toFixed(1) + unit
    } else {
        downNum = parseInt(downNum / 10000).toLocaleString() + unit
    }
    $('.down-count').html(downNum);
    var introBox = $('.app-intro-con');
    for (var j = 0; j < introBox.length; j++) {
        var introHeight = introBox.eq(j).find('p').height();
        var introBoxHeight = introBox.eq(j).height();
        if (introHeight > introBoxHeight) {
            introBox.eq(j).find('span').show();
        } else {
            introBox.eq(j).css('height', 'auto')
            introBox.eq(j).find('span').hide();
        }
    }
    $('.app-intro-con span').on('click', function() {
        var $this = $(this);
        if ($this.html() == '更多' || $this.html() == 'more') {
            $('.app-intro-con').addClass('open');
            $this.hide()
        } else {
            $('.app-intro-con').removeClass('open');
            $this.html(unfold)
        }
    })
    $('.copy-url input').val(location.host)
    if (status == 1) {
        setStepClass();
    }
});
function setStepClass() {
    if (stepNum) {
        bindInstallBtnEvent(stepNum);
        $('#appSteps').addClass('step0' + (Number(stepNum) + 1));
    } else {
        $('#appSteps').addClass('step01');
        bindInstallBtnEvent('0');
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
function swiperFn() {
    var swiper = new Swiper('.step-swiper', {
        pagination: '.step-swiper .swiper-pagination',
        paginationClickable: true,
        onSlideChangeEnd: function(swiper) {
            swiper.update();
        }
    });
}

