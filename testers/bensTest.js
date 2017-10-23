/**
 * Created by Athinodoros on 10/4/2017.
 */
var amqp = require('amqplib/callback_api');


var url = 'amqp://student:cph@datdb.cphbusiness.dk:5672';
var ex = 'cphbusiness.bankXML';

var XMLRequest = '<LoanRequest><ssn>12345678</ssn><creditScore>685</creditScore><loanAmount>10.0</loanAmount>' +
    '<loanDuration>1973-01-01 01:00:00.0 CET</loanDuration></LoanRequest>';

var obj =
    {
        loanRequest: {
            ssn: 7654561245,
            creditScore: 856,
            loanAmount: 1000,
            loanDuration: 360

        }
    };

amqp.connect(url, function (err, conn) {
    conn.createChannel(function (err, ch) {
        var mq = 'bensGroupOut';
        // var msg = JSON.stringify(obj);
        var msg = XMLRequest;

        ch.assertQueue(ex, {durable: true}, function (error, q) {
            var corr = generateUuid();
            // ch.bindQueue(q.queue, "logs", '');
            ch.assertQueue(corr);
            ch.consume(corr, function (msg) {
                if (msg.properties.correlationId == corr) {
                    console.log(' [.] Got %s', msg.content.toString());
                    console.log(' [.] Got %s', JSON.stringify(msg));
                    setTimeout(function () {
                        conn.close();
                        process.exit(0)
                    }, 1500);
                }else{
                    console.log(JSON.stringify(msg))
                }
            }, {noAck: true});







            ch.publish(ex, "", new Buffer(msg), {correlationId: corr ,replyTo: corr});
            ch.publish(ex, "", new Buffer(msg), {correlationId: "...." ,replyTo: "bensGroup"});
            ch.publish(ex, "", new Buffer(msg), {correlationId: corr ,replyTo: "bensGroup"});
            ch.publish(ex, "", new Buffer(msg), {correlationId: "123" ,replyTo: "bensGroup"});

        });
        // Note: on Node 6 Buffer.from(msg) should be used
        console.log(" [x] Sent %s", msg);
    });
    // setTimeout(function() { conn.close(); process.exit(0) }, 500);
});

function generateUuid() {
    return Math.random().toString() +
        Math.random().toString() +
        Math.random().toString();
}