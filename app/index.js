const { spawn } = require('child_process');

const express = require("express");

var bodyParser = require('body-parser');
const reddcoin = require("./reddcoin");
const app = express();

let static = express.static(`${__dirname}/public`);
let notyStatic = express.static(`${__dirname}/node_modules/noty/lib`);
let swalStatic = express.static(`${__dirname}/node_modules/sweetalert2/dist`);

app.use(static);
app.use('/ext', notyStatic);
app.use('/ext', swalStatic);

app.get('/api/ping', (req, res) => {

	reddcoin.ping().then(() => {
		res.status(200).send(null);
	}).catch(() => {
		res.sendStatus(503);
	});

});

app.get('/api/home', (req, res) => {

	let commands = [
		reddcoin.cli("getbalance", false),
		reddcoin.cli("listaccounts"),
		reddcoin.cli("getstakinginfo"),
		reddcoin.cli("listtransactions"),
		reddcoin.cli("getblockchaininfo")
	];

	Promise.all(commands).then(([balance, accounts, staking, transactions, blockchain]) => {

		if(blockchain.verificationprogress < 0.99) {
			blockchain.indexing = true;
		}

		res.json({
			"balance": balance,
			"accounts": accounts,
			"staking": staking,
			"transactions": transactions,
			"blockchain": blockchain
		});

	}).catch((error) => {
		console.log('promise queue error', error);
		res.sendStatus(503);
	});

});

app.get('/api/gettransactions/:from', (req, res) => {

	let from = req.params.from;

	reddcoin.cli("listtransactions", true, ['"*"', 10, from]).then((transactions) => {
		res.json(transactions);
	}).catch((error) => {
		console.log('promise queue error', error);
		res.sendStatus(503);
	});

});

app.use(bodyParser.json());
app.post('/api/enable-staking', (req, res) => {

	let password = req.body.password;

	console.log(`password: ${password}`);
	reddcoin.cli("walletpassphrase", false, [password, (60*60*24*30), false], true).then((check) => {

		console.log(check);

		if(check) {

			setTimeout(() => {

				reddcoin.cli("getstakinginfo").then((response) => {
					res.json(response);
				});

			}, 1000);

		} else {
			res.json({
				"error": true
			});
		}

	});

	

});

app.listen(80, () => {
	reddcoin.launch();
    console.log('server is listening ...');
});

