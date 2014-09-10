var QueryString=require("querystring");



function Requester(raw,client)
{
    this.method=raw.method || "UNKNOE";
    this.url=raw.url || "/";
    this.headers=raw.headers || {};
    this.version=raw.version || "HTTP/1.0";
    this.remoteAddress=client.remoteAddress;
    this.remotePort=client.remotePort;
	var postChunk=new Buffer(0);
	this.setPost=function(chunk)
	{
	    if (raw.method!="POST")
	    {
	        return false;
        }
        postChunk=chunk;
        delete this.setPost;
        return true;
    };
    this.getPostBuffer=function()
    {
        return postChunk;
    };
    this.cookies=new Object;
    if (raw.headers["Cookie"])
    {
        var cookies=raw.headers["Cookie"];
        cookies=cookies.replace(/;\s/g,"&");
        cookies=QueryString.parse(cookies);
        this.cookies=cookies;
    }
}

module.exports=Requester;
    
