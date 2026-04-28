using CalculatorApi.Models;

namespace CalculatorApi.Services;

public interface ICalculatorService
{
    CalculationResult Calculate(CalculationRequest request);
}
