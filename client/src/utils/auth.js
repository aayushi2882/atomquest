/**
 * auth.js — Role-based user registry (localStorage only, no backend).
 *
 * Users are stored in:
 *   atomquest_users_registry → [ { id, name, email, password, role, createdAt }, ... ]
 *   atomquest_user           → { id, name, email, role }  (active session — via user.js saveUser)
 */

import { saveUser, roleRedirectPath } from "./user";

const REGISTRY_KEY = "atomquest_users_registry";

/* ─── Registry helpers ─────────────────────────────────────────────── */

/** Read the full user registry. */
export function getRegistry() {
    try {
        return JSON.parse(localStorage.getItem(REGISTRY_KEY)) || [];
    } catch {
        return [];
    }
}

/** Overwrite the full user registry. */
function setRegistry(users) {
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(users));
}

/* ─── Auth actions ─────────────────────────────────────────────────── */

/**
 * Register a new user.
 *
 * @param {{ name: string, email: string, password: string, role: string }} data
 * @returns {{ ok: boolean, user?: object, error?: string }}
 */
export function registerUser({ name, email, password, role }) {
    const emailLower = email.trim().toLowerCase();
    const registry   = getRegistry();

    // Duplicate-email guard
    if (registry.find((u) => u.email.toLowerCase() === emailLower)) {
        return { ok: false, error: "An account with this email already exists." };
    }

    const newUser = {
        id:        `usr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name:      name.trim(),
        email:     emailLower,
        password,            // plain-text is fine for a localStorage-only demo
        role,
        createdAt: new Date().toISOString(),
    };

    setRegistry([...registry, newUser]);

    // Persist active session (password excluded from session object)
    const sessionUser = { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role };
    saveUser(sessionUser);

    return { ok: true, user: sessionUser };
}

/**
 * Validate credentials and start a session.
 *
 * @param {{ email: string, password: string }} credentials
 * @returns {{ ok: boolean, user?: object, error?: string }}
 */
export function loginUser({ email, password }) {
    const emailLower = email.trim().toLowerCase();
    const registry   = getRegistry();

    const found = registry.find((u) => u.email.toLowerCase() === emailLower);
    if (!found) {
        return { ok: false, error: "No account found with that email." };
    }
    if (found.password !== password) {
        return { ok: false, error: "Incorrect password. Please try again." };
    }

    const sessionUser = { id: found.id, name: found.name, email: found.email, role: found.role };
    saveUser(sessionUser);
    return { ok: true, user: sessionUser };
}

/** Expose roleRedirectPath so callers don't need to import two utils. */
export { roleRedirectPath };
