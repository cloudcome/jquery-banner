# jquery-banner [![spm version](http://spmjs.io/badge/jquery-banner)](http://spmjs.io/package/jquery-banner)
AUTHOR WEBSITE: [http://ydr.me/](http://ydr.me/)

**五星提示：当前脚本未作优化，请勿用在生产环境**

__IT IS [A SPM PACKAGE](http://spmjs.io/package/jquery-banner).__




#usage
```
var $ = require('jquery');
require('jquery-banner')($);


// 1. init
// 初始化
$().banner({...});

// 2. autoPlay
// 设置autoPlay为假，一般用于图片的预加载，加载完成之后再渲染。
$().banner("play");
$().banner("pause");

// 3. prev next
// 控制banner的上下一张
$().banner("prev",function(displayIndex){});
$().banner("next",function(displayIndex){});

// 4. toIndex
// 控制banner显示的序号
$().banner(0); // 显示第一张banner

```



#options
```
$.fn.banner.defaults = {
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
```
