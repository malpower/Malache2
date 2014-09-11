var Tools=require("./Tools");
var net=require("net");
var Requester=require("./Requester");
var Responser=require("./Responser");
var Processor=require("./Processor");
var conf=require("../conf");
var Request=require("./Request");



process.on("message",function(o,client)
{
	if (o.operation=="request")
	{
	    var rec=new Buffer(o.recieved);
		Request(client,rec);
	}
	client.on("error",function(e)
	{
	    console.log(e);
	});
});


process.send({operation: "report",status: "online"});