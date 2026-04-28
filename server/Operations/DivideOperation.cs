namespace CalculatorApi.Operations;

/// <summary>
/// Division operation. Throws DivideByZeroException for division by zero,
/// which propagates to ExceptionHandlingMiddleware and returns HTTP 400.
/// </summary>
public sealed class DivideOperation : IOperation
{
    public double Execute(double a, double b)
    {
        if (b == 0)
            throw new DivideByZeroException("Cannot divide by zero.");

        return a / b;
    }
}
