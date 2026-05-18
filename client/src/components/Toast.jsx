import { useEffect, useState } from "react";

const TYPE_CONFIG = {
    success: {
        icon:       "check_circle",
        iconColor:  "text-emerald-400",
        iconBg:     "bg-emerald-500/15",
        border:     "border-emerald-500/20",
        bar:        "bg-emerald-500",
    },
    warning: {
        icon:       "edit_note",
        iconColor:  "text-amber-400",
        iconBg:     "bg-amber-500/15",
        border:     "border-amber-500/20",
        bar:        "bg-amber-500",
    },
    error: {
        icon:       "cancel",
        iconColor:  "text-red-400",
        iconBg:     "bg-red-500/15",
        border:     "border-red-500/20",
        bar:        "bg-red-500",
    },
    info: {
        icon:       "info",
        iconColor:  "text-indigo-400",
        iconBg:     "bg-indigo-500/15",
        border:     "border-indigo-500/20",
        bar:        "bg-indigo-500",
    },
};

const DURATION = 3200; // ms before auto-dismiss

/**
 * Single toast message.
 * @param {{ message: string, type?: "success"|"warning"|"error"|"info", onDismiss: () => void }} props
 */
function Toast({ message, type = "success", onDismiss }) {
    const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.success;
    const [exiting, setExiting] = useState(false);

    const dismiss = () => {
        setExiting(true);
        setTimeout(onDismiss, 300);
    };

    useEffect(() => {
        const t = setTimeout(dismiss, DURATION);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div
            role="status"
            aria-live="polite"
            style={{
                animation: exiting
                    ? "toastOut 0.3s ease forwards"
                    : "toastIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
            }}
            className={`
                relative flex items-center gap-3 w-80 max-w-[calc(100vw-2rem)]
                glass-card-elevated rounded-2xl px-4 py-3
                border ${cfg.border}
                shadow-2xl overflow-hidden
            `}
        >
            {/* Icon */}
            <div className={`w-8 h-8 rounded-xl ${cfg.iconBg} flex items-center justify-center flex-shrink-0`}>
                <span className={`material-symbols-outlined ${cfg.iconColor}`} style={{ fontSize: 16 }}>
                    {cfg.icon}
                </span>
            </div>

            {/* Message */}
            <p className="flex-1 text-xs font-medium text-white/80 leading-snug">{message}</p>

            {/* Dismiss */}
            <button
                onClick={dismiss}
                className="w-5 h-5 flex items-center justify-center rounded text-white/20 hover:text-white/50 transition flex-shrink-0"
            >
                <span className="material-symbols-outlined" style={{ fontSize: 13 }}>close</span>
            </button>

            {/* Progress bar */}
            <div
                className={`absolute bottom-0 left-0 h-0.5 ${cfg.bar} opacity-60`}
                style={{ animation: `toastBar ${DURATION}ms linear forwards` }}
            />
        </div>
    );
}

/**
 * ToastContainer — fixed bottom-right portal.
 * Manages a queue of toasts. Use the returned `addToast` function.
 *
 * Usage:
 *   const { ToastPortal, addToast } = useToast();
 *   addToast({ message: "Done!", type: "success" });
 *   return <> ... <ToastPortal /> </>
 */
export function useToast() {
    const [toasts, setToasts] = useState([]);

    const addToast = ({ message, type = "success" }) => {
        const id = Date.now().toString() + Math.random();
        setToasts((prev) => [...prev, { id, message, type }]);
    };

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    function ToastPortal() {
        return (
            <div
                aria-label="Notifications"
                className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 items-end pointer-events-none"
            >
                {toasts.map((t) => (
                    <div key={t.id} className="pointer-events-auto">
                        <Toast
                            message={t.message}
                            type={t.type}
                            onDismiss={() => removeToast(t.id)}
                        />
                    </div>
                ))}
            </div>
        );
    }

    return { addToast, ToastPortal };
}

export default Toast;
