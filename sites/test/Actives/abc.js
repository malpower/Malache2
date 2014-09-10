
session.myPicture=request.files[0].chunk;
var x=malache.loadModule("ok.js");
response.render({jj: x,picName: request.files[0].filename,params: request.parameters,kk: request.parameters["kk"]});
