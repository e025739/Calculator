namespace CalculatorApi.Operations;

/// <summary>
/// Multiplication operation strategy.
/// </summary>
public class MultiplyOperation : IOperation
{
    public double Execute(double a, double b) => a * b;
}
