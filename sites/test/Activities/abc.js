try
{
    session.pic=request.files[0];
    var fn=request.files[0].filename;
}
catch (e)
{
    var fn=session.pic.filename;
}
if (request.parameters["OK"]=="die")
{
	while (1); 
}
sharer.getKey("malpower",function(res)
{
    if (res.statusCode==200)
    {
        console.log(res.response.value);
    }
});
response.render({rem: session.remember,picName: fn,params: request.parameters,kk: request.parameters["kk"],random: (new Date).getTime()});


