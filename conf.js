var fs=require("fs");
module.exports={maxPostSize: 1024*1024*100,
                domains: {"127.0.0.1:8080": "sites/test",
                          "cnctug1it003l:8080": "sites/test"},
                template: "xml",
                port: 8080,
                httpsPort: 8081,
                https: false,
                handlerLength: 5,
                scriptTimeout: 10,			//seconds
                sessionTimeout: 1000*60*10,		//million seconds
                sharerPort: 9987,
                active: "ajs",
                tls:{key: fs.readFileSync('./ca/server.key'),
                     cert: fs.readFileSync('./ca/server.crt')}};
