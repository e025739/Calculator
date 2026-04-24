namespace CalculatorApi.Operations;

/// <summary>
/// Strategy interface for arithmetic operations.
/// Each operation (add, subtract, multiply, divide) implements this interface,
/// allowing the calculator service to select the correct strategy at runtime.
/// </summary>
public interface IOperation
{
    double Execute(double a, double b);
}
