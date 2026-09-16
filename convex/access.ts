/**
 * Fail closed during frontend development. Do not remove this gate until
 * authenticated ownership, rate limits, recipient verification and provider
 * integration tests are in place. The local sample app never calls this backend.
 */
export function requireLiveBackend(): never {
  throw new Error("Live backend is not enabled. Use the local sample workspace.");
}
