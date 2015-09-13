var Tools=require("./Tools");




function Responser(client)
{
    var states=new Object;
    states[200]="OK";
    states[302]="Found";
    states[404]="Not Found";
    states[403]="Not Allow";
    this.statusCode=200;
    this.getClient=function()
    {
        return client;
    };
    var vm=null;
    this.setVM=function(v)
    {
    	vm=v;
    };
    var sessionId;
    var header={"Connection": "close",
                "Date": (new Date).toUTCString(),
                "Server": "Malache2-201509131205D",
                "Content-Length": "0",
                "Content-Type": "text/html;charset=utf-8",
                "Cache-Control": "Private",
                "Author": "malpower"};
    var cookies=new Object;
    var responseBody=new Buffer(0);
    this.headers=header;
    var bufferSent=0;
    function ReadCookie(name,o)
    {
        var v=new String;
        v=name+"="+o.value+"; ";
        if (o.hasOwnProperty("path"))
        {
            v+="path="+o.path+"; ";
        }
        if (o.httpOnly==true)
        {
            v+="HttpOnly; ";
        }
        if (o.secure==true)
        {
            v+="secure; ";
        }
        if (typeof(o.expires)=="string")
        {
            v+="expires="+o.expires+"; ";
        }
        if (typeof(o.domain)=="string")
        {
            v+="domain="+o.domain+"; ";
        }
        if (typeof(o.maxAge)=="string")
        {
            v+="max-age="+o.maxAge+"; ";
        }
        return v;
    }
    this.redirect=function(loc)
    {
        header["Location"]=loc;
        this.statusCode=302;
        this.end();
    };
    this.error=function(err)
    {
        this.statusCode=err.statusCode || 500;
        header["Connection"]="close";
        delete header["Content-Length"];
        header["Content-Type"]="text/plain;charset=utf-8";
        this.end(err.message+"\r\n\r\n"+err.stack);
    };
    this.setCookie=function(k,v)
    {
        if (typeof(v)=="string" || typeof(v)=="number" || typeof(v)=="boolean" || v instanceof Array)
        {
            v={value: v.toString()};
        }
        cookies[String(k)]=v;
    };
    this.sendHeaders=function()
    {
        client.write("HTTP/1.1 "+this.statusCode+" "+(states[this.statusCode] || "OK")+"\r\n");
        // header["Set-Cookie"]=new Array;
        // for (var x in cookies)
        // {
            // header["Set-Cookie"].push(x+"="+cookies[x]);
        // }
        // header["Set-Cookie"]=header["Set-Cookie"].join("; ");
        delete header["Set-Cookie"];
        for (var x in header)
        {
            client.write(x+": "+header[x]+"\r\n");
        }
        if (typeof(sessionId)=="string")
        {
            client.write("Set-Cookie: malache2SESSION="+sessionId+"; path=/; HttpOnly; \r\n");
        }
        for (var x in cookies)
        {   
            if (x=="malache2SESSION")
            {
                continue;
            }
            client.write("Set-Cookie: "+ReadCookie(x,cookies[x])+"\r\n");
        }
        client.write("\r\n");  
    };
    this.setSessionId=function(sid)
    {
        sessionId=sid;
        delete this.setSessionId;
    };
    this.sendBuffer=function(chunk)
    {
        client.write(chunk);
        bufferSent+=chunk.length;
    };
    this.flush=function()
    {
        if (header["Connection"]=="close")
        {
            client.end();
        }
    };
    this.write=function(chunk)
    {
        if (!(chunk instanceof Buffer) && !(typeof(chunk)=="string"))
        {
            throw {message: "argument must be a string or a buffer!"};
        }
        if (typeof(chunk)=="string")
        {
            chunk=new Buffer(chunk);
        }
        responseBody=Buffer.concat([responseBody,chunk]);
    };
    this.end=function(chunk)
    {
        if (chunk!=undefined)
        {
            this.write(chunk);
        }
        if (header["Connection"]=="Keep-Alive")
        {
            header["Content-Length"]=String(responseBody.length);
            this.sendHeaders();
            client.write(responseBody);
        }
        else
        {
            header["Content-Length"]=String(responseBody.length);
            this.sendHeaders();
            client.write(responseBody);
            client.end();
        }
    };
}




module.exports=Responser;
