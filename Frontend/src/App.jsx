import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import PrivateRoute from "./components/PrivateRoute";

// Context
import { ReportProvider } from "./context/ReportContext";
import { AlertProvider } from "./context/AlertContext";
import { UserProvider } from "./context/UserContext";

// Pages
import Home from "./pages/Home";
import ReportIncident from "./pages/ReportIncident";
import MyReports from "./pages/MyReports";
import ReportDetails from "./pages/ReportDetails";
import Alerts from "./pages/Alerts";
import CreateAlert from "./pages/CreateAlert";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";

function App() {
  return (
    <UserProvider>
      <ReportProvider>
        <AlertProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected Routes (Wrapped in PrivateRoute) */}
              <Route element={<PrivateRoute />}>
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

              {/* Catch all - redirect to login if not found or unauthorized */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </AlertProvider>
      </ReportProvider>
    </UserProvider>
  );
}

export default App;
