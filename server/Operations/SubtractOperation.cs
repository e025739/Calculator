namespace CalculatorApi.Operations;

/// <summary>
/// Subtraction operation strategy.
/// </summary>
public class SubtractOperation : IOperation
{
    public double Execute(double a, double b) => a - b;
}
