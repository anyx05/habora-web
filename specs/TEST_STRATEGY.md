# Habora — Test Strategy

> **Audience:** QA Engineers, developers writing tests, and AI agents extending test coverage.  
> Read `specs/ARCHITECTURE.md` first for system context.

---

## 1. Business Model & Test Scope

Habora has two user journeys:

**Public User (boat owner):**  
Landing page → Map discovery → Chatbot interaction → Berth booking

**Port Manager:**  
Login → Dashboard → Manage berths → View/manage bookings → Configure AI settings

Tests must cover both journeys. The chatbot journey (E2E via browser + real Edge Function) is the most business-critical.

---

## 2. Toolchain

| Type | Tool | Rationale |
|---|---|---|
| E2E / Browser | **Playwright** | Real browser, auto-waiting, parallel execution, POM support |
| Unit / Integration | **Vitest** | Native ESM, sub-second execution, compatible with Turbopack |
| Component | **Vitest + React Testing Library** | Tests from user perspective, not implementation details |

**Config files:**
- `playwright.config.ts` — E2E config (base URL, browser matrix, timeouts)
- `vitest.config.mts` — Unit/component test config

---

## 3. Directory Structure

```
tests/
├── e2e/               # Playwright specs (.spec.ts)
│   ├── auth.spec.ts   # Login, logout, unauthorized redirect
│   ├── berths.spec.ts # Berth CRUD flows
│   └── dashboard.spec.ts  # Dashboard overview validation
├── unit/              # Vitest unit tests (.test.ts)
│   └── validations.test.ts
├── helpers/           # Playwright Page Object Models (POMs)
├── logs/              # JSON run logs (gitignored)
└── setup.ts           # Vitest global setup
```

---

## 4. Test Credentials

| Account | Email | Password | Role |
|---|---|---|---|
| Test Port Manager | `test@sadama.com` | `testing` | Port owner (owns "Sadama Testing Port") |

> Set these in `.env.test`. See the file for the exact variable names.  
> Test data is seeded via `supabase/seed_test_data.sql`.

---

## 5. Coverage Targets

| Layer | Target |
|---|---|
| Unit (validations, utils) | 90%+ |
| Component (UI components) | 80%+ |
| E2E (critical paths) | 100% of P0 paths |

### P0 Critical Paths
1. Login with valid credentials → dashboard redirect
2. Login with invalid credentials → inline error, no redirect
3. Unauthenticated access to `/dashboard` → redirect to `/login`
4. View berths list (authenticated)
5. Edit a berth inline (name, price, status)
6. View bookings list (authenticated)
7. Public landing page loads with map and chatbot visible

---

## 6. Running Tests

### Unit Tests
```bash
npm run test:unit
# Or interactively:
npx vitest --ui
```

### E2E Tests
```bash
# Terminal 1 — start the dev server
npm run dev

# Terminal 2 — run Playwright
npm run test:e2e

# View HTML report
npm run test:report
```

### CI (Future)
GitHub Actions will run both suites on every PR, blocking merges on test failure.

---

## 7. Page Object Model (POM) Pattern

All Playwright E2E tests use the POM pattern. Selectors and interactions are defined in `tests/helpers/*.ts` and reused across specs.

**Example:**
```typescript
// tests/helpers/berths-page.ts
export class BerthsPage {
  readonly addNewBerthButton: Locator
  constructor(page: Page) {
    this.addNewBerthButton = page.getByRole('button', { name: /add new/i })
  }
}

// tests/e2e/berths.spec.ts
test('should add a berth', async ({ page }) => {
  const berthsPage = new BerthsPage(page)
  await berthsPage.addNewBerthButton.click()
  // ...
})
```

---

## 8. Mocking Strategy

- **Unit tests:** No mocking. Test pure functions directly.
- **Component tests:** Mock TanStack Query hooks (`vi.mock('@/lib/queries/...')`) to return fixture data.
- **E2E tests:** No mocking. Use real Supabase test project with seeded data.

---

## 9. Extending Tests

- **New E2E spec:** Add `.spec.ts` to `tests/e2e/`. Tag with `test.describe('@smoke')` or `@regression`.
- **New unit test:** Add `.test.ts` to `tests/unit/`.
- **New POM:** Add helper class to `tests/helpers/` extending any common base page if needed.
- Always run the full suite locally before committing.
