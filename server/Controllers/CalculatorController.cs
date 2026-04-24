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
public class CalculatorController : ControllerBase
{
    private readonly ICalculatorService _calculatorService;
    private readonly IMemoryService _memoryService;

    public CalculatorController(ICalculatorService calculatorService, IMemoryService memoryService)
    {
        _calculatorService = calculatorService;
        _memoryService = memoryService;
    }

    /// <summary>
    /// Performs an arithmetic calculation (operand1 operator operand2).
    /// </summary>
    [HttpPost("calculate")]
    public ActionResult<CalculationResult> Calculate([FromBody] CalculationRequest request)
    {
        var result = _calculatorService.Calculate(request);
        return Ok(result);
    }

    /// <summary>
    /// Returns the current memory value.
    /// </summary>
    [HttpGet("memory/get")]
    public ActionResult<double> GetMemory()
    {
        var value = _memoryService.GetMemory();
        return Ok(value);
    }

    /// <summary>
    /// Adds the given value to memory.
    /// </summary>
    [HttpPost("memory/add")]
    public ActionResult AddToMemory([FromBody] MemoryRequest request)
    {
        _memoryService.AddToMemory(request.Value);
        return Ok();
    }

    /// <summary>
    /// Subtracts the given value from memory.
    /// </summary>
    [HttpPost("memory/subtract")]
    public ActionResult SubtractFromMemory([FromBody] MemoryRequest request)
    {
        _memoryService.SubtractFromMemory(request.Value);
        return Ok();
    }
}
