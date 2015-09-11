var conf=require("../conf");
var net=require("net");


var pool=new Object;



var fnList=new Object;


fnList["getKey"]=function(packet,client)
{
	var res=new Object;
	try
	{
		if (typeof(pool[packet.request.keyName])=="object")
		{
			res.response=pool[packet.request.keyName];
			res.stamp=packet.stamp;
			res.statusCode=200;
			res=JSON.stringify(res);
			var buff=new Buffer(res.length+4);
			buff.write(res,4);
			buff.writeUInt32BE(res.length+4,0);
			client.write(buff);
		}
		else
		{
			throw {};
		}
	}
	catch (e)
	{
		res.statusCode=500;
		res.stamp=packet.stap;
		res=JSON.stringify(res);
		var buff=new Buffer(res.length+4);
		buff.write(res,4);
		buff.writeUInt32BE(buff.length,0);
		client.write(buff);
	}
};


fnList["setKey"]=function(packet,client)
{
	var res=new Object;
	try
	{
		pool[packet.request.keyName]=new Object;
		if (packet.request.dataType!="buffer")
		{
			pool[packet.request.keyName].value=packet.request.keyValue;
			pool[packet.request.keyName].name=packet.request.keyName;
			pool[packet.request.keyName].dataType=packet.request.dataType;
		}
		else
		{
			pool[packet.request.keyName].value=new Buffer(packet.request.keyValue);
			pool[packet.request.keyName].name=packet.request.keyName;
			pool[packet.request.keyName].dataType=packet.request.dataType;
		}
		res.statusCode=200;
		res.stamp=packet.stamp;
		res=JSON.stringify(res);
		var buff=new Buffer(res.length+4);
		buff.write(res,4);
		buff.writeUInt32BE(buff.length,0);
		client.write(buff);
	}
	catch (e)
	{
		res.statusCode=500;
		res.stamp=packet.stamp;
		res=JSON.stringify(res);
		var buff=new Buffer(res.length+4);
		buff.write(res,4);
		buff.writeUInt32BE(buff.length,0);
		client.write(buff);
	}
};
		


function Correspondent(socket)
{
	var npl=-1;
	var cache=new Buffer(0);
	socket.on("data",function(packet)
	{
		cache=Buffer.concat([cache,packet]);
		PacketReciever();
	}).on("error",function(err)
	{
		try
		{
		    console.log("SHARER:");
		    console.log(err);
			socket.destroy();
		}
		catch (e)
		{
			//
		}
	}).on("close",function()
	{
		delete cache;
	});
	function PacketReciever()
	{
		if (cache.length>=4)
		{
			npl=cache.readUInt32BE(0);
			if (cache.length>=npl)
			{
				var tmp=cache.slice(0,npl);
				cache=cache.slice(npl);
				PacketProcessor(tmp);
			}
		}
	}
	function PacketProcessor(pack)
	{
		var packet=pack.slice(4).toString("utf8");
		packet=JSON.parse(packet);
		if (packet.type=="operation")
		{
			var fn=fnList[packet.operation];
			if (fn==undefined)
			{
				socket.destroy();
				delete cache;
			}
			fn(packet,socket);
		}
	}
	this.start=function()
	{
		var d=new Object;
		d.type="report";
		d.status="ready";
		var buff=new Buffer((JSON.stringify(d)).length+4);
		buff.writeUInt32BE(buff.length,0);
		buff.write((JSON.stringify(d)),4);
		socket.write(buff);
	};
}


var server=net.createServer(function(socket)
{
	if (socket.remoteAddress!="127.0.0.1" && socket.remoteAddress!="::ffff:127.0.0.1")
	{
		socket.destroy();
		return;
	}
	var c=new Correspondent(socket);
	c.start();
});
server.on("error",function(err)
{
	console.log(err);
});

server.listen(conf.sharerPort);

server.on("listening",function()
{
    process.send({status: "online"});
});
	