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
	"endpoints": [],
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

	return res.json({"balance":"531680.16723035","accounts":{"":-6284370.34733244,"Test":0,"Twitter Donation":0,"cryptopia":3690725.22306792,"cryptopia withdraw":0,"cryptoplay.it":1801.20470007,"main":2962019.80945603,"shroomlife":161504.27733877,"spenden":0},"staking":{"enabled":true,"staking":false,"currentblocksize":1000,"currentblocktx":0,"pooledtx":0,"difficulty":94.35754378,"search-interval":0,"averageweight":290188,"totalweight":1160754,"netstakeweight":6754376078,"expectedtime":18446744073709552000},"transactions":[{"account":"cryptopia","address":"RYyetyAtwQJskMcAaK5E3Bq8JZXCtNw3QG","category":"stake","amount":64.86267319,"confirmations":44423,"generated":true,"blockhash":"bb0c0fa62dc081790a9b6ab1976d28c0f678d26baef1cfd141010a3d9015f4e3","blockindex":1,"blocktime":1546626402,"txid":"2b57a4464f3a553782d5beb231fbca0bc4103a45f3cf402ae67298696617a814","walletconflicts":[],"time":1546626402,"timereceived":1546626402},{"account":"cryptopia","address":"RYyetyAtwQJskMcAaK5E3Bq8JZXCtNw3QG","category":"stake","amount":239.33829751,"confirmations":28966,"generated":true,"blockhash":"3a8f1a97417eb415da1e5c487c10b9867f53e427b9106aa872675996804c44f5","blockindex":1,"blocktime":1547552972,"txid":"1cb534e52689d055b4c93f312760fa2eab4ed30546f57eb961ae09d5cdf04a1c","walletconflicts":[],"time":1547552972,"timereceived":1547552972},{"account":"main","address":"Rs1DPaa5bfjJjGrnXkgHHswTxnpg51Dkyr","category":"receive","amount":302270.72727273,"confirmations":24644,"blockhash":"97a1ee8c272773aebc8822517831fa35e47fd7ba381f46490837572e2c8a22c0","blockindex":2,"blocktime":1547814445,"txid":"e8bf0ed51234dad65fd7a82ea1986523441ead2a3b4592f4ab26757725765faf","walletconflicts":[],"time":1547814305,"timereceived":1547814305},{"account":"cryptopia","address":"RYyetyAtwQJskMcAaK5E3Bq8JZXCtNw3QG","category":"stake","amount":107.94337509,"confirmations":22026,"generated":true,"blockhash":"a28d14a28d04662b77404611fbfeea4f57de1030467ea41c77b1ff3a09cb18c5","blockindex":1,"blocktime":1547969979,"txid":"1745284077b65eedf1ef911b20a3ee2f3ab3b0090dc0590fe6797ec695d80dd2","walletconflicts":[],"time":1547969979,"timereceived":1547969979},{"account":"main","address":"Rs1DPaa5bfjJjGrnXkgHHswTxnpg51Dkyr","category":"stake","amount":176.62789347,"confirmations":17685,"generated":true,"blockhash":"f3f50ff8bd3c77c8ac997383143d659a409bedf31823b130c20b13b0558e3f2d","blockindex":1,"blocktime":1548226956,"txid":"474bec671832c27cf75f97b659d0ca7a2d73c888255475d56cfe0d7ea3e0a9a7","walletconflicts":[],"time":1548226956,"timereceived":1548226956},{"account":"cryptopia","address":"RYyetyAtwQJskMcAaK5E3Bq8JZXCtNw3QG","category":"stake","amount":94.91846428,"confirmations":15812,"generated":true,"blockhash":"883ab25d30560528d17246e8ad3873eb152665855cc2c700bf374265f24acea0","blockindex":1,"blocktime":1548343243,"txid":"55ecd92d87269cdd7141958451aa340c093ac2e19923610a4924d378db05fae4","walletconflicts":[],"time":1548343243,"timereceived":1548343244},{"account":"main","address":"Rs1DPaa5bfjJjGrnXkgHHswTxnpg51Dkyr","category":"stake","amount":431.26931469,"confirmations":12692,"generated":true,"blockhash":"005c701164523bb40d1a12443e71d776b7268faf632a888180ea8a03a1278a94","blockindex":1,"blocktime":1548534172,"txid":"eecd8f310da2020e7c21c1982a8df81c50d32991c32410e8509687a79fadce79","walletconflicts":["334bc8a24f6e70869128442a8fbd0518c0cc4ae67f3c5fbfe152bd0dc3dd7d93"],"time":1548534233,"timereceived":1548534233},{"account":"main","address":"Rs1DPaa5bfjJjGrnXkgHHswTxnpg51Dkyr","category":"stake","amount":94.83810669,"confirmations":9759,"generated":true,"blockhash":"87e0c803c251122259d4f8b532b501f3999588ca8df3363129d01168f1a3d313","blockindex":1,"blocktime":1548709361,"txid":"b184433cb2e6c1db99432aa575b964633c4f13f1448cdfdef9863350b830ca84","walletconflicts":["282125c3ef26d28fe4ad43760c576f7ab8f444fbb1f99430eb61f938d8b72823"],"time":1548709432,"timereceived":1548709432},{"account":"main","address":"Rs1DPaa5bfjJjGrnXkgHHswTxnpg51Dkyr","category":"stake","amount":260.45413589,"confirmations":3084,"generated":true,"blockhash":"c1e3e177b13692a05680cd03018c53a1c7779ce4b8cd5a2d22311c8e9f83cd71","blockindex":1,"blocktime":1549110756,"txid":"f698841a0b5e5bf1f93c162b3fdb7f085eeff5d2bf3174b7d54afa067bef681c","walletconflicts":[],"time":1549110756,"timereceived":1549110756},{"account":"cryptopia","address":"RYyetyAtwQJskMcAaK5E3Bq8JZXCtNw3QG","category":"stake","amount":212.2513565,"confirmations":2644,"generated":true,"blockhash":"29d0108e3f3f51d3de95d26fb48fa240122bc0e516e2c390b1e46db87ccc69b5","blockindex":1,"blocktime":1549135898,"txid":"a0da9d8dc28d82725791179dc8817ea4aea331e1c8a9187ebb57bc16c1abaead","walletconflicts":[],"time":1549135898,"timereceived":1549135898}],"blockchain":{"chain":"main","blocks":2619962,"bestblockhash":"767798b3331650d9b7667971e4df4666fa1aa4a3e68ee330255a38cca887e97e","difficulty":94.35754378,"verificationprogress":0.99999985,"chainwork":"000000000000000000000000000000000000000000000000139f733ee0cb03ae"},"prices":{"status":{"timestamp":"2019-02-04T17:03:57.075Z","error_code":0,"error_message":null,"elapsed":10,"credit_count":1},"data":{"RDD":{"id":118,"name":"ReddCoin","symbol":"RDD","slug":"reddcoin","circulating_supply":28808713173.7887,"total_supply":28808713173.7887,"max_supply":null,"date_added":"2014-02-10T00:00:00.000Z","num_market_pairs":19,"tags":[],"platform":null,"cmc_rank":81,"last_updated":"2019-02-04T17:03:00.000Z","quote":{"EUR":{"price":0.0010291549307325414,"volume_24h":92695.95723115242,"percent_change_1h":-1.1893,"percent_change_24h":-3.6368,"percent_change_7d":-6.4217,"market_cap":29648629.21086416,"last_updated":"2019-02-04T17:03:00.000Z"}}}}}});

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

		res.json(globalCache.reddcoin);
		writeToCache();

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

appController.post('/api/enable-notifications', (req, res) => {
	
	console.log(req.body);
	if("endpoint" in req.body) {
		globalCache.endpoints.push(req.body.endpoint);
		writeToCache();
		res.sendStatus(200);
	} else {
		res.sendStatus(500);
	}

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
