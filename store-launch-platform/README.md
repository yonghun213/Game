# Store Launch Ops Platform (MVP)

A collaborative, multi-country platform for managing store openings in Latin America.

## Architecture
- **Framework:** Next.js 15 (App Router)
- **Database:** SQLite (MVP) with Prisma ORM (v5)
- **Language:** TypeScript
- **Styling:** Tailwind CSS

## Features (MVP Status)
- **Data Layer:** Complete schema for Users, Stores, Tasks, Templates, and Costing/Pricing.
- **Seeding:** Automated seed script populates the database with:
  - Users (Admin, PM, Contributor)
  - Sample Stores (MX, CO) with auto-generated launch tasks.
  - Ingredient & Grocery Price Database (LatAm retailers).
  - Recipes & Competitor Benchmarks.
- **Auth:** Simulated "Dev Mode" login (cookie-based).
- **Dashboard:** Portfolio overview of active store launches.

## Setup & Run

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Initialize Database**
   ```bash
   # Run migrations
   npx prisma migrate dev --name init

   # Seed data
   npx tsx prisma/seed.ts
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Operator Runbook (Short)

**Adding a Country:**
1. Add the country code (e.g., "PE") to the `Store` creation logic or UI.
2. Add reference retailers in the Seed script or Admin UI (future).

**Managing Tasks:**
- Tasks are auto-generated from the "Standard Store Opening" Template.
- To modify the standard process, update the `Template` and `TemplatePhase` records in the database (or via seed).

**Pricing:**
- Grocery prices are normalized to `price_per_unit`.
- FX Rates are currently static in the database; update via seed or future Admin UI.
