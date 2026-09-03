# GateSure

GateSure is a Firebase-backed residential society security and access management application built with Next.js. It provides tenant-isolated society data, face-assisted guard verification, resident and vendor directories, and a photo-backed digital logbook.

## Getting Started

Install dependencies:

```bash
npm ci
```

Create a local environment file based on the template and fill in your own values:

```bash
Copy `.env.local.example` to `.env.local` and replace the Firebase placeholders with your project values. Do not commit `.env.local`.
```

Then start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application. Camera and face recognition require `localhost` or HTTPS and browser camera permission.

## Main workflows

- Society login and tenant-aware dashboard navigation
- Resident registration with face photo and household role: owner, tenant, family member, or helper
- Resident Directory grouped by flat, with photos and household members
- Vendor registration with work categories such as driver, electrician, painter, plumber, and carpenter
- Vendor Directory with work-category filters and photos
- Guard Dashboard with face/manual lookup and resident `Exit -> Entry` movement tracking
- Visitor/vendor `Entry -> Exit` tracking
- Digital Log Book with entry photos, search, date filters, and CSV export
- Analytics scoped to the active society

## Tenant-scoped API routes

API requests use `?society_id=<id>` or the `x-society-id` header. Available routes include:

- `/api/persons`
- `/api/register`
- `/api/entries`
- `/api/analytics`
- `/api/audit-logs`
- `/api/societies`
- `/api/auth/register`
- `/api/auth/login`
- `/api/auth/logout`

## Security and secrets

Never commit or push any of the following to GitHub:

- `.env` files or `.env.local`
- passwords or admin credentials
- API keys and tokens
- Firebase or database connection credentials
- private certificates and keys
- local build folders such as `node_modules`, `.next`, or generated caches

Use local-only environment files and keep all real credentials on your machine or in a secure secret manager.

A sample environment file is provided in `.env.local.example` for non-secret placeholders only.

## Common commands

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Project structure

- `app/` — application routes and views
- `components/` — reusable UI and device logic
- `lib/` — app logic, session handling, and integrations
- `public/` — static assets and face recognition model files
- `firestore.rules` — tenant and role-based Firestore rules

## Deployment notes

When deploying, configure environment variables in the hosting platform instead of committing them into the repository.

For production, deploy `firestore.rules` and configure Firebase Authentication, Firestore, and the required Firebase web configuration. The current demo admin screen uses local session storage and should be replaced with a production identity provider before public deployment.
