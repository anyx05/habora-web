# Habora Test Suite

This directory contains the automated test suite. Tests are split into fast unit tests (Vitest) and full browser E2E tests (Playwright).

For the full testing strategy, coverage targets, and contribution guidelines, see **`specs/TEST_STRATEGY.md`**.

---

## Directory Structure

```
tests/
├── e2e/           # Playwright E2E specs (real browser, real DB)
├── unit/          # Vitest unit tests (pure functions, no browser)
├── helpers/       # Playwright Page Object Models (POMs) & shared helpers
├── logs/          # JSON run logs — gitignored
└── setup.ts       # Vitest global setup
```

---

## Test Credentials

| Account | Email | Password |
|---|---|---|
| Test Port Manager | `test@sadama.com` | `testing` |

Ensure the test port and berths exist by running `supabase/seed_test_data.sql` in your Supabase SQL Editor before running E2E tests.

---

## Running Tests

### Unit Tests (Vitest)
```bash
npm run test:unit
```
Interactive UI:
```bash
npx vitest --ui
```

### E2E Tests (Playwright)
```bash
# Start the dev server first
npm run dev

# Run E2E tests
npm run test:e2e

# View HTML report
npm run test:report
```

---

## Adding New Tests

- **E2E:** Add `.spec.ts` to `tests/e2e/`. Use POMs from `tests/helpers/`.
- **Unit:** Add `.test.ts` to `tests/unit/`. Test pure functions directly, no mocks needed.
- **Component:** Add `.test.tsx` to a future `tests/components/` directory. Mock TanStack Query hooks with `vi.mock()`.

Tag Playwright tests with `@smoke` or `@regression` inside `test.describe()` blocks.
