module.exports = (server) => {
	var io = require('socket.io').listen(server);
	io.on('connection', function (socket) {
		socket.emit("welcome");
		socket.on("addPin", function () {
			socket.broadcast.emit("addPin");
		});
		socket.on("startCharge", function() {
			socket.broadcast.emit("startCharge");
		});
		socket.on('stopCharge', function (sid) {
			socket.broadcast.emit("stopCharge");
		});
		socket.on('disconnection', function () {
			socket.leave(socket.room);
		});
		socket.on("forEos", function(){
			console.log("fdsafdsafdsafdsafdsa")
			socket.broadcast.emit("forEos");
		});
	});

	return io;
};
