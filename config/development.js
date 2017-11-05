'use strict';

const fs = require('fs');

module.exports = {
	VERIFY_TOKEN: BOT_VERIFY_TOKEN,
	PAGE_ACCESS_TOKEN: PAGE_ACCESS_TOKEN_FOR_BOT,
	sslOpts: {
		'key': fs.readFileSync(PATH_TO_PRIVATE_KEY),
		'cert': fs.readFileSync(PATH_TO_CERT)
	},
	perspective: {
		URL: 'https://commentanalyzer.googleapis.com/$discovery/rest?version=v1alpha1',
		KEY: API_KEY
	}
};
