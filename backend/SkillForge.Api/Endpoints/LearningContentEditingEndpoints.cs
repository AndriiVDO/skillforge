using Microsoft.EntityFrameworkCore;
using SkillForge.Api.Data;

namespace SkillForge.Api.Endpoints;

public static class LearningContentEditingEndpoints
{
    public static void MapLearningContentEditing(this WebApplication app)
    {
        var group = app.MapGroup("/api/topics/{slug}")
            .RequireAuthorization("Admin");

        group.MapPut("/lessons/{lessonId}", UpdateLessonAsync);
        group.MapDelete("/lessons/{lessonId}", DeleteLessonAsync);

        group.MapPut("/resources/{resourceId:int}", UpdateResourceAsync);
        group.MapDelete("/resources/{resourceId:int}", DeleteResourceAsync);
    }

    private static async Task<IResult> UpdateLessonAsync(
        string slug,
        string lessonId,
        LessonInput input,
        SkillForgeDbContext db,
        CancellationToken cancellationToken)
    {
        var errors = new Dictionary<string, string[]>();

        ValidateText(errors, "title", input.Title, 200);
        ValidateText(errors, "description", input.Description, 4000);

        if (errors.Count > 0)
        {
            return Results.ValidationProblem(errors);
        }

        var updated = await db.Lessons
            .Where(lesson =>
                lesson.Id == lessonId &&
                lesson.Topic.Slug == slug)
            .ExecuteUpdateAsync(
                setters => setters
                    .SetProperty(lesson => lesson.Title, input.Title!.Trim())
                    .SetProperty(
                        lesson => lesson.Description,
                        input.Description!.Trim()),
                cancellationToken);

        return updated == 0
            ? Results.NotFound(new { message = "Task not found." })
            : Results.NoContent();
    }

    private static async Task<IResult> DeleteLessonAsync(
        string slug,
        string lessonId,
        SkillForgeDbContext db,
        CancellationToken cancellationToken)
    {
        await using var transaction =
            await db.Database.BeginTransactionAsync(cancellationToken);

        var topicId = await db.Topics
            .Where(topic => topic.Slug == slug)
            .Select(topic => (int?)topic.Id)
            .SingleOrDefaultAsync(cancellationToken);

        if (topicId is null)
        {
            return Results.NotFound(new { message = "Topic not found." });
        }

        var deleted = await db.Lessons
            .Where(lesson =>
                lesson.Id == lessonId &&
                lesson.TopicId == topicId.Value)
            .ExecuteDeleteAsync(cancellationToken);

        if (deleted == 0)
        {
            return Results.NotFound(new { message = "Task not found." });
        }

        // Keep the legacy stored count in sync with the remaining lessons.
        await db.Topics
            .Where(topic => topic.Id == topicId.Value)
            .ExecuteUpdateAsync(
                setters => setters.SetProperty(
                    topic => topic.TaskCount,
                    topic => topic.Lessons.Count()),
                cancellationToken);

        await transaction.CommitAsync(cancellationToken);

        return Results.NoContent();
    }

    private static async Task<IResult> UpdateResourceAsync(
        string slug,
        int resourceId,
        ResourceInput input,
        SkillForgeDbContext db,
        CancellationToken cancellationToken)
    {
        var errors = new Dictionary<string, string[]>();

        ValidateText(errors, "title", input.Title, 200);

        var url = input.Url?.Trim();

        if (
            string.IsNullOrEmpty(url) ||
            url.Length > 2048 ||
            !Uri.TryCreate(url, UriKind.Absolute, out var address) ||
            (
                address.Scheme != Uri.UriSchemeHttp &&
                address.Scheme != Uri.UriSchemeHttps
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

        var updated = await db.Resources
            .Where(resource =>
                resource.Id == resourceId &&
                resource.Topic.Slug == slug)
            .ExecuteUpdateAsync(
                setters => setters
                    .SetProperty(resource => resource.Title, input.Title!.Trim())
                    .SetProperty(resource => resource.Url, url!),
                cancellationToken);

        return updated == 0
            ? Results.NotFound(new { message = "Resource not found." })
            : Results.NoContent();
    }

    private static async Task<IResult> DeleteResourceAsync(
        string slug,
        int resourceId,
        SkillForgeDbContext db,
        CancellationToken cancellationToken)
    {
        var deleted = await db.Resources
            .Where(resource =>
                resource.Id == resourceId &&
                resource.Topic.Slug == slug)
            .ExecuteDeleteAsync(cancellationToken);

        return deleted == 0
            ? Results.NotFound(new { message = "Resource not found." })
            : Results.NoContent();
    }

    private static void ValidateText(
        Dictionary<string, string[]> errors,
        string field,
        string? value,
        int maxLength)
    {
        if (
            string.IsNullOrWhiteSpace(value) ||
            value.Trim().Length > maxLength
        )
        {
            errors[field] =
            [
                $"Enter {field} between 1 and {maxLength} characters."
            ];
        }
    }
}