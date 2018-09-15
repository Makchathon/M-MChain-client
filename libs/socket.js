module.exports = (server) => {
	var io = require('socket.io').listen(server);
	var request = require('request');
	io.on('connection', function (socket) {
		socket.emit("welcome");
		socket.on("requestPlaces", function (data) {
			console.log(data);
			request.get(`http://fabius.ciceron.xyz:5000/get?latitude=${data.latitude}&longitude=${data.longitude}&range=${data.range}`, {}, function (err, res, body) {
				console.log(body);
				socket.emit("places", body);
			});
		});
	});

	return io;
};
