using System.Collections.Frozen;

namespace CalculatorApi;

/// <summary>
/// Single source of truth for all supported arithmetic operators.
/// Referenced by validation, DI registration, and handler configuration.
/// </summary>
public static class SupportedOperators
{
    public static readonly FrozenSet<string> All = new HashSet<string> { "+", "-", "*", "/" }.ToFrozenSet();
    public static readonly IReadOnlyList<string> HighPrecedence = ["*", "/"];
    public static readonly IReadOnlyList<string> LowPrecedence = ["+", "-"];
}
