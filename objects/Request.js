"use strict";


/* this module make a socket connection into a http connection.
 * this Connection support only GET and POST method.
 * it holds 2 ways of requests, alive and close.
 */





const Tools=require("./Tools");
const net=require("net");
const Requester=require("./Requester");
const Responser=require("./Responser");
const Processor=require("./Processor");
let conf=require("../conf");
const cp=require("child_process");


function Request(client,recieved)
{
    if (!(client instanceof net.Socket))
    {
        return false;
    }
    let postLength=0;
    let buffer=new Buffer(0);
    function CheckBuffer(chunk)
    {
        buffer=Buffer.concat([buffer,chunk]);
        if (buffer.length<4)
        {
            client.once("data",CheckBuffer);
            return;
        }
        let tmp=buffer.toString("utf8");
        if (tmp.indexOf("\r\n\r\n")==-1)
        {
            client.once("data",CheckBuffer);
            return;
        }
        let headerText=tmp.substring(0,tmp.indexOf("\r\n\r\n"));
        let rawReq;
        try
        {
            rawReq=Tools.formatHeader(headerText);
        }
        catch (e)
        {
            client.end(Tools.set500Error("Bad header format!"));
        }
        if (typeof(rawReq.url)!="string" || typeof(rawReq.version)!="string")
        {
            client.end();
            buffer=null;
            return;
        }
        
        buffer=buffer.slice(tmp.indexOf("\r\n\r\n")+4);
        let req=new Requester(rawReq,client);
        let res=new Responser(client);
        if (req.method=="GET" || req.method=="HEAD")
        {//sovle GET and HEAD
            try
            {//send request and response to Processor.
                Processor(req,res);
                
            }
            catch (e)
            {
                //debug
                console.log(e.stack);
                client.end(Tools.set500Error(String(e.stack)));
            }
            try
            {
            	client.removeAllListeners("data");
            	client.once("data",CheckBuffer);
            }
            catch (e)
            {
            	console.log(e);
            }
            return false;
        }
        if (req.method!="POST")
        {
            client.end(Tools.setError(400,"ONLY POST AND GET HAVE BEEN SUPPORTED!"));
            return false;
        }
        function ReadPost(chunk)
        {
            if (buffer.length+chunk.length>conf.maxPostSize)
            {//post data out of limit.
                req=null;
                res=null;
                postData=null;
                client.end(Tools.setError(502,"POST DATA IS TOO BIG!"));
                return;
            }
            buffer=Buffer.concat([buffer,chunk]);
            if (buffer.length<postLength)
            {
                client.once("data",ReadPost);
                return;
            }
            let postData;
            postData=buffer.slice(0,postLength);
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
            CheckBuffer(new Buffer(0));//requesting finish.
        }
        postLength=Number(req.headers["Content-Length"]);
        ReadPost(new Buffer(0));//start new post reading.
    }
    CheckBuffer(recieved);
    client.on("error",function(e)
    {
        //console.log(e.stack);
    }).on("close",function()
    {
        buffer=null;
    });
}


module.exports=Request;
