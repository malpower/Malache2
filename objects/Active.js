/* this module solve active requests.
 * it prepare data, session and parameters for pager.
 */



var conf=require("../conf");
var Path=require("path");
var Tools=require("./Tools");
var SessionPool=require("./SessionPool");
var fs=require("fs");
var Pager=require("./Pager");


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
                             application,
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
