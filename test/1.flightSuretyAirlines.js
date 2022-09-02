
var Test = require('../config/testConfig.js');

contract('Flight Surety Airline Tests', async (accounts) => {

  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);
    await config.flightSuretyData.authorizeContract(config.flightSuretyApp.address, { from: config.owner });
  });

  it('(airline) cannot register an Airline using registerAirline() if account is not funded', async () => {
    
    // ARRANGE
    let firstAirline = config.airlines[0];
    let newAirline = config.airlines[1];

    // ACT
    try {
        await config.flightSuretyApp.registerAirline(newAirline, {from: firstAirline});
    }
    catch(e) {

    }
    let result = await config.flightSuretyData.isAirlineRegistered.call(newAirline); 

    // ASSERT
    assert.equal(result, false, "Airline should not be able to register another airline if account hasn't provided funding");

  });

  it('(airline) cannot fund Airline if not registered', async () => {
    
    // ARRANGE
    let newAirline = config.airlines[1];
    let errorThrown = false;

    // ACT
    try {
        await config.flightSuretyApp.fundAirline({ from: newAirline, value: web3.utils.toWei('10', 'ether') });
    }
    catch(e) {
      errorThrown = true;
    }

    // ASSERT
    assert.equal(errorThrown, true, "Airline should not be able to fund account if it isn't registered");

  });

  it('(airline) can register another airline if owner', async () => {
    
    // ARRANGE
    let firstAirline = config.airlines[0];

    // ACT
    try {
      await config.flightSuretyApp.registerAirline(firstAirline, { from: config.owner });
    }
    catch(e) {

    }
    let result = await config.flightSuretyData.isAirlineRegistered.call(firstAirline); 

    // ASSERT
    assert.equal(result, true, "Owner should be able to register another airline");

  });

  it('(airline) cannot fund Airline if value below required', async () => {
    
    // ARRANGE
    let firstAirline = config.airlines[0];
    let errorThrown = false;

    // ACT
    try {
        await config.flightSuretyApp.fundAirline({ from: firstAirline, value: web3.utils.toWei('9', 'ether') });
    }
    catch(e) {
      errorThrown = true;
    }

    // ASSERT
    assert.equal(errorThrown, true, "Airline should not be able to fund account if value sent is below required");

  });

  it('(airline) can be funded', async () => {
    
    // ARRANGE
    let firstAirline = config.airlines[0];
    let errorThrown = false;

    // ACT
    try {
      await config.flightSuretyApp.fundAirline({ from: firstAirline, value: web3.utils.toWei('10', 'ether') });
    }
    catch(e) {
      console.log(e);
      errorThrown = true;
    }
    let isOperational = await config.flightSuretyData.isAirlineOperational.call(firstAirline, web3.utils.toWei('10', 'ether')); 

    // ASSERT
    assert.equal(errorThrown, false, "Airline should be able to fund account");
    assert.equal(isOperational, true, "Airline should be operational after funding account");

  });

  it('(airline) can register another airline if operational', async () => {
    
    // ARRANGE
    let firstAirline = config.airlines[0];
    let newAirline = config.airlines[1];

    // ACT
    try {
        await config.flightSuretyApp.registerAirline(newAirline, {from: firstAirline});
    }
    catch(e) {

    }
    let result = await config.flightSuretyData.isAirlineRegistered.call(newAirline); 

    // ASSERT
    assert.equal(result, true, "Funded airline should be able to register another airline");
  });

  it('(airline) needs multiparty consensus if more than 4 operational airlines', async () => {
    
    // ARRANGE
    let firstAirline = config.airlines[0];
    let secondAirline = config.airlines[1];
    let thirdAirline = config.airlines[2];
    let fourthAirline = config.airlines[3];
    let newAirline = config.airlines[4];
    
    await config.flightSuretyApp.registerAirline(thirdAirline, {from: firstAirline});
    await config.flightSuretyApp.registerAirline(fourthAirline, {from: firstAirline});

    await config.flightSuretyApp.fundAirline({ from: secondAirline, value: web3.utils.toWei('10', 'ether') });
    await config.flightSuretyApp.fundAirline({ from: thirdAirline, value: web3.utils.toWei('10', 'ether') });
    await config.flightSuretyApp.fundAirline({ from: fourthAirline, value: web3.utils.toWei('10', 'ether') });

    // ACT
    await config.flightSuretyApp.registerAirline(newAirline, {from: firstAirline});
    let resultAfterOneRegister = await config.flightSuretyData.isAirlineRegistered.call(newAirline); 

    await config.flightSuretyApp.registerAirline(newAirline, {from: secondAirline});
    let resultAfterSecondRegister = await config.flightSuretyData.isAirlineRegistered.call(newAirline); 

    // ASSERT
    assert.equal(resultAfterOneRegister, false, "Airline should not be registered before 50% of votes");
    assert.equal(resultAfterSecondRegister, true, "Airline should be registered after 50% of votes");
  });

  it('(airline) avoid multiple votes in multiparty consensus', async () => {
    
    // ARRANGE
    let firstAirline = config.airlines[0];
    let newAirline = config.airlines[5];

    let errorThrown = false;

    // ACT
    try {
      await config.flightSuretyApp.registerAirline(newAirline, {from: firstAirline});
      await config.flightSuretyApp.registerAirline(newAirline, {from: firstAirline});
    }
    catch(e) {
      errorThrown = true;
    }

    // ASSERT
    assert.equal(errorThrown, true, "Error should be thrown if same airline tries to vote twice in multiparty consensus");
  });
 

});
