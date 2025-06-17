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
    private readonly string _privateKey = "0x8069158ea891c49f76eb4ed9460aa26c267c127f7f08befde570eb433f38e149"; // no '0x'
    private readonly string _rpcUrl = "http://host.docker.internal:7545";
    private readonly string _contractAddress = "0x26e2425022e9325917fA2154E81b9D964ead4a8f";
    private readonly string _abi;

    private static List<InmateModel> _inmates = new List<InmateModel>();

    public InmateController()
    {
        var abiPath = Path.Combine(Directory.GetCurrentDirectory(), "ABI", "PrisonCoinABI.json");
        _abi = System.IO.File.ReadAllText(abiPath);
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

    [HttpPost("exchange")]
    public async Task<IActionResult> ExchangeTokens([FromBody] ExchangeRequestModel request)
    {
        try
        {
            var account = new Account(_privateKey);
            var web3 = new Web3(account, _rpcUrl);
            var contract = web3.Eth.GetContract(_abi, _contractAddress);

            var depositFunction = contract.GetFunction("depositTokens");

            var gas = await depositFunction.EstimateGasAsync(account.Address, null, null, request.InmateAddress, request.Amount);

            var transactionHash = await depositFunction.SendTransactionAsync(account.Address, gas, null, null, request.InmateAddress, request.Amount);

            return Ok(new
            {
                message = "Tokens deposited successfully.",
                transactionHash = transactionHash
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("token-balance/{address}")]
    public async Task<IActionResult> GetTokenBalance(string address)
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


}
