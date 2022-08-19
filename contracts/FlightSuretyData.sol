// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    address private contractOwner;                                      // Account used to deploy contract
    bool private operational = true;                                    // Blocks all state changes throughout the contract if false

    mapping(address => bool) authorizedContracts;

    struct Airline {
        bool registered;
        bool funded;
    }

    uint256 public fundedAirlinesCount;
    mapping(address => Airline) airlines;

    struct Insurance {
        uint256 valueDeposited;
        uint256 availableCredit;
    }

    mapping(address => mapping(string => Insurance)) insurances;

    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/


    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor() 
    {
        contractOwner = msg.sender;
        operational = true;
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in 
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational() 
    {
        require(operational, "Contract is currently not operational");
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    modifier requireAuthorizedContract()
    {
        require(authorizedContracts[msg.sender] == true, "Caller is not authorized");
        _;
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
    * @dev Get operating status of contract
    *
    * @return A bool that is the current operating status
    */      
    function isOperational() public view returns(bool) 
    {
        return operational;
    }

    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */    
    function setOperatingStatus(bool mode) external requireContractOwner 
    {
        operational = mode;
    }

    function authorizeContract(address contractAddress) external requireContractOwner requireIsOperational
    {
        authorizedContracts[contractAddress] = true;
    }

    function deauthorizeContract(address contractAddress) external requireContractOwner requireIsOperational
    {
        delete authorizedContracts[contractAddress];
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

    function getFundedAirlinesCount() public view returns(uint256) 
    {
        return fundedAirlinesCount;
    }

    function isFunded(address airlineAddress) public view returns(bool)
    {
        return airlines[airlineAddress].funded;
    }

   /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */   
    function registerAirline(address airlineAddress) external requireIsOperational
    {
        require(isFunded(msg.sender) == true, "Funds are necessary to register new airlines");

        airlines[airlineAddress].registered = true;
    }

   /**
    * @dev Buy insurance for a flight
    *
    */   
    function buy(string memory flightKey) external payable requireIsOperational
    {
        require(insurances[msg.sender][flightKey].valueDeposited == 0, "Insurance has already been bought");

        insurances[msg.sender][flightKey].valueDeposited.add(msg.value);
    }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees(string memory flightKey, uint256 creditAmount) external requireIsOperational
    {
        require(insurances[msg.sender][flightKey].availableCredit == 0, "Credit has already been added");

        insurances[msg.sender][flightKey].availableCredit = creditAmount;
    }
    

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay(string memory flightKey) external requireIsOperational
    {
        uint256 creditBalance = insurances[msg.sender][flightKey].availableCredit;
        require(creditBalance > 0, "No credit available to withdraw");

        insurances[msg.sender][flightKey].availableCredit = 0;

        payable(msg.sender).transfer(creditBalance);
    }

   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */   
    function fund() public payable requireIsOperational
    {
        require(airlines[msg.sender].registered == true, "Airline not registered");
        require(msg.value >= 10 ether, "At least 10 ether is necessary to fund");

        airlines[msg.sender].funded = true;
        fundedAirlinesCount = fundedAirlinesCount.add(1);
    }

    function getFlightKey(address airline, string memory flight, uint256 timestamp) pure internal returns(bytes32) 
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    receive() external payable 
    {
        fund();
    }
}

