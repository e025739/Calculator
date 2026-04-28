using CalculatorApi.Services;

namespace CalculatorApi.Tests;

public class MemoryServiceTests
{
    private readonly MemoryService _service = new();

    [Fact]
    public void GetMemory_InitialValue_ReturnsZero()
    {
        Assert.Equal(0, _service.GetMemory());
    }

    [Fact]
    public void AddToMemory_AddsValue()
    {
        _service.AddToMemory(5);

        Assert.Equal(5, _service.GetMemory());
    }

    [Fact]
    public void SubtractFromMemory_SubtractsValue()
    {
        _service.AddToMemory(10);
        _service.SubtractFromMemory(3);

        Assert.Equal(7, _service.GetMemory());
    }

    [Fact]
    public void AddToMemory_MultipleCalls_Accumulates()
    {
        _service.AddToMemory(5);
        _service.AddToMemory(3);
        _service.AddToMemory(2);

        Assert.Equal(10, _service.GetMemory());
    }

    [Fact]
    public void Memory_ConcurrentAccess_IsThreadSafe()
    {
        var tasks = Enumerable.Range(0, 1000)
            .Select(_ => Task.Run(() => _service.AddToMemory(1)))
            .ToArray();

        Task.WaitAll(tasks);

        Assert.Equal(1000, _service.GetMemory());
    }

    [Fact]
    public void ClearMemory_ResetsValueToZero()
    {
        _service.AddToMemory(42);

        _service.ClearMemory();

        Assert.Equal(0, _service.GetMemory());
    }
}
