// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract FlightSuretyData is Ownable, Pausable {
    using SafeMath for uint256;

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

    // region Authorized Contracts

    mapping(address => bool) authorizedContracts;

    modifier onlyAuthorizedContract()
    {
        require(authorizedContracts[msg.sender] == true, "Caller is not authorized");
        _;
    }

    function authorizeContract(address contractAddress) external whenNotPaused onlyOwner
    {
        authorizedContracts[contractAddress] = true;
    }

    function deauthorizeContract(address contractAddress) external whenNotPaused onlyOwner
    {
        delete authorizedContracts[contractAddress];
    }

    // endregion

    // region Airlines

    struct Airline {
        bool isRegistered;
        uint256 fundedAmount;
    }

    mapping(address => Airline) airlines;
    
    function registerAirline(address airlineAddress) external whenNotPaused onlyAuthorizedContract
    {
        airlines[airlineAddress].isRegistered = true;
    }

    function fundAirline(address airlineAddress) external payable whenNotPaused onlyAuthorizedContract
    {
        require(airlines[airlineAddress].isRegistered == true, "Airline not registered");

        airlines[airlineAddress].fundedAmount = airlines[airlineAddress].fundedAmount.add(msg.value);
    }

    function isAirlineRegistered(address airlineAddress) external view returns(bool)
    {
        return airlines[airlineAddress].isRegistered;
    }

    function isAirlineOperational(address airlineAddress, uint256 requiredFunds) external view returns(bool)
    {
        if (airlines[airlineAddress].isRegistered == false)
            return false;

        if (airlines[airlineAddress].fundedAmount < requiredFunds)
            return false;
        
        return true;
    }

    function getAirline(address airlineAddress) external view returns(Airline memory)
    {
        return airlines[airlineAddress];
    }

    // endregion

    // region Flights

    uint8 private constant STATUS_CODE_UNKNOWN = 0;
    uint8 private constant STATUS_CODE_ON_TIME = 10;
    uint8 private constant STATUS_CODE_LATE_AIRLINE = 20;
    uint8 private constant STATUS_CODE_LATE_WEATHER = 30;
    uint8 private constant STATUS_CODE_LATE_TECHNICAL = 40;
    uint8 private constant STATUS_CODE_LATE_OTHER = 50;

    struct Flight {
        bool isRegistered;
        string flightCode;
        uint8 statusCode;
        uint256 updatedTimestamp;        
        address airline;
    }
    bytes32[] flightsKeys;
    mapping(bytes32 => Flight) flights;

    function registerFlight(address airline, string memory flight, uint256 timestamp) external whenNotPaused onlyAuthorizedContract
    {
        require(timestamp > block.timestamp, "Only future flights can be registered");

        bytes32 key = getFlightKey(airline, flight, timestamp);
        require(flights[key].isRegistered == false, "Flight already registered");

        flights[key] = Flight(
            true,
            flight,
            STATUS_CODE_UNKNOWN,
            timestamp,
            airline
        );
        flightsKeys.push(key);
    }
    
    function updateFlight(address airline, string memory flight, uint256 timestamp, uint8 statusCode) external whenNotPaused onlyAuthorizedContract
    {
        bytes32 key = getFlightKey(airline, flight, timestamp);
        require(flights[key].isRegistered == true, "Flight not found");

        flights[key].statusCode = statusCode;
        flights[key].updatedTimestamp = timestamp;
    }

    function getAvailableFlights() external view returns (Flight[] memory)
    {
        Flight[] memory result = new Flight[](flightsKeys.length);
        
        for (uint c = 0; c < flightsKeys.length; c++) {
            bytes32 flightKey = flightsKeys[c];
            Flight storage flight = flights[flightKey];

            result[c] = flight;
        }

        return result;
    }

    function getFlightKey(address airline, string memory flight, uint256 timestamp) private pure returns(bytes32) 
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    // endregion

    // region Insurees
    struct Insurance {
        uint value;
        bool completed;
    }

    mapping(bytes32 => mapping(address => Insurance)) insurances;
    mapping(bytes32 => address[]) insurees;
    mapping(address => uint) credits;

    function buyInsurance(address airline, string memory flight, uint256 timestamp) external payable whenNotPaused onlyAuthorizedContract
    {
        bytes32 flightKey = getFlightKey(airline, flight, timestamp);

        require(insurances[flightKey][msg.sender].value == 0, "Insurance has already been bought");
        require(flights[flightKey].isRegistered == true, "Flight not registered");
        require(flights[flightKey].statusCode <= STATUS_CODE_ON_TIME, "Flight is not on time");

        insurances[flightKey][msg.sender].value = msg.value;
        insurees[flightKey].push(msg.sender);
    }

    function creditInsurees(address airline, string memory flight, uint256 timestamp, uint256 creditPercent) external whenNotPaused onlyAuthorizedContract
    {
        bytes32 flightKey = getFlightKey(airline, flight, timestamp);

        for (uint c = 0; c < insurees[flightKey].length; c++) 
        {
            Insurance memory insurance = insurances[flightKey][msg.sender];
            if (insurance.completed == false) {
                insurance.completed = true;
                credits[msg.sender] = credits[msg.sender].add(insurance.value.mul(creditPercent).div(100));
            }
        }
    }

    function getAvailableCredit() external view returns(uint256) {
        return credits[msg.sender];
    }

    function withdrawCredit() external whenNotPaused onlyAuthorizedContract
    {
        require(credits[msg.sender] > 0, "No credit available to withdraw");

        credits[msg.sender] = 0;

        payable(msg.sender).transfer(credits[msg.sender]);
    }

    // endregion

    receive() external payable
    {   
        revert();
    }
}

