# KIKI Beauty Salon - Development Context & Handover

This document saves the current state of the project, the architecture context, and the fully referenced implementation details for continuing development in your preferred IDE (e.g. VS Code, Cursor).

## Current Stage

We have scaffolded a full-stack React application with the following tech stack:
- **Frontend:** React 18, Vite, TypeScript
- **Styling:** Tailwind CSS v3, shadcn/ui (customized with "Elixir Salon" luxury theme)
- **State Management:** Zustand (Auth Store) + TanStack React Query
- **Routing:** React Router v6
- **Backend:** Supabase (Auth, PostgreSQL)
- **Integrations:** LINE LIFF SDK, LINE Messaging API (Rich Menu)

### What is Completed:
1. **Core Infrastructure:** Vite config and TS path aliases (`@/*`) are configured. Tailwind is fully configured with a custom luxury Gold/Black/Alabaster theme.
2. **Database:** Full SQL schema migration is available at `supabase/migration.sql` (Profiles, Services, Bookings, RLS, Triggers, Seed data).
3. **Authentication:** LINE to Supabase auth flow is implemented in `src/features/auth/auth-service.ts` using LIFF.
4. **UI Components:** Shadcn UI components installed (`button`, `card`, `input`, `form`, `toast`, etc.).
5. **Layouts & Pages:** 
   - New `LandingPage` (`src/pages/customer/landing.tsx`) using the provided HTML template.
   - `CustomerLayout` and `AdminLayout` with responsive navigation.
   - `Home` page placeholder.
6. **Scripts:** Vercel deployment guide and a Node script to create the LINE Rich Menu.

---

## Known Issues (Current Blockers)

You may see Vite import resolution errors when running `npm run dev` such as:
- `Failed to resolve import "../ui/toaster" from "src/components/layout/admin-layout.tsx"`
- `Failed to resolve import "../lib/liff" from "src/features/auth/auth-service.ts"`

**How to Fix:**
The project uses TypeScript path aliases configured in `tsconfig.json` and `vite.config.ts`. Some of the relative imports in the layouts were written before the alias was fully active or might have incorrect relative depth. 
To fix these, replace relative imports (`../../`) with absolute aliases (`@/`). 
For example, in `src/components/layout/admin-layout.tsx` and `customer-layout.tsx`:
```tsx
// Change this:
import { Toaster } from "../ui/toaster";
import { Button } from "../ui/button";
import { useAuthStore } from "../../stores/auth-store";

// To this:
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
```

---

## Reference Implementation Details

### 1. Database Schema (Supabase)
See `supabase/migration.sql` for the full schema.
- **profiles:** `id` (uuid), `line_user_id` (text), `role` ('customer' | 'admin')
- **services:** `id` (uuid), `name` (text), `price` (decimal), `is_active` (boolean)
- **bookings:** `id` (uuid), `customer_id` (uuid), `service_id` (uuid), `booking_date` (date), `status` ('pending'|'confirmed'|'completed'|'cancelled')

### 2. Authentication Flow (`src/features/auth/auth-service.ts`)
The app uses an auto-registration flow to bridge LINE and Supabase:
1. App calls `initializeLiff()` and `getLiffProfile()`.
2. Extracts `userId` from LINE.
3. Generates a synthetic email: `line_{userId}@kiki.line.local` and a secure password.
4. Attempts `supabase.auth.signInWithPassword()`. If it fails (user doesn't exist), it automatically calls `supabase.auth.signUp()` and inserts a new record into the `profiles` table.

### 3. Application Routing (`src/App.tsx`)
- `/` -> `LandingPage` (The new luxury design)
- `/auth/callback` -> Loading screen during LIFF auth
- `/home` -> `CustomerLayout` (Protected/Customer Area)
  - `/home` (Home Dashboard)
  - `/home/services`
  - `/home/bookings`
- `/admin` -> `AdminLayout` (Protected/Admin Area)
  - `/admin` (Dashboard)
  - `/admin/bookings`
  - `/admin/services`
  - `/admin/customers`

### 4. Styling (`tailwind.config.js` & `src/index.css`)
We use standard Tailwind classes. The brand colors are mapped to variables:
- `bg-background` (Alabaster/Warm white)
- `text-primary` (Brown/Gold tint)
- `bg-surface` 
Buttons use standard Shadcn variants (e.g., `<Button variant="default">`) which automatically inherit the luxury theme from `index.css`.

---

## Next Steps for Development
1. Fix the import path alias issues mentioned above.
2. Setup your LINE Developers console and put the credentials in `.env` (Follow `scripts/setup-line.md`).
3. Setup your Supabase project and run the SQL migration.
4. Connect the "New Customer" / "Sign In" buttons on the `LandingPage` to trigger the actual Auth flow.
5. Continue building the inner pages (`/home/services`, `/home/bookings`).
