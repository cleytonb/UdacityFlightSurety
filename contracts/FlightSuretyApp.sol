// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./FlightSuretyData.sol";
import "./MultipartyConsensus.sol";

contract FlightSuretyApp is Pausable, Ownable, MultipartyConsensus {
    using SafeMath for uint256;

    FlightSuretyData dataContract;

    constructor(address _dataContract)
    {
        dataContract = FlightSuretyData(payable(_dataContract));
    }

    // region Operating Status

    function setPaused(bool paused) external onlyOwner 
    {
        if (paused)
        {
            _pause();
        }
        else
        {
            _unpause();
        }
    }

    // endregion
    
    // region Airlines

    uint256 private constant REQUIRED_FUNDS = 10 ether;
    uint256 fundedAirlinesCount;

    function registerAirline(address airlineAddress) external whenNotPaused returns(bool success, uint256 votes) 
    {
        require(msg.sender == owner() || dataContract.isAirlineOperational(msg.sender, REQUIRED_FUNDS) == true, "Only operational airlines can register new airlines");

        if (fundedAirlinesCount < 4)
        {
            dataContract.registerAirline(airlineAddress);
            _setMinimumVotes('registerAirline', fundedAirlinesCount / 2);
        }
        else
        {
            _registerVote('registerAirline', airlineAddress);
            if (_isConsensusAchieved('registerAirline', airlineAddress)) {
                dataContract.registerAirline(airlineAddress);
                _setMinimumVotes('registerAirline', fundedAirlinesCount / 2);
                _resetConsensus('registerAirline', airlineAddress);
            }
        }
        return (success, 0);
    }

    function fundAirline() public payable whenNotPaused
    {
        require(dataContract.isAirlineRegistered(msg.sender) == true, "Airline not registered");
        require(msg.value >= REQUIRED_FUNDS, "At least 10 ether is necessary to fund");

        dataContract.fundAirline();
        fundedAirlinesCount = fundedAirlinesCount.add(1);        
    }

    // endregion

    // region Flights

    uint8 private constant STATUS_CODE_UNKNOWN = 0;
    uint8 private constant STATUS_CODE_ON_TIME = 10;
    uint8 private constant STATUS_CODE_LATE_AIRLINE = 20;
    uint8 private constant STATUS_CODE_LATE_WEATHER = 30;
    uint8 private constant STATUS_CODE_LATE_TECHNICAL = 40;
    uint8 private constant STATUS_CODE_LATE_OTHER = 50;
  
    function registerFlight(address airline, string memory flight, uint256 timestamp) external whenNotPaused
    {
        require(timestamp > block.timestamp, "Only future flights can be registered");
        require(dataContract.isAirlineOperational(airline, REQUIRED_FUNDS) == true, "Only flights from operational airlines can be registered");

        dataContract.registerFlight(airline, flight, timestamp);
    }

    function getAvailableFlights() external view returns (FlightSuretyData.Flight[] memory) {
        return dataContract.getAvailableFlights();
    }

    function fetchFlightStatus(address airline, string memory flight, uint256 timestamp) external whenNotPaused
    {
        uint8 index = getRandomIndex(msg.sender);

        // Generate a unique key for storing the request
        bytes32 key = keccak256(abi.encodePacked(index, airline, flight, timestamp));
        ResponseInfo storage responseInfo = oracleResponses[key];   
        responseInfo.requester = msg.sender;
        responseInfo.isOpen = true;

        emit OracleRequest(index, airline, flight, timestamp);
    }
    
    function processFlightStatus(address airline, string memory flight, uint256 timestamp, uint8 statusCode) internal whenNotPaused
    {
        bytes32 key = getFlightKey(airline, flight, timestamp);

        ResponseInfo storage responseInfo = oracleResponses[key];
        responseInfo.isOpen = false;

        dataContract.updateFlight(airline, flight, timestamp, statusCode);

        if (statusCode == STATUS_CODE_LATE_AIRLINE) {
            dataContract.creditInsurees(airline, flight, timestamp, 150);
        }
    }

    // endregion
    
    // region Insurees

    function buy(address airline, string memory flight, uint256 timestamp) external payable whenNotPaused
    {
        require(msg.value <= 1 ether, "The maximum value that can be insured is 1 ether");

        dataContract.buyInsurance(airline, flight, timestamp);
    }

    function getAvailableCredit() external view returns(uint256) {
        return dataContract.getAvailableCredit();
    }

    function withdrawCredit() external whenNotPaused
    {
        dataContract.withdrawCredit();
    }

    // endregion

// region ORACLE MANAGEMENT

    // Incremented to add pseudo-randomness at various points
    uint8 private nonce = 0;    

    // Fee to be paid when registering oracle
    uint256 public constant REGISTRATION_FEE = 1 ether;

    // Number of oracles that must respond for valid status
    uint256 private constant MIN_RESPONSES = 3;


    struct Oracle {
        bool isRegistered;
        uint8[3] indexes;        
    }

    // Track all registered oracles
    mapping(address => Oracle) private oracles;

    // Model for responses from oracles
    struct ResponseInfo {
        address requester;                              // Account that requested status
        bool isOpen;                                    // If open, oracle responses are accepted
        mapping(uint8 => address[]) responses;          // Mapping key is the status code reported
                                                        // This lets us group responses and identify
                                                        // the response that majority of the oracles
    }

    // Track all oracle responses
    // Key = hash(index, flight, timestamp)
    mapping(bytes32 => ResponseInfo) private oracleResponses;

    // Event fired each time an oracle submits a response
    event FlightStatusInfo(address airline, string flight, uint256 timestamp, uint8 status);

    event OracleReport(address airline, string flight, uint256 timestamp, uint8 status);

    // Event fired when flight status request is submitted
    // Oracles track this and if they have a matching index
    // they fetch data and submit a response
    event OracleRequest(uint8 index, address airline, string flight, uint256 timestamp);


    // Register an oracle with the contract
    function registerOracle() external payable
    {
        // Require registration fee
        require(msg.value >= REGISTRATION_FEE, "Registration fee is required");

        uint8[3] memory indexes = generateIndexes(msg.sender);

        oracles[msg.sender] = Oracle({
                                        isRegistered: true,
                                        indexes: indexes
                                    });
    }

    function getMyIndexes() view external returns(uint8[3] memory)
    {
        require(oracles[msg.sender].isRegistered, "Not registered as an oracle");

        return oracles[msg.sender].indexes;
    }




    // Called by oracle when a response is available to an outstanding request
    // For the response to be accepted, there must be a pending request that is open
    // and matches one of the three Indexes randomly assigned to the oracle at the
    // time of registration (i.e. uninvited oracles are not welcome)
    function submitOracleResponse(uint8 index, address airline, string memory flight, uint256 timestamp, uint8 statusCode) external
    {
        require((oracles[msg.sender].indexes[0] == index) || (oracles[msg.sender].indexes[1] == index) || (oracles[msg.sender].indexes[2] == index), "Index does not match oracle request");


        bytes32 key = keccak256(abi.encodePacked(index, airline, flight, timestamp)); 
        require(oracleResponses[key].isOpen, "Flight or timestamp do not match oracle request");

        oracleResponses[key].responses[statusCode].push(msg.sender);

        // Information isn't considered verified until at least MIN_RESPONSES
        // oracles respond with the *** same *** information
        emit OracleReport(airline, flight, timestamp, statusCode);
        if (oracleResponses[key].responses[statusCode].length >= MIN_RESPONSES) {

            emit FlightStatusInfo(airline, flight, timestamp, statusCode);

            // Handle flight status as appropriate
            processFlightStatus(airline, flight, timestamp, statusCode);
        }
    }


    function getFlightKey(address airline, string memory flight, uint256 timestamp) pure internal returns(bytes32) 
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    // Returns array of three non-duplicating integers from 0-9
    function generateIndexes(address account) internal returns(uint8[3] memory)
    {
        uint8[3] memory indexes;
        indexes[0] = getRandomIndex(account);
        
        indexes[1] = indexes[0];
        while(indexes[1] == indexes[0]) {
            indexes[1] = getRandomIndex(account);
        }

        indexes[2] = indexes[1];
        while((indexes[2] == indexes[0]) || (indexes[2] == indexes[1])) {
            indexes[2] = getRandomIndex(account);
        }

        return indexes;
    }

    // Returns array of three non-duplicating integers from 0-9
    function getRandomIndex(address account) internal returns (uint8)
    {
        uint8 maxValue = 10;

        // Pseudo random number...the incrementing nonce adds variation
        uint8 random = uint8(uint256(keccak256(abi.encodePacked(blockhash(block.number - nonce++), account))) % maxValue);

        if (nonce > 250) {
            nonce = 0;  // Can only fetch blockhashes for last 256 blocks so we adapt
        }

        return random;
    }

// endregion

}   
