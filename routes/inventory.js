var log = require('../systemLog').routeInventory;
var express = require('express');
var reader = require('../middleware/rfidReader.js').reader;
var fs = require('fs');
var util = require('util');
var router = express.Router();

/* GET location listing. */
router.get('/', function(req, res){
	res.render('inventory', {reader: reader});
});

module.exports = router;
