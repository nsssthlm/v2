# Contributing to ValvX Projektplattform

Thank you for your interest in contributing to ValvX! This document outlines the standards and processes for contributing to this project.

## Code of Conduct

This project adheres to our Code of Conduct. By participating, you are expected to uphold this code.

## Git Workflow

### Branch Structure

We follow Git Flow:

- `main`: Production-ready code. Protected branch, requires PR and approvals.
- `develop`: Main development branch. Features are merged here.
- `feature/*`: New features (e.g., `feature/user-dashboard`)
- `bugfix/*`: Bug fixes (e.g., `bugfix/login-error`)
- `release/*`: Release candidates (e.g., `release/v1.2.0`)
- `hotfix/*`: Production hotfixes (e.g., `hotfix/security-issue`)

### Commit Message Format

Commits should be prefixed with a tag indicating the type of change:

- `#feat:` New feature
- `#fix:` Bug fix
- `#docs:` Documentation changes
- `#style:` Code style changes (formatting, missing semicolons, etc)
- `#refactor:` Code refactoring without functionality changes
- `#test:` Adding or correcting tests
- `#chore:` Maintenance tasks, dependency updates, etc

Examples:
- `#feat: add user dashboard page`
- `#fix: resolve login authentication error`
- `#docs: update API documentation`

### Pull Request Process

1. Create a new branch from `develop` following the naming convention
2. Make your changes and commit with appropriate tags
3. Push your branch and create a Pull Request to `develop`
4. Ensure the PR has a clear description of the changes and purpose
5. Minimum of 1 reviewer must approve before merging
6. Rebase your branch on the latest `develop` if necessary

## Coding Standards

### General Guidelines

- Follow the DRY (Don't Repeat Yourself) principle
- Write self-documenting code with meaningful variable and function names
- Keep functions small and focused on a single responsibility
- Comment complex logic, but prioritize readable code over excessive comments

### Frontend (React/TypeScript)

- Follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use functional components with hooks instead of class components
- Use TypeScript interfaces for props and state
- Use absolute imports with path aliases
- Group related constants in separate files
- Use CSS-in-JS with Joy UI styling conventions

### Backend (Django/Python)

- Follow [PEP 8](https://www.python.org/dev/peps/pep-0008/) style guidelines
- Use Django's class-based views where appropriate
- Follow Django REST Framework best practices for API endpoints
- Write comprehensive docstrings for models, views, and complex functions
- Use Django's ORM methods instead of raw SQL when possible

### Database

- Use Django migrations to manage database schema changes
- Include proper indexes for fields used in filtering or sorting
- Set appropriate field types and constraints
- Document model relationships in comments or docstrings

## Testing Guidelines

- Write unit tests for business logic and utility functions
- Include tests for edge cases and error conditions
- Test API endpoints with various input scenarios
- Mock external dependencies in tests

## Review Process

- Code reviews should focus on logic, security, and adherence to standards
- Reviewers should provide constructive feedback
- Pull requests should be kept to a reasonable size to facilitate thorough review
- Address all review comments before merging

## Documentation

- Update relevant documentation when making changes
- Document API endpoints with expected inputs and outputs
- Include setup instructions for new features or dependencies
- Keep the README and related docs up to date
