var QueryString=require("querystring");
var conf=require("../conf");

var Tools=new Object;

Tools.formatHeader=function(headerText)
{
    var header=new Object;
    var x=headerText.split("\r\n");
    var urlLine=x.shift();
    var method=urlLine.split(" ")[0];
    var url=urlLine.split(" ")[1];
    var version=urlLine.split(" ")[2];
    for (var i=0;i<x.length;i++)
    {
        var tmp=x[i].split(": ");
        if (tmp==null || tmp.length==0)
        {
            continue;
        }
        header[tmp[0]]=tmp[1];
    }
    return {headers: header,
            url: url,
            version: version,
            method: method};
};




Tools.set500Error=function(reason)
{
    var text="HTTP/1.1 500 ERROR\r\n";
    text+="Date: "+(new Date)+"\r\n";
    text+="Server: Malache2\r\n";
    text+="Content-Type: text/plain;charset=utf-8\r\n";
    text+="Content-Length: "+reason.length+"\r\n";
    text+="\r\n";
    text+=reason;
    return text;
};


Tools.setError=function(code,reason)
{
    var text="HTTP/1.1 "+code+" ERROR\r\n";
    text+="Date: "+(new Date)+"\r\n";
    text+="Server: Malache2\r\n";
    text+="Content-Type: text/plain;charset=utf-8\r\n";
    text+="Content-Length: "+reason.length+"\r\n";
    text+="\r\n";
    text+=reason;
    return text;
};


function OrganizationFile(req,fn)
{
    var ns=new Date;
    function Org(buffs,ns,fn)
    {
        function PRO(blk)
        {
            var ns=new Date;
            var ick=blk;
            var blk_b=blk.toString("binary");
            var blk_u=blk.toString(conf.cutType);                           //this statement occupies much time when conf.cutType equals "utf8"
            var header=blk_u.substring(0,blk_u.indexOf("\r\n\r\n"));
            var sp=blk_b.indexOf("\r\n\r\n")+4;
            var chunk=ick.slice(sp,ick.length);
            var filename,name;
            if (header.indexOf("filename")!=-1)
            {
                filename=header.split("filename=\"")[1].split("\"")[0];
                name=header.split("name=\"")[1].split("\"")[0];
                req.files.push({filename: filename,
                                name: name,
                                chunk: chunk});
                return true;
            }
            name=header.split("name=\"")[1].split("\"")[0];
            if (req.parameters[name]!=undefined)
            {
                req.parameters[name]=new Array(req.parameters[name]);
            }
            if (req.parameters[name] instanceof Array)
            {
                req.parameters[name].push(chunk.toString("utf8"));
                return false;
            }
            req.parameters[name]=chunk.toString("utf8");
            return false;
        }
        for (var i=0;i<buffs.length;i++)
        {
            PRO(buffs[i]);
        }
        var tf=new Array;
        for (var i=0;i<req.files.length;i++)
        {
            if (req.files[i].filename!="")
            {
                tf.push(req.files[i]);
            }
        }
        req.files=tf;
        req.POST=req.parameters;
        req.parameters=new Object;
        delete req.chunk;
        fn();
    }
    try
    {
        req.chunk=req.getPostBuffer();
        req.files=new Array;
        var boundary=req.headers["Content-Type"].split("boundary=")[1];
        req.chunk=req.chunk.slice(0,req.chunk.length-4);
        req.chunk=req.chunk.slice(boundary.length+4,req.chunk.length);
        var tmp=req.chunk.toString("binary");
        var pos=new Array;
        var xpos=0;
        var tmpReg=new RegExp("--"+boundary,"g");
        while (tmpReg.exec(tmp)!=null)
        {
            pos.push(tmpReg.lastIndex-boundary.length-2);
        }                              
        var cp=0;
        var buff=new Array;
        for (var i=0;i<pos.length;i++)
        {
            buff.push(req.chunk.slice(cp,pos[i]-2));
            cp=pos[i]+boundary.length+4;
        }   
        Org(buff,ns,fn);
    }
    catch (e)
    {
        console.log("ORG FILE: "+e.stack);
    }
}



Tools.formatParameters=function(req,fn)
{
    req.parameters=new Object;
    req.POST=new Object;
    req.GET=new Object;
    function _End()
    {
        for (var x in req.GET)
        {
            req.parameters[x]=req.GET[x];
        }
        for (var x in req.POST)
        {
            req.parameters[x]=req.POST[x];
        }
        setImmediate(fn);
    }
    var qs=req.url.split("?")[1];
    if (typeof(qs)=="string")
    {
        req.GET=QueryString.parse(qs);
    }
    if (req.method!="POST")
    {
        _End();
        return;
    }
    var ctype=req.headers["Content-Type"];
    if (!ctype || ctype.indexOf("multipart/form-data")==-1)
    {
        req.POST=QueryString.parse(req.getPostBuffer().toString("utf8"));
    }
    else
    {
        OrganizationFile(req,_End);
        return;
    }
    _End();
};



    
    
module.exports=Tools;
    
