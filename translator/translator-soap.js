var amqp = require('amqplib/callback_api');
var urlQ = 'amqp://student:cph@datdb.cphbusiness.dk:5672';
var url = '207.154.205.185:3032/calculateInterest?wsdl';
var js2xmlparser = require("js2xmlparser");
var request = require('request');
var soap = require('soap');



amqp.connect(urlQ, function (err, conn) {
    conn.createChannel(function (err, chnl) {
        var q = 'Group11_translator_soap';
        chnl.assertQueue(q, {durable: false});
        chnl.consume(q, function (msg) {
            console.log("sending to SOAPBank");
            var message = JSON.parse(msg.content)
            message.ssn = message.ssn.replace('-', '');

            soap.createClient(url, function (err, client) {
                client.calculateInterest(message, function (err, res) {
                    console.log(err)
                });


                //
                //
                //      js2xmlparser.parse("calculateInterest", message)
                //
                //
                // ,
                //
                // function (err, res, body) {
                //     console.log('fuck this shit');
                //     console.log( js2xmlparser.parse("calculateInterest", message));
                //
                // }

            });
        }, {
            noAck: true
        });
    });
});

function requestBank(message, corr) {

    amqp.connect(url, function (err, conn) {
        conn.createChannel(function (err, chnl) {
            var exch = 'Group11_translator_soap';
            chnl.assertExchange(exch, 'fanout', {
                durable: false
            });

            var XMLMessage = js2xmlparser.parse("LoanRequest", message);
            chnl.publish(exch, '', Buffer.from(XMLMessage), {
                replyTo: 'Group11_queue_soap', correlationId: corr
            });
        });
    });
}