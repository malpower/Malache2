"use strict";


/* this module makes a socket connections into a http connection.
 * this Connection supports only GET and POST method.
 * it holds 2 ways of requests, alive and close.
 */





const Tools=require("./Tools");
const net=require("net");
const Requester=require("./Requester");
const Responser=require("./Responser");
const Processor=require("./Processor");
const conf=require("../conf");
const cp=require("child_process");
const Dispatcher=require("./Dispatcher");
const dispatcher=new Dispatcher;
const Request=require("./Request");


function Connection(client)
{
    if (!(client instanceof net.Socket))
    {
        return false;
    }
    Request(client,new Buffer(0));
}


module.exports=Connection;
