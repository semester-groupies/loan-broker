var amqp = require('amqplib/callback_api');
var url = 'amqp://student:cph@datdb.cphbusiness.dk:5672';
var js2xmlparser = require("js2xmlparser");


amqp.connect(url, function (err, conn) {
    conn.createChannel(function (err, chnl) {
        var q = 'Group11_translator_xml';
        chnl.assertQueue(q,  { durable: false });
        chnl.consume(q,  function (msg) {
            console.log("sending to XMLBank");
            requestBank((JSON.parse(msg.content)),msg.properties["correlationId"]);
        }, {
            noAck: true
        });
    });
});

function requestBank(message,corr) {
    message.ssn = message.ssn.replace('-', '');
    var date = new Date("1970-01-01T01:00:00Z");
    date.setMonth(message.loanDuration);
    message.loanDuration = date.toISOString().substring(0, date.toISOString().indexOf('T'))+" 01:00:00.0 CET";

        amqp.connect(url, function (err, conn) {
        conn.createChannel(function (err, chnl) {
            var exch = 'cphbusiness.bankXML';
            chnl.assertExchange(exch, 'fanout', {
                durable: false
            });

            var XMLMessage = js2xmlparser.parse("LoanRequest", message);
            chnl.publish(exch, '', Buffer.from(XMLMessage), {
                replyTo: 'Group11_queue_xml',correlationId:corr
            });
        });
    });
}