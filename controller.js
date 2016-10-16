//This is the main controller. 
//This is where the magic happens !! 
var log = require('./systemLog').controller;
var io = require('socket.io')();
var report = require('./report').log;
var model = require('./models');
var rfid = require('./middleware/rfidReader');
var gps = require('./middleware/gpsReader');

//This is an observer variable for the gps coordinates. Whenever there is an update in the gps coordinate 
// the gpsUpdate function gets involed. Observer pattern
var GPSObserver = function() {
}
var ReaderObserver = function() {
    this.status='IDLE';
    return {
        statusUpdate: function(r) {
            console.log("Controller: readerStatusObserver notified! STATUS: "+r.status);
            this.status = r.status;
            updateAllViews('rfid_reader_status',{status: this.status});
        },
        readUpdate: function(tagInfo) {
            if (log) console.log("Controller: readUpdate: "+tagInfo.readTag);
            model
            .Tag
            .findOne({
                where: {    tagId: tagInfo.readTag },
                raw: true
            })
            .then(function(tagFound)  {
                if (null==tagFound)  {
                    if (log) console.log("Controller: Tag not registered !!!");    
                    report.newLogEntry({tagId: (tagInfo.readTag), address: "unknown", signType: "unknown", lat: "unknown", lon: "unknown"});
                }
                else {
                    if (log) console.log("Controller: Tag found in the DB with Address: "+tagFound.address); 
                    report.newLogEntry(tagFound);
                    for (var i=0;i<scannerView.sign.length;i++)   {
                        if(scannerView.sign[i].tagId == tagFound.tagId) {
                            if(0==scannerView.signStatus[i])    {
                                scannerView.signStatus[i] = 1;
                                updateAllViews('signStatus_update',{status: scannerView.signStatus});
                            }
                            else
                                if (log) console.log("Controller: Tag already updated. NO UPDATE to view"); 
                        }
                    }
                }
            });
        }
    }
}

//Array of all the opened sockets
var socks = [];

//Variables in the scanner view
var scannerView = new Object();
scannerView.numSigns = 0;
scannerView.sign = [];
scannerView.signStatus = [0,0,0,0];
var gpsRange = 0.0001;
//----- End of variables used in the scanner view

// Observer variables
var readerObserver = new ReaderObserver();
var gpsObserver = new GPSObserver();
//---- End of Observer variables -----

gpsObserver.gpsUpdate = function(gpsCoord) {
    if (log) console.log("controller: gpsUpdate: ");
    if (log) console.log(gpsCoord);
    var rlat = addFloats(gpsCoord.currLat,gpsRange,6);
    var llat = addFloats(gpsCoord.currLat,-gpsRange,6);
    var rlon = addFloats(gpsCoord.currLon,gpsRange,4);
    var llon = addFloats(gpsCoord.currLon,-gpsRange,4);
    model.Tag
    .findAll({
        where: {
            lat: {$between: [llat, rlat]},
            lon: {$between: [llon, rlon]}
        },raw: true})
    .then(function(tags)  {
        if (log) console.log("controller: Number of tags found: "+tags.length);    
        if(tags.length>=0)  {
            var i=0; 
            var min_dist=1.0;
            var closestTags=[];
            var signDist = [];
            for (i=0;i<tags.length;i++) {
                var dist = getDistanceBetween({lat: gpsCoord.currLat, lon: gpsCoord.currLon}, {lat: tags[i].lat, lon: tags[i].lon});
                if(dist<min_dist)   {
                    closestTags.length = 0;
                    closestTags.push(tags[i]);
                    min_dist = dist;
                }
                else if(dist==min_dist) {
                    closestTags.push(tags[i]);
                }
            }
            if (log) console.log("controller: Found "+closestTags.length+" tags in the vicinity!!");
            if (log) console.log(closestTags);
            scannerView.numSigns = closestTags.length;
            for (i=0;i<closestTags.length;i++) {
                var d = distanceInFeet({lat: parseFloat(gpsCoord.currLat), lon: parseFloat(gpsCoord.currLon)}, {lat: closestTags[i].lat, lon: closestTags[i].lon}).toFixed(3);
                if (log) console.log("\nController: Tag "+i+" is "+d+" feet away");
                signDist.push(d);
            }
            if (JSON.stringify(scannerView.sign) === JSON.stringify(closestTags))  {
               if (log) console.log("\nController: Same signs No Update !! ");
            }
            else    {
                if (log) console.log("\nController: Updating with closer signs!! ");
                scannerView.sign = closestTags;
                scannerView.signStatus = [0,0,0,0];
                updateAllViews('new_signs',scannerView);
                updateAllViews('signStatus_update',{status: scannerView.signStatus});
            }
            updateAllViews('sign_distance_update',signDist);
        }
    });
}

