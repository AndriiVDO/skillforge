using Microsoft.EntityFrameworkCore;
using SkillForge.Api.Data;
using SkillForge.Api.Models;
using SkillForge.Api.Endpoints;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.DataProtection;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

var dataProtection = builder.Services
    .AddDataProtection()
    .SetApplicationName("SkillForge.Api");

var keysPath = builder.Configuration["DataProtection:KeysPath"];

if (!string.IsNullOrWhiteSpace(keysPath))
{
    Directory.CreateDirectory(keysPath);

    dataProtection.PersistKeysToFileSystem(
        new DirectoryInfo(keysPath)
    );
}

var connectionString = builder.Configuration
    .GetConnectionString("SkillForge")
    ?? throw new InvalidOperationException(
        "ConnectionStrings:SkillForge is not configured."
    );

builder.Services.AddDbContext<SkillForgeDbContext>(options =>
    options.UseNpgsql(connectionString)
);

builder.Services
    .AddIdentityCore<ApplicationUser>(options =>
    {
        options.User.RequireUniqueEmail = true;

        options.Password.RequiredLength = 12;
        options.Password.RequireDigit = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireUppercase = true;
        options.Password.RequireNonAlphanumeric = true;

        options.Lockout.AllowedForNewUsers = true;
        options.Lockout.MaxFailedAccessAttempts = 5;
        options.Lockout.DefaultLockoutTimeSpan =
            TimeSpan.FromMinutes(10);
    })
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<SkillForgeDbContext>()
    .AddSignInManager();

builder.Services
    .AddAuthentication(IdentityConstants.BearerScheme)
    .AddBearerToken(IdentityConstants.BearerScheme, options =>
    {
        options.BearerTokenExpiration = TimeSpan.FromMinutes(30);
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("Admin", policy =>
    {
        policy.RequireAuthenticatedUser();
        policy.RequireRole("Admin");
    });
});

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode =
        StatusCodes.Status429TooManyRequests;

    options.AddFixedWindowLimiter("admin-login", limiter =>
    {
        limiter.PermitLimit = 20;
        limiter.Window = TimeSpan.FromMinutes(1);
        limiter.QueueLimit = 0;
    });
});

var app = builder.Build();

if (builder.Configuration.GetValue<bool>("CreateAdmin"))
{
    await AdminProvisioner.CreateAsync(
        app.Services,
        app.Configuration
    );

    return;
}

app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();

app.MapAdminAuth();

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
    ClaimsPrincipal user,
    HttpResponse response,
    SkillForgeDbContext db,
    CancellationToken cancellationToken) =>
{
    response.Headers.CacheControl = "no-store";

    var canReadDrafts =
        user.Identity?.IsAuthenticated == true &&
        user.IsInRole("Admin");

    var topics = await db.Topics
        .AsNoTracking()
        .Where(topic => topic.IsPublished || canReadDrafts)
        .Include(topic => topic.Lessons)
        .Include(topic => topic.Resources)
        .AsSplitQuery()
        .OrderBy(topic => topic.Id)
        .ToListAsync(cancellationToken);

    return Results.Ok(topics.Select(ToResponse).ToArray());
});

app.MapGet("/api/topics/{slug}", async (
    string slug,
    ClaimsPrincipal user,
    HttpResponse response,
    SkillForgeDbContext db,
    CancellationToken cancellationToken) =>
{
    response.Headers.CacheControl = "no-store";

    var canReadDrafts =
        user.Identity?.IsAuthenticated == true &&
        user.IsInRole("Admin");

    var topic = await db.Topics
        .AsNoTracking()
        .Where(topic => topic.IsPublished || canReadDrafts)
        .Include(topic => topic.Lessons)
        .Include(topic => topic.Resources)
        .AsSplitQuery()
        .SingleOrDefaultAsync(
            topic => topic.Slug == slug,
            cancellationToken);

    if (topic is null)
    {
        return Results.NotFound(new
        {
            message = "Topic not found."
        });
    }

    return Results.Ok(ToResponse(topic));
});

app.MapTopicEditing();
app.MapLearningContentEditing();

app.Run();

static TopicResponse ToResponse(LearningTopic topic)
{
    return new TopicResponse(
        topic.Slug,
        topic.Title,
        topic.Category,
        topic.Description,
        topic.Outcome,
        topic.IsPublished,
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
                resource.Id,
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
    bool IsPublished,
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
    int Id,
    string Title,
    string Url
);