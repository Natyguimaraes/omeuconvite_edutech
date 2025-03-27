import { useState, useEffect } from "react";
import { User, Phone, Mail, Calendar, Plus, X, ChevronLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";


function CadastroConvidados() {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [limite_acompanhante, setLimiteAcomp] = useState(0);
  const [eventoId, setEventoId] = useState("");
  const [desejaInformarCandidato, setDesejaInformarCandidato] = useState(false);
  const [acompanhantes, setAcompanhantes] = useState([]);
  const [error, setError] = useState("");
  const [eventos, setEventos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEventos, setIsLoadingEventos] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const carregarEventos = async () => {
      setIsLoadingEventos(true);
      try {
        const resposta = await fetch("http://localhost:5000/api/eventos");
        const dados = await resposta.json();
        if (resposta.ok) {
          setEventos(dados); 
        } else {
          setError(dados.erro || "Erro ao carregar eventos.");
          toast.error("Não foi possível carregar a lista de eventos.");
        }
      } catch (err) {
        console.error("Erro na requisição de eventos:", err);
        setError("Erro ao carregar eventos. Tente novamente mais tarde.");
        toast.error("Falha na conexão com o servidor.");
      } finally {
        setIsLoadingEventos(false);
      }
    };

    carregarEventos();
  }, []);

  const handleToggleCandidato = () => {
    setDesejaInformarCandidato(!desejaInformarCandidato);
    if (!desejaInformarCandidato) {
      setAcompanhantes([]);
    }
  };

  const handleAddAcompanhante = () => {
    if (acompanhantes.length >= limite_acompanhante) {
      toast.error(`Limite de ${limite_acompanhante} acompanhantes atingido`);
      return;
    }
    setAcompanhantes([...acompanhantes, { nome: "", telefone: "", email: "" }]);
  };

  const handleRemoveAcompanhante = (index) => {
    const updatedAcompanhantes = [...acompanhantes];
    updatedAcompanhantes.splice(index, 1);
    setAcompanhantes(updatedAcompanhantes);
  };

  const handleChangeAcompanhante = (index, field, value) => {
    const updatedAcompanhantes = [...acompanhantes];
    updatedAcompanhantes[index][field] = value;
    setAcompanhantes(updatedAcompanhantes);
  };

  const handleCadastro = async () => {
    setError("");

    if (!nome || !telefone || !eventoId) {
      setError("Nome, telefone e evento são obrigatórios.");
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (desejaInformarCandidato && acompanhantes.length > limite_acompanhante) {
      setError(`Número de acompanhantes excede o limite de ${limite_acompanhante}`);
      toast.error(`Número de acompanhantes excede o limite de ${limite_acompanhante}`);
      return;
    }

    setIsLoading(true);
    try {
      const resposta = await fetch("http://localhost:5000/api/convidados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          telefone,
          email,
          limite_acompanhante,
          evento_id: eventoId,
          acompanhantes: desejaInformarCandidato ? acompanhantes : [],
        }),
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        toast.success("Convidado cadastrado com sucesso!");
        setNome("");
        setTelefone("");
        setEmail("");
        setLimiteAcomp(0);
        setEventoId("");
        setDesejaInformarCandidato(false);
        setAcompanhantes([]);
      } else {
        setError(dados.erro || "Erro ao cadastrar convidado.");
        toast.error(dados.erro || "Não foi possível cadastrar o convidado.");
      }
    } catch (err) {
      console.error("Erro na requisição:", err);
      setError("Erro ao cadastrar convidado. Tente novamente mais tarde.");
      toast.error("Falha na conexão com o servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 py-16 px-4 sm:px-6 lg:px-8 pt-24 relative overflow-hidden">
        {/* Animated background elements */}
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
            <span>Voltar para eventos</span>
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
                  Preencha os detalhes do convidado e gerencie os acompanhantes para o evento selecionado
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
                      placeholder="Nome completo"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="relative">
                    <Phone className="absolute left-4 top-3.5 text-gray-400" size={18} />
                    <input
                      className="w-full bg-white/90 border border-gray-200 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
                      type="text"
                      placeholder="Telefone"
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
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="relative">
                    <Calendar className="absolute left-4 top-3.5 text-gray-400" size={18} />
                    {isLoadingEventos ? (
                      <div className="w-full bg-gray-100 rounded-xl py-3 px-4 flex items-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2 text-gray-500" />
                        <span className="text-gray-500">Carregando eventos...</span>
                      </div>
                    ) : (
                      <select
                        className="w-full bg-white/90 border border-gray-200 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all appearance-none"
                        value={eventoId}
                        onChange={(e) => setEventoId(e.target.value)}
                        required
                      >
                        <option value="">Selecione um evento</option>
                        {eventos.map((evento) => (
                          <option key={evento.id} value={evento.id}>
                            {evento.nome}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 text-gray-400" size={18} />
                    <input
                      className="w-full bg-white/90 border border-gray-200 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
                      type="number"
                      min="0"
                      placeholder="Limite de acompanhantes"
                      value={limite_acompanhante}
                      onChange={(e) => setLimiteAcomp(Math.max(0, parseInt(e.target.value) || 0))}
                    />
                  </div>
                </div>

                {limite_acompanhante > 0 && (
                  <div className="flex items-center space-x-3 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                    <input
                      type="checkbox"
                      id="informarAcompanhantes"
                      checked={desejaInformarCandidato}
                      onChange={handleToggleCandidato}
                      className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="informarAcompanhantes" className="text-gray-700 font-medium cursor-pointer">
                      Deseja informar acompanhantes?
                    </label>
                  </div>
                )}

                {desejaInformarCandidato && (
                  <div className="space-y-5 mt-4 animate-fade-in">
                    <div className="text-sm text-gray-500 font-medium">
                      {acompanhantes.length} de {limite_acompanhante} acompanhantes cadastrados
                    </div>
                    
                    {acompanhantes.map((acompanhante, index) => (
                      <div key={index} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative">
                        <button 
                          onClick={() => handleRemoveAcompanhante(index)}
                          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors p-1"
                          aria-label="Remover acompanhante"
                        >
                          <X size={18} />
                        </button>
                        
                        <h4 className="font-medium text-gray-800 mb-4 flex items-center">
                          <span className="bg-indigo-100 text-indigo-600 w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">
                            {index + 1}
                          </span>
                          Acompanhante
                        </h4>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="relative">
                            <User className="absolute left-3 top-2.5 text-gray-400" size={16} />
                            <input
                              className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
                              type="text"
                              placeholder="Nome"
                              value={acompanhante.nome}
                              onChange={(e) => handleChangeAcompanhante(index, "nome", e.target.value)}
                              required
                            />
                          </div>
                          
                          <div className="relative">
                            <Phone className="absolute left-3 top-2.5 text-gray-400" size={16} />
                            <input
                              className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
                              type="text"
                              placeholder="Telefone"
                              value={acompanhante.telefone}
                              onChange={(e) => handleChangeAcompanhante(index, "telefone", e.target.value)}
                            />
                          </div>
                          
                          <div className="relative md:col-span-2">
                            <Mail className="absolute left-3 top-2.5 text-gray-400" size={16} />
                            <input
                              className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
                              type="email"
                              placeholder="Email (opcional)"
                              value={acompanhante.email}
                              onChange={(e) => handleChangeAcompanhante(index, "email", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {acompanhantes.length < limite_acompanhante && (
                      <button
                        type="button"
                        onClick={handleAddAcompanhante}
                        className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-medium py-2.5 px-5 rounded-lg transition-colors w-full flex items-center justify-center"
                        disabled={acompanhantes.length >= limite_acompanhante}
                      >
                        <Plus size={18} className="mr-2" />
                        Adicionar acompanhante ({acompanhantes.length}/{limite_acompanhante})
                      </button>
                    )}
                  </div>
                )}

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