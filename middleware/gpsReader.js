//This file abstracts the reading of GPS coordinates from the system
//The gps data is an observable quantity being observerd by the main controller in conjunction with the rfid reader data
var serialPort = require('serialport');

var log = require('../systemLog.js').gpsReader;
var port= new serialPort('/dev/ttyAMA0', {
	baudrate: 115200,
	parser: serialPort.parsers.readline('\n'),
	autoOpen: false
});

function GPS()	{
	this.currLat = 0.0,
	this.currLon = 0.0,
	this.prevLat = 0.0,
	this.prevLon = 0.0,
	this.observers=[]
}

// add Observer to the GPS values
GPS.prototype.addObserver = function(obs)	{
	this.observers.push(obs);
}

// remove observer from the observers list
GPS.prototype.remObserver = function(obs)	{
	var index = this.observers.indexOf(obs);
    if(index > -1) {
        this.observers.splice(index, 1);
    }
}

// notify all observers on change of gps values
GPS.prototype.notify = function() {
  for(var i = 0; i < this.observers.length; i++){
    this.observers[i].gpsUpdate({currLat: this.currLat, currLon: this.currLon, prevLat: this.prevLat, prevLon: this.prevLon});
  }
}

//Open the serial port to read the gps data
var startGPS = function()	{
	if (log) console.log("gpsReader: In Start function for GPS");
	port.open(function(err)	{
		if(log) console.log("gpsReader: ERROR opening GPS port :"+err);
	});
};

//Close the serial port 
var stopGPS= function()	{
	if (log) console.log("gpsReader: In Stop function for GPS");
	port.close(function(err)	{
		if(log) console.log("gpsReader: ERROR closing GPS port :"+err);
	});
};

port.on('open',function()	{
	if (log) console.log("gpsReader: Serial port opened");
});

port.on('data',function(data)	{
	var coord = extractCoOrdinates(data);
	if (-1!=coord)	{
		gps.prevLat = gps.currLat;
		gps.prevLon = gps.currLon;
		gps.currLon = coord.lon;
		gps.currLat = coord.lat;
		gps.notify();
	}
});


//Helper Functions
function extractCoOrdinates(data)	{
	var temp = data.split(',');
	if(temp.length>7)	{
		if("$GPRMC"==temp[0])	{
			var lat_raw = temp[3];
			var lon_raw = temp[5];
			var coord=new Object();
			coord.lat = parseFloat(lat_raw.substring(0,2));
			coord.lon = parseFloat(lon_raw.substring(0,3));
			coord.lat=(parseFloat(coord.lat)+(parseFloat(lat_raw.substring(2))/60)).toFixed(6);
			coord.lon=(parseFloat(coord.lon)+(parseFloat(lon_raw.substring(3))/60)).toFixed(4);
			if("W"==temp[6])	{ coord.lon = coord.lon*-1;	}
			if (log) console.log("\n\nGPSData: lat: "+coord.lat+" lon: "+coord.lon);
			if (log) console.log("currLat: "+gps.currLat+" currLon: "+gps.currLon+" prevLat: "+gps.prevLat+" prevLon: "+gps.prevLon);
			return coord;
		}
		return -1;
	}
	return -1;
}
//----- End of Helper Functions ------//


//Testing functions
function gpsSimulate(lat,lon)	{
	gps.prevLat = gps.currLat;
	gps.prevLon = gps.currLon;
	gps.currLon = lon;
	gps.currLat = lat;
	if (log) console.log("\ngpsReader: simulation currLat: "+gps.currLat+" currLon: "+gps.currLon+" prevLat: "+gps.prevLat+" prevLon: "+gps.prevLon);
	gps.notify();
}
//----- End of Testing functions -----//


//Unique instance of the GPS variable !!
var gps = new GPS();

// Exporting the gps module
var self = module.exports = {
	gps : gps,
	startGPS: function()	{
		return startGPS();
	},
	stopGPS: function()	{
		return stopGPS();
	},
	gpsSimulate: function(lat,lon)	{
		return gpsSimulate(lat,lon);
	},
	addObserver: function(obs)	{
		gps.addObserver(obs);
	}
}
