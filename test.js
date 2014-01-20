var http = require('http');
var querystring = require('querystring');
var optimist = require('optimist');

var opts = optimist.argv;

var post_data = querystring.stringify({
	time: opts.time || Math.round(new Date().getTime() / 1000) + 10,
	method: opts.method || 'GET',
	url: opts.url || 'http://localhost:5000/',
	params: opts.params || '{}'
});

console.log(post_data);

var options = {
	host: 'callback-clock.herokuapp.com',
	port: '80',
	path: '/callbacks/create',
	method: 'POST',
	headers: {
		'Content-Type': 'application/x-www-form-urlencoded',
		'Content-Length': post_data.length
	}
}

var req = http.request(options, function(res) {
	console.log(res.statusCode);
	process.exit();
});
req.write(post_data);
req.end();