import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LockKeyhole, User } from "lucide-react";
import NavBar from "../components/menu";

function LoginAdministrador() {
  const [cpf, setCpf] = useState("");
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
        body: JSON.stringify({ cpf, senha }),
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
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md px-6">
          <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex flex-col items-center mb-10">
              <div className="mb-6 p-4 rounded-full bg-indigo-50">
                <LockKeyhole className="h-8 w-8 text-indigo-600" />
              </div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">Login Cliente</h1>
              <p className="text-gray-500 text-sm">Insira suas credenciais para continuar</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-1">
                  CPF
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="cpf"
                    type="text"
                    placeholder="00000000000"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    required
                    className="block w-full pl-10 pr-3 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm placeholder-gray-400 transition-all duration-200 outline-none"
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
                    <LockKeyhole className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                    className="block w-full pl-10 pr-3 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm placeholder-gray-400 transition-all duration-200 outline-none"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center py-3 px-4 rounded-xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 ${
                    isLoading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
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
              <div className={`mt-6 p-3 rounded-lg text-center ${
                message.includes("Erro") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
              }`}>
                <p>{message}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginAdministrador;
