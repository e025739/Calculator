namespace CalculatorApi.Handlers;

/// <summary>
/// Chain of Responsibility interface for evaluating operators by precedence level.
/// Each handler processes its operators and delegates the rest to the next handler in the chain.
/// </summary>
public interface IPrecedenceHandler
{
    (List<double> operands, List<string> operators) Handle(List<double> operands, List<string> operators);
}
