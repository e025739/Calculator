using System.ComponentModel.DataAnnotations;

namespace CalculatorApi.Models;

/// <summary>
/// Represents a calculation request with two operands and an operator.
/// </summary>
public class CalculationRequest
{
    public double Operand1 { get; set; }
    public double Operand2 { get; set; }

    /// <summary>
    /// The arithmetic operator: "+", "-", "*", "/"
    /// </summary>
    [Required(ErrorMessage = "Operator is required.")]
    [RegularExpression(@"^[+\-*/]$", ErrorMessage = "Operator must be +, -, * or /")]
    public string Operator { get; set; } = string.Empty;
}
