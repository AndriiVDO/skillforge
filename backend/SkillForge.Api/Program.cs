using Microsoft.EntityFrameworkCore;
using SkillForge.Api.Data;

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
        .OrderBy(topic => topic.Id)
        .Select(topic => new TopicSummary(
            topic.Slug,
            topic.Title,
            topic.Category,
            topic.TaskCount
        ))
        .ToListAsync(cancellationToken);

    return Results.Ok(topics);
});

app.MapGet("/api/topics/{slug}", async (
    string slug,
    SkillForgeDbContext db,
    CancellationToken cancellationToken) =>
{
    var topic = await db.Topics
        .AsNoTracking()
        .Where(topic => topic.Slug == slug)
        .Select(topic => new TopicSummary(
            topic.Slug,
            topic.Title,
            topic.Category,
            topic.TaskCount
        ))
        .SingleOrDefaultAsync(cancellationToken);

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