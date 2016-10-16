var log = require('../systemLog').routeReport;
var express = require('express');
var router = express.Router();
var csv = require("fast-csv");
var reportLocation = 'report/';
var reader = require('../middleware/rfidReader.js').reader;
var walk = require('walk'), fs = require('fs'), walker;

router.get('/', function(req, res, next) {
  walker = walk.walk(reportLocation);
  var availablelogs=[];
  walker
  .on("file", function (root, fileStats, next) {
  fs.readFile(fileStats.name, function () {
    if (/.csv/.exec(fileStats.name))  {
      if (log) console.log("Routes/reports: File Name: "+fileStats.name);
        availablelogs.push(fileStats.name);
    }
    next();
    });
  });
  walker.on("errors", function (root, nodeStatsArray, next) {
    next();
  });
  walker.on("end", function () {
    if (log)  console.log("Routes/reports: all done "+availablelogs.length+" logs found !!");
      res.render('reports',{reports: availablelogs, reader: reader});
      availablelogs = [];
  });
});

router.get('/:rep', function(req, res, next) {
  var rep=[];
  var repHeader;
  csv
   .fromPath(reportLocation+req.params.rep+".csv")
   .on("data", function(data) {
    var temp = new function() {
      if(data[0]=='TagID')
        repHeader = data;
      else
        rep.push(data);
    }
  }).on("end", function() {
       if (log)  console.log("Routes/reports: Report reading done "+rep.length+" entries found !!");
       var col = new Object();
       col.sign = true;
       col.address = true;
       col.time = true;
       res.render('report',{name: req.params.rep, report: rep, headers: repHeader,col: col, filter: "all tags", reader: reader});
  });
});

/* GET reports listing. */
router.get('/reportDelete/:id', function(req,res,next)	{
	if (log)  console.log("Routes/reports: report requested to delete :"+req.params.id);
	fs.unlinkSync(reportLocation+req.params.id);
	walker = walk.walk(reportLocation);
    var availablelogs=[];
    walker.on("file", function (root, fileStats, next) {
    	fs.readFile(fileStats.name, function () {
      	if (/.csv/.exec(fileStats.name))	{
        	if (log)  console.log("Routes/reports: File Name: "+fileStats.name);
        	availablelogs.push(fileStats.name);
        }
      	next();
    	});
  	});
    
    walker.on("errors", function (root, nodeStatsArray, next) {
    	next();
  	});
 
    walker.on("end", function () {
    	if (log)  console.log("Routes/reports: all done "+availablelogs.length+" logs found !!");
    		res.render('reports',{reports: availablelogs, reader: reader});
    		availablelogs = [];
  });
});

router.post('/:rep', function(req, res, next) {
  var col = new Object();
  if(req.body.sign) col.sign = true;
  if(req.body.address) col.address = true;
  if(req.body.time) col.time = true;
  if(req.body.gps) col.gps = true;
  if(req.body.count) col.count = true;

  if (log)  console.log("Routes/reports: Address: "+req.body.time);
  if (log)  console.log("Routes/reports: Timestamp: "+req.body.address);
  if (log)  console.log("Routes/reports: GPS: "+req.body.GPS);
  if (log)  console.log("Routes/reports: Count: "+req.body.count);
  if (log)  console.log("Routes/reports: Filter: "+req.body.filter);
  var rep=[];
  var repHeader;
  csv
   .fromPath(reportLocation+req.params.rep+".csv")
   .on("data", function(data) {
    var temp = new function() {
      if(data[0]=='TagID')
        repHeader = data;
      else
        rep.push(data);
    }
  }).on("end", function() {
       if (log)  console.log("Routes/reports: Report reading done "+rep.length+" entries found !!");
       res.render('report',{name: req.params.rep, report: rep, headers: repHeader,col: col, filter: req.body.filter, reader: reader});
  });
});

module.exports = router;