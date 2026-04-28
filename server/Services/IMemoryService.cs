namespace CalculatorApi.Services;

public interface IMemoryService
{
    double GetMemory();
    void AddToMemory(double value);
    void SubtractFromMemory(double value);
    void ClearMemory();
}
