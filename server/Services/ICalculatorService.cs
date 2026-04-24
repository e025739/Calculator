using CalculatorApi.Models;

namespace CalculatorApi.Services;

/// <summary>
/// Defines the contract for performing arithmetic calculations.
/// </summary>
public interface ICalculatorService
{
    CalculationResult Calculate(CalculationRequest request);
}
