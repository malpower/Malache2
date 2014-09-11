/* this module make a socket connection into a http connection.
 * this Connection support only GET and POST method.
 * it holds 2 ways of requests, alive and close.
 */





var Tools=require("./Tools");
var net=require("net");
var Requester=require("./Requester");
var Responser=require("./Responser");
var Processor=require("./Processor");
var conf=require("../conf");
var cp=require("child_process");


function Connection(client)
{
    if (!(client instanceof net.Socket))
    {
        return false;
    }
    var postLength=0;
    var buffer=new Buffer(0);
    function CheckBuffer(chunk)
    {
        buffer=Buffer.concat([buffer,chunk]);
        if (buffer.length<4)
        {
            client.once("data",CheckBuffer);
            return;
        }
        var tmp=buffer.toString("binary");
        if (tmp.indexOf("\r\n\r\n")==-1)
        {
            client.once("data",CheckBuffer);
            return;     
        }
        var headerText=tmp.substring(0,tmp.indexOf("\r\n\r\n"));
        try
        {
            var rawReq=Tools.formatHeader(headerText);
        }
        catch (e)
        {
            client.end(Tools.set500Error("Bad header format!"));
            client.destroy();
        }
        if (typeof(rawReq.url)!="string" || typeof(rawReq.version)!="string")
        {
            client.end();
            client.destroy();
            delete buffer;
            return;
        }
        var req=new Requester(rawReq,client);
        var res=new Responser(client);
        if (req.method=="GET")
        {//sovle GET
            try
            {//send request and response to Shadow.
                var wk=cp.fork("./objects/Shadow");
                wk.on("message",function(o,hdlr)
                {
                	if (o.status=="online")
                	{
                		wk.send({operation: "request",
                				 recieved: buffer},client);
    				}
				});
            }
            catch (e)
            {
                //debug
                console.log(e.stack);
                client.end(Tools.set500Error(String(e.stack)));
                client.destroy();
            }
            /*
            try
            {
            	client.once("data",CheckBuffer);
            }
            catch (e)
            {
            	console.log("...");
            }
            */
            return false;
        }
        if (req.method!="POST")
        {
            client.end(Tools.setError(400,"ONLY POST AND GET HAVE BEEN SUPPORTED!"));
            client.destroy();
            return false;
        }
        function ReadPost(chunk)
        {
            if (buffer.length+chunk.length>conf.maxPostSize)
            {//post data out of limit.
                delete req;
                delete res;
                delete postData;
                client.end(Tools.setError(400,"POST DATA IS TOO BIG!"));
                client.destroy();
                return;
            }
            buffer=Buffer.concat([buffer,chunk]);
            if (buffer.length<postLength)
            {
                client.once("data",ReadPost);
                return;
            }
            try
            {
                var wk=cp.fork("./objects/Shadow");
                wk.on("message",function(o,hdlr)
                {
                    if (o.status=="online")
                    {
                        wk.send({operation: "request",
                                 recieved: buffer},client);
                    }
                });
            }
            catch (e)
            {
                //debug;
                console.log(e.stack);
                client.end(Tools.set500Error(String(e.stack)));
                client.destroy();
                return;
            }
        }
        postLength=Number(req.headers["Content-Length"]);
        ReadPost(new Buffer(0));//start new post reading.
    }
    client.once("data",CheckBuffer).on("error",function(e)
    {
        console.log(e.stack);
    }).on("close",function()
    {
        delete buffer;
    });
}


module.exports=Connection;
