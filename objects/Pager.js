var EJS=require("ejs");
var fs=require("fs");
var MalacheTool=require("./MalacheTool");
var domain=require("domain");
  


function LoadJsCode(req,res,session,application,sid,siteConf,jsCode,tpPath,home,active)
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
        if (!ro)
        {
            ro=new Object();
        }
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
    	res.setVM(vm);
        vm.on("error",function(err)
        {
        	//res.error(err);
        	//return;
        	var epos=0;
        	var stack=err.stack.split("\n");
        	try
        	{
	        	for (var i=0;i<stack.length;i++)
	        	{
	        		if (stack[i].indexOf("eval")!=-1 && stack[i].indexOf("LoadJsCode")!=-1)
	        		{
	        			var epos=stack[i].split(",")[1];
	        			var prefix=stack[i].split(",")[0];
	        			var blocks=epos.split(":");
	        			if (prefix.indexOf("<anonymous>")!=-1)
	        			{
	        				blocks[0]="<anonymous>";
	        			}
	        			else
	        			{
	        				blocks[0]=active;
	        			}
	        			var scope=stack[i].split("(")[0];
	        			scope=scope.substring(7);
	        			if (scope=="eval ")
	        			{
	        				epos=i;
	        			}
	        			blocks[1]=String(Number(blocks[1])-1);
	        			stack[i]="    at "+scope+"("+blocks.join(":");
	        		}
	        	}
	        	stack[epos]=stack[epos].replace("at eval (","at Activity (");
	        	err.stack=stack.join("\n");
	        }
	        catch (e)
	        {
	            cosnole.log(e.stack);
	        	//forget it, if there's problem on processing error log.
	        }
            res.error(err);
            setTimeout(function()
            {
            	vm.dispose();
            },0);
        });
        vm.run(function()
        {
            res.setCookie("malache2SESSION",sid);
            pager(req,res,session,application,new MalacheTool(home),home+"/Templates");
        });
    });
}



module.exports={loadJsCode: LoadJsCode};
