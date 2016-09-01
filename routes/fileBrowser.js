var express = require('express');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var util = require('util');
var router = express.Router();

/* GET location listing. */
router.get("/", function(req, res)	{
	console.log("Browser function Entrered !! ");
	var currentDir =  dir;
	var query = req.query.path || '';
	if (query) currentDir = path.join(dir, query);
	console.log("browsing ", currentDir);
	fs.readdir(currentDir, function (err, files) {
		if (err) {
			throw err;
		}
		var data = [];
		files
		.filter(function (file) {
			  return true;
		}).forEach(function (file) {
			try {
					console.log("processing ", file);
					var isDirectory = fs.statSync(path.join(currentDir,file)).isDirectory();
					if (isDirectory) {
					  data.push({ Name : file, IsDirectory: true, Path : path.join(query, file)  });
					} else {
					  var ext = path.extname(file);
					  if(program.exclude && _.contains(program.exclude, ext)) {
						console.log("excluding file ", file);
						return;
					  }       
					  data.push({ Name : file, Ext : ext, IsDirectory: false, Path : path.join(query, file) });
					}

			} catch(e) {
			  console.log(e); 
			}        
			
		});
		data = _.sortBy(data, function(f) { return f.Name });
		console.log(data);
	});
});

module.exports = router;
