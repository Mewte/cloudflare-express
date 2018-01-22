/*
Test express server to demonstrate if IP is restoring
 */

var express = require('express');
var app = express();
var cloudflare = require("../index.js");

// catch 404 and forward to error handler

app.use(cloudflare.restore());

app.get('/', function(req,res,next){
    res.send("Your IP is: "+req.ip +"<br/>" + "Cloudflare IP: "+ req.cf_ip);
});

app.set('port', process.env.PORT || 8080);

var server = app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + server.address().port);
});