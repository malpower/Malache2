/* this module solves active requests.
 * it prepares data, session and parameters for pager.
 */



var conf=require("../conf");
var Path=require("path");
var Tools=require("./Tools");
var SessionPool=require("./SessionPool");
var fs=require("fs");
var Pager=require("./Pager");
var net=require("net");



function Sharer()
{//This is a class that can communicate with Sharer.js.
	var counter=0;
	var callbacks=new Object;      //callback map.
	var npl=-1;
    var cache=new Buffer(0);
    var socket=net.connect({host: "127.0.0.1",port: conf.sharerPort},function()
    {//connect to share when starting.
        socket.on("data",function(packet)
        {
            cache=Buffer.concat([cache,packet]);            //buffer filling.
            PacketReciever();                   //buffer checking.
        }).on("close",function()
        {
            delete cache;
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
                var tmp=cache.slice(0,npl);
                cache=cache.slice(npl);
                PacketProcessor(tmp);               //solve the packet.
            }
        }
    }
    function PacketProcessor(pack)
    {
        var packet=pack.slice(4).toString("utf8");
        packet=JSON.parse(packet);
        var fn=callbacks[packet.stamp];                 //pick out the callback of the packet with 'stamp' column in the packet.
        if (typeof(fn)!="function")
        {
            return;
        }
        fn(packet);         //pass packet to callback.
        delete callbacks[packet.stamp];         //clear up.
    }
	function getStamp()
	{//this function returns a stamp simply. The stamp must be unque.
		var stamp=String(process.pid);
		stamp+=String((new Date).getTime());
		stamp+=String(counter++);
		return stamp;
	}
	this.setKey=function(keyName,value,fn)
    {//set a key/value to share.
        var req={type: "operation",         //request packet.
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
        var buff=new Buffer(req.length+4);
        buff.write(req,4);
        buff.writeUInt32BE(buff.length,0);
        socket.write(buff);
    };
    this.getKey=function(keyName,fn)
    {//get a key/value from share.
        var req={type: "operation",
                 operation: "getKey",
                 request: {keyName: keyName}};
        req.stamp=getStamp();
        callbacks[req.stamp]=fn;
        req=JSON.stringify(req);
        var buff=new Buffer(req.length+4);
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
    var host=req.headers["Host"];
    try
    {//get the environment of the domain.
        var siteConf=require("../"+conf.domains[host]+"/conf");
        var home="./"+conf.domains[host];
        var homeTemplates=home+"/Templates";
        var homeActives=home+"/Activities";
        var homeRequires=home+"/Plugs";
    }
    catch (e)
    {
        return false;
    }
    var reqPath=req.url.split("?")[0];
    if (reqPath.substring(reqPath.length-1,reqPath.length)=="/")
    {//check if the request url is root.
        reqPath+=siteConf.defaultPage;      //append default page to request url.
    }
    var ename=Path.extname(reqPath);    //get extension name.
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
    
    var reqFile=reqPath.substring(0,reqPath.lastIndexOf("."));
    function Prepare()
    {//invoking preparer.
        var sid=req.cookies["malache2SESSION"] || sessionPool.create();
        if (!sessionPool.hasSession(sid))
        {//if the session is not existing, create it.
        	sid=sessionPool.create();
        }
        var session=sessionPool.get(sid);
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
