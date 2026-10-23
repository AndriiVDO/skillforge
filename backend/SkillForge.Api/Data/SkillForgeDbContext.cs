using Microsoft.EntityFrameworkCore;
using SkillForge.Api.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

namespace SkillForge.Api.Data;

public sealed class SkillForgeDbContext(
    DbContextOptions<SkillForgeDbContext> options
) : IdentityDbContext<ApplicationUser>(options)
{
    public DbSet<LearningTopic> Topics => Set<LearningTopic>();
    public DbSet<LearningLesson> Lessons => Set<LearningLesson>();
    public DbSet<LearningResource> Resources => Set<LearningResource>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

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

        topic.Property(item => item.Description)
    .HasMaxLength(2000)
    .HasDefaultValue("")
    .IsRequired();

        topic.Property(item => item.Outcome)
            .HasMaxLength(2000)
            .HasDefaultValue("")
            .IsRequired();

        var lesson = modelBuilder.Entity<LearningLesson>();

        lesson.ToTable("lessons");

        lesson.HasKey(item => item.Id);

        lesson.Property(item => item.Id)
            .HasMaxLength(100);

        lesson.Property(item => item.Title)
            .HasMaxLength(200)
            .IsRequired();

        lesson.Property(item => item.Description)
            .HasMaxLength(4000)
            .IsRequired();

        lesson.HasIndex(item => new { item.TopicId, item.Position })
            .IsUnique();

        lesson.HasOne(item => item.Topic)
            .WithMany(item => item.Lessons)
            .HasForeignKey(item => item.TopicId)
            .OnDelete(DeleteBehavior.Cascade);

        var resource = modelBuilder.Entity<LearningResource>();

        resource.ToTable("resources");

        resource.HasKey(item => item.Id);

        resource.Property(item => item.Title)
            .HasMaxLength(200)
            .IsRequired();

        resource.Property(item => item.Url)
            .HasMaxLength(2048)
            .IsRequired();

        resource.HasIndex(item => new { item.TopicId, item.Position })
            .IsUnique();

        resource.HasOne(item => item.Topic)
            .WithMany(item => item.Resources)
            .HasForeignKey(item => item.TopicId)
            .OnDelete(DeleteBehavior.Cascade);

        LearningContentSeed.Configure(modelBuilder);
    }
}