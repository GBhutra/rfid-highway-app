//This is the logger file maintains the logging status of the whole application
var logging = true;
var consoleLog = new Object();

if (logging)
	consoleLog.gpsReader 			= true;
else
	consoleLog.gpsReader 			= false;

if (logging)
	consoleLog.inventoryManager 	= true;
else
	consoleLog.inventoryManager 	= false;

if (logging)
	consoleLog.rfidReader 			= true;
else
	consoleLog.rfidReader 			= false;

if (logging)
	consoleLog.report 				= true;
else
	consoleLog.report 				= false;

if (logging)
	consoleLog.routeReport 			= true;
else
	consoleLog.routeReport 			= false;

if (logging)
	consoleLog.routeIndex 			= true;
else
	consoleLog.routeIndex 			= false;

if (logging)
	consoleLog.routeInventory 		= true;
else
	consoleLog.routeInventory 		= false;


if (logging)
	consoleLog.controller 			= true;
else
	consoleLog.controller 			= false;

module.exports = consoleLog;