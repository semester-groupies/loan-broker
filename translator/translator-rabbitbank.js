var amqp = require('amqplib/callback_api');
var url = 'amqp://student:cph@datdb.cphbusiness.dk:5672';

amqp.connect(url, function (err, conn) {
  conn.createChannel(function (err, chnl) {
    var q = 'Group11_translator_rabbit';
    chnl.assertQueue(q,  { durable: false });
    chnl.consume(q,  function (msg) {
      console.log("sending to rabbit");
      requestBank((JSON.parse(msg.content)), msg.properties["correlationId"]);
    }, {
      noAck: true
    });
  });
});

function requestBank(message, corr) {
  message.ssn = message.ssn.replace('-', '');
  amqp.connect(url, function (err, conn) {
    conn.createChannel(function (err, chnl) {
      var exch = 'group11RabbitBank.JSON';
      chnl.assertExchange(exch, 'fanout', {
        durable: true
      });
      chnl.publish(exch, '', Buffer.from(JSON.stringify(message)), {
        replyTo: 'Group11_queue_rabbit', correlationId:corr
      });
    });
  });
}