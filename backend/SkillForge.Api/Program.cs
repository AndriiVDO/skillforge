using Microsoft.EntityFrameworkCore;
using SkillForge.Api.Data;
using SkillForge.Api.Models;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration
    .GetConnectionString("SkillForge")
    ?? throw new InvalidOperationException(
        "ConnectionStrings:SkillForge is not configured."
    );

builder.Services.AddDbContext<SkillForgeDbContext>(options =>
    options.UseNpgsql(connectionString)
);

var app = builder.Build();

app.MapGet("/api/health", () =>
{
    return Results.Ok(new
    {
        status = "ok",
        service = "SkillForge.Api",
        runtime = Environment.Version.ToString()
    });
});

app.MapGet("/api/health/db", async (
    SkillForgeDbContext db,
    CancellationToken cancellationToken) =>
{
    var connected = await db.Database
        .CanConnectAsync(cancellationToken);

    if (!connected)
    {
        return Results.Problem(
            title: "Database unavailable.",
            statusCode: StatusCodes.Status503ServiceUnavailable
        );
    }

    return Results.Ok(new
    {
        status = "ok",
        database = "PostgreSQL"
    });
});

app.MapGet("/api/topics", async (
    SkillForgeDbContext db,
    CancellationToken cancellationToken) =>
{
    var topics = await db.Topics
        .AsNoTracking()
        .Include(topic => topic.Lessons)
        .Include(topic => topic.Resources)
        .AsSplitQuery()
        .OrderBy(topic => topic.Id)
        .ToListAsync(cancellationToken);

    return Results.Ok(topics.Select(ToResponse).ToArray());
});

app.MapGet("/api/topics/{slug}", async (
    string slug,
    SkillForgeDbContext db,
    CancellationToken cancellationToken) =>
{
    var topic = await db.Topics
        .AsNoTracking()
        .Include(topic => topic.Lessons)
        .Include(topic => topic.Resources)
        .AsSplitQuery()
        .SingleOrDefaultAsync(
            topic => topic.Slug == slug,
            cancellationToken
        );

    if (topic is null)
    {
        return Results.NotFound(new
        {
            message = "Topic not found."
        });
    }

    return Results.Ok(ToResponse(topic));
});

app.Run();

static TopicResponse ToResponse(LearningTopic topic)
{
    return new TopicResponse(
        topic.Slug,
        topic.Title,
        topic.Category,
        topic.Description,
        topic.Outcome,
        topic.Lessons.Count,
        topic.Lessons
            .OrderBy(lesson => lesson.Position)
            .Select(lesson => new LessonResponse(
                lesson.Id,
                lesson.Title,
                lesson.Description
            ))
            .ToArray(),
        topic.Resources
            .OrderBy(resource => resource.Position)
            .Select(resource => new ResourceResponse(
                resource.Title,
                resource.Url
            ))
            .ToArray()
    );
}

public sealed record TopicResponse(
    string Slug,
    string Title,
    string Category,
    string Description,
    string Outcome,
    int TaskCount,
    LessonResponse[] Lessons,
    ResourceResponse[] Resources
);

public sealed record LessonResponse(
    string Id,
    string Title,
    string Description
);

public sealed record ResourceResponse(
    string Title,
    string Url
);