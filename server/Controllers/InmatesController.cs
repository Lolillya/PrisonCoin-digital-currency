using Microsoft.AspNetCore.Mvc;
using Nethereum.Web3;
using Nethereum.Web3.Accounts;
using System.IO;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class InmateController : ControllerBase
{
    private readonly string _privateKey = "8e520b4fbe726f199d9a12c6bc51ab1ad4227b6b2d13bc67dcbacd2e8f0a63e9"; // no '0x'
    private readonly string _rpcUrl = "http://127.0.0.1:7545";
    private readonly string _contractAddress = "0xFF7F6211f7950E541b2DAC89b6f11ACD6582E374";
    private readonly string _abi;

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
}
