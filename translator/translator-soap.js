var amqp = require('amqplib/callback_api');
var urlQ = 'amqp://student:cph@datdb.cphbusiness.dk:5672';
var url = 'http://localhost:3038/calculateInterest?wsdl';
var js2xmlparser = require("js2xmlparser");
var request = require('request');
var soap = require('soap');



amqp.connect(urlQ, function (err, conn) {
    conn.createChannel(function (err, chnl) {
        var q = 'Group11_translator_soap';
        chnl.assertQueue(q, {durable: false});
        chnl.consume(q, function (msg) {
            console.log("sending to SOAPBank");
            var message = JSON.parse(msg.content);
            message.ssn = message.ssn.replace('-', '');

            soap.createClient(url, function (err, client) {
                client.calculateInterest(message, function (err, res) {
                    var queue = 'Group11_queue_soap';
                    console.log('in soap bank');
                    chnl.sendToQueue(queue, new Buffer(JSON.stringify(res)), {correlationId:msg.properties.correlationId, durable:true });
                });

            });
        }, {
            noAck: true
        });
    });
});
