import { useState } from "react";
import { User, Phone, Mail, ChevronLeft, Loader2, X, Users } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import NavBar from "../components/menu";


function CadastroConvidados() {
  const { eventoId } = useParams();
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [limiteAcompanhantes, setLimiteAcompanhantes] = useState(0);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Configuração da URL da API
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const API_CONVIDADOS = `${API_URL}/api/convidados`;

  const handleCadastro = async () => {
    setError("");
    
    if (!nome || !telefone) {
      setError("Nome e telefone são obrigatórios.");
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
  
    setIsLoading(true);
    try {
      // 1. Primeiro cadastra o convidado
      const convidadoData = {
        nome,
        telefone,
        email: email || null,
        limite_padrao: Number(limiteAcompanhantes) || 0
      };
  
      const respostaConvidado = await fetch(API_CONVIDADOS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(convidadoData),
      });
  
      if (!respostaConvidado.ok) {
        const error = await respostaConvidado.json();
        throw new Error(error.message || "Erro ao cadastrar convidado");
      }
  
      const convidadoCriado = await respostaConvidado.json();
      const convidadoId = convidadoCriado.id;
  
      // 2. Se houver eventoId, vincula o convidado ao evento
      if (eventoId) {
        const respostaVinculo = await fetch(`${API_CONVIDADOS}/${convidadoId}/eventos/${eventoId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            limite_padrao: Number(limiteAcompanhantes) || 0,
            confirmado: false
          }),
        });
  
        if (!respostaVinculo.ok) {
          // Rollback - remove o convidado se falhar o vínculo
          await fetch(`${API_CONVIDADOS}/${convidadoId}`, { method: "DELETE" });
          throw new Error("Erro ao vincular convidado ao evento");
        }
      }
  
      // 3. Feedback e limpeza
      toast.success(
        eventoId 
          ? "Convidado cadastrado e vinculado ao evento com sucesso!" 
          : "Convidado cadastrado com sucesso!"
      );
      
      setNome("");
      setTelefone("");
      setEmail("");
      setLimiteAcompanhantes(0);
      setError("");
  
    } catch (err) {
      console.error("Erro no cadastro:", err);
      setError(err.message || "Erro ao cadastrar convidado.");
      toast.error(err.message || "Falha no cadastro do convidado.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 py-16 px-4 sm:px-6 lg:px-8 pt-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-purple-300 mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: "0s" }}></div>
          <div className="absolute top-40 right-20 w-72 h-72 rounded-full bg-pink-300 mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: "1s" }}></div>
          <div className="absolute bottom-10 left-1/3 w-80 h-80 rounded-full bg-blue-300 mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: "2s" }}></div>
        </div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-indigo-600 mb-6 transition-colors group"
          >
            <ChevronLeft size={20} className="mr-1 group-hover:-translate-x-1 transition-transform" />
            <span>Voltar</span>
          </button>
          
          <div className="backdrop-blur-md bg-white/80 rounded-3xl overflow-hidden border border-white/30 shadow-xl">
            <div className="p-8 sm:p-10">
              <div className="text-center mb-10">
                <div className="inline-flex items-center bg-indigo-100 px-4 py-2 rounded-full text-indigo-600 font-medium mb-4 shadow-sm">
                  <User className="w-4 h-4 mr-2" />
                  <span>Cadastro de Convidados</span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-800 mb-2">
                  Adicionar Novo Convidado
                </h1>
                <p className="text-gray-600 max-w-lg mx-auto">
                  Preencha os detalhes do convidado e defina o limite padrão de acompanhantes
                </p>
              </div>
              
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 border border-red-100 flex items-start">
                  <X size={20} className="mr-2 mt-0.5 flex-shrink-0 text-red-500" />
                  <p>{error}</p>
                </div>
              )}
              
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 text-gray-400" size={18} />
                    <input
                      className="w-full bg-white/90 border border-gray-200 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
                      type="text"
                      placeholder="Nome completo*"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="relative">
                    <Phone className="absolute left-4 top-3.5 text-gray-400" size={18} />
                    <input
                      className="w-full bg-white/90 border border-gray-200 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
                      type="tel"
                      placeholder="Telefone*"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 text-gray-400" size={18} />
                  <input
                    className="w-full bg-white/90 border border-gray-200 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
                    type="email"
                    placeholder="Email (opcional)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="relative">
                  <Users className="absolute left-4 top-3.5 text-gray-400" size={18} />
                  <input
                    className="w-full bg-white/90 border border-gray-200 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
                    type="number"
                    min="0"
                    placeholder="Limite padrão de acompanhantes"
                    value={limiteAcompanhantes}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || (!isNaN(value) && parseInt(value) >= 0)) {
                        setLimiteAcompanhantes(value === "" ? "" : parseInt(value));
                      }
                    }}
                  />
                  <span className="absolute right-4 top-3.5 text-gray-400 text-sm">
                    {limiteAcompanhantes === "" ? 0 : limiteAcompanhantes} permitidos
                  </span>
                </div>

                <div className="pt-6">
                  <button 
                    type="button"
                    onClick={handleCadastro}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-3.5 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-indigo-200/50 w-full flex items-center justify-center"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Cadastrando...
                      </>
                    ) : (
                      "Cadastrar Convidado"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CadastroConvidados;