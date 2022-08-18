import { readFile } from 'fs/promises';
import Web3 from 'web3';
import express from 'express';

const FlightSuretyApp = JSON.parse(await readFile('build/contracts/FlightSuretyApp.json'));
const Config = JSON.parse(await readFile('src/server/config.json'));


let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
web3.eth.defaultAccount = web3.eth.accounts[0];
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);


flightSuretyApp.events.OracleRequest({
    fromBlock: 0
  }, function (error, event) {
    if (error) console.log(error);
    console.log(event);
});

const app = express();
app.get('/api', (req, res) => {
    res.send({
      message: 'An API for use with your Dapp!'
    });
});

export default app;


