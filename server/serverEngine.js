var soap = require('soap');
var express = require('express');
var app = express();
/**
 -this is remote service defined in this file, that can be accessed by clients, who will supply args
 -response is returned to the calling client
 **/
var service = {
    getBanksService : {
        BANKS_Port :{
            getListOfBanks:function(args){
                //let the magic happen here


                return {banks: n};
            }
        }
    }
};
// xml data is extracted from wsdl file created
var xml = require('fs').readFileSync('./getBanks.wsdl','utf8');
var server = app.listen(3030,function(){
    var host = "127.0.0.1";
    var port = server.address().port;
});
soap.listen(server,'/getBanks',service,xml);