// Pure domain logic for Insurance FNOL intake & extraction.
//
// Keep this side-effect free: no I/O, no Prisma calls, no fetch. It is where
// the logic worth unit-testing lives, which is why the vitest suite can run
// against a local Postgres in under a second rather than a network round trip.
export {};
