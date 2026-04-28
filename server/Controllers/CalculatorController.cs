using CalculatorApi.Models;
using CalculatorApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace CalculatorApi.Controllers;

/// <summary>
/// REST API controller for calculator operations and memory management.
/// Error handling is delegated to the global ExceptionHandlingMiddleware.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public sealed class CalculatorController : ControllerBase
{
    private readonly ICalculatorService _calculatorService;
    private readonly IMemoryService _memoryService;
    private readonly ILogger<CalculatorController> _logger;

    public CalculatorController(
        ICalculatorService calculatorService,
        IMemoryService memoryService,
        ILogger<CalculatorController> logger)
    {
        _calculatorService = calculatorService;
        _memoryService = memoryService;
        _logger = logger;
    }

    /// <summary>
    /// Evaluates an arithmetic expression with operator precedence (* / before + -).
    /// </summary>
    [HttpPost("calculate")]
    [ProducesResponseType(typeof(CalculationResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public ActionResult<CalculationResult> Calculate([FromBody] CalculationRequest request)
    {
        _logger.LogInformation("Calculate request: {OperandCount} operands, {OperatorCount} operators",
            request.Operands.Count, request.Operators.Count);
        var result = _calculatorService.Calculate(request);
        return Ok(result);
    }

    [HttpGet("memory")]
    [ProducesResponseType(typeof(double), StatusCodes.Status200OK)]
    public ActionResult<double> GetMemory()
    {
        var value = _memoryService.GetMemory();
        return Ok(value);
    }

    [HttpPost("memory/add")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public ActionResult AddToMemory([FromBody] MemoryRequest request)
    {
        _logger.LogInformation("Memory add: {Value}", request.Value);
        _memoryService.AddToMemory(request.Value);
        return Ok();
    }

    [HttpPost("memory/subtract")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public ActionResult SubtractFromMemory([FromBody] MemoryRequest request)
    {
        _logger.LogInformation("Memory subtract: {Value}", request.Value);
        _memoryService.SubtractFromMemory(request.Value);
        return Ok();
    }

    [HttpPost("memory/clear")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public ActionResult ClearMemory()
    {
        _logger.LogInformation("Memory cleared");
        _memoryService.ClearMemory();
        return Ok();
    }
}
