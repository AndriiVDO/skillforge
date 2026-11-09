using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace SkillForge.Api.Tests;

public sealed class AuthAndAccessTests(ApiFactory factory)
    : IClassFixture<ApiFactory>
{
    private readonly HttpClient client = factory.CreateClient();

    [Fact]
    public async Task Health_is_public_and_reports_ok()
    {
        var response = await client.GetAsync("/api/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await response.Content
            .ReadFromJsonAsync<Dictionary<string, string>>();

        Assert.Equal("ok", body!["status"]);
    }

    // Every write endpoint requires the Admin policy. The policy runs
    // before the handler, so no database is involved.
    [Theory]
    [InlineData("POST", "/api/topics")]
    [InlineData("PUT", "/api/topics/linux")]
    [InlineData("DELETE", "/api/topics/linux")]
    [InlineData("PUT", "/api/topics/linux/publication")]
    [InlineData("POST", "/api/topics/linux/lessons")]
    [InlineData("POST", "/api/topics/linux/resources")]
    [InlineData("GET", "/api/auth/me")]
    public async Task Protected_endpoints_reject_anonymous_requests(
        string method,
        string path)
    {
        var request = new HttpRequestMessage(new HttpMethod(method), path);

        if (method is "POST" or "PUT")
        {
            request.Content = JsonContent.Create(new { });
        }

        var response = await client.SendAsync(request);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    // Invalid input is rejected before any user lookup happens.
    [Theory]
    [InlineData("", "")]
    [InlineData("admin@example.com", "")]
    [InlineData("", "SomePassword1!")]
    [InlineData("   ", "SomePassword1!")]
    public async Task Login_rejects_missing_credentials(
        string email,
        string password)
    {
        var response = await client.PostAsJsonAsync(
            "/api/auth/login",
            new { email, password }
        );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Login_rejects_oversized_password()
    {
        var response = await client.PostAsJsonAsync(
            "/api/auth/login",
            new { email = "admin@example.com", password = new string('a', 1025) }
        );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Login_response_is_not_cacheable()
    {
        var response = await client.PostAsJsonAsync(
            "/api/auth/login",
            new { email = "", password = "" }
        );

        Assert.Contains("no-store", response.Headers.CacheControl?.ToString());
    }

    // Documents the security configuration so that a weakening change
    // fails a test instead of passing silently.
    [Fact]
    public void Identity_options_enforce_the_documented_policy()
    {
        using var scope = factory.Services.CreateScope();

        var options = scope.ServiceProvider
            .GetRequiredService<IOptions<IdentityOptions>>()
            .Value;

        Assert.Equal(12, options.Password.RequiredLength);
        Assert.True(options.Password.RequireDigit);
        Assert.True(options.Password.RequireLowercase);
        Assert.True(options.Password.RequireUppercase);
        Assert.True(options.Password.RequireNonAlphanumeric);
        Assert.True(options.User.RequireUniqueEmail);
        Assert.Equal(5, options.Lockout.MaxFailedAccessAttempts);
        Assert.Equal(TimeSpan.FromMinutes(10), options.Lockout.DefaultLockoutTimeSpan);
    }
}
