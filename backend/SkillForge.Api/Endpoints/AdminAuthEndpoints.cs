using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using SkillForge.Api.Models;

namespace SkillForge.Api.Endpoints;

public static class AdminAuthEndpoints
{
    public static void MapAdminAuth(this WebApplication app)
    {
        app.MapPost("/api/auth/login", LoginAsync)
            .AllowAnonymous()
            .RequireRateLimiting("admin-login");

        app.MapGet("/api/auth/me", (ClaimsPrincipal principal) =>
        {
            return Results.Ok(new
            {
                email = principal.FindFirstValue(ClaimTypes.Email),
                role = "Admin"
            });
        })
        .RequireAuthorization("Admin");
    }

    private static async Task<IResult> LoginAsync(
        LoginInput input,
        UserManager<ApplicationUser> users,
        SignInManager<ApplicationUser> signIn,
        HttpContext context)
    {
        context.Response.Headers.CacheControl = "no-store";

        if (
            string.IsNullOrWhiteSpace(input.Email) ||
            input.Email.Length > 256 ||
            string.IsNullOrEmpty(input.Password) ||
            input.Password.Length > 1024
        )
        {
            return Results.Unauthorized();
        }

        var user = await users.FindByEmailAsync(input.Email.Trim());

        if (user is null)
        {
            return Results.Unauthorized();
        }

        var result = await signIn.CheckPasswordSignInAsync(
            user,
            input.Password,
            lockoutOnFailure: true
        );

        if (
            !result.Succeeded ||
            user.TwoFactorEnabled ||
            !await users.IsInRoleAsync(user, "Admin")
        )
        {
            return Results.Unauthorized();
        }

        var principal = await signIn.CreateUserPrincipalAsync(user);

        return Results.SignIn(
            principal,
            authenticationScheme: IdentityConstants.BearerScheme
        );
    }
}

public sealed record LoginInput(
    string? Email,
    string? Password
);