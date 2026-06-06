using System.Globalization;

namespace GoldCollector.Api.Controllers;

public static class PriceRangeQueryParser
{
    private const string DateOnlyFormat = "yyyy-MM-dd";
    private const string DateTimeMinuteFormat = "yyyy-MM-dd'T'HH:mm";

    public static bool TryParse(
        string? startDate,
        string? endDate,
        DateTime now,
        out PriceRangeQuery range,
        out string? errorMessage)
    {
        if (!TryParseStart(startDate, now, out var startInclusive, out errorMessage) ||
            !TryParseEnd(endDate, now, out var endExclusive, out errorMessage))
        {
            range = default;
            return false;
        }

        if (startInclusive >= endExclusive)
        {
            range = default;
            errorMessage = "开始时间不能晚于结束时间。";
            return false;
        }

        range = new PriceRangeQuery(startInclusive, endExclusive);
        errorMessage = null;
        return true;
    }

    private static bool TryParseStart(
        string? value,
        DateTime now,
        out DateTime startInclusive,
        out string? errorMessage)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            startInclusive = now.Date;
            errorMessage = null;
            return true;
        }

        if (DateTime.TryParseExact(
                value,
                DateTimeMinuteFormat,
                CultureInfo.InvariantCulture,
                DateTimeStyles.None,
                out var dateTime))
        {
            startInclusive = dateTime;
            errorMessage = null;
            return true;
        }

        if (DateOnly.TryParseExact(value, DateOnlyFormat, CultureInfo.InvariantCulture, DateTimeStyles.None, out var date))
        {
            startInclusive = date.ToDateTime(TimeOnly.MinValue);
            errorMessage = null;
            return true;
        }

        startInclusive = default;
        errorMessage = "开始时间格式无效，支持 yyyy-MM-dd 或 yyyy-MM-ddTHH:mm。";
        return false;
    }

    private static bool TryParseEnd(
        string? value,
        DateTime now,
        out DateTime endExclusive,
        out string? errorMessage)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            endExclusive = TruncateToMinute(now).AddMinutes(1);
            errorMessage = null;
            return true;
        }

        if (DateTime.TryParseExact(
                value,
                DateTimeMinuteFormat,
                CultureInfo.InvariantCulture,
                DateTimeStyles.None,
                out var dateTime))
        {
            endExclusive = dateTime.AddMinutes(1);
            errorMessage = null;
            return true;
        }

        if (DateOnly.TryParseExact(value, DateOnlyFormat, CultureInfo.InvariantCulture, DateTimeStyles.None, out var date))
        {
            endExclusive = date.AddDays(1).ToDateTime(TimeOnly.MinValue);
            errorMessage = null;
            return true;
        }

        endExclusive = default;
        errorMessage = "结束时间格式无效，支持 yyyy-MM-dd 或 yyyy-MM-ddTHH:mm。";
        return false;
    }

    private static DateTime TruncateToMinute(DateTime value) =>
        new(value.Year, value.Month, value.Day, value.Hour, value.Minute, 0, value.Kind);
}

public readonly record struct PriceRangeQuery(DateTime StartInclusive, DateTime EndExclusive);
