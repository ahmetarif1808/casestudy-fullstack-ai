FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY . .
RUN dotnet publish -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app .
EXPOSE 7860
ENV ASPNETCORE_URLS=http://0.0.0.0:7860
ENTRYPOINT ["dotnet", "sentiment-backend.dll"]
