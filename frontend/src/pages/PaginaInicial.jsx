
import { useNavigate } from "react-router-dom";

function PaginaInicial() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-white blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-white blur-3xl"></div>
      </div>

      <div className="w-full max-w-md p-10 rounded-2xl shadow-lg transition-transform duration-700 ease-out bg-white backdrop-blur-md border border-white/20 relative z-10 hover:shadow-xl">
        <div className="text-center mb-10">
          <div className="h-20 w-20 mx-auto mb-6 bg-gradient-to-br from-[#8470A1] to-[#959FC6] rounded-2xl flex items-center justify-center shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-[#333] mb-1">
            Painel de Controle
          </h1>
          <p className="text-[#666] text-sm">
            Selecione uma opção para continuar
          </p>
        </div>

        <div className="space-y-6">
          <button
            onClick={() => navigate("/cadastroAdm")}
            className="w-full py-3 rounded-xl text-white font-medium transition-all duration-500 ease-in-out transform hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r from-[#8470A1] to-[#959FC6] hover:shadow-lg hover:shadow-[#8470A1]/20"
          >
            Cadastrar Administrador do evento
          </button>

          <button
            onClick={() => navigate("/superadmin/SuperAdminDashboard")}
            className="w-full py-3 rounded-xl text-white font-medium transition-all duration-500 ease-in-out transform hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r from-[#8470A1] to-[#959FC6] hover:shadow-lg hover:shadow-[#8470A1]/20"
          >
            Acessar Painel do Superadministrador
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaginaInicial;
