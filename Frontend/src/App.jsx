import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// --- COMPONENTS ---
import Layout from "./components/Layout"; // User Layout (Navbar, Footer)
import PrivateRoute from "./components/PrivateRoute"; // Route Guard

// --- CONTEXTS ---
import { AuthProvider } from "./context/AuthContext"; // [NEW] Handles Login Roles
import { UserProvider } from "./context/UserContext";
import { ReportProvider } from "./context/ReportContext";
import { AlertProvider } from "./context/AlertContext";

// --- USER PAGES ---
import Home from "./pages/Home";
import ReportIncident from "./pages/ReportIncident";
import MyReports from "./pages/MyReports";
import ReportDetails from "./pages/ReportDetails";
import Alerts from "./pages/Alerts";
import CreateAlert from "./pages/CreateAlert";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";

// --- ADMIN PAGES [NEW] ---
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Broadcasts from "./pages/admin/Broadcasts";
import AdminUsers from "./pages/admin/AdminUsers";

function App() {
  return (
    <AuthProvider>
      {" "}
      {/* [NEW] Wraps everything to manage roles */}
      <UserProvider>
        <ReportProvider>
          <AlertProvider>
            <BrowserRouter>
              <Routes>
                {/* --- PUBLIC ROUTES --- */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* --- USER ROUTES (Protected) --- */}
                {/* We pass 'allowedRoles' to PrivateRoute so only Users can see this */}
                <Route element={<PrivateRoute allowedRoles={["user"]} />}>
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="report" element={<ReportIncident />} />
                    <Route path="my-reports" element={<MyReports />} />
                    <Route path="my-reports/:id" element={<ReportDetails />} />
                    <Route path="alerts" element={<Alerts />} />
                    <Route path="create-alert" element={<CreateAlert />} />
                  </Route>
                </Route>

                {/* --- ADMIN ROUTES (Protected) --- */}
                {/* Only Admins can access /admin paths */}
                <Route
                  path="/admin"
                  element={
                    <PrivateRoute allowedRoles={["admin"]}>
                      <AdminLayout />
                    </PrivateRoute>
                  }
                >
                  {/* Default redirect: /admin -> /admin/dashboard */}
                  <Route index element={<Navigate to="dashboard" replace />} />

                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="broadcasts" element={<Broadcasts />} />
                  <Route path="users" element={<AdminUsers />} />
                </Route>

                {/* --- CATCH ALL --- */}
                {/* Redirect unknown pages to Login */}
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </BrowserRouter>
          </AlertProvider>
        </ReportProvider>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;
