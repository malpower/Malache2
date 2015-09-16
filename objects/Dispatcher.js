"use strict";


const Tools=require("./Tools");
const net=require("net");
const Requester=require("./Requester");
const Responser=require("./Responser");
const Processor=require("./Processor");
let conf=require("../conf");
const cp=require("child_process");




function ProcessHolder()
{
	let wk=cp.fork("./objects/Shadow");
	let connections=0;
	let heart=0;
	let heard=0;
	let wait=0;
	let that=this;
	let queryMap=new Object;
	let cbCounter=0;
	let t=setInterval(function()
	{
		if (wait>conf.scriptTimeout)
		{
			console.log("script timed out.");
			console.log("process["+wk.pid+"] is now resatart!");
			holders[that.id]=new ProcessHolder();
			holders[that.id].id=that.id;
			wk.kill();
			clearInterval(t);
		}
		if (heard==heart)
		{
			wait++;
			return;
		}
		wait=0;
		heard=heart;
	},1000);
	wk.on("message",function(o)
	{
		if (o.status=="close")
		{
			connections--;
			return;
		}
		if (o.status=="alive")
		{
			heart++;
			return;
		}
		if (o.item=="session")
		{
			queryMap[o.stamp].fn(o.result);
			delete queryMap[o.stamp];
			return;
		}
		if (o.item=="create_session")
		{
			map[o.session]=that.id;
		}
	});
	this.join=function(client,content)
	{
	    wk.send({operation: "socket"},client);
		wk.send({operation: "request",recieved: content});
		connections++;
	};
	this.getConnections=function()
	{
		return connections;
	};
	this.id=0;
	this.hasSession=function(v,fn)
	{
	    var stamp=String((new Date).getTime());
	    stamp+=String(cbCounter++);
		queryMap[stamp]={fn: fn,
		                 stamp: stamp,
		                 ss: v};
		wk.send({operation: "query",item: "session",session: v,stamp: stamp});
	};
}

var holders=new Array;

var map=new Object;

var hlen=conf.handlerLength;

for (let i=0;i<hlen;i++)
{
	holders[i]=new ProcessHolder;
	holders[i].id=i;
}


function PutConnectionIntoNewLine(client,content,ss)
{
	let max=1000;
	let pos=-1;
	for (let i=0;i<holders.length;i++)
	{
		if (max>holders[i].getConnections())
		{
			max=holders[i].getConnections();
			pos=i;
		}
	}
	try
	{
		if (ss)
		{
			map[ss]=pos;
		}
		holders[pos].join(client,content);
	}
	catch (e)
	{
		console.log(e);
		client.end();
	}
}


var sockPool=new Array;


function Dispatcher()
{
	this.joinConnection=function(ss,client,content)
	{
		if (ss!=undefined && map[ss]!=undefined)
		{
			try
			{
				holders[map[ss]].hasSession(ss,function(rlt)
				{
					if (rlt)
					{
						holders[map[ss]].join(client,content);
					}
					else
					{
						PutConnectionIntoNewLine(client,content,ss);
					}
				});
			}
			catch (e)
			{
				console.log(e.stack);
			}
		}
		else
		{
			PutConnectionIntoNewLine(client,content,ss);
		}
	};
}



module.exports=Dispatcher;
