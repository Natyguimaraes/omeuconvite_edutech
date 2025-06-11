import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";

import NavBar from "./components/menu"
import CadastroConvidados from "./pages/registerGuest/cadastroConvidado"
import CadastroEventos from "./pages/registerEvents/cadastroEvento";
import Confirmacao from "./pages/guestList/confirmacao";
import Eventos from "./pages/home/eventos";
import ButtonConf from "./pages/invitation/button_conf";
import Rodape from "././components/rodape";
import CredenciaisPage from "./pages/credential/Credencialpage";
import InactivityHandlerWithModal from "./components/inativeModal/InactivityHandler"

function App() {

  const isLoggedIn = !!localStorage.getItem("token");
 
const handleLogout = () => {
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = "/";
};

  return (
    <>
    <NavBar />
    <Router>
      {isLoggedIn && (
        <InactivityHandlerWithModal
          timeout={48 * 60 * 60 * 1000}         // 48h minuto total
          warningBefore={5 * 60 * 1000}      // Avisar z segundos antes
          onLogout={handleLogout}
        />
      )}
      <Routes>
        
        <Route path="/" element={<Eventos />} />
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
