var express = require('express');
var soap = require('soap');
var bodyParser = require('body-parser');
require('body-parser-xml')(bodyParser.urlencoded({
    extended: false
}));
var app = express();
app.use(bodyParser.json());
// app.get('/', function (req, res) {
//     res.sendFile(__dirname + "/" + "/client.html");
// });

app.post('/getBanks', function (req, res) {
    console.log("------------------");
    console.log(req.body);
    console.log("------------------");

    /*
    -beginning of soap body
    -url is defined to point to server.js so that soap cient can consume soap server's remote service
    -args supplied to remote service method
    */
    var url = "http://localhost:3030/getBanks?wsdl";

    // soap.createClient(url, function (err, client) {
    //     if (err)
    //         console.error(err);
    //     else {
    //         console.log("^^^^^^^^^^^^^^^^^^^^^");
    //         client.getBanks(req.body, function (err, response) {
    //             if (err)
    //                 console.error(err);
    //             else {
    //                 console.log(response);
    //                 res.send(response);
    //             }
    //         })
    //     }
    // });
})
var server = app.listen(3036, function () {
    var host = "127.0.0.1";
    var port = server.address().port;
    console.log("server running at http://%s:%s\n", host, port);
})