var Tools=require("./Tools");




function Responser(client)
{
    var states=new Object;
    states[200]="OK";
    states[302]="Found";
    states[404]="Not Found";
    states[403]="Not Allow";
    this.statusCode=200;
    var header={"Connection": "close",
                "Date": (new Date),
                "Server": "Malache2",
                "Content-Length": "0",
                "Content-Type": "text/html;charset=utf-8",
                "Cache-Control": "private",
                "Author": "malpower"};
    var cookies=new Object;
    var responseBody=new Buffer(0);
    this.headers=header;
    var bufferSent=0;
    this.setCookie=function(k,v)
    {
        cookies[String(k)]=String(v);
    };
    this.sendHeaders=function()
    {
        client.write("HTTP/1.1 "+this.statusCode+" "+(states[this.statusCode] || "OK")+"\r\n");
        header["Set-Cookie"]=new Array;
        for (var x in cookies)
        {
            header["Set-Cookie"].push(x+"="+cookies[x]);
        }
        header["Set-Cookie"]=header["Set-Cookie"].join("; ");
        for (var x in header)
        {
            client.write(x+": "+header[x]+"\r\n");
        }
        client.write("\r\n");   
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
            this.sendHeader();
            client.write(responseBody);
        }
        else
        {
            header["Content-Length"]=String(responseBody.length);
            client.write("HTTP/1.1 "+this.statusCode+" "+(states[this.statusCode] || "OK")+"\r\n");
            this.sendHeader();
            client.write(responseBody);
            client.end();
        }
    };
}




module.exports=Responser;
