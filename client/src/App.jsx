import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LandingPage        from "./pages/LandingPage";
import LoginPage          from "./pages/Login";
import EmployeeDashboard  from "./pages/EmployeeDashboard";
import ManagerDashboard   from "./pages/ManagerDashboard";
import GoalCreationPage   from "./pages/GoalCreation";
import ComingSoon         from "./pages/ComingSoon";
import ProtectedRoute     from "./components/ProtectedRoute";

/* Admin pages */
import AdminOverview      from "./pages/admin/AdminOverview";
import AdminEmployees     from "./pages/admin/AdminEmployees";
import AdminCycles        from "./pages/admin/AdminCycles";
import AdminAnalytics     from "./pages/admin/AdminAnalytics";
import AdminActivity      from "./pages/admin/AdminActivity";
import AdminSettings      from "./pages/admin/AdminSettings";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* ── Public ──────────────────────────────────── */}
                <Route path="/"            element={<LandingPage />} />
                <Route path="/landing"     element={<LandingPage />} />
                <Route path="/login"       element={<LoginPage />} />
                <Route path="/coming-soon" element={<ComingSoon />} />

                {/* ── Employee workspace ──────────────────────── */}
                <Route path="/employee" element={<ProtectedRoute allowedRoles={["Employee"]}><EmployeeDashboard /></ProtectedRoute>} />
                <Route path="/employee/goals" element={<ProtectedRoute allowedRoles={["Employee"]}><GoalCreationPage /></ProtectedRoute>} />

                {/* ── Manager workspace ───────────────────────── */}
                <Route path="/manager" element={<ProtectedRoute allowedRoles={["Manager"]}><ManagerDashboard /></ProtectedRoute>} />

                {/* ── Admin workspace ─────────────────────────── */}
                <Route path="/admin"            element={<ProtectedRoute allowedRoles={["Admin"]}><AdminOverview /></ProtectedRoute>} />
                <Route path="/admin/employees"  element={<ProtectedRoute allowedRoles={["Admin"]}><AdminEmployees /></ProtectedRoute>} />
                <Route path="/admin/cycles"     element={<ProtectedRoute allowedRoles={["Admin"]}><AdminCycles /></ProtectedRoute>} />
                <Route path="/admin/analytics"  element={<ProtectedRoute allowedRoles={["Admin"]}><AdminAnalytics /></ProtectedRoute>} />
                <Route path="/admin/activity"   element={<ProtectedRoute allowedRoles={["Admin"]}><AdminActivity /></ProtectedRoute>} />
                <Route path="/admin/settings"   element={<ProtectedRoute allowedRoles={["Admin"]}><AdminSettings /></ProtectedRoute>} />

                {/* ── Catch-all ───────────────────────────────── */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;