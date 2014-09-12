var Tools=require("./Tools");
var net=require("net");
var Requester=require("./Requester");
var Responser=require("./Responser");
var Processor=require("./Processor");
var conf=require("../conf");
var cp=require("child_process");




function ProcessHolder()
{
	var wk=cp.fork("./objects/Shadow");
	var connections=0;
	wk.on("message",function(o)
	{
		if (o.status=="close")
		{
			connections--;
		}
		if (o.status=="alive")
		{
			//...
		} 
	});
	this.join=function(client,content)
	{
		wk.send({operation: "request",recieved: content},client);
		connections++;
	};
	this.getConnections=function()
	{
		return connections;
	};
	this.id=0;
}

var holders=new Array;

var map=new Object;

var hlen=conf.handlerLength;

for (var i=0;i<hlen;i++)
{
	holders[i]=new ProcessHolder;
	holders[i].id=i;
}




function Dispatcher()
{
	this.joinConnection=function(ss,client,content)
	{
		console.log(ss+".....");
		if (ss!=undefined && map[ss]!=undefined)
		{
			try
			{
				holders[map[ss]].join(client,content);
			}
			catch (e)
			{
				console.log(e);
			}
		}
		else
		{
			var max=1000;
			var pos=-1;
			for (var i=0;i<holders.length;i++)
			{
				if (max>holders[i].getConnections())
				{
					max=holders[i].getConnections();
					pos=i;
				}
			}
			try
			{
				map[ss]=pos;
				holders[pos].join(client,content);
			}
			catch (e)
			{
				console.log(e);
				client.end();
			}
		}
	};
}



module.exports=Dispatcher;