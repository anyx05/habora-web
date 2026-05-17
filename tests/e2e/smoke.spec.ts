import { test, expect } from '@playwright/test';

test('Smoke test itinerary hook logged-in behavior', async ({ page }) => {
  // Disable react query retries by intercepting or we just wait
  page.on('console', msg => {
    console.log(`BROWSER LOG: ${msg.text()}`);
  });

  await page.goto('http://localhost:3000/en/login');
  
  const tokenData = {"access_token":"eyJhbGciOiJFUzI1NiIsImtpZCI6IjhhMDgwODRkLTU2YmMtNDAyYS04MjIzLWRlYTYzNDVhNzdkZSIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2dsY21tcmJndWJvbHJ0c3Rpc3hsLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJmOWUxYzM2MC1kNGZjLTQ5ZWQtYmM1OC0yMzkxYjY4MDkzMTEiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzc4OTg1ODI4LCJpYXQiOjE3Nzg5ODIyMjgsImVtYWlsIjoidGVzdF9vcGVyYXRvckBleGFtcGxlLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiZW1haWxfdmVyaWZpZWQiOnRydWV9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6InBhc3N3b3JkIiwidGltZXN0YW1wIjoxNzc4OTgyMjI4fV0sInNlc3Npb25faWQiOiIxNGEzMjFlZS0yOTBiLTRkZTYtYjczMS1lNGRiMzhmMzQ0ZGQiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.gj9cyey3X3CU5ADRXJXdPKKPw3OFz5mAyp7ueleC3MIa4P3Iuwj-OM-flptB6YGQgLKgt7KeTG-rVuCfCMNqLQ","token_type":"bearer","expires_in":3600,"expires_at":1778985828,"refresh_token":"msdr2bqyi5i5","user":{"id":"f9e1c360-d4fc-49ed-bc58-2391b6809311","aud":"authenticated","role":"authenticated","email":"test_operator@example.com","email_confirmed_at":"2026-05-16T22:06:35.012178Z","phone":"","confirmed_at":"2026-05-16T22:06:35.012178Z","last_sign_in_at":"2026-05-17T01:43:48.646294731Z","app_metadata":{"provider":"email","providers":["email"]},"user_metadata":{"email_verified":true},"identities":[{"identity_id":"400dc965-af04-485a-8936-576e9155ab20","id":"f9e1c360-d4fc-49ed-bc58-2391b6809311","user_id":"f9e1c360-d4fc-49ed-bc58-2391b6809311","identity_data":{"email":"test_operator@example.com","email_verified":false,"phone_verified":false,"sub":"f9e1c360-d4fc-49ed-bc58-2391b6809311"},"provider":"email","last_sign_in_at":"2026-05-16T22:06:35.008332Z","created_at":"2026-05-16T22:06:35.008415Z","updated_at":"2026-05-16T22:06:35.008415Z","email":"test_operator@example.com"}],"created_at":"2026-05-16T22:06:34.990028Z","updated_at":"2026-05-17T01:43:48.699429Z","is_anonymous":false},"weak_password":null};
  
  await page.evaluate((data) => {
    localStorage.setItem('sb-glcmmrbgubolrtstisxl-auth-token', JSON.stringify(data));
  }, tokenData);

  // Navigate to dashboard
  await page.goto('http://localhost:3000/en/dashboard');

  // Wait until we see SMOKE_TEST_ITINERARY_FINAL_DATA in console
  await page.waitForFunction(() => {
    return (window as any).__TEST_DONE === true; // Or we just wait for some time
  }, { timeout: 30000 }).catch(() => {});
  
  // Actually just wait 10 seconds to let the query run and fail/succeed
  await page.waitForTimeout(10000);
});
