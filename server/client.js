var express = require('express');
var soap = require('soap');
var bodyParser = require('body-parser');
require('body-parser-xml')(bodyParser);
var app = express();
app.use(bodyParser.xml({
    limit: '1MB',
    xmlParseOptions: {
        normalize: true,
        normalizeTags: true,
        explicitArray: false
    }
}));
app.get('/', function (req, res) {
    res.sendFile(__dirname + "/" + "/client.html");
})

app.post('/getBanks', bodyParser.urlencoded({extended: false}), function (req, res) {
    console.log(req.body);
    var input = req.body;
    console.log(input.data.ssn);
    console.log(input.data.creditscore);
    console.log(input.data.loanamount);
    console.log(input.data.loanduration);
    /*
    -beginning of soap body
    -url is defined to point to server.js so that soap cient can consume soap server's remote service
    -args supplied to remote service method
    */
    var url = "http://localhost:3030/getBanks?wsdl";
    var args = {ssn: input.data.ssn, creditScore: input.data.creditscore,
        loanAmount: input.data.loanamount, loanDuration: input.data.loanduration};

    soap.createClient(url, function (err, client) {
        if (err)
            console.error(err);
        else {
            client.getBanks(args, function (err, response) {
                if (err)
                    console.error(err);
                else {
                    console.log(response);
                    res.send(response);
                }
            })
        }
    });
})
var server = app.listen(3036, function () {
    var host = "127.0.0.1";
    var port = server.address().port;
    console.log("server running at http://%s:%s\n", host, port);
})