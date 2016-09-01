var express = require('express');
var router = express.Router();
var rfidRdr = require('../middleware/rfidReader').reader;
//var logger = require('../file_handler');
var gps = require('../middleware/gpsReader.js').gps;

var log = require('../systemLog.js').routeIndex;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'RFID Highway Application',reader: rfidRdr});
});

router.get("/scanner/:loc", function(req, res) {
	if (log) console.log("routes/index.js: /scanner set location for reader: "+rfidRdr.getLocation());
	if (req.params.loc==rfidRdr.getLocation())	{
		if (log) console.log("routes/index.js: same location set in view : "+rfidRdr.getLocation());
		res.render("scanner",{reader: rfidRdr});
	}
	else	{
		console.error("error opening the reader page !! Another scan in progress...");
		if (log) console.log(rfidRdr);
		var d = new Date();
		if (log) console.log("routes/index.js: /scanner/ IDLE state ");
		res.render("scannerInit",{loc: req.params.loc,date: d.toDateString(), GPSLat: gps.currLat, GPSLon: gps.currLon, error: "Incorrect Location seleted !! "});
	}
});

router.get("/scannerInit/:loc", function(req, res) {
	if (null!=rfidRdr.getLocation() && req.params.loc != rfidRdr.getLocation())	{
		var d = new Date();
		if (log) console.log("routes/index.js: /scannerInit/ different location set in view : "+rfidRdr.getLocation());
		if ('ACTIVE'==rfidRdr.status)	{
			console.error("error opening the reader page !! Another scan in progress...");
			if (log) console.log(rfidRdr);
			res.render("scannerInit",{loc: req.params.loc,date: d.toDateString(), GPSLat: gps.currLat, GPSLon: gps.currLon,error: "Another scan is in progress !! "});
		}
		else	{
			if (log) console.log("routes/index.js: Reader not in ACTIVE state ");
			if (log) console.log(rfidRdr);
			res.render("scannerInit",{loc: req.params.loc,date: d.toDateString(), GPSLat: gps.currLat, GPSLon: gps.currLon});
		}
	}
	else	{
		var d = new Date();
		if ('ACTIVE'!=rfidRdr.status) {
			if (log) console.log("routes/index.js:  /initilalize/ reader not in ACTIVE state ");
			if (log) console.log(rfidRdr);
			res.render("scannerInit",{loc: req.params.loc,date: d.toDateString(), GPSLat: gps.currLat, GPSLon: gps.currLon});
		}
		else	{
			console.error("routes/index.js: This is a weired case in /ScannerInit/:loc");
			if (log) console.log(rfidRdr);
		}
	}
});


/*
router.get("/initialize/:loc", function(req, res) {
	if (null!=view.loc && req.params.loc != view.loc)	{
		if (log) console.log("routes/index.js: /initilalize/ different location set in view : "+view.loc);
		if (1==view.status)	{
			console.error("error opening the reader page !! Another scan in progress...");
			var d = new Date();
			if (log) console.log("routes/index.js:  /initilalize/ reader in IDLE state ");
			res.render("initialization",{loc: req.params.loc,date: d.toDateString(), GPSLat: gps.currLat, GPSLon: gps.currLon,error: "Another scan is in progress !! "});
		}
		else {
			var d = new Date();
			if (0==view.status)	{
				if (log) console.log("routes/index.js:  /initilalize/ reader in IDLE state ");
				view.loc = req.params.loc;
				res.render("initialization",{loc: req.params.loc,date: d.toDateString(), GPSLat: gps.currLat, GPSLon: gps.currLon});
			}
			else	{
				if (log) console.log("routes/index.js:  /initilalize/ reader in ERROR state ");
				view.UpdateStatusTo('stop');
				res.render("initialization",{loc: req.params.loc,date: d.toDateString(), GPSLat: gps.currLat, GPSLon: gps.currLon,error: "Could not start the reader. Check connections !"});
			}
		}
	}
	else {
		if (null==view.loc)	{
			if (log) console.log("routes/index.js:  /initilalize/ location set as null in view");
			view.loc = req.params.loc;
		}
		if (log) console.log("routes/index.js:  /initilalize/ and same location set in view : "+view.loc+" req: "+req.params.loc);
		if (1==view.status)	{
			if (log) console.log("routes/index.js:  /initilalize/ reader in ACTIVE state ");
			res.render("rfidReader",{view});
		}
		else {
			var d = new Date();
			if (0==view.status)	{
				if (log) console.log("routes/index.js:  /initilalize/ reader in IDLE state ");
				view.loc = req.params.loc;
				res.render("initialization",{loc: req.params.loc,date: d.toDateString(), GPSLat: gps.currLat, GPSLon: gps.currLon});
			}
			else	{
				if (log) console.log("routes/index.js:  /initilalize/ reader in ERROR state ");
				view.UpdateStatusTo('stop');
				res.render("initialization",{loc: req.params.loc,date: d.toDateString(), GPSLat: gps.currLat, GPSLon: gps.currLon,error: "Could not start the reader. Check connections !"});
			}
		}
	}
});

/*
router.post('/tagCreate/', function(req,res,next)	{
	var tag = model.Tag.build({
			area 		: req.body.area;
			signType	: req.body.signType,
			address 	: req.body.address,
			assetId 	: req.body.assetId,
			tagId 		: req.body.tagId,
			lat 		: req.body.lat,
			lon			: req.body.lon,
	});
	return model.Tag.destroy({where: {tagId:req.params.id}}).then(function(affectedRows){
		console.log("Number of rows deleted :"+affectedRows);
		model.Tag.findAll({where: {area: req.body.area }, raw: true}).then(function(tags){
			res.render('tagList',{area:req.body.area, tags:tags});
		});
	});
});*/

module.exports = router;
