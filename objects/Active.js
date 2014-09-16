/* this module solve active requests.
 * it prepare data, session and parameters for pager.
 */



var conf=require("../conf");
var Path=require("path");
var Tools=require("./Tools");
var SessionPool=require("./SessionPool");
var fs=require("fs");
var Pager=require("./Pager");
var net=require("net");



function Sharer()
{
	var counter=0;
	var callbacks=new Object;
	var npl=-1;
    var cache=new Buffer(0);
    var socket=net.connect({port: conf.sharerPort},function()
    {
        socket.on("data",function(packet)
        {
            cache=Buffer.concat([cache,packet]);
            PacketReciever();
        }).on("close",function()
        {
            delete cache;
        });
    });
    socket.on("error",function(err)
    {
        console.log("SLDFJSLKDFJ");
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
        var fn=callbacks[packet.stamp];
        if (typeof(fn)!="function")
        {
            return;
        }
        fn(packet);
        delete callbacks[packet.stamp];
    }
	function getStamp()
	{
		var stamp=String(process.pid);
		stamp+=String((new Date).getTime());
		stamp+=String(counter++);
		return stamp;
	}
	this.setKey=function(keyName,value,fn)
    {
        var req={type: "operation",
                 operation: "setKey",
                 request: {keyName: keyName,
                           keyValue: value,
                           dataType: typeof(value)}};
        req.stamp=getStamp();
        if (typeof(value)=="object")
        {
            if (value instanceof Buffer)
            {
                req.request.dataType="buffer";
            }
            else if (value instanceof Array)
            {
                req.request.dataType="array";
            }
        }
        callbacks[req.stamp]=fn;
        req=JSON.stringify(req);
        var buff=new Buffer(req.length+4);
        buff.write(req,4);
        buff.writeUInt32BE(buff.length,0);
        socket.write(buff);
    };
    this.getKey=function(keyName,fn)
    {
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
    {
        return false;
    }
    var host=req.headers["Host"];
    try
    {
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
    {
        reqPath+=siteConf.defaultPage;
    }
    var ename=Path.extname(reqPath);
    if (ename==("."+siteConf.template))
    {
        res.statusCode=404;
        res.end("404 not found!");
        return true;
    }
    if (ename!=("."+siteConf.active))
    {
        return false;
    }
    res.headers["Content-Type"]=siteConf.contentTypes[ename] || "unknow/*";
    	//set content-type header of response.
    
    var reqFile=reqPath.substring(0,reqPath.lastIndexOf("."));
    function Prepare()
    {
        var sid=req.cookies["malache2SESSION"] || sessionPool.create();
        if (!sessionPool.hasSession(sid))
        {
        	sid=sessionPool.create();
        }
        var session=sessionPool.get(sid);
        if (!session)
        {
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
                             homeActives+reqFile+".js");
        });
    }
    Tools.formatParameters(req,Prepare);
    return true;
}


module.exports=Active;
