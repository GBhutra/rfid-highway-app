//This file would read the csv file and load it into the hash/database
'use strict';

var csv = require("fast-csv");
var model = require('./models');
var gps = require('./gps_reader.js');
var walk = require('walk'), fs = require('fs'), walker;

 
var log = true;
var rfidLog = [];
var availablelogs = [];


var createDBFromFile = function(filePath, model)	{
    console.log("\nReading from file: "+filePath);
    csv
	 .fromPath(filePath)
	 .on("data", function(data)	{
	 	//console.log("\n"+data);
	 	var temp = new function() {
	 		if(data.length>6)	{
	 			this.street 	= data[0].trim();
	 			this.assetId 	= data[1].trim();
	 			this.signType 	= data[2].trim();
	 			this.address 	= data[3].trim();
	 			this.mapLoc 	= data[4].trim();
	 			this.tagId 		= data[5].trim();
	 			this.lat 		= data[6].split(':')[0].trim();
	 			this.lon 		= data[6].split(':')[1].trim();
	 		}
	 		else {
	 			console.log("Incorrect Entry in file");
	 		}
	 	}
	 	if (temp.address.length>0)	{
		 	model.Tag
		 		.create({
		 			area: temp.street,
		 			address: temp.address,
					lat: temp.lat,
					lon: temp.lon,
					signType: temp.signType, 
					tagId: temp.tagId, 
					assetId: temp.assetId
				}).then(function(tag){
					console.log(" Entry to the Database madde successfully !! tagid: "+tag.tagId);
				}).catch(function(err){
					if (log) { console.log(" Error occured ERROR: "+err); }
				});
		 	}
		else 	{
		 	if (log)	{
		 		console.log("Incorrect Entry in file");
		 	}
		}
	}).on("end", function()	{
	     console.log("done\n\n");
	});
}

var logData = function(tag)	{
	var d = new Date();
	var logEntry = rfidLog[tag.tagId];

	if(logEntry!==undefined)	{
		if(log) console.log("Logger || Tag :"+logEntry.tag.tagId+" already read !");
		logEntry.Count++;
		logEntry.DateTime=d.toUTCString();
	}
	else	{
		var logE = {tag: tag, GPSLat: gps.currLat, GPSLon: gps.currLon, Count: 0,DateTime: d.toUTCString()};
		rfidLog[tag.tagId] = logE;
		if(log)	console.log("Logger || New log entry added !!");
	}
}

var saveLog = function(logName)	{
	console.log("Saving the log !!");

	var d = new Date();
	var n = "_"+d.toDateString()+"_"+d.toLocaleTimeString();
	var csvStream = csv.createWriteStream({headers: true}),
    writableStream = fs.createWriteStream("public/reports/"+logName+n+".csv");

    csvStream.pipe(writableStream);
    for (var key in rfidLog)	{
    	if (log) console.log(rfidLog[key]);
    	csvStream.write({TagID: rfidLog[key].tag.tagId, Latitude: rfidLog[key].tag.lat, Longitude: rfidLog[key].tag.lon , Address: rfidLog[key].tag.address, Sign: rfidLog[key].tag.signType, GPS_Latitude: rfidLog[key].GPSLat, GPS_Longitude: rfidLog[key].GPSLon, Count: rfidLog[key].Count,Time: rfidLog[key].DateTime});
    }

	writableStream.on("finish", function(){
	  console.log("DONE!");
	  rfidLog = {};
	});
}

module.exports.logData = logData;
module.exports.saveLog = saveLog;
module.exports.createDBFromFile = createDBFromFile;
