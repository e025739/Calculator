using CalculatorApi;
using CalculatorApi.Handlers;
using CalculatorApi.Operations;

namespace CalculatorApi.Tests;

public class PrecedenceHandlerTests
{
    private readonly IPrecedenceHandler _handler;

    public PrecedenceHandlerTests()
    {
        var operations = new Dictionary<string, IOperation>
        {
            { "+", new AddOperation() },
            { "-", new SubtractOperation() },
            { "*", new MultiplyOperation() },
            { "/", new DivideOperation() }
        };

        var lowPrecedence = new PrecedenceHandler(SupportedOperators.LowPrecedence, operations, next: null);
        _handler = new PrecedenceHandler(SupportedOperators.HighPrecedence, operations, next: lowPrecedence);
    }

    [Fact]
    public void Handle_SimpleAddition_ReturnsSum()
    {
        var (operands, _) = _handler.Handle([2, 3], ["+"]);

        Assert.Single(operands);
        Assert.Equal(5, operands[0]);
    }

    [Fact]
    public void Handle_MultiplicationBeforeAddition_RespectsOperatorPrecedence()
    {
        // 2 + 3 * 4 = 14 (not 20)
        var (operands, _) = _handler.Handle([2, 3, 4], ["+", "*"]);

        Assert.Single(operands);
        Assert.Equal(14, operands[0]);
    }

    [Fact]
    public void Handle_DivisionBeforeSubtraction_RespectsOperatorPrecedence()
    {
        // 10 - 6 / 3 = 8 (not 1.33)
        var (operands, _) = _handler.Handle([10, 6, 3], ["-", "/"]);

        Assert.Single(operands);
        Assert.Equal(8, operands[0]);
    }

    [Fact]
    public void Handle_ComplexExpression_EvaluatesCorrectly()
    {
        // 2 - 4 + 8 / 6 * 10 = 2 - 4 + 13.333... = 11.333...
        var (operands, _) = _handler.Handle([2, 4, 8, 6, 10], ["-", "+", "/", "*"]);

        Assert.Single(operands);
        Assert.Equal(2 - 4 + 8.0 / 6 * 10, operands[0], precision: 10);
    }

    [Fact]
    public void Handle_DivisionByZero_ThrowsDivideByZeroException()
    {
        Assert.Throws<DivideByZeroException>(() =>
            _handler.Handle([10, 0], ["/"]));
    }

    [Fact]
    public void Handle_DoesNotMutateInputLists()
    {
        var operands = new List<double> { 2, 3, 4 };
        var operators = new List<string> { "+", "*" };

        _handler.Handle(operands, operators);

        Assert.Equal(3, operands.Count);
        Assert.Equal(2, operators.Count);
    }

    [Fact]
    public void Handle_AllHighPrecedence_EvaluatesLeftToRight()
    {
        // 12 / 3 * 2 = 8
        var (operands, _) = _handler.Handle([12, 3, 2], ["/", "*"]);

        Assert.Single(operands);
        Assert.Equal(8, operands[0]);
    }

    [Fact]
    public void Handle_AllLowPrecedence_EvaluatesLeftToRight()
    {
        // 10 - 3 + 2 = 9
        var (operands, _) = _handler.Handle([10, 3, 2], ["-", "+"]);

        Assert.Single(operands);
        Assert.Equal(9, operands[0]);
    }
}
