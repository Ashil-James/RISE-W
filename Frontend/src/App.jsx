import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";

// --- COMPONENTS ---
import Layout from "./components/Layout"; // User Layout (Navbar, Footer)
import PrivateRoute from "./components/PrivateRoute"; // Route Guard
import AuthorityRedirect from "./components/AuthorityRedirect"; // [NEW] Handles Authority Redirection

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
import PostStormSurvey from "./pages/PostStormSurvey";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";

// --- ADMIN PAGES [NEW] ---
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminIncidents from "./pages/admin/AdminIncidents";
import Broadcasts from "./pages/admin/Broadcasts";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAuthorities from "./pages/admin/AdminAuthorities";
import AdminIncidentDetail from "./pages/admin/AdminIncidentDetail";

// --- AUTHORITY PAGES ---
import AuthorityLayout from "./pages/authority/AuthorityLayout";
import AuthorityWaterDashboard from "./pages/authority/AuthorityWaterDashboard";
import AuthorityWaterCase from "./pages/authority/AuthorityWaterCase";
import AuthorityPowerDashboard from "./pages/authority/AuthorityPowerDashboard";
import AuthorityPowerCase from "./pages/authority/AuthorityPowerCase";
import AuthorityRoadDashboard from "./pages/authority/AuthorityRoadDashboard";
import AuthorityRoadCase from "./pages/authority/AuthorityRoadCase";
import AuthorityProfile from "./pages/authority/AuthorityProfile";
import AuthoritySettings from "./pages/authority/AuthoritySettings";
import AuthorityHelp from "./pages/authority/AuthorityHelp";
import AuthorityBroadcastAlerts from "./pages/authority/AuthorityBroadcastAlerts";


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
                <Route path="/login/:authorityType" element={<Login />} />
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
                    <Route path="survey" element={<PostStormSurvey />} />
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
                  <Route path="incidents" element={<AdminIncidents />} />
                  <Route path="broadcasts" element={<Broadcasts />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="authorities" element={<AdminAuthorities />} />
                  <Route path="incident/:reportId" element={<AdminIncidentDetail />} />
                </Route>

                {/* --- AUTHORITY ROUTES (Protected) --- */}
                {/* Only Water Authority users can access /authority paths */}
                <Route
                  path="/authority"
                  element={
                    <PrivateRoute allowedRoles={["authority", "water_authority", "power_authority", "road_authority"]}>
                      <AuthorityLayout />
                    </PrivateRoute>
                  }
                >
                  <Route index element={<AuthorityRedirect />} />
                  <Route path="profile" element={<AuthorityProfile />} />

                  {/* Water Authority */}
                  <Route path="water/dashboard" element={<AuthorityWaterDashboard />} />
                  <Route path="water/case/:id" element={<AuthorityWaterCase />} />
                  <Route path="water/profile" element={<AuthorityProfile />} />
                  <Route path="water/settings" element={<AuthoritySettings />} />
                  <Route path="water/help" element={<AuthorityHelp />} />
                  <Route path="water/broadcasts" element={<AuthorityBroadcastAlerts />} />


                  {/* Power Authority */}
                  <Route path="power/dashboard" element={<AuthorityPowerDashboard />} />
                  <Route path="power/case/:id" element={<AuthorityPowerCase />} />
                  <Route path="power/profile" element={<AuthorityProfile />} />
                  <Route path="power/settings" element={<AuthoritySettings />} />
                  <Route path="power/help" element={<AuthorityHelp />} />
                  <Route path="power/broadcasts" element={<AuthorityBroadcastAlerts />} />


                  {/* Road Infrastructure Authority */}
                  <Route path="road/dashboard" element={<AuthorityRoadDashboard />} />
                  <Route path="road/case/:id" element={<AuthorityRoadCase />} />
                  <Route path="road/profile" element={<AuthorityProfile />} />
                  <Route path="road/settings" element={<AuthoritySettings />} />
                  <Route path="road/help" element={<AuthorityHelp />} />
                  <Route path="road/broadcasts" element={<AuthorityBroadcastAlerts />} />

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
