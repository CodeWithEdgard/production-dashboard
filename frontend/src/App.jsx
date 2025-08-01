import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { DashboardPage } from "./pages/DashboardPage";
import { ReportsPage } from "./pages/ReportsPage";
import { ReceivingPage } from "./pages/ReceivingPage";
import { CAPage } from "./pages/CAPage.jsx";
import { RequisitionPage } from "./pages/RequisitionPage.jsx";

import { Toaster } from "@/components/ui/sonner";

const Separação = () => (
  <div className="container mx-auto p-4">
    <h1 className="text-2x1 font-bold">Página do separacao</h1>
  </div>
);

const Alteração = () => (
  <div className="container mx-auto p-4">
    <h1 className="text-2x1 font-bold">Página do alteracao</h1>
  </div>
);

const Relatoriornc = () => (
  <div className="container mx-auto p-4">
    <h1 className="text-2x1 font-bold">Página do rnc</h1>
  </div>
);

function AppLayout() {
  return (
    <Layout>
      <Outlet /> {/* O <Outlet> renderiza a página filha aqui */}
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="relatorio" element={<ReportsPage />} />
          <Route path="recebimento" element={<ReceivingPage />} />
          <Route path="requisicao" element={<RequisitionPage />} />
          <Route path="separacao" element={<Separação />} />

          <Route path="alteracao" element={<CAPage />} />

          <Route path="relatoriornc" element={<Relatoriornc />} />
        </Route>
      </Routes>
      <Toaster richColors />
    </Router>
  );
}

export default App;
