'use strict';
var amqp = require('amqplib/callback_api');
var url = 'amqp://student:cph@datdb.cphbusiness.dk:5672';
var results = new Array();
var agg = 'Group11_queue_aggregator';

amqp.connect(url, function (err, conn) {
  conn.createChannel(function (err, chan) {
    chan.assertQueue(agg, {
      durable: true
    });

    chan.consume(agg, function (msg) {
      var result = JSON.parse(msg.content);
      console.log('result in Aggregator: ', result);
      results.add(result);
      console.log('all results in Aggregator: ', results);
    });
  });
});

//now we need to send the message to the front end , and find which has the best interest rates.
//could probably hard code the bank names into the normalizer..
