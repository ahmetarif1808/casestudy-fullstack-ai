# 1. Aşama: Build (Derleme) - 9.0 SDK kullan
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Tüm dosyaları kopyala
COPY . .

# Proje dosyasını belirterek restore et
RUN dotnet restore "sentiment-backend.csproj"

# Proje dosyasını belirterek publish et
RUN dotnet publish "sentiment-backend.csproj" -c Release -o /app/publish

# 2. Aşama: Final (Çalıştırma) - 9.0 Runtime kullan
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Render, 8080 portunu otomatik olarak dinler ve yönlendirir.
# Ekstra ENV veya EXPOSE gerekmez, bu en temiz yoldur.
ENTRYPOINT ["dotnet", "sentiment-backend.dll"]