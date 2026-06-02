namespace GoldCollector.Tests.Endpoints;

public sealed class EndpointParameterTests
{
    [Theory]
    [InlineData(null, 10)]
    [InlineData(-1, 1)]
    [InlineData(1, 1)]
    [InlineData(100, 100)]
    [InlineData(999, 100)]
    public void HistoryLimit_ShouldBeClamped(int? input, int expected)
    {
        var normalized = Math.Clamp(input ?? 10, 1, 100);
        Assert.Equal(expected, normalized);
    }
}
