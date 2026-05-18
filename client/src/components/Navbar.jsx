import { useNavigate } from "react-router-dom";
import { clearUser } from "../utils/user";

function Navbar({ title = "Dashboard", onMenuToggle }) {
    const navigate = useNavigate();
    const now      = new Date();
    const quarter  = `Q${Math.ceil((now.getMonth() + 1) / 3)} ${now.getFullYear()}`;

    const handleLogout = () => {
        clearUser();
        navigate("/login");
    };

    return (
        <header className="h-14 flex items-center justify-between px-4 sm:px-6 border-b border-white/[0.06] bg-[#131313]/80 backdrop-blur-xl sticky top-0 z-30">
            {/* Left */}
            <div className="flex items-center gap-3">
                {/* Hamburger — only visible on mobile */}
                {onMenuToggle && (
                    <button
                        onClick={onMenuToggle}
                        className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition"
                        aria-label="Open navigation"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>menu</span>
                    </button>
                )}
                <h1 className="text-sm font-semibold text-white/80">{title}</h1>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] text-white/35">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 pulse-dot" />
                    {quarter}
                </span>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">
                {/* Search — hidden on mobile */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg glass-card text-xs text-white/35 cursor-default select-none">
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>search</span>
                    <span>Search</span>
                    <span className="ml-3 text-[10px] border border-white/10 rounded px-1.5 py-0.5">⌘K</span>
                </div>

                {/* Notifications */}
                <button className="relative w-8 h-8 rounded-lg glass-card flex items-center justify-center hover:bg-white/[0.07] transition" title="Notifications">
                    <span className="material-symbols-outlined text-white/40" style={{ fontSize: 16 }}>notifications</span>
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                </button>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="w-8 h-8 rounded-lg glass-card flex items-center justify-center hover:bg-white/[0.07] transition"
                    title="Sign out"
                >
                    <span className="material-symbols-outlined text-white/40" style={{ fontSize: 16 }}>logout</span>
                </button>
            </div>
        </header>
    );
}

export default Navbar;
