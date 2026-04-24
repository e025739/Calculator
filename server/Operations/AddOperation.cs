namespace CalculatorApi.Operations;

/// <summary>
/// Addition operation strategy.
/// </summary>
public class AddOperation : IOperation
{
    public double Execute(double a, double b) => a + b;
}
