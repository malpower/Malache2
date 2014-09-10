response.headers["Content-Length"]=session.myPicture.length;
response.headers["Content-Type"]="image/*";
response.sendHeaders();
response.sendBuffer(session.myPicture);
response.flush();

