
var FlightSuretyApp = artifacts.require("FlightSuretyApp");
var FlightSuretyData = artifacts.require("FlightSuretyData");
var BigNumber = require('bignumber.js');

var Config = async function(accounts) {
    let owner = accounts[0];
    let airlines = [
        accounts[1],
        accounts[2],
        accounts[3],
        accounts[4],
        accounts[5]
    ];
    
    let insurees = [
        accounts[6],
        accounts[7],
        accounts[8]
    ]

    let flightSuretyData = await FlightSuretyData.new();
    let flightSuretyApp = await FlightSuretyApp.new(flightSuretyData.address);

    
    return {
        owner: owner,
        airlines: airlines,
        insurees: insurees,
        weiMultiple: (new BigNumber(10)).pow(18),
        flightSuretyData: flightSuretyData,
        flightSuretyApp: flightSuretyApp
    }
}

module.exports = {
    Config: Config
};