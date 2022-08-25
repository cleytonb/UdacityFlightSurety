// var MultipartyConsensus = artifacts.require("MultipartyConsensus");

// contract('MultipartyConsensus', async (accounts) => {

//     var instance;

//     before(async () => {
//         instance = await MultipartyConsensus.new();
//     });

//     it('registers Ms correctly', async () => {
//         const methodName1 = 'testMethod1';
//         const methodName2 = 'testMethod2';

//         await instance.setMinimumVotes(methodName1, 2);
//         const M1 = await instance.getMinimumVotes.call(methodName1);

//         await instance.setMinimumVotes(methodName2, 3);
//         const M2 = await instance.getMinimumVotes.call(methodName2);

//         assert.equal(M1, 2, 'M1 should be equal to 2');
//         assert.equal(M2, 3, 'M2 should be equal to 3');
//     });

//     it('correctly resets consensus state', async () => {
//         const methodName = 'testMethod3';
//         const subject = accounts[5];

//         await instance.setMinimumVotes(methodName, 2);

//         await instance.registerVote(methodName, subject, { from: accounts[0] });
//         await instance.registerVote(methodName, subject, { from: accounts[1] });
//         await instance.resetConsensus(methodName, subject, { from: accounts[0] });
//         const expectedFalse = await instance.isConsensusAchieved.call(methodName, subject);

//         assert.equal(expectedFalse, false, "Prosecute shouldn't return true on first vote");
//     });

//     it('only allow prosecute if minimum votes were registered', async () => {
//         const methodName = 'testMethod3';
//         const subject = accounts[5];

//         await instance.setMinimumVotes(methodName, 2);

//         await instance.registerVote(methodName, subject, { from: accounts[0] });
//         const expectedFalse = await instance.isConsensusAchieved.call(methodName, subject);

//         await instance.registerVote(methodName, subject, { from: accounts[1] });
//         const expectedTrue = await instance.isConsensusAchieved.call(methodName, subject);

//         await instance.resetConsensus(methodName, subject, { from: accounts[0] });

//         assert.equal(expectedFalse, false, "Prosecute shouldn't return true on first vote");
//         assert.equal(expectedTrue, true, "Prosecute should return true on second vote");
//     });

//     it('only allow one vote per adddress', async () => {
//         const methodName = 'testMethod4';
//         const subject = accounts[5];

//         await instance.setMinimumVotes(methodName, 2);

//         await instance.registerVote(methodName, subject, { from: accounts[0] });

//         var exceptionThrown = false;
//         try {
//             await instance.registerVote(methodName, subject, { from: accounts[0] });
//         } catch(e) {
//             exceptionThrown = true;
//         }

//         assert.equal(exceptionThrown, true, "Second vote registered without error");
//     });
// });