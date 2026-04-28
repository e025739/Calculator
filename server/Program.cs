using CalculatorApi;
using CalculatorApi.Handlers;
using CalculatorApi.Middleware;
using CalculatorApi.Operations;
using CalculatorApi.Services;

var builder = WebApplication.CreateBuilder(args);

// --- Register Services (Dependency Injection) ---

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Strategy Pattern: register each IOperation implementation in DI
builder.Services.AddSingleton<AddOperation>();
builder.Services.AddSingleton<SubtractOperation>();
builder.Services.AddSingleton<MultiplyOperation>();
builder.Services.AddSingleton<DivideOperation>();

// Build the operator-to-operation dictionary from DI-registered services
builder.Services.AddSingleton<Dictionary<string, IOperation>>(sp => new Dictionary<string, IOperation>
{
    { "+", sp.GetRequiredService<AddOperation>() },
    { "-", sp.GetRequiredService<SubtractOperation>() },
    { "*", sp.GetRequiredService<MultiplyOperation>() },
    { "/", sp.GetRequiredService<DivideOperation>() }
});

// Chain of Responsibility: high-precedence operators (* /) are evaluated before low-precedence (+ -)
builder.Services.AddSingleton<IPrecedenceHandler>(sp =>
{
    var ops = sp.GetRequiredService<Dictionary<string, IOperation>>();
    var lowPrecedence = new PrecedenceHandler(SupportedOperators.LowPrecedence, ops, next: null);
    return new PrecedenceHandler(SupportedOperators.HighPrecedence, ops, next: lowPrecedence);
});

builder.Services.AddSingleton<ICalculatorService, CalculatorService>();

// Memory service — registered as Singleton so the value persists across HTTP requests.
// Note: In a multi-user environment, all users share the same memory value.
// To support per-user memory, we would store values in a ConcurrentDictionary<string, double>
// keyed by a session/user identifier, and add a cleanup strategy (e.g. TTL expiration)
// to prevent memory leaks from abandoned sessions.
builder.Services.AddSingleton<IMemoryService, MemoryService>();

// CORS — allow only the configured client origins to communicate with the API
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
if (allowedOrigins.Length == 0)
    throw new InvalidOperationException("Cors:AllowedOrigins must be configured in appsettings.");
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowClient", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// --- Configure Middleware Pipeline ---

// Global error handling — catches exceptions and returns uniform JSON responses
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowClient");
app.MapControllers();

app.Run();
