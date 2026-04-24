using CalculatorApi.Middleware;
using CalculatorApi.Operations;
using CalculatorApi.Services;

var builder = WebApplication.CreateBuilder(args);

// --- Register Services (Dependency Injection) ---

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Strategy Pattern: map each operator to its IOperation implementation
builder.Services.AddTransient<ICalculatorService>(provider =>
{
    var operations = new Dictionary<string, IOperation>
    {
        { "+", new AddOperation() },
        { "-", new SubtractOperation() },
        { "*", new MultiplyOperation() },
        { "/", new DivideOperation() }
    };
    return new CalculatorService(operations);
});

// Memory service — Singleton so the value persists across HTTP requests
builder.Services.AddSingleton<IMemoryService, MemoryService>();

// CORS — allow the React client to communicate with the API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowClient", policy =>
    {
        policy.AllowAnyOrigin()
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
