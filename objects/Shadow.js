var Tools=require("./Tools");
var net=require("net");
var Requester=require("./Requester");
var Responser=require("./Responser");
var Processor=require("./Processor");
var conf=require("../conf");
var Request=require("./Request");
var EventEmitter=require('events').EventEmitter;



process.on("message",function(o,client)
{
	if (o.operation=="request")
	{
	    var rec=new Buffer(o.recieved);
		Request(client,rec);
	}
	client.once("error",function(e)
	{
	    //client.removeAllListeners();
	}).on("close",function()
	{
		process.send({operation: "report",status: "close"});
	});
});


process.send({operation: "report",status: "online"});
setInterval(function()
{
	process.send({operation: "report",status: "alive"});
},1000*5);
