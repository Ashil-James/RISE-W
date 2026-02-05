import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

// Context
import { ReportProvider } from "./context/ReportContext";

// Pages
import Home from "./pages/Home";
import ReportIncident from "./pages/ReportIncident";
import MyReports from "./pages/MyReports";
import Alerts from "./pages/Alerts";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

function App() {
  return (
    <ReportProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes (No Layout / Full Screen) */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes (Wrapped in Main Layout) */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="report" element={<ReportIncident />} />
            <Route path="my-reports" element={<MyReports />} />
            <Route path="alerts" element={<Alerts />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ReportProvider>
  );
}

export default App;
