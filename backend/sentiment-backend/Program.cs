using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.EntityFrameworkCore;
using sentiment_backend.Data;
using sentiment_backend.Models;

var builder = WebApplication.CreateBuilder(args);

// === CONFIG ===
var aiUrl = Environment.GetEnvironmentVariable("AI_URL");
if (string.IsNullOrWhiteSpace(aiUrl))
{
    throw new InvalidOperationException("AI_URL environment variable is not set.");
}
var hfToken = Environment.GetEnvironmentVariable("HF_TOKEN");
var useMockFallback = builder.Configuration.GetValue<bool>("USE_MOCK_FALLBACK", false);

// === DB ===
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=app.db"));

// === HTTP CLIENT ===
builder.Services.AddHttpClient("ai", client =>
{
    client.Timeout = TimeSpan.FromSeconds(30);
    client.DefaultRequestHeaders.Accept.Clear();
    client.DefaultRequestHeaders.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));
});

// === SWAGGER ===
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// === CORS ===
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        // Geliştirme (localhost) VE Canlı (Vercel) adreslerine izin ver
        policy.WithOrigins("http://localhost:3000", "https://*.vercel.app") 
              .AllowAnyHeader()
              .AllowAnyMethod()
              .SetIsOriginAllowedToAllowWildcardSubdomains(); // *.vercel.app için
              
        // VEYA DAHA BASİTİ (Ama daha az güvenli):
        // policy.AllowAnyOrigin()
        //       .AllowAnyHeader()
        //       .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();
app.UseHttpsRedirection();
app.UseCors("AllowReactApp");

// === DB MIGRATION ===
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

async Task<(bool ok, string? label, double? score, string? raw)> CallAiServiceAsync(IHttpClientFactory httpFactory, string text)
{
    if (useMockFallback)
    {
        var label = text.Contains("mutlu", StringComparison.OrdinalIgnoreCase) ? "POSITIVE" : "NEGATIVE";
        return (true, label, 0.92, "{\"mock\":true}");
    }

    var client = httpFactory.CreateClient("ai");
    
    // ✅ GRADIO API FORMAT: data array + fn_index
 var payload = new { inputs = text };
    
    var attempts = 3;
    var delayMs = 2000;

    for (int attempt = 1; attempt <= attempts; attempt++)
    {
        try
        {
            using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(30));

            // ✅ GRADIO API ENDPOINT
            var request = new HttpRequestMessage(HttpMethod.Post, aiUrl);
            request.Content = JsonContent.Create(payload);
            
            // Token opsiyonel (public Space için gerekli değil)
            if (!string.IsNullOrWhiteSpace(hfToken))
            {
                request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", hfToken);
            }

            var resp = await client.SendAsync(request, cts.Token);
            var body = await resp.Content.ReadAsStringAsync(cts.Token);

            if (!resp.IsSuccessStatusCode)
            {
                app.Logger.LogWarning("AI non-success {code} body: {body}", resp.StatusCode, body);
                if ((int)resp.StatusCode >= 500 && attempt < attempts)
                    await Task.Delay(delayMs * attempt);
                else
                    return (false, null, null, body);
            }
            else
            {
                try
                {
                    var json = JsonNode.Parse(body);
                    
                    // ✅ GRADIO RESPONSE: { "data": [label, score], "duration": ... }
                    if (json is JsonObject obj)
                    {
                         var label = obj["label"]?.ToString();
                         var score = obj["score"]?.GetValue<double>() ?? 0.0;
                        return (true, label, score, body);
                    }
                    app.Logger.LogWarning("Unexpected AI response format: {body}", body);
                    return (false, null, null, body);
                }
                catch (Exception ex)
                {
                    app.Logger.LogError(ex, "AI JSON parse error");
                    return (false, null, null, body);
                }
            }
        }
        catch (TaskCanceledException tex)
        {
            app.Logger.LogWarning("AI timeout attempt {attempt}: {msg}", attempt, tex.Message);
            if (attempt == attempts)
                return (false, null, null, tex.Message);
            await Task.Delay(delayMs * attempt);
        }
        catch (HttpRequestException hex)
        {
            app.Logger.LogWarning("AI http exception attempt {attempt}: {msg}", attempt, hex.Message);
            if (attempt == attempts)
                return (false, null, null, hex.Message);
            await Task.Delay(delayMs * attempt);
        }
    }

    return (false, null, null, "max attempts reached");
}

// === ENDPOINTS ===
app.MapPost("/sentiment", async (IHttpClientFactory httpFactory, SentimentRequest request) =>
{
    if (string.IsNullOrWhiteSpace(request.Text))
        return Results.BadRequest(new { error = "text is required" });

    var (ok, label, score, raw) = await CallAiServiceAsync(httpFactory, request.Text);
    if (!ok)
        return Results.Problem(detail: $"AI service failure. Raw: {raw}", statusCode: 502);

    return Results.Ok(new { label, score });
}).WithName("AnalyzeSentiment");

app.MapPost("/messages", async (AppDbContext db, IHttpClientFactory httpFactory, MessageCreateDto dto) =>
{
    if (string.IsNullOrWhiteSpace(dto.Text))
        return Results.BadRequest(new { error = "text required" });

    var (ok, label, score, raw) = await CallAiServiceAsync(httpFactory, dto.Text);

    var msg = new Message
    {
        Nickname = string.IsNullOrWhiteSpace(dto.Nickname) ? "anonymous" : dto.Nickname,
        Text = dto.Text,
        SentimentLabel = label,
        SentimentScore = score,
        CreatedAt = DateTime.UtcNow
    };

    db.Messages.Add(msg);
    await db.SaveChangesAsync();

    return Results.Created($"/messages/{msg.Id}", msg);
}).WithName("CreateMessage");

app.MapGet("/messages", async (AppDbContext db, int limit) =>
{
    var take = Math.Clamp(limit == 0 ? 50 : limit, 1, 200);
    var list = await db.Messages.OrderByDescending(m => m.CreatedAt).Take(take).ToListAsync();
    return Results.Ok(list);
}).WithName("GetMessages");

app.MapGet("/", () => "Backend API running");

app.Run();

// === DTOs ===
public record SentimentRequest(string Text);
public record MessageCreateDto(string? Nickname, string Text);
