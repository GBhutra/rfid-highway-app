var log = true;
var model = require('./models');
var view = require('./reader_view.js');
var io = require('./sockets.js');
var llrp = require("llrp");
var reader = new llrp({ipaddress: 'SpeedwayR-11-4A-D6.local'});


reader.on('timeout', function () {
    if(true==log)   { console.log('\nRFID Reader timeout....!!'); }
});

reader.on('disconnect', function () {
    if(true==log)   { console.log('\nRFID Reader disconnect');  }
});

reader.on('error', function (error) {
    var er = JSON.stringify(error);
    if(true==log)   { console.log('\nRFID Reader error: ' + er); }
});

reader.on('didSeeTag', function (tag) {
    if(true==log)   { console.log('\nRFID Reader TAG: ' + tag.tagID);   }
    model.Tag.findOne({
        where: {    tagId: "0x"+tag.tagID },
        raw: true})
    	.then(function(tagFound)  {
        	if (null==tagFound)  {
           		if (true==log)  {   console.log("\nTag not registered !!!");    }
        	}
        	else {
            	if (log)  {   console.log(" Tag found in the DB with Address: "+tagFound.address); }
		    var assetIndex = view.assets.indexOf(tagFound.assetId);
		    if (assetIndex<view.assets_status.length)	{
		    	if (log) console.log("Asset Id index of the tag found is :"+assetIndex);
                if (false==view.assets_status[assetIndex])  {
                    view.assets_status[assetIndex] = true;
                    io.UpdateAllClients('sign_status','update');
                }
		    }
		    else	{
		    	if (log) console.log("Invalid assetIndex :"+assetIndex+" assetsStatus Length: "+view.assets_status.length);
		    }
        }
    });
});

var TestWithTag =function(tag)  {
    if(true==log)   { console.log('\nRFID Reader TAG: ' + tag.tagID);   }
    model.Tag.findOne({
        where: {    tagId: "0x"+tag.tagID },
        raw: true})
        .then(function(tagFound)  {
            if (null==tagFound)  {
                if (true==log)  {   console.log("\nTag not registered !!!");    }
            }
            else {
                if (log)  {   console.log(" Tag found in the DB with Address: "+tagFound.address); }
            var assetIndex = view.assets.indexOf(tagFound.assetId);
            if (assetIndex<view.assets_status.length)   {
                if (log) console.log("Asset Id index of the tag found is :"+assetIndex);
                if (false==view.assets_status[assetIndex])  {
                    view.assets_status[assetIndex] = true;
                    io.UpdateAllClients('sign_status','update');
                }
            }
            else    {
                if (log) console.log("Invalid assetIndex :"+assetIndex+" assetsStatus Length: "+view.assets_status.length);
            }
        }
    });
}

module.exports=reader;
module.exports.TestWithTag= TestWithTag;