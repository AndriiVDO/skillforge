using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace SkillForge.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddLearningContent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "topics",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Outcome",
                table: "topics",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "lessons",
                columns: table => new
                {
                    Id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    TopicId = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                    Position = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_lessons", x => x.Id);
                    table.ForeignKey(
                        name: "FK_lessons_topics_TopicId",
                        column: x => x.TopicId,
                        principalTable: "topics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "resources",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TopicId = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Url = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: false),
                    Position = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_resources", x => x.Id);
                    table.ForeignKey(
                        name: "FK_resources_topics_TopicId",
                        column: x => x.TopicId,
                        principalTable: "topics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

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

            migrationBuilder.CreateIndex(
                name: "IX_lessons_TopicId_Position",
                table: "lessons",
                columns: new[] { "TopicId", "Position" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_resources_TopicId_Position",
                table: "resources",
                columns: new[] { "TopicId", "Position" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "lessons");

            migrationBuilder.DropTable(
                name: "resources");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "topics");

            migrationBuilder.DropColumn(
                name: "Outcome",
                table: "topics");
        }
    }
}
