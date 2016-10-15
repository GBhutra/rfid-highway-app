//This file abstracts the reading of rfid tags from the system
//The gps rfid is an observable quantity being observerd by the main controller in conjunction with the gps reader data
var log = require('../systemLog.js').rfidReader;
var llrp = require('./llrp/index.js');


var readerClient = new llrp({
    ipaddress: 'SpeedwayR-11-4A-D6.local'
});

//reader defaults
function Reader()   {
    this.status = "IDLE",
    this.tagID=null,
    this.observers=[]
}

// add Observer to the reader values
Reader.prototype.addObserver = function(obs)   {
    this.observers.push(obs);
}

// remove observer from the observers list
Reader.prototype.remObserver = function(obs)   {
    var index = this.observers.indexOf(obs);
    if(index > -1) {
        this.observers.splice(index, 1);
    }
}
// notify all observers 
Reader.prototype.notifyStatus = function() {
  for(var i = 0; i < this.observers.length; i++){
    this.observers[i].update({status: this.status, tagID: this.tagID});
  }
}
// notify all observers on change of status only
Reader.prototype.notifyStatus = function() {
  for(var i = 0; i < this.observers.length; i++){
    this.observers[i].statusUpdate({status: this.status});
  }
}
// notify all observers on change a new read tag only
Reader.prototype.notifyRead = function() {
  for(var i = 0; i < this.observers.length; i++){
    this.observers[i].readUpdate({readTag: this.tagID});
  }
}

//update the current state of the reader
Reader.prototype.setStatus = function(status) {
  this.status = status;
  this.notifyStatus();
}

// return the current state of the reader
Reader.prototype.getStatus = function() {
  return this.status;
}
var rdr = new Reader();
// ---- reader defaults set ----- //

readerClient.on('timeout', function () {
    if(true==log)   { console.log('\nRFID Reader timeout....!!'); }
    rdr.setStatus("ERROR");
});

readerClient.on('disconnect', function () {
    if(true==log)   { console.log('\nRFID Reader disconnect');  }
    rdr.setStatus("IDLE");
});

readerClient.on('connected', function () {
    if(true==log)   { console.log('\nRFID Reader Connected');  }
    rdr.setStatus("ACTIVE");
});

readerClient.on('error', function (error) {
    var er = JSON.stringify(error);
    if(true==log)   { console.log('\nRFID Reader error: ' + er); }
    rdr.setStatus("ERROR");
});

readerClient.on('didSeeTag', function (tag) {
    if(true==log)   { console.log('\nrfidReader: new TAG: ' + tag.tagID);   }
    rdr.tagID='0x'+tag.tagID;
    rdr.notifyRead();
});

// testing functions 
function simulateTagRead(tag)  {
    if(true==log)   { console.log('rfidReader: Simulate TAG: ' + tag.tagID);   }
    rdr.tagID="0x"+tag.tagID;
    rdr.notifyRead();
}
function simulateTagStatus(status)  {
    if (1==status) {
        if (log)   console.log("rfidReader: simulating reader ACTIVE");
        rdr.setStatus("ACTIVE");
    }
    else if (3==status) {
        if (log)   console.log("rfidReader: simulating reader ERROR");
        rdr.setStatus("ERROR");
    }
    else    {
        if (log)   console.log("rfidReader: simulating reader IDLE");
        rdr.setStatus("IDLE");
    }
}
//----- end of testing functions -----

//Connect to the RFID reader !!
function connect(hostName) {
    if (!readerClient)  {
        if (log)   console.log("rfidReader: Initializing reader ")
        readerClient = new llrp({
          ipaddress: hostName
        });
      }
    readerClient.connect();
};

//disConnect from the rfid Reader
function disConnect() {
    if (readerClient) {
        if (log)   console.log("rfidReader: Reader found disconnecting ");
        readerClient.disconnect();
        readerClient = null;
    }
};

var self = module.exports = {
    status : rdr.status,
    reader : rdr,
    connect: function(hostName) {
        return connect(hostName);
    },
    disConnect: function()  {
        return disConnect();
    },
    tagStatusSimulate: function(data) {
       return simulateTagStatus(data);
    },
    tagReadSimulate: function(data) {
       return simulateTagRead(data);
    }
}
