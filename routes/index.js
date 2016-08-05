var express = require('express');
var router = express.Router();
var view = require('../reader_view.js');
var logger = require('../file_handler.js');

var log = true;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'RFID Highway Application' });
});

router.get("/reader/:loc", function(req, res) {
	if (null==view.loc)	{
		view.loc = req.params.loc;
		res.render("rfidReader",{view});
		logger.initLogOfLocation(req.params.loc);
	}
	else if (req.params.loc == view.loc)	{
		res.render("rfidReader",{view});
	}
	else
		console.error("error opening the reader page !!");
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
