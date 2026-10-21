using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SkillForge.Api.Migrations
{
    /// <inheritdoc />
    public partial class SeedLearningContent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "lessons",
                columns: new[] { "Id", "Description", "Position", "Title", "TopicId" },
                values: new object[,]
                {
                    { "cms-basics", "Separate the responsibilities of content storage and presentation.", 1, "Explain what a CMS does", 2 },
                    { "cms-query", "Retrieve published articles and handle missing content.", 3, "Fetch and display content", 2 },
                    { "cms-schema", "Define an article with a title, slug, body, and publication date.", 2, "Design a content schema", 2 },
                    { "devops-ci", "Run automated checks when code is pushed to GitHub.", 3, "Create a CI workflow", 4 },
                    { "devops-compose", "Connect an application and database using configuration.", 2, "Run services with Compose", 4 },
                    { "devops-docker", "Explain the difference between an image and a running container.", 1, "Build a Docker image", 4 },
                    { "linux-files", "Practise pwd, ls, cd, mkdir, cp, mv, and reading text files.", 1, "Navigate files and directories", 3 },
                    { "linux-permissions", "Explain users, groups, and read, write, and execute permissions.", 2, "Understand file permissions", 3 },
                    { "linux-processes", "Find a running process and inspect application output.", 3, "Inspect processes and logs", 3 },
                    { "security-access", "Verify that a user can access only the data they are allowed to use.", 2, "Check access control", 5 },
                    { "security-http", "Explain requests, responses, cookies, and authenticated sessions.", 1, "Understand HTTP and sessions", 5 },
                    { "security-lab", "Record the cause, reproduction steps, and fix for a lab vulnerability.", 3, "Complete a training lab", 5 },
                    { "web-css", "Use Grid, Flexbox, spacing, and breakpoints to support different screens.", 2, "Build a responsive layout", 1 },
                    { "web-html", "Explain when to use main, nav, section, headings, buttons, and links.", 1, "Understand semantic HTML", 1 },
                    { "web-next", "Create pages and explain how folders map to URLs.", 4, "Understand Next.js routing", 1 },
                    { "web-react", "Explain props, state, events, and how a component renders data.", 3, "Understand React components", 1 }
                });

            migrationBuilder.InsertData(
                table: "resources",
                columns: new[] { "Id", "Position", "Title", "TopicId", "Url" },
                values: new object[,]
                {
                    { 101, 1, "MDN Web Docs", 1, "https://developer.mozilla.org/en-US/docs/Learn_web_development" },
                    { 102, 2, "React Learn", 1, "https://react.dev/learn" },
                    { 103, 3, "Next.js Documentation", 1, "https://nextjs.org/docs" },
                    { 201, 1, "Sanity Documentation", 2, "https://www.sanity.io/docs" },
                    { 202, 2, "WordPress Learn", 2, "https://learn.wordpress.org/" },
                    { 301, 1, "Ubuntu Tutorials", 3, "https://ubuntu.com/tutorials" },
                    { 302, 2, "GNU Bash Manual", 3, "https://www.gnu.org/software/bash/manual/" },
                    { 401, 1, "Docker Get Started", 4, "https://docs.docker.com/get-started/" },
                    { 402, 2, "GitHub Actions Documentation", 4, "https://docs.github.com/en/actions" },
                    { 501, 1, "PortSwigger Web Security Academy", 5, "https://portswigger.net/web-security" },
                    { 502, 2, "Hacker101", 5, "https://www.hacker101.com/" }
                });

            migrationBuilder.UpdateData(
                table: "topics",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Description", "Outcome" },
                values: new object[] { "Build interfaces and understand how browsers, components, and servers work together.", "Build and publish the first version of SkillForge." });

            migrationBuilder.UpdateData(
                table: "topics",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Description", "Outcome" },
                values: new object[] { "Structure content and let editors manage it independently from application code.", "Create a small learning-article library powered by a CMS." });

            migrationBuilder.UpdateData(
                table: "topics",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Description", "Outcome" },
                values: new object[] { "Navigate a Linux system and understand files, permissions, processes, and logs.", "Document how to run and troubleshoot an application on Linux." });

            migrationBuilder.UpdateData(
                table: "topics",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "Description", "Outcome" },
                values: new object[] { "Make application builds, checks, and deployments repeatable.", "Run a project with Docker and verify it through GitHub Actions." });

            migrationBuilder.UpdateData(
                table: "topics",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "Description", "Outcome" },
                values: new object[] { "Understand how applications protect accounts, input, and private data.", "Document and fix a security issue in a local training application." });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "lessons",
                keyColumn: "Id",
                keyValue: "cms-basics");

            migrationBuilder.DeleteData(
                table: "lessons",
                keyColumn: "Id",
                keyValue: "cms-query");

            migrationBuilder.DeleteData(
                table: "lessons",
                keyColumn: "Id",
                keyValue: "cms-schema");

            migrationBuilder.DeleteData(
                table: "lessons",
                keyColumn: "Id",
                keyValue: "devops-ci");

            migrationBuilder.DeleteData(
                table: "lessons",
                keyColumn: "Id",
                keyValue: "devops-compose");

            migrationBuilder.DeleteData(
                table: "lessons",
                keyColumn: "Id",
                keyValue: "devops-docker");

            migrationBuilder.DeleteData(
                table: "lessons",
                keyColumn: "Id",
                keyValue: "linux-files");

            migrationBuilder.DeleteData(
                table: "lessons",
                keyColumn: "Id",
                keyValue: "linux-permissions");

            migrationBuilder.DeleteData(
                table: "lessons",
                keyColumn: "Id",
                keyValue: "linux-processes");

            migrationBuilder.DeleteData(
                table: "lessons",
                keyColumn: "Id",
                keyValue: "security-access");

            migrationBuilder.DeleteData(
                table: "lessons",
                keyColumn: "Id",
                keyValue: "security-http");

            migrationBuilder.DeleteData(
                table: "lessons",
                keyColumn: "Id",
                keyValue: "security-lab");

            migrationBuilder.DeleteData(
                table: "lessons",
                keyColumn: "Id",
                keyValue: "web-css");

            migrationBuilder.DeleteData(
                table: "lessons",
                keyColumn: "Id",
                keyValue: "web-html");

            migrationBuilder.DeleteData(
                table: "lessons",
                keyColumn: "Id",
                keyValue: "web-next");

            migrationBuilder.DeleteData(
                table: "lessons",
                keyColumn: "Id",
                keyValue: "web-react");

            migrationBuilder.DeleteData(
                table: "resources",
                keyColumn: "Id",
                keyValue: 101);

            migrationBuilder.DeleteData(
                table: "resources",
                keyColumn: "Id",
                keyValue: 102);

            migrationBuilder.DeleteData(
                table: "resources",
                keyColumn: "Id",
                keyValue: 103);

            migrationBuilder.DeleteData(
                table: "resources",
                keyColumn: "Id",
                keyValue: 201);

            migrationBuilder.DeleteData(
                table: "resources",
                keyColumn: "Id",
                keyValue: 202);

            migrationBuilder.DeleteData(
                table: "resources",
                keyColumn: "Id",
                keyValue: 301);

            migrationBuilder.DeleteData(
                table: "resources",
                keyColumn: "Id",
                keyValue: 302);

            migrationBuilder.DeleteData(
                table: "resources",
                keyColumn: "Id",
                keyValue: 401);

            migrationBuilder.DeleteData(
                table: "resources",
                keyColumn: "Id",
                keyValue: 402);

            migrationBuilder.DeleteData(
                table: "resources",
                keyColumn: "Id",
                keyValue: 501);

            migrationBuilder.DeleteData(
                table: "resources",
                keyColumn: "Id",
                keyValue: 502);

            migrationBuilder.UpdateData(
                table: "topics",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Description", "Outcome" },
                values: new object[] { "", "" });

            migrationBuilder.UpdateData(
                table: "topics",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Description", "Outcome" },
                values: new object[] { "", "" });

            migrationBuilder.UpdateData(
                table: "topics",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Description", "Outcome" },
                values: new object[] { "", "" });

            migrationBuilder.UpdateData(
                table: "topics",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "Description", "Outcome" },
                values: new object[] { "", "" });

            migrationBuilder.UpdateData(
                table: "topics",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "Description", "Outcome" },
                values: new object[] { "", "" });
        }
    }
}
