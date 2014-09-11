var Tools=require("./Tools");
var net=require("net");
var Requester=require("./Requester");
var Responser=require("./Responser");
var Processor=require("./Processor");
var conf=require("../conf");



function ProcessorPreperor(o,client)
{
	var rawReq=o.rawReq;
	var req=new Requester(rawReq,client);
	var res=new Responser(client);
	var postData=null;
	if (o.request.type=="POST")
	{
		postData=new Buffer(o.postData);
		req.setPost(postData);
	}
	console.log("HERE");
	Processor(req,res);
}
	


process.on("message",function(o,client)
{
	if (o.operation=="request")
	{
		ProcessorPreperor(o,client);
	}
});


process.send({operation: "report",status: "online"});