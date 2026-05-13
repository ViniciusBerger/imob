# IMOB — Property Management System

<p align="center">
  <strong>A full-stack property management platform for real estate operations, financial control, tenant records, maintenance workflows, and public property listings.</strong>
</p>

<p align="center">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-98.9%25-blue" />
  <img alt="NestJS" src="https://img.shields.io/badge/Backend-NestJS-red" />
  <img alt="React" src="https://img.shields.io/badge/Frontend-React-61DAFB" />
  <img alt="PostgreSQL" src="https://img.shields.io/badge/Database-PostgreSQL-336791" />
  <img alt="Prisma" src="https://img.shields.io/badge/ORM-Prisma-2D3748" />
  <img alt="Docker" src="https://img.shields.io/badge/Deploy-Docker-2496ED" />
</p>

---

## Overview

**IMOB** is a complete property management system designed to support real estate operations from end to end. It brings together property records, tenant and guarantor management, lease contracts, invoices, expenses, maintenance tasks, financial reporting, public listings, and administrative configuration into one organized platform.

The project was built as a production-oriented full-stack application using a modular backend, a typed frontend, relational data modeling, authentication, role-based access foundations, DTO validation, and Docker-based deployment support.

---

## What IMOB Solves

Real estate operations usually involve scattered spreadsheets, manual contract tracking, informal payment records, disconnected tenant information, and limited visibility into property performance.

IMOB centralizes those workflows into one system:

* Properties can be registered, edited, searched, and listed publicly.
* Tenants and guarantors are connected to contracts and lease records.
* Rent, installments, and expenses are tracked through a unified invoice model.
* Maintenance tasks can be scheduled, monitored, and completed.
* Financial reports help summarize operational performance.
* Admin users can configure branding, public listings, and system behavior.

---

## Key Features

### Property Management

* Register residential, commercial, and land properties.
* Store property code, registry information, location, dimensions, photos, and descriptions.
* Track sale and rental availability.
* Manage property financial data such as purchase price, financing details, installment values, and correction indexes.
* Upload and serve property documents and images.

### Tenant & Guarantor Records

* Store tenant profiles with document, contact, profession, and relationship data.
* Manage guarantor records and connect them to tenants and leases.
* Support tenant-linked user accounts for portal access.

### Lease & Contract Control

* Create lease or sale contracts.
* Track contract start and end dates.
* Store rent values, due days, adjustment indexes, renewal behavior, notes, and active status.
* Connect contracts to properties, tenants, guarantors, and invoices.

### Finance & Invoices

* Centralized invoice model for rent, property expenses, and financing installments.
* Track due dates, payment status, approval status, paid amounts, and payment notes.
* Support pending, paid, overdue, cancelled, approved, and rejected financial states.
* Generate operational financial visibility through finance and report pages.

### Maintenance Workflow

* Create scheduled maintenance tasks.
* Track status as pending, in progress, completed, or cancelled.
* Store cost, description, recurrence, and property relationship.

### Economic Index Integration

* Store economic index values such as IPCA, IGP-M, SELIC, or other correction references.
* Connect financial and lease workflows to adjustment logic.

### Authentication & Access Control

* JWT-based authentication.
* Password hashing with bcrypt.
* User roles for admin, viewer, and tenant access patterns.
* Protected routes on the frontend.
* Backend route protection foundations through NestJS authentication modules and guards.

### Public Property Website

* Public-facing homepage.
* Public property details page.
* Configurable site settings such as app name, hero content, contact information, colors, logo, favicon, layout style, and listing visibility rules.

### Audit & Operational Tracking

* Audit log model for tracking entity actions.
* Soft-delete support across important business entities.
* Structured backend modules for maintainability and future expansion.

---

## Architecture

IMOB follows a full-stack monorepo structure with a clear separation between frontend, backend, infrastructure, and environment configuration.

```txt
imob/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       ├── audit/
│       ├── auth/
│       ├── common/
│       ├── economic-indices/
│       ├── expenses/
│       ├── guarantors/
│       ├── invoices/
│       ├── leases/
│       ├── mail/
│       ├── maintenance/
│       ├── properties/
│       ├── site-config/
│       ├── stats/
│       ├── tenants/
│       ├── users/
│       ├── app.module.ts
│       ├── main.ts
│       └── prisma.service.ts
│
├── frontend/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── contexts/
│       ├── layouts/
│       ├── pages/
│       ├── App.tsx
│       ├── main.tsx
│       └── router.tsx
│
├── Dockerfile
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
└── README.md
```

