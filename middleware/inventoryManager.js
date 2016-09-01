//This file would read the csv file and load it into the hash/database
//Singleton design pattern

'use strict';
var log = require('../systemLog.js').inventoryManager;

var csv = require("fast-csv");
var model = require('../models');
var walk = require('walk'), fs = require('fs'), walker;

var inventory = new Object();
inventory.files = [];

// This function reads and stores in the inventory variable
function addFilesToInventoryFrom(dirPath)	{
	walker = walk.walk(dirPath);
    walker.on("file", function (root, fileStats, next) {
    	fs.readFile(fileStats.name, function () {
      	if (/.csv/.exec(fileStats.name))	{
        	if (log) console.log("inventoryManager: CSV File found: "+fileStats.name);
        	inventory.files.push(dirPath+"/"+fileStats.name);
        }
      	next();
    	});
  	});
    walker.on("errors", function (root, nodeStatsArray, next) {
    	if (log) console.log("inventoryManager: Error Reading a file !! ")
    	next();
  	});
    walker.on("end", function () {
    	if (log)	console.log("inventoryManager: getInventoryFiles all done!! No. of files found: "+inventory.files.length);
    	return true;
  });
}

// This function reads a csv file 
function readInventoryFile(file)	{
	if (fs.existsSync(file)) { 
		var csvstream = csv
		.fromPath(file,{ trim : true, headers : true , ignoreEmpty : true })
	    .on("data", function (data) {
	    	console.log(data);
	    }).on("end", function()	{
		     console.log("Done\n\n");
		});
	}
	else
		if (log) console.log("inventoryManager: readInventoryFile ERROR File: "+filePath+" does not Exist !!");
}

//This function reads the a csv file into DB
function createDBFromFile(filePath)	{
	if (fs.existsSync(filePath)) { 
	    if (log) console.log("inventoryManager: Reading from file: "+filePath);
	    var csvstream = csv
		.fromPath(filePath,{ trim : true, headers : true , ignoreEmpty : true })
	    .on("data", function (tag) {
	    	model.Tag
		 	.create(tag)
		 	.then(function(tag){
				if (log) console.log("inventoryManager: Entry to the Database made successfully !! tagid: "+tag.tagId);
			})
		 	.catch(function(err){
				if (log) console.log("inventoryManager: Error occured ERROR: "+err); 
			});
	    }).on("end", function()	{
		     if (log) console.log("inventoryManager: createDBFromFile createDBFromFile Done");
		     return true;
		});
	}
	else	{
		if (log) console.log("inventoryManager: ERROR File: "+filePath+" does not Exist !!");
		return false;
	}
}

function initializeDB(dirPath)	{
	walker = walk.walk(dirPath);
    var availablelogs=[];
    walker.on("file", function (root, fileStats, next) {
    	fs.readFile(fileStats.name, function () {
      	if (/.csv/.exec(fileStats.name))	{
        	if (log) console.log("inventoryManager: CSV File found: "+fileStats.name);
        	inventory.files.push(dirPath+"/"+fileStats.name);
        }
      	next();
    	});
  	});
    walker.on("errors", function (root, nodeStatsArray, next) {
    	if (log) console.log("inventoryManager: Error Reading a file !! ")
    	next();
  	});
    walker.on("end", function () {
    	if (log)	console.log("inventoryManager: No. of files found: "+inventory.files.length);
    	for (var i=0;i<inventory.files.length;i++)	{
    		createDBFromFile(inventory.files[i]);
    	}
    	if (log)	console.log("inventoryManager: initializeDB Complete !! ");
  		return true;
  });
}

var self = module.exports = {
	files : inventory.files,
	addTagsToDBFrom: function(filePath)	{
		return createDBFromFile(filePath);
	},
	addFilesToInventoryFrom: function(dirPath)	{
		return addFilesToInventoryFrom(dirPath);
	},
	initializeDB: function(path)	{
		return initializeDB(path);
	}
}

