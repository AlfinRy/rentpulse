import { cronJobs } from "convex/server";

// Intentionally no scheduled jobs: this backend is an unverified draft.
// Enable refresh only after authentication, quotas and end-to-end tests.
const crons = cronJobs();
export default crons;
