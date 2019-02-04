const { spawn } = require('child_process');
const fs = require('fs');
const uuid = require('uuid/v1');
const moment = require('moment');

const express = require("express");

var bodyParser = require('body-parser');
const reddcoin = require("./reddcoin");
const app = express();

let static = express.static(`${__dirname}/public`);
let notyStatic = express.static(`${__dirname}/node_modules/noty/lib`);
let swalStatic = express.static(`${__dirname}/node_modules/sweetalert2/dist`);

const globalCacheFile = `${__dirname}/data.json`;

let globalCache = {
	"reddcoin": {},
	"updated": moment(),
	"tokens": []
};

let cacheExists = fs.existsSync(globalCacheFile);
if(!cacheExists) {
	fs.writeFileSync(globalCacheFile, JSON.stringify(globalCache));
}

function writeToCache() {
	fs.writeFileSync(globalCacheFile, JSON.stringify(globalCache));
}

function readFromCache() {
	fs.readFileSync(globalCacheFile, (data) => {
		globalCache = JSON.parse(data);
	});
}

let authController = express.Router();

authController.use(bodyParser.json());
authController.post('/login', (req, res) => {

	let user = String(req.body.username);
	let pass = String(req.body.password);

	if(user === "robin" && pass == "kristina") {

		let token = uuid();

		globalCache.tokens.push(token);
		writeToCache();

		res.json({
			"authenticated": true,
			"token": token
		});

	} else {

		res.json({
			"authenticated": false
		});

	}

});

// auth handler
authController.use((req, res, next) => {

	if("token" in req.headers) {

		let token = req.headers.token;

		if(globalCache.tokens.indexOf(token) !== -1) {
			console.log(`authed: ${req.url}`);
			req.isAuthenticated = true;
		}

		next();

	} else {
		res.sendStatus(401);
	}

});

let appController = express.Router();

appController.get('/api/ping', (req, res) => {

	reddcoin.ping().then(() => {
		res.status(200).send(null);
	}).catch(() => {
		res.sendStatus(503);
	});

});

appController.get('/api/home', (req, res) => {

	let commands = [
		reddcoin.cli("getbalance", false),
		reddcoin.cli("listaccounts"),
		reddcoin.cli("getstakinginfo"),
		reddcoin.cli("listtransactions"),
		reddcoin.cli("getblockchaininfo"),
		reddcoin.getPrices()
	];

	Promise.all(commands).then(([balance, accounts, staking, transactions, blockchain, prices]) => {

		if(blockchain.verificationprogress < 0.99) {
			blockchain.indexing = true;
		}

		globalCache.reddcoin = {
			"balance": balance,
			"accounts": accounts,
			"staking": staking,
			"transactions": transactions,
			"blockchain": blockchain,
			"prices": prices
		};

		globalCache.updated = moment();

		fs.writeFile(globalCacheFile, JSON.stringify(globalCache), () => {
			res.json(globalCache.reddcoin);
		});

	}).catch((error) => {
		console.log('promise queue error', error);
		res.sendStatus(503);
	});

});

appController.get('/api/gettransactions/:from', (req, res) => {

	let from = Number(req.params.from);

	console.log("listtransactions", true, ['*', 10, from]);

	reddcoin.cli("listtransactions", true, ['*', 10, from]).then((transactions) => {
		res.json(transactions);
	}).catch((error) => {
		console.log('promise queue error', error);
		res.sendStatus(503);
	});

});

appController.use(bodyParser.json());
appController.post('/api/enable-staking', (req, res) => {

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

app.use(static);
app.use('/ext', notyStatic);
app.use('/ext', swalStatic);

// validate request
app.use(authController);

// check for validated request
app.use((req, res, next) => {

	if(req.isAuthenticated === true) {
		next();
	} else {
		res.sendStatus(401);
	}

});

app.use(appController);

app.listen(80, () => {
	reddcoin.launch();
    console.log('server is listening ...');
});
