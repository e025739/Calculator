using CalculatorApi.Models;
using CalculatorApi.Operations;

namespace CalculatorApi.Services;

/// <summary>
/// Performs arithmetic calculations using the Strategy Pattern.
/// Each operator is mapped to an IOperation implementation,
/// so adding a new operation requires no changes to this class (Open/Closed Principle).
/// </summary>
public class CalculatorService : ICalculatorService
{
    private readonly Dictionary<string, IOperation> _operations;

    public CalculatorService(Dictionary<string, IOperation> operations)
    {
        _operations = operations;
    }

    public CalculationResult Calculate(CalculationRequest request)
    {
        if (!_operations.TryGetValue(request.Operator, out var operation))
            throw new ArgumentException($"Unsupported operator: '{request.Operator}'. Supported: +, -, *, /");

        var result = operation.Execute(request.Operand1, request.Operand2);

        return new CalculationResult { Result = result };
    }
}
