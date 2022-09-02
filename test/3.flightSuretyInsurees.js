
var Test = require('../config/testConfig.js');

contract('Flight Surety Insuree Tests', async (accounts) => {

  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);
    await config.flightSuretyData.authorizeContract(config.flightSuretyApp.address, { from: config.owner });
    await config.flightSuretyApp.registerAirline(config.airlines[0], { from: config.owner });
    await config.flightSuretyApp.fundAirline({ from: config.airlines[0], value: web3.utils.toWei('10', 'ether') });
  });

  it('(flight) cannot buy insurance above 1 ether', async () => {
    let now = new Date();
    let tomorrow = +now + 86400000;
    let tomorrowTimestamp = Math.floor(new Date(tomorrow) / 1000);
    const flightCode = "ABCW";

    let errorThrown = false;
    try {
      await config.flightSuretyApp.buy(config.airlines[0], flightCode, tomorrowTimestamp, { from: config.insurees[0], value: web3.utils.toWei('2', 'ether') });
    }
    catch(e) {
      errorThrown = true;
    }

    assert.equal(errorThrown, true, "Insurance should not be allowed for values above 1 ether");
  });

  it('(flight) cannot buy insurance for non registered flight', async () => {
    let now = new Date();
    let tomorrow = +now + 86400000;
    let tomorrowTimestamp = Math.floor(new Date(tomorrow) / 1000);
    const flightCode = "ABCW";

    let errorThrown = false;
    try {
      await config.flightSuretyApp.buy(config.airlines[0], flightCode, tomorrowTimestamp, { from: config.insurees[0], value: web3.utils.toWei('1', 'ether') });
    }
    catch(e) {
      errorThrown = true;
    }

    assert.equal(errorThrown, true, "Insurance should not be allowed for non registered flight");
  });

  it('(flight) can buy insurance', async () => {
    let now = new Date();
    let tomorrow = +now + 86400000;
    let tomorrowTimestamp = Math.floor(new Date(tomorrow) / 1000);
    const flightCode = "ABCW";

    await config.flightSuretyApp.registerFlight(config.airlines[0], flightCode, tomorrowTimestamp, { from: config.airlines[0] });

    let errorThrown = false;
    try {
      await config.flightSuretyApp.buy(config.airlines[0], flightCode, tomorrowTimestamp, { from: config.insurees[0], value: web3.utils.toWei('1', 'ether') });
    }
    catch(e) {
        console.log(e);
      errorThrown = true;
    }

    assert.equal(errorThrown, false, "Insuree should be able to buy insurance");
  });

  it('(flight) can buy insurance twice', async () => {
    let now = new Date();
    let tomorrow = +now + 86400000;
    let tomorrowTimestamp = Math.floor(new Date(tomorrow) / 1000);
    const flightCode = "ABCW";

    let errorThrown = false;
    try {
      await config.flightSuretyApp.buy(config.airlines[0], flightCode, tomorrowTimestamp, { from: config.insurees[0], value: web3.utils.toWei('1', 'ether') });
    }
    catch(e) {
      errorThrown = true;
    }

    assert.equal(errorThrown, true, "Insurance should not be allowed twice");
  });
});
