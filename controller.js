//This is the main controller. 
//This is where the magic happens !! 
var log = require('./systemLog').controller;
var io = require('socket.io')();
var report = require('./report');
var rfid = require('./middleware/rfidReader');
var maxTags = 1;

//This is an observer variable for the gps coordinates. Whenever there is an update in the gps coordinate 
// the gpsUpdate function gets involed. Observer pattern
var ReaderObserver = function() {
    this.status='IDLE';
    return {
        statusUpdate: function(r) {
            console.log("Controller: readerStatusObserver notified! STATUS: "+r.status);
            this.status = r.status;
            updateAllViews('rfid_reader_status',{status: this.status});
            updateAllViews('initialize',{maxTags: maxTags,seenTags: report.log.count});
        },
        readUpdate: function(tagInfo) {
            if (log) console.log("Controller: readUpdate: "+tagInfo.readTag);
            report.newLogEntry({tagId: tagInfo.readTag});
        }
    }
}

var ReportObserver = function() {
    this.count=0;
    return {
        countUpdate: function(TagCount) {
            console.log("Controller: countUpdate notified! COUNT: "+TagCount);
            this.count = TagCount;
            updateAllViews('tagCount_update',{seenTags: TagCount, maxTags: maxTags});
        }
    }
}

//Array of all the opened sockets
var socks = [];

// Observer variables
var readerObserver = new ReaderObserver();
var reportObserver = new ReportObserver();
report.log.addObserver(reportObserver);
//---- End of Observer variables -----

io.on('connection', function (socket) {
    socks.push(socket);
    if (log)    console.log("Controller: Number of clients: "+socks.length+" socketID: "+socket.id);    
    if (log)    console.log("\n\nController: readerObserver status:"+readerObserver.status+" rfid: "+rfid.reader.status+"\n\n");      
    if (log)    console.log("maxTags: "+maxTags+" seenTags"+report.log.count);
    socket.emit('initialize',{maxTags: maxTags,seenTags: report.log.count});
    socket.emit('rfid_reader_status',{status: readerObserver.status});

    //Start the reader for the first time.
    socket.on('connect_rfid_reader', function (data) {
        if (log)    console.log("Controller: msg connect_rfid_reader location: "+data.maxTags);
        maxTags = data.maxTags;
        rfid.connect('SpeedwayR-11-4A-D6.local');
    });

    //On clicking resume for the maintenance
    socket.on('rfid_reader_resume', function (data) {
        if(log) console.log("Resume button is pressed by userID: "+socket.id+" for location: "+data.location);  
        rfid.connect('SpeedwayR-11-4A-D6.local');
    });

    // invoked when one of the users
    socket.on('rfid_reader_pause', function (data) {
        if(log) {   console.log("pause button is pressed by userID: "+socket.id);   }
        rfid.disConnect();
    });

    socket.on('rfid_saveLog', function (data) {
        if (log)    console.log("Controller: msg rfid_saveLog name: "+data);
        report.saveExistingLog(data);
        if ("ACTIVE"==rfid.reader.status)   {
            rfid.disConnect();  
            maxTags=1;
        }
    });

    socket.on('rfid_reader_reset', function (data) {
        if (log)    console.log("Controller: msg rfid_reader_reset name: "+data);
        if ('ERROR'==rfid.reader.status)    {
            if (log)    console.log("Controller: Reader Status: "+rfid.reader.status);
                rfid.reader.setStatus('IDLE');
        }
    });

    // This message from the view indicate that the error message has been shown to the user. 
    // resetting the status of the reader 
    socket.on('error_rfid_reader', function (data) {
        rfid.connect('SpeedwayR-11-4A-D6.local',location);
    });

     // on a socket disconnect reduce the number of users
    socket.on('disconnect', function (data) {
        var index = socks.indexOf(socket);
        if(index>=0)    {   socks.splice(index,1);  }
        if (log)    {   console.log("Controller: Number of users left= "+socks.length);  }
    });
});

// Helper functions 
function updateAllViews(message, data)  {
    if(log) console.log("Controller: In updateAllViews message: "+message);
    for(var i=0;i<socks.length;i++)
        socks[i].emit(message,data);
};

var self = module.exports = {
    readerObserver: readerObserver,
    reader: rfid,
    setMaxTags: function(num) {
        maxTags = num;
    },
    io: io
}

