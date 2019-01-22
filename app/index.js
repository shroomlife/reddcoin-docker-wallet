const { spawn } = require('child_process');

const express = require("express");
const reddcoin = require("./reddcoin");
const app = express();

let static = express.static(`${__dirname}/public`);
let notyStatic = express.static(`${__dirname}/node_modules/noty/lib`);

app.use(static);
app.use('/node_modules', notyStatic);

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

app.get('/api/blockchain/state', (req, res) => {



});

app.listen(80, () => {
	reddcoin.launch();
    console.log('server is listening ...');
});

