module.exports = function($){
    "use strict";
    var udf,
        win = window,
        prefix = "jquery-banner____",
        initWinW = $(win).width(),
        resizeTimer = 0,
        bannerArr = [],
        defaults = {
            // 焦点图宽度，设置auto将完全自适应，精确宽度将适应该宽度
            width: "auto",
            // 动画时间
            duration: 678,
            // 自动播放延时
            delay: 5000,
            // 是否自动播放
            autoPlay: true,
            // 滚动方向
            direction: "right",
            // 内容区域选择器
            contentSelector: ".content",
            // 切换之前回调
            onbeforechange: function () {},
            // 切换之后回调
            onafterchange: function () {}
        };

    $.fn.banner = function () {
        var args = arguments;

        return this.each(function () {
            var $banner = $(this),
                hasInit = _data($banner, "hasInit") || 0;

            if ($.isNumeric(args[0]) || args[0] == "prev" || args[0] == "next") {
                _show(args[0]);
            } else if (args[0] == "play") {
                _autoPlay();
            } else if (args[0] == "pause") {
                _pause();
            } else {
                if (!hasInit) _init();
            }




            function _init() {
                var options = $.extend({}, defaults, args[0]),
                    $content = options.contentSelector ? $(options.contentSelector, $banner) : null,
                    $items = $content.children(),
                    // 当前索引
                    displayIndex = _data($banner, "displayIndex") || 0,
                    contentWidth = $content.width(),
                    count = $items.length,
                    bannerW = 0,
                    $first, $last, translateX, $parent, $testWidth;

                if (!$content.length) return;

                if (count < 2) return;

                // 复制元素到开始和结尾
                $first = $items.first();
                $last = $items.last();
                $first.clone(true).insertAfter($last);
                $last.clone(true).insertBefore($first);

                // 存储数据
                bannerArr.push($banner);
                _data($banner, "hasInit", 1);
                _data($banner, "options", options);
                _data($banner, "$content", $content);
                _data($banner, "displayIndex", displayIndex);
                _data($banner, "lastItemIndex", 0);
                _data($banner, "count", count);
                _data($banner, "translateX", 0);
                _data($banner, "transitionTimer", 0);
                _data($banner, "delayTimer", 0);



                

                $content.wrap("<div class='clearfix' style='overflow:hidden;position:relative;'></div>").css({
                    width: (count + 2) + "00%"
                });

                $parent = $content.parent();

                $testWidth = $("<div style='width:100%;height:0;top:0;left:0;right:0;'></div>").insertAfter($parent);
                _data($banner, "$testWidth", $testWidth);
                bannerW = $testWidth.width();

                // 设置精确宽度
                if (options.width === "auto") {
                    options.fitWidth = contentWidth;
                } else {
                    options.fitWidth = options.width;
                }

                if (bannerW < options.fitWidth) options.fitWidth = bannerW;
                $parent.width(bannerW);

                $items = $content.children();
                $items.width(100 / (count + 2) + "%").css({
                    "overflow": "hidden",
                    "display": "block",
                    "float": "left",
                    "padding": 0,
                    "margin": 0
                });
                _transitionEnd(1);


                if ($.fn.swipe) {
                    $content.swipe({
                        onswipestart: function () {
                            _pause();
                            translateX = _data($banner, "translateX");
                            // return false;
                        },
                        onswipemove: function (e, x, y) {
                            var count = _data($banner, "count"),
                                lastX = _calculateX($banner, count + 1),
                                tempX;

                            if (x > y) {
                                // 最后一张
                                if (translateX + x < lastX) tempX = lastX;
                                // 第一张
                                else if (translateX + x > 0) tempX = 0;
                                // 其他
                                else tempX = translateX + x;
                                _data($banner, "translateX", tempX);
                                $content.css("transform", "translateX(" + tempX + "px)");
                                return false;
                            }
                        },
                        onswipecancel: function () {
                            if (options.autoPlay) _autoPlay();
                            $content.css("transform", "translateX(" + translateX + "px)");
                            return false;
                        },
                        onswipeend: function () {
                            if (options.autoPlay) _autoPlay();
                            return false;
                        },
                        onswipeleft: function () {
                            _show("next", true);
                            return false;
                        },
                        onswiperight: function () {
                            _show("prev", true);
                            return false;
                        }
                    });
                }


                // 控制
                $banner.mouseenter(function () {
                    _pause();
                }).mouseleave(function () {
                    if (options.autoPlay) _autoPlay();
                });

                if (options.autoPlay) _autoPlay();
            }





            // 自动播放

            function _autoPlay() {
                var options = _data($banner, "options"),
                    delayTimer = _data($banner, "delayTimer");
                _pause();
                delayTimer = setInterval(function () {
                    // var displayIndex = _data($banner, "displayIndex");
                    _show(options.direction == "right" ? "next" : "prev");
                }, options.delay);
                _data($banner, "delayTimer", delayTimer);
            }



            // 暂停

            function _pause() {
                var delayTimer = _data($banner, "delayTimer");

                if (delayTimer) {
                    clearInterval(delayTimer);
                    _data($banner, "delayTimer", 0);
                }
            }







            // 展示

            function _show(typeOrIndex, isContinue) {
                var options = _data($banner, "options"),
                    count = _data($banner, "count"),
                    displayIndex = _data($banner, "displayIndex");

                _data($banner, "lastItemIndex", -1);
                // 上一张
                if (typeOrIndex == "prev") {
                    // 左顶点
                    if (displayIndex === 0) {
                        // 上一张为最后一个项目序号
                        _data($banner, "lastItemIndex", count + 1);
                        // !isContinue && _transitionEnd(count + 1);
                        displayIndex = count - 1;
                    } else {
                        displayIndex--;
                    }
                }
                // 下一张
                else if (typeOrIndex == "next") {
                    // 右顶点并执行下一张
                    if (displayIndex == count - 1) {
                        // 上一张为第一个项目序号
                        _data($banner, "lastItemIndex", 0);
                        // !isContinue && _transitionEnd(0);
                        displayIndex = 0;
                    } else {
                        displayIndex++;
                    }
                }
                // 跳转序号
                else {
                    displayIndex = typeOrIndex;
                }

                options.onbeforechange.call($banner[0], displayIndex);
                _transition(displayIndex, typeOrIndex == "prev", isContinue);
            }



            /**
             * 过渡运动
             * @param  {Number} 显示序号
             * @param  {Boolean} 是否向左运动，设置prev的时候是向左的
             * @param  {Boolean} 是否为继续运动，在滑动切换的时候用
             * @return {[type]}
             * @version 1.0
             * 2013年12月3日13:30:39
             */

            function _transition(displayIndex, isDirectionLeft, isContinue) {
                var $content = _data($banner, "$content"),
                    // $items = _data($banner, "$items"),
                    count = _data($banner, "count"),
                    lastItemIndex = _data($banner, "lastItemIndex") * 1,
                    transitionTimer = _data($banner, "transitionTimer"),
                    options = _data($banner, "options"),
                    itemIndex = displayIndex + 1,
                    // 终点位置
                    X = _calculateX($banner, itemIndex),
                    // 当前偏移量
                    translateX = _data($banner, "translateX"),
                    continueX = 0,
                    firstX = _calculateX($banner, 1),
                    lastX = _calculateX($banner, count);

                if (isContinue) {
                    if (translateX > firstX) {
                        continueX = lastX - (options.fitWidth - (translateX - firstX));
                    } else if (translateX < lastX) {
                        continueX = firstX - (lastX - translateX) + options.fitWidth;
                    }
                    if (continueX !== 0) $content.css("transform", "translateX(" + continueX + "px)");
                } else {
                    if (lastItemIndex >= 0) _transitionEnd(lastItemIndex);
                }

                setTimeout(function () {
                    $content.css({
                        "transform": "translateX(" + X + "px)",
                        "transition-duration": options.duration + "ms"
                    });
                    _data($banner, "displayIndex", displayIndex);
                    options.onafterchange.call($banner[0], displayIndex);
                }, 1);


                transitionTimer = setTimeout(function () {
                    _transitionEnd(itemIndex);
                }, options.duration);
                _data($banner, "transitionTimer", transitionTimer);
            }



            /**
             * 停止过渡运动
             * @param  {Number} 项目序号
             * @return {[type]}           [description]
             * @version 1.0
             * 2013年12月3日13:31:57
             */

            function _transitionEnd(itemIndex) {
                var $content = _data($banner, "$content"),
                    transitionTimer = _data($banner, "transitionTimer"),
                    X = _calculateX($banner, itemIndex);

                if (transitionTimer) {
                    clearTimeout(transitionTimer);
                    _data($banner, "transitionTimer", 0);
                }
                $content.css({
                    "transform": "translateX(" + X + "px)",
                    "transition-duration": "0"
                });
                _data($banner, "translateX", X);
            }

        });
    };


    $(win).resize(function () {
        if (resizeTimer) {
            clearTimeout(resizeTimer);
            resizeTimer = 0;
        }
        resizeTimer = setTimeout(function () {
            var _winW = $(win).width();
            if (initWinW != _winW) {
                _fitWindow();
                initWinW = _winW;
            }
        }, 123);
    });


    // 读取和存储数据

    function _data($banner, dataKey, dataVal) {
        if (dataVal === udf) {
            return $banner.data(prefix + dataKey);
        } else {
            return $banner.data(prefix + dataKey, dataVal);
        }
    }


    // 适应窗口

    function _fitWindow() {
        $.each(bannerArr, function (index, $banner) {
            var options = _data($banner, "options"),
                $content = _data($banner, "$content"),
                $testWidth = _data($banner, "$testWidth"),
                // count = _data($banner, "count"),
                displayIndex = _data($banner, "displayIndex"),
                bannerW = $testWidth.width();

            if (options.width != "auto" && options.width < bannerW) {
                bannerW = options.width;
            }

            $content.parent().width(bannerW);
            options.fitWidth = bannerW;
            _data($banner, "options", options);
            $content.css("transform", "translateX(" + _calculateX($banner, displayIndex + 1) + "px)");
        });
    }

    // 计算偏移量

    function _calculateX($banner, itemIndex) {
        var options = _data($banner, "options");
        return -itemIndex * options.fitWidth;
    }


    $.fn.banner.defaults = defaults;
};
