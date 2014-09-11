try
{
    session.pic=request.files[0];
    var fn=request.files[0].filename;
}
catch (e)
{
    var fn=session.pic.filename;
}
console.log("INPAGE2");
response.render({picName: fn,params: request.parameters,kk: request.parameters["kk"]});


