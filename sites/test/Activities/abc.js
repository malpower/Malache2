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
console.log("INPAGE2");
response.render({picName: fn,params: request.parameters,kk: request.parameters["kk"],random: (new Date).getTime()});


