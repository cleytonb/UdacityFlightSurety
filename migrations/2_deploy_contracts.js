const MultipartyConsensus = artifacts.require("MultipartyConsensus");
const FlightSuretyApp = artifacts.require("FlightSuretyApp");
const FlightSuretyData = artifacts.require("FlightSuretyData");
const fs = require('fs').promises;

module.exports = async function(deployer, _, accounts)
{
    await deployer.deploy(MultipartyConsensus);
    await deployer.deploy(FlightSuretyData);
    await deployer.deploy(FlightSuretyApp, FlightSuretyData.address);

    const dataInstance = await FlightSuretyData.deployed();
    const appInstance = await FlightSuretyApp.deployed();
    
    await dataInstance.authorizeContract(FlightSuretyApp.address);
    await appInstance.registerAirline(accounts[1], { from: accounts[0] });
    let config = {
        localhost: {
            url: 'http://localhost:8545',
            dataAddress: FlightSuretyData.address,
            appAddress: FlightSuretyApp.address
        }
    }
    await fs.writeFile(__dirname + '/../src/dapp/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
    await fs.writeFile(__dirname + '/../src/server/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
}