io.on('connection', function (socket) {
    socks.push(socket);
    if (log)    console.log("Controller: Number of clients: "+socks.length+" socketID: "+socket.id);    
    if (log)    console.log("\n\nController: readerObserver status:"+readerObserver.status+" rfid: "+rfid.reader.status+" location:"+rfid.reader.location+"\n\n");      
    socket.emit('initialize',scannerView);
    socket.emit('rfid_reader_status',{status: readerObserver.status});
    socket.emit('gps_range_res',{val: (Math.abs(gpsRange*10000))});

    //Start the reader for the first time.
    socket.on('connect_rfid_reader', function (data) {
        if (log)    console.log("Controller: msg connect_rfid_reader location: "+data.location);
        rfid.reader.setLocation(data.location);
        report.initLogForLocation(data.location);
        rfid.connect('SpeedwayR-11-4A-D6.local');
        gps.startGPS();
    });

    //On clicking resume for the maintenance
    socket.on('rfid_reader_resume', function (data) {
        if(log) console.log("Resume button is pressed by userID: "+socket.id+" for location: "+data.location);  
        rfid.connect('SpeedwayR-11-4A-D6.local');
        gps.startGPS();
    });

    // invoked when one of the users
    socket.on('rfid_reader_pause', function (data) {
        if(log) {   console.log("pause button is pressed by userID: "+socket.id);   }
        rfid.disConnect();
        gps.stopGPS();
    });

    socket.on('rfid_saveLog', function (data) {
        if (log)    console.log("Controller: msg rfid_saveLog name: "+data);
        report.saveExistingLog(data);
    });

    socket.on('rfid_reader_reset', function (data) {
        if (log)    console.log("Controller: msg rfid_reader_reset name: "+data);
        if ('ERROR'==rfid.reader.status)    {
            if (log)    console.log("Controller: Reader Status: "+rfid.reader.status);
                rfid.reader.setStatus('IDLE');
        }
    });

    socket.on('gps_range_req', function (data) {
        if (log)    console.log("Controller: msg gps_range_req val: "+data.val);
        if (0==data.val)
            gpsRange = addFloats(gpsRange,-0.0001,4);
        else
            gpsRange = addFloats(gpsRange,0.0001,4);
        socket.emit('gps_range_res',{val: (Math.abs(gpsRange*10000))});
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
function addFloats(val1, val2, precision)   {
    return (parseFloat(val1)+parseFloat(val2)).toFixed(precision);
}
function toRad(val)    {
    return val * Math.PI / 180;
}
function getDistanceBetween(location1, location2)   {
    var latDiff = (parseFloat(location1.lat)-parseFloat(location2.lat)).toFixed(5);
    var LonDiff = (parseFloat(location1.lon)-parseFloat(location2.lon)).toFixed(4);
    return Math.sqrt(Math.pow(latDiff,2)+Math.pow(LonDiff,2)).toFixed(6);
}
// Haversine formula to get the distance between cocodinates 
function distanceInFeet(coord1,coord2)  {
    var la1 = parseFloat(coord1.lat);
    var la2 = parseFloat(coord2.lat);
    var lo1 = parseFloat(coord1.lon);
    var lo2 = parseFloat(coord2.lon);
    var R = 20902231; // feet
    var dLat = toRad(addFloats(la2,(-1*la1),5));
    var dLon = toRad(addFloats(lo2,(-1*lo1),5));
    var lat1 = toRad(la1);
    var lat2 = toRad(la2);
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c;
    return d;
}
//----- End of Helper Functions -----

// Exporting the gps module
var self = module.exports = {
    gpsObserver: gpsObserver,
    readerObserver: readerObserver,
    io: io
}

