
var Test = require('../config/testConfig.js');

contract('Flight Surety Pausable Tests', async (accounts) => {

  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);
    await config.flightSuretyData.authorizeContract(config.flightSuretyApp.address, { from: config.owner });
  });

  it(`(data) has correct initial paused() value`, async function () {

    // Get operating status
    let status = await config.flightSuretyData.paused.call();
    assert.equal(status, false, "Incorrect initial operating status value");

  });

  it(`(data) can block access to setPaused() for non-Contract Owner account`, async function () {

      // Ensure that access is denied for non-Contract Owner account
      let accessDenied = false;
      try 
      {
          await config.flightSuretyData.setPaused(true, { from: config.testAddresses[2] });
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, true, "Access not restricted to Contract Owner");
            
  });

  it(`(data) can allow access to setPaused() for Contract Owner account`, async function () {

      // Ensure that access is allowed for Contract Owner account
      let accessDenied = false;
      try 
      {
          await config.flightSuretyData.setPaused(true, { from: config.owner });
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, false, "Access not restricted to Contract Owner");
      
      await config.flightSuretyData.setPaused(false, { from: config.owner });
  });

  it(`(data) can block access to functions using whenNotPaused when operating status is false`, async function () {

      await config.flightSuretyData.setPaused(true, { from: config.owner });

      let reverted = false;
      try 
      {
          await config.flightSuretyData.authorizeContract(config.testAddresses[2]);
      }
      catch(e) {
          reverted = true;
      }
      assert.equal(reverted, true, "Access not blocked for requireIsOperational");      

      await config.flightSuretyData.setPaused(false, { from: config.owner });
  }); 

  it(`(app) has correct initial paused() value`, async function () {

    // Get operating status
    let status = await config.flightSuretyApp.paused.call();
    assert.equal(status, false, "Incorrect initial operating status value");

  });

  it(`(app) can block access to setPaused() for non-Contract Owner account`, async function () {

      // Ensure that access is denied for non-Contract Owner account
      let accessDenied = false;
      try 
      {
          await config.flightSuretyApp.setPaused(true, { from: config.testAddresses[2] });
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, true, "Access not restricted to Contract Owner");
            
  });

  it(`(app) can allow access to setPaused() for Contract Owner account`, async function () {

      // Ensure that access is allowed for Contract Owner account
      let accessDenied = false;
      try 
      {
          await config.flightSuretyApp.setPaused(true, { from: config.owner });
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, false, "Access not restricted to Contract Owner");
      
      await config.flightSuretyApp.setPaused(false, { from: config.owner });
  });

  it(`(data) can block access to functions using whenNotPaused when operating status is false`, async function () {

      await config.flightSuretyApp.setPaused(true, { from: config.owner });

      let reverted = false;
      try 
      {
        await config.flightSuretyApp.fundAirline(newAirline, {from: config.firstAirline, value: web3.utils.toWei("1", "ether")});
      }
      catch(e) {
          reverted = true;
      }
      assert.equal(reverted, true, "Access not blocked for requireIsOperational");      

      await config.flightSuretyApp.setPaused(false, { from: config.owner });
  }); 

});
