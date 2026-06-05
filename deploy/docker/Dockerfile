FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY NuGet.Config ./
COPY backend/dotnet/GoldCollector.DotNet.slnx ./backend/dotnet/
COPY backend/dotnet/src/GoldCollector.Api/ ./backend/dotnet/src/GoldCollector.Api/
COPY backend/dotnet/tests/GoldCollector.Tests/ ./backend/dotnet/tests/GoldCollector.Tests/

RUN dotnet restore ./backend/dotnet/GoldCollector.DotNet.slnx --configfile ./NuGet.Config
RUN dotnet publish ./backend/dotnet/src/GoldCollector.Api/GoldCollector.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

ENV ASPNETCORE_URLS=http://0.0.0.0:41736
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=1
ENV TZ=Asia/Shanghai

COPY --from=build /app/publish ./

RUN mkdir -p /app/logs

EXPOSE 41736

ENTRYPOINT ["dotnet", "GoldCollector.Api.dll"]
