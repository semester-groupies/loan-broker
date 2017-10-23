'use strict';
var amqp = require('amqplib/callback_api');
var url = 'amqp://student:cph@datdb.cphbusiness.dk:5672';
var agg = 'pickerGroup11';
var result = [];
module.exports = {
    startAggregator: function (queueName, numberOfBanks) {

        console.log(numberOfBanks);
        amqp.connect(url, function (err, conn) {
            conn.createChannel(function (err, chan) {
                chan.assertQueue(queueName, {
                    durable: false
                });

                chan.consume(queueName, function (msg) {
                    var timedOut = false;
                    setTimeout(function () {
                        if (!timedOut)
                            chan.sendToQueue(
                                "pickerGroup11",
                                new Buffer(JSON.stringify(result)),
                                {
                                    durable: false,
                                    correlationId: msg.properties.correlationId
                                })
                    }, 1500)
                    if (result.length < numberOfBanks) {
                        result.push(JSON.parse(msg.content));

                        if (result.length == numberOfBanks) {
                            if (!timedOut)
                                chan.sendToQueue(
                                    "pickerGroup11",
                                    new Buffer(JSON.stringify(result)),
                                    {
                                        durable: false,
                                        correlationId: msg.properties.correlationId
                                    })
                        }
                    }


                });
            });
        });

    }
}

//now we need to send the message to the front end , and find which has the best interest rates.
//could probably hard code the bank names into the normalizer..
