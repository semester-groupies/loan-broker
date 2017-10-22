var url = 'http://207.154.205.185/calculateInterest?wsdl';
var js2xmlparser = require("js2xmlparser");


amqp.connect(url, function (err, conn) {
    conn.createChannel(function (err, chnl) {
        var q = 'Group11_translator_soap';
        chnl.assertQueue(q, {durable: false});
        chnl.consume(q, function (msg) {
            console.log("sending to SOAPBank");
            request
                .post(
                    {
                        headers: {'Content-Type': 'text/xml'},
                        url: url,
                        body: JSON.stringify(msg)
                    }
                    , function (err, res, body) {
                    });
        }, {
            noAck: true
        });
    });
});

function requestBank(message, corr) {
    message.ssn = message.ssn.replace('-', '');

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