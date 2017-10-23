var amqp = require('amqplib/callback_api');


var url = 'amqp://student:cph@datdb.cphbusiness.dk:5672';
var queue = "pickerGroup11";



amqp.connect(url, function (err, conn) {
    conn.createChannel(function (err, ch) {

        ch.assertQueue(queue);


        ch.consume(queue, function (msg) {
            var bestInterest = 999999999999;
            var allbankResponses = JSON.parse(msg.content);
            var theOne = {};

            allbankResponses.forEach(function (item) {
                if (bestInterest > item.interestRate) {
                    bestInterest = item.interestRate;
                    theOne = item;
                }
            });
            var fullResponse = {};
            fullResponse.banks = allbankResponses;
            fullResponse.best = theOne;
            console.log(JSON.stringify(fullResponse));
            ch.sendToQueue(
                "final" + msg.properties.correlationId,
                new Buffer(JSON.stringify(fullResponse)),
                {
                    durable: true
                })
        }, {noAck: true});

    });


});