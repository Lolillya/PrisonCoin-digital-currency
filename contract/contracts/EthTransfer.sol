// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EthTransfer {
    address public operator;
    address public treasury;
    
    // Events
    event EthSent(address indexed from, address indexed to, uint256 amount, string reason);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event OperatorUpdated(address indexed oldOperator, address indexed newOperator);
    
    // Modifiers
    modifier onlyOperator() {
        require(msg.sender == operator, "Only operator can perform this action");
        _;
    }
    
    modifier onlyTreasury() {
        require(msg.sender == treasury, "Only treasury can perform this action");
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
    
    constructor(address _treasury) {
        require(_treasury != address(0), "Treasury address cannot be zero");
        operator = msg.sender;
        treasury = _treasury;
    }
    
    // Function to receive ETH
    receive() external payable {
        // Contract can receive ETH
    }
    
    // Function to send ETH to a single address
    function sendEth(
        address payable _to,
        uint256 _amount,
        string calldata _reason
    ) external onlyOperator validAddress(_to) validAmount(_amount) {
        require(address(this).balance >= _amount, "Insufficient contract balance");
        
        (bool success, ) = _to.call{value: _amount}("");
        require(success, "ETH transfer failed");
        
        emit EthSent(msg.sender, _to, _amount, _reason);
    }
    
    // Function to send ETH to multiple addresses (batch transfer)
    function sendEthBatch(
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
            
            emit EthSent(msg.sender, _recipients[i], _amounts[i], _reason);
        }
    }
    
    // Function for treasury to send ETH (for refunds, etc.)
    function treasurySendEth(
        address payable _to,
        uint256 _amount,
        string calldata _reason
    ) external onlyTreasury validAddress(_to) validAmount(_amount) {
        require(address(this).balance >= _amount, "Insufficient contract balance");
        
        (bool success, ) = _to.call{value: _amount}("");
        require(success, "ETH transfer failed");
        
        emit EthSent(msg.sender, _to, _amount, _reason);
    }
    
    // Function to withdraw ETH from contract (emergency or treasury operations)
    function withdrawEth(
        address payable _to,
        uint256 _amount
    ) external onlyTreasury validAddress(_to) validAmount(_amount) {
        require(address(this).balance >= _amount, "Insufficient contract balance");
        
        (bool success, ) = _to.call{value: _amount}("");
        require(success, "ETH withdrawal failed");
    }
    
    // Function to get contract balance
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    // Function to update treasury address
    function updateTreasury(address _newTreasury) external onlyOperator validAddress(_newTreasury) {
        address oldTreasury = treasury;
        treasury = _newTreasury;
        emit TreasuryUpdated(oldTreasury, _newTreasury);
    }
    
    // Function to update operator address
    function updateOperator(address _newOperator) external onlyOperator validAddress(_newOperator) {
        address oldOperator = operator;
        operator = _newOperator;
        emit OperatorUpdated(oldOperator, _newOperator);
    }
    
    // Function to transfer operator role to treasury (for security)
    function transferOperatorToTreasury() external onlyOperator {
        address oldOperator = operator;
        operator = treasury;
        emit OperatorUpdated(oldOperator, treasury);
    }
} 