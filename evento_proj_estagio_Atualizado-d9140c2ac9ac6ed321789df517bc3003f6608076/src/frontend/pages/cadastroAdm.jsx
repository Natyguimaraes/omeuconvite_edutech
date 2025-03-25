import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LockKeyhole, User, FileText } from "lucide-react";

function CadastroAdministrador() {
    const [nome, setNome] = useState("");
    const [cpf, setCpf] = useState("");
    const [senha, setSenha] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const validarCPF = (cpf) => /^\d{11}$/.test(cpf);
    const validarSenha = (senha) => senha.length >= 8;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        // Validação dos campos
        if (!nome.trim()) return setMessage("Nome é obrigatório.");
        if (!validarCPF(cpf)) return setMessage("CPF inválido. Digite 11 números.");
        if (!validarSenha(senha)) return setMessage("A senha deve ter no mínimo 8 caracteres.");

        try {
            console.log("Enviando dados para o servidor:", { nome, cpf, senha }); 

            const response = await fetch("http://localhost:5000/api/administradores", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome, cpf, senha }),
            });

            console.log("Resposta do servidor:", response);

            const data = await response.json();
            console.log("Dados da resposta:", data);
            console.error("Erro completo:", data.error);

            if (response.ok) {
                alert("Administrador cadastrado com sucesso!");
            } else {
                setMessage(data.message || "Erro ao cadastrar administrador.");
            }
        } catch (error) {
            console.error("Erro ao conectar ao servidor:", error); 
            setMessage("Erro ao conectar ao servidor.");
            
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
                        <FileText className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-light tracking-tight text-[#333] mb-1"> Administrador do evento </h1>
                    <p className="text-[#666] text-sm"> Preencha os campos para criar sua conta </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8470A1]">
                            <User size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Nome"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            required
                            className="w-full px-10 py-3 rounded-xl bg-white/50 border border-[#CCCAC4] focus:border-[#8470A1] focus:ring-2 focus:ring-[#8470A1]/20 shadow-sm transition-all duration-300 outline-none"
                        />
                    </div>
                    
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
                        className="w-full py-3 rounded-xl text-white font-medium transition-all duration-500 ease-in-out transform hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r from-[#8470A1] to-[#959FC6] hover:shadow-lg hover:shadow-[#8470A1]/20"
                        type="submit"
                    >
                        Cadastrar
                    </button>
                </form>

                {message && <p className="mt-4 text-center text-red-500">{message}</p>}
                
                <div className="mt-8">
                    <button 
                        onClick={() => navigate("/login")} 
                        className="w-full py-3 rounded-xl text-[#8470A1] bg-white/50 border border-[#CCCAC4] hover:bg-[#8470A1]/5 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Já possuo cadastro
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CadastroAdministrador;

