var express = require("express");
var logfmt = require("logfmt");
var fs = require('fs');
var redis = require('redis');
var url = require('url');

var app = express();

app.disable('etag');
app.use(logfmt.requestLogger());
app.use(express.bodyParser());

// connect to redis
client = redis.createClient();
if(process.env.REDISTOGO_URL) {
	var rtg = url.parse(process.env.REDISTOGO_URL);
	var redis_client = redis.createClient(rtg.port, rtg.hostname);
	redis_client.auth(rtg.auth.split(":")[1]);
} else {
	var redis_client = redis.createClient();
}
client.on('ready', function(evt) {
	console.log('connected to redis at ' + redis_client.host + ':' + redis_client.port);
})

// define app
app.get('/', function(req, res) {
	fs.readFile('interface.txt', {encoding: 'utf8'}, function(err, text) {
		if(err) {
			res.send(500, 'Something went wrong');
		} else {
			res.type('text/plain');
			res.send(200, text);
		}
	});
});

app.post('/callbacks/create', function(req, res) {
	if(!(req.body.url && req.body.time && req.body.method && req.body.params)) {
		res.send(400, 'missing param');
	} else {
		var callback = {
			url: req.body.url,
			time: parseInt(req.body.time),
			method: req.body.method,
			params: req.body.params
		}
		redis_client.zadd(['callbacks', callback.time, JSON.stringify(callback)], function(err, resp) {
			if(err) throw err;
			console.log('added callback', callback);
			res.send(200);
		});
	}
});

app.get('/callbacks/', function(req, res) {
	redis_client.zrange('callbacks', 0, -1, function(err, resp) {
		if(err) throw err;
		res.type('application/json');
		res.send(JSON.stringify(resp.map(JSON.parse), null, '\t'));
	})
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
	console.log("Listening on " + port);
});