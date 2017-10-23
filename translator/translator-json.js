var amqp = require('amqplib/callback_api');
var url = 'amqp://student:cph@datdb.cphbusiness.dk:5672';

amqp.connect(url, function (err, conn) {
  conn.createChannel(function (err, chnl) {
    var q = 'Group11_translator_json';
    chnl.assertQueue(q,  { durable: true });
    chnl.consume(q,  function (msg) {
      requestBank((JSON.parse(msg.content)), msg.properties['correlationId']);
    }, {

      noAck: true
    });
  });
});

//here we take the data and format it for the json bank
function requestBank(message, corr) {
  message.ssn = message.ssn.replace('-', '');
  amqp.connect(url, function (err, conn) {
    conn.createChannel(function (err, chnl) {
      var exch = 'cphbusiness.bankJSON';
      chnl.assertExchange(exch, 'fanout', {
        durable: false
      });
      chnl.publish(exch, '', Buffer.from(JSON.stringify(message)), {
        replyTo: 'Group11_queue_json', correlationId: corr
      });
    });
  });
}
