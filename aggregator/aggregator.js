'use strict';
var amqp = require('amqplib/callback_api');
var rabbitmq = 'amqp://student:cph@datdb.cphbusiness.dk:5672';
var Results = new Array();
var agg = 'group11Aggregator';

amqp.connect(rabbitmq, function (err, conn) {
  conn.createChannel(function (err, chan) {
    chan.assertQueue(agg, {
      durable: true
    });

    chan.consume(agg, function (msg) {
      var result = JSON.parse(msg.content);
      Results.add(result);
    });
  });
});

//now we need to send the message to the front end , and find which has the best interest rates.
//could probably hard code the bank names into the normalizer..
