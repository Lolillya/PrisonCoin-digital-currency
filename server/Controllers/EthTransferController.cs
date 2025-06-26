using Microsoft.AspNetCore.Mvc;
using Nethereum.Web3;
using Nethereum.Web3.Accounts;
using System.IO;
using System.Threading.Tasks;
using server.Models;

[ApiController]
[Route("api/[controller]")]
public class EthTransferController : ControllerBase
{
    private readonly string _privateKey = "0xba5da40da9963ef6204d0463a1535b431cb075c7576d817404d3e5823fe09dbd";
    private readonly string _rpcUrl = "http://host.docker.internal:7545";
    private readonly string _contractAddress = "0x2cf9eba87A0930a87046E5c4Cfe6ae6E76dd98Dd"; // Update with deployed contract address
    private readonly string _abi;

    public EthTransferController()
    {
        var abiPath = Path.Combine(Directory.GetCurrentDirectory(), "ABI", "EthTransferABI.json");
        _abi = System.IO.File.ReadAllText(abiPath);
    }

    [HttpPost("send-eth")]
    public async Task<IActionResult> SendEth([FromBody] SendEthRequest request)
    {
        try
        {
            var account = new Account(_privateKey);
            var web3 = new Web3(account, _rpcUrl);
            var contract = web3.Eth.GetContract(_abi, _contractAddress);

            var sendEthFunction = contract.GetFunction("sendEth");

            var gas = await sendEthFunction.EstimateGasAsync(account.Address, null, null, request.ToAddress, request.Amount, request.Reason);
            var transactionHash = await sendEthFunction.SendTransactionAsync(account.Address, gas, null, null, request.ToAddress, request.Amount, request.Reason);

            return Ok(new
            {
                message = "ETH sent successfully",
                transactionHash = transactionHash,
                to = request.ToAddress,
                amount = request.Amount,
                reason = request.Reason
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("send-eth-batch")]
    public async Task<IActionResult> SendEthBatch([FromBody] SendEthBatchRequest request)
    {
        try
        {
            var account = new Account(_privateKey);
            var web3 = new Web3(account, _rpcUrl);
            var contract = web3.Eth.GetContract(_abi, _contractAddress);

            var sendEthBatchFunction = contract.GetFunction("sendEthBatch");

            var gas = await sendEthBatchFunction.EstimateGasAsync(account.Address, null, null, request.Recipients, request.Amounts, request.Reason);
            var transactionHash = await sendEthBatchFunction.SendTransactionAsync(account.Address, gas, null, null, request.Recipients, request.Amounts, request.Reason);

            return Ok(new
            {
                message = "Batch ETH transfer completed successfully",
                transactionHash = transactionHash,
                recipients = request.Recipients,
                amounts = request.Amounts,
                reason = request.Reason
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("treasury-send-eth")]
    public async Task<IActionResult> TreasurySendEth([FromBody] SendEthRequest request)
    {
        try
        {
            var account = new Account(_privateKey);
            var web3 = new Web3(account, _rpcUrl);
            var contract = web3.Eth.GetContract(_abi, _contractAddress);

            var treasurySendEthFunction = contract.GetFunction("treasurySendEth");

            var gas = await treasurySendEthFunction.EstimateGasAsync(account.Address, null, null, request.ToAddress, request.Amount, request.Reason);
            var transactionHash = await treasurySendEthFunction.SendTransactionAsync(account.Address, gas, null, null, request.ToAddress, request.Amount, request.Reason);

            return Ok(new
            {
                message = "Treasury ETH transfer completed successfully",
                transactionHash = transactionHash,
                to = request.ToAddress,
                amount = request.Amount,
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

            var gas = await withdrawEthFunction.EstimateGasAsync(account.Address, null, null, request.ToAddress, request.Amount);
            var transactionHash = await withdrawEthFunction.SendTransactionAsync(account.Address, gas, null, null, request.ToAddress, request.Amount);

            return Ok(new
            {
                message = "ETH withdrawn successfully",
                transactionHash = transactionHash,
                to = request.ToAddress,
                amount = request.Amount
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("contract-balance")]
    public async Task<IActionResult> GetContractBalance()
    {
        try
        {
            var account = new Account(_privateKey);
            var web3 = new Web3(account, _rpcUrl);
            var contract = web3.Eth.GetContract(_abi, _contractAddress);

            var getContractBalanceFunction = contract.GetFunction("getContractBalance");
            var balance = await getContractBalanceFunction.CallAsync<System.Numerics.BigInteger>();

            var ethBalance = Nethereum.Web3.Web3.Convert.FromWei(balance);

            return Ok(new { 
                balance = balance.ToString(),
                ethBalance = ethBalance.ToString()
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("update-treasury")]
    public async Task<IActionResult> UpdateTreasury([FromBody] UpdateTreasuryRequest request)
    {
        try
        {
            var account = new Account(_privateKey);
            var web3 = new Web3(account, _rpcUrl);
            var contract = web3.Eth.GetContract(_abi, _contractAddress);

            var updateTreasuryFunction = contract.GetFunction("updateTreasury");

            var gas = await updateTreasuryFunction.EstimateGasAsync(account.Address, null, null, request.NewTreasuryAddress);
            var transactionHash = await updateTreasuryFunction.SendTransactionAsync(account.Address, gas, null, null, request.NewTreasuryAddress);

            return Ok(new
            {
                message = "Treasury address updated successfully",
                transactionHash = transactionHash,
                newTreasuryAddress = request.NewTreasuryAddress
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("update-operator")]
    public async Task<IActionResult> UpdateOperator([FromBody] UpdateOperatorRequest request)
    {
        try
        {
            var account = new Account(_privateKey);
            var web3 = new Web3(account, _rpcUrl);
            var contract = web3.Eth.GetContract(_abi, _contractAddress);

            var updateOperatorFunction = contract.GetFunction("updateOperator");

            var gas = await updateOperatorFunction.EstimateGasAsync(account.Address, null, null, request.NewOperatorAddress);
            var transactionHash = await updateOperatorFunction.SendTransactionAsync(account.Address, gas, null, null, request.NewOperatorAddress);

            return Ok(new
            {
                message = "Operator address updated successfully",
                transactionHash = transactionHash,
                newOperatorAddress = request.NewOperatorAddress
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("transfer-operator-to-treasury")]
    public async Task<IActionResult> TransferOperatorToTreasury()
    {
        try
        {
            var account = new Account(_privateKey);
            var web3 = new Web3(account, _rpcUrl);
            var contract = web3.Eth.GetContract(_abi, _contractAddress);

            var transferOperatorFunction = contract.GetFunction("transferOperatorToTreasury");

            var gas = await transferOperatorFunction.EstimateGasAsync(account.Address, null, null);
            var transactionHash = await transferOperatorFunction.SendTransactionAsync(account.Address, gas, null, null);

            return Ok(new
            {
                message = "Operator role transferred to treasury successfully",
                transactionHash = transactionHash
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
} 