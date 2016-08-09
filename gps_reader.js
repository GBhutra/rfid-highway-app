var SerialPort = require('serialport');
var view = require('./reader_view.js'); 
var model = require('./models');
var io = require('./sockets.js');

var log = true;
var GPS = new Object();
GPS.currLat = 0.0;
GPS.currLon = 0.0;
GPS.prevLat = 0.0;
GPS.prevLon = 0.0;
GPS.range = 0.0001;


var port= new SerialPort('/dev/ttyAMA0', {
		baudrate: 115200,
		parser: SerialPort.parsers.readline('\n'),
		autoOpen: false
});

var Initialize = function()	{
	if(log) console.log("In GPS Initialize function !!");
};

var StartGPS = function()	{
	if (log) console.log("In Start function for GPS");
	port.open(function(err)	{
		if(log) console.log("ERROR opening GPS port :"+err);
	});
};

var StopGPS= function()	{
	if (log) console.log("In Stop function for GPS");
	port.close(function(err)	{
		if(log) console.log("ERROR closing GPS port :"+err);
	});
};

var UpdateRange= function(val)	{
	GPS.range=AddFloats(0.0001,+parseFloat(val/100000).toFixed(5),5);
	console.log("gps range changed to: "+GPS.range);
};


port.on('open',function()	{
	if (log) console.log("Serial port opened");
});

port.on('data',function(data)	{
	if(0==view.status)	return;
	var temp = data.split(',');
	if(temp.length>7)	{
		if("$GPRMC"==temp[0])	{
			var lat_raw = temp[3];
			var lon_raw = temp[5];
			var lat = parseFloat(lat_raw.substring(0,2));
			var lon = parseFloat(lon_raw.substring(0,3));
			lat=(parseFloat(lat)+(parseFloat(lat_raw.substring(2))/60)).toFixed(6);
			lon=(parseFloat(lon)+(parseFloat(lon_raw.substring(3))/60)).toFixed(4);
			if("W"==temp[6])	{ lon = lon*-1;	}
			if (log) console.log("\n\nGPSData: lat: "+lat+" lon: "+lon);
			if (log) console.log("currLat: "+GPS.currLat+" currLon: "+GPS.currLon+" prevLat: "+GPS.prevLat+" prevLon: "+GPS.prevLon);
			if (log) console.log("LatDiff: "+(Math.abs(parseFloat(lat)-parseFloat(GPS.currLat)).toFixed(6))+"\tLonDiff: "+(Math.abs(parseFloat(lon)-parseFloat(GPS.currLon)).toFixed(4)));
			if (0.0!=(parseFloat(lat)-parseFloat(GPS.currLat)).toFixed(6) || 0.0!=(parseFloat(lon)-parseFloat(GPS.currLon)).toFixed(4))	{
				GPS.prevLat = GPS.currLat;
				GPS.prevLon = GPS.currLon;
				GPS.currLon = lon;
				GPS.currLat = lat;
				var rlat = AddFloats(GPS.currLat,GPS.range,6);
				var llat = AddFloats(GPS.currLat,-GPS.range,6);
				var rlon = AddFloats(GPS.currLon,GPS.range,4);
				var llon = AddFloats(GPS.currLon,-GPS.range,4);
				model.Tag.findAll({
					where: {
		  	            lat: {$between: [llat, rlat]},
	            		lon: {$between: [llon, rlon]}
	        		},
	        		raw: true
	        	}).then(function(tags)  {
        			if(log)	{	console.log(" Number of tags found: "+tags.length+"\n");	}
					if(tags.length>0)	{
						var i=0; 
						var min_dist=1.0;
						var closest_tags=[];
						for (i=0;i<tags.length;i++)	{
							var dist = GetDistanceBetween({lat: GPS.currLat, lon: GPS.currLon}, {lat: tags[i].lat, lon: tags[i].lon});
							if(log) console.log("Distance from "+i+" point is:"+dist);
							if(dist<min_dist)	{
								closest_tags.length = 0;
								closest_tags.push(tags[i]);
								min_dist = dist;
							}
							else if(dist==min_dist)	{
								closest_tags.push(tags[i]);
							}
						}
						if (log) console.log(" Found "+closest_tags.length+" tags in the vicinity!!");
						if (log) console.log(closest_tags);
						if (closest_tags.length<4)	{
							var update = UpdateAssetIDs(closest_tags);
							io.UpdateAllClients('signs',{assets: view.assets});
						}
					}
        		});				
			}
		}
	}
});


