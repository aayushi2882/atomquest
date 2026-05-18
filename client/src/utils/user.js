/**
 * Lightweight user identity helpers — no backend, localStorage only.
 */

const USER_KEY = "atomquest_user";

/**
 * Persist user info on login.
 * @param {{ email: string, role: string, name?: string }} user
 */
export function saveUser({ email, role, name }) {
    localStorage.setItem(USER_KEY, JSON.stringify({ email, role, name: name || "" }));
}

/**
 * Read persisted user. Returns null if not found.
 * @returns {{ email: string, role: string, name: string } | null}
 */
export function getUser() {
    try {
        return JSON.parse(localStorage.getItem(USER_KEY)) || null;
    } catch {
        return null;
    }
}

/** Clear user on logout. */
export function clearUser() {
    localStorage.removeItem(USER_KEY);
}

const ROLE_INTENT_KEY = "atomquest_role_intent";

/**
 * Store the role the user clicked from the landing page,
 * so the login page can pre-select it.
 * @param {string} role
 */
export function saveRoleIntent(role) {
    localStorage.setItem(ROLE_INTENT_KEY, role);
}

/**
 * Read and clear the pending role intent.
 * @returns {string | null}
 */
export function consumeRoleIntent() {
    const val = localStorage.getItem(ROLE_INTENT_KEY);
    localStorage.removeItem(ROLE_INTENT_KEY);
    return val || null;
}

/**
 * Return the redirect path for a given role string.
 * @param {string} role
 * @returns {string}
 */
export function roleRedirectPath(role) {
    if (role === "Manager") return "/manager";
    if (role === "Admin")   return "/admin";
    return "/employee";
}

/**
 * Derive a display name from an email address.
 * Strategy:
 *  1. Strip trailing digits from local part (aayushimishra237 → aayushimishra)
 *  2. Split on dots / underscores / hyphens
 *  3. Title-case every segment
 *
 * Examples:
 *  "john.doe@company.com"       → "John Doe"
 *  "alice@corp.io"              → "Alice"
 *  "aayushimishra237@gmail.com" → "Aayushimishra"   (best effort — no separator present)
 *  "aayushi.mishra@co.in"       → "Aayushi Mishra"
 *
 * @param {string} email
 * @returns {string}
 */
export function displayNameFromEmail(email = "") {
    if (!email) return "User";

    // 1. Take local part (before @)
    const local = email.split("@")[0] || "";

    // 2. Strip all trailing digit sequences
    const clean = local.replace(/\d+$/, "");

    // 3. Split on common separators
    const parts = clean
        .split(/[._\-+]+/)
        .map((p) => p.replace(/\d+/g, "").trim())  // also strip inner digits
        .filter(Boolean);

    if (!parts.length) return "User";

    // 4. Title-case every part
    return parts
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
        .join(" ");
}

/**
 * Return initials (up to 2 chars) from a display name.
 * "John Doe" → "JD"  |  "Alice" → "AL"
 *
 * @param {string} name
 * @returns {string}
 */
export function initialsFromName(name = "") {
    const words = name.trim().split(" ").filter(Boolean);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    if (words.length === 1 && words[0].length >= 2)
        return words[0].slice(0, 2).toUpperCase();
    return "U";
}
