using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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

    // Handle CORS preflight requests
    [HttpOptions("register")]
    public IActionResult HandleOptions()
    {
        Response.Headers.Add("Access-Control-Allow-Origin", "*");
        Response.Headers.Add("Access-Control-Allow-Methods", "POST, OPTIONS");
        Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type");
        return Ok();
    }

    [HttpPost("register")]
    public async Task<IActionResult> RegisterInmate([FromBody] object rawData)
    {
        try
        {
            Console.WriteLine($"InmatesDBController: Received raw data type: {rawData?.GetType().Name}");
            
            // Convert to JSON string and back to ensure proper deserialization
            var jsonString = System.Text.Json.JsonSerializer.Serialize(rawData);
            Console.WriteLine($"Serialized JSON: {jsonString}");
            
            var model = System.Text.Json.JsonSerializer.Deserialize<InmateModel>(jsonString);
            
            if (model == null)
            {
                Console.WriteLine("ERROR: Failed to deserialize to InmateModel");
                return BadRequest(new { error = "Invalid data format" });
            }

            // Log the received data for debugging
            Console.WriteLine($"InmatesDBController: Received inmate registration data:");
            Console.WriteLine($"  InmateNumber: {model.InmateNumber}");
            Console.WriteLine($"  FullName: {model.FullName}");
            Console.WriteLine($"  Address: {model.Address}");
            Console.WriteLine($"  Height: {model.Height}");
            Console.WriteLine($"  Weight: {model.Weight}");
            Console.WriteLine($"  ArrestingOfficer: {model.ArrestingOfficer}");
            Console.WriteLine($"  ArrestDate: {model.ArrestDate}");
            Console.WriteLine($"  ArrestTime: {model.ArrestTime}");
            Console.WriteLine($"  ArrestLocation: {model.ArrestLocation}");
            Console.WriteLine($"  Charges: {model.Charges}");
            Console.WriteLine($"  FingerprintHash: {model.FingerprintHash}");
            Console.WriteLine($"  WalletAddress: {model.WalletAddress}");
            Console.WriteLine($"  InitialBalance: {model.InitialBalance}");
            Console.WriteLine($"  DailySpendingLimit: {model.DailySpendingLimit}");

            // Validate required fields
            if (string.IsNullOrEmpty(model.InmateNumber))
            {
                Console.WriteLine("ERROR: InmateNumber is null or empty");
                return BadRequest(new { error = "InmateNumber is required" });
            }

            if (string.IsNullOrEmpty(model.FullName))
            {
                Console.WriteLine("ERROR: FullName is null or empty");
                return BadRequest(new { error = "FullName is required" });
            }

            Console.WriteLine("Validation passed, checking for existing inmate...");

            // Check if inmate number already exists
            var existingInmate = await _context.Inmates.FirstOrDefaultAsync(i => i.InmateNumber == model.InmateNumber);
            if (existingInmate != null)
            {
                Console.WriteLine($"ERROR: Inmate with number {model.InmateNumber} already exists");
                return BadRequest(new { error = $"Inmate with number {model.InmateNumber} already exists" });
            }

            Console.WriteLine("No existing inmate found, proceeding to save...");

            // Save to database
            Console.WriteLine("Adding inmate to context...");
            _context.Inmates.Add(model);
            
            Console.WriteLine("Calling SaveChangesAsync...");
            var result = await _context.SaveChangesAsync();
            Console.WriteLine($"SaveChangesAsync completed. Rows affected: {result}");

            Console.WriteLine($"InmatesDBController: Successfully saved inmate with ID: {model.Id}");

            return Ok(new 
            { 
                message = "Inmate registered successfully in database", 
                id = model.Id,
                inmateNumber = model.InmateNumber,
                fullName = model.FullName,
                rowsAffected = result
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"InmatesDBController: Error registering inmate: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return BadRequest(new { error = ex.Message });
        }
    }

    // Add a simple GET endpoint to test if the controller is accessible
    [HttpGet("test")]
    public IActionResult Test()
    {
        return Ok(new { message = "InmatesDBController is working!" });
    }

    // Test database connection
    [HttpGet("test-db")]
    public async Task<IActionResult> TestDatabase()
    {
        try
        {
            Console.WriteLine("Testing database connection...");
            
            // Test if we can query the database
            var inmateCount = await _context.Inmates.CountAsync();
            Console.WriteLine($"Database connection successful. Current inmate count: {inmateCount}");
            
            return Ok(new { 
                message = "Database connection successful", 
                inmateCount = inmateCount 
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Database connection failed: {ex.Message}");
            return BadRequest(new { error = ex.Message });
        }
    }

    // Add an endpoint to get all inmates
    [HttpGet("all")]
    public async Task<IActionResult> GetAllInmates()
    {
        try
        {
            var inmates = await _context.Inmates.ToListAsync();
            return Ok(new { inmates = inmates });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error getting inmates: {ex.Message}");
            return BadRequest(new { error = ex.Message });
        }
    }
}
