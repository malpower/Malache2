var f=new malache.Flow;


var res=new Object;
f.add(function()
{
    res.a=1;
    this.next();
}).add(function()
{
    var that=this;
    setTimeout(function()
    {
        res.b=2;
        that.next();
    },2000);
}).add(function()
{
    response.render(res);
    this.finish();
}).start();

