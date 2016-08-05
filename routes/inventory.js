var express = require('express');
var model = require('../models');
var view = require('../reader_view.js');
var router = express.Router();

/* GET location listing. */
router.get("/", function(req, res){
	model.Tag.aggregate('area', 'DISTINCT', {plain: false})
	.then(function(areas)	{
		res.render('inventory', {areas: areas, view: view});
	});
});

router.get('/:ar', function(req, res, next) {
	model.Tag.findAll({where: {area: req.params.ar }, raw: true}).then(function(tags){
		res.render('tagList',{area:req.params.ar, tags:tags});
	});
});

router.get('/:ar/newTag', function(req, res, next) {
	res.render('newTag',{area: req.params.ar});
});

router.get('/:ar/tagEdit/:id', function(req, res, next) {
	model.Tag.findOne({where: {tagId: req.params.id }, raw: true}).then(function(tag){
		res.render('editTag',{tag:tag,loc: req.params.ar});
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
		},{
		where: {tagId: req.params.id }}).then(function(result){
			console.log("Updated");
			model.Tag.findOne({where: {tagId: req.params.id }, raw: true}).then(function(tag){
				res.render('editTag',{tag:tag,loc:req.params.ar,success: "Successfully updated !!"});
			});
		}, function(err)	{
			next(err);
			console("Update Error : "+err);
			model.Tag.findOne({where: {tagId: req.params.id }, raw: true}).then(function(tag){
				res.render('editTag',{tag:tag,loc:req.params.ar,error: "Update Error: "+err});
			});
		});
});

router.post('/:ar/tagDelete/:id', function(req,res,next)	{
	return model.Tag.destroy({where: {tagId:req.params.id}}).then(function(affectedRows){
		console.log("Number of rows deleted :"+affectedRows);
		model.Tag.findAll({where: {area: req.body.area }, raw: true}).then(function(tags){
			res.render('',{area: req.params.ar});
		});
	});
});


module.exports = router;
