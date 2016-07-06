/**
 * @fileOverview Basic reading of RF tags. This is the main starting point.
 *
 * This file was created at Openovate Labs.
 *
 * @author Billie Dee R. Ang <billieang24@gmail.com>
 * @author Jeriel Mari E. Lopez <jerielmari@gmail.com>
 */


'use strict';

// ====================
// Includes
// ====================

var messageC = require('./LLRPMessagesConstants.js');
var parameterC = require('./LLRPParametersConstants.js');
var LLRPMessage = require('./LLRPMessages.js');
var decode = require('./decode.js');

var net = require('net');
var EventEmitter = require('events').EventEmitter;

var llrpMain = function (config) {

	// ====================
	// Variables
	// ====================

	var ipaddress = config.ipaddress || '192.168.0.30';
	var port = config.port || 5084;
	var log = config.log || false;
	var isReaderConfigSet = config.isReaderConfigSet || false;
	var isStartROSpecSent = config.isStartROSpecSent || false;

	var socket = new net.Socket();
	var self = this;
	var client = null;

	//Defined message buffers. Brute force, I know I know.
  // TODO: Change with config.
	var bSetReaderConfig = new Buffer('040300000010000000000000e2000580', 'hex');
	var bEnableEventsAndReport = new Buffer('04400000000a00000000', 'hex');
  // Impinj Specific AddRoSpec
  var bAddRoSpec = new Buffer('0414000000500000000400b1004600000001000000b2001200b300050000b60009000000000000b700180001000000b80009000000000000ba000700090100ed001201000100ee000bffc0015c0005c0', 'hex');
	var bEnableRoSpec = new Buffer('04180000000e0000000000000001', 'hex');
	var bStartRoSpec = new Buffer('04160000000e0000000000000001', 'hex');
	var bKeepaliveAck = new Buffer('04480000000a00000000', 'hex');
  var bDeleteRoSpec = new Buffer('04150000000e0000000000000001', 'hex');
  var bCloseConnection = new Buffer('040e0000000a00000000', 'hex');

	// ====================
	// Public Methods
	// ====================

	this.connect = function () {

		// timeout after 60 seconds.
		socket.setTimeout(60000, function () {
			if (log) {
				console.log('Connection timeout');
			}
			process.nextTick(function () {
				self.emit('timeout', new Error('Connection timeout'));
			});
		});

		// connect with reader
		client = socket.connect(port, ipaddress, function () {
			if (log) {
				console.log('Connected to: ' + ipaddress + ':' + port);
			}
		});

		// whenever reader sends data.
		client.on('data', function (data) {
			process.nextTick(function () {
				//check if there is data.
				if (data === undefined) {
					if (log) {
						console.log('Undefined data returned by the rfid.');
					}
				}

				//decoded message(s), passable to LLRPMessage class.
				var messagesKeyValue = decode.message(data);

				//loop through the message.
				for (var index in messagesKeyValue) {
					//possible we have more than 1 message in a reply.
					var message = new LLRPMessage(messagesKeyValue[index]);
					if (log) {
						console.log('Receiving: ' + message.getTypeName());
					}

					//Check message type and send appropriate response.
					//This send-receive is the most basic form to read a tag in llrp.
					switch (message.getType()) {
					case messageC.READER_EVENT_NOTIFICATION:
						handleReaderNotification(message);
						break;
					case messageC.SET_READER_CONFIG_RESPONSE:
						//send ADD_ROSPEC
						writeMessage(client, bAddRoSpec);
						break;
					case messageC.ADD_ROSPEC_RESPONSE:
						//send ENABLE_ROSPEC
						writeMessage(client, bEnableRoSpec);
						break;
					case messageC.ENABLE_ROSPEC_RESPONSE:
						//send START_ROSPEC
						sendStartROSpec();
						break;
					case messageC.START_ROSPEC_RESPONSE:
						writeMessage(client, bEnableEventsAndReport);
						break;
					case messageC.RO_ACCESS_REPORT:
						handleROAccessReport(message);
						break;
					case messageC.KEEPALIVE:
						//send KEEPALIVE_ACK
						writeMessage(client, bKeepaliveAck);
						break;
          case messageC.DELETE_ROSPEC_RESPONSE:
            writeMessage(client, bCloseConnection);
            break;
					default:
						//Default, doing nothing.
					}
				}
			});
		});

		//the reader or client has ended the connection.
		client.on('end', function () {
			//the session has ended
			if (log) {
				console.log('client disconnected');
			}
			process.nextTick(function () {
				self.emit('disconnect', new Error('Client disconnected.'));
			});
		});

		//cannot connect to the reader other than a timeout.
		client.on('error', function (err) {
			//error on the connection
			if (log) {
				console.log(err);
			}
			process.nextTick(function () {
				self.emit('error', err);
			});
		});
	};

  this.disconnect = function() {
    process.nextTick(function() {
      writeMessage(client, bDeleteRoSpec);
      resetIsStartROSpecSent();
    });
  };

	// ====================
	// Helper Methods
	// ====================

	function handleReaderNotification(message) {
		var parametersKeyValue = decode.parameter(message.getParameter());

		parametersKeyValue.forEach(function (decodedParameters) {
			if (decodedParameters.type === parameterC.ReaderEventNotificationData) {
				var subParameters = mapSubParameters(decodedParameters);
				if (subParameters[parameterC.ROSpecEvent] !== undefined) {
					//Event type is End of ROSpec
					if (subParameters[parameterC.ROSpecEvent].readUInt8(0) === 1) {
						//We only have 1 ROSpec so obviously it would be that.
						//So we would not care about the ROSpecID and
						//just reset flag for START_ROSPEC.
						resetIsStartROSpecSent();
					}
				}
			}
		});

		//global configuration and enabling reports has not been set.
		if (!isReaderConfigSet) { //set them.
			writeMessage(client, bSetReaderConfig); //send SET_READER_CONFIG, global reader configuration in reading tags.
			isReaderConfigSet = true; //we have set the reader configuration.
		} else {
			sendStartROSpec();
		}
	}

	function handleROAccessReport(message) {
		process.nextTick(function () {
			//reset flag for START_ROSPEC.
			resetIsStartROSpecSent();
			//show current date.

			if (log) {
				console.log('RO_ACCESS_REPORT at ' + (new Date()).toString());
			}

			//read Parameters
			//this contains the TagReportData
			var parametersKeyValue = decode.parameter(message.getParameter());
			if (parametersKeyValue) {
				parametersKeyValue.forEach(function (decodedParameters) {
					//read TagReportData Parameter only.
					if (decodedParameters.type === parameterC.TagReportData) {

						var subParameters = mapSubParameters(decodedParameters);

						var tag = {
							tagID: null,
							tagSeenCount: 0
						};

						if (typeof subParameters[parameterC.EPC96] !== 'undefined') {
							tag.tagID = subParameters[parameterC.EPC96].toString('hex');
						}

						if (typeof subParameters[parameterC.TagSeenCount] !== 'undefined') {
							tag.tagSeenCount = subParameters[parameterC.TagSeenCount].readUInt16BE(0);
						}

						if (log) {
							console.log('ID: ' + tag.tagID + '\tRead count: ' + tag.tagSeenCount);
						}

						if (tag.tagID) {
							process.nextTick(function () {
								self.emit('didSeeTag', tag);
							});
						}
					}
				});
			}
		});
	}

	/**
	 * Send message to rfid and write logs.
	 *
	 * @param  {[type]} client  rfid connection.
	 * @param  {Buffer} buffer  to write.
	 */
	function writeMessage(client, buffer) {
		process.nextTick(function () {
			if (log) {
				console.log('Sending ' + getMessageName(buffer));
			}
			client.write(buffer);
		});
	}

	/**
	 * Gets the name of the message using the encoded Buffer.
	 *
	 * @param  {Buffer} data
	 * @return {string} name of the message
	 */
	function getMessageName(data) {
		//get the message code
		//get the name from the constants.
		return messageC[getMessage(data)];
	}

	/**
	 * Gets the message type using the encoded Buffer.
	 *
	 * @param  {Buffer} data
	 * @return {int} corresponding message type code.
	 */
	function getMessage(data) {
		//message type resides on the first 2 bits of the first octet
		//and 8 bits of the second octet.
		return (data[0] & 3) << 8 | data[1];
	}

	/**
	 * Sends a START_ROSPEC message if it has not been sent.
	 *
	 * @return {Int} returns the length written or false if there was an error writing.
	 */
	function sendStartROSpec() {
		//START_ROSPEC has not been sent.
		if (!isStartROSpecSent) {
			isStartROSpecSent = true; //change state of flag.
			writeMessage(client, bStartRoSpec); //send START_ROSPEC
		}
	}

	/**
	 * Resets the isStartROSpecSent flag to false.
	 */
	function resetIsStartROSpecSent() {
		isStartROSpecSent = false;
	}

	/**
	 * Simple helper function to map key value pairs using the typeName and value.
	 * Probably should be built in with LLRPParameter class.
	 *
	 * @param  {Object} decodedParameters  object returned from decode.parameter.
	 * @return {Object}  the key value pair.
	 */
	function mapSubParameters(decodedParameters) {
		//create an object that will hold a key value pair.
		var properties = {};
		var subP = decodedParameters.subParameters;
		for (var tag in subP) {
			//where key is the Parameter type.
			//and value is the Parameter value as Buffer object.
			properties[subP[tag].type] = subP[tag].value;
		}

		return properties;
	}
};

llrpMain.prototype = new EventEmitter();

module.exports = llrpMain;
