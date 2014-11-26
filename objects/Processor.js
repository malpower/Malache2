var Tools=require("./Tools");
var conf=require("../conf");
var QueryString=require("querystring");
var fs=require("fs");
var path=require("path");
var Active=require("./Active");
var domain=require("domain");



function Processor(req,res)
{
    var url=req.url;
    try
    {
        url=decodeURI(url);
    }
    catch (e)
    {
        //just have a try.
    }
    var vd=conf.domains[req.headers.Host];		//get virtual directory.
    if (typeof(vd)!="string")
    {//check if the virtual directory is correct.
        res.statusCode=503;
        res.end("BAD DOMAIN!");
        return;
    }
    try
    {//get configurations of requested virtual directory.
        var siteConf=require("../"+vd+"/conf.js");
    }
    catch (e)
    {
        console.log("\r\n\r\n\r\n--------------------------------------\r\n");
        console.log("Can't find the site configure file in site foler\r\n");
        console.log("Please create a config file at: \r\n");
        console.log("./"+vd+"/conf.js\r\n");
        console.log("-------------------------------------------\r\n\r\n");
        return;
    }
    url=url.split("?")[0];
    if (url.indexOf("..")!=-1 || url.indexOf(":")!=-1)
    {
        res.statusCode=403;
        res.end("<h1>Error 404</h1><br />File not found!");
        return false;
    }
    if (url.substring(url.length-1,url.length)=="/")
    {//if requested url is root, append the defaultPage to url.
        url+=siteConf.defaultPage;
    }
    if (Active(req,res))
    {//for active requests.
        return false;
    }
    var filepath=vd+"/Templates"+url;
    fs.stat(filepath,function(err,stat)
    {//for static requests.
        if (err)
        {
            res.statusCode=404;
            res.write("<h1>Error 404</h1><br />File not found!");
            res.end();
            return;
        }
        var conType=req.headers["Connection"];
        if (conType==undefined)
        {
            conType="close";
        }
        conType=conType.toUpperCase();
        if (conType=="KEEP-ALIVE")
        {
            res.headers["Connection"]="Keep-Alive";
        }
        res.headers["Content-Length"]=String(stat.size);
        if (!stat.isFile())                         //response 403 if the requesting file is a folder.
        {
            res.statusCode=403;
            res.end("<h1>Error 403</h1><br />folder cannot be listed.");
            return false;
        }
        if (req.headers["If-Modified-Since"]==String(stat.mtime.toUTCString()))               //about cache.
        {
            res.statusCode=304;
            res.headers["Content-Length"]="0";
            res.headers["Last-Modified"]=stat.mtime.toUTCString();
            res.headers["Cache-Control"]="Private";
            res.sendHeaders();
            res.end();                                       //does not response data body, browser will read this file in it's cache.
            return false;
        }
        res.statusCode=200;                                         //response data normally.
        res.headers["Cache-Control"]="Private";
        res.headers["Last-Modified"]=stat.mtime.toUTCString();
        res.headers["Content-Type"]=siteConf.contentTypes[path.extname(filepath)] || "application/unknow";                   //set default content-type.
        res.headers["Content-Length"]=stat.size;
        if (req.method=="HEAD")
        {//send headers only if the request type is HEAD.
            res.headers["Content-Length"]=0;
            res.sendHeaders();
            return;
        }
        res.sendHeaders();
        var rs=fs.createReadStream(filepath,{autoClose: true});
        rs.on("data",function(chunk)
        {
            res.sendBuffer(chunk);
        }).on("end",function()
        {
            //res.flush();
        }).on("error",function()
        {
            res.headers["Connection"]="Close";
            res.flush();
        });
    });
}



module.exports=Processor;
