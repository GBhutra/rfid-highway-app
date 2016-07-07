var express = require('express');
var router = express.Router();
var view = require('../reader_view.js');
var model = require('../models');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'RFID Highway Application' });
});

router.get("/reader", function(req, res){
    res.render("rfidReader",{view});
});

router.get("/area", function(req, res){
	model.Tag.aggregate('area', 'DISTINCT', {plain: false})
	.then(function(areas)	{
		res.render('area', {areas: areas});
	});
});

router.get('/area/:ar', function(req, res, next) {
	model.Tag.findAll({where: {area: req.params.ar }, raw: true}).then(function(tags){
		res.render('tagList',{area:req.params.ar, tags:tags});
	});
});

router.get('/area/tag/:id', function(req, res, next) {
	model.Tag.findOne({where: {tagId: req.params.id }, raw: true}).then(function(tag){
		res.render('tag',{tag:tag});
	});
});

router.get('/reports/', function(req, res, next) {
	model.Tag.findOne({where: {tagId: req.params.id }, raw: true}).then(function(tag){
		res.render('reports',{reports: null});
	});
});

module.exports = router;
