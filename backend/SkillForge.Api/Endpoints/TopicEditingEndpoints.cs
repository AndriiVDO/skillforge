using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using SkillForge.Api.Data;
using SkillForge.Api.Models;

namespace SkillForge.Api.Endpoints;

public static class TopicEditingEndpoints
{
    public static void MapTopicEditing(this WebApplication app)
    {
        app.MapPost("/api/topics", CreateAsync)
            .RequireAuthorization("Admin");

        app.MapPut("/api/topics/{slug}", UpdateAsync)
            .RequireAuthorization("Admin");

        app.MapPost("/api/topics/{slug}/lessons", AddLessonAsync)
            .RequireAuthorization("Admin");

        app.MapPost("/api/topics/{slug}/resources", AddResourceAsync)
            .RequireAuthorization("Admin");
        app.MapDelete("/api/topics/{slug}", DeleteAsync)
            .RequireAuthorization("Admin");
    }

    private static async Task<IResult> CreateAsync(
        TopicInput input,
        SkillForgeDbContext db,
        CancellationToken cancellationToken)
    {
        var errors = Validate(input);

        if (errors.Count > 0)
        {
            return Results.ValidationProblem(errors);
        }

        var slug = input.Slug!.Trim();

        if (await db.Topics.AnyAsync(
            topic => topic.Slug == slug,
            cancellationToken))
        {
            return Results.Conflict(new
            {
                message = "A topic with this slug already exists."
            });
        }

        var topic = new LearningTopic
        {
            Slug = slug,
            Title = input.Title!.Trim(),
            Category = input.Category!.Trim(),
            Description = input.Description!.Trim(),
            Outcome = input.Outcome!.Trim(),
            TaskCount = 0
        };

        db.Topics.Add(topic);

        try
        {
            await db.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException error) when (
            error.InnerException is PostgresException
            {
                SqlState: PostgresErrorCodes.UniqueViolation,
                ConstraintName: "IX_topics_Slug"
            })
        {
            return Results.Conflict(new
            {
                message = "A topic with this slug already exists."
            });
        }

        return Results.Created(
            $"/api/topics/{topic.Slug}",
            new { topic.Slug }
        );
    }

