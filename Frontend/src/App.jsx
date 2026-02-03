import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import ReportIncident from "./pages/ReportIncident";

// --- PLACEHOLDER COMPONENTS (To be built later) ---
const MyReports = () => {
  const navigate = useNavigate();
  return (
    <div className="animate-fade-in space-y-4">
      <div
        className="flex items-center gap-2 text-wayanad-muted mb-4 cursor-pointer"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={18} /> <span className="text-sm">Back</span>
      </div>
      <h2 className="text-xl font-bold text-white">My Reports</h2>
      <div className="p-8 text-center border border-dashed border-white/10 rounded-xl text-wayanad-muted">
        Connecting to /api/v1/user/reports...
      </div>
    </div>
  );
};

const Alerts = () => {
  const navigate = useNavigate();
  return (
    <div className="animate-fade-in space-y-4">
      <div
        className="flex items-center gap-2 text-wayanad-muted mb-4 cursor-pointer"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={18} /> <span className="text-sm">Back</span>
      </div>
      <h2 className="text-xl font-bold text-white">Safety Alerts</h2>
      <div className="p-8 text-center border border-dashed border-white/10 rounded-xl text-wayanad-muted">
        Connecting to /api/v1/alerts...
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="report" element={<ReportIncident />} />
          <Route path="my-reports" element={<MyReports />} />
          <Route path="alerts" element={<Alerts />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
