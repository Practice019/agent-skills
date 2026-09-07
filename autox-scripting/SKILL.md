---
name: autox-scripting
description: "编写、调试 AutoX.js（Auto.js 分支）自动化脚本：截图、找图找色、坐标点击、Shizuku 权限、多线程、文件操作等 API 用法与常见坑。当用户需要在 AutoX/Auto.js 里写自动化脚本、找图点击、或遇到无障碍/截图/Shizuku/找图不中问题时使用。"
whenToUse: "用户要求写 AutoX/Auto.js 脚本；用户在做手机自动化（找图点击、游戏辅助、自动点击）；用户报告 AutoX 无障碍被删、截图失败、screencap 卡死、findImage 匹配不上、Shizuku 用法等问题。"
---

# AutoX.js 脚本开发

## 目标与边界

**做**：给出 AutoX 脚本的 API 用法、代码模板、调试思路和常见坑的解决方案。

**不做**：
- ❌ 不负责 AutoX 源码的编译打包（那是 Android 逆向/构建的范畴）
- ❌ 不替代官方文档（官方文档见 https://autox-doc.vercel.app/docs）

## 一、技术栈定位（先说清楚本质）

AutoX.js = **Rhino 1.8.0 JS 引擎**（原生 JS 语法，ES5 + 部分 ES6）+ **一大层 AutoX 专有 API**（Java/Kotlin 实现）。

- **JS 原生**：`var/function/if/for/while`、`Math`、`JSON`、`Array`、`String`、`Date`、`Promise`
- **AutoX 专有**：`captureScreen`、`findImage`、`images.read`、`shizuku`、`sleep`、`toast`、`files.*`、`threads.*`、`click` 等

**关键认知**：重活（截图、找图、点击）都是 AutoX 用 Java/Kotlin + 底层库（OpenCV、MediaProjection、Shizuku binder）实现的，JS 只是"胶水层"负责逻辑控制。因此 AutoX 脚本不能拿去浏览器/Node 跑，脚本能力受 AutoX 版本限制。

## 二、两代 API 区分（必知）

| 代际 | 脚本后缀 | 引擎 | 说明 |
|---|---|---|---|
| **第一代 v6** | `.js` | Rhino | 默认，绝大多数脚本用这个 |
| **第二代 v7** | `.node.js` | Node.js | 较新，支持 npm 模块 |

判断技巧：`shizuku` 在 v6 是**函数**（`shizuku('cmd')`），在 v7 是**模块对象**。写脚本时优先按 v6/Rhino 语法。

## 三、核心 API 速查

### 3.1 全局函数（globals）

```js
sleep(ms)          // 暂停 ms 毫秒（1000 = 1秒）
toast(msg)         // 气泡提示（异步，不阻塞）
toastLog(msg)      // 气泡 + 控制台输出
exit()             // 立即停止脚本（内部抛 ScriptInterrupttedException）
log(msg)           // 控制台输出
random(min, max)   // [min,max] 随机整数；random() 为 [0,1) 浮点
currentPackage()   // 当前前台应用包名（依赖无障碍）
currentActivity()  // 当前 Activity（依赖无障碍）
waitForPackage(pkg[, period=200])   // 等待应用出现
waitForActivity(act[, period=200])  // 等待 Activity 出现
```

### 3.2 坐标点击（coordinatesBasedAutomation）

```js
click(x, y)                    // 点击坐标，返回是否成功（约150ms）
longClick(x, y)                // 长按（约600ms）
press(x, y, duration)          // 按住 duration 毫秒（连点用 press(x,y,1)）
swipe(x1, y1, x2, y2, dur)     // 滑动
setScreenMetrics(w, h)         // 设定设计分辨率，跨分辨率自动放缩坐标
```

> **注意**：`click` 系列依赖**无障碍服务**或 **root**（Android 7.0+ 可用无障碍）。无障碍被封杀时用 Shizuku 代替（见 3.4）。

### 3.3 图像与找图（images）—— 最常用

```js
// 截图（MediaProjection，需先申请权限，一次即可）
requestScreenCapture([landscape])   // 申请截图权限，返回 boolean
var img = captureScreen()           // 截图，返回 Image 对象（不返回 null）

// 读写图片
var tpl = images.read('/sdcard/tpl.png')   // 读本地图，失败返回 null
images.save(img, path[, format='png', quality=100])
images.clip(img, x, y, w, h)               // 裁剪

// 找图（模板匹配）
var p = findImage(img, template[, options])
// options: { threshold: 0.9, region: [x,y,w,h], level: n, transparentMask: false }
// threshold 默认 0.9（相似度 0~1）；level 是金字塔层数，越大越快但可能漏
// 返回 Point（{x, y} 左上角），找不到返回 null

// Image 对象方法
img.getWidth(); img.getHeight(); img.recycle(); img.pixel(x,y)
```

**找图点击的正确姿势**：`findImage` 返回的是**左上角坐标**，点中心要 `x + w/2, y + h/2`。

```js
var p = findImage(screen, tpl, { threshold: 0.7, level: 4 });
if (p) {
    var cx = Math.floor(p.x + tpl.getWidth() / 2);
    var cy = Math.floor(p.y + tpl.getHeight() / 2);
    shizuku('input tap ' + cx + ' ' + cy);
}
```

