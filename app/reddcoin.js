const { spawn } = require('child_process');
const request = require('request');

let reddcoind = null;

function execute(command, json = true, args = [], bool = false) {

	args.unshift(command);

	return new Promise((resolve, reject) => {

		let data = "";
		let execute = spawn('reddcoin-cli', args);

		execute.stderr.on('data', (error) => {
			console.log("error data", String(error));
			reject(false);
		});

		execute.stdout.on('data', (response) => {

			if(bool) {
				resolve(false);
			} else {

				if(Buffer.isBuffer(response)) {
					data += response.toString();
				} else {
					data += response;
				}

			}

			
		});
		execute.on('exit', () => {

			if(bool) {
				resolve(true);
			} else {

				data = data.trim();

				if(json) {
					try {
						data = JSON.parse(data);
					} catch(error) {}
				}
	
				resolve(data);

			}

			

		});

	});

}

function getPrices() {
	
	// 79ed2d2b-dcc7-45fa-8074-f30fc5289bcc

	return new Promise((resolve, reject) => {

		request("https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=RDD&convert=EUR", {
			"json": true,
			"headers": {
				"X-CMC_PRO_API_KEY": "79ed2d2b-dcc7-45fa-8074-f30fc5289bcc"
			}
		}, (err, res, body) => {

			if(err) {
				reject();
			} else {
				resolve(body);
			}

		});

	});

}

function ping() {

	return new Promise((resolve, reject) => {

		let execute = spawn('reddcoin-cli', [ 'ping' ]);

		execute.stdout.on('data', reject);
		execute.stderr.on('data', reject);
		execute.on('exit', resolve);

	});
}

function launch() {
	reddcoind = spawn('reddcoind');
}

module.exports = {
	"launch": launch,
	"cli": execute,
	"ping": ping,
	"getPrices": getPrices
};