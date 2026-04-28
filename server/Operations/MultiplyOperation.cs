namespace CalculatorApi.Operations;

public sealed class MultiplyOperation : IOperation
{
    public double Execute(double a, double b) => a * b;
}
