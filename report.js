//This file is the report variable. 
//It can save into a csv file. 
'use strict';

var log = require('./systemLog.js').report;
var gpsRdr = require('./middleware/gpsReader');
var csv = require("fast-csv");
var model = require('./models');
var fs = require('fs'), walker;

var gps = function() {
    this.currLat = 0.0;
	this.currLon = 0.0;
	this.prevLat = 0.0;
	this.prevLon = 0.0;
	return {
		gpsUpdate: function(gpsCoord) {
	    	if (log)	console.log("Report: gpsUpdate !");
	    	this.currLat = gpsCoord.currLat;
	    	this.currLon = gpsCoord.currLat;
	    	this.prevLat = gpsCoord.prevLat;
	    	this.prevLon = gpsCoord.prevLon;
	    }
	}
}

var Report = function()	{
	this.log = [];
	this.location;	
	this.gps= new gps();
	this.gpsSet = false;
}

// add Observer to the GPS values
Report.prototype.initLogForLocation = function(location)	{
	this.location = location;
	if (false==this.gpsSet)	{
		gpsRdr.addObserver(this.gps);
		this.gpsSet=true;
	}

	model.Tag.findAll({where: {location: location }, raw: true}).then(function(tags){
		tags.forEach(createLogEntry);
		return true;
	});
}

function createLogEntry(tag)	{
	var entry = {tag: tag, GPSLat: null, GPSLon: null, Count: 0, DateTime: null};
	report.log[tag.tagId] = entry;
}

Report.prototype.newLogEntry = function(tag)	{
	var d = new Date();
	var logEntry = this.log[tag.tagId];

	if(logEntry!==undefined)	{
		if(log) console.log("report: newLogEntry Tag :"+logEntry.tag.tagId+" already read !");
		logEntry.Count++;
		logEntry.DateTime=d.toUTCString();
	}
	else	{
		var entry = {tag: tag, GPSLat: this.gps.currLat, GPSLon: this.gps.currLon, Count: -10000,DateTime: d.toUTCString()};
		this.log[tag.tagId] = entry;
		if(log)	console.log("report: New log entry added !!");
	}
}

Report.prototype.saveExistingLog = function(logName)	{
	if(log)	console.log("report: Existing Log");

	var d = new Date();
	var n = "_"+this.location+"_"+d.toDateString()+"_"+d.toLocaleTimeString();
	var csvStream = csv.createWriteStream({headers: true}),
    writableStream = fs.createWriteStream("report/"+logName+n+".csv");

    csvStream.pipe(writableStream);
    for (var key in this.log)	{
    	if (log) console.log(this.log[key]);
    	csvStream.write({TagID: this.log[key].tag.tagId, Latitude: this.log[key].tag.lat, Longitude: this.log[key].tag.lon , Address: this.log[key].tag.address, Sign: this.log[key].tag.signType, GPS_Latitude: this.log[key].GPSLat, GPS_Longitude: this.log[key].GPSLon, Count: this.log[key].Count,Time: this.log[key].DateTime});
    }

	writableStream.on("finish", function(){
	  if(log)	console.log("report: SaveLog Done!!");
	  initLogOfLocation(this.location);
	});
}

Report.prototype.isLogEmpty = function()	{
	for (var key in this.log)	{
		if(0<this.log[key].Count)	{	return false;	}
	}
	return true;
}

// Exporting the report module
var report = new Report();

var self = module.exports = {
	log : report,
	initLogForLocation: function(loc)	{
		return report.initLogForLocation(location);
	},
	newLogEntry: function(tag)	{
		return report.newLogEntry(tag);
	},
	saveExistingLog: function()	{
		return report.saveExistingLog();
	}
}