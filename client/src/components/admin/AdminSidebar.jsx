import { useNavigate, useLocation } from "react-router-dom";
import { getUser, displayNameFromEmail, initialsFromName, clearUser } from "../../utils/user";

const ADMIN_NAV = [
    { label: "Overview",     icon: "grid_view",         path: "/admin",            exact: true  },
    { label: "Employees",    icon: "manage_accounts",   path: "/admin/employees",  exact: false },
    { label: "Goal Cycles",  icon: "cycle",             path: "/admin/cycles",     exact: false },
    { label: "Analytics",    icon: "analytics",         path: "/admin/analytics",  exact: false },
    { label: "Activity",     icon: "history",           path: "/admin/activity",   exact: false },
    { label: "Settings",     icon: "settings",          path: "/admin/settings",   exact: false },
];

function AdminSidebar() {
    const navigate  = useNavigate();
    const location  = useLocation();
    const user      = getUser();
    const name      = user?.name || displayNameFromEmail(user?.email);
    const initials  = initialsFromName(name);

    const isActive = (item) =>
        item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);

    const handleLogout = () => { clearUser(); navigate("/login"); };

    return (
        <aside className="sidebar flex flex-col py-6 px-3">
            {/* Logo */}
            <div className="px-3 mb-8">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg luminous-gradient flex items-center justify-center">
                        <span className="text-white text-xs font-black">A</span>
                    </div>
                    <span className="text-sm font-semibold text-white/80 tracking-wide">AtomQuest</span>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex flex-col gap-0.5 flex-1">
                <p className="px-3 text-[10px] uppercase tracking-widest text-white/20 font-medium mb-2">
                    Admin Control
                </p>
                {ADMIN_NAV.map((item) => {
                    const active = isActive(item);
                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`sidebar-link ${active ? "active" : ""}`}
                        >
                            <span className="material-symbols-outlined">{item.icon}</span>
                            {item.label}
                            {active && (
                                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Profile */}
            <div className="px-3 mt-4 pt-4 border-t border-white/[0.06]">
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-violet-500/25 border border-violet-400/30 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-violet-300">
                        {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white/70 leading-none truncate">{name}</p>
                        <p className="text-[10px] text-white/30 mt-0.5">Administrator</p>
                    </div>
                    <button onClick={handleLogout} title="Logout" className="w-5 h-5 flex items-center justify-center rounded text-white/20 hover:text-white/50 transition flex-shrink-0">
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>logout</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}

export default AdminSidebar;
