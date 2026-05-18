import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import MobileDrawer from "./MobileDrawer";

function DashboardLayout({ children, title }) {
    const [drawerOpen, setDrawerOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-[#131313]">
            {/* Static sidebar — hidden on mobile via CSS (.sidebar { display:none }) */}
            <Sidebar />

            {/* Mobile slide-out drawer */}
            <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                <Sidebar />
            </MobileDrawer>

            <div className="flex-1 flex flex-col min-w-0">
                <Navbar title={title} onMenuToggle={() => setDrawerOpen(true)} />
                <main className="flex-1 p-4 sm:p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default DashboardLayout;
