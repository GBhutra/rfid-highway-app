//This is the logger file maintains the logging status of the whole application
var consoleLog = new Object();

consoleLog.gpsReader 			= true;
consoleLog.inventoryManager 	= true;
consoleLog.rfidReader 			= true;
consoleLog.report 				= true;

consoleLog.routeReport 			= true;
consoleLog.routeIndex 			= true;
consoleLog.routeInventory 		= true;

consoleLog.controller 			= true;

module.exports = consoleLog;