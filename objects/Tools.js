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
}




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
}


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
}
    
    
module.exports=Tools;
    
