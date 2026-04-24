namespace CalculatorApi.Services;

/// <summary>
/// Defines the contract for managing the calculator's memory.
/// </summary>
public interface IMemoryService
{
    double GetMemory();
    void AddToMemory(double value);
    void SubtractFromMemory(double value);
}
