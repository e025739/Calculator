using CalculatorApi;
using CalculatorApi.Handlers;
using CalculatorApi.Models;
using CalculatorApi.Operations;
using CalculatorApi.Services;

namespace CalculatorApi.Tests;

public class CalculatorServiceTests
{
    private readonly CalculatorService _service;

    public CalculatorServiceTests()
    {
        var operations = new Dictionary<string, IOperation>
        {
            { "+", new AddOperation() },
            { "-", new SubtractOperation() },
            { "*", new MultiplyOperation() },
            { "/", new DivideOperation() }
        };

        var lowPrecedence = new PrecedenceHandler(SupportedOperators.LowPrecedence, operations, next: null);
        var handler = new PrecedenceHandler(SupportedOperators.HighPrecedence, operations, next: lowPrecedence);
        _service = new CalculatorService(handler);
    }

    [Theory]
    [InlineData(new[] { 5.0, 3.0 }, new[] { "+" }, 8.0)]
    [InlineData(new[] { 10.0, 4.0 }, new[] { "-" }, 6.0)]
    [InlineData(new[] { 3.0, 7.0 }, new[] { "*" }, 21.0)]
    [InlineData(new[] { 20.0, 4.0 }, new[] { "/" }, 5.0)]
    public void Calculate_SingleOperator_ReturnsExpectedResult(double[] operands, string[] operators, double expected)
    {
        var request = new CalculationRequest
        {
            Operands = operands.ToList(),
            Operators = operators.ToList()
        };

        var result = _service.Calculate(request);

        Assert.Equal(expected, result.Result);
    }

    [Fact]
    public void Calculate_ExpressionWithPrecedence_ReturnsCorrectResult()
    {
        // 1 + 2 * 3 - 4 / 2 = 1 + 6 - 2 = 5
        var request = new CalculationRequest
        {
            Operands = [1, 2, 3, 4, 2],
            Operators = ["+", "*", "-", "/"]
        };

        var result = _service.Calculate(request);

        Assert.Equal(5, result.Result);
    }

    [Fact]
    public void Calculate_NegativeNumbers_HandledCorrectly()
    {
        var request = new CalculationRequest
        {
            Operands = [-5, 3],
            Operators = ["+"]
        };

        var result = _service.Calculate(request);

        Assert.Equal(-2, result.Result);
    }

    [Fact]
    public void Calculate_DecimalNumbers_HandledCorrectly()
    {
        var request = new CalculationRequest
        {
            Operands = [1.5, 2.5],
            Operators = ["*"]
        };

        var result = _service.Calculate(request);

        Assert.Equal(3.75, result.Result);
    }
}
