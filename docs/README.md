# Evolusea Backend Documentation

Comprehensive documentation for the Evolusea NestJS backend service.

## Quick Links

| Document | Description |
|----------|-------------|
| [Architecture](architecture.md) | System architecture, DDD layers, CQRS, and design patterns |
| [API Reference](api-reference.md) | All REST API endpoints, authentication, and error handling |
| [Database Schema](database-schema.md) | Entities, relationships, constraints, and migration workflow |
| [Configuration](configuration.md) | Environment variables, config provider, and feature flags |
| [Development Guide](development-guide.md) | Local setup, project structure, and coding conventions |
| [Testing](testing.md) | Unit, E2E, and smoke testing strategies |
| [Deployment](deployment.md) | CI/CD pipeline, Docker, AWS infrastructure, and Terraform |
| [AI Integration](ai-integration.md) | AI providers, prompt templates, and Compass chat flow |
| [Domain Modules](domain-modules.md) | Domain-driven design modules, scheduled tasks, and events |

## Project Overview

Evolusea Backend is a NestJS + TypeORM service that powers the Evolusea mindfulness and personal growth platform. It provides:

- **Compass** -- An AI-powered conversational guide that adapts to the user's belief system and emotional state
- **Notes** -- Personal journaling with AI-generated summaries
- **Paths** -- Goal-setting and tracking with reminders
- **Quotes** -- Daily motivational quotes personalized by belief system
- **Vision Boards** -- Curated collections of paths, notes, and wisdom stories
- **Wisdom Stories** -- Faith-based inspirational content synced from a CMS
- **Calendar Events** -- Religious and cultural event tracking with notifications

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | NestJS 11 |
| Language | TypeScript 5.8 |
| Runtime | Node.js 22 |
| Database | PostgreSQL 16 |
| ORM | TypeORM 0.3 |
| Authentication | Firebase Admin SDK |
| AI Providers | OpenAI, Google Gemini |
| Payments | RevenueCat |
| CMS | Strapi |
| Monitoring | Sentry, Loggly (Winston) |
| Infrastructure | AWS (Elastic Beanstalk, ECR, RDS, Route53) |
| IaC | Terraform (Terraform Cloud) |
| CI/CD | GitHub Actions |
| Testing | Vitest, Testcontainers, Supertest |
| Package Manager | Yarn 1.22 |
