namespace CalculatorApi.Operations;

/// <summary>
/// Division operation strategy.
/// Throws DivideByZeroException when dividing by zero,
/// which is caught by the global ExceptionHandlingMiddleware.
/// </summary>
public class DivideOperation : IOperation
{
    public double Execute(double a, double b)
    {
        if (b == 0)
            throw new DivideByZeroException("Cannot divide by zero.");

        return a / b;
    }
}
