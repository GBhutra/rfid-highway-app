//This file is the report variable. 
//It can save into a csv file. 
'use strict';

var log = require('./systemLog.js').report;
var csv = require("fast-csv");
var fs = require('fs'), walker;


class Report {
	constructor()	{
		this.Log = {};
		this.count = 0;
		this.observers = [];
	}

	addObserver(obs)   {
		if (log)	console.log("report.js in addObserver function () obs:");
		if (log)	console.log(obs);
    	this.observers.push(obs);
	}

	remObserver(obs)   {
    	var index = this.observers.indexOf(obs);
    	if(index > -1) {
    	    this.observers.splice(index, 1);
    	}
    }

    notifyCount()	{
    	for(var i = 0; i < this.observers.length; i++){
    		this.observers[i].countUpdate(this.count);
  		}
    }

    newLogEntry(tag)	{
		var d = new Date();
		var logEntry = this.Log[tag.tagId];

		if(logEntry!==undefined)	{
			if(log) console.log("report: newLogEntry Tag :"+logEntry.tag.tagId+" already read !");
			logEntry.Count++;
			logEntry.DateTime=d.toUTCString();
		}
		else	{
			var entry = {tag: tag, Count: 1, DateTime: d.toUTCString()};
			this.Log[tag.tagId]=entry;
			this.count++;
			if(log)	console.log("report: New log entry added !! Log length: "+Object.keys(this.Log).length);
		}
		this.notifyCount();
	}

	clearLog()	{
		if(log)	console.log("report: clearLog Log length: "+Object.keys(this.Log).length);
		this.Log = {};
		for (var member in this.Log) delete this.Log[member];
		this.count=0;
		if(log)	console.log("report: clearLog Log length: "+Object.keys(this.Log).length);
	}
}

var report = new Report();

function saveExistingLog(logName)	{
	if(log)	console.log("report: save Existing Log name: "+logName);

	var d = new Date();
	var n = "_"+d.toDateString()+"_"+d.toLocaleTimeString();
	var csvStream = csv.createWriteStream({headers: true}), writableStream = fs.createWriteStream("report/"+logName+n+".csv");

    csvStream.pipe(writableStream);
    for (var key in report.Log)	{
    	if (log) console.log(report.Log[key]);
    	csvStream.write({TagID: report.Log[key].tag.tagId, Count: report.Log[key].Count,Time: report.Log[key].DateTime});
    }
    csvStream.end();

	writableStream.on("finish", function(){
	  if(log)	console.log("report: SaveLog Done!!");
	  report.clearLog();
	});
}


var self = module.exports = {
	log : report,
	newLogEntry: function(tag)	{
		return report.newLogEntry(tag);
	},
	saveExistingLog: function(logName)	{
		return saveExistingLog(logName);
	}
}