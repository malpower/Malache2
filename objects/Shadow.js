var Tools=require("./Tools");
var net=require("net");
var Requester=require("./Requester");
var Responser=require("./Responser");
var Processor=require("./Processor");
var conf=require("../conf");
var Request=require("./Request");
var EventEmitter=require('events').EventEmitter;
var SessionPool=require("./SessionPool");
var sessions=new SessionPool;



process.on("message",function(o,client)
{
	if (o.operation=="request")
	{
		client.once("error",function(e)
		{
		    //client.removeAllListeners();
		}).on("close",function()
		{
			process.send({operation: "report",status: "close"});
		});
	    var rec=new Buffer(o.recieved);
		Request(client,rec);
	}
	if (o.operation=="query")
	{
		if (o.item=="session")
		{
			var s=o.session;
			o.operation="report";
			o.result=sessions.hasSession(s);
			process.send(o);
		}
	}
	
});


process.send({operation: "report",status: "online"});
setInterval(function()
{
	process.send({operation: "report",status: "alive"});
},parseInt(conf.scriptTimeout*1000/2));
