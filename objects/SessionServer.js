var Tools=require("./Tools");
var conf=require("../conf");


var sPool=new Object;


function SessionServer()
{
    this.getSession=function(sid)
    {
        if (sPool[sid]==undefined)
        {
            sPool[sid]={data: {},
                        lock: false,
                        timer: setTimeout(function()
                        {
                            delete sPool[sid];
                        },conf.sessionTimeout)};
        }
        sPool[sid].
        




//it is too late....im tired.....
