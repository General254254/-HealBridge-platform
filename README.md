# HealBridge - Healthcare Peer Support Platform

A fullstack monorepo powering peer support communities for patients with serious illnesses.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TypeScript |
| Backend | NestJS + TypeScript |
| Database | PostgreSQL 15 + Prisma ORM |
| Cache | Redis 7 |
| Real-time | Socket.io |
| AI | OpenAI API (GPT-4) |
| Monorepo | Turborepo + pnpm |

## Project Structure

```
├── apps/
│   ├── web/              # React Frontend
│   ├── gateway/          # NestJS API Gateway
│   ├── auth-service/     # Authentication Service
│   ├── community-service/# Forums, Threads, Posts
│   └── ai-service/       # AI Copilot Service
├── packages/
│   ├── database/         # Prisma Schema & Client
│   ├── shared-types/     # Shared DTOs & Interfaces
│   └── ui-kit/           # Shared React Components
├── docker-compose.yml    # Local Dev Infrastructure
└── turbo.json            # Turborepo Config
```

## Quick Start

```bash
# Install dependencies
pnpm install

# Start infrastructure (PostgreSQL + Redis)
docker-compose up -d

# Generate Prisma client & run migrations
pnpm --filter @healbridge/database db:generate
pnpm --filter @healbridge/database db:migrate

# Start all services in development
pnpm dev
```

## Environment Variables

Copy `.env.example` to `.env` in each app directory and configure:

- `DATABASE_URL` — PostgreSQL connection string
- `REDIS_URL` — Redis connection string
- `JWT_SECRET` — Secret for JWT token signing
- `OPENAI_API_KEY` — OpenAI API key for AI Copilot
