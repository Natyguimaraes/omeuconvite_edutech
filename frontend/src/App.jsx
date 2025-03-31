import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import LoginAdministrador from "./pages/login";
import CadastroAdministrador from "./pages/cadastroAdm"; 
import NavBar from "./components/menu";
import CadastroConvidados from "./pages/cadastroConvidado";
import CadastroEventos from "./pages/cadastroEvento";
import Confirmacao from "./pages/confirmacao";
import Eventos from "./pages/eventos";
import ButtonConf from "./pages/button_conf";
import PaginaInicial from "./pages/PaginaInicial";
import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";
import CadastrarPlano from "./pages/superadmin/CadastrarPlano";
import LiberarAdministrador from "./pages/superadmin/LiberarAdministrador";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginAdministrador />} />
        
        {/* Rotas de superadmin (mantidas, mas não acessíveis diretamente) */}
       <Route
          path="/superadmin/SuperAdminDashboard"
          element={<SuperAdminDashboard />}
        >
          <Route path="CadastrarPlano" element={<CadastrarPlano />} />
          <Route
            path="LiberarAdministrador"
            element={<LiberarAdministrador />}
          />
        </Route>

        <Route path="/cadastroAdm" element={<CadastroAdministrador />}/>
        <Route path="/PaginaInicial" element={<PaginaInicial />} />
        <Route path="/menu" element={<NavBar />} />
        <Route path="/cadastroConvidado" element={<CadastroConvidados />} />
        <Route path="/cadastroEvento" element={<CadastroEventos />} />
        <Route path="/confirmacao" element={<Confirmacao />} />
        <Route path="/eventos" element={<Eventos />} />
        <Route path="/confirmacao/:convidadoId" element={<ButtonConf />} />
      </Routes>
    </Router>
  );
}

export default App;
