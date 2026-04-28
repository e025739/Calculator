using System.ComponentModel.DataAnnotations;

namespace CalculatorApi.Models;

/// <summary>
/// Represents a calculation request with multiple operands and operators.
/// Supports expressions like 2 + 3 * 4 with proper operator precedence.
/// </summary>
public class CalculationRequest : IValidatableObject
{
    [Required(ErrorMessage = "Operands are required.")]
    [MinLength(2, ErrorMessage = "At least 2 operands are required.")]
    [MaxLength(100, ErrorMessage = "Expression too long (max 100 operands).")]
    public List<double> Operands { get; set; } = new();

    [Required(ErrorMessage = "Operators are required.")]
    [MaxLength(99, ErrorMessage = "Expression too long (max 99 operators).")]
    public List<string> Operators { get; set; } = new();

    /// <summary>
    /// Validates that operators count equals operands count - 1
    /// and that all operators are supported arithmetic operators.
    /// </summary>
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (Operators.Count != Operands.Count - 1)
            yield return new ValidationResult(
                $"Operators count ({Operators.Count}) must equal operands count ({Operands.Count}) minus 1.");

        for (int i = 0; i < Operators.Count; i++)
        {
            if (!SupportedOperators.All.Contains(Operators[i]))
                yield return new ValidationResult(
                    $"Unsupported operator '{Operators[i]}' at position {i}. Supported: {string.Join(", ", SupportedOperators.All)}");
        }
    }
}
