response.headers["Content-Length"]=session.pic.chunk.length;
response.headers["Content-Type"]="image/jpeg";

response.sendHeaders();

response.sendBuffer(session.pic.chunk);

response.flush();