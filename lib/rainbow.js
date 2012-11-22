var approot = process.env.PWD;

var glob = require('glob');
var methods = require('methods');
var fs = require("fs");
var Mustache = require("mustache")
var isEmptyObject = function (o) {
    for (var x in o) {
        return false;
    }
    return true;
}
/**
 * Main function to initialize routers of a Express app.
 * 
 * @param  {Express} app  Express app instance
 * @param  {Object} paths (optional) For configure relative paths of
 *                        controllers and filters rather than defaults.
 */
exports.route = function (app, paths) {
    paths = paths || {};
    app.set('views', approot+ paths.template);
    var ctrlDir = approot + (paths.controllers || '/controllers');
    var fltrDir = approot + (paths.filters || '/filters');
    var tplDir = approot + (paths.template || "/template");
    glob.sync(ctrlDir + '/**/*.js').forEach(function (file) {
        file = file.replace(/\/index\.js$/, '/');
        var router = require(file);
        var single = typeof router == 'function';
        var path = file.replace(ctrlDir.replace(/\/$/,""), '').replace(/\.js$/, '');
        var tplPath = tplDir +path + ".html";
        var isTplExist = fs.existsSync(tplPath);
        var setup = function(req,res,next) {
            req.rb_view=(path + ".html");
            req.rb_path=path;
        };
        var views = function(req, res, next) {
            res.render((path + ".html").replace(/^\/*/, ""), req.rb_data);
        };
        single ? app.all(path, router,views) :
        methods.forEach(function (method) {
            var eachRouter = router[method];
            if (eachRouter) {
                var filters = (eachRouter.filters || []).map(function (item) {
                    return require(fltrDir + '/' + item);
                });
               
                app[method].apply(app, [path].concat(filters)
                    .concat([eachRouter.process || eachRouter]).concat([views]));
            }
        });
    });
};
