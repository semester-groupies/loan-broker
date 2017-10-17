/**
 * Created by Athinodoros on 10/4/2017.
 */
var amqp = require('amqplib/callback_api');
var url = 'amqp://student:cph@datdb.cphbusiness.dk:5672';
var ex = 'cphbusiness.bankJSON';
var parseString = require('xml2js').parseString;
var XMLRequest = '<LoanRequest><ssn>12345678</ssn><creditScore>685</creditScore><loanAmount>10.0</loanAmount>' +
    '<loanDuration>1973-01-01 01:00:00.0 CET</loanDuration></LoanRequest>';
var obj =
{

    ssn: 1654561245,
    loanAmount: 1000,
    creditScore: 234,
    loanDuration: 360

};
amqp.connect(url, function (err, conn) {
  conn.createChannel(function (err, ch) {
    var mq = 'bens';
    var msg = JSON.stringify(obj);
    console.log(msg);
    //var msg = XMLRequest;
    ch.assertQueue(ex, { durable: true }, function (error, q) {
      var corr = generateUuid();
      // ch.bindQueue(q.queue, "logs", '');
      ch.consume('bens', function (msg) {
        //parseString(msg.content.toString(), function (err, result) {
        //  var parts = {
        //    bank: 'anXMLBank',
        //    ssn: result.LoanResponse.ssn[0],
        //    interestRate: result.LoanResponse.interestRate[0],
        //    correlationId: msg.properties.correlationId
        //  };
        //console.log(parts);
        //});
        var temp = JSON.parse(msg.content);
        //console.log(temp);
        console.log(temp.ssn);
        console.log(msg.properties.headers);
        setTimeout(function () {
          conn.close();
          process.exit(0);
        }, 500);

      }, { noAck: true });

      ch.publish(ex, '', new Buffer(msg), { correlationId: corr, replyTo: 'bens' });
    });
    // Note: on Node 6 Buffer.from(msg) should be used
    console.log(' [x] Sent %s', msg);
  });
  // setTimeout(function() { conn.close(); process.exit(0) }, 500);
});

function generateUuid() {
  return Math.random().toString() +
      Math.random().toString() +
      Math.random().toString();
}
