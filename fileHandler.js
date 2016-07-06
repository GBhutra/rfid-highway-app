//This file would read the csv file and load it into the hash/database
'use strict';

var csv = require("fast-csv");
var exports = module.exports = {};

exports.createDBFromFile = function(filePath, model)	{
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