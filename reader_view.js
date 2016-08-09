var log=true;
var View = new Object();
View.status = 0;
View.assets =[];
View.assets_status= [];
View.numClients = 0;
View.controls=false;
View.loc=null;


View.UpdateStatusTo = function(data)	{
	if(log)	{	console.log("In update reader status function data: "+data);	}
	if ('start' == data)
		this.status=1;
	else if ('stop' == data)
		this.status=0;
	else
		this.status=-1;
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