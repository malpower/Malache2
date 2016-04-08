var fs=require("fs");
module.exports={maxPostSize: 1024*1024*100,
                domains: {"127.0.0.1": "../../Projects/WebSamples",
                          "cnctug0it666d": "../AssetsManagementSystem"},
                template: "xml",
                port: 80,
                httpsPort: 443,
                https: false,
                redirPort: 8081,
                handlerLength: 5,
                scriptTimeout: 10,			//seconds
                sessionTimeout: 1000*60*30,		//million seconds
                sharerPort: 19987,
                active: "ajs",
                cacheControl: "no-cache",
                tls:{key: fs.readFileSync('./ca/server.key'),
                     requestCert: false,
                     cert: fs.readFileSync('./ca/server.crt')}};
