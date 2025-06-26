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
    event EthTransferred(address indexed from, address indexed to, uint256 amount, string reason);

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

    modifier validAddress(address _address) {
        require(_address != address(0), "Invalid address");
        _;
    }

    modifier validAmount(uint256 _amount) {
        require(_amount > 0, "Amount must be greater than 0");
        _;
    }

    constructor() {
        operator = msg.sender;
    }

    // Function to receive ETH
    receive() external payable {
        // Contract can receive ETH
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

    // ETH Transfer Functions

    // Transfer ETH to a single address
    function transferEth(
        address payable _to,
        uint256 _amount,
        string calldata _reason
    ) external onlyOperator validAddress(_to) validAmount(_amount) {
        require(address(this).balance >= _amount, "Insufficient contract balance");
        
        (bool success, ) = _to.call{value: _amount}("");
        require(success, "ETH transfer failed");
        
        emit EthTransferred(msg.sender, _to, _amount, _reason);
    }

    // Transfer ETH to multiple addresses (batch transfer)
    function transferEthBatch(
        address payable[] calldata _recipients,
        uint256[] calldata _amounts,
        string calldata _reason
    ) external onlyOperator validAmount(_recipients.length) {
        require(_recipients.length == _amounts.length, "Arrays length mismatch");
        require(_recipients.length <= 50, "Too many recipients (max 50)");
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < _amounts.length; i++) {
            totalAmount += _amounts[i];
        }
        
        require(address(this).balance >= totalAmount, "Insufficient contract balance");
        
        for (uint256 i = 0; i < _recipients.length; i++) {
            require(_recipients[i] != address(0), "Invalid recipient address");
            require(_amounts[i] > 0, "Amount must be greater than 0");
            
            (bool success, ) = _recipients[i].call{value: _amounts[i]}("");
            require(success, "ETH transfer failed");
            
            emit EthTransferred(msg.sender, _recipients[i], _amounts[i], _reason);
        }
    }

    // Emergency withdrawal function (only operator)
    function withdrawEth(
        address payable _to,
        uint256 _amount
    ) external onlyOperator validAddress(_to) validAmount(_amount) {
        require(address(this).balance >= _amount, "Insufficient contract balance");
        
        (bool success, ) = _to.call{value: _amount}("");
        require(success, "ETH withdrawal failed");
        
        emit EthTransferred(msg.sender, _to, _amount, "Emergency withdrawal");
    }

    // Get contract ETH balance
    function getContractEthBalance() external view returns (uint256) {
        return address(this).balance;
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
