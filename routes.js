'use strict';

const express = require('express'),
	  app = express(),
	  config = require('./config/development'),
	  request = require('request'),
	  googleapis = require('googleapis'),
	  async = require('async');

app.post('/message-received', (req, res) => {
	console.log('POST -- /message-received');
	console.log(req.body);

	let events = req.body.entry[0].messaging;
	console.log(events);
	async.each(events, (event, cb) => {
		if (event.message && event.message.text) {
			googleapis.discoverAPI(config.perspective.URL, (err, client) => {
				if (err) {
					cb(err);
				}

				const analyzeRequest = {
					'comment': {
						text: event.message.text
					},
					'languages': ['en'],
					'requestedAttributes': {
						'TOXICITY': {}
					}
				},
				analyzeBody = {
					'key': config.perspective.KEY,
					'resource': analyzeRequest
				};

				client.comments.analyze(analyzeBody, (analyzeErr, response) => {
					if (analyzeErr) {
						cb(analyzeErr);
					}
					console.log("Analyze Response");
					console.log(response);

					let score = response.attributeScores.TOXICITY.summaryScore.value,
						scoreResponse = 'Your message got a score of ' + score;

					if (score < 0.3) {
						scoreResponse = scoreResponse + '. Great job! Let\'s create a healthy Internet!';
					} else if (score < 0.6) {
						scoreResponse = scoreResponse + '. Hmm, it looks like you should reword your message.';
					} else {
						scoreResponse = scoreResponse + '. Hold up! Be careful with this message, it appears too toxic to share.';
					}

					sendMessage(event.sender.id, scoreResponse, (err, status) => {
						if (err) {
							cb(err);
						} else {
							cb(err, status);
						}
					});
				});
			});	
		} else if (event.postback && event.postback.payload === "SETUP_PAYLOAD") {
			sendMessage(event.sender.id, "Welcome to Antydote!", (err, status) => {
				if (err) {
					cb(err);
				} else {
					cb(err, status);
				}
			});
		}
	}, (err, status) => {
		if (err) {
			res.sendStatus(500);
			return;
		}
		res.sendStatus(200);
	});
});

app.get('/test-route', (req, res) => {
	console.log('/test-route working!');
	res.end();
});

app.get('/message-received', (req, res) => {
	console.log('POST -- /message-received');

	let VERIFY_TOKEN = config.VERIFY_TOKEN,
		mode = req.query['hub.mode'],
		token = req.query['hub.verify_token'],
		challenge = req.query['hub.challenge'];

	if (mode && token) {
		if(mode === 'subscribe' && token === config.VERIFY_TOKEN) {
			console.log('Webhook Verified');
			res.status(200).send(challenge);
		} else {
			res.sendStatus(403);
		}
	}
});

app.post('/user-post', (req, res) => {
	console.log('POST -- /user-post');
	console.log(req.body);
	res.end();
});

app.post('/user-comment', (req, res) => {
	console.log('POST -- /user-comment');
	res.end();
});

app.get('/user-post', (req, res) => {
	console.log('GET -- /user-post');
	let VERIFY_TOKEN = config.VERIFY_TOKEN,
		mode = req.query['hub.mode'],
		token = req.query['hub.verify_token'],
		challenge = req.query['hub.challenge'];

	if (mode && token) {
		if(mode === 'subscribe' && token === config.VERIFY_TOKEN) {
			console.log('Webhook Verified');
			res.status(200).send(challenge);
		} else {
			res.sendStatus(403);
		}
	}
});

app.get('/user-comment', (req, res) => {
	console.log('GET -- /user-comment');
	let VERIFY_TOKEN = config.VERIFY_TOKEN,
		mode = req.query['hub.mode'],
		token = req.query['hub.verify_token'],
		challenge = req.query['hub.challenge'];

	if (mode && token) {
		if(mode === 'subscribe' && token === config.VERIFY_TOKEN) {
			console.log('Webhook Verified');
			res.status(200).send(challenge);
		} else {
			res.sendStatus(403);
		}
	}
});

function sendMessage(id, message, cb) {
  let data = {
    "recipient":{
    	"id": id
    },
    "message":{
    	"text": message
    }
  };

  let reqObj = {
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token: config.PAGE_ACCESS_TOKEN},
    method: 'POST',
    json: data
  };
  request(reqObj, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
      cb(error);
    } else if (response.body.error) {
      console.log(body);
      console.log(response.body.error);
      console.log("API Error: " + response.body.error);
      cb(new Error(''));
    } else{
      cb(error, response.status);
    }
  });
}

module.exports = app;
