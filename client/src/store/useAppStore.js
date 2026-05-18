import { create } from "zustand";
import { persist } from "zustand/middleware";

/* ── Seed Data ─────────────────────────────────────────────────────── */
export const SEED_CYCLES = [
    { id: "cycle-q1-2026", label: "Q1 2026", quarter: 1, year: 2026, status: "Archived",  isCurrentCycle: false, startedAt: "2026-01-01T00:00:00Z", lockedAt: "2026-03-25T00:00:00Z", archivedAt: "2026-04-02T00:00:00Z" },
    { id: "cycle-q2-2026", label: "Q2 2026", quarter: 2, year: 2026, status: "Active",    isCurrentCycle: true,  startedAt: "2026-04-01T00:00:00Z", lockedAt: null,                   archivedAt: null },
    { id: "cycle-q3-2026", label: "Q3 2026", quarter: 3, year: 2026, status: "Upcoming",  isCurrentCycle: false, startedAt: null,                   lockedAt: null,                   archivedAt: null },
    { id: "cycle-q4-2026", label: "Q4 2026", quarter: 4, year: 2026, status: "Upcoming",  isCurrentCycle: false, startedAt: null,                   lockedAt: null,                   archivedAt: null },
];

export const DEPARTMENTS = ["Engineering", "Design", "Product", "Data & Analytics", "Marketing", "Finance", "HR", "Operations"];

