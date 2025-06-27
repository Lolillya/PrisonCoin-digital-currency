using Microsoft.AspNetCore.Mvc;
using Nethereum.Web3;
using Nethereum.Contracts;
using Nethereum.Hex.HexTypes;
using Nethereum.RPC.Eth.DTOs;
using Nethereum.Util;
using Nethereum.Web3.Accounts;
using Nethereum.Hex.HexConvertors.Extensions;
using Nethereum.ABI.FunctionEncoding.Attributes;
using Nethereum.Contracts.ContractHandlers;
using Nethereum.RPC.Eth;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Numerics;
using System.Threading.Tasks;
using server.Models;

[ApiController]
[Route("api/[controller]")]
public class InmateController : ControllerBase
{
    // DEPLOYED CONTRACT ADDRESS 0x60944c759F5E416005F6f88823A924C7d2EEbE6B
    private readonly string _privateKey = "0xba5da40da9963ef6204d0463a1535b431cb075c7576d817404d3e5823fe09dbd"; // no '0x'
    private readonly string _rpcUrl = "http://host.docker.internal:7545";
    private readonly string _contractAddress = "0xE2bc8b8EB26939F62e5Da6b24BcdAc278E0b256f";
    private readonly string _abi;

    private static List<InmateModel> _inmates = new List<InmateModel>();

    public InmateController()
    {
        var abiPath = Path.Combine(Directory.GetCurrentDirectory(), "ABI", "PrisonCoinABI.json");
        _abi = System.IO.File.ReadAllText(abiPath);
    }

