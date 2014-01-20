var redis = require('redis');
var url = require('url');
var querystring = require('querystring');
var http = require('http');

// connect to redis
if(process.env.REDISTOGO_URL) {
	var rtg = url.parse(process.env.REDISTOGO_URL);
	var redis_client = redis.createClient(rtg.port, rtg.hostname);
	redis_client.auth(rtg.auth.split(":")[1]);
} else {
	var redis_client = redis.createClient();
}
redis_client.on('ready', function(evt) {
	console.log('connected to redis at ' + redis_client.host + ':' + redis_client.port);
});

function make_request(callback, cb) {
	var the_url = url.parse(callback.url);
	var options = {
		hostname: the_url.hostname,
		port: the_url.port,
		path: the_url.path,
		method: callback.method
	};
	if(callback.method == 'GET') {
		options.query = querystring.stringify(callback.params);
	}
	var req = http.request(options, cb);
	if(callback.method == 'POST') {
		req.write(querystring.stringify(callback.params));
	}
	req.end();
}

var interval = process.env.CHECK_INTERVAL || 1000 * 60; // 1 minute default
setInterval(function() {
	var current_secs = Math.round(new Date().getTime() / 1000);
	var end_interval = current_secs + interval/1000 - 1;
	console.log('check ' + current_secs + ' to ' + end_interval);
	redis_client.zrangebyscore('callbacks', -Infinity, end_interval, function(err, elements) {
		redis_client.zremrangebyscore('callbacks', -Infinity, end_interval, function(err, resp) {
			if(err) throw err;
		})
		if(err) throw err;
		var callbacks = elements.map(JSON.parse);
		callbacks.forEach(function(callback) {
			make_request(callback, function(res) {
				console.log(callback.method + ' ' + callback.url + ' => ' + res.statusCode);
			});
		});
	});
}, interval);