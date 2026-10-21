using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SkillForge.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialTopics : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "topics",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Slug = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Title = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    TaskCount = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_topics", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "topics",
                columns: new[] { "Id", "Category", "Slug", "TaskCount", "Title" },
                values: new object[,]
                {
                    { 1, "Development", "web-development", 4, "Web Development" },
                    { 2, "Content", "cms", 3, "Content Management" },
                    { 3, "Systems", "linux", 3, "Linux Foundations" },
                    { 4, "Operations", "devops", 3, "DevOps Essentials" },
                    { 5, "Security", "web-security", 3, "Web Security" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_topics_Slug",
                table: "topics",
                column: "Slug",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "topics");
        }
    }
}
