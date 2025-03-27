import { useState, useEffect } from "react";
import { User, Phone, Mail, Calendar, Plus, X, ChevronLeft } from "lucide-react";
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
  const navigate = useNavigate();

  useEffect(() => {
    const carregarEventos = async () => {
      setIsLoading(true);
      try {
        const resposta = await fetch("http://localhost:5000/api/eventos");
        const dados = await resposta.json();
        if (resposta.ok) {
          setEventos(dados); 
        } else {
          setError(dados.erro || "Erro ao carregar eventos.");
          toast({
            variant: "destructive",
            title: "Erro",
            description: "Não foi possível carregar a lista de eventos.",
          });
        }
      } catch (err) {
        console.error("Erro na requisição de eventos:", err);
        setError("Erro ao carregar eventos. Tente novamente mais tarde.");
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Falha na conexão com o servidor.",
        });
      } finally {
        setIsLoading(false);
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
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
      });
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
    <div className="min-h-screen bg-gradient-to-b from-event-background to-event-accent/10">
      <div className="max-w-4xl mx-auto p-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-event-text-secondary mb-6 hover:text-event-text-accent transition-colors"
        >
          <ChevronLeft size={20} />
          <span>Voltar para eventos</span>
        </button>
        
        <div className="backdrop-blur-sm bg-white/50 rounded-3xl shadow-lg border border-white/80 p-8 animate-fade-in">
          <h1 className="text-2xl md:text-3xl font-bold text-event-primary mb-8 text-center">Cadastro de Convidados</h1>
          
          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-6 flex items-start">
              <X size={20} className="mr-2 mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}
          
          <div className="space-y-5">
            <div className="relative">
              <User size={20} className="absolute left-3 top-3 text-event-secondary/60" />
              <input
                className="w-full bg-white/80 border border-event-accent/20 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-event-primary/30 transition-all"
                type="text"
                placeholder="Nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>
            
            <div className="relative">
              <Phone size={20} className="absolute left-3 top-3 text-event-secondary/60" />
              <input
                className="w-full bg-white/80 border border-event-accent/20 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-event-primary/30 transition-all"
                type="text"
                placeholder="Telefone"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                required
              />
            </div>
            
            <div className="relative">
              <Mail size={20} className="absolute left-3 top-3 text-event-secondary/60" />
              <input
                className="w-full bg-white/80 border border-event-accent/20 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-event-primary/30 transition-all"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <Calendar size={20} className="absolute left-3 top-3 text-event-secondary/60" />
              <select
                className="w-full bg-white/80 border border-event-accent/20 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-event-primary/30 transition-all appearance-none"
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
            </div>

            <div className="relative">
              <User size={20} className="absolute left-3 top-3 text-event-secondary/60" />
              <input
                className="w-full bg-white/80 border border-event-accent/20 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-event-primary/30 transition-all"
                type="number"
                min="0"
                placeholder="Limite de acompanhantes"
                value={limite_acompanhante}
                onChange={(e) => setLimiteAcomp(Math.max(0, parseInt(e.target.value) || 0))
                }
              />
            </div>

            {limite_acompanhante > 0 && (
              <label className="flex items-center space-x-2 cursor-pointer p-3 rounded-xl hover:bg-white/30 transition-colors">
                <input
                  type="checkbox"
                  checked={desejaInformarCandidato}
                  onChange={handleToggleCandidato}
                  className="rounded border-event-secondary/30 text-event-primary focus:ring-event-primary/30"
                />
                <span className="text-event-text-primary">Deseja informar acompanhantes?</span>
              </label>
            )}

            {desejaInformarCandidato && (
              <div className="space-y-4 mt-4 animate-fade-in">
                <div className="text-sm text-event-text-secondary">
                  {acompanhantes.length} de {limite_acompanhante} acompanhantes cadastrados
                </div>
                
                {acompanhantes.map((acompanhante, index) => (
                  <div key={index} className="bg-white/70 p-5 rounded-xl border border-event-accent/20 relative">
                    <button 
                      onClick={() => handleRemoveAcompanhante(index)}
                      className="absolute top-3 right-3 text-red-400 hover:text-red-500 transition-colors"
                      aria-label="Remover acompanhante"
                    >
                      <X size={18} />
                    </button>
                    
                    <h4 className="font-medium text-event-text-primary mb-3">Acompanhante {index + 1}</h4>
                    
                    <div className="space-y-3">
                      <div className="relative">
                        <User size={18} className="absolute left-3 top-2.5 text-event-secondary/60" />
                        <input
                          className="w-full bg-white/80 border border-event-accent/20 rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-event-primary/30 transition-all"
                          type="text"
                          placeholder="Nome"
                          value={acompanhante.nome}
                          onChange={(e) => handleChangeAcompanhante(index, "nome", e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="relative">
                        <Phone size={18} className="absolute left-3 top-2.5 text-event-secondary/60" />
                        <input
                          className="w-full bg-white/80 border border-event-accent/20 rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-event-primary/30 transition-all"
                          type="text"
                          placeholder="Telefone"
                          value={acompanhante.telefone}
                          onChange={(e) => handleChangeAcompanhante(index, "telefone", e.target.value)}
                        />
                      </div>
                      
                      <div className="relative">
                        <Mail size={18} className="absolute left-3 top-2.5 text-event-secondary/60" />
                        <input
                          className="w-full bg-white/80 border border-event-accent/20 rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-event-primary/30 transition-all"
                          type="email"
                          placeholder="Email"
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
                    className="bg-event-accent/80 hover:bg-event-accent/60 text-white font-medium py-3 px-5 rounded-lg transition-colors w-full"
                    disabled={acompanhantes.length >= limite_acompanhante}
                  >
                    <Plus size={18} className="inline mr-2" />
                    Adicionar acompanhante ({acompanhantes.length}/{limite_acompanhante})
                  </button>
                )}
              </div>
            )}

            <div className="mt-8">
              <button 
                type="button"
                onClick={handleCadastro}
                className="bg-event-primary/80 hover:bg-event-primary/60 text-white font-medium py-3 px-5 rounded-lg transition-colors w-full"
                disabled={isLoading}
              >
                {isLoading ? "Cadastrando..." : "Cadastrar Convidado"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CadastroConvidados;