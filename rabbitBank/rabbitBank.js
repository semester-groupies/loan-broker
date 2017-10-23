var amqp = require('amqplib/callback_api');

var url2 = 'amqp://student:cph@datdb.cphbusiness.dk:5672';

amqp.connect(url2, function (err, conn) {
    conn.createChannel(function (err, ch) {
        var ex = 'group11RabbitBank.JSON';

        ch.assertExchange(ex, 'fanout', {durable: true});
        ch.checkExchange(ex, function (err, ok) {
            console.log('rabbit bank running.');
        });

        console.log(' [*] Waiting for messages in %s. To exit press CTRL+C', ex);
        ch.consume(ex, function (msg) {
            var cont = (JSON.parse(msg.content));
            console.log("RABBIT BANK");
            if (cont.loanRequest) {

                var interest = calculateRate(cont.loanRequest.creditScore);
                var obj =
                    {
                        loanResponse:
                            {
                                interestRate: interest,
                                ssn: (JSON.parse(msg.content)).loanRequest.ssn
                            }
                    };

                ch.bindQueue(msg.properties.replyTo, ex, '');
                ch.assertQueue(msg.properties.replyTo, {durable: true});
                ch.sendToQueue(msg.properties.replyTo, new Buffer(JSON.stringify(obj)), {correlationId: msg.properties.correlationId});

            }
        }, {noAck: false});
    });
});

function calculateRate(creditScore) {
    var interestRate;
    switch (true) {
        case (creditScore <= 100):
            interestRate = 10.5;

            break;
        case (creditScore >= 200 && creditScore < 300):
            interestRate = 8.5;

            break;
        case (creditScore >= 300 && creditScore < 400):
            interestRate = 6.5;

            break;
        case (creditScore >= 400 && creditScore < 500):
            interestRate = 5.5;
            break;
        case (creditScore >= 500 && creditScore < 600):
            interestRate = 4.34;

            break;
        case (creditScore >= 600 && creditScore < 700):
            interestRate = 3.45;

            break;
        case (creditScore >= 700 && creditScore < 800):
            interestRate = 1.2;

            break;
        case (creditScore === 800):
            interestRate = 0.5;

            break;

    }

    return interestRate.toFixed(2);

};
