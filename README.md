🤖 AI Sentiment Chat - Full Stack Stajyer Projesi
Kullanıcıların mesajlaşarak sohbet edebildiği, yazışmaların AI tarafından duygu analizi yapılarak canlı olarak gösterildiği full-stack web + mobil uygulama.
🌐 Demo Linkleri
Web App (Frontend): https://casestudy-fullstack-ai.vercel.app
Backend API: https://casestudy-fullstack-ai.onrender.com
Swagger Docs: https://casestudy-fullstack-ai.onrender.com/swagger
AI Service (Gradio): https://isen1808-ai-sentiment-service.hf.space
AI Proxy API: https://isen1808-ai-sentiment-proxy.hf.space
🛠️ Teknoloji Stack
Frontend
React (Vite + Tailwind CSS)
Axios (API iletişimi)
Vercel (deployment)
Backend
.NET Core 9.0 (Minimal API)
Entity Framework Core (ORM)
SQLite (veritabanı)
Render (deployment)
AI Service
Python + FastAPI (Proxy API)
Gradio Client (Hugging Face entegrasyonu)
savasy/bert-base-turkish-sentiment-cased (Türkçe duygu analizi modeli)
Hugging Face Spaces (deployment)
📁 Proje Yapısı
casestudy-fullstack-ai/
├── backend/                    # .NET Core API
│   ├── Program.cs             # API endpoints ve konfigürasyon (ELLE YAZILDI)
│   ├── Data/
│   │   └── AppDbContext.cs    # EF Core DbContext (ELLE YAZILDI)
│   ├── Models/
│   │   └── Message.cs         # Message entity modeli
│   ├── Migrations/            # EF Core migrations
│   └── sentiment-backend.csproj
│
├── frontend/                   # React Web App
│   ├── src/
│   │   ├── App.jsx            # Ana component (ELLE YAZILDI)
│   │   ├── MessageItem.jsx    # Mesaj kartı komponenti
│   │   ├── api.js             # Axios API servisleri (ELLE YAZILDI)
│   │   ├── main.jsx           # React entry point
│   │   └── index.css          # Tailwind styles
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── ai-service/                 # Gradio AI Service
│   ├── main.py                # Gradio sentiment UI
│   └── requirements.txt
│
├── ai-proxy/                   # FastAPI Proxy (Gradio Queue Çözümü)
│   ├── proxy.py               # Gradio client wrapper (ELLE YAZILDI)
│   ├── requirements.txt
│   └── Dockerfile
│
└── README.md
🧠 AI Araçları Kullanımı ve Kod Hakimiyeti
🤖 AI ile Yazılan Kısımlar (Claude + ChatGPT)
Frontend UI tasarımı (Tailwind CSS class'ları)
Gradio arayüz kodu (ai-service/main.py)
README dokümantasyonu
.gitignore dosyası
Bazı yardımcı fonksiyonlar
✍️ Elle Yazılan Kritik Kısımlar (Kod Hakimiyeti Kanıtı)
1. Backend API Endpoint'leri (Program.cs)
csharp
// POST /messages - Mesaj kaydetme ve AI analizi (ELLE YAZILDI)
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
2. AI Service Entegrasyonu (Program.cs)
csharp
// AI servis çağrısı ve retry mekanizması (ELLE YAZILDI)
async Task<(bool ok, string? label, double? score, string? raw)> CallAiServiceAsync(
    IHttpClientFactory httpFactory, string text)
{
    var client = httpFactory.CreateClient("ai");
    var payload = new { inputs = text };
    var attempts = 3;
    var delayMs = 2000;

    for (int attempt = 1; attempt <= attempts; attempt++)
    {
        try
        {
            using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(30));
            var request = new HttpRequestMessage(HttpMethod.Post, aiUrl);
            request.Content = JsonContent.Create(payload);
            
            var resp = await client.SendAsync(request, cts.Token);
            var body = await resp.Content.ReadAsStringAsync(cts.Token);
            
            if (!resp.IsSuccessStatusCode)
            {
                if ((int)resp.StatusCode >= 500 && attempt < attempts)
                    await Task.Delay(delayMs * attempt);
                else
                    return (false, null, null, body);
            }
            // ... JSON parsing kodu
        }
        catch (Exception ex)
        {
            // ... error handling
        }
    }
}
3. Database Context (Data/AppDbContext.cs)
csharp
// EF Core DbContext ve tablo yapılandırması (ELLE YAZILDI)
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    
    public DbSet<Message> Messages { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Message>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Text).IsRequired();
            entity.Property(e => e.CreatedAt).IsRequired();
        });
    }
}
4. Frontend API Servisleri (frontend/src/api.js)
javascript
// Axios instance ve API fonksiyonları (ELLE YAZILDI)
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const sendMessage = (nickname, text) =>
  api.post("/messages", { nickname, text });

export const getMessages = () => 
  api.get("/messages?limit=50");
5. React State Yönetimi (frontend/src/App.jsx)
javascript
// Mesaj gönderme ve auto-refresh (ELLE YAZILDI)
const [messages, setMessages] = useState([]);
const [loading, setLoading] = useState(false);

