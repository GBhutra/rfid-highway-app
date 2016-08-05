var express = require('express');
var csv = require("fast-csv");
var walk = require('walk'), fs = require('fs'), walker;
var router = express.Router();

var log = true;

/* GET reports listing. */
router.get('/', function(req, res, next) {
	walker = walk.walk("public/reports/");
    var availablelogs=[];
    walker.on("file", function (root, fileStats, next) {
    	fs.readFile(fileStats.name, function () {
      	if (/.csv/.exec(fileStats.name))	{
        	if (log) console.log("File Name: "+fileStats.name);
        	availablelogs.push(fileStats.name);
        }
      	next();
    	});
  	});
    
    walker.on("errors", function (root, nodeStatsArray, next) {
    	next();
  	});
 
    walker.on("end", function () {
    	if (log)	console.log("Logger: all done "+availablelogs.length+" logs found !!");
    		res.render('reports',{reports: availablelogs});
    		availablelogs = [];
  });
});

router.get('/reportDelete/:id', function(req,res,next)	{
	console.log("report requested to delete :"+req.params.id);
	fs.unlinkSync('public/reports/'+req.params.id);
	walker = walk.walk("public/reports/");
    var availablelogs=[];
    walker.on("file", function (root, fileStats, next) {
    	fs.readFile(fileStats.name, function () {
      	if (/.csv/.exec(fileStats.name))	{
        	if (log) console.log("File Name: "+fileStats.name);
        	availablelogs.push(fileStats.name);
        }
      	next();
    	});
  	});
    
    walker.on("errors", function (root, nodeStatsArray, next) {
    	next();
  	});
 
    walker.on("end", function () {
    	if (log)	console.log("Logger: all done "+availablelogs.length+" logs found !!");
    		res.render('reports',{reports: availablelogs});
    		availablelogs = [];
  });
});

router.get('/:rep', function(req, res, next) {
	var rep=[];
	var repHeader;
	csv
	 .fromPath('public/reports/'+req.params.rep+".csv")
	 .on("data", function(data)	{
	 	var temp = new function() {
	 		if(data[0]=='TagID')
	 			repHeader = data;
	 		else
	 			rep.push(data);
	 	}
	}).on("end", function()	{
	     console.log("Report reading done "+rep.length+" entries found !!");
       var col = new Object();
       col.sign = true;
       col.address = true;
       col.time = true;
	     res.render('report',{name: req.params.rep, report: rep, headers: repHeader,col: col, filter: "all tags"});
	});
});

router.post('/:rep', function(req, res, next) {
  var col = new Object();
  if(req.body.sign) col.sign = true;
  if(req.body.address) col.address = true;
  if(req.body.time) col.time = true;
  if(req.body.gps) col.gps = true;
  if(req.body.count) col.count = true;

  console.log("Address: "+req.body.time);
  console.log("Timestamp: "+req.body.address);
  console.log("GPS: "+req.body.GPS);
  console.log("Count: "+req.body.count);
  console.log("Filter: "+req.body.filter);
  var rep=[];
  var repHeader;
  csv
   .fromPath('public/reports/'+req.params.rep+".csv")
   .on("data", function(data) {
    var temp = new function() {
      if(data[0]=='TagID')
        repHeader = data;
      else
        rep.push(data);
    }
  }).on("end", function() {
       console.log("Report reading done "+rep.length+" entries found !!");
       res.render('report',{name: req.params.rep, report: rep, headers: repHeader,col: col, filter: req.body.filter});
  });
});
 

module.exports = router;