namespace SkillForge.Api.Models;

public sealed class LearningLesson
{
    public string Id { get; set; } = "";

    public int TopicId { get; set; }

    public LearningTopic Topic { get; set; } = null!;

    public string Title { get; set; } = "";

    public string Description { get; set; } = "";

    public int Position { get; set; }
}