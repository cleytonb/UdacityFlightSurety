import FlightSuretyApp from "../../build/contracts/FlightSuretyApp.json";
import Config from "./config.json";
import Web3 from "web3/dist/web3.min";

const config = Config["localhost"];
const web3 = new Web3(new Web3.providers.WebsocketProvider(config.url));
const flightSuretyApp = new web3.eth.Contract(
  FlightSuretyApp.abi,
  config.appAddress
);

window.flightSuretyApp = flightSuretyApp;
flightSuretyApp.events.Paused()
.on('data', event => console.log(event))
.on('changed', changed => console.warn(changed))
.on('error', err => console.error(err))
.on('connected', str => console.info(str))

export default {
  async getAccounts() {
    return await web3.eth.getAccounts();
  },
  async getOperatingStatus(account) {
    return await flightSuretyApp.methods.paused().call({ from: account });
  },
  async setPaused(account, paused) {
    return await flightSuretyApp.methods.setPaused(paused).send({ from: account });
  }
};

// export default class Contract {
//     constructor(network, callback) {

//         let config = Config[network];
//         this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
//         this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
//         this.initialize(callback);
//         this.owner = null;
//         this.airlines = [];
//         this.passengers = [];
//     }

//     initialize(callback) {
//         this.web3.eth.getAccounts((error, accts) => {

//             this.owner = accts[0];

//             let counter = 1;

//             while(this.airlines.length < 5) {
//                 this.airlines.push(accts[counter++]);
//             }

//             while(this.passengers.length < 5) {
//                 this.passengers.push(accts[counter++]);
//             }

//             callback();
//         });
//     }

//     isOperational(callback) {
//        let self = this;
//        self.flightSuretyApp.methods
//             .isOperational()
//             .call({ from: self.owner}, callback);
//     }

//     fetchFlightStatus(flight, callback) {
//         let self = this;
//         let payload = {
//             airline: self.airlines[0],
//             flight: flight,
//             timestamp: Math.floor(Date.now() / 1000)
//         }
//         self.flightSuretyApp.methods
//             .fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
//             .send({ from: self.owner}, (error, result) => {
//                 callback(error, payload);
//             });
//     }
// }
