export type Topic = {
  slug: string;
  title: string;
  category: string;
  description: string;
  outcome: string;
  lessons: {
    id: string;
    title: string;
    description: string;
  }[];
  resources: {
    title: string;
    url: string;
  }[];
};

export const topics: Topic[] = [
  {
    slug: "web-development",
    title: "Web Development",
    category: "Development",
    description:
      "Build interfaces and understand how browsers, components, and servers work together.",
    outcome: "Build and publish the first version of SkillForge.",
    lessons: [
      {
        id: "web-html",
        title: "Understand semantic HTML",
        description:
          "Explain when to use main, nav, section, headings, buttons, and links.",
      },
      {
        id: "web-css",
        title: "Build a responsive layout",
        description:
          "Use Grid, Flexbox, spacing, and breakpoints to support different screens.",
      },
      {
        id: "web-react",
        title: "Understand React components",
        description:
          "Explain props, state, events, and how a component renders data.",
      },
      {
        id: "web-next",
        title: "Understand Next.js routing",
        description: "Create pages and explain how folders map to URLs.",
      },
    ],
    resources: [
      {
        title: "MDN Web Docs",
        url: "https://developer.mozilla.org/en-US/docs/Learn_web_development",
      },
      {
        title: "React Learn",
        url: "https://react.dev/learn",
      },
      {
        title: "Next.js Documentation",
        url: "https://nextjs.org/docs",
      },
    ],
  },
  {
    slug: "cms",
    title: "Content Management",
    category: "Content",
    description:
      "Structure content and let editors manage it independently from application code.",
    outcome: "Create a small learning-article library powered by a CMS.",
    lessons: [
      {
        id: "cms-basics",
        title: "Explain what a CMS does",
        description:
          "Separate the responsibilities of content storage and presentation.",
      },
      {
        id: "cms-schema",
        title: "Design a content schema",
        description:
          "Define an article with a title, slug, body, and publication date.",
      },
      {
        id: "cms-query",
        title: "Fetch and display content",
        description: "Retrieve published articles and handle missing content.",
      },
    ],
    resources: [
      {
        title: "Sanity Documentation",
        url: "https://www.sanity.io/docs",
      },
      {
        title: "WordPress Learn",
        url: "https://learn.wordpress.org/",
      },
    ],
  },
  {
    slug: "linux",
    title: "Linux Foundations",
    category: "Systems",
    description:
      "Navigate a Linux system and understand files, permissions, processes, and logs.",
    outcome: "Document how to run and troubleshoot an application on Linux.",
    lessons: [
      {
        id: "linux-files",
        title: "Navigate files and directories",
        description:
          "Practise pwd, ls, cd, mkdir, cp, mv, and reading text files.",
      },
      {
        id: "linux-permissions",
        title: "Understand file permissions",
        description:
          "Explain users, groups, and read, write, and execute permissions.",
      },
      {
        id: "linux-processes",
        title: "Inspect processes and logs",
        description: "Find a running process and inspect application output.",
      },
    ],
    resources: [
      {
        title: "Ubuntu Tutorials",
        url: "https://ubuntu.com/tutorials",
      },
      {
        title: "GNU Bash Manual",
        url: "https://www.gnu.org/software/bash/manual/",
      },
    ],
  },
  {
    slug: "devops",
    title: "DevOps Essentials",
    category: "Operations",
    description: "Make application builds, checks, and deployments repeatable.",
    outcome: "Run a project with Docker and verify it through GitHub Actions.",
    lessons: [
      {
        id: "devops-docker",
        title: "Build a Docker image",
        description:
          "Explain the difference between an image and a running container.",
      },
      {
        id: "devops-compose",
        title: "Run services with Compose",
        description: "Connect an application and database using configuration.",
      },
      {
        id: "devops-ci",
        title: "Create a CI workflow",
        description: "Run automated checks when code is pushed to GitHub.",
      },
    ],
    resources: [
      {
        title: "Docker Get Started",
        url: "https://docs.docker.com/get-started/",
      },
      {
        title: "GitHub Actions Documentation",
        url: "https://docs.github.com/en/actions",
      },
    ],
  },
  {
    slug: "web-security",
    title: "Web Security",
    category: "Security",
    description:
      "Understand how applications protect accounts, input, and private data.",
    outcome:
      "Document and fix a security issue in a local training application.",
    lessons: [
      {
        id: "security-http",
        title: "Understand HTTP and sessions",
        description:
          "Explain requests, responses, cookies, and authenticated sessions.",
      },
      {
        id: "security-access",
        title: "Check access control",
        description:
          "Verify that a user can access only the data they are allowed to use.",
      },
      {
        id: "security-lab",
        title: "Complete a training lab",
        description:
          "Record the cause, reproduction steps, and fix for a lab vulnerability.",
      },
    ],
    resources: [
      {
        title: "PortSwigger Web Security Academy",
        url: "https://portswigger.net/web-security",
      },
      {
        title: "Hacker101",
        url: "https://www.hacker101.com/",
      },
    ],
  },
];
