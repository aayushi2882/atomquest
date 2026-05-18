import { useNavigate, useLocation } from "react-router-dom";
import { getUser, displayNameFromEmail, initialsFromName, clearUser } from "../utils/user";

// Role-based nav configs
const NAV_CONFIG = {
    Employee: [
        { label: "Dashboard",  icon: "grid_view",   path: "/employee",          available: true  },
        { label: "My Goals",   icon: "target",       path: "/employee/goals",    available: true  },
        { label: "Progress",   icon: "trending_up",  path: "/employee/progress", available: false },
        { label: "Settings",   icon: "settings",     path: "/employee/settings", available: false },
    ],
    Manager: [
        { label: "Dashboard",  icon: "grid_view",     path: "/manager",          available: true  },
        { label: "Team Goals", icon: "group",          path: "/manager/goals",    available: false },
        { label: "Approvals",  icon: "task_alt",       path: "/manager/approvals",available: false },
        { label: "Reports",    icon: "bar_chart",      path: "/manager/reports",  available: false },
    ],
    Admin: [
        { label: "Dashboard",  icon: "grid_view",     path: "/admin",            available: true  },
        { label: "Users",      icon: "manage_accounts",path: "/admin/users",      available: false },
        { label: "Analytics",  icon: "analytics",      path: "/admin/analytics",  available: false },
        { label: "Settings",   icon: "settings",       path: "/admin/settings",   available: false },
    ],
};

function Sidebar() {
    const navigate   = useNavigate();
    const location   = useLocation();

    // Read identity from localStorage
    const user        = getUser();
    const displayName = displayNameFromEmail(user?.email);
    const initials    = initialsFromName(displayName);
    const role        = user?.role || "Employee";

    // Pick the nav config for this role (fall back to Employee)
    const NAV_ITEMS = NAV_CONFIG[role] || NAV_CONFIG.Employee;

    const handleLogout = () => {
        clearUser();
        navigate("/login");
    };

    return (
        <aside className="sidebar flex flex-col py-6 px-3">

            {/* ── Logo ─────────────────────────────────────────────── */}
            <div className="px-3 mb-8">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg luminous-gradient flex items-center justify-center">
                        <span className="text-white text-xs font-black">A</span>
                    </div>
                    <span className="text-sm font-semibold text-white/80 tracking-wide">AtomQuest</span>
                </div>
            </div>

            {/* ── Navigation ───────────────────────────────────────── */}
            <nav className="flex flex-col gap-0.5 flex-1">
                <p className="px-3 text-[10px] uppercase tracking-widest text-white/20 font-medium mb-2">
                    Workspace
                </p>

                {NAV_ITEMS.map((item) => {
                    const isActive  = location.pathname === item.path;
                    const isDisabled = !item.available;

                    if (isDisabled) {
                        return (
                            <div
                                key={item.path}
                                title="Coming soon"
                                className="sidebar-link opacity-30 cursor-not-allowed select-none"
                                style={{ pointerEvents: "none" }}
                            >
                                <span className="material-symbols-outlined">{item.icon}</span>
                                {item.label}
                                <span
                                    className="ml-auto text-[9px] uppercase tracking-widest
                                               bg-white/[0.06] border border-white/10
                                               px-1.5 py-0.5 rounded-full text-white/25"
                                >
                                    Soon
                                </span>
                            </div>
                        );
                    }

                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`sidebar-link ${isActive ? "active" : ""}`}
                        >
                            <span className="material-symbols-outlined">{item.icon}</span>
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            {/* ── User profile ─────────────────────────────────────── */}
            <div className="px-3 mt-4 pt-4 border-t border-white/[0.06]">
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div
                        className="w-7 h-7 rounded-full bg-indigo-500/25
                                   border border-indigo-400/30 flex-shrink-0
                                   flex items-center justify-center
                                   text-[10px] font-bold text-indigo-300"
                    >
                        {initials}
                    </div>

                    {/* Name + role */}
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white/70 leading-none truncate">
                            {displayName}
                        </p>
                        <p className="text-[10px] text-white/30 mt-0.5">{role}</p>
                    </div>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        title="Logout"
                        className="w-5 h-5 flex items-center justify-center rounded
                                   text-white/20 hover:text-white/50 transition flex-shrink-0"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                            logout
                        </span>
                    </button>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;
