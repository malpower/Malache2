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

var cp=require("child_process");

var sharer=cp.fork("./objects/Sharer");

sharer.on("message",function(msg)
{
    var net=require("net");
    var Connection=require("./objects/Connection");
    var conf=require("./conf");
    conf.cwd=process.cwd()+"/";
    if (msg.status=="online")
    {
        console.log("Sharer started!");
        var server=net.createServer(function(socket)
        {//main server, collect socket connections simply and create a Connection with sockets collected.
            new Connection(socket);
        });
        
        server.listen(conf.port);
        
        server.on("error",function(err)
        {//catch errors when listening failed.
        	console.log("server starting failed, check conf.js for port.");
        	console.log(err);
        	process.exit(0);
        });
        
        
        
        
        process.title="Malache2 Web Server";
        console.log("============Malache2============");
        console.log("Version: 201410141139D");
        console.log("Server is running on port: "+conf.port);
        console.log("Domains:");
        for (var x in conf.domains)
        {
        	console.log("  "+x);
        }
        console.log("================================");
    }
});


