function MalacheTool(reqPath)
{
    this.require=require;
    this.loadModule=function(mn)
    {
        return require("../"+reqPath+"/Requires/"+mn);
    };
}



module.exports=MalacheTool;