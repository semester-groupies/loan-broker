'use strict';
var amqp = require('amqplib/callback_api');
var url = 'amqp://student:cph@datdb.cphbusiness.dk:5672';
var agg = 'pickerGroup11';
module.exports = {
    startAggregator: function (queueName, numberOfBanks) {
        console.log(numberOfBanks);
        amqp.connect(url, function (err, conn) {
            conn.createChannel(function (err, chan) {
                chan.assertQueue(queueName, {
                    durable: true
                });
                var result = [];

                chan.consume(queueName, function (msg) {
                    var exists = false;
                    if (result.length == 0) {
                        result.push(JSON.parse(msg.content));
                        console.log("''''''''''''''''''''''''''''''''''''")
                        console.log(JSON.parse(msg.content).bank);
                        console.log("''''''''''''''''''''''''''''''''''''")
                    } else {
                        console.log(result.length)
                        if (result.length >= numberOfBanks ) {
                            chan.sendToQueue(
                                "pickerGroup11",
                                new Buffer(JSON.stringify(result)),
                                {
                                    durable: true,
                                    correlationId: msg.properties.correlationId
                                })
                        } else {
                            result.forEach(function (item) {
                                if (item.bank.toString() === JSON.parse(msg.content).bank.toString()) {
                                    exists = true;
                                }
                            });
                            if (!exists) {
                                result.push(JSON.parse(msg.content));
                            }
                        }
                        setTimeout(function () {
                            chan.sendToQueue(
                                "pickerGroup11",
                                new Buffer(JSON.stringify(result)),
                                {
                                    durable: true,
                                    correlationId: msg.properties.correlationId
                                })
                        }, numberOfBanks * 1000 * 1.5);
                    }


                });
            });
        });

    }
}

//now we need to send the message to the front end , and find which has the best interest rates.
//could probably hard code the bank names into the normalizer..
