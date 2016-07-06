var log = true;
var view = require('./reader_view.js');
var reader = require('./rfid_reader.js');
var gps = require('./gps_reader.js');
var socks = [];

var io = require('socket.io')();

io.on('connection', function (socket) {
    socks.push(socket);
    view.IncrementNumClients();
    if (log)	{	console.log("Number of clients: "+socks.length+" socketID: "+socket.id);	}
    

    //On clicking start
    socket.on('start', function (data) {
    	if(log)	{	console.log("Start button is pressed by userID: "+socket.id);	}
    	reader.connect();
        gps.Start();
    	view.UpdateStatusTo('start');
    	UpdateAllClients('status','start');
    });
   
    // invoked when one of the users
    socket.on('stop', function (data) {
    	if(log)	{	console.log("Stop button is pressed by userID: "+socket.id);	}
    	view.UpdateStatusTo('stop');
        gps.Stop();
        UpdateAllClients('status','stop');
    });

    //on clicking layout
    socket.on('layout', function (data) {
    	if(log)	{	console.log("Layout button is pressed by userID: "+socket.id);	}
    });
    
    //on clicking exit
    socket.on('exit', function (data) {
    	if(log)	{	console.log("Exit button is pressed by userID: "+socket.id);	}
    	view.UpdateStatusTo('stop');
    	socket.broadcast.emit('status','stop');
    	process.exit(1);
    });

    // on a socket disconnect reduce the number of users
    socket.on('disconnect', function (data) {
    	var index = socks.indexOf(socket);
		if(index>=0)	{
			socks.splice(index,1);
			view.DecrementNumClients();
		}
        if (log)    {   console.log("Number of users left= "+socks.length);  }
    });
});

var UpdateAllClients = function(message, data)	{
	if(log) console.log("In UpdateAllClients messgae: "+message);
	for(var i=0;i<socks.length;i++)
		socks[i].emit(message,data);
};

module.exports.io=io;
module.exports.UpdateAllClients=UpdateAllClients;