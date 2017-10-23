var amqp = require('amqplib/callback_api');

var url2 = 'amqp://student:cph@datdb.cphbusiness.dk:5672';

amqp.connect(url2, function (err, conn) {
    conn.createChannel(function (err, ch) {
        var ex = 'group11RabbitBank.JSON1';
        ch.assertQueue(ex, {durable: true});
        ch.assertExchange(ex, 'fanout', {durable: true});
        ch.checkExchange(ex, function (err, ok) {
            console.log('rabbit bank running.');
        });

        ch.consume(ex, function (msg) {
            var cont = (JSON.parse(msg.content));

                var interest = calculateRate(cont.creditScore);

                var obj =
                    {
                        loanResponse:
                            {
                                interestRate: interest,
                                ssn: parseInt(cont.ssn)
                            }
                    };
                ch.bindQueue(ex, ex, '');
                ch.assertQueue(msg.properties.replyTo, {durable: true});
                ch.sendToQueue(msg.properties.replyTo, new Buffer(JSON.stringify(obj)), {correlationId: msg.properties.correlationId});


        }, {noAck: true});
    });
});

function calculateRate(creditScore) {
    var interestRate;
    switch (true) {
        case (creditScore <= 200):
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
            interestRate = 4.02;

            break;
        case (creditScore >= 600 && creditScore < 700):
            interestRate = 3.2;

            break;
        case (creditScore >= 700 && creditScore < 800):
            interestRate = 1.7;

            break;
        case (creditScore === 800):
            interestRate = 0.8;

            break;

    }
    return interestRate;

};
