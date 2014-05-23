var Tools=require("./Tools");
var net=require("net");
var Requester=require("./Requester");
var Responser=require("./Responser");
var Processor=require("./Processor");
var conf=require("../conf");


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
        var tmp=buffer.toString("ascii");
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
        buffer=buffer.slice(tmp.indexOf("\r\n\r\n")+4);
        var req=new Requester(rawReq,client);
        var res=new Responser(client);
        if (req.method=="GET")
        {
            try
            {
                Processor(req,res);
            }
            catch (e)
            {
                //debug
                console.log(e.stack);
                client.end(Tools.set500Error(String(e.stack)));
                client.destroy();
            }
            client.once("data",CheckBuffer);
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
            {
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
                clinet.once(ReadPost);
                return;
            }
            var postData=buffer.slice(0,postLength);
            buffer=buffer.slice(postLength);
            try
            {
                req.setPost(postData);
                Processor(req,res);
            }
            catch (e)
            {
                //debug;
                console.log(e.stack);
                client.end(Tools.set500Error(String(e.stack)));
                client.destroy();
                return;
            }
            CheckBuffer(new Buffer(0));
        }
        postLength=Number(req.headers["Content-Length"]);
        ReadPost(new Buffer(0));
    }
    client.once("data",CheckBuffer).on("error",function(e)
    {
        console.log("remote connection error!");
        console.log(e.stack);
    }).on("close",function()
    {
        console.log("CONNECTION LOST!");
        delete buffer;
    });
}


module.exports=Connection;
