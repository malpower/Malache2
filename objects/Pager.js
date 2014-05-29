var EJS=require("ejs");
var fs=require("fs");


function LoadJsCode(req,res,session,application,sid,siteConf,jsCode,tpPath)
{
    res.headers["Connection"]="Keep-Alive";
    var jsCode="function(request,response,session,application){"+jsCode+"}";
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
        try
        {
            res.setCookie("malache2SESSION",sid);
            pager(req,res,session,application);
        }
        catch (e)
        {
            res.statusCode=500;
            res.headers["Content-Type"]="text/plain;charset=utf-8";
            res.end(e.stack);
            return;
        }
    });
}



module.exports={loadJsCode: LoadJsCode};
