using Microsoft.AspNetCore.Mvc;
using server.Data;
using server.Models;

[ApiController]
[Route("api/[controller]")]
public class InmatesDBController : ControllerBase
{
    private readonly ApplicationDBContext _context;

    public InmatesDBController(ApplicationDBContext context)
    {
        _context = context;
    }

    [HttpPost("register")]
    public async Task<IActionResult> RegisterInmate([FromBody] InmateModel model)
    {
        _context.Inmates.Add(model);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Inmate registered successfully", id = model.Id });
    }
}
