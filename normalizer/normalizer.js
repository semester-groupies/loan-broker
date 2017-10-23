'use strict';
var amqp = require('amqplib/callback_api');
var url = 'amqp://student:cph@datdb.cphbusiness.dk:5672';
var xmlToJSON = require('xml2js').parseString;


//we have two queues, ne for xml requests, one for json requests..
var queues = ['Group11_queue_xml', 'Group11_queue_json', 'Group11_queue_soap', 'Group11_queue_rabbit'];
var agg = 'Group11_queue_aggregator';

console.log(queues[3]);
amqp.connect(url, function (err, conn) {
    console.log(err);
    conn.createChannel(function (err, channel) {
        queues.forEach(function (queue) {
            channel.assertQueue(queue, {
                durable: true
            });
        });

        channel.consume(queues[0], function (message) {
            xmlToJSON(message.content.toString(), function (err, result) {
                var parts = {
                    bank: 'cphbusiness.bankXML',
                    ssn: result.LoanResponse.ssn[0],
                    interestRate: result.LoanResponse.interestRate[0],
                    correlationId: message.properties.correlationId
                };

                // console.log('Sending this to aggregator: ', parts);
                toAggregator(parts, channel);
            });


        }, {

            noAck: true
        });

        channel.consume(queues[1], function (message) {
            var reply = JSON.parse(message.content);
            var parts = {
                bank: 'cphbusiness.bankJSON',
                ssn: reply.ssn,
                interestRate: reply.interestRate,
                correlationId: message.properties.correlationId
            };
            // console.log('Sending this to aggregator: ', parts);
            toAggregator(parts, channel);
        }, {

            noAck: true
        });

        channel.consume(queues[2], function (message) {

            var reply = JSON.parse(message.content);

            var parts = {
                bank: 'group11.bankSoap',
                ssn: parseFloat(reply.loanResponse.ssn),
                interestRate: parseFloat(reply.loanResponse.interestRate),
                correlationId: message.properties.correlationId
            };
            // console.log('Sending this to aggregator: ', parts);
            toAggregator(parts, channel);

        }, {

            noAck: true
        });

        channel.consume(queues[3], function (message) {
            var reply = JSON.parse(message.content);
            var parts = {
                bank: 'group11Rabbit.rabbit',
                ssn: reply.loanResponse.ssn,
                interestRate: reply.loanResponse.interestRate,
                correlationId: message.properties.correlationId
            };
            console.log('Sending this to aggregator: ', parts);
            toAggregator(parts, channel);
        }, {

            noAck: true
        });

        function toAggregator(msg, ch) {
            ch.assertQueue(msg.correlationId, {
                durable: true
            });

            ch.sendToQueue(msg.correlationId, Buffer.from(JSON.stringify(msg)), {correlationId: msg.correlationId});


        };
    });
});
