using Microsoft.AspNetCore.Mvc;
using Nethereum.Web3;
using Nethereum.Web3.Accounts;
using System.IO;
using System.Threading.Tasks;
using server.Models;

[ApiController]
[Route("api/[controller]")]
public class InmateController : ControllerBase
{
    // DEPLOYED CONTRACT ADDRESS 0x60944c759F5E416005F6f88823A924C7d2EEbE6B
    private readonly string _privateKey = "0xba5da40da9963ef6204d0463a1535b431cb075c7576d817404d3e5823fe09dbd"; // no '0x'
    private readonly string _rpcUrl = "http://host.docker.internal:7545";
    private readonly string _contractAddress = "0xb2a7B8e7865465E9b976298E9D9E4EFe967e26f0";
    private readonly string _abi;

    private static List<InmateModel> _inmates = new List<InmateModel>();

    public InmateController()
    {
        var abiPath = Path.Combine(Directory.GetCurrentDirectory(), "ABI", "PrisonCoinABI.json");
        _abi = System.IO.File.ReadAllText(abiPath);
    }

    [HttpPost("register")]
    public async Task<IActionResult> RegisterInmate([FromBody] object inmateData)
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
            var totalIncoming = 0;
            var totalOutgoing = 0;

            foreach (var inmate in inmates)
            {
                try
                {
                    // Get transaction counts using raw calls
                    var getIncomingFunction = contract.GetFunction("getIncomingTransactions");
                    var incomingRaw = await getIncomingFunction.CallAsync<object[]>(inmate);
                    var incomingCount = incomingRaw?.Length ?? 0;
                    totalIncoming += incomingCount;

                    var getOutgoingFunction = contract.GetFunction("getOutgoingTransactions");
                    var outgoingRaw = await getOutgoingFunction.CallAsync<object[]>(inmate);
                    var outgoingCount = outgoingRaw?.Length ?? 0;
                    totalOutgoing += outgoingCount;

                    summary.Add(new
                    {
                        inmate = inmate,
                        incomingCount = incomingCount,
                        outgoingCount = outgoingCount,
                        totalTransactions = incomingCount + outgoingCount
                    });
                }
                catch (Exception ex)
                {
                    summary.Add(new
                    {
                        inmate = inmate,
                        error = ex.Message,
                        incomingCount = 0,
                        outgoingCount = 0,
                        totalTransactions = 0
                    });
                }
            }

            return Ok(new
            {
                totalInmates = inmates.Count,
                totalIncomingTransactions = totalIncoming,
                totalOutgoingTransactions = totalOutgoing,
                totalTransactions = totalIncoming + totalOutgoing,
                inmateSummary = summary,
                contractAddress = _contractAddress
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

            // Call the smart contract function to purchase the item with ETH
            var gas = await purchaseItemWithEthFunction.EstimateGasAsync(account.Address, null, amountInWei, request.InmateAddress, request.Item, amountInWei);
            var transactionHash = await purchaseItemWithEthFunction.SendTransactionAsync(account.Address, gas, null, amountInWei, request.InmateAddress, request.Item, amountInWei);

            return Ok(new
            {
                message = "Item purchased with ETH successfully",
                transactionHash = transactionHash,
                inmateAddress = request.InmateAddress,
                item = request.Item,
                amountInEth = request.AmountInEth,
                amountInWei = amountInWei.ToString(),
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in PurchaseItemWithEth: {ex.Message}");
            return BadRequest(new { error = ex.Message });
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
    public async Task<IActionResult> GetAvailableItems()
    {
        try
        {
            // Define available items in the prison store with ETH prices
            var availableItems = new List<object>
            {
                new { id = 1, name = "Snack Pack", description = "Assorted snacks and treats", costInEth = 0.001, category = "Food" },
                new { id = 2, name = "Phone Call", description = "15-minute phone call to family", costInEth = 0.002, category = "Communication" },
                new { id = 3, name = "Extra Meal", description = "Additional meal portion", costInEth = 0.0015, category = "Food" },
                new { id = 4, name = "Reading Material", description = "Books and magazines", costInEth = 0.0005, category = "Entertainment" },
                new { id = 5, name = "Hygiene Kit", description = "Toiletries and personal care items", costInEth = 0.0012, category = "Personal Care" },
                new { id = 6, name = "Exercise Equipment", description = "Basic workout items", costInEth = 0.0016, category = "Fitness" },
                new { id = 7, name = "Art Supplies", description = "Drawing and craft materials", costInEth = 0.0008, category = "Entertainment" },
                new { id = 8, name = "Extended Visitation", description = "Extra 30 minutes with visitors", costInEth = 0.003, category = "Communication" }
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

    // Define this model to match your Solidity Transaction struct

}
