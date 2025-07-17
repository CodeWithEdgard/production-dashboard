
import { BrowserRouter as Router, Routes, Route, Outlet  } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { DashboardPage } from "./pages/DashboardPage";

const Recebimento = () => (
  <div className="container mx-auto p-4">
    <h1 className="text-2x1 font-bold">Página do recebimento</h1>
  </div>
);

const Separação = () => (
  <div className="container mx-auto p-4">
    <h1 className="text-2x1 font-bold">Página do separacao</h1>
  </div>
);

const Requisição = () => (
  <div className="container mx-auto p-4">
    <h1 className="text-2x1 font-bold">Página do requisicao</h1>
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
  )
}

function App() {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<AppLayout />}> 
        <Route index element={<DashboardPage />} />  {/* KPI*/}
        <Route path="recebimento" element={<Recebimento />} />
        <Route path="separacao" element={<Separação />} />
        <Route path="requisicao" element={<Requisição />} />
        <Route path="alteracao" element={<Alteração />} />
        <Route path="relatoriornc" element={<Relatoriornc />} />
      
        </Route>
      </Routes>
    </Router>
  );
}

export default App;