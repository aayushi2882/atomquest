import { useEffect } from "react";

/**
 * MobileDrawer — slide-in sidebar drawer for mobile.
 * Usage: wrap any sidebar content; appears when `open` is true.
 * Closes on overlay click or ESC key.
 */
function MobileDrawer({ open, onClose, children }) {
    /* Close on ESC */
    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [open, onClose]);

    /* Prevent body scroll when drawer open */
    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [open]);

    if (!open) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="drawer-overlay"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Drawer panel */}
            <div
                className="mobile-drawer drawer-enter flex flex-col"
                style={{
                    background: "rgba(19,19,19,0.98)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                    borderRight: "0.5px solid rgba(255,255,255,0.08)",
                    boxShadow: "4px 0 32px rgba(0,0,0,0.5)",
                }}
                role="dialog"
                aria-modal="true"
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition"
                    aria-label="Close menu"
                >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
                </button>

                {/* Sidebar content injected here */}
                {children}
            </div>
        </>
    );
}

export default MobileDrawer;
