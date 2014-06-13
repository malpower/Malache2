/*This simple http server is made by malpower
 * for testing web applications for mobile.
 * This porgram is based on Node.js which is
 * a platform from joyent, inc. It allows user
 * building backend service programs with JS.
 * Node.js uses Google V8 engine, it means that
 * it will be fast.
 * You can also share your files on http with
 * this simple http server.Conf.js is a configure
 * file for this simple server.Anthor named 
 * malpower who is a web programmer in Chengdu.
 * Email: malpower@ymail.com
 */


var net=require("net");
var Connection=require("./objects/Connection");
var conf=require("./conf");
conf.cwd=process.cwd()+"/";




var server=net.createServer(function(socket)
{
    new Connection(socket);
});

server.listen(8080);
