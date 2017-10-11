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
            getBanks:function(args){
                var list = [];
                var creditScore = Number(args.creditScore);
                var loanAmount = Number(args.loanAmount);
                    if(creditScore<100){
                        list.push("RabbitMQ");
                    };
                    if(100<creditScore<400) {
                        list.push("SoapBank");
                        list.push("JsonBank");
                    };
                    if(creditScore>600) {
                        if (loanAmount > 1000000) {
                            list.push("ImaginarySaxoBank");
                        } else {
                            list.push("JsonBank")
                        }
                    };
                return list;
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