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
                    if(creditScore < 100){
                        list.push("Group11_translator_json");
                    };
                    if(100 < creditScore < 400) {
                        list.push("Group11_translator_json");
                        list.push("Group11_translator_xml");
                    };
                    if(creditScore > 400) {
                        if (loanAmount > 1000000) {
                            list.push("Group11_translator_soap");
                        } else {
                            list.push("Group11_translator_rabbit");
                        }
                    };
                return list;
            }
        }
    }
};

// xml data is extracted from wsdl file created
var xml = require('fs').readFileSync('./server/getBanks.wsdl','utf8');
var server = app.listen(3030, function() {
    var host = "127.0.0.1";
    var port = server.address().port;
});
soap.listen(server, '/getBanks', service, xml);