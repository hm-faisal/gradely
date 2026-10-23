# Gradely — Project Submission & Evaluation Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x%20%7C%206.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3-61DAFB?logo=react)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5.3-green?logo=express)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-8.0-2D3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14%2B-336791?logo=postgresql)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)

Gradely is a full-stack educational assessment platform designed to streamline project submissions, code evaluations, reviewer assignments, and student feedback loops in real time. Built with high performance, strict type safety, and role-based access control (RBAC), Gradely connects **Students**, **Reviewers**, and **Administrators** in a unified, intuitive workflow.

---

## Table of Contents

- [Overview](#overview)
- [Key Features by Role](#key-features-by-role)
  - [Student Workspace](#student-workspace)
  - [Reviewer Workspace](#reviewer-workspace)
  - [Administrator Console](#administrator-console)
- [Technology Stack](#technology-stack)
- [Repository Structure](#repository-structure)
- [Security & Architecture Highlights](#security--architecture-highlights)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
- [Environment Variables](#environment-variables)
- [Default Seed Accounts](#default-seed-accounts)
- [API Reference](#api-reference)
- [NPM Scripts Reference](#npm-scripts-reference)

---

## Overview

Educational and training programs frequently struggle with scattered submission workflows, slow review cycles, and disconnected feedback delivery. Gradely solves this by providing:

1. **Structured Project Submissions**: Students submit live URLs, repository links, and descriptions with automatic URL validation and GitHub preview generation.
2. **Inline GitHub Code & README Preview**: Reviewers can inspect repository READMEs and metadata directly inside the platform through GitHub's REST API without context-switching.
3. **Decoupled Reviewer Allocation**: Administrators can assign pending submissions to designated reviewers, track reviewer workloads, and monitor turnaround times.
4. **Actionable Feedback Loop**: Reviewers provide explicit approvals or rejections paired with rich markdown feedback that students receive instantaneously.

---

## Key Features by Role

### Student Workspace (`/me`)
- **Dashboard Overview**: Summary of total submissions, pending reviews, approvals, and monthly submission activity charts.
- **New Submission Modal**: Submit projects with validation for Git repository URLs (`github.com`, `gitlab.com`, `bitbucket.org`, etc.) and live deployed URLs.
- **My Submissions (`/me/submissions`)**: Paginated list of student submissions with search, status filters (Pending, Approved, Rejected), and direct links to live apps and repositories.
- **Feedback Inbox (`/me/feedback`)**: Dedicated feedback feed showing reviewer evaluations, approval status, and evaluation notes.

### Reviewer Workspace (`/reviewer`)
- **Reviewer Dashboard**: Metrics highlighting assigned submissions, completed evaluations, and approval/rejection rates.
- **Assigned Queue (`/reviewer/submissions`)**: Submissions specifically assigned to the logged-in reviewer.
- **Interactive Review Drawer**:
  - Live GitHub repository preview (renders the project's README, star count, default branch, and fork counts directly from GitHub's REST API).
  - Decision form: Mark submission as `APPROVED` or `REJECTED` and provide mandatory evaluation feedback (3 to 2,000 characters).
- **Completed Reviews (`/reviewer/reviews`)**: History of all evaluated submissions and submitted remarks.

### Administrator Console (`/admin`)
- **Platform Analytics**: High-level platform statistics including total user count, total submissions, pending queue size, and month-over-month trends.
- **User Management (`/admin/users`)**: Searchable and paginated directory of all platform users. Update account roles (`STUDENT`, `REVIEWER`, `ADMIN`) and account status (`ACTIVE`, `INACTIVE`, `BANNED`).
- **Reviewer Directory (`/admin/reviewers`)**: View reviewer accounts, their assigned active loads, and completed evaluation statistics.
- **Submissions Management (`/admin/submissions`)**:
  - Search and filter submissions by status, reviewer assignment, or feedback state.
  - Reviewer assignment dialog: Assign or reassign unassigned pending submissions to qualified reviewers.
- **Global Feedback Management (`/admin/feedbacks`)**: View, inspect, and update student feedback across the entire platform.

---

## Technology Stack

### Backend
- **Runtime & Framework**: [Node.js](https://nodejs.org/) (ES Modules) with [Express 5](https://expressjs.com/)
- **Database & ORM**: [PostgreSQL](https://www.postgresql.org/) managed via [Prisma 8](https://www.prisma.io/) (`@prisma/orm-postgres`) with contract-driven schema definitions
- **Validation**: [Zod 4](https://zod.dev/) for request body, query parameter, and route param validation
- **Authentication**: JWT authentication using `jsonwebtoken` stored in `httpOnly` secure cookies with `Authorization: Bearer` fallback
- **Rate Limiting & DoS Protection**: [express-rate-limit](https://express-rate-limit.github.io/) with tiered limits (global API window, strict authentication attempt throttling, and submission spam defense)
- **Security Middlewares**: Custom input sanitization against Prototype Pollution (`__proto__`, `constructor`, `prototype`), null-byte injection, XSS tag stripping, CORS, and `cookie-parser`
- **Compiler & Tools**: `tsx` for live development execution, `tsdown` and `typescript` for type checking and compilation

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Components, Route Handlers, Server Actions)
- **UI & State**: [React 19](https://react.dev/), [TanStack Form](https://tanstack.com/form)
- **Component Primitives**: [@base-ui/react](https://base-ui.com/), [shadcn/ui](https://ui.shadcn.com/) patterns
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with CSS variables and dark/light mode support via `next-themes`
- **Icons**: [Lucide React](https://lucide.dev/)
- **Quality & Linting**: [Biome](https://biomejs.dev/)

---

## Repository Structure

```
Gradely/
├── backend/
│   ├── docs/
│   │   └── Gradely.postman_collection.json  # Complete Postman API Collection
│   ├── src/
│   │   ├── app/
│   │   │   └── app.ts                      # Express application setup & middleware stack
│   │   ├── config/
│   │   │   └── env.config.ts               # Type-safe environment variable parser
│   │   ├── errors/                         # Standardized AppError, UnauthorizedError, etc.
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts          # JWT authentication & RBAC authorization
│   │   │   ├── globalErrorHandler.ts       # Centralized error handler & status mapper
│   │   │   ├── rateLimiter.middleware.ts   # Tiered express-rate-limiters (API, auth, submissions)
│   │   │   ├── sanitize.middleware.ts      # Prototype pollution & XSS sanitization
│   │   │   └── validateRequest.ts          # Zod schema validation middleware
│   │   ├── modules/
│   │   │   ├── admin/                      # Admin analytics and metrics endpoints
│   │   │   ├── auth/                       # Registration, login, token refresh, logout
│   │   │   ├── feedback/                   # Feedback creation, listing, updates
│   │   │   ├── health/                     # Service health check route
│   │   │   ├── submission/                 # Submissions CRUD, reviews, assignments
│   │   │   └── user/                       # User management, profile, status updates
│   │   ├── prisma/
│   │   │   ├── contract.prisma             # Data schema (User, Submission, Feedback)
│   │   │   ├── db.ts                       # Database client connection & lifecycle
│   │   │   └── seed.ts                     # Database seed script for default accounts
│   │   ├── schemas/                        # Shared Zod validation schemas
│   │   ├── utils/                          # Pagination, cookie, sanitize, bcrypt utilities
│   │   └── index.ts                        # Server entry point & graceful shutdown
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (dashboard)/
│   │   │   │   ├── admin/                  # Admin portal (/admin, /admin/submissions, etc.)
│   │   │   │   ├── me/                     # Student portal (/me, /me/submissions, /me/feedback)
│   │   │   │   └── reviewer/               # Reviewer portal (/reviewer, /reviewer/submissions)
│   │   │   ├── globals.css                 # Tailwind CSS v4 variables & styles
│   │   │   ├── layout.tsx                  # Root layout with theme provider
│   │   │   └── page.tsx                    # Landing / Authentication portal (Login / Register)
│   │   ├── components/
│   │   │   ├── tables/                     # Reusable TableControls and Pagination components
│   │   │   └── ui/                         # Base UI / button / dialog / card primitives
│   │   ├── constants/                      # Route definitions, pagination limits, repo hosts
│   │   ├── features/                       # Modular feature domains (auth, admin, reviewer, etc.)
│   │   ├── lib/                            # Session extraction and cookie helpers
│   │   ├── utils/                          # GitHub preview parser, monthly activity calculator
│   │   ├── validations/                    # Client-side Zod validation rules
│   │   └── proxy.ts                        # Role-based route proxy middleware
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── biome.json
│
├── .gitignore
└── README.md
```

---

## Security & Architecture Highlights

1. **HttpOnly Cookie Authentication**:
   - Access and refresh tokens are dispatched in secure, `httpOnly`, `sameSite: "lax"` cookies, protecting credentials from cross-site scripting (XSS) extraction.
   - The backend also accepts `Authorization: Bearer <token>` headers for API clients and Postman testing.

2. **Defense-in-Depth Sanitization**:
   - Every incoming request passes through an aggressive object sanitization pipeline (`sanitize.middleware.ts`) that strips null bytes, script tags, dangerous HTML elements (`<iframe>`, `<object>`, `<embed>`), inline JavaScript event handlers (`onload`, `onerror`), and disarms prototype pollution attempts targeting `__proto__`, `constructor`, or `prototype`.

3. **Strict Schema Constraints**:
   - Passwords enforce RFC-standard entropy: at least 8 characters, lowercase letter, uppercase letter, number, special character, and zero whitespace.
   - Emails are trimmed, validated according to RFC 5321 length rules, and normalized to lowercase before database persistence.

4. **Multi-Tenant Pagination Engine**:
   - Standardized `offset` and `limit` pagination schema across all listing routes with enforced bounds (`limit` capped at 100).
   - Dynamic search parameter serialization that maintains active filters and resets navigation offset when applying search queries.

5. **Spam & Abuse Rate Limiting**:
   - Integrated `express-rate-limit` with draft-8 headers (`RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`).
   - Global rate limiter (100 req/15 min) for general API endpoints, strict auth rate limiter (15 req/15 min) preventing brute force on login/registration, and creation limiter (30 req/15 min) for submissions.
   - Uptime probes (`/health`, `/`) remain unthrottled.

---

## Prerequisites

Ensure you have the following installed on your machine:

- **Node.js**: `v22.18.0` or higher (compatible with Node 22, 24, and 26)
- **pnpm**: `v10.x` or `v11.x`
- **PostgreSQL**: `v14` or higher (local or managed instance such as Supabase / Neon / AWS RDS)

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/Gradely.git
cd Gradely
```

---

### 2. Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Create your local environment file from the example:
   ```bash
   cp .env.example .env
   ```

3. Update the `.env` file with your database connection URL and secure JWT secrets:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/gradely"
   JWT_ACCESS_SECRET="your-super-secret-jwt-access-key-min-32-chars"
   JWT_REFRESH_SECRET="your-super-secret-jwt-refresh-key-min-32-chars"
   ```

4. Install backend dependencies:
   ```bash
   pnpm install
   ```

5. Initialize and apply database migrations:
   ```bash
   pnpm run db:update
   ```

6. Seed the database with the initial Administrator account:
   ```bash
   pnpm run db:seed
   ```

7. Start the backend development server:
   ```bash
   pnpm run dev
   ```
   The backend API will run at `http://localhost:5000`.

---

### 3. Frontend Setup

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Create your frontend environment configuration:
   ```bash
   cp .env.example .env
   ```

3. Ensure `NEXT_PUBLIC_API_URL` points to your backend instance:
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:5000/api/v1"
   ```

4. Install frontend dependencies:
   ```bash
   pnpm install
   ```

5. Start the Next.js development server:
   ```bash
   pnpm run dev
   ```
   The frontend will be accessible at `http://localhost:3000`.

---

## Environment Variables

### Backend Configuration (`backend/.env`)

| Variable | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | Number | `5000` | Port on which Express server listens |
| `NODE_ENV` | String | `development` | Environment mode (`development` / `production`) |
| `DATABASE_URL` | String | *Required* | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | String | *Required* | Secret used to sign short-lived access tokens |
| `JWT_REFRESH_SECRET` | String | *Required* | Secret used to sign long-lived refresh tokens |
| `JWT_ACCESS_TOKEN_EXPIRY` | String | `15m` | Lifetime of the access token (e.g. `15m`, `1h`) |
| `JWT_REFRESH_TOKEN_EXPIRY`| String | `7d` | Lifetime of the refresh token (e.g. `7d`, `30d`) |
| `CORS_ORIGIN` | String | `http://localhost:3000` | Allowed origin for Cross-Origin Resource Sharing |
| `ADMIN_NAME` | String | `Gradely Admin` | Display name for seeded administrator |
| `ADMIN_EMAIL` | String | `admin@gradely.com` | Email address for seeded administrator |
| `ADMIN_PASSWORD` | String | `Admin@12345` | Password for seeded administrator |
| `RATE_LIMIT_WINDOW_MS` | Number | `900000` | Rate limit window duration in milliseconds (15 min) |
| `RATE_LIMIT_MAX` | Number | `100` | Maximum requests per IP within the window |
| `AUTH_RATE_LIMIT_MAX` | Number | `15` | Maximum auth attempts (login/register) per IP per window |

### Frontend Configuration (`frontend/.env`)

| Variable | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | String | `http://localhost:5000/api/v1` | Public backend endpoint for API requests |

---

## Default Seed Accounts

When running `pnpm run db:seed` in the backend, the following default Administrator account is created:

| Role | Email | Password | Access Path |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@gradely.com` | `Admin@12345` | `/admin` |

> **Note**: To test **Student** and **Reviewer** workflows, register a new account on the landing page (`/`). Newly registered users default to the `STUDENT` role. Log in as `admin@gradely.com`, navigate to `/admin/users`, and you can promote any user to `REVIEWER` or `ADMIN`.

---

## API Reference

A Postman collection with prepared environment configurations and request bodies is provided at [`backend/docs/Gradely.postman_collection.json`](backend/docs/Gradely.postman_collection.json).

### Authentication (`/api/v1/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Public | Register a new user account |
| `POST` | `/api/v1/auth/login` | Public | Authenticate user & receive tokens |
| `POST` | `/api/v1/auth/refresh-token` | Public | Refresh expired access token |
| `POST` | `/api/v1/auth/logout` | Authenticated | Invalidate authentication cookies |

### User Management (`/api/v1/users`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/users/me` | Authenticated | Retrieve current user profile |
| `GET` | `/api/v1/users` | Admin | List users with pagination and search |
| `GET` | `/api/v1/users/:id` | Admin | Retrieve single user record |
| `PATCH`| `/api/v1/users/:id/role` | Admin | Update user role (`STUDENT`, `REVIEWER`, `ADMIN`) |
| `PATCH`| `/api/v1/users/:id/status` | Admin | Update account status (`ACTIVE`, `INACTIVE`, `BANNED`) |

### Submissions (`/api/v1/submissions`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/submissions` | Student | Submit a new project |
| `GET` | `/api/v1/submissions` | Authenticated | List submissions (role-scoped) |
| `GET` | `/api/v1/submissions/my` | Student | List only current user's submissions |
| `GET` | `/api/v1/submissions/:id` | Authenticated | Get submission details |
| `PATCH`| `/api/v1/submissions/:id` | Student/Admin | Update submission details |
| `POST` | `/api/v1/submissions/:id/review` | Reviewer | Review submission (`APPROVED` / `REJECTED`) |
| `PATCH`| `/api/v1/submissions/:id/assign` | Admin | Assign reviewer to submission |

### Feedback (`/api/v1/feedbacks`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/feedbacks` | Authenticated | List feedback entries |
| `GET` | `/api/v1/feedbacks/:id` | Authenticated | Get feedback details by ID |
| `PATCH`| `/api/v1/feedbacks/:id` | Admin/Reviewer | Update existing feedback comment |

### Admin Analytics (`/api/v1/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/admin/summary` | Admin | Aggregate dashboard metrics and counts |

### Health Check (`/health`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Public | Server uptime and health probe |

---

## NPM Scripts Reference

### Backend (`cd backend`)
- `pnpm run dev` — Launch development server with hot-reload (`tsx watch src/index.ts`)
- `pnpm run build` — Build production bundle via `tsdown`
- `pnpm run start` — Run production server from `dist/server.mjs`
- `pnpm run type:check` — Run TypeScript compiler check without emitting files (`tsc --noEmit`)
- `pnpm run db:update` — Apply Prisma schema updates to the PostgreSQL database
- `pnpm run db:seed` — Seed default administrator account into database
- `pnpm run contract:emit` — Regenerate Prisma 8 contract definitions

### Frontend (`cd frontend`)
- `pnpm run dev` — Start Next.js development server on `http://localhost:3000`
- `pnpm run build` — Build production Next.js application
- `pnpm run start` — Run production server
- `pnpm run lint` — Check codebase formatting and lint rules using Biome
- `pnpm run format` — Apply automatic code formatting via Biome
