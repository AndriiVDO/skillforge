namespace SkillForge.Api.Models;

public sealed class LearningTopic
{
    public int Id { get; set; }

    public string Slug { get; set; } = "";

    public string Title { get; set; } = "";

    public string Category { get; set; } = "";

    public int TaskCount { get; set; }
}