
session.myPicture=request.files[0].chunk;

response.render({picName: request.files[0].filename,application: session,kk: request.parameters["kk"]});
