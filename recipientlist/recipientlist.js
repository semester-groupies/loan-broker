var amqp = require('amqplib/callback_api');

var url = 'amqp://student:cph@datdb.cphbusiness.dk:5672';

var queue = "group_11_recipient";


amqp.connect(url, function (err, conn) {
    conn.createChannel(function (err, ch) {

        ch.assertQueue(queue, {durable: true}, function (error, q) {
            ch.consume(queue, function (msg) {
                var response = JSON.parse(msg.content);
                var ms = JSON.parse(msg.content);
                var ms = JSON.parse(msg.content);
                delete ms['banks'];
                Object.keys(response.banks).forEach(function (item) {
                    if (response.banks[item] == "Group11_translator_json") {
                        sendToTranslator(response.banks[item], ch, ms, msg.properties["correlationId"]);
                    } else if (response.banks[item] == "Group11_translator_xml") {
                        sendToTranslator(response.banks[item], ch, ms, msg.properties["correlationId"]);
                    } else if (response.banks[item] == "Group11_translator_soap") {

                    } else if (response.banks[item] == "Group11_translator_rabbit") {

                    }


                })
            }, {noAck: true});

        });


    });
// setTimeout(function() { conn.close(); process.exit(0) }, 500);
});


function sendToTranslator(translatorName, ch, msg, corr) {
    console.log(corr);
    ch.sendToQueue(translatorName,
        new Buffer(JSON.stringify(msg)),
        {durable: true, correlationId: corr})
}