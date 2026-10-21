# SkillForge

A personal learning workspace for building technical skills through practical tasks.

## Features

- Dashboard with learning statistics
- Searchable topic catalog
- Individual topic pages with learning resources
- Interactive task checklists
- Progress saved locally in the browser
- Responsive dark interface

## Tech stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Browser localStorage

## Getting started

Install dependencies:

```bash
npm ci
```

Start the development server:

```bash
npm run dev
```

Open the local URL printed in the terminal.

## Code checks

```bash
npx eslint .
npm run build
```

## Project structure

- `src/app` — pages, routing, and shared layout
- `src/components` — interface and interactive components
- `src/lib/topics.ts` — topic types and learning content

## Technical decisions

The first version uses a typed local dataset to focus on interface
development and routing.

Task progress is stored in localStorage. Saved progress is validated
against known task IDs before being displayed.

## Current limitations

- Progress is limited to the current browser and origin.
- Clearing browser data removes saved progress.
- Topics are maintained in source code.
- Accounts, a backend, and a database are not implemented yet.

## Roadmap

- [ ] Create and edit learning topics
- [ ] Add personal learning notes
- [ ] Build an ASP.NET Core API
- [ ] Store data in PostgreSQL
- [ ] Add authentication and user-specific progress
- [ ] Containerize the application
- [ ] Add automated checks with GitHub Actions

## Learning goals

Understand React state, Next.js routing, TypeScript types,
browser persistence, and accessible responsive interfaces.