    private static async Task<IResult> UpdateAsync(
        string slug,
        TopicInput input,
        SkillForgeDbContext db,
        CancellationToken cancellationToken)
    {
        var errors = Validate(input);

        if (input.Slug?.Trim() != slug)
        {
            errors["slug"] = ["The topic slug cannot be changed."];
        }

        if (errors.Count > 0)
        {
            return Results.ValidationProblem(errors);
        }

        var topic = await db.Topics.SingleOrDefaultAsync(
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

        topic.Title = input.Title!.Trim();
        topic.Category = input.Category!.Trim();
        topic.Description = input.Description!.Trim();
        topic.Outcome = input.Outcome!.Trim();

        await db.SaveChangesAsync(cancellationToken);

        return Results.Ok(new { topic.Slug });
    }

    private static async Task<IResult> AddLessonAsync(
    string slug,
    LessonInput input,
    SkillForgeDbContext db,
    CancellationToken cancellationToken)
    {
        var errors = new Dictionary<string, string[]>();

        if (
            string.IsNullOrWhiteSpace(input.Title) ||
            input.Title.Trim().Length > 200
        )
        {
            errors["title"] =
            [
                "Enter a title between 1 and 200 characters."
            ];
        }

        if (
            string.IsNullOrWhiteSpace(input.Description) ||
            input.Description.Trim().Length > 4000
        )
        {
            errors["description"] =
            [
                "Enter a description between 1 and 4000 characters."
            ];
        }

        if (errors.Count > 0)
        {
            return Results.ValidationProblem(errors);
        }

        var topic = await db.Topics
            .Include(item => item.Lessons)
            .SingleOrDefaultAsync(
                item => item.Slug == slug,
                cancellationToken
            );

        if (topic is null)
        {
            return Results.NotFound(new
            {
                message = "Topic not found."
            });
        }

        var nextPosition = topic.Lessons.Count == 0
            ? 1
            : topic.Lessons.Max(item => item.Position) + 1;

        var lesson = new LearningLesson
        {
            Id = $"lesson-{Guid.NewGuid():N}",
            TopicId = topic.Id,
            Title = input.Title!.Trim(),
            Description = input.Description!.Trim(),
            Position = nextPosition
        };

        var previousCount = topic.Lessons.Count;

        db.Lessons.Add(lesson);
        topic.TaskCount = previousCount + 1;
        // Relationship fixup adds the new lesson to the tracked collection.
        try
        {
            await db.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException error) when (
            error.InnerException is PostgresException
            {
                SqlState: PostgresErrorCodes.UniqueViolation,
                ConstraintName: "IX_lessons_TopicId_Position"
            })
        {
            return Results.Conflict(new
            {
                message = "The task list changed. Please retry."
            });
        }

        return Results.Created(
            $"/api/topics/{topic.Slug}",
            new
            {
                lesson.Id,
                lesson.Title,
                lesson.Description,
                lesson.Position
            }
        );
    }

    private static async Task<IResult> AddResourceAsync(
    string slug,
    ResourceInput input,
    SkillForgeDbContext db,
    CancellationToken cancellationToken)
    {
        var errors = new Dictionary<string, string[]>();

        var title = input.Title?.Trim();
        var url = input.Url?.Trim();

        if (string.IsNullOrEmpty(title) || title.Length > 200)
        {
            errors["title"] =
            [
                "Enter a title between 1 and 200 characters."
            ];
        }

        if (
            string.IsNullOrEmpty(url) ||
            url.Length > 2048 ||
            !Uri.TryCreate(url, UriKind.Absolute, out var address) ||
            (
                address.Scheme != Uri.UriSchemeHttps &&
                address.Scheme != Uri.UriSchemeHttp
            ) ||
            string.IsNullOrEmpty(address.Host)
        )
        {
            errors["url"] =
            [
                "Enter a valid HTTP or HTTPS URL, up to 2048 characters."
            ];
        }

        if (errors.Count > 0)
        {
            return Results.ValidationProblem(errors);
        }

        var topic = await db.Topics
            .Include(item => item.Resources)
            .SingleOrDefaultAsync(
                item => item.Slug == slug,
                cancellationToken
            );

        if (topic is null)
        {
            return Results.NotFound(new
            {
                message = "Topic not found."
            });
        }

        var nextPosition = topic.Resources.Count == 0
            ? 1
            : topic.Resources.Max(item => item.Position) + 1;

        var resource = new LearningResource
        {
            TopicId = topic.Id,
            Title = title!,
            Url = url!,
            Position = nextPosition
        };

        db.Resources.Add(resource);

        try
        {
            await db.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException error) when (
            error.InnerException is PostgresException
            {
                SqlState: PostgresErrorCodes.UniqueViolation,
                ConstraintName: "IX_resources_TopicId_Position"
            })
        {
            return Results.Conflict(new
            {
                message = "The resource list changed. Please retry."
            });
        }

        return Results.Created(
            $"/api/topics/{topic.Slug}",
            new
            {
                resource.Id,
                resource.Title,
                resource.Url,
                resource.Position
            }
        );
    }

    private static async Task<IResult> DeleteAsync(
    string slug,
    SkillForgeDbContext db,
    CancellationToken cancellationToken)
    {
        var deleted = await db.Topics
            .Where(topic => topic.Slug == slug)
            .ExecuteDeleteAsync(cancellationToken);

        return deleted == 0
            ? Results.NotFound(new { message = "Topic not found." })
            : Results.NoContent();
    }

    private static Dictionary<string, string[]> Validate(TopicInput input)
    {
        var errors = new Dictionary<string, string[]>();

        CheckText("title", input.Title, 150);
        CheckText("category", input.Category, 100);
        CheckText("description", input.Description, 2000);
        CheckText("outcome", input.Outcome, 2000);

        var slug = input.Slug?.Trim();

        if (
            string.IsNullOrEmpty(slug) ||
            slug.Length > 100 ||
            !Regex.IsMatch(
                slug,
                "^[a-z0-9]+(?:-[a-z0-9]+)*$",
                RegexOptions.CultureInvariant,
                TimeSpan.FromMilliseconds(100)
            )
        )
        {
            errors["slug"] =
            [
                "Use lowercase letters, numbers, and single hyphens. Maximum 100 characters."
            ];
        }
        else if (slug == "new")
        {
            errors["slug"] = ["This slug is reserved."];
        }

        return errors;

        void CheckText(string field, string? value, int maxLength)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                errors[field] = [$"{field} is required."];
            }
            else if (value.Trim().Length > maxLength)
            {
                errors[field] =
                [
                    $"{field} must be at most {maxLength} characters."
                ];
            }
        }
    }
}

public sealed record TopicInput(
    string? Slug,
    string? Title,
    string? Category,
    string? Description,
    string? Outcome
);

public sealed record LessonInput(
    string? Title,
    string? Description
);

public sealed record ResourceInput(
    string? Title,
    string? Url
);