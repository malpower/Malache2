var Tools=require("./Tools");
var conf=require("../conf");
var QueryString=require("querystring");
var fs=require("fs");
var path=require("path");
var Active=require("./Active");



function Processor(req,res)
{
    console.log(req.url);
    var url=req.url;
    var vd=conf.domains[req.headers.Host];
    if (typeof(vd)!="string")
    {
        res.statusCode=500;
        res.end("BAD DOMAIN!");
        return;
    }
    try
    {
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
    var qstring=url.split("?")[1];
    url=url.split("?")[0];
    if (url.substring(url.length-1,url.length)=="/")
    {
        url+=siteConf.defaultPage;
    }
    if (qstring!=undefined)
    {
        qstring=QueryString.parse(qstring);
    }
    else
    {
        qstring={};
    }
    if (Active(req,res))
    {
        return false;
    }
    var filepath=vd+"/Templates"+url;
    fs.stat(filepath,function(err,stat)
    {
        if (err)
        {
            res.statusCode=404;
            res.write("File not found!");
            res.end();
            return;
        }
        res.headers["Content-Length"]=String(stat.size);
        if (!stat.isFile())                         //response 403 if the requesting file is a folder.
        {
            res.statusCode=403;
            res.end("<h1>Error 403</h1><br />folder cannot be listed.");
            return false;
        }
        if (req.headers["If-Modified-Since"]==stat.mtime)               //about cache.
        {
            res.statusCode=304;
            res.headers["Content-Length"]="0";
            res.headers["Last-Modified"]=stat.mtime;
            res.headers["Cache-Control"]="Private";
            res.sendHeader();
            res.flush();                                       //does not response data body, browser will read this file in it's cache.
            return false;
        }
        res.statusCode=200;                                         //response data normally.
        res.headers["Cache-Control"]="Private";
        res.headers["Last-Modified"]=stat.mtime;
        res.headers["Content-Type"]=siteConf.contentTypes[path.extname(filepath)] || "unknow/*";                   //set default content-type.
        res.headers["Content-Length"]=stat.size;
        res.sendHeader();
        var rs=fs.createReadStream(filepath,{autoClose: true});
        rs.on("data",function(chunk)
        {
            res.sendBuffer(chunk);
        }).on("end",function()
        {
            res.flush();
        }).on("error",function()
        {
            res.headers["Connection"]="Close";
            res.flush();
        });
    });
}



module.exports=Processor;
