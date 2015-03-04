var fs=require("fs");
var ReadLine=require("readline");



var rl=ReadLine.createInterface({input: process.stdin, output: process.stdout});
var site=new Object;
console.log("MALACHE SITE CREATING TOOL");


rl.question("Site name: ",function(an)
{
    site.name=an;
    rl.question("Active displaying extension name: ",function(an)
    {
        site.active=an;
        rl.question("Template file type: ",function(an)
        {
            site.template=an;
            rl.question("File Recognization charset:[utf8, ascii, binary] ",function(an)
            {
                site.cutType=an;
                rl.question("Default page: ",function(an)
                {
                    site.defaultPage=an;
                    site.contentTypes={".html": "text/html;charset=utf-8",
                                       ".htm": "text/html;charset=utf-8",
                                       ".jpg": "image/jpeg",
                                       ".png": "image/png",
                                       ".gif": "image/gif",
                                       ".css": "text/css",
                                       ".js": "text/javascript",
                                       ".txt": "text/plain;charset=utf-8",
                                       ".ajs": "text/html;charset=utf-8"};
                    var conf="module.exports="+JSON.stringify(site);
                    conf=conf.replace(/,/g,",\r\n                ");
                    conf+=";";
                    rl.question("Are you sure to make site named "+site.name+"?[y/n]",function(an)
                    {
                        if (an!="y")
                        {
                            console.log("Exiting!");
                            process.exit(0);
                        }
                        console.log("Creating site "+site.name);
                        fs.mkdirSync("../sites/"+site.name);
                        fs.mkdirSync("../sites/"+site.name+"/Activities");
                        fs.mkdirSync("../sites/"+site.name+"/Plugs");
                        fs.mkdirSync("../sites/"+site.name+"/Templates");
                        fs.writeFileSync("../sites/"+site.name+"/conf.js",conf);
                        console.log("Creation finished!");
                        console.log("Please add this site into /conf.js");
                        rl.close();
                    });
                });
            });
        });
    });
});
                               











