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
        app.MapPost("/api/topics", CreateAsync);
        app.MapPut("/api/topics/{slug}", UpdateAsync);
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