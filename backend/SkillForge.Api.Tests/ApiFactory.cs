using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;

namespace SkillForge.Api.Tests;

// Starts the real API in memory. Npgsql connects lazily, so tests that
// stop before the first database query need no running PostgreSQL.
public sealed class ApiFactory : WebApplicationFactory<Program>
{
    static ApiFactory()
    {
        // Program.cs requires a connection string at startup.
        // The value is a dummy: no test here opens a database connection.
        Environment.SetEnvironmentVariable(
            "ConnectionStrings__SkillForge",
            "Host=localhost;Port=1;Database=unused;Username=unused;Password=unused"
        );
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        // "Testing" keeps developer User Secrets out of the test run.
        builder.UseEnvironment("Testing");
    }
}
