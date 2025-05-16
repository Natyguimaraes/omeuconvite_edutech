import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LockKeyhole, User } from "lucide-react";
import NavBar from "../components/menu";

function LoginAdministrador() {
  const [nome, setNome] = useState("");
  //const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);
  
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/administradores/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, senha }),
        credentials: 'same-origin'
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "Erro ao processar solicitação");
      }
  
      sessionStorage.setItem("token", data.token);
      localStorage.setItem("token", data.token);
  
      if (data.admin && data.admin.id) {
        sessionStorage.setItem("adminId", data.admin.id.toString());
        localStorage.setItem("adminId", data.admin.id.toString());
      } else {
        throw new Error("ID do administrador não encontrado na resposta.");
      }
  
      setMessage(data.message);
      navigate("/eventos");
    } catch (error) {
      setMessage(error.message);
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <NavBar />
     <div className="min-h-screen w-full flex items-center justify-center px-6 ">
  <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-6xl mb-10 md:mb-10 md:mt-10 border border-gray-300 shadow-2xl overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl">
    
     {/* Decoração visual (apenas mobile) */}
        <div className="md:hidden relative w-full flex rounded-br-full h-50 bg-gradient-to-r from-indigo-500 to-purple-600"> 
        </div>
    {/* Imagem visível apenas em telas md+ */}
    <div className="hidden md:block md:w-1/2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-e-full">
      <img src="vector_login3.png" alt="imagem da tela de login" className="w-full h-auto" />
    </div>

    {/* Formulário de login */}
    <div className="w-full md:w-1/2 py-8 md:px-8">
   
      <div className="bg-white p-6">
        
        
        <div className="flex flex-col items-center mb-8">
          <div className="mb-5 p-4 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 shadow-inner">
            <LockKeyhole className="h-8 w-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Login
            <span className="bg-gradient-to-br from-indigo-600 to-violet-500 bg-clip-text text-transparent"> Cliente </span> 
          </h1>
          <p className="text-gray-500 text-sm text-center">Insira suas credenciais para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
              Usuário
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-indigo-500" />
              </div>
              <input
                id="nome"
                type="text"
                placeholder="Nome de usuário"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="block w-full pl-10 pr-3 py-3 rounded-xl border border-purple-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm placeholder-gray-400 transition-all duration-200 outline-none bg-white/80"
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockKeyhole className="h-5 w-5 text-indigo-500" />
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                className="block w-full pl-10 pr-3 py-3 rounded-xl border border-purple-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm placeholder-gray-400 transition-all duration-200 outline-none bg-white/80"
                autoComplete="current-password"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-3 px-4 rounded-xl text-white font-medium shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 cursor-pointer ${
                isLoading 
                ? "bg-indigo-400 cursor-not-allowed" 
                : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 hover:shadow-indigo-200 hover:-translate-y-0.5"
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Autenticando...
                </>
              ) : (
                "Entrar"
              )}
            </button>
          </div>
        </form>

        {message && (
          <div className={`mt-6 p-3 rounded-lg text-center shadow-sm ${
            message.includes("Erro") 
              ? "bg-red-50 text-red-600 border border-red-200" 
              : "bg-green-50 text-green-600 border border-green-200"
          }`}>
            <p>{message}</p>
          </div>
        )}

        {/* Decorações visuais para mobile */}
        <div className="md:hidden mt-8 flex justify-center">
          <div className="w-12 h-1 bg-gradient-to-r from-indigo-300 to-purple-300 rounded-full opacity-50"></div>
        </div>
      </div>
      
    </div>
  </div>
</div>
    </>
  );
}

export default LoginAdministrador;
