var log = true;
var view = require('./reader_view.js');
var reader = require('./rfid_reader.js');
var gps = require('./gps_reader.js');
var fh = require('./file_handler.js');
var socks = [];

var io = require('socket.io')();

io.on('connection', function (socket) {
    socks.push(socket);
    view.IncrementNumClients();
    if (log)	{	console.log("Number of clients: "+socks.length+" socketID: "+socket.id);	}
    socket.emit('initialize',view);
    

    //On clicking start for the maintenance
    socket.on('start', function (data) {
    	if(log)	{	console.log("Start button is pressed by userID: "+socket.id);	}
    	reader.Connect();
        gps.StartGPS();
    	view.UpdateStatusTo('start');
    	setTimeout(UpdateAllClients,5000,'status','start');
    });
   
    // invoked when one of the users
    socket.on('stop', function (data) {
    	if(log)	{	console.log("Stop button is pressed by userID: "+socket.id);	}
        reader.disConnect();
    	view.UpdateStatusTo('stop');
        gps.StopGPS();
        UpdateAllClients('status','stop');
    });

    //on clicking layout
    socket.on('settings', function (data) {
    	if(log)	{	console.log("Layout button is pressed by userID: "+socket.id);	}
        view.controls = !view.controls;
        socket.emit('settings',view.controls);
    });

    //on clicking layout
    socket.on('save', function (data) {
        if(log) {   console.log("Save button is pressed by userID: "+socket.id+" logName:"+data);  }
        fh.saveLog(data);
    });

    socket.on('gpsRange', function (data) {
         if(log) {   console.log("gpsRange :"+data);    }
        gps.UpdateRange(data);
    });
    
    //on clicking exit
    socket.on('exit', function (data) {
    	if(log)	{	console.log("Exit button is pressed by userID: "+socket.id);	}
    	view.UpdateStatusTo('stop');
        reader.disConnect();
    	gps.StopGPS();
        UpdateAllClients('status','stop');
    	process.exit(1);
    });

    //On clicking start for creating a new tag Entry in Database
    socket.on('start_newTag', function (data) {
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