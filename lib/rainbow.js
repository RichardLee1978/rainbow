/**
 * 以文件夹嵌套的形式来表示route配置。

 controllers文件夹里可以放置很多controller，而且程序初始化的时候会扫描这个文件夹，对所有controller进行初始化，然后自动生成对应的url的route，这是本框架的一大特色。

 controllers里可以创建多层文件夹，每个文件夹代表route里的一级。

 例如 这样的目录结构 /controllers/user/admin.js 里面有一个 createUser: get的定义。

 则在浏览器里这样访问 www.example.com/controllers/user/admin/createUser

 同样，你可以这样来创建一个文件夹里的多个controller /controllers/user/admin/index.js
 这样的效果跟上面的完全一样，然后admin文件夹下可以继续细分其他的controller文件。

 支持正则route，写法："reg:/(.*)" reg:指定是正则，后面跟正则路径
 controller代码的结构：
 module.exports.controllers = {
    "/list":{
        "get:doc":{
            "desc":"接口说明",
            ”params":{
                "token":"token"
            }
        },
        "get":function(req,res){
            var userId = commUtil.decrypt(req.query.token);
            detectionService.getAll(req.query.page||1,20,{

            },function(err,orders){
                if (err) {
                    res.send(commUtil.createParameterErrorMsg(err.message));
                } else {
                    res.send(commUtil.createNormalOK(orders));
                }
            })
        }
    }
 }
 module.exports.filters = {
    "/list":{
        get:['checkLogin']
        post:['checkLoginJson']
    }
 }

 配置方法：
 rainbow.route(app, {
    controllers: '/controllers/',
    filters: '/filters/',
    template: '/views/'
});
 *
 * @param  {Express} app  express实例
 * @param  {Object} paths (optional) For configure relative paths of
 *                        controllers and filters rather than defaults.
 */

var approot = g_config.base_path;
var glob = require('glob');
var methods = require('methods');
var fs = require("fs");

// express可以绑定all的http动作
methods.push('all');
var Rainbow = {
    docs:{}
};
global.Rainbow = Rainbow;
/**
 * Main function to initialize routers of a Express app.
 *
 * @param  {Express} app  Express app instance
 * @param  {Object} paths (optional) For configure relative paths of
 *                        controllers and filters rather than defaults.
 */
exports.route = function (app, paths) {
    paths = paths || {};
//    app.set('views', approot+ paths.template);
    var ctrlDir = approot + (paths.controllers || '/controllers');
    var fltrDir = approot + (paths.filters || '/filters');
//    var tplDir = approot + (paths.template || "/template");

    glob.sync(ctrlDir + '/**/*.+(js|coffee)').forEach(function (file) {
        file = file.replace(/\/index\.(js|coffee)$/, '');
        var router = require(file);
        var single = typeof router == 'function';
        var path = file.replace(ctrlDir.replace(/\/$/,""), '').replace(/\.(js|coffee)$/, '');
//        var tplPath = tplDir +path + ".html";
//        var isTplExist = fs.existsSync(tplPath);
        var setup = function(req,res,next) {
            req.rb_path=path;
        };
        for(var i in router.controllers){
            if(/^reg:/.test(i)){
                var p = new RegExp(path + i.replace(/^reg:/,""));

            }else{
                var p = (path + i);
                if(p!="/"){
                    p=p.replace(/\/$/,"")
                }
            }


            var r = router.controllers[i];
            var f = router.filters?router.filters[i]:null;
            methods.forEach(function (method) {
                var eachRouter = r[method];
                if (eachRouter) {
                    var filters =f ? (f[method] || []).map(function (item) {
                        return require(fltrDir + '/' + item);
                    }) : [];
                    console.log(method+":"+p)
                    if(r[method+':doc']){
                        var path = p;
                        if(p.exec){
                            path = p.toString().replace(/^\/|\/$/g,'')
                        }
                        Rainbow.docs[path] = r[method+':doc'];
                        Rainbow.docs[path].method = method;
                        Rainbow.docs[path].api_path = path;
                    }
                    app[method].apply(app, [p].concat(filters)
                        .concat([eachRouter]));
                }
            });
        }

    });
};
