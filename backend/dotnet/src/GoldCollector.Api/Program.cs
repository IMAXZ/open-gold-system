using GoldCollector.Api;
using GoldCollector.Api.Data;
using GoldCollector.Api.Services;
using Microsoft.Extensions.Options;
using MySqlConnector;
using Quartz;
using Serilog;
using System.Net;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, services, configuration) => configuration
    .ReadFrom.Configuration(context.Configuration)
    .ReadFrom.Services(services)
    .Enrich.FromLogContext());

builder.Services.Configure<GoldOptions>(builder.Configuration.GetSection("Gold"));
builder.Services.Configure<CollectorOptions>(builder.Configuration.GetSection("Collector"));
builder.Services.Configure<CorsOptions>(builder.Configuration.GetSection("Cors"));

builder.Services.AddControllers();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
        if (allowedOrigins.Length > 0)
        {
            policy.WithOrigins(allowedOrigins)
                .AllowAnyHeader()
                .AllowAnyMethod();
        }
    });
});

builder.Services.AddSingleton(sp =>
{
    var connectionString = builder.Configuration.GetConnectionString("GoldDb")
        ?? throw new InvalidOperationException("必须配置数据库连接字符串 ConnectionStrings:GoldDb。");

    var dataSourceBuilder = new MySqlDataSourceBuilder(connectionString);
    return dataSourceBuilder.Build();
});

builder.Services.AddSingleton<IGoldPriceRepository, MySqlGoldPriceRepository>();
builder.Services.AddSingleton<CollectorService>();
builder.Services.AddHttpClient<GoldPriceApiClient>((sp, client) =>
{
    var options = sp.GetRequiredService<IOptionsMonitor<GoldOptions>>().CurrentValue;
    client.BaseAddress = new Uri(options.Api.BaseUrl);
    client.Timeout = TimeSpan.FromMilliseconds(Math.Max(1000, options.Api.TimeoutMs));
})
.ConfigurePrimaryHttpMessageHandler(() => new SocketsHttpHandler
{
    AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate | DecompressionMethods.Brotli,
    PooledConnectionIdleTimeout = TimeSpan.FromMinutes(2),
    PooledConnectionLifetime = TimeSpan.FromMinutes(10),
    MaxConnectionsPerServer = 2
});

builder.Services.AddQuartz(options =>
{
    var jobKey = new JobKey("gold-price-collector");
    options.AddJob<CollectorJob>(configure => configure.WithIdentity(jobKey));
    options.AddTrigger(trigger => trigger
        .ForJob(jobKey)
        .WithIdentity("gold-price-collector-trigger")
        .WithCronSchedule(
            builder.Configuration.GetValue<string>("Collector:Cron") ?? "0 0/1 * * * ?",
            cron => cron.InTimeZone(TimeZoneInfo.Local)));
});
builder.Services.AddQuartzHostedService(options =>
{
    options.WaitForJobsToComplete = true;
});

var app = builder.Build();

var allowedOrigins = app.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
if (allowedOrigins.Length > 0)
{
    app.UseCors();
}

app.MapGet("/", () => Results.Text("gold-collector:ok"));
app.MapControllers();

try
{
    app.Run();
}
finally
{
    Log.CloseAndFlush();
}