    [HttpPost("register")]
    public IActionResult RegisterInmate([FromBody] object inmateData)
    {
        try
        {
            // Log the received data
            Console.WriteLine($"Received inmate registration data: {System.Text.Json.JsonSerializer.Serialize(inmateData)}");

            // For now, just return success - you can add your database logic here
            return Ok(new
            {
                message = "Inmate registered successfully",
                data = inmateData
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error registering inmate: {ex.Message}");
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("balance/{address}")]
    public async Task<IActionResult> GetBalance(string address)
    {
        try
        {
            var account = new Account(_privateKey);
            var web3 = new Web3(account, _rpcUrl);
            var contract = web3.Eth.GetContract(_abi, _contractAddress);

            var getBalanceFunction = contract.GetFunction("getBalance");
            var result = await getBalanceFunction.CallAsync<int>(address);

            return Ok(new { balance = result });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("eth-balance/{address}")]
    public async Task<IActionResult> GetEthBalance(string address)
    {
        try
        {
            var web3 = new Web3(_rpcUrl);  // No need for private key here
            var balance = await web3.Eth.GetBalance.SendRequestAsync(address);
            var ethBalance = Web3.Convert.FromWei(balance.Value);

            return Ok(new { ethBalance = ethBalance });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    // [HttpPost("exchange")]
    // public async Task<IActionResult> ExchangeTokens([FromBody] ExchangeRequestModel request)
    // {
    //     try
    //     {
    //         var account = new Account(_privateKey);
    //         var web3 = new Web3(account, _rpcUrl);
    //         var contract = web3.Eth.GetContract(_abi, _contractAddress);

    //         var depositFunction = contract.GetFunction("depositTokens");

    //         var gas = await depositFunction.EstimateGasAsync(account.Address, null, null, request.InmateAddress, request.Amount);

    //         var transactionHash = await depositFunction.SendTransactionAsync(account.Address, gas, null, null, request.InmateAddress, request.Amount);

    //         return Ok(new
    //         {
    //             message = "Tokens deposited successfully.",
    //             transactionHash = transactionHash
    //         });
    //     }
    //     catch (Exception ex)
    //     {
    //         return BadRequest(new { error = ex.Message });
    //     }
    // }

    // [HttpGet("token-balance/{address}")]
    // public async Task<IActionResult> GetTokenBalance(string address)
    // {
    //     try
    //     {
    //         var account = new Account(_privateKey);
    //         var web3 = new Web3(account, _rpcUrl);
    //         var contract = web3.Eth.GetContract(_abi, _contractAddress);

    //         var getBalanceFunction = contract.GetFunction("getBalance");
    //         var result = await getBalanceFunction.CallAsync<int>(address);

    //         return Ok(new { balance = result });
    //     }
    //     catch (Exception ex)
    //     {
    //         return BadRequest(new { error = ex.Message });
    //     }
    // }

    [HttpPost("register-inmate")]
    public async Task<IActionResult> RegisterInmateFull([FromBody] InmateModel inmate)
    {
        try
        {
            // On-chain registration
            var account = new Account(_privateKey);
            var web3 = new Web3(account, _rpcUrl);
            var contract = web3.Eth.GetContract(_abi, _contractAddress);
            var registerFunction = contract.GetFunction("registerInmate");

            // Check if already registered to avoid duplicate tx (optional enhancement)
            var isInmateFunction = contract.GetFunction("isInmate");
            var isRegistered = await isInmateFunction.CallAsync<bool>(inmate.WalletAddress);
            if (isRegistered)
            {
                return BadRequest(new { error = "Inmate already registered on chain." });
            }

            var gas = await registerFunction.EstimateGasAsync(account.Address, null, null, inmate.WalletAddress);
            var transactionHash = await registerFunction.SendTransactionAsync(account.Address, gas, null, null, inmate.WalletAddress);

            // Save inmate to in-memory store
            _inmates.Add(inmate);

            return Ok(new
            {
                message = "Inmate registered successfully (on-chain + server).",
                transactionHash = transactionHash,
                inmate = inmate
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("all-inmates")]
    public async Task<IActionResult> GetAllInmates()
    {
        try
        {
            var account = new Account(_privateKey);
            var web3 = new Web3(account, _rpcUrl);
            var contract = web3.Eth.GetContract(_abi, _contractAddress);

            var getInmatesFunction = contract.GetFunction("getAllInmates");
            var result = await getInmatesFunction.CallAsync<List<string>>();

            return Ok(new { inmates = result });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("incoming-transactions/{address}")]
    public async Task<IActionResult> GetIncomingTransactions(string address)
    {
        try
        {
            var account = new Account(_privateKey);
            var web3 = new Web3(account, _rpcUrl);
            var contract = web3.Eth.GetContract(_abi, _contractAddress);

            var getIncomingFunction = contract.GetFunction("getIncomingTransactions");
            var result = await getIncomingFunction.CallDeserializingToObjectAsync<List<TransactionModel>>(address);

            return Ok(new { transactions = result });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("outgoing-transactions/{address}")]
    public async Task<IActionResult> GetOutgoingTransactions(string address)
    {
        try
        {
            var account = new Account(_privateKey);
            var web3 = new Web3(account, _rpcUrl);
            var contract = web3.Eth.GetContract(_abi, _contractAddress);

            var getOutgoingFunction = contract.GetFunction("getOutgoingTransactions");
            var result = await getOutgoingFunction.CallDeserializingToObjectAsync<List<TransactionModel>>(address);

            return Ok(new { transactions = result });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("all-transactions")]
    public async Task<IActionResult> GetAllTransactions()
    {
        try
        {
            var account = new Account(_privateKey);
            var web3 = new Web3(account, _rpcUrl);
            var contract = web3.Eth.GetContract(_abi, _contractAddress);

            var getAllTransactionsFunction = contract.GetFunction("getAllTransactions");
            
            // Use CallAsync with proper type handling
            var transactions = await getAllTransactionsFunction.CallAsync<List<TransactionModel>>();
            
            Console.WriteLine($"Transactions count: {transactions?.Count ?? 0}");
            if (transactions != null && transactions.Count > 0)
            {
                Console.WriteLine($"First transaction: {System.Text.Json.JsonSerializer.Serialize(transactions[0])}");
            }

            return Ok(new { 
                transactions = transactions ?? new List<TransactionModel>(),
                count = transactions?.Count ?? 0,
                debug = new {
                    contractAddress = _contractAddress,
                    functionName = "getAllTransactions"
                }
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in GetAllTransactions: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return BadRequest(new { error = ex.Message, stackTrace = ex.StackTrace });
        }
    }

    [HttpGet("all-transactions-paginated")]
    public async Task<IActionResult> GetAllTransactionsPaginated([FromQuery] int offset = 0, [FromQuery] int limit = 10)
    {
        try
        {
            var account = new Account(_privateKey);
            var web3 = new Web3(account, _rpcUrl);
            var contract = web3.Eth.GetContract(_abi, _contractAddress);

            var getAllTransactionsPaginatedFunction = contract.GetFunction("getAllTransactionsPaginated");
            var result = await getAllTransactionsPaginatedFunction.CallDeserializingToObjectAsync<PaginatedTransactionsResult>(offset, limit);

            return Ok(new { 
                transactions = result.Transactions, 
                totalCount = result.TotalCount,
                offset = offset,
                limit = limit
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("all-transactions-simple")]
    public async Task<IActionResult> GetAllTransactionsSimple()
    {
        try
        {
            var account = new Account(_privateKey);
            var web3 = new Web3(account, _rpcUrl);
            var contract = web3.Eth.GetContract(_abi, _contractAddress);

            var getAllTransactionsFunction = contract.GetFunction("getAllTransactions");
            
            // Try calling without wrapper class
            var transactions = await getAllTransactionsFunction.CallAsync<List<TransactionModel>>();
            
            return Ok(new { 
                transactions = transactions ?? new List<TransactionModel>(),
                count = transactions?.Count ?? 0
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in GetAllTransactionsSimple: {ex.Message}");
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("all-transactions-manual")]
    public async Task<IActionResult> GetAllTransactionsManual()
    {
        try
        {
            var account = new Account(_privateKey);
            var web3 = new Web3(account, _rpcUrl);
            var contract = web3.Eth.GetContract(_abi, _contractAddress);

            // Get all inmates first
            var getAllInmatesFunction = contract.GetFunction("getAllInmates");
            var inmates = await getAllInmatesFunction.CallAsync<List<string>>();

            var allTransactions = new List<TransactionModel>();

            // Collect transactions from each inmate
            foreach (var inmate in inmates)
            {
                try
                {
                    // Get incoming transactions
                    var getIncomingFunction = contract.GetFunction("getIncomingTransactions");
                    var incoming = await getIncomingFunction.CallAsync<List<TransactionModel>>(inmate);
                    if (incoming != null)
                    {
                        allTransactions.AddRange(incoming);
                    }

                    // Get outgoing transactions
                    var getOutgoingFunction = contract.GetFunction("getOutgoingTransactions");
                    var outgoing = await getOutgoingFunction.CallAsync<List<TransactionModel>>(inmate);
                    if (outgoing != null)
                    {
                        allTransactions.AddRange(outgoing);
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error getting transactions for inmate {inmate}: {ex.Message}");
                }
            }

            return Ok(new { 
                transactions = allTransactions,
                count = allTransactions.Count,
                inmates = inmates,
                debug = new {
                    contractAddress = _contractAddress,
                    totalInmates = inmates.Count
                }
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in GetAllTransactionsManual: {ex.Message}");
            return BadRequest(new { error = ex.Message, stackTrace = ex.StackTrace });
        }
    }

    // ETH Transfer Functions

    [HttpPost("transfer-eth")]
    public async Task<IActionResult> TransferEth([FromBody] TransferEthRequest request)
    {
        try
        {
            var account = new Account(_privateKey);
            var web3 = new Web3(account, _rpcUrl);
            var contract = web3.Eth.GetContract(_abi, _contractAddress);

            var transferEthFunction = contract.GetFunction("transferEth");

            // Convert decimal amount to Wei
            var amountInWei = Nethereum.Web3.Web3.Convert.ToWei(request.Amount);

            var gas = await transferEthFunction.EstimateGasAsync(account.Address, null, null, request.ToAddress, amountInWei, request.Reason);
            var transactionHash = await transferEthFunction.SendTransactionAsync(account.Address, gas, null, null, request.ToAddress, amountInWei, request.Reason);

            return Ok(new
            {
                message = "ETH transferred successfully",
                transactionHash = transactionHash,
                to = request.ToAddress,
                amount = request.Amount,
                amountInWei = amountInWei.ToString(),
                reason = request.Reason
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("transfer-eth-batch")]
    public async Task<IActionResult> TransferEthBatch([FromBody] TransferEthBatchRequest request)
    {
        try
        {
            var account = new Account(_privateKey);
            var web3 = new Web3(account, _rpcUrl);
            var contract = web3.Eth.GetContract(_abi, _contractAddress);

            var transferEthBatchFunction = contract.GetFunction("transferEthBatch");

            // Convert decimal amounts to Wei
            var amountsInWei = request.Amounts.Select(amount => Nethereum.Web3.Web3.Convert.ToWei(amount)).ToArray();

            var gas = await transferEthBatchFunction.EstimateGasAsync(account.Address, null, null, request.Recipients, amountsInWei, request.Reason);
            var transactionHash = await transferEthBatchFunction.SendTransactionAsync(account.Address, gas, null, null, request.Recipients, amountsInWei, request.Reason);

            return Ok(new
            {
                message = "Batch ETH transfer completed successfully",
                transactionHash = transactionHash,
                recipients = request.Recipients,
                amounts = request.Amounts,
                amountsInWei = amountsInWei.Select(w => w.ToString()).ToArray(),
                reason = request.Reason
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("withdraw-eth")]
    public async Task<IActionResult> WithdrawEth([FromBody] WithdrawEthRequest request)
    {
        try
        {
            var account = new Account(_privateKey);
            var web3 = new Web3(account, _rpcUrl);
            var contract = web3.Eth.GetContract(_abi, _contractAddress);

            var withdrawEthFunction = contract.GetFunction("withdrawEth");

            // Convert decimal amount to Wei
            var amountInWei = Nethereum.Web3.Web3.Convert.ToWei(request.Amount);

            var gas = await withdrawEthFunction.EstimateGasAsync(account.Address, null, null, request.ToAddress, amountInWei);
            var transactionHash = await withdrawEthFunction.SendTransactionAsync(account.Address, gas, null, null, request.ToAddress, amountInWei);

            return Ok(new
            {
                message = "ETH withdrawn successfully",
                transactionHash = transactionHash,
                to = request.ToAddress,
                amount = request.Amount,
                amountInWei = amountInWei.ToString()
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("contract-eth-balance")]
    public async Task<IActionResult> GetContractEthBalance()
    {
        try
        {
            var account = new Account(_privateKey);
            var web3 = new Web3(account, _rpcUrl);
            var contract = web3.Eth.GetContract(_abi, _contractAddress);

            var getContractEthBalanceFunction = contract.GetFunction("getContractEthBalance");
            var balance = await getContractEthBalanceFunction.CallAsync<System.Numerics.BigInteger>();

            var ethBalance = Nethereum.Web3.Web3.Convert.FromWei(balance);

            return Ok(new { 
                balance = balance.ToString(),
                ethBalance = ethBalance.ToString(),
                contractAddress = _contractAddress,
                message = "To fund the contract, send ETH to the contract address above"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("fund-contract")]
    public async Task<IActionResult> FundContract([FromBody] FundContractRequest request)
    {
        try
        {
            var account = new Account(_privateKey);
            var web3 = new Web3(account, _rpcUrl);

            // Send ETH directly to the contract address
            var transaction = await web3.Eth.GetEtherTransferService()
                .TransferEtherAndWaitForReceiptAsync(_contractAddress, request.Amount, 2);

            return Ok(new
            {
                message = "Contract funded successfully",
                transactionHash = transaction.TransactionHash,
                amount = request.Amount,
                contractAddress = _contractAddress
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("debug-contract")]
    public async Task<IActionResult> DebugContract()
    {
        try
        {
            var account = new Account(_privateKey);
            var web3 = new Web3(account, _rpcUrl);
            var contract = web3.Eth.GetContract(_abi, _contractAddress);

            // Test basic functions
            var getAllInmatesFunction = contract.GetFunction("getAllInmates");
            var inmates = await getAllInmatesFunction.CallAsync<List<string>>();

            var getContractEthBalanceFunction = contract.GetFunction("getContractEthBalance");
            var ethBalance = await getContractEthBalanceFunction.CallAsync<System.Numerics.BigInteger>();

            // Test if there are any inmates with transactions
            var debugInfo = new List<object>();
            foreach (var inmate in inmates)
            {
                var getIncomingFunction = contract.GetFunction("getIncomingTransactions");
                var incoming = await getIncomingFunction.CallAsync<object[]>(inmate);
                
                var getOutgoingFunction = contract.GetFunction("getOutgoingTransactions");
                var outgoing = await getOutgoingFunction.CallAsync<object[]>(inmate);

                debugInfo.Add(new
                {
                    inmate = inmate,
                    incomingCount = incoming?.Length ?? 0,
                    outgoingCount = outgoing?.Length ?? 0,
                    incoming = incoming,
                    outgoing = outgoing
                });
            }

            return Ok(new
            {
                contractAddress = _contractAddress,
                totalInmates = inmates.Count,
                inmates = inmates,
                contractEthBalance = ethBalance.ToString(),
                ethBalanceInEth = Nethereum.Web3.Web3.Convert.FromWei(ethBalance).ToString(),
                debugInfo = debugInfo
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in DebugContract: {ex.Message}");
            return BadRequest(new { error = ex.Message, stackTrace = ex.StackTrace });
        }
    }

    [HttpGet("transaction-summary")]
    public async Task<IActionResult> GetTransactionSummary()
    {
        try
        {
            var account = new Account(_privateKey);
            var web3 = new Web3(account, _rpcUrl);
            var contract = web3.Eth.GetContract(_abi, _contractAddress);

            // Get all inmates
            var getAllInmatesFunction = contract.GetFunction("getAllInmates");
            var inmates = await getAllInmatesFunction.CallAsync<List<string>>();

            var summary = new List<object>();
            var totalInmates = inmates.Count;

            foreach (var inmate in inmates)
            {
                try
                {
                    // Get basic inmate information
                    var isInmateFunction = contract.GetFunction("isInmate");
                    var isRegistered = await isInmateFunction.CallAsync<bool>(inmate);
                    
                    var getBalanceFunction = contract.GetFunction("getBalance");
                    var balance = await getBalanceFunction.CallAsync<int>(inmate);

                    // Try to get transaction count using getAllTransactions and filtering
                    var getAllTransactionsFunction = contract.GetFunction("getAllTransactions");
                    var allTransactions = await getAllTransactionsFunction.CallAsync<object[]>();
                    
                    var incomingCount = 0;
                    var outgoingCount = 0;
                    
                    // Count transactions for this inmate
                    if (allTransactions != null)
                    {
                        foreach (var transaction in allTransactions)
                        {
                            // For now, just count total transactions
                            // We'll assume some are incoming and some are outgoing
                            incomingCount++;
                            outgoingCount++;
                        }
                    }

                    summary.Add(new
                    {
                        inmate = inmate,
                        isRegistered = isRegistered,
                        balance = balance,
                        incomingCount = incomingCount,
                        outgoingCount = outgoingCount,
                        totalTransactions = incomingCount + outgoingCount,
                        allTransactionsCount = allTransactions?.Length ?? 0
                    });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error getting data for inmate {inmate}: {ex.Message}");
                    
                    // Fallback: just show basic info
                    try
                    {
                        var getBalanceFunction = contract.GetFunction("getBalance");
                        var balance = await getBalanceFunction.CallAsync<int>(inmate);
                        
                        summary.Add(new
                        {
                            inmate = inmate,
                            // error = ex.Message,
                            balance = balance,
                            incomingCount = 0,
                            outgoingCount = 0,
                            totalTransactions = 0,
                            note = "Fallback: showing only balance due to error"
                        });
                    }
                    catch (Exception balanceEx)
                    {
                        summary.Add(new
                        {
                            inmate = inmate,
                            // error = ex.Message,
                            balanceError = balanceEx.Message,
                            incomingCount = 0,
                            outgoingCount = 0,
                            totalTransactions = 0
                        });
                    }
                }
            }

            // Get contract ETH balance
            var getContractBalanceFunction = contract.GetFunction("getContractEthBalance");
            var contractBalance = await getContractBalanceFunction.CallAsync<System.Numerics.BigInteger>();

            // Calculate totals manually to avoid LINQ issues
            var totalIncoming = 0;
            var totalOutgoing = 0;
            var totalTransactions = 0;
            
            foreach (var item in summary)
            {
                var itemType = item.GetType();
                var incomingProp = itemType.GetProperty("incomingCount");
                var outgoingProp = itemType.GetProperty("outgoingCount");
                var totalProp = itemType.GetProperty("totalTransactions");
                
                if (incomingProp != null)
                {
                    var incomingValue = incomingProp.GetValue(item);
                    if (incomingValue != null)
                        totalIncoming += (int)incomingValue;
                }
                
                if (outgoingProp != null)
                {
                    var outgoingValue = outgoingProp.GetValue(item);
                    if (outgoingValue != null)
                        totalOutgoing += (int)outgoingValue;
                }
                
                if (totalProp != null)
                {
                    var totalValue = totalProp.GetValue(item);
                    if (totalValue != null)
                        totalTransactions += (int)totalValue;
                }
            }

            return Ok(new
            {
                totalInmates = totalInmates,
                totalIncomingTransactions = totalIncoming,
                totalOutgoingTransactions = totalOutgoing,
                totalTransactions = totalTransactions,
                contractEthBalance = contractBalance.ToString(),
                contractEthBalanceInEth = Nethereum.Web3.Web3.Convert.FromWei(contractBalance).ToString(),
                inmateSummary = summary,
                contractAddress = _contractAddress,
                note = "Using getAllTransactions approach to avoid individual array deserialization"
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in GetTransactionSummary: {ex.Message}");
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("purchase-item")]
    public async Task<IActionResult> PurchaseItem([FromBody] PurchaseItemRequest request)
    {
        try
        {
            var account = new Account(_privateKey);
            var web3 = new Web3(account, _rpcUrl);
            var contract = web3.Eth.GetContract(_abi, _contractAddress);

            var purchaseItemFunction = contract.GetFunction("purchaseItem");

            // Call the smart contract function to purchase the item
            var gas = await purchaseItemFunction.EstimateGasAsync(account.Address, null, null, request.InmateAddress, request.Item, request.Cost);
            var transactionHash = await purchaseItemFunction.SendTransactionAsync(account.Address, gas, null, null, request.InmateAddress, request.Item, request.Cost);

            return Ok(new
            {
                message = "Item purchased successfully",
                transactionHash = transactionHash,
                inmateAddress = request.InmateAddress,
                item = request.Item,
                cost = request.Cost,
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in PurchaseItem: {ex.Message}");
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("purchase-item-eth")]
    public async Task<IActionResult> PurchaseItemWithEth([FromBody] PurchaseItemEthRequest request)
    {
        try
        {
            var account = new Account(_privateKey);
            var web3 = new Web3(account, _rpcUrl);
            var contract = web3.Eth.GetContract(_abi, _contractAddress);

            var purchaseItemWithEthFunction = contract.GetFunction("purchaseItemWithEth");

            // Convert ETH amount to Wei
            var amountInWei = Nethereum.Web3.Web3.Convert.ToWei(request.AmountInEth);
            
            Console.WriteLine($"Attempting to purchase item: {request.Item}");
            Console.WriteLine($"Inmate address: {request.InmateAddress}");
            Console.WriteLine($"Amount in ETH: {request.AmountInEth}");
            Console.WriteLine($"Amount in Wei: {amountInWei}");

            // Check if the account has enough ETH
            var accountBalance = await web3.Eth.GetBalance.SendRequestAsync(account.Address);
            var accountBalanceInEth = Nethereum.Web3.Web3.Convert.FromWei(accountBalance.Value);
            Console.WriteLine($"Account balance: {accountBalanceInEth} ETH");

            if (accountBalance.Value < amountInWei)
            {
                return BadRequest(new { error = $"Insufficient ETH balance. Required: {request.AmountInEth} ETH, Available: {accountBalanceInEth} ETH" });
            }

            // Call the smart contract function to purchase the item with ETH
            // The function only takes 2 parameters: inmate and item
            // The ETH value is passed as msg.value (the payable amount)
            
            // Debug parameter types
            Console.WriteLine($"InmateAddress type: {request.InmateAddress?.GetType()}, value: '{request.InmateAddress}'");
            Console.WriteLine($"Item type: {request.Item?.GetType()}, value: '{request.Item}'");
            
            // Ensure parameters are strings
            var inmateAddress = request.InmateAddress?.ToString() ?? string.Empty;
            var itemName = request.Item?.ToString() ?? string.Empty;
            
            Console.WriteLine($"Converted InmateAddress: '{inmateAddress}'");
            Console.WriteLine($"Converted Item: '{itemName}'");
            
            // Validate parameters
            if (string.IsNullOrWhiteSpace(inmateAddress))
            {
                return BadRequest(new { error = "InmateAddress cannot be null or empty" });
            }
            
            if (string.IsNullOrWhiteSpace(itemName))
            {
                return BadRequest(new { error = "Item cannot be null or empty" });
            }
            
            // Validate ETH address format
            if (!inmateAddress.StartsWith("0x") || inmateAddress.Length != 42)
            {
                return BadRequest(new { error = "Invalid ETH address format" });
            }
            
            // Debug function information
            Console.WriteLine($"Contract address: {_contractAddress}");
            Console.WriteLine($"Function name: purchaseItemWithEth");
            Console.WriteLine($"Function signature: purchaseItemWithEth(address,string)");
            
            // Test if the function exists by trying to get its data
            try
            {
                var functionData = purchaseItemWithEthFunction.GetData(inmateAddress, itemName);
                Console.WriteLine($"Function data length: {functionData.Length}");
                
                // Use manual transaction input to avoid parameter encoding issues
                var transactionInput = new Nethereum.RPC.Eth.DTOs.TransactionInput
                {
                    From = account.Address,
                    To = _contractAddress,
                    Value = new HexBigInteger(amountInWei),
                    Data = functionData,
                    Gas = new HexBigInteger(200000) // Set a reasonable gas limit
                };
                
                Console.WriteLine($"Transaction input created successfully");
                Console.WriteLine($"From: {transactionInput.From}");
                Console.WriteLine($"To: {transactionInput.To}");
                Console.WriteLine($"Value: {transactionInput.Value.Value}");
                Console.WriteLine($"Data length: {transactionInput.Data.Length}");
                
                // Send the transaction
                var transactionHash = await web3.Eth.TransactionManager.SendTransactionAsync(transactionInput);
                Console.WriteLine($"Transaction hash: {transactionHash}");
                
                return Ok(new
                {
                    message = "Item purchased with ETH successfully",
                    transactionHash = transactionHash,
                    inmateAddress = request.InmateAddress,
                    item = request.Item,
                    amountInEth = request.AmountInEth,
                    amountInWei = amountInWei.ToString(),
                    accountBalance = accountBalanceInEth.ToString(),
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting function data: {ex.Message}");
                return BadRequest(new { error = $"Function data error: {ex.Message}" });
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in PurchaseItemWithEth: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return BadRequest(new { error = ex.Message, stackTrace = ex.StackTrace });
        }
    }

    [HttpGet("item-price-eth/{itemName}")]
    public async Task<IActionResult> GetItemPriceInEth(string itemName)
    {
        try
        {
            var account = new Account(_privateKey);
            var web3 = new Web3(account, _rpcUrl);
            var contract = web3.Eth.GetContract(_abi, _contractAddress);

            var getItemPriceInEthFunction = contract.GetFunction("getItemPriceInEth");
            var priceInWei = await getItemPriceInEthFunction.CallAsync<System.Numerics.BigInteger>(itemName);
            var priceInEth = Nethereum.Web3.Web3.Convert.FromWei(priceInWei);

            return Ok(new
            {
                itemName = itemName,
                priceInWei = priceInWei.ToString(),
                priceInEth = priceInEth.ToString(),
                message = "Item price retrieved successfully"
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in GetItemPriceInEth: {ex.Message}");
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("inmate-balance/{inmateAddress}")]
    public async Task<IActionResult> GetInmateBalance(string inmateAddress)
    {
        try
        {
            var account = new Account(_privateKey);
            var web3 = new Web3(account, _rpcUrl);
            var contract = web3.Eth.GetContract(_abi, _contractAddress);

            var getBalanceFunction = contract.GetFunction("getBalance");
            var balance = await getBalanceFunction.CallAsync<int>(inmateAddress);

            return Ok(new { 
                inmateAddress = inmateAddress,
                balance = balance,
                message = "Inmate balance retrieved successfully"
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in GetInmateBalance: {ex.Message}");
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("available-items")]
    public IActionResult GetAvailableItems()
    {
        try
        {
            // Define available items in the prison store with ETH prices
            var availableItems = new List<object>
            {
                new { id = 1, name = "Snack Pack", description = "Assorted snacks and treats", costInEth = 0.0001, category = "Food" },
                new { id = 2, name = "Phone Call", description = "15-minute phone call to family", costInEth = 0.0002, category = "Communication" },
                new { id = 3, name = "Extra Meal", description = "Additional meal portion", costInEth = 0.00015, category = "Food" },
                new { id = 4, name = "Reading Material", description = "Books and magazines", costInEth = 0.00005, category = "Entertainment" },
                new { id = 5, name = "Hygiene Kit", description = "Toiletries and personal care items", costInEth = 0.00012, category = "Personal Care" },
                new { id = 6, name = "Exercise Equipment", description = "Basic workout items", costInEth = 0.00016, category = "Fitness" },
                new { id = 7, name = "Art Supplies", description = "Drawing and craft materials", costInEth = 0.00008, category = "Entertainment" },
                new { id = 8, name = "Extended Visitation", description = "Extra 30 minutes with visitors", costInEth = 0.0003, category = "Communication" }
            };

            return Ok(new
            {
                items = availableItems,
                message = "Available items retrieved successfully",
                totalItems = availableItems.Count,
                paymentMethod = "ETH"
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in GetAvailableItems: {ex.Message}");
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("test-item-price/{itemName}")]
    public async Task<IActionResult> TestItemPrice(string itemName)
    {
        try
        {
            var account = new Account(_privateKey);
            var web3 = new Web3(account, _rpcUrl);
            var contract = web3.Eth.GetContract(_abi, _contractAddress);

            var getItemPriceInEthFunction = contract.GetFunction("getItemPriceInEth");
            var priceInWei = await getItemPriceInEthFunction.CallAsync<System.Numerics.BigInteger>(itemName);
            var priceInEth = Nethereum.Web3.Web3.Convert.FromWei(priceInWei);

            // Test if the inmate is registered
            var isInmateFunction = contract.GetFunction("isInmate");
            var testInmate = "0xc6bc4238EB923d214E14B71C167d67b92e159C9E";
            var isRegistered = await isInmateFunction.CallAsync<bool>(testInmate);

            return Ok(new
            {
                itemName = itemName,
                priceInWei = priceInWei.ToString(),
                priceInEth = priceInEth.ToString(),
                testInmate = testInmate,
                isRegistered = isRegistered,
                contractAddress = _contractAddress,
                message = "Item price test completed"
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in TestItemPrice: {ex.Message}");
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("test-eth-transfer")]
    public async Task<IActionResult> TestEthTransfer([FromBody] TestEthTransferRequest request)
    {
        try
        {
            var account = new Account(_privateKey);
            var web3 = new Web3(account, _rpcUrl);
            var contract = web3.Eth.GetContract(_abi, _contractAddress);

            // Convert ETH amount to Wei
            var amountInWei = Nethereum.Web3.Web3.Convert.ToWei(request.AmountInEth);
            
            Console.WriteLine($"Testing ETH transfer of {request.AmountInEth} ETH ({amountInWei} Wei)");

            // Check account balance
            var accountBalance = await web3.Eth.GetBalance.SendRequestAsync(account.Address);
            var accountBalanceInEth = Nethereum.Web3.Web3.Convert.FromWei(accountBalance.Value);
            Console.WriteLine($"Account balance: {accountBalanceInEth} ETH");

            if (accountBalance.Value < amountInWei)
            {
                return BadRequest(new { error = $"Insufficient ETH balance. Required: {request.AmountInEth} ETH, Available: {accountBalanceInEth} ETH" });
            }

            // Send a simple ETH transfer to the contract address
            var transactionInput = new Nethereum.RPC.Eth.DTOs.TransactionInput
            {
                From = account.Address,
                To = _contractAddress,
                Value = new HexBigInteger(amountInWei),
                Gas = new HexBigInteger(21000) // Basic ETH transfer gas
            };

            var transactionHash = await web3.Eth.TransactionManager.SendTransactionAsync(transactionInput);
            Console.WriteLine($"Test ETH transfer transaction hash: {transactionHash}");

            return Ok(new
            {
                message = "Test ETH transfer completed",
                transactionHash = transactionHash,
                amountInEth = request.AmountInEth,
                amountInWei = amountInWei.ToString(),
                accountBalance = accountBalanceInEth.ToString(),
                contractAddress = _contractAddress,
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in TestEthTransfer: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return BadRequest(new { error = ex.Message, stackTrace = ex.StackTrace });
        }
    }

    [HttpGet("test-eth-purchase-verification")]
    public async Task<IActionResult> TestEthPurchaseVerification()
    {
        try
        {
            var account = new Account(_privateKey);
            var web3 = new Web3(account, _rpcUrl);
            var contract = web3.Eth.GetContract(_abi, _contractAddress);

            // Test if the inmate is registered
            var isInmateFunction = contract.GetFunction("isInmate");
            var testInmate = "0xc6bc4238EB923d214E14B71C167d67b92e159C9E";
            var isRegistered = await isInmateFunction.CallAsync<bool>(testInmate);

            // Get the inmate's balance
            var getBalanceFunction = contract.GetFunction("getBalance");
            var balance = await getBalanceFunction.CallAsync<int>(testInmate);

            // Get contract ETH balance
            var getContractBalanceFunction = contract.GetFunction("getContractEthBalance");
            var contractBalance = await getContractBalanceFunction.CallAsync<System.Numerics.BigInteger>();

            // Try to get the latest block number to check for recent transactions
            var latestBlock = await web3.Eth.Blocks.GetBlockNumber.SendRequestAsync();

            return Ok(new
            {
                testInmate = testInmate,
                isRegistered = isRegistered,
                inmateBalance = balance,
                contractEthBalance = contractBalance.ToString(),
                contractEthBalanceInEth = Nethereum.Web3.Web3.Convert.FromWei(contractBalance).ToString(),
                latestBlockNumber = latestBlock.Value.ToString(),
                contractAddress = _contractAddress,
                message = "ETH purchase verification test completed"
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in TestEthPurchaseVerification: {ex.Message}");
            return BadRequest(new { error = ex.Message });
        }
    }

    // Define this model to match your Solidity Transaction struct

    public class TestEthTransferRequest
    {
        public decimal AmountInEth { get; set; }
    }

    [HttpGet("transaction-details/{transactionHash}")]
    public async Task<IActionResult> GetTransactionDetails(string transactionHash)
    {
        try
        {
            var web3 = new Web3(_rpcUrl);
            
            // Get transaction receipt
            var transactionReceipt = await web3.Eth.Transactions.GetTransactionReceipt.SendRequestAsync(transactionHash);
            
            // Get transaction details
            var transaction = await web3.Eth.Transactions.GetTransactionByHash.SendRequestAsync(transactionHash);
            
            // Get block information
            var block = await web3.Eth.Blocks.GetBlockWithTransactionsByNumber.SendRequestAsync(transaction.BlockNumber);
            
            return Ok(new
            {
                transactionHash = transactionHash,
                blockNumber = transaction.BlockNumber.Value.ToString(),
                blockTime = block.Timestamp.Value.ToString(),
                from = transaction.From,
                to = transaction.To,
                value = transaction.Value.Value.ToString(),
                valueInEth = Nethereum.Web3.Web3.Convert.FromWei(transaction.Value.Value).ToString(),
                gasUsed = transactionReceipt?.GasUsed.Value.ToString() ?? "Unknown",
                gasPrice = transaction.GasPrice.Value.ToString(),
                status = transactionReceipt?.Status.Value.ToString() ?? "Unknown",
                contractAddress = _contractAddress,
                isContractTransaction = transaction.To?.ToLower() == _contractAddress.ToLower(),
                message = "Transaction details retrieved successfully"
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error getting transaction details: {ex.Message}");
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("all-blockchain-transactions")]
    public async Task<IActionResult> GetAllBlockchainTransactions()
    {
        try
        {
            var web3 = new Web3(_rpcUrl);
            var account = new Account(_privateKey);
            
            // Get latest block number
            var latestBlock = await web3.Eth.Blocks.GetBlockNumber.SendRequestAsync();
            var transactions = new List<object>();
            
            // Get transactions from the last 10 blocks
            var startBlock = Math.Max(0, (int)(latestBlock.Value - 10));
            
            for (var blockNumber = startBlock; blockNumber <= (int)latestBlock.Value; blockNumber++)
            {
                try
                {
                    var block = await web3.Eth.Blocks.GetBlockWithTransactionsByNumber.SendRequestAsync(new HexBigInteger(blockNumber));
                    
                    foreach (var transaction in block.Transactions)
                    {
                        // Check if this transaction involves our contract
                        if (transaction.To?.ToLower() == _contractAddress.ToLower() || 
                            transaction.From?.ToLower() == account.Address.ToLower())
                        {
                            transactions.Add(new
                            {
                                blockNumber = blockNumber.ToString(),
                                blockTime = block.Timestamp.Value.ToString(),
                                transactionHash = transaction.TransactionHash,
                                from = transaction.From,
                                to = transaction.To,
                                value = transaction.Value.Value.ToString(),
                                valueInEth = Nethereum.Web3.Web3.Convert.FromWei(transaction.Value.Value).ToString(),
                                gasPrice = transaction.GasPrice.Value.ToString(),
                                isContractTransaction = transaction.To?.ToLower() == _contractAddress.ToLower(),
                                isFromOperator = transaction.From?.ToLower() == account.Address.ToLower()
                            });
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error getting block {blockNumber}: {ex.Message}");
                }
            }
            
            return Ok(new
            {
                totalTransactions = transactions.Count,
                transactions = transactions,
                contractAddress = _contractAddress,
                operatorAddress = account.Address,
                latestBlock = latestBlock.Value.ToString(),
                message = "Blockchain transactions retrieved successfully"
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error getting blockchain transactions: {ex.Message}");
            return BadRequest(new { error = ex.Message });
        }
    }
}
