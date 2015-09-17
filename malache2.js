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

const cp=require("child_process");

const sharer=cp.fork("./objects/Sharer");

const net=require("net");

sharer.on("message",function(msg)
{

    let Connection=require("./objects/Connection");
    let conf=require("./conf");
    conf.cwd=process.cwd()+"/";
    if (msg.status=="online")
    {
        console.log("Sharer started!");
        let server=net.createServer(function(socket)
        {//main server, collect socket connections simply and create a Connection with sockets collected.
            new Connection(socket);
        });

        if (conf.https)
        {
            server.listen(conf.port,"127.0.0.1");
        }
        else
        {
            server.listen(conf.port);
        }

        server.on("error",function(err)
        {//catch errors when listening failed.
        	console.log("server starting failed, check conf.js for port.");
        	console.log(err);
        	process.exit(0);
        });




        process.title="Malache2 Web Server";
        console.log("============Malache2============");
        console.log("Version: 201509131205D");
        if (conf.https==true)
        {
            console.log("Https port is on: "+conf.httpsPort);
            console.log("Internal HTTP server is on: "+conf.port);
            console.log("Redirect server port is on: "+conf.redirPort);
        }
        else
        {
            console.log("Server is running on port: "+conf.port);
        }
        console.log("Domains:");
        for (let x in conf.domains)
        {
        	console.log("  "+x);
        }
        console.log("================================");
    }
});
