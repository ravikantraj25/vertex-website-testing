# Project Contributing Guide

Thank you for your interest in contributing to this project. Please follow the steps and standards below to ensure smooth collaboration.

## Prerequisites
- Node.js (LTS recommended)
- pnpm / npm / yarn (use the package manager configured for this project)
- Git installed locally

## Getting Started
1. Clone the repository
   - git clone https://github.com/your-org/your-nextjs-project.git
   - cd your-nextjs-project

2. Install dependencies (choose one)
   - npm install
   - yarn install
   - pnpm install

3. Run the development server
   - npm run dev

Your app should be available at: http://localhost:3000

## Branching Strategy
- main: Production (live)
- staging: Pre-production / PR target
- feature/*: Work branches

Create a feature branch:
- git checkout -b feature/your-feature-name

Naming tips:
- Use lowercase
- Separate words with hyphens
  - Example: feature/add-user-profile-ui

## Write Your Code
- Follow existing code style and linting rules
- Add tests if applicable

## Commit Message Convention
Use the semantic format: <type>(scope): message

Types: feat, fix, refactor, docs, test, chore

Examples:
- feat(auth): add login UI
- fix(api): handle null response from user endpoint
- docs(readme): update installation steps

## Submit a Pull Request
1. Push your branch:
   - git push -u origin feature/your-feature-name
2. Open a pull request targeting the staging branch

PR requirements:
- Clear description of changes
- Reference related issue (if any)
- Tests passing (if applicable)

Merge flow:
- feature/* -> staging -> main

## Creating an Issue
Before coding, create an issue describing the change or problem.

Issue template:
- Summary: Brief description of the feature or bug
- What needs to be done: checklist of steps
- Screenshots / Logs (if applicable)
- Related issues / context

## Code of Conduct
- Be respectful and collaborative
- Follow review feedback professionally
- Ask for help if stuck