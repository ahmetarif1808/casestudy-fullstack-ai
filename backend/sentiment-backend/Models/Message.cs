namespace sentiment_backend.Models;

public class Message
{
    public int Id { get; set; }
    public string? Nickname { get; set; }
    public string Text { get; set; } = null!;
    public string? SentimentLabel { get; set; }
    public double? SentimentScore { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

