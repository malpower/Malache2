var EJS=require("ejs");
var fs=require("fs");
var MalacheTool=require("./MalacheTool");
var domain=require("domain");

  


function LoadJsCode(req,res,session,application,sid,siteConf,jsCode,tpPath,home)
{
    res.headers["Connection"]="Keep-Alive";
    var jsCode="function(request,response,session,application,malache,home){"+jsCode+"}";
    try
    {
        var pager=(new Function("return "+jsCode+";"))();
    }
    catch (e)
    {
        res.statusCode=500;
        res.headers["Content-Type"]="text/plain;charset=utf-8";
        res.end(e.stack);
        return;
    }
    res.render=function(ro)
    {
        fs.readFile(tpPath,"utf8",function(err,tpText)
        {
            if (err)
            {
                res.statusCode=500;
                res.headers["Content-Type"]="text/plain;charset=utf-8";
                res.end("Template file is not found!");
                return;
            }
            try
            {
                ro.filename=req.url.split("?")[0];
                var html=EJS.render(tpText,ro);
            }
            catch (e)
            {
                res.statusCode=500;
                res.headers["Content-Type"]="text/plain;charset=utf-8";
                res.end(e.stack);
                return;
            }
            res.setCookie("malache2SESSION",sid);
            res.end(html);
        });
    };
    setImmediate(function()
    {
        var vm=domain.create();
        vm.on("error",function(err)
        {
            res.error(err);
        });
        vm.run(function()
        {
            res.setCookie("malache2SESSION",sid);
            pager(req,res,session,application,new MalacheTool(home),home+"/Templates");
        });
    });
}



module.exports={loadJsCode: LoadJsCode};