/* ── Store ─────────────────────────────────────────────────────────── */
export const useAppStore = create(
    persist(
        (set, get) => ({
            /* ── State ─────────────────────────────────────── */
            employees:      {},
            activityLog:    [],
            cycles:         SEED_CYCLES,
            adminEmployees: [],

            /* ── Internal log helper ────────────────────────── */
            _log(entry) {
                set((s) => ({
                    activityLog: [
                        { id: Date.now().toString() + Math.random(), time: new Date().toISOString(), ...entry },
                        ...s.activityLog,
                    ].slice(0, 50),
                }));
            },

            /* ── Employee actions ───────────────────────────── */
            registerEmployee({ email, name, role }) {
                set((s) => {
                    const existing = s.employees[email] || { goals: [], isSubmitted: false, submittedAt: null };
                    return { employees: { ...s.employees, [email]: { ...existing, name, role } } };
                });
            },

            addGoal(email, goal) {
                set((s) => {
                    const emp = s.employees[email] || { name: email, role: "Employee", goals: [], isSubmitted: false, submittedAt: null };
                    return {
                        employees: {
                            ...s.employees,
                            [email]: { ...emp, goals: [...emp.goals, { ...goal, status: "Draft", createdAt: new Date().toISOString(), employeeName: emp.name, employeeRole: emp.role }] },
                        },
                    };
                });
                get()._log({ type: "goal_added", user: get().employees[email]?.name || email, detail: `Added goal: "${goal.title}"` });
            },

            updateGoal(email, updatedGoal) {
                set((s) => {
                    const emp = s.employees[email];
                    if (!emp) return s;
                    return { employees: { ...s.employees, [email]: { ...emp, goals: emp.goals.map((g) => g.id === updatedGoal.id ? { ...g, ...updatedGoal } : g) } } };
                });
            },

            deleteGoal(email, goalId) {
                set((s) => {
                    const emp = s.employees[email];
                    if (!emp) return s;
                    return { employees: { ...s.employees, [email]: { ...emp, goals: emp.goals.filter((g) => g.id !== goalId) } } };
                });
            },

            submitGoals(email) {
                set((s) => {
                    const emp = s.employees[email];
                    if (!emp) return s;
                    return {
                        employees: {
                            ...s.employees,
                            [email]: { ...emp, isSubmitted: true, submittedAt: new Date().toISOString(), goals: emp.goals.map((g) => g.status === "Draft" || g.status === "Needs Revision" ? { ...g, status: "Pending Approval" } : g) },
                        },
                    };
                });
                const emp = get().employees[email];
                get()._log({ type: "submitted", user: emp?.name || email, detail: `Submitted ${emp?.goals?.length ?? 0} goal(s) for approval` });
            },

            resetEmployee(email) {
                set((s) => {
                    const emp = s.employees[email];
                    if (!emp) return s;
                    return { employees: { ...s.employees, [email]: { ...emp, goals: [], isSubmitted: false, submittedAt: null } } };
                });
            },

            /* ── Manager actions ────────────────────────────── */
            setEmployeeGoalStatuses(email, status) {
                set((s) => {
                    const emp = s.employees[email];
                    if (!emp) return s;
                    return { employees: { ...s.employees, [email]: { ...emp, goals: emp.goals.map((g) => ({ ...g, status })) } } };
                });
            },

            approveEmployee(email) {
                get().setEmployeeGoalStatuses(email, "Approved");
                const emp = get().employees[email];
                get()._log({ type: "approved", user: emp?.name || email, detail: "Goals approved by manager" });
            },

            rejectEmployee(email) {
                get().setEmployeeGoalStatuses(email, "Rejected");
                const emp = get().employees[email];
                get()._log({ type: "rejected", user: emp?.name || email, detail: "Goals rejected by manager" });
            },

            requestChanges(email) {
                set((s) => {
                    const emp = s.employees[email];
                    if (!emp) return s;
                    return { employees: { ...s.employees, [email]: { ...emp, isSubmitted: false, goals: emp.goals.map((g) => ({ ...g, status: "Needs Revision" })) } } };
                });
                const emp = get().employees[email];
                get()._log({ type: "revision", user: emp?.name || email, detail: "Manager requested revisions" });
            },

            /* ── Cycle actions ──────────────────────────────── */
            startCycle(id) {
                set((s) => ({
                    cycles: s.cycles.map((c) =>
                        c.id === id
                            ? { ...c, status: "Active", isCurrentCycle: true, startedAt: new Date().toISOString() }
                            : { ...c, isCurrentCycle: false }
                    ),
                }));
                const c = get().cycles.find((c) => c.id === id);
                get()._log({ type: "cycle_start", user: "Admin", detail: `${c?.label} cycle started` });
            },

            lockCycle(id) {
                set((s) => ({
                    cycles: s.cycles.map((c) => c.id === id ? { ...c, status: "Locked", lockedAt: new Date().toISOString() } : c),
                }));
                const c = get().cycles.find((c) => c.id === id);
                get()._log({ type: "cycle_lock", user: "Admin", detail: `Submissions locked for ${c?.label}` });
            },

            openCycle(id) {
                set((s) => ({
                    cycles: s.cycles.map((c) => c.id === id ? { ...c, status: "Active", lockedAt: null } : c),
                }));
                const c = get().cycles.find((c) => c.id === id);
                get()._log({ type: "cycle_open", user: "Admin", detail: `Submissions reopened for ${c?.label}` });
            },

            archiveCycle(id) {
                set((s) => ({
                    cycles: s.cycles.map((c) => c.id === id ? { ...c, status: "Archived", isCurrentCycle: false, archivedAt: new Date().toISOString() } : c),
                }));
                const c = get().cycles.find((c) => c.id === id);
                get()._log({ type: "cycle_archive", user: "Admin", detail: `${c?.label} archived` });
            },

            addCycle(cycle) {
                set((s) => ({ cycles: [...s.cycles, { ...cycle, id: `cycle-${Date.now()}` }] }));
                get()._log({ type: "cycle_start", user: "Admin", detail: `${cycle.label} cycle created` });
            },

            /* ── Admin employee actions ─────────────────────── */
            addAdminEmployee(emp) {
                const newEmp = { ...emp, id: `adm-${Date.now()}`, status: "Active", createdAt: new Date().toISOString() };
                set((s) => ({ adminEmployees: [...s.adminEmployees, newEmp] }));
                get()._log({ type: "emp_added", user: "Admin", detail: `Added employee: ${emp.name}` });
            },

            updateAdminEmployee(id, updates) {
                set((s) => ({ adminEmployees: s.adminEmployees.map((e) => e.id === id ? { ...e, ...updates } : e) }));
            },

            disableAdminEmployee(id) {
                set((s) => ({ adminEmployees: s.adminEmployees.map((e) => e.id === id ? { ...e, status: "Disabled" } : e) }));
                const emp = get().adminEmployees.find((e) => e.id === id);
                get()._log({ type: "emp_disabled", user: "Admin", detail: `${emp?.name} account disabled` });
            },

            enableAdminEmployee(id) {
                set((s) => ({ adminEmployees: s.adminEmployees.map((e) => e.id === id ? { ...e, status: "Active" } : e) }));
                const emp = get().adminEmployees.find((e) => e.id === id);
                get()._log({ type: "emp_added", user: "Admin", detail: `${emp?.name} account re-enabled` });
            },

            resetDemoData() {
                set({ employees: {}, activityLog: [], cycles: SEED_CYCLES, adminEmployees: [] });
            },

            /* ── Selectors ──────────────────────────────────── */
            getPendingEmployees()    { return Object.entries(get().employees).filter(([, e]) => e.isSubmitted).map(([email, e]) => ({ email, ...e })); },
            getAllEmployees()        { return Object.entries(get().employees).map(([email, e]) => ({ email, ...e })); },
            getGoalsForEmployee(email) { return get().employees[email]?.goals || []; },
            getEmployeeState(email) { return get().employees[email] || null; },
            getActivityLog()        { return get().activityLog; },
            getActiveCycle()        { return get().cycles.find((c) => c.status === "Active" && c.isCurrentCycle) || get().cycles.find((c) => c.status === "Active") || null; },
            getCycles()             { return [...get().cycles].sort((a, b) => a.year !== b.year ? a.year - b.year : a.quarter - b.quarter); },
        }),
        {
            name: "atomquest-store",
            version: 4,
            migrate(persisted, version) {
                if (version < 2) persisted = { ...persisted, activityLog: [] };
                if (version < 3) persisted = { ...persisted, cycles: SEED_CYCLES, adminEmployees: [] };
                // v4: wipe any old seed employees that may be in storage
                if (version < 4) persisted = { ...persisted, adminEmployees: [] };
                return persisted;
            },
        }
    )
);
