import { Navigate, useLocation } from "react-router-dom";
import { getUser, roleRedirectPath } from "../utils/user";

/**
 * ProtectedRoute
 *
 * Wraps a route element with two guards:
 *  1. Not logged in  → redirect to /login (saves intended path to sessionStorage)
 *  2. Wrong role     → redirect to the user's correct dashboard
 *
 * @param {{ allowedRoles: string[], children: React.ReactNode }} props
 */
function ProtectedRoute({ allowedRoles, children }) {
    const location = useLocation();
    const user = getUser();

    // Guard 1: not authenticated
    if (!user) {
        // Stash the intended URL so login can redirect back (future use)
        sessionStorage.setItem("atomquest_redirect", location.pathname);
        return <Navigate to="/login" replace />;
    }

    // Guard 2: authenticated but wrong role
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to={roleRedirectPath(user.role)} replace />;
    }

    return children;
}

export default ProtectedRoute;
