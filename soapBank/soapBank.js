var soap = require('soap');
var express = require('express');
var app = express();


/**
 -this is remote service defined in this file, that can be accessed by clients, who will supply args
 -response is returned to the calling client
 -our service calculates bmi by dividing weight in kilograms by square of height in metres
 **/
var service = {
  interestService: {
    interest_port: {
      calculateInterest: function (args) {
        var ssn = args.ssn;
        var creditScore = args.creditScore;
        var loanAmount = args.loanAmount;
        var loanDuration = args.loanDuration;
        var year = new Date().getFullYear();
        var interestRate;

          switch (true) {
              case (creditScore <= 100):
                  interestRate = 11.5;

                  break;
              case (creditScore > 100 && creditScore < 200):
                  interestRate = 10.5;

                  break;
              case (creditScore >= 200 && creditScore < 300):
                  interestRate = 9.5;

                  break;
              case (creditScore >= 300 && creditScore < 400):
                  interestRate = 8.5;

                  break;
              case (creditScore >= 400 && creditScore < 500):
                  interestRate = 7.5;
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



        return {
          loanResponse: {
            interestRate: interestRate,
            ssn: ssn
          }
        };
      }
    }
  }
};
// xml data is extracted from wsdl file created
var xml = require('fs').readFileSync('./soapBank/soapBank.wsdl', 'utf8');
var server = app.listen(3038, function () {
  var host = "localhost";
  var port = server.address().port;
  console.log('listening on :', port);
});
+
    soap.listen(server, '/calculateInterest', service, xml);