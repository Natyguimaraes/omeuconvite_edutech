import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LockKeyhole, User } from "lucide-react";

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
      const response = await fetch("http://localhost:5000/api/administradores/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpf, senha }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "Erro ao processar solicitação");
      }
  
      // Armazena o token no localStorage
      localStorage.setItem("token", data.token);
  
      // Armazena o adminId no localStorage
      if (data.admin && data.admin.id) {
        localStorage.setItem("adminId", data.admin.id.toString()); // Converte para string e armazena
        console.log("Admin ID armazenado:", data.admin.id); // Log para depuração
      } else {
        throw new Error("ID do administrador não encontrado na resposta.");
      }
  
      setMessage(data.message);
      console.log("Admin logado:", data.admin);
  
      // Redireciona para a página de eventos
      navigate("/eventos");
    } catch (error) {
      setMessage(error.message);
      console.error("Erro no login:", error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#f8f8f8] to-[#CCCAC4]/30">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-[#8470A1]/10 blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-[#959FC6]/10 blur-3xl"></div>
      </div>
      
      <div 
        className="w-full max-w-md p-10 rounded-2xl shadow-lg transition-transform duration-700 ease-out bg-white/80 backdrop-blur-md border border-white/20 relative z-10 hover:shadow-xl"
      >
        <div className="text-center mb-10">
          <div className="h-20 w-20 mx-auto mb-6 bg-gradient-to-br from-[#8470A1] to-[#959FC6] rounded-2xl flex items-center justify-center shadow-lg">
            <LockKeyhole className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-light tracking-tight text-[#333] mb-1">Login de Administrador</h1>
          <p className="text-[#666] text-sm">Entre com suas credenciais de acesso</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8470A1]">
              <User size={18} />
            </div>
            <input
              type="text"
              placeholder="CPF"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              required
              className="w-full px-10 py-3 rounded-xl bg-white/50 border border-[#CCCAC4] focus:border-[#8470A1] focus:ring-2 focus:ring-[#8470A1]/20 shadow-sm transition-all duration-300 outline-none"
            />
          </div>
          
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8470A1]">
              <LockKeyhole size={18} />
            </div>
            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              className="w-full px-10 py-3 rounded-xl bg-white/50 border border-[#CCCAC4] focus:border-[#8470A1] focus:ring-2 focus:ring-[#8470A1]/20 shadow-sm transition-all duration-300 outline-none"
            />
          </div>
          
          <button 
            className={`w-full py-3 rounded-xl text-white font-medium transition-all duration-500 ease-in-out transform hover:scale-[1.02] active:scale-[0.98] ${
              isLoading 
                ? "bg-[#CCCAC4] cursor-wait" 
                : "bg-gradient-to-r from-[#8470A1] to-[#959FC6] hover:shadow-lg hover:shadow-[#8470A1]/20"
            }`}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processando...
              </span>
            ) : (
              "Entrar"
            )}
          </button>
        </form>
        
        {message && <p className="mt-4 text-center text-red-500">{message}</p>}

        <div className="mt-8">
          <button 
            onClick={() => navigate("/cadastroAdm")} 
            className="w-full py-3 rounded-xl text-[#8470A1] bg-white/50 border border-[#CCCAC4] hover:bg-[#8470A1]/5 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Ainda não tem conta? Cadastre-se
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginAdministrador;