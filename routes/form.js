var express = require('express');
var router = express.Router();
var soap = require('soap');
var request = require("request");
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var xmlhttp = new XMLHttpRequest();
var amqp = require("amqplib/callback_api");

//Get Credit score
var CREDIT = 'http://138.68.85.24:8080/CreditScoreService/CreditScoreService?wsdl';

var url = 'amqp://student:cph@datdb.cphbusiness.dk:5672';

var queue = "group_11_recipient";

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('form');
});

/* Get form data from user. */
router.post('/', (req, res, next) => {
    var creditScore;
    var corr = generateUuid();
    var banksList = [];
    var ssn = req.body.ssn1 + "-" + req.body.ssn2;
    var loanAmount = req.body.loanAmount;
    var loanDuration = req.body.loanDuration;
    console.log("getting score");
    var me = this;
    getCreditScore(ssn, function (result) {
        console.log('result :' + result);
        console.log("got score");
        creditScore = result;

        var args = {
            ssn: ssn,
            creditScore: creditScore,
            loanAmount: loanAmount,
            loanDuration: loanDuration
        };

        request
            .post(
                {
                    headers: {'Content-Type': 'application/json'},
                    url: "http://127.0.0.1:3036/getBanks",
                    body: JSON.stringify(args)
                }
                , function (err, res, body) {
                    var fullMSGBody = args;
                    fullMSGBody.banks = JSON.parse(body);
                    console.log(fullMSGBody)
                    amqp.connect(url, function (err, conn) {
                        if (err) {

                        } else {
                            conn.createChannel(function (err, ch) {
                                ch.assertQueue(queue,{durable:true});
                                // ch.assertQueue(corr);
                                // ch.consume(corr, function (msg) {
                                //         console.log(' [.] Got %s', msg.content.toString());
                                //         console.log(' [.] Got %s', JSON.stringify(msg));
                                //         setTimeout(function () {
                                //             conn.close();
                                //             process.exit(0)
                                //         }, 1500);
                                // }, {noAck: true});


                                ch.sendToQueue(queue,Buffer.from(JSON.stringify(fullMSGBody)), {correlationId: corr});
                            });



                        }
                    });
                });

    });
});

function getCreditScore(ssn, callback) {
    soap.createClient(CREDIT, function (err, client) {
        if (err) {
            console.log(err)
        } else {
            client.creditScore({ssn: ssn}, function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(result.return);
                    callback(result.return);
                }
            });
        }
    });
};


function generateUuid() {
    return Math.random().toString() +
        Math.random().toString() +
        Math.random().toString();
}

module.exports = router;
