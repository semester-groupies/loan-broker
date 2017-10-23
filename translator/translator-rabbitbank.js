var amqp = require('amqplib/callback_api');
var url = 'amqp://student:cph@datdb.cphbusiness.dk:5672';

amqp.connect(url, function (err, conn) {
    conn.createChannel(function (err, chnl) {
        var q = 'Group11_translator_rabbit';
        chnl.assertQueue(q,  { durable: true });
        chnl.consume(q,  function (msg) {
            console.log("sending to rabbit");
            var result = (JSON.parse(msg.content));
            result.ssn = parseInt(result.ssn.replace("-",""));
            result.loanAmount = parseInt(result.loanAmount);
            result.loanDuration = parseInt(result.loanDuration);
            requestBank(result, msg.properties["correlationId"]);
            console.log(result)
        }, {
            noAck: true
        });
    });
});

function requestBank(message, corr) {
    amqp.connect(url, function (err, conn) {
        conn.createChannel(function (err, chnl) {
            var exch = 'group11RabbitBank.JSON1';
            chnl.assertExchange(exch, 'fanout', {
                durable: true
            });
            chnl.publish(exch, '', Buffer.from(JSON.stringify(message)), {
                replyTo: 'Group11_queue_rabbit', correlationId:corr
            });
        });
    });
}