### Backend Design

The backend is built with **NestJS** and organized by business domain. Each major feature area has its own module, controller, service, DTOs, repository layer where applicable, and tests where implemented.

Core backend design choices:

* Modular domain-based structure.
* Prisma ORM for database access.
* PostgreSQL relational data model.
* DTO validation using `class-validator` and global validation pipes.
* JWT authentication with Passport.
* bcrypt password hashing.
* Upload directory support for property media/documents.
* Global API prefix under `/api`.
* CORS configuration through environment variables.

### Frontend Design

The frontend is built with **React**, **Vite**, **TypeScript**, and **Tailwind CSS**. Routing is handled with React Router and split between public pages, authenticated admin routes, and tenant portal routes.

Core frontend design choices:

* React + TypeScript component architecture.
* Vite build pipeline.
* Tailwind CSS styling.
* ProtectedRoute wrapper for authenticated pages.
* Context-based authentication state.
* Public layout for property browsing.
* Admin layout for dashboard, finance, reports, users, properties, contracts, and settings.

---

## Tech Stack

| Layer      | Technology                                          |
| ---------- | --------------------------------------------------- |
| Language   | TypeScript                                          |
| Frontend   | React, Vite, React Router                           |
| Styling    | Tailwind CSS, lucide-react                          |
| Forms      | React Hook Form                                     |
| Backend    | NestJS, Node.js                                     |
| Auth       | Passport JWT, bcrypt                                |
| Validation | class-validator, class-transformer                  |
| Database   | PostgreSQL                                          |
| ORM        | Prisma                                              |
| Testing    | Jest, Vitest, React Testing Library                 |
| Deployment | Docker, Docker Compose, Nginx, Traefik-ready config |

---

## Data Model Highlights

IMOB uses a relational model centered around property operations.

Main entities include:

* **User** — authentication, role, tenant profile link, audit log ownership.
* **Property** — property details, address, dimensions, status, pricing, financing, media, and documents.
* **Tenant** — renter profile with contact and document information.
* **Guarantor** — guarantor records linked to tenants and leases.
* **LeaseContract** — rent or sale contract connected to property, tenant, guarantor, and invoices.
* **Invoice** — financial record for rent, installments, and expenses.
* **Expense** — one-off or recurring property-related expenses.
* **PropertyExpense** — recurring expense template for predictable property costs.
* **Maintenance** — scheduled property maintenance workflow.
* **EconomicIndex** — monthly economic index values for rent or contract adjustment logic.
* **SiteConfig** — public website branding, SEO, contact, layout, and listing configuration.
* **AuditLog** — operational event tracking.

---

## Getting Started

### Prerequisites

Make sure you have the following installed:

* Node.js 18+
* npm
* PostgreSQL
* Docker and Docker Compose, optional for containerized deployment

---

## Environment Variables

Create a `.env` file in the project root using `.env.example` as a reference.

```env
DATABASE_URL="postgresql://user:password@localhost:5432/pms_db?schema=public"

REDIS_HOST="localhost"
REDIS_PORT=6379

JWT_SECRET="replace-with-a-secure-secret"
JWT_EXPIRATION="1d"

PORT=3000
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
```

> Never commit real secrets, production database credentials, or private JWT keys.

---

## Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/ViniciusBerger/imob.git
cd imob
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Prepare the database

```bash
npx prisma generate
npx prisma db push
```

Use `db push` for a fast local setup. For a production-grade migration workflow, use Prisma migrations instead.

```bash
npx prisma migrate dev
```

### 4. Start the backend

```bash
npm run start:dev
```

The backend runs by default on:

```txt
http://localhost:3000/api
```

### 5. Install frontend dependencies

Open another terminal:

```bash
cd frontend
npm install
```

### 6. Start the frontend

```bash
npm run dev
```

The frontend runs by default on:

```txt
http://localhost:5173
```

---

## Docker Deployment

The repository includes Docker and Docker Compose configuration for production-oriented deployment.

```bash
docker compose up --build -d
```

Before deploying, update:

* `.env` values
* Database connection string
* JWT secret
* Frontend origin
* Traefik host rules
* Domain names
* Upload volume strategy

The included compose configuration is prepared for a reverse-proxy environment and should be adjusted to match your server/domain setup.

---

## Available Scripts

### Backend

