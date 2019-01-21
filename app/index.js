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
		res.sendStatus(200);
	}).catch(() => {
		res.sendStatus(503);
	});

});

app.get('/api/getbalance', (req, res) => {

	reddcoin.cli("getbalance").then((response) => {
		res.json({
			"balance": response
		});
	});
    
});
app.get('/api/listaccounts', (req, res) => {

	reddcoin.cli("listaccounts").then((response) => {
		response = JSON.parse(response);
		res.json({
			"accounts": response
		});
	});
    
});
app.get('/api/getstakinginfo', (req, res) => {

	reddcoin.cli("getstakinginfo").then((response) => {
		response = JSON.parse(response);
		res.json({
			"staking": response
		});
	});
    
});
app.get('/api/listtransactions', (req, res) => {

	reddcoin.cli("listtransactions").then((response) => {
		response = JSON.parse(response);
		res.json({
			"transactions": response
		});
	});
    
});

app.listen(80, () => {
	reddcoin.launch();
    console.log('server is listening ...');
});

