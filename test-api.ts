import { haboraApi } from './lib/api/habora-client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  process.env.TEST_TOKEN = "eyJhbGciOiJFUzI1NiIsImtpZCI6IjhhMDgwODRkLTU2YmMtNDAyYS04MjIzLWRlYTYzNDVhNzdkZSIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2dsY21tcmJndWJvbHJ0c3Rpc3hsLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJmOWUxYzM2MC1kNGZjLTQ5ZWQtYmM1OC0yMzkxYjY4MDkzMTEiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzc4OTg1ODI4LCJpYXQiOjE3Nzg5ODIyMjgsImVtYWlsIjoidGVzdF9vcGVyYXRvckBleGFtcGxlLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiZW1haWxfdmVyaWZpZWQiOnRydWV9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6InBhc3N3b3JkIiwidGltZXN0YW1wIjoxNzc4OTgyMjI4fV0sInNlc3Npb25faWQiOiIxNGEzMjFlZS0yOTBiLTRkZTYtYjczMS1lNGRiMzhmMzQ0ZGQiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.gj9cyey3X3CU5ADRXJXdPKKPw3OFz5mAyp7ueleC3MIa4P3Iuwj-OM-flptB6YGQgLKgt7KeTG-rVuCfCMNqLQ";
  
  try {
    const data = await haboraApi.getCurrentItinerary();
    console.log("TEST_SUCCESS:", data);
  } catch (error) {
    console.log("TEST_ERROR:", error);
  }
}

main();
