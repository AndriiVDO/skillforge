using Microsoft.EntityFrameworkCore;
using SkillForge.Api.Models;

namespace SkillForge.Api.Data;

public static class LearningContentSeed
{
    public static void Configure(ModelBuilder modelBuilder)
    {
        AddTopic(
            modelBuilder,
            id: 1,
            slug: "web-development",
            title: "Web Development",
            category: "Development",
            description:
                "Build interfaces and understand how browsers, components, and servers work together.",
            outcome:
                "Build and publish the first version of SkillForge.",
            lessons:
            [
                (
                    "web-html",
                    "Understand semantic HTML",
                    "Explain when to use main, nav, section, headings, buttons, and links."
                ),
                (
                    "web-css",
                    "Build a responsive layout",
                    "Use Grid, Flexbox, spacing, and breakpoints to support different screens."
                ),
                (
                    "web-react",
                    "Understand React components",
                    "Explain props, state, events, and how a component renders data."
                ),
                (
                    "web-next",
                    "Understand Next.js routing",
                    "Create pages and explain how folders map to URLs."
                )
            ],
            resources:
            [
                (
                    "MDN Web Docs",
                    "https://developer.mozilla.org/en-US/docs/Learn_web_development"
                ),
                (
                    "React Learn",
                    "https://react.dev/learn"
                ),
                (
                    "Next.js Documentation",
                    "https://nextjs.org/docs"
                )
            ]
        );

        AddTopic(
            modelBuilder,
            id: 2,
            slug: "cms",
            title: "Content Management",
            category: "Content",
            description:
                "Structure content and let editors manage it independently from application code.",
            outcome:
                "Create a small learning-article library powered by a CMS.",
            lessons:
            [
                (
                    "cms-basics",
                    "Explain what a CMS does",
                    "Separate the responsibilities of content storage and presentation."
                ),
                (
                    "cms-schema",
                    "Design a content schema",
                    "Define an article with a title, slug, body, and publication date."
                ),
                (
                    "cms-query",
                    "Fetch and display content",
                    "Retrieve published articles and handle missing content."
                )
            ],
            resources:
            [
                (
                    "Sanity Documentation",
                    "https://www.sanity.io/docs"
                ),
                (
                    "WordPress Learn",
                    "https://learn.wordpress.org/"
                )
            ]
        );

        AddTopic(
            modelBuilder,
            id: 3,
            slug: "linux",
            title: "Linux Foundations",
            category: "Systems",
            description:
                "Navigate a Linux system and understand files, permissions, processes, and logs.",
            outcome:
                "Document how to run and troubleshoot an application on Linux.",
            lessons:
            [
                (
                    "linux-files",
                    "Navigate files and directories",
                    "Practise pwd, ls, cd, mkdir, cp, mv, and reading text files."
                ),
                (
                    "linux-permissions",
                    "Understand file permissions",
                    "Explain users, groups, and read, write, and execute permissions."
                ),
                (
                    "linux-processes",
                    "Inspect processes and logs",
                    "Find a running process and inspect application output."
                )
            ],
            resources:
            [
                (
                    "Ubuntu Tutorials",
                    "https://ubuntu.com/tutorials"
                ),
                (
                    "GNU Bash Manual",
                    "https://www.gnu.org/software/bash/manual/"
                )
            ]
        );

        AddTopic(
            modelBuilder,
            id: 4,
            slug: "devops",
            title: "DevOps Essentials",
            category: "Operations",
            description:
                "Make application builds, checks, and deployments repeatable.",
            outcome:
                "Run a project with Docker and verify it through GitHub Actions.",
            lessons:
            [
                (
                    "devops-docker",
                    "Build a Docker image",
                    "Explain the difference between an image and a running container."
                ),
                (
                    "devops-compose",
                    "Run services with Compose",
                    "Connect an application and database using configuration."
                ),
                (
                    "devops-ci",
                    "Create a CI workflow",
                    "Run automated checks when code is pushed to GitHub."
                )
            ],
            resources:
            [
                (
                    "Docker Get Started",
                    "https://docs.docker.com/get-started/"
                ),
                (
                    "GitHub Actions Documentation",
                    "https://docs.github.com/en/actions"
                )
            ]
        );

        AddTopic(
            modelBuilder,
            id: 5,
            slug: "web-security",
            title: "Web Security",
            category: "Security",
            description:
                "Understand how applications protect accounts, input, and private data.",
            outcome:
                "Document and fix a security issue in a local training application.",
            lessons:
            [
                (
                    "security-http",
                    "Understand HTTP and sessions",
                    "Explain requests, responses, cookies, and authenticated sessions."
                ),
                (
                    "security-access",
                    "Check access control",
                    "Verify that a user can access only the data they are allowed to use."
                ),
                (
                    "security-lab",
                    "Complete a training lab",
                    "Record the cause, reproduction steps, and fix for a lab vulnerability."
                )
            ],
            resources:
            [
                (
                    "PortSwigger Web Security Academy",
                    "https://portswigger.net/web-security"
                ),
                (
                    "Hacker101",
                    "https://www.hacker101.com/"
                )
            ]
        );
    }

    private static void AddTopic(
        ModelBuilder modelBuilder,
        int id,
        string slug,
        string title,
        string category,
        string description,
        string outcome,
        (string Id, string Title, string Description)[] lessons,
        (string Title, string Url)[] resources)
    {
        modelBuilder.Entity<LearningTopic>().HasData(
            new LearningTopic
            {
                Id = id,
                Slug = slug,
                Title = title,
                Category = category,
                Description = description,
                Outcome = outcome,
                IsPublished = true,
                TaskCount = lessons.Length
            }
        );

        for (var index = 0; index < lessons.Length; index++)
        {
            var lesson = lessons[index];

            modelBuilder.Entity<LearningLesson>().HasData(
                new LearningLesson
                {
                    Id = lesson.Id,
                    TopicId = id,
                    Title = lesson.Title,
                    Description = lesson.Description,
                    Position = index + 1
                }
            );
        }

        for (var index = 0; index < resources.Length; index++)
        {
            var resource = resources[index];

            modelBuilder.Entity<LearningResource>().HasData(
                new LearningResource
                {
                    Id = id * 100 + index + 1,
                    TopicId = id,
                    Title = resource.Title,
                    Url = resource.Url,
                    Position = index + 1
                }
            );
        }
    }
}