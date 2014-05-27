var conf=require("../conf");
var Path=require("path");
var Tools=require("./Tools");
var SessionPool=require("./SessionPool");


var application=new Object;
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
    }
    catch (e)
    {
        return false;
    }
    var reqPath=req.url.split("?")[0];
    if (Path.extname(reqPath)!=("."+siteConf.active) && Path.extname(reqPath)!=("."+siteConf.template))
    {
        return false;
    }
    function Prepare()
    {
        console.log(req.cookies);
        res.setCookie("malpower","OK");
        res.end("OK");
    }
    Tools.formatParameters(req,Prepare);
    return true;
}


module.exports=Active;
