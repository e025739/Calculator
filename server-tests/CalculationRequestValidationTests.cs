using System.ComponentModel.DataAnnotations;
using CalculatorApi.Models;

namespace CalculatorApi.Tests;

public class CalculationRequestValidationTests
{
    private static List<ValidationResult> Validate(CalculationRequest request)
    {
        var context = new ValidationContext(request);
        var results = new List<ValidationResult>();
        Validator.TryValidateObject(request, context, results, validateAllProperties: true);
        return results;
    }

    [Fact]
    public void Validate_ValidRequest_NoErrors()
    {
        var request = new CalculationRequest
        {
            Operands = [1, 2, 3],
            Operators = ["+", "*"]
        };

        var errors = Validate(request);

        Assert.Empty(errors);
    }

    [Fact]
    public void Validate_OperatorCountMismatch_ReturnsError()
    {
        var request = new CalculationRequest
        {
            Operands = [1, 2, 3],
            Operators = ["+"]  // should be 2 operators
        };

        var errors = Validate(request);

        Assert.Contains(errors, e => e.ErrorMessage!.Contains("Operators count"));
    }

    [Fact]
    public void Validate_UnsupportedOperator_ReturnsError()
    {
        var request = new CalculationRequest
        {
            Operands = [1, 2],
            Operators = ["%"]
        };

        var errors = Validate(request);

        Assert.Contains(errors, e => e.ErrorMessage!.Contains("Unsupported operator"));
    }

    [Fact]
    public void Validate_SingleOperand_ReturnsError()
    {
        var request = new CalculationRequest
        {
            Operands = [1],
            Operators = []
        };

        var errors = Validate(request);

        Assert.NotEmpty(errors);
    }

    [Fact]
    public void Validate_EmptyOperands_ReturnsError()
    {
        var request = new CalculationRequest
        {
            Operands = [],
            Operators = []
        };

        var errors = Validate(request);

        Assert.NotEmpty(errors);
    }

    [Fact]
    public void Validate_TooManyOperands_ReturnsError()
    {
        var request = new CalculationRequest
        {
            Operands = Enumerable.Range(0, 101).Select(i => (double)i).ToList(),
            Operators = Enumerable.Range(0, 100).Select(_ => "+").ToList()
        };

        var errors = Validate(request);

        Assert.Contains(errors, e => e.ErrorMessage!.Contains("too long"));
    }
}
