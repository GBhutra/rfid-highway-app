var express = require('express');
var router = express.Router();
var view = require('../reader_view.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'RFID Highway Application' });
});

router.get("/reader", function(req, res){
    res.render("rfidReader",{view});
});

module.exports = router;
