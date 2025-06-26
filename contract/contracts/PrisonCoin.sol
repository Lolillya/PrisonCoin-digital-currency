// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PrisonCoin {
    address public operator;

    mapping(address => bool) public isInmate;
    mapping(address => uint256) public balances;
    address[] public inmateList;

    // Transaction struct
    struct Transaction {
        address from;
        address to;
        string item; // empty for deposit
        uint256 amount;
        uint256 timestamp;
    }

    // Mapping: inmate => incoming transactions
    mapping(address => Transaction[]) public incomingTransactions;
    // Mapping: inmate => outgoing transactions
    mapping(address => Transaction[]) public outgoingTransactions;

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
        isInmate[inmate] = true;
        balances[inmate] = 0;
        inmateList.push(inmate);
        emit InmateRegistered(inmate);
    }

    // Step 3: Exchange real money for prison tokens (off-chain verified with fingerprint)
    function depositTokens(
        address inmate,
        uint256 amount
    ) external onlyOperator {
        require(isInmate[inmate], "Inmate not registered");
        balances[inmate] += amount;
        incomingTransactions[inmate].push(
            Transaction({
                from: msg.sender,
                to: inmate,
                item: "",
                amount: amount,
                timestamp: block.timestamp
            })
        );
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
        outgoingTransactions[inmate].push(
            Transaction({
                from: inmate,
                to: msg.sender,
                item: item,
                amount: cost,
                timestamp: block.timestamp
            })
        );
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

    // Get all incoming transactions for an inmate
    function getIncomingTransactions(
        address inmate
    ) external view returns (Transaction[] memory) {
        return incomingTransactions[inmate];
    }

    // Get all outgoing transactions for an inmate
    function getOutgoingTransactions(
        address inmate
    ) external view returns (Transaction[] memory) {
        return outgoingTransactions[inmate];
    }

    // Get all transactions across all inmates
    function getAllTransactions() external view returns (Transaction[] memory) {
        uint256 totalTransactions = 0;
        
        // First, count total transactions
        for (uint256 i = 0; i < inmateList.length; i++) {
            address inmate = inmateList[i];
            totalTransactions += incomingTransactions[inmate].length;
            totalTransactions += outgoingTransactions[inmate].length;
        }
        
        // Create array to hold all transactions
        Transaction[] memory allTransactions = new Transaction[](totalTransactions);
        uint256 currentIndex = 0;
        
        // Collect all transactions
        for (uint256 i = 0; i < inmateList.length; i++) {
            address inmate = inmateList[i];
            
            // Add incoming transactions
            Transaction[] memory incoming = incomingTransactions[inmate];
            for (uint256 j = 0; j < incoming.length; j++) {
                allTransactions[currentIndex] = incoming[j];
                currentIndex++;
            }
            
            // Add outgoing transactions
            Transaction[] memory outgoing = outgoingTransactions[inmate];
            for (uint256 j = 0; j < outgoing.length; j++) {
                allTransactions[currentIndex] = outgoing[j];
                currentIndex++;
            }
        }
        
        return allTransactions;
    }

    // Get all transactions with pagination support
    function getAllTransactionsPaginated(
        uint256 offset,
        uint256 limit
    ) external view returns (Transaction[] memory, uint256 totalCount) {
        uint256 totalTransactions = 0;
        
        // First, count total transactions
        for (uint256 i = 0; i < inmateList.length; i++) {
            address inmate = inmateList[i];
            totalTransactions += incomingTransactions[inmate].length;
            totalTransactions += outgoingTransactions[inmate].length;
        }
        
        // Calculate how many transactions to return
        uint256 endIndex = offset + limit;
        if (endIndex > totalTransactions) {
            endIndex = totalTransactions;
        }
        
        if (offset >= totalTransactions) {
            return (new Transaction[](0), totalTransactions);
        }
        
        uint256 resultLength = endIndex - offset;
        Transaction[] memory result = new Transaction[](resultLength);
        uint256 currentIndex = 0;
        uint256 resultIndex = 0;
        
        // Collect transactions with pagination
        for (uint256 i = 0; i < inmateList.length && resultIndex < resultLength; i++) {
            address inmate = inmateList[i];
            
            // Add incoming transactions
            Transaction[] memory incoming = incomingTransactions[inmate];
            for (uint256 j = 0; j < incoming.length && resultIndex < resultLength; j++) {
                if (currentIndex >= offset) {
                    result[resultIndex] = incoming[j];
                    resultIndex++;
                }
                currentIndex++;
            }
            
            // Add outgoing transactions
            Transaction[] memory outgoing = outgoingTransactions[inmate];
            for (uint256 j = 0; j < outgoing.length && resultIndex < resultLength; j++) {
                if (currentIndex >= offset) {
                    result[resultIndex] = outgoing[j];
                    resultIndex++;
                }
                currentIndex++;
            }
        }
        
        return (result, totalTransactions);
    }
}
