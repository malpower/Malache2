function MalacheTool(reqPath)
{
    this.require=require;
    this.loadPlug=function(mn)
    {
        return require("../"+reqPath+"/Plugs/"+mn);
    };
}



module.exports=MalacheTool;