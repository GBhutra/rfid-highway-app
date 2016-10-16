var log = require('../systemLog').routeInventory;
var express = require('express');
var model = require('../models');
var reader = require('../middleware/rfidReader.js').reader;
var invtryMgr = require('../middleware/inventoryManager.js');
var fs = require('fs');
var util = require('util');
var router = express.Router();

/* GET location listing. */
router.get('/', function(req, res){
	model.Tag.aggregate('location', 'DISTINCT', {plain: false})
	.then(function(locs)	{
		if (log) console.log(reader);
		res.render('inventory', {areas: locs, reader: reader});
	});
});

router.post('/newLocation', function(req, res, next) {
	if (log) console.log("routes/Inventory: /newLocation");
	if (log) console.log(req.files);
	if (!req.files) {
        res.send('No files were uploaded.');
        return;
    }
    var newLocationFile = req.files.new_location_file;
	newLocationFile.mv('inventory/'+newLocationFile.name, function(err) {
        if (err) {
            model.Tag.aggregate('location', 'DISTINCT', {plain: false})
			.then(function(locs)	{
				if (log) console.log(reader);
				res.render('inventory', {areas: locs, reader: reader, error: "Could not locate the file !"});
			});
        }
        else {
        	invtryMgr.addTagsToDBFrom('inventory/'+newLocationFile.name);
        	model.Tag.aggregate('location', 'DISTINCT', {plain: false})
			.then(function(locs)	{
				if (log) console.log(reader);
				res.render('inventory', {areas: locs, reader: reader, success: "File Upload successfull !!"});
			});
        }
    });
});

router.get('/search/:ar', function(req, res) {
	if (log) console.log("Search: "+req);
	res.end("Riverside");
});

router.get('/:ar', function(req, res, next) {
	model.Tag.findAll({where: {location: req.params.ar }, raw: true}).then(function(tags){
		res.render('location',{location:req.params.ar, tags:tags, reader: reader});
	});
});


router.get('/:ar/tagEdit/:id', function(req, res, next) {
	model.Tag.findOne({where: {tagId: req.params.id }, raw: true}).then(function(tag){
		res.render('editTag',{tag:tag, loc: req.params.ar, reader: reader});
	});
});

router.post('/:ar/tagUpdate/:id', function(req,res,next)	{
	model
	.Tag
	.update({
		signType	: req.body.signType,
		address 	: req.body.address,
		assetId 	: req.body.assetId,
		lat 		: req.body.lat,
		lon			: req.body.lon,
		location	: req.body.location
	},{
	where: {tagId: req.params.id }}).then(function(result){
		if (log) console.log("Updated");
		model.Tag.findOne({where: {tagId: req.params.id }, raw: true}).then(function(tag){
			res.render('editTag',{tag:tag,loc:req.params.ar,success: "Successfully updated !!", reader: reader});
		});
	}, function(err)	{
		next(err);
		console("Update Error : "+err);
		model.Tag.findOne({where: {tagId: req.params.id }, raw: true}).then(function(tag){
			res.render('editTag',{tag:tag,loc:req.params.ar,error: "Update Error: "+err, reader: reader});
		});
	});
});

router.post('/:ar/tagDelete/:id', function(req,res,next)	{
	return model.Tag.destroy({where: {tagId:req.params.id}}).then(function(affectedRows){
		if (log) console.log("Number of rows deleted :"+affectedRows);
		model.Tag.findAll({where: {location: req.body.location }, raw: true}).then(function(tags){
			res.render('location',{location:req.params.ar, tags:tags, success: "Successfully deleted !!", reader: reader});
		});
	});
});

module.exports = router;
