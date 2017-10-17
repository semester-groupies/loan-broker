'use strict';
var amqp = require('amqplib/callback_api');
var url = 'amqp://student:cph@datdb.cphbusiness.dk:5672';
var parseString = require('xml2js').parseString;

//we have two queues, ne for xml requests, one for json requests..
var queues = ['group11XMLQueue', 'group11JSONQueue'];
var agg = 'group11Aggregator';

amqp.connect(url, function (err, conn) {

  conn.createChannel(function (err, channel) {
        queues.forEach(function (queue) {
          channel.assertQueue(queue, {
            durable: false
          });
          console.log(' waiting for msg on %s : ', queue);
        });

        channel.consume(queues[0], function (message) {
          parseString(message, function (err, result) {
            var parts = {
              bank: 'anXMLBank',
              ssn: result.LoanResponse.ssn[0],
              interestRate: result.LoanResponse.interestRate[0],
              correlationId: msg.properties.correlationId
            };
           console.log('Sending this to aggregator : ', parts);
            toAggregator(parts);
          });

        }, {

          noAck: true
        });

        channel.consume(queues[1], function (message) {
          var reply = JSON.parse(message.content);
          var parts = {
            bank: 'aJSONBank',
            ssn: reply.ssn,
            interestRate: reply.interestRate,
            correlationId: message.properties.correlationId
          };
          console.log('Sending this to aggregator : ', parts);
          toAggregator(parts);
        }, {

          noAck: true
        });

        function toAggregator(msg) {
          amqp.connect(url, function(err, conn){
            conn.createChannel(function(err, ch){
              ch.assertQueue(agg, {
                durable: true
              });

              ch.sendToQueue(agg, Buffer.from(JSON.stringify(msg)));
            });
            setTimeout(function(){
              console.log('----------------------------------------------');
              conn.close();
            }, 500);
          });
        };
      });
});
