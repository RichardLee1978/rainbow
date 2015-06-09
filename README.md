Rainbow
=======

npm install rainbowy

以文件夹嵌套的形式来表示route配置。

 controllers文件夹里可以放置很多controller，而且程序初始化的时候会扫描这个文件夹，对所有controller进行初始化，然后自动生成对应的url的route，这是本框架的一大特色。

 controllers里可以创建多层文件夹，每个文件夹代表route里的一级。

 例如 这样的目录结构 /controllers/user/admin.js 里面有一个 createUser: get的定义。

 则在浏览器里这样访问 www.example.com/controllers/user/admin/createUser

 同样，你可以这样来创建一个文件夹里的多个controller /controllers/user/admin/index.js
 
 这样的效果跟上面的完全一样，然后admin文件夹下可以继续细分其他的controller文件。

 支持正则route，写法："reg:/(.*)" reg:指定是正则，后面跟正则路径

 controller代码的结构：

 ```
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
```
 配置方法：
```
rainbow.route(app, {
    controllers: '/controllers/',
    filters: '/filters/',
    template: '/views/'
});
```

blow is rainbow's document
======


A node [Express][] router middleware for Ajax RESTful API base on certain folder path.

Rainbow mapping all HTTP request route to controllers folder each as path to file as URL.

## Installation ##

```bash
$ npm install rainbow
```

## Usage ##

In your express application main file `app.js`:

```javascript
var express = require('express');
var rainbow = require('rainbow');

var app = express();

// Here using Rainbow to initialize all routers
rainbow.route(app);

app.listen(6060);
```

### Controllers ###

All your controllers for catching HTTP request should be defined in each file in `controllers/` folder (could be changed) as same path in URL.

This is the core design for Rainbow! And it makes routing much simpler only by files' paths!

Here writes a router `something.js` in your `controllers/` folder like this:

```javascript
exports.get = function (req, res, next) {
	res.send(200, 'Simple getting.');
};
```

If you need some filters, just add a `filters` array property which contains your filters in `filters/` folder to the handle function like this:

```javascript
exports.get = function (req, res, next) {
	res.send(200, 'Simple getting.');
};
// add filters
exports.get.filters = ['authorization'];
```

Also you could define other HTTP methods handlers, but make sure in one file each URL! Example in `controllers/user.js`:

```javascript
exports.get = function (req, res, next) {
	User.find({where: req.query.name}).success(function (user) {
		res.send(200, user);
	});
};

exports.put = function (req, res, next) {
	User.create(req.body).success(function (user) {
		res.send(201, user.id);
	});
};

// You can also define `post` and `delete` handlers.
// ...
```

If you want all methods to be process in only one controller(something not RESTful), just make exports to be the handle function:

```
module.exports = function (req, res, next) {
	// all your process
};
```

#### Notice ####

Rainbow controllers only design for tranditional URL form like `/path?query=value` but not like `/path/user/:id` yet.

In rich Ajax apps tranditional URL form could be more useful. However, Rainbow may consider param form URL in future versions.

### Filters ###

Make sure the filters you need had been defined in `filters/` folder (could be changed) as same module name, because them will be required when initilizing. Here `authorization.js` is a example for intecepting by non-authenticated user before `GET` `http://yourapp:6060/something`:

```javascript
module.exports = function (req, res, next) {
	console.log('processing authorization...');
	var session = req.session;
	
	if (session.userId) {
		console.log('user(%d) in session', session.userId);
		next();
	} else {
		console.log('out of session');
		// Async filter is ok with express!
		db.User.find().success(function (user) {
			if (!user) {
				res.send(403);
				res.end();
			}
		});
	}
};
```

You could see filters is as same as a origin router in Express, just be put together in `filters/` folder to be interceptors like in Java SSH.

### Change default path ###

Controllers and filters default path could be changed by passing a path config object to `route` function when initializing:

```javascript
rainbow.route(app, {
	controllers: '/your/controllers/path',
	filters: '/your/filters/path'
});
```

These paths are all **RELATIVE** to your app path!

## Troubleshooting ##

0. Gmail me: mytharcher
0. Write a [issue](https://github.com/mytharcher/rainbow/issues)
0. Send your pull request to me.

## MIT Licensed ##

-EOF-

[Express]: http://expressjs.com/
