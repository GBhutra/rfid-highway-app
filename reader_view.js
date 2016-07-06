var log=true;
var View = new Object();
View.status = false;
View.assets =['test'];
View.assets_status= [true];
View.numClients = 0;


View.UpdateStatusTo = function(data)	{
	if(log)	{	console.log("In update reader status function data: "+data);	}
	if ('start' == data)
		this.status=true;
	else
		this.status=false;
}

View.IncrementNumClients = function()	{
	if(log)	{	console.log("In update IncrementNumClients function");	}
	this.numClients++;
}

View.DecrementNumClients = function()	{
	if(log)	{	console.log("In update DecrementNumClients function");	}
	this.numClients--;
}

View.UpdateAllViews = function(msg, data)	{
	if(log)	{	console.log("In update UpdateAllViews function message: "+msg);	}
}

module.exports = View;