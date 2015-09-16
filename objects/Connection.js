"use strict";


/* this module makes a socket connections into a http connection.
 * this Connection supports only GET and POST method.
 * it holds 2 ways of requests, alive and close.
 */





const Tools=require("./Tools");
const net=require("net");
const Requester=require("./Requester");
const Responser=require("./Responser");
const Processor=require("./Processor");
const conf=require("../conf");
const cp=require("child_process");
const Dispatcher=require("./Dispatcher");
const dispatcher=new Dispatcher;


function Connection(client)
{
    if (!(client instanceof net.Socket))
    {
        return false;
    }
    let postLength=0;
    let buffer=new Buffer(0);
    function CheckBuffer(chunk)
    {
        let rawReq;
        buffer=Buffer.concat([buffer,chunk]);
        if (buffer.length<4)
        {
            client.once("data",CheckBuffer);
            return;
        }
        let tmp=buffer.toString("binary");
        if (tmp.indexOf("\r\n\r\n")==-1)
        {
            client.once("data",CheckBuffer);
            return;
        }
        let headerText=tmp.substring(0,tmp.indexOf("\r\n\r\n"));

        try
        {
            rawReq=Tools.formatHeader(headerText);
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
            buffer=null;
            return;
        }
        let req=new Requester(rawReq,client);
        if (req.method=="GET" || req.method=="HEAD")
        {//sovle GET and HEAD
            try
            {//send request and response to Shadow.
                dispatcher.joinConnection(req.cookies["malache2SESSION"],client,buffer);
            }
            catch (e)
            {
                //debug
                console.log(e.stack);
                client.end(Tools.set500Error(String(e.stack)));
                client.destroy();
            }
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
                req=null;
                res=null;
                postData=null;
                client.end(Tools.setError(502,"POST DATA IS TOO BIG!"));
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
                dispatcher.joinConnection(req.cookies["malache2SESSION"],client,buffer);
            }
            catch (e)
            {
                //debug;
                //console.log(e.stack);
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
        //console.log(e.stack);
    }).on("close",function()
    {
        buffer=null;
    });
}


module.exports=Connection;
