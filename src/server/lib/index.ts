// src/server/lib/index.ts
"use server"; // Indicate server-side module

// Export server-side library modules for use in other server components/actions
export * from './agent-simulation';
export * from './db';
export * from './firebase'; // Exports the initialized 'app' and 'db'

// Add exports for any new server-side library modules created here.
// Example: export * from './rate-limiter';