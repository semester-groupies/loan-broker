var amqp = require('amqplib/callback_api');
var url = 'amqp://student:cph@datdb.cphbusiness.dk:5672';

amqp.connect(url, function (err, conn) {
  conn.createChannel(function (err, chnl) {
    var q = 'Group11_translator_json';
    chnl.assertQueue(q,  { durable: false });
    chnl.consume(q,  function (msg) {
      console.log("sending to bank");
      requestBank((JSON.parse(msg.content)));
    }, {
      noAck: true
    });
  });
});

function requestBank(message) {
  message.ssn = message.ssn.replace('-', '');
  amqp.connect(url, function (err, conn) {
    conn.createChannel(function (err, chnl) {
      var exch = 'cphbusiness.bankJSON';
      chnl.assertExchange(exch, 'fanout', {
        durable: false
      });
      chnl.publish(exch, '', Buffer.from(JSON.stringify(message)), {
        replyTo: 'Group11_queue_json'
      });
    });
  });
}