Rainbow
=======

[简体中文](http://mytharcher.github.com/posts/npm-rainbow.html)

###update 2012-12-22 by yutou

now you can use this more automatically；

every object should have three part：controller，filter，template。

their file structure should be equally；
```
---controllers
     ---store
          ---hello.js
---filters
     ---store
          ---hello.js
---templates
     ---store
          ---hello.html
```
attention:when controller is empty it can run at all.but you should write something to it;

filters is not necessary；it's assign in controller like this : exports.get.filters = ['store/hello'];

filters is not something match controller or others ,it maybe something common to do some check before process the request;

when controller is process ,there is a setup processed,it will create some variable like: 

req.rb_view tell you where is your template;

req.rb_path tell you the relative path;

when executed the controller req.rb_data is availble ,it's the data to render,zhen the program will render to the opposite template;



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
