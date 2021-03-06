require('dotenv').config();
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

const express = require("express");

var bodyParser = require('body-parser');
const reddcoin = require("./reddcoin");
const app = express();

let static = express.static(`${__dirname}/public`);
let notyStatic = express.static(`./node_modules/noty/lib`);
let swalStatic = express.static(`./node_modules/sweetalert2/dist`);

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

  if(user === process.env.USERNAME && pass == process.env.PASSWORD) {

    let token = uuidv4();

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

    res.json(globalCache.reddcoin);
    writeToCache();

  }).catch((error) => {
    console.error('ERROR: ', error);
    res.sendStatus(503);
  });

});

appController.get('/api/gettransactions/:from', (req, res) => {

  let from = Number(req.params.from);

  reddcoin.cli("listtransactions", true, ['*', 10, from]).then((transactions) => {
    res.json(transactions);
  }).catch((error) => {
    console.error('ERROR: ', error);
    res.sendStatus(503);
  });

});

appController.use(bodyParser.json());
appController.post('/api/enable-staking', (req, res) => {

  let password = req.body.password;
  reddcoin.cli("walletpassphrase", false, [password, (60*60*24*30), false], true).then((check) => {

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
  console.info('[MAIN] The server is listening on port 80 ...');
});
