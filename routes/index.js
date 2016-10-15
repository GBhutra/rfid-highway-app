var express = require('express');
var router = express.Router();
var contrl = require('../controller')
var rfidRdr = contrl.reader;
//var logger = require('../file_handler');

var log = require('../systemLog.js').routeIndex;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'RFID Highway Application',reader: rfidRdr});
});

router.get("/scanner/", function(req, res) {
	if (log) console.log("routes/index.js: /scanner for reader");
	res.render("scanner",{reader: rfidRdr});
});

router.get("/scannerInit/:maxTags", function(req, res) {
	if ('ACTVE'!=rfidRdr.status)	{
		contrl.setMaxTags(req.params.maxTags);
		res.render("scannerInit",{maxTags: req.params.maxTags, date: Date()});
	}
	else	{
		res.render("scannerInit",{maxTags: req.params.maxTags, date: Date(),error: "Scaning in Progress "});
	}
});


module.exports = router;
