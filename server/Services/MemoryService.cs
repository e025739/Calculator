namespace CalculatorApi.Services;

/// <summary>
/// Manages the calculator's memory value (persists across requests).
/// Thread-safe: uses locking to handle concurrent HTTP requests.
/// </summary>
public sealed class MemoryService : IMemoryService
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

    public void ClearMemory()
    {
        lock (_lock) _memoryValue = 0;
    }
}
