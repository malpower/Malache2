"use strict";

const conf=require("./conf");


console.log("Malache2 is now starting!");

if (conf.https)
{
    require("./malache2tls")
}
else
{
    require("./malache2");
}
