namespace CalculatorApi.Models;

/// <summary>
/// Represents a request to modify the calculator's memory value.
/// The Value is the number currently displayed on the calculator screen.
/// </summary>
public record MemoryRequest(double Value);
