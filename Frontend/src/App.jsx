import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import ReportIncident from "./pages/ReportIncident";
import MyReports from "./pages/MyReports";
import Alerts from "./pages/Alerts";

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
