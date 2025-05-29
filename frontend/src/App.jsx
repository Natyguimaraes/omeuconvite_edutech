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
import Rodape from "././components/rodape"
import CredenciaisPage from "./pages/Credencialpage";
import InactivityHandlerWithModal from "./components/InactivityHandler";

function App() {

  const isLoggedIn = !!localStorage.getItem("token");
 
const handleLogout = () => {
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = "/";
};

  return (
    <>
    <Router>
      {isLoggedIn && (
        <InactivityHandlerWithModal
          timeout={48 * 60 * 60 * 1000}         // 48h minuto total
          warningBefore={5 * 60 * 1000}      // Avisar z segundos antes
          onLogout={handleLogout}
        />
      )}
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
            element={<LiberarAdministrador />} />
        </Route>

        <Route path="/cadastroAdm" element={<CadastroAdministrador />} />
        <Route path="/PaginaInicial" element={<PaginaInicial />} />
        <Route path="/menu" element={<NavBar />} />
        <Route path="/cadastrar_convidado" element={<CadastroConvidados />} />
        <Route path="/cadastrar_evento" element={<CadastroEventos />} />
        <Route path="/detalhes_evento/:slug" element={<Confirmacao />} />
        <Route path="/Pagina_Inicial_Seus_eventos" element={<Eventos />} />
        <Route path="/convite/:convidadoId" element={<ButtonConf />} />
        <Route path="/credenciais" element={<CredenciaisPage />} />
      </Routes>
    </Router>
    <Rodape />
    </>
  );
}

export default App;
