"use strict";
const EJS=require("ejs");
const fs=require("fs");
const MalacheTool=require("./MalacheTool");
const domain=require("domain");



function LoadJsCode(req,res,session,sharer,sid,siteConf,jsCode,tpPath,home,active,rfn)
{
    res.headers["Connection"]="Keep-Alive";
    jsCode="function(request,response,session,sharer,malache,home){"+jsCode+"}";
    let pager;
    try
    {
        pager=(new Function("return "+jsCode+";"))();
    }
    catch (e)
    {
        res.statusCode=500;
        res.headers["Content-Type"]="text/plain;charset=utf-8";
        res.end(e.stack);
        return;
    }
    res.render=function(ro,ptp)
    {
        if (typeof(ro)!="object")
        {
            ro=new Object;
        }
        if (typeof(ptp)=="string")
        {
            tpPath=home+"/Templates/"+ptp;
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
            let html;
            try
            {
                ro.filename=home+"/Templates"+rfn;
                html=EJS.render(tpText,ro);
            }
            catch (e)
            {
                res.statusCode=500;
                res.headers["Content-Type"]="text/plain;charset=utf-8";
                res.end(e.stack);
                return;
            }
            res.setSessionId(sid);
            res.end(html);
        });
    };
    setImmediate(function()
    {
    	let vm=domain.create();
    	res.setVM(vm);
        vm.on("error",function(err)
        {
        	//res.error(err);
        	//return;
        	let epos=0;
        	let stack=err.stack.split("\n");
        	try
        	{
	        	for (let i=0;i<stack.length;i++)
	        	{
	        		if (stack[i].indexOf("eval")!=-1 && stack[i].indexOf("LoadJsCode")!=-1)
	        		{
	        			let epos=stack[i].split(",")[1];
	        			let prefix=stack[i].split(",")[0];
	        			let blocks=epos.split(":");
	        			if (prefix.indexOf("<anonymous>")!=-1)
	        			{
	        				blocks[0]="<anonymous>";
	        			}
	        			else
	        			{
	        				blocks[0]=active;
	        			}
	        			let scope=stack[i].split("(")[0];
	        			scope=scope.substring(7);
	        			if (scope=="eval ")
	        			{
	        				epos=i;
	        			}
	        			blocks[1]=String(Number(blocks[1])-1);
	        			stack[i]="    at "+scope+"("+blocks.join(":");
	        		}
	        	}
	        	try
	        	{
	        	  stack[epos]=stack[epos].replace("at eval (","at Activity (");
        	    }
        	    catch (e1)
        	    {
        	        //
        	    }
	        	err.stack=stack.join("\n");
	        }
	        catch (e)
	        {
	            console.log(e.stack);
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
            res.headers["Cache-Control"]="no-cache";
            res.getClient().removeAllListeners("error");
            res.onerror=function(){};
            res.onclose=function(){};
            res.getClient().removeAllListeners("end");
            res.getClient().on("end",function()
            {
                res.onclose();
            });
            res.getClient().on("error",function(e)
            {
                res.onerror(e);
            });
            pager(req,res,session,sharer,new MalacheTool(home),home+"/Templates");
        });
    });
}



module.exports={loadJsCode: LoadJsCode};
