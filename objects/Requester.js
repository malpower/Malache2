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
        this.setPost=null;
        return true;
    };
    this.getPostBuffer=function()
    {
        return postChunk;
    };
}

module.exports=Requester;
    
