# AidLink — Crisis Response Coordination Platform

A hackathon MVP for coordinating volunteers during emergencies. Helps local relief organizers triage emergency reports, verify incidents, and safely assign volunteers.

## Features

- **Landing page** — Hero, mission, CTAs, safety disclaimer
- **Public crisis map** — Incidents with verification-colored pins (red/yellow/green)
- **Volunteer flow** — Profile creation, offer help, staged status (interested → assigned → confirmed → checked-in)
- **Organizer dashboard** — Command-center style with:
  - Metrics (active incidents, unverified, critical, volunteers by stage, understaffed)
  - Incident board with filters
  - Map + side panel
  - Volunteer roster
  - Incoming reports (simulated social data)
  - Assignment controls
  - QR / check-in code flow

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui-style components
- React Hook Form + Zod
- Prisma + SQLite
- Leaflet (react-leaflet)
- Zustand

## Setup

```bash
# Install dependencies
npm install

# Configure database (SQLite, file:./dev.db)
# .env already contains: DATABASE_URL="file:./dev.db"

# Generate Prisma client and create database
npx prisma generate
npx prisma db push

# Seed demo data (8–12 incidents, 20+ volunteers)
npm run db:seed

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo Flow

1. **Landing** → View Crisis Map / Volunteer / Organizer Dashboard
2. **Map** → Click an incident pin → View details → "Offer to Help"
3. **Volunteer** → Create profile → Offer help at incidents
4. **Dashboard** → Log in as Organizer (demo) → Review incidents → Assign volunteers → Change status (interested → assigned → confirmed) → Check-in with code

## Project Structure

```
app/
  page.tsx           # Landing
  map/page.tsx       # Public crisis map
  volunteer/page.tsx # Volunteer signup + offer help
  dashboard/page.tsx # Organizer dashboard (protected)
  api/               # API routes
components/
  ui/                # Button, Card, Badge, etc.
  IncidentMap.tsx
  IncidentCard.tsx
  IncidentDrawer.tsx
  VolunteerTable.tsx
  AssignmentPanel.tsx
  MetricsOverview.tsx
  CheckInModal.tsx
  IncomingReports.tsx
  ...
lib/
  prisma.ts
  utils.ts
  auth-store.ts
prisma/
  schema.prisma
  seed.ts
```

## Safety Notice

Assignments should be reviewed by organizers. Do not enter unsafe zones without authorization or training.


## The Team
Built by Jasper He, Leo Wu, Ethan Hoang, Daniel Zou