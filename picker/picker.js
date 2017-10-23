var amqp = require('amqplib/callback_api');


var url = 'amqp://student:cph@datdb.cphbusiness.dk:5672';
var queue = "pickerGroup11";


amqp.connect(url, function (err, conn) {
    conn.createChannel(function (err, ch) {

        // ch.assertQueue(corr);


        ch.consume(queue, function (msg) {
            var allbankResponses = JSON.parse(msg.content);
            var theOne = {};
            var bestInterest = 999999999999;
            allbankResponses.forEach(function (item) {
                if (bestInterest > item.interestRate) {
                    bestInterest = item.interestRate;
                    theOne = item;
                }
                var fullResponse = {};
                fullResponse.banks = allbankResponses;
                fullResponse.best = theOne;
                ch.sendToQueue(
                    "final" + msg.properties.correlationId,
                    new Buffer(JSON.stringify(fullResponse)),
                    {
                        durable: false
                    })

            })
        }, {noAck: true});

    });


});