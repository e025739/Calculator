namespace CalculatorApi.Services;

/// <summary>
/// Manages the calculator's memory value.
/// Registered as Singleton so the memory persists across HTTP requests.
/// </summary>
public class MemoryService : IMemoryService
{
    private readonly object _lock = new();
    private double _memoryValue;

    public double GetMemory()
    {
        lock (_lock) return _memoryValue;
    }

    public void AddToMemory(double value)
    {
        lock (_lock) _memoryValue += value;
    }

    public void SubtractFromMemory(double value)
    {
        lock (_lock) _memoryValue -= value;
    }
}
