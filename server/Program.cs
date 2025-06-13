var builder = WebApplication.CreateBuilder(args);

// Register controllers — this is required!
builder.Services.AddControllers();

// Add CORS services
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Enable CORS
app.UseCors();

// Enable routing and controller mapping
app.MapControllers();

app.Run();
