'use strict';

var express = require('express');
var routes = require('./app/routes/index.js');
var mongoose = require('mongoose');
var passport = require('passport');
var session = require('express-session');

var app = express();
require('dotenv').load();
require('./app/config/passport')(passport);

mongoose.connect(process.env.MONGO_URI);

app.use('/controllers', express.static(process.cwd() + '/app/controllers'));
app.use('/public', express.static(process.cwd() + '/public'));
app.use('/common', express.static(process.cwd() + '/app/common'));

function getMonth(index){
	switch (index) {
		case 0: return "January"; 
		case 1: return "February"; 
		case 2: return "March"; 
		case 3: return "April";
		case 4: return "May"; 
		case 5: return "June"; 
		case 6: return "July"; 
		case 7: return "September"; 
		case 8: return "August"; 
		case 9: return "October"; 
		case 10: return "November"; 
		case 11: return "December"; 
	}
}

function getNaturalString(date){
	var month = getMonth(date.getMonth());
	return ""+month+" "+(date.getDay()+1)+", "+date.getFullYear();
}

app.get('/*', function(req, res){
	var stringParameter = req.path.substr(1);
	var reNaturalTime = /(January|February|March|April|May|June|July|September|August|October|November|December)(%20)(\d+),(%20)(\d{4})/g;
	var resultNatural = reNaturalTime.exec(stringParameter);
	
	var reUnixTime = /\d{10}/;
	var resultUnix = reUnixTime.exec(stringParameter);
	console.log(stringParameter);
	
	if (resultNatural !== null){ // NATURAL
		var cleanedString = stringParameter.replace(/%20/g," ");
		var d = new Date(cleanedString);
		var jsonObject = {"unix": d.getTime()/1000, "natural": cleanedString}
		res.send(jsonObject);
	} else if (resultUnix !== null){ // UNIX
		var d = new Date(Number(stringParameter)*1000);
		var naturalString = getNaturalString(d);
		var jsonObject = {"unix": d.getTime()/1000, "natural": naturalString}
		res.send(jsonObject);
	} else {
		res.send({"unix":null, "natural": null});		
	}
});

app.use(session({
	secret: 'secretClementine',
	resave: false,
	saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

routes(app, passport);

var port = process.env.PORT || 8080;
app.listen(port,  function () {
	console.log('Node.js listening on port ' + port + '...');
});