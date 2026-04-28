using CalculatorApi.Handlers;
using CalculatorApi.Models;

namespace CalculatorApi.Services;

/// <summary>
/// Evaluates arithmetic expressions using the Chain of Responsibility pattern.
/// Delegates precedence-aware evaluation to the injected handler chain.
/// </summary>
public sealed class CalculatorService : ICalculatorService
{
    private readonly IPrecedenceHandler _handler;

    public CalculatorService(IPrecedenceHandler handler)
    {
        _handler = handler;
    }

    public CalculationResult Calculate(CalculationRequest request)
    {
        var (resultOperands, _) = _handler.Handle(request.Operands, request.Operators);

        return new CalculationResult(resultOperands[0]);
    }
}