const handleSend = async () => {
  if (!text.trim() || loading) return;
  
  setLoading(true);
  try {
    await sendMessage(nickname || "anonymous", text);
    setText("");
    await load();
  } catch (error) {
    alert("Mesaj gönderilemedi: " + error.message);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  load();
  const interval = setInterval(load, 5000); // Auto-refresh
  return () => clearInterval(interval);
}, []);
6. Gradio Proxy API (ai-proxy/proxy.py)
python
# FastAPI proxy servisi - Gradio Queue sorunu çözümü (ELLE YAZILDI)
from fastapi import FastAPI, HTTPException
from gradio_client import Client

app = FastAPI(title="Gradio Proxy API")
gradio_client = Client("isen1808/ai-sentiment-service")

@app.post("/predict")
async def predict(request: TextRequest):
    try:
        result = gradio_client.predict(
            request.inputs,
            api_name="/predict"
        )
        return {
            "label": result[0],
            "score": float(result[1])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
🚀 Kurulum ve Çalıştırma
Gereksinimler
.NET 9.0 SDK
Node.js 18+
Python 3.10+
1️⃣ Backend (Lokal)
bash
cd backend
dotnet restore
dotnet ef database update
dotnet run

# Backend: http://localhost:5000
# Swagger: http://localhost:5000/swagger
2️⃣ Frontend (Lokal)
bash
cd frontend
npm install

# .env dosyası oluştur
echo "VITE_API_URL=http://localhost:5000" > .env

npm run dev

# Frontend: http://localhost:5173
3️⃣ AI Service (Hugging Face Space)
AI servisi zaten deploy edilmiş durumda:
https://isen1808-ai-sentiment-service.hf.space
Lokal test için:
bash
cd ai-service
pip install -r requirements.txt
python main.py

# Gradio UI: http://localhost:7860
📊 API Endpoints
POST /messages
Yeni mesaj gönder ve sentiment analizi yap.
Request:
json
{
  "nickname": "Ahmet",
  "text": "Bu harika bir proje!"
}
Response (201 Created):
json
{
  "id": 1,
  "nickname": "Ahmet",
  "text": "Bu harika bir proje!",
  "sentimentLabel": "positive",
  "sentimentScore": 0.9876,
  "createdAt": "2025-11-08T12:34:56Z"
}
GET /messages?limit=50
Son 50 mesajı getir.
Response (200 OK):
json
[
  {
    "id": 1,
    "nickname": "Ahmet",
    "text": "Bu harika bir proje!",
    "sentimentLabel": "positive",
    "sentimentScore": 0.9876,
    "createdAt": "2025-11-08T12:34:56Z"
  }
]
🏗️ Mimari ve Veri Akışı
[User] → [React Frontend]
           ↓ HTTP POST /messages
       [.NET Backend API]
           ↓ HTTP POST /predict
       [FastAPI Proxy]
           ↓ Gradio Client
       [Gradio Space]
           ↓ Model Inference
       [BERT Turkish Sentiment Model]
           ↓ Result: {label, score}
       [Backend saves to SQLite]
           ↓ Response
       [Frontend displays with color]
🔧 Teknik Zorluklar ve Çözümler
1. Gradio Queue Sistemi Sorunu
Sorun: Gradio 4.0+ versiyonunda direct HTTP POST desteklenmiyor.
Hata: "This API endpoint does not accept direct HTTP POST requests. Please join the queue."
Çözüm: FastAPI kullanarak proxy API oluşturduk. Proxy, Gradio Client library ile Space'e bağlanıyor ve queue sistemini handle ediyor.
python
# Proxy API sayesinde .NET direkt HTTP POST yapabiliyor
gradio_client = Client("isen1808/ai-sentiment-service")
result = gradio_client.predict(text, api_name="/predict")
2. CORS Hatası
Sorun: Frontend (Vercel) → Backend (Render) cross-origin isteği reddediliyordu.
Çözüm: Backend'de CORS policy güncellendi:
csharp
policy.WithOrigins(
    "http://localhost:5173",
    "https://casestudy-fullstack-ai.vercel.app",
    "https://*.vercel.app"
).AllowAnyHeader().AllowAnyMethod();
3. Environment Variable Yönetimi
Sorun: Farklı platformlarda farklı environment variable formatları.
Çözüm:
Render: AI_URL=https://...
Vercel: VITE_API_URL=https://...
Vite: import.meta.env.VITE_API_URL
📸 Ekran Görüntüleri
Web App
Mesaj gönderme formu (nickname + textarea)
Mesaj listesi (sentiment renk kodlu: yeşil=positive, kırmızı=negative)
Sentiment score gösterimi
Responsive tasarım
🎯 MVP Özellikleri (Tamamlandı)
✅ React Web chat ekranı
✅ Mesaj gönderme ve listeleme
✅ AI duygu analizi (Türkçe)
✅ Sentiment renklendirme (positive/negative)
✅ .NET Core API (POST/GET endpoints)
✅ SQLite database
✅ Render deployment (backend)
✅ Vercel deployment (frontend)
✅ Hugging Face Spaces (AI service)
⏳ React Native mobil app (devam ediyor)
📝 Lisans
MIT License - Eğitim amaçlı proje
👨‍💻 Geliştirici
Ahmet Arif
GitHub: @isen1808
Proje Repo: casestudy-fullstack-ai
🙏 Teşekkürler
Anthropic Claude - Kod review ve problem solving
OpenAI ChatGPT - UI tasarım önerileri
Hugging Face - AI model hosting
Savasy - Türkçe BERT sentiment modeli
⭐ Projeyi beğendiyseniz GitHub'da star vermeyi unutmayın!
