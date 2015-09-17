"use strict";



/* This simple http server is made by malpower
 * for testing web applications of mobile.
 * This porgram is based on Node.js which is
 * a platform from joyent, inc. It allows user
 * building backend service programs with JS.
 * Node.js uses Google V8 engine, it means that
 * it will be fast.
 * You can also share your files on http with
 * this simple http server.Conf.js is a configure
 * file for this simple server.Anthor named
 * malpower who is a web programmer in Chengdu.
 * This is the seconds edition of malache, you
 * can visit [https://github.com/malpower/Malache2]
 * to get the latest code.
 * Email: malpower@ymail.com
 *
 ========================================================================================================================
 *


                            #                         |-------------------------------------------------------------|
                           ###                        |                                                             |
                      ##  #####  ##                   |         #                #                                  |
                       ###########                    |        ###             #####                                |
                         # \ \ #                      |      #######            # #                                 |
                         #\ \ \#                      |  ###############                                            |
                         # \ \ #                      |    ###########                                              |
                         #\ \ \#                      |     #### ####       #                                       |
                         # \ \ #                      |     ##     ##     #####                                     |
                         #\ \ \#                      |    #         #     # #                                      |
                         # \ \ #                      |                                                             |
                         #\ \ \#                      |    #           #                                            |
           |-------|-----#--|\-#-----|------|---|     |  #####       #####                                          |
          ========================================    |   # #         # #                                           |
         ==========================================   |                                                             |
        ============================================  |                                                             |
      =============================================== |-------------------------------------------------------------|





                           *      *           *        *****      ******
                          * *    * *         * *       *    *     *
                         *   *  *   *       *   *      *     *    ******
                         *     *    *      *******     *    *     *
                         *     *    *     *       *    *****      ******


                                             *****     *    *
                                               *       * *  *
                                               *       *  * *
                                               *       *   **
                                             *****     *    *



                          ***      *    *     *****     *    *         *
                         *   *     *    *       *       * *  *        * *
                         *         ******       *       *  * *       *   *
                         *   *     *    *       *       *   **      *******
                          ***      *    *     *****     *    *     *       *











=======================================================================================================================






 */


var tls=require("tls");
var net=require("net");
var conf=require("./conf");
let http=require("http");

if (conf.https!=true)
{
    console.log("Please set [https] section in conf.js!");
    process.exit(0);
}

var cp=require("child_process");
cp.fork("./malache2");


var server=tls.createServer(conf.tls,function(socket)
{
    console.log("SDLFJSDLKFJ");
    var m=net.connect({host: "127.0.0.1",port: conf.port},function()
    {
        console.log("CONNECTED");
        socket.pipe(m);
        m.pipe(socket);
    });
    m.on("error",function()
    {
        socket.end();
    });
    socket.on("error",function()
    {
        try
        {
            m.end();
        }
        catch (e)
        {
            //
        }
    });
});
server.on("error",function(e)
{
    console.log(e);
});
server.listen(conf.httpsPort);



let redirectServer=http.createServer(function(req,res)
{
    let domain=req.headers["host"];
    if (domain.indexOf(":")!=-1)
    {
        domain=domain.split(":")[0];
    }
    if (conf.httpsPort!=443)
    {
        domain+=":"+conf.httpsPort;
    }
    let url=domain+req.url;
    res.setHeader("Location","https://"+url);
    res.statusCode=302;
    res.end();
});
redirectServer.listen(conf.redirPort);
