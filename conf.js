var fs=require("fs");
module.exports={maxPostSize: 1024*1024*100,
                domains: {"192.168.0.179": "sites/test",
                          "cnctug1it003l:10001": "sites/test"},
                template: "xml",
                port: 10001,
                httpsPort: 8081,
                https: false,
                handlerLength: 5,
                scriptTimeout: 10,			//seconds
                sessionTimeout: 1000*60*10,		//million seconds
                sharerPort: 19987,
                active: "ajs",
                tls:{key: fs.readFileSync('./ca/server.key'),
                     cert: fs.readFileSync('./ca/server.crt')}};
