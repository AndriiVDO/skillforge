namespace SkillForge.Api.Models;

public sealed class LearningResource
{
    public int Id { get; set; }

    public int TopicId { get; set; }

    public LearningTopic Topic { get; set; } = null!;

    public string Title { get; set; } = "";

    public string Url { get; set; } = "";

    public int Position { get; set; }
}