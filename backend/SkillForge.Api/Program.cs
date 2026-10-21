var builder = WebApplication.CreateBuilder(args);

var app = builder.Build();

TopicSummary[] topics =
[
    new(
        "web-development",
        "Web Development",
        "Development",
        4
    ),
    new(
        "cms",
        "Content Management",
        "Content",
        3
    ),
    new(
        "linux",
        "Linux Foundations",
        "Systems",
        3
    ),
    new(
        "devops",
        "DevOps Essentials",
        "Operations",
        3
    ),
    new(
        "web-security",
        "Web Security",
        "Security",
        3
    )
];

app.MapGet("/api/health", () =>
{
    return Results.Ok(new
    {
        status = "ok",
        service = "SkillForge.Api",
        runtime = Environment.Version.ToString()
    });
});

app.MapGet("/api/topics", () =>
{
    return Results.Ok(topics);
});

app.MapGet("/api/topics/{slug}", (string slug) =>
{
    var topic = topics.FirstOrDefault(topic => topic.Slug == slug);

    if (topic is null)
    {
        return Results.NotFound(new
        {
            message = "Topic not found."
        });
    }

    return Results.Ok(topic);
});

app.Run();

public sealed record TopicSummary(
    string Slug,
    string Title,
    string Category,
    int TaskCount
);