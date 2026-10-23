using Microsoft.AspNetCore.Identity;
using SkillForge.Api.Models;

namespace SkillForge.Api.Data;

public static class AdminProvisioner
{
    public static async Task CreateAsync(
        IServiceProvider services,
        IConfiguration configuration)
    {
        var email = configuration["BootstrapAdmin:Email"]?.Trim();
        var password = configuration["BootstrapAdmin:Password"];

        if (
            string.IsNullOrWhiteSpace(email) ||
            string.IsNullOrWhiteSpace(password)
        )
        {
            throw new InvalidOperationException(
                "Configure BootstrapAdmin:Email and BootstrapAdmin:Password."
            );
        }

        await using var scope = services.CreateAsyncScope();

        var users = scope.ServiceProvider
            .GetRequiredService<UserManager<ApplicationUser>>();

        var roles = scope.ServiceProvider
            .GetRequiredService<RoleManager<IdentityRole>>();

        var db = scope.ServiceProvider
            .GetRequiredService<SkillForgeDbContext>();

        var existing = await users.FindByEmailAsync(email);

        if (existing is not null)
        {
            if (await users.IsInRoleAsync(existing, "Admin"))
            {
                Console.WriteLine(
                    "Administrator already exists. No changes were made."
                );

                return;
            }

            throw new InvalidOperationException(
                "This email belongs to an existing non-admin account."
            );
        }

        await using var transaction =
            await db.Database.BeginTransactionAsync();

        if (!await roles.RoleExistsAsync("Admin"))
        {
            EnsureSuccess(
                await roles.CreateAsync(new IdentityRole("Admin"))
            );
        }

        var user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            LockoutEnabled = true
        };

        EnsureSuccess(await users.CreateAsync(user, password));
        EnsureSuccess(await users.AddToRoleAsync(user, "Admin"));

        await transaction.CommitAsync();

        Console.WriteLine("Administrator created successfully.");
    }

    private static void EnsureSuccess(IdentityResult result)
    {
        if (result.Succeeded)
        {
            return;
        }

        throw new InvalidOperationException(
            string.Join(
                "; ",
                result.Errors.Select(error => error.Description)
            )
        );
    }
}