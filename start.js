"use strict";



/*************************************
This is the start entry of malache.
It select start js file according to the config
*************************************/

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