| Command              | Description                  |
| -------------------- | ---------------------------- |
| `npm run start`      | Start NestJS app             |
| `npm run start:dev`  | Start backend in watch mode  |
| `npm run build`      | Build backend for production |
| `npm run start:prod` | Run compiled backend         |
| `npm run test`       | Run Jest tests               |
| `npm run test:watch` | Run Jest in watch mode       |
| `npm run lint`       | Run ESLint with auto-fix     |
| `npm run format`     | Format backend source files  |

### Frontend

| Command              | Description                   |
| -------------------- | ----------------------------- |
| `npm run dev`        | Start Vite development server |
| `npm run build`      | Build frontend for production |
| `npm run preview`    | Preview production build      |
| `npm run test`       | Run Vitest tests              |
| `npm run test:watch` | Run Vitest in watch mode      |

---

## Main Application Routes

### Public Routes

| Route           | Purpose                      |
| --------------- | ---------------------------- |
| `/`             | Public property homepage     |
| `/property/:id` | Public property details page |
| `/login`        | Login page                   |

### Protected Routes

| Route                   | Purpose                   |
| ----------------------- | ------------------------- |
| `/admin`                | Admin dashboard           |
| `/admin/properties`     | Property management       |
| `/admin/properties/new` | Create property           |
| `/admin/people`         | Tenants and guarantors    |
| `/admin/users`          | User management           |
| `/admin/profile`        | User profile              |
| `/admin/finance`        | Financial control         |
| `/admin/reports`        | Financial reports         |
| `/admin/settings/site`  | Public site configuration |
| `/admin/contracts`      | Contract management       |
| `/portal`               | Tenant portal             |

---

## API Structure

The backend exposes its API under the global `/api` prefix.

Main backend modules:

| Module             | Responsibility                                          |
| ------------------ | ------------------------------------------------------- |
| `auth`             | Login, JWT authentication, password reset support       |
| `users`            | User management and roles                               |
| `properties`       | Property CRUD, media, public listings, notes, documents |
| `tenants`          | Tenant records                                          |
| `guarantors`       | Guarantor records                                       |
| `leases`           | Lease and contract workflows                            |
| `invoices`         | Financial invoice records                               |
| `expenses`         | Property expenses                                       |
| `maintenance`      | Maintenance task management                             |
| `stats`            | Dashboard/statistical summaries                         |
| `audit`            | Audit trail support                                     |
| `site-config`      | Public website configuration                            |
| `economic-indices` | Economic index records                                  |
| `mail`             | Email-related services                                  |

---

## Testing

The project includes testing setup for both backend and frontend.

### Backend

```bash
cd backend
npm run test
```

Backend testing uses:

* Jest
* ts-jest
* NestJS testing utilities
* Supertest support

### Frontend

```bash
cd frontend
npm run test
```

Frontend testing uses:

* Vitest
* React Testing Library
* jest-dom
* jsdom
* user-event

---

## Security & Quality Notes

IMOB includes several production-minded foundations:

* JWT authentication.
* bcrypt password hashing.
* DTO-based request validation.
* Global validation pipe with whitelisting and non-whitelisted property rejection.
* Role enum for admin, viewer, and tenant access models.
* Protected frontend routes.
* Environment-based CORS configuration.
* Soft-delete fields on important domain models.
* Audit log model for tracking critical actions.

Recommended production hardening before public deployment:

* Use a strong `JWT_SECRET`.
* Enforce HTTPS at the proxy level.
* Configure secure CORS origins.
* Add rate limiting for authentication routes.
* Add database backups.
* Store uploads using a durable object storage provider for production scale.
* Review route-level authorization policies before exposing admin workflows.

---

## Roadmap Ideas

Future improvements that would strengthen the platform:

* Fine-grained role and permission policies.
* Automated invoice generation from recurring expenses and lease contracts.
* Tenant document upload portal.
* Payment integration.
* Email notifications for due invoices and maintenance updates.
* Advanced dashboard analytics.
* Calendar-based maintenance planning.
* Full migration history for production deployments.
* End-to-end test coverage.
* CI/CD pipeline with build, test, and deployment checks.

---

## Project Purpose

IMOB demonstrates how a real estate business workflow can be modeled as a maintainable full-stack system instead of a collection of disconnected tools.

The project emphasizes:

* Business-domain modeling.
* Modular backend architecture.
* Clear separation between frontend and backend responsibilities.
* Typed development with TypeScript.
* Relational database design.
* Practical deployment readiness.
* Maintainable foundations for future product growth.

---

## Author

Built by **Vinicius Berger**.

* GitHub: [ViniciusBerger](https://github.com/ViniciusBerger)

---

## License

This project does not currently specify an open-source license. All rights remain with the project owner unless a license is added.
