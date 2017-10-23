/**
 * Created by Athinodoros on 10/4/2017.
 */


var amqp = require('amqplib/callback_api');


var url = 'amqp://student:cph@datdb.cphbusiness.dk:5672';
var ex = 'cphbusiness.bankJSON';


amqp.connect(url, function(err, conn) {
    conn.createChannel(function(err, ch) {
        var ex = 'logs';
        var msg = process.argv.slice(2).join(' ') || 'Hello World! ';

        ch.assertExchange(ex, 'fanout', {durable: false});
        ch.publish(ex, '', new Buffer(msg));
        console.log(" [x] Sent %s", msg);
        setTimeout(function() { conn.close(); process.exit(0) }, 500);
    });

});