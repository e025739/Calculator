using CalculatorApi.Operations;

namespace CalculatorApi.Handlers;

/// <summary>
/// Processes arithmetic operators of a specific precedence level within an expression.
/// Uses the Strategy Pattern (IOperation) to perform individual calculations,
/// then delegates remaining operators to the next handler in the chain.
/// </summary>
public sealed class PrecedenceHandler : IPrecedenceHandler
{
    private readonly HashSet<string> _handledOperators;
    private readonly Dictionary<string, IOperation> _operations;
    private readonly IPrecedenceHandler? _next;

    public PrecedenceHandler(IReadOnlyList<string> handledOperators, Dictionary<string, IOperation> operations, IPrecedenceHandler? next = null)
    {
        _handledOperators = new HashSet<string>(handledOperators);
        _operations = operations;
        _next = next;
    }

    public (List<double> operands, List<string> operators) Handle(List<double> operands, List<string> operators)
    {
        // Clone to avoid mutating the caller's data
        var currentOperands = new List<double>(operands);
        var currentOperators = new List<string>(operators);

        for (int i = 0; i < currentOperators.Count;)
        {
            if (_handledOperators.Contains(currentOperators[i]))
            {
                var result = _operations[currentOperators[i]].Execute(currentOperands[i], currentOperands[i + 1]);
                currentOperands[i] = result;
                currentOperands.RemoveAt(i + 1);
                currentOperators.RemoveAt(i);
                // Don't advance i — the next operator shifted into this position
            }
            else
            {
                i++;
            }
        }

        return _next != null ? _next.Handle(currentOperands, currentOperators) : (currentOperands, currentOperators);
    }
}
