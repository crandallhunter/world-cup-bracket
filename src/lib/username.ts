// ─── Username validation ─────────────────────────────────────────────────────
// Shared between the submit API (server-side gating) and the bracket-submit
// UI (live feedback). Keeping the rules in one place so client and server
// can never disagree about what's acceptable.
//
// Rules:
//   - 3-20 characters
//   - ASCII alphanumerics + dash + underscore (no spaces, no unicode)
//   - Cannot start or end with a separator
//   - No reserved words (admin, root, system, …) — small static block list
//   - Case-insensitive uniqueness is enforced by the DB; this validator
//     only handles formatting.

const MIN_LEN = 3;
const MAX_LEN = 20;
const PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9_-]{1,18}[A-Za-z0-9])?$/;

const RESERVED = new Set<string>([
  'admin',
  'administrator',
  'root',
  'system',
  'meebits',
  'meebitsfutbol',
  'meebits-futbol',
  'support',
  'moderator',
  'mod',
  'official',
  'team',
  'fifa',
  'null',
  'undefined',
]);

export type UsernameValidation =
  | { ok: true; value: string }
  | { ok: false; reason: string };

/**
 * Normalize and validate a username. Returns the trimmed value when valid,
 * otherwise a short error string suitable for surfacing to the user.
 */
export function validateUsername(raw: unknown): UsernameValidation {
  if (typeof raw !== 'string') {
    return { ok: false, reason: 'Username must be a string.' };
  }
  const value = raw.trim();
  if (value.length < MIN_LEN) {
    return { ok: false, reason: `Username must be at least ${MIN_LEN} characters.` };
  }
  if (value.length > MAX_LEN) {
    return { ok: false, reason: `Username must be at most ${MAX_LEN} characters.` };
  }
  if (!PATTERN.test(value)) {
    return {
      ok: false,
      reason:
        'Username must use letters, digits, underscore, or dash, and cannot start or end with a separator.',
    };
  }
  if (RESERVED.has(value.toLowerCase())) {
    return { ok: false, reason: 'That username is reserved. Pick another.' };
  }
  return { ok: true, value };
}

export const USERNAME_RULES = {
  minLength: MIN_LEN,
  maxLength: MAX_LEN,
  /** Stable description for UI hint copy. */
  description:
    `${MIN_LEN}-${MAX_LEN} characters, letters/digits/dash/underscore, must start and end with a letter or digit.`,
} as const;
