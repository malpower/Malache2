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
var tsmap=new Object;


process.on("message",function(o,sock)
{
    
    if (o.operation=="socket")
    {
        tsmap[o.id]=sock;
        sock.resume();
    }
	if (o.operation=="request")
	{
	    var client=tsmap[o.id];
	    if (client==null || client==undefined)
	    {
	        console.log("INVALID CLIENT SOCKET");
	        return;
	    }
		client.once("error",function(e)
		{
		    //client.removeAllListeners();
		}).on("close",function()
		{
			process.send({operation: "report",status: "close"});
		});
	    var rec=new Buffer(o.recieved);
	    console.log("---------======--------");
	    console.log(rec.toString().split("\r\n")[0]);
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



process.on("uncaughtException",function(e)
{
    console.log("["+process.pid+"]:ERROR");
    console.log(e);
});
