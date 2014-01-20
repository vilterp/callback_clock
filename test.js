var http = require('http');
var querystring = require('querystring');

var post_data = querystring.stringify({
	time: Math.round(new Date().getTime() / 1000) + 10,
	method: 'GET',
	url: 'http://localhost:5000/',
	params: '{}'
});

console.log(post_data);

var options = {
	host: 'localhost',
	port: '5000',
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