//helper functions
function GetDistanceBetween(location1, location2)	{
	var latDiff = (parseFloat(location1.lat)-parseFloat(location2.lat)).toFixed(5);
	var LonDiff = (parseFloat(location1.lon)-parseFloat(location2.lon)).toFixed(4);
	return Math.sqrt(Math.pow(latDiff,2)+Math.pow(LonDiff,2)).toFixed(6);
}

function UpdateAssetIDs(tags)	{
	if(tags.length>3)	return false;

	if(tags.length==view.assets.length)	{
		var update = false;
		for (var i=0;i<tags.length;i++)	{
			if (tags[i].assetId!=view.assets[i])	{
				view.assets[i] = "assets/"+tags[i].assetId+".png";
				view.assets_status[i]=false;
				update = true;
			}
		}
		if (0==tags.length)	{
			if("images/load.gif"!=view.assets[0])	{
				view.assets[0]="images/load.gif";
				view.assets_status[0]=false;
				update = true;
			}
		}
		return update;
	}
	else	{
		view.assets.length = 0;
		view.assets_status.length = 0;
		for (var i=0;i<tags.length;i++)	{
			view.assets[i] = "assets/"+tags[i].assetId+".png";
			view.assets_status[i]=false;
		}
		if (0==tags.length)	{
			if("images/load.gif"!=view.assets[0])	{
				view.assets[0]="images/load.gif";
				view.assets_status[0]=false;
			}
			else
				return false;
		}
		return true;
	}
}

function AddFloats(val1, val2, precision)	{
	return (parseFloat(val1)+parseFloat(val2)).toFixed(precision);
}

//Testing functions
var TestWithCoordinates = function(lat,lon)	{
	if (0.0!=(parseFloat(lat)-parseFloat(GPS.currLat)).toFixed(6) || 0.0!=(parseFloat(lon)-parseFloat(GPS.currLon)).toFixed(4))	{
		GPS.prevLat = GPS.currLat;
		GPS.prevLon = GPS.currLon;
		GPS.currLon = lon;
		GPS.currLat = lat;
		var rlat = AddFloats(GPS.currLat,GPS.range,6);
		var llat = AddFloats(GPS.currLat,-GPS.range,6);
		var rlon = AddFloats(GPS.currLon,GPS.range,4);
		var llon = AddFloats(GPS.currLon,-GPS.range,4);
		model.Tag.findAll({
			where: {
  	            lat: {$between: [llat, rlat]},
        		lon: {$between: [llon, rlon]}
    		},
    		raw: true
    	}).then(function(tags)  {
			if(log)	{	console.log(" Number of tags found: "+tags.length+"\n");	}
			if(tags.length>=0)	{
				var i=0; 
				var min_dist=1.0;
				var closest_tags=[];
				for (i=0;i<tags.length;i++)	{
					var dist = GetDistanceBetween({lat: GPS.currLat, lon: GPS.currLon}, {lat: tags[i].lat, lon: tags[i].lon});
					if(log) console.log("Distance from "+i+" point is:"+dist);
					if(dist<min_dist)	{
						closest_tags.length = 0;
						closest_tags.push(tags[i]);
						min_dist = dist;
					}
					else if(dist==min_dist)	{
						closest_tags.push(tags[i]);
					}
				}
				if (log) console.log(" Found "+closest_tags.length+" tags in the vicinity!!");
				if (log) console.log(closest_tags);
				if (closest_tags.length<4)	{
					var update = UpdateAssetIDs(closest_tags);
					if(update)	{
						io.UpdateAllClients('sign_status',{assets_status: view.assets_status});
						io.UpdateAllClients('signs',{assets: view.assets});
					}
				}
			}
		});				
	}
}

module.exports.UpdateRange=UpdateRange;
module.exports.StartGPS=StartGPS;
module.exports.StopGPS=StopGPS;
module.exports=GPS;
module.exports.Initialize=Initialize;
module.exports.TestWithCoordinates = TestWithCoordinates;