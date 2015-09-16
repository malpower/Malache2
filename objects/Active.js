"use strict";

/* this module solves active requests.
 * it prepares data, session and parameters for pager.
 */



const conf=require("../conf");
const Path=require("path");
const Tools=require("./Tools");
const SessionPool=require("./SessionPool");
const fs=require("fs");
const Pager=require("./Pager");
const net=require("net");



function Sharer()
{//This is a class that can communicate with Sharer.js.
	let counter=0;
	let callbacks=new Object;      //callback map.
	let npl=-1;
	let cache=new Buffer(0);
	let socket=net.connect({host: "127.0.0.1",port: conf.sharerPort},function()
    {//connect to share when starting.
        socket.on("data",function(packet)
        {
            cache=Buffer.concat([cache,packet]);            //buffer filling.
            PacketReciever();                   //buffer checking.
        }).on("close",function()
        {
            cache=null;
        });
    });
    socket.on("error",function(err)
    {
        console.log(err);
        console.log("Connection error[Share]");
    });
    function PacketReciever()
    {//Buffer checker, if there is a packet in buffer, pick it out, and solve it.
        if (cache.length>=4)
        {
            npl=cache.readUInt32BE(0);
            if (cache.length>=npl)
            {
                let tmp=cache.slice(0,npl);
                cache=cache.slice(npl);
                PacketProcessor(tmp);               //solve the packet.
            }
        }
    }
    function PacketProcessor(pack)
    {
        let packet=pack.slice(4).toString("utf8");
        packet=JSON.parse(packet);
        let fn=callbacks[packet.stamp];                 //pick out the callback of the packet with 'stamp' column in the packet.
        if (typeof(fn)!="function")
        {
            return;
        }
        fn(packet);         //pass packet to callback.
        delete callbacks[packet.stamp];         //clear up.
    }
	function getStamp()
	{//this function returns a stamp simply. The stamp must be unque.
		let stamp=String(process.pid);
		stamp+=String((new Date).getTime());
		stamp+=String(counter++);
		return stamp;
	}
	this.setKey=function(keyName,value,fn)
    {//set a key/value to share.
        let req={type: "operation",         //request packet.
                 operation: "setKey",
                 request: {keyName: keyName,
                           keyValue: value,
                           dataType: typeof(value)}};
        req.stamp=getStamp();           //load stamp.
        if (typeof(value)=="object")
        {//check if the value is a buffer. if it is, set dataType 'buffer', it will make share know that the value of the packet is a buffer.
            if (value instanceof Buffer)
            {
                req.request.dataType="buffer";
            }
            else if (value instanceof Array)
            {
                req.request.dataType="array";
            }
        }
        callbacks[req.stamp]=fn;                //bind callback.
        req=JSON.stringify(req);
        let buff=new Buffer(req.length+4);
        buff.write(req,4);
        buff.writeUInt32BE(buff.length,0);
        socket.write(buff);
    };
    this.getKey=function(keyName,fn)
    {//get a key/value from share.
        let req={type: "operation",
                 operation: "getKey",
                 request: {keyName: keyName}};
        req.stamp=getStamp();
        callbacks[req.stamp]=fn;
        req=JSON.stringify(req);
        let buff=new Buffer(req.length+4);
        buff.write(req,4);
        buff.writeUInt32BE(buff.length,0);
        socket.write(buff);
    };
}
var sharer=new Sharer;
var sessionPool=new SessionPool;




function Active(req,res)
{
    if (typeof(req.headers["Host"])!="string")
    {//if the Host header is not set, return.
        return false;
    }
    let host=req.headers["Host"];
	let siteConf;
    try
    {//get the environment of the domain.
        siteConf=require("../"+conf.domains[host]+"/conf");
    }
    catch (e)
    {
        return false;
    }
	const home="./"+conf.domains[host];
	const homeTemplates=home+"/Templates";
	const homeActives=home+"/Activities";
	const homeRequires=home+"/Plugs";
    let reqPath=req.url.split("?")[0];
    if (reqPath.substring(reqPath.length-1,reqPath.length)=="/")
    {//check if the request url is root.
        reqPath+=siteConf.defaultPage;      //append default page to request url.
    }
    let ename=Path.extname(reqPath);    //get extension name.
    if (ename==("."+siteConf.template))
    {//if the extension name is template type, return 404.
        res.statusCode=404;
        res.end("404 not found!");
        return true;
    }
    if (ename!=("."+siteConf.active))
    {//if the extionsion name is not for activity, return false and let static part solve with this.
        return false;
    }
    res.headers["Content-Type"]=siteConf.contentTypes[ename] || "application/unknow";
    	//set content-type header of response.

    let reqFile=reqPath.substring(0,reqPath.lastIndexOf("."));
    function Prepare()
    {//invoking preparer.
        let sid=req.cookies["malache2SESSION"] || sessionPool.create();
        if (!sessionPool.hasSession(sid))
        {//if the session is not existing, create it.
        	sid=sessionPool.create();
        }
        let session=sessionPool.get(sid);
        if (!session)
        {//if the session is not available, recreate it.
            sessionPool.create(sid);
            session=sessionPool.get(sid);
        }
        fs.readFile(homeActives+reqFile+".js","utf8",function(err,jsCode)
        {//read js code from active folder.
            if (err)
            {//not found.
                console.log(err);
                res.statusCode=404;
                res.end("404 not found!");
                return;
            }
            Pager.loadJsCode(req,					//this is the start of execution.
                             res,
                             session,
                             sharer,
                             sid,
                             siteConf,
                             jsCode,
                             homeTemplates+reqFile+"."+siteConf.template,
                             home,
                             homeActives+reqFile+".js",
                             reqPath);
        });
    }
    Tools.formatParameters(req,Prepare);            //call the preparer after formatting parameters.
    return true;
}


module.exports=Active;
