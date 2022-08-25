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

    function _setMinimumVotes(string memory method, uint m) internal
    {
        Ms[method] = m;
    }

    function _getMinimumVotes(string memory method) internal view returns (uint)
    {
        return Ms[method];
    }

    function _registerVote(string memory method, address subject) internal
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

    function _isConsensusAchieved(string memory method, address subject) internal view returns(bool)
    {
        if (votes[method][subject].length < Ms[method])
        {
            return false;
        }

        return true;
    }

    function _resetConsensus(string memory method, address subject) internal
    {
        delete votes[method][subject];
    }
}