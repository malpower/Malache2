var Tools=require("./Tools");
var net=require("net");
var Requester=require("./Requester");
var Responser=require("./Responser");
var Processor=require("./Processor");
var conf=require("../conf");
var Request=require("./Request");

var holder;


process.on("message",function(o,client)
{
	if (o.operation=="request")
	{
	    holder=client;
	    var rec=new Buffer(o.recieved);
		Request(client,rec);
	}
	client.on("error",function(e)
	{
	    console.log(e);
	});
});


process.send({operation: "report",status: "online"});