### 3.4 Shizuku（免 root 提权执行 shell）

```js
shizuku(cmd)         // 运行 shell 命令，返回 ShellResult（有 .code 字段）
shizuku.isAlive()    // Shizuku 是否可用，返回 boolean
shizuku.openAccessibility()   // 直接打开无障碍服务
shizuku.runRhinoScript(script)     // 在 shizuku 进程运行脚本（高权限）
shizuku.runRhinoScriptFile(path)
```

典型用法（点击，避开被删的无障碍）：

```js
var r = shizuku('input tap 500 500');
console.log(r.code);   // 0 = 成功
```

> **前置**：需安装 Shizuku App 并激活（adb / 无线调试 / root），并授权 AutoX。

### 3.5 多线程（threads）

```js
var t = threads.start(function(){ ... })   // 新线程
t.join([timeout])   // 等待线程结束
t.isAlive()         // 线程是否存活
t.interrupt()       // 中断线程
threads.shutDownAll()
threads.runAsync(fn)  // 返回 Promise
```

> 主线程会等所有子线程结束才停止；子线程死循环时用 `exit()` 或 `shutDownAll()`。

### 3.6 文件（files）

```js
files.read(path[, 'utf-8'])       // 读文本
files.write(path, text)           // 写文本（覆盖）
files.append(path, text)          // 追加
files.exists(path)                // 是否存在
files.ensureDir(path)             // 确保目录存在
files.createWithDirs(path)
files.listDir(path[, filter])     // 列目录，返回文件名数组
files.copy(from, to); files.move(from, to); files.remove(path)
files.join(parent, child)         // 拼接路径
```

## 四、典型脚本模式

### 4.1 找图点击循环（监控按钮）

```js
requestScreenCapture(false);
var tpl = images.read('/sdcard/tpl.png');
while (true) {
    var img = captureScreen();
    var p = findImage(img, tpl, { threshold: 0.7, level: 4 });
    if (p) {
        var cx = Math.floor(p.x + tpl.getWidth() / 2);
        var cy = Math.floor(p.y + tpl.getHeight() / 2);
        shizuku('input tap ' + cx + ' ' + cy);
    }
    img.recycle();
    sleep(2000);
}
```

### 4.2 模板文件夹自动加载（不改代码加按钮）

```js
var dir = '/sdcard/tpl/';
files.ensureDir(dir);
var tpls = [];
files.listDir(dir).sort().forEach(function (n) {
    if (!n.endsWith('.png') && !n.endsWith('.jpg')) return;
    var t = images.read(dir + n);
    if (t) tpls.push({ name: n, img: t, w: t.getWidth(), h: t.getHeight() });
});
// 循环里遍历 tpls 依次 findImage，命中即点
```

约定：文件名 `01_xxx.png`、`02_xxx.png`… 数字前缀决定匹配优先级（小的先找）。

## 五、常见坑（按频率排序）

1. **无障碍被国行 HyperOS 反诈秒删**：安全中心在系统设置层撤销无障碍授权（包名黑名单 + 侧载未备案 + 全窗口监听 + 执行外部脚本，多维度判定）。无 Root 无法根治，改用 **Shizuku `input tap`** 绕过。
2. **`click()` 报"无障碍服务未启动"**：同坑 1，改用 `shizuku('input tap x y')`。
3. **findImage 匹配不上**：① threshold 默认 0.9 太高，降到 0.7；② 模板别带背景、尺寸要和屏幕上一致；③ 当前截图不是目标界面（比如截到了 AutoX 自己）。
4. **`captureScreen()` 报 SecurityException / 截图失败**：没先 `requestScreenCapture()`，或旧脚本占着截图会话（先停止旧脚本再跑）。
5. **Shizuku screencap 卡死**：AutoX 复用的 shell 会话执行多次 screencap 后死亡且缓存未清理，后续命令永久阻塞。缓解：降频（2.5秒/次）+ 卡死超时检测 + 卡死后手机 Shizuku App「停止→启动」。
6. **Image 内存泄漏**：循环里创建的 Image 用后要 `img.recycle()`（`captureScreen()` 返回的不用回收）。
7. **`toast()` 异步**：循环里连续 toast 会刷屏，需加 `sleep`。
8. **`exit()` 能被 try...catch 拦截**：它是靠抛异常实现的，捕获后不会立即停止。

## 六、实战经验（真机 JJ象棋 + Redmi HyperOS）

- 真机 Redmi 24122RKC7C，Android 16，国行 HyperOS，无 Root。
- 无障碍被反诈秒删 → 点击改用 `shizuku('input tap')`。
- 有 MediaProjection 录屏（屏幕共享）时，截图不能用 `captureScreen`（冲突），改用 `shizuku('screencap -p /sdcard/_scr.png')` + `images.read`。
- 模板按钮：关闭按钮 ×（106×95）、再来一局（515×189），threshold 0.7 / level 4。
- Shizuku 需装 App 并激活（adb 或无线调试或 root）；无线调试配对一次后，卡死时手机 App 里「停止→启动」即可，不需 adb。

## 参考

- 官方文档：https://autox-doc.vercel.app/docs
- 模块索引：/docs/rhino/base/（基础）、/docs/rhino/advanced/（进阶，含 images/shizuku/threads/shell）
