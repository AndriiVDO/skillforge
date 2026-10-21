using Microsoft.EntityFrameworkCore;
using SkillForge.Api.Models;

namespace SkillForge.Api.Data;

public sealed class SkillForgeDbContext(
    DbContextOptions<SkillForgeDbContext> options
) : DbContext(options)
{
    public DbSet<LearningTopic> Topics => Set<LearningTopic>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var topic = modelBuilder.Entity<LearningTopic>();

        topic.ToTable("topics");

        topic.HasKey(item => item.Id);

        topic.Property(item => item.Slug)
            .HasMaxLength(100)
            .IsRequired();

        topic.HasIndex(item => item.Slug)
            .IsUnique();

        topic.Property(item => item.Title)
            .HasMaxLength(150)
            .IsRequired();

        topic.Property(item => item.Category)
            .HasMaxLength(100)
            .IsRequired();

        topic.HasData(
            new LearningTopic
            {
                Id = 1,
                Slug = "web-development",
                Title = "Web Development",
                Category = "Development",
                TaskCount = 4
            },
            new LearningTopic
            {
                Id = 2,
                Slug = "cms",
                Title = "Content Management",
                Category = "Content",
                TaskCount = 3
            },
            new LearningTopic
            {
                Id = 3,
                Slug = "linux",
                Title = "Linux Foundations",
                Category = "Systems",
                TaskCount = 3
            },
            new LearningTopic
            {
                Id = 4,
                Slug = "devops",
                Title = "DevOps Essentials",
                Category = "Operations",
                TaskCount = 3
            },
            new LearningTopic
            {
                Id = 5,
                Slug = "web-security",
                Title = "Web Security",
                Category = "Security",
                TaskCount = 3
            }
        );
    }
}