using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using server.Models;

namespace server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InmatesController : ControllerBase
    {
        [HttpPost("register")]
        public IActionResult RegisterInmate([FromBody] InmateModel inmate)
        {

            return Ok(new { success = true, wallet = inmate.WalletAddress });
        }

    }
}