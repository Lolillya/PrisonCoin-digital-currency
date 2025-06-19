// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PrisonCoin {
    address public operator;

    mapping(address => bool) public isInmate;
    mapping(address => uint256) public balances;

    event InmateRegistered(address indexed inmate);
    event TokensDeposited(address indexed inmate, uint256 amount);
    event ItemPurchased(address indexed inmate, string item, uint256 amount);

    modifier onlyOperator() {
        require(
            msg.sender == operator,
            "Only operator can perform this action"
        );
        _;
    }

    modifier onlyInmate() {
        require(isInmate[msg.sender], "Not a registered inmate");
        _;
    }

    constructor() {
        operator = msg.sender;
    }

    // Step 1: Register inmate in the blockchain
    function registerInmate(address inmate) external onlyOperator {
        require(!isInmate[inmate], "Already registered");
        isInmate[inmate] = true;
        balances[inmate] = 0;
        emit InmateRegistered(inmate);
    }

    // Step 3: Exchange real money for prison tokens (off-chain verified with fingerprint)
    function depositTokens(
        address inmate,
        uint256 amount
    ) external onlyOperator {
        require(isInmate[inmate], "Inmate not registered");
        balances[inmate] += amount;
        emit TokensDeposited(inmate, amount);
    }

    // Step 5–9: Inmate makes a purchase (triggered by operator, fingerprint-verified off-chain)
    function purchaseItem(
        address inmate,
        string calldata item,
        uint256 cost
    ) external onlyOperator {
        require(isInmate[inmate], "Inmate not registered");
        require(balances[inmate] >= cost, "Insufficient balance");

        balances[inmate] -= cost;
        emit ItemPurchased(inmate, item, cost);
    }

    // View balance
    function getBalance(address inmate) external view returns (uint256) {
        return balances[inmate];
    }

    // VIEW ALL REGISTERED INMATES
    function getAllInmates() external view returns (address[] memory) {
        return inmateList;
    }
}
