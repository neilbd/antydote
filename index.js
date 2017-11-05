'use strict';

const express = require('express'),
	  bodyParser = require('body-parser'),
	  app = express(),
	  port = process.env.PORT || 1337,
	  routes = require('./routes'),
	  https = require('https'),
	  config = require('./config/development');

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.use(routes);

https.createServer(config.sslOpts, app).listen(port, () => {
	console.log('Listening at port ' + port);
});
