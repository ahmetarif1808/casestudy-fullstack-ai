using Microsoft.EntityFrameworkCore;
using sentiment_backend.Models;

namespace sentiment_backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Message> Messages => Set<Message>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<Message>().HasKey(m => m.Id);
        modelBuilder.Entity<Message>().Property(m => m.Text).IsRequired();
    }
}

