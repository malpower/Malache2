function MFlow()
{
    var clist=new Array;
    this.add=function(fn)
    {
        if (typeof(fn)!="function")
        {
            return null;
        }
        clist.push(fn);
        return this;
    };
    this.next=function()
    {
        var that=this;
        if (clist.length<=0)
        {
            return null;
        }
        var fn=clist.shift();
        setImmediate(function()
        {
            fn.call(that);
        });
        return this;
    };
    this.start=this.next;
    this.finish=function()
    {
        delete clist;
    };
}





function MalacheTool(reqPath)
{
    this.require=require;
    this.loadPlug=function(mn)
    {
        return require("../"+reqPath+"/Plugs/"+mn);
    };
    this.Flow=MFlow;
}



module.exports=MalacheTool;