import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import Navbar from "../Navbar";
import MobileDrawer from "../MobileDrawer";

function AdminLayout({ children, title }) {
    const [drawerOpen, setDrawerOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-[#131313]">
            {/* Static sidebar — hidden on mobile */}
            <AdminSidebar />

            {/* Mobile slide-out drawer */}
            <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                <AdminSidebar />
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

export default AdminLayout;
