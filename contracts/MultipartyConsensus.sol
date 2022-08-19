// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

contract MultipartyConsensus {
    mapping(string => uint) Ms;
    mapping(string => mapping(address => address[])) votes;

    struct Votes
    {
        uint total;
        mapping(address => bool) addresses;
    }

    function setMinimumVotes(string memory method, uint m) public
    {
        Ms[method] = m;
    }

    function getMinimumVotes(string memory method) public view returns (uint)
    {
        return Ms[method];
    }

    function registerVote(string memory method, address subject) public
    {
        bool isDuplicate = false;
        for (uint c = 0; c < votes[method][subject].length; c++) {
            if (votes[method][subject][c] == msg.sender) {
                isDuplicate = true;
                break;
            }
        }
        require(isDuplicate == false, "Vote already registered");

        votes[method][subject].push(msg.sender);
    }

    function isConsensusAchieved(string memory method, address subject) public view returns(bool)
    {
        if (votes[method][subject].length < Ms[method])
        {
            return false;
        }

        return true;
    }

    function resetConsensus(string memory method, address subject) public
    {
        delete votes[method][subject];
    }
}