
var Test = require('../config/testConfig.js');

contract('Flight Surety Flight Tests', async (accounts) => {

  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);
    await config.flightSuretyData.authorizeContract(config.flightSuretyApp.address, { from: config.owner });
    await config.flightSuretyApp.registerAirline(config.airlines[0], { from: config.owner });
    await config.flightSuretyApp.fundAirline({ from: config.airlines[0], value: web3.utils.toWei('10', 'ether') });
  });

  it('(flight) cannot register flights if not operational airline', async () => {
    let now = new Date();
    let tomorrow = +now + 86400000;
    let tomorrowTimestamp = Math.floor(new Date(tomorrow) / 1000);
    const flightCode = "ABCW";

    let errorThrown = false;
    try {
      await config.flightSuretyApp.registerFlight(config.airlines[0], flightCode, tomorrowTimestamp, { from: config.airlines[1] });
    }
    catch(e) {
      errorThrown = true;
    }

    assert.equal(errorThrown, true, "Airline should not be able to register flight because it is not funded");
  });

  it('(flight) cannot register a flight in the past', async () => {
    let now = new Date();
    let yesterday = +now - 86400000;
    let yesterdayTimestamp = Math.floor(new Date(yesterday) / 1000);
    const flightCode = "ABCW";

    let errorThrown = false;
    try {
      await config.flightSuretyApp.registerFlight(config.airlines[0], flightCode, yesterdayTimestamp, { from: config.airlines[0] });
    }
    catch(e) {
      errorThrown = true;
    }
    
    assert.equal(errorThrown, true, "Past flights should not be registered");
  });

  it('(flight) cannot register a flight from non operational airlines', async () => {
    let now = new Date();
    let tomorrow = +now + 86400000;
    let tomorrowTimestamp = Math.floor(new Date(tomorrow) / 1000);
    const flightCode = "ABCW";

    let errorThrown = false;
    try {
      await config.flightSuretyApp.registerFlight(config.airlines[1], flightCode, tomorrowTimestamp, { from: config.airlines[0] });
    }
    catch(e) {
      errorThrown = true;
    }

    assert.equal(errorThrown, true, "Airline should not be able to register flight from non operational airlines");
  });

  it('(flight) can be registered', async () => {
    let now = new Date();
    let tomorrow = +now + 86400000;
    let tomorrowTimestamp = Math.floor(new Date(tomorrow) / 1000);
    const flightCode = "ABCW";

    await config.flightSuretyApp.registerFlight(config.airlines[0], flightCode, tomorrowTimestamp, { from: config.airlines[0] });
    const availableFlights = await config.flightSuretyApp.getAvailableFlights.call();
    
    assert.equal(availableFlights.length, 1, "Flight should be registered");
  });

});
