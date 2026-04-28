namespace CalculatorApi.Operations;

public sealed class AddOperation : IOperation
{
    public double Execute(double a, double b) => a + b;
}
