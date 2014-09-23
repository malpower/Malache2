var conf=require("../conf");


var srs=new String;
for (var i=0;i<12;i++)
{
    srs+=String(parseInt(Math.random()*Math.random()*17*13*11*23*27)).substring(0,1);
}
var sessionName="malache2SESSION";
var pool=new Object;
function SessionPool()
{
    function Create(v)
    {
        if (!!v && typeof(v)!="string")
        {
            return false;
        }
        var x=new String;
        if (typeof(v)=="string" && (pool[v]==undefined || pool[v]==null))
        {
            pool[v]={value: {}};
            pool[v].timer=setTimeout(function()
            {
                delete pool[v];
            },conf.sessionTimeout);
            return;
        }
        for (var i=0;i<12;i++)
        {
            x+=String(parseInt(Math.random()*Math.random()*17*13*11*23*27)).substring(0,1);
        }
        x=String(process.pid)+x;
        while (pool[x]!=undefined)
        {
            for (var i=0;i<12;i++)
            {
                x+=String(parseInt(Math.random()*Math.random()*17*13*11*23*27)).substring(0,1);
            }
        }
        pool[x]={value: {}};
        pool[x].timer=setTimeout(function()
        {
            delete pool[x].value;
            delete pool[x];
        },conf.sessionTimeout);
        process.send({operation: "report",item: "create_session",session: x});
        return x;
    }
    function GetSession(sid)
    {
        if (pool[sid]==undefined || pool[sid]==null)
        {
            return false;
        }
        clearTimeout(pool[sid].timer);
        pool[sid].timer=setTimeout(function()
        {
            delete pool[sid].value;
            delete pool[sid];
        },conf.sessionTimeout);
        return pool[sid].value;
    }
    this.get=GetSession;
    this.create=Create;
    this.hasSession=function(sid)
    {
    	if (pool[sid]==undefined || pool[sid]==null)
        {
            return false;
        }
        return true;
    };
}


module.exports=SessionPool;
