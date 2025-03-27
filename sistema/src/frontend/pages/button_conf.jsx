import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Check, X, Clock, ChevronsUp, User, MapPin, Plus, Mail, Phone, Loader2, PartyPopper } from "lucide-react";
import eventoImage from '../../backend/uploads/convite.jpg';

function EventCredential() {
  const { convidadoId } = useParams();
  const [evento, setEvento] = useState({});
  const [convidado, setConvidado] = useState({});
  const [mensagem, setMensagem] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [acompanhantes, setAcompanhantes] = useState([]);
  const [desejaInformarAcompanhante, setDesejaInformarAcompanhante] = useState(false);
  const [error, setError] = useState("");
  const [limiteAcompanhantes, setLimiteAcompanhantes] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const convidadoResponse = await fetch(`http://localhost:5000/api/convidados/${convidadoId}`);
        const convidadoData = await convidadoResponse.json();
        
        const dadosConvidado = convidadoData.data || convidadoData;
        
        if (!dadosConvidado?.evento_id) {
          throw new Error("Convidado não associado a evento");
        }
    
        setConvidado(dadosConvidado);
        setLimiteAcompanhantes(dadosConvidado.limite_acompanhante || 0);
    
        const eventoResponse = await fetch(`http://localhost:5000/api/eventos/${dadosConvidado.evento_id}`);
        const eventoData = await eventoResponse.json();
        
        setEvento(eventoData.data || eventoData);
    
        if (dadosConvidado.acompanhantes?.length > 0) {
          setAcompanhantes(dadosConvidado.acompanhantes.map(a => ({
            ...a,
            confirmado: a.confirmado === 1
          })));
          setDesejaInformarAcompanhante(true);
        }
    
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [convidadoId]);

  const handleToggleAcompanhante = () => {
    const newValue = !desejaInformarAcompanhante;
    setDesejaInformarAcompanhante(newValue);
    
    if (!newValue) {
      setAcompanhantes([]);
    } else if (convidado?.acompanhantes) {
      setAcompanhantes(
        convidado.acompanhantes.map(a => ({ 
          ...a, 
          confirmado: a.confirmado === 1 
        }))
      );
    }
  };

  const handleAddAcompanhante = () => {
    if (acompanhantes.length >= limiteAcompanhantes) {
      setError(`Limite de ${limiteAcompanhantes} acompanhantes atingido`);
      return;
    }
    setAcompanhantes([...acompanhantes, { nome: "", telefone: "", email: "", confirmado: true }]);
  };

  const handleRemoveAcompanhante = (index) => {
    const updatedAcompanhantes = [...acompanhantes];
    const removed = updatedAcompanhantes.splice(index, 1);
    
    if (removed[0]?.id) {
      setIsLoading(true);
      fetch(`http://localhost:5000/api/convidados/acompanhantes/${removed[0].id}`, {
        method: 'DELETE'
      })
      .then(response => {
        if (!response.ok) throw new Error("Erro ao remover acompanhante");
        setAcompanhantes(updatedAcompanhantes);
        setMensagem("Acompanhante removido com sucesso");
      })
      .catch(error => {
        console.error("Erro ao remover acompanhante:", error);
        setError("Erro ao remover acompanhante");
      })
      .finally(() => setIsLoading(false));
    } else {
      setAcompanhantes(updatedAcompanhantes);
    }
  };

  const handleChangeAcompanhante = (index, field, value) => {
    const updatedAcompanhantes = [...acompanhantes];
    updatedAcompanhantes[index][field] = value;
    setAcompanhantes(updatedAcompanhantes);
  };

  const toggleConfirmacaoAcompanhante = (index) => {
    const updatedAcompanhantes = [...acompanhantes];
    updatedAcompanhantes[index].confirmado = !updatedAcompanhantes[index].confirmado;
    setAcompanhantes(updatedAcompanhantes);
  };

  const salvarAcompanhantes = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const novosAcompanhantes = acompanhantes.filter(a => !a.id);
      
      if (novosAcompanhantes.length === 0) {
        setMensagem("Nenhum novo acompanhante para salvar");
        return;
      }

      const temAcompanhantesInvalidos = novosAcompanhantes.some(a => !a.nome);
      if (temAcompanhantesInvalidos) {
        throw new Error("Nome é obrigatório para todos os acompanhantes");
      }

      const resultados = await Promise.all(
        novosAcompanhantes.map(async (acompanhante) => {
          const response = await fetch(
            `http://localhost:5000/api/convidados/${convidadoId}/acompanhantes`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                nome: acompanhante.nome,
                telefone: acompanhante.telefone || null,
                email: acompanhante.email || null
              })
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Erro ao salvar acompanhante");
          }

          return await response.json();
        })
      );

      setAcompanhantes(prev => [
        ...prev.filter(a => a.id),
        ...resultados.map(r => r.data)
      ]);

      setMensagem("Acompanhantes salvos com sucesso!");
      
    } catch (error) {
      console.error("Erro ao salvar acompanhantes:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmarPresenca = async (status) => {
    setIsLoading(true);
    setError("");
    
    try {
      const responseConvidado = await fetch(
        `http://localhost:5000/api/convidados/${convidadoId}/confirmacao`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ confirmado: status === "sim" })
        }
      );

      if (!responseConvidado.ok) {
        throw new Error("Erro ao confirmar presença do convidado principal");
      }

      if (status === "sim") {
        const acompanhantesParaEnviar = acompanhantes
          .filter(a => a.id) 
          .map(a => ({
            id: a.id,
            confirmado: a.confirmado
          }));

        if (acompanhantesParaEnviar.length > 0) {
          const responseAcompanhantes = await fetch(
            `http://localhost:5000/api/convidados/${convidadoId}/confirmar-acompanhantes`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                acompanhantes: acompanhantesParaEnviar
              })
            }
          );

          if (!responseAcompanhantes.ok) {
            const errorData = await responseAcompanhantes.json();
            throw new Error(errorData.erro || "Erro ao confirmar acompanhantes");
          }
        }

        // efeitos de confirmação
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
        
        setMensagem(
          <div className="text-center animate-pulse">
            <PartyPopper className="w-12 h-12 mx-auto text-yellow-500 mb-4 animate-bounce" />
            <h3 className="text-3xl font-bold text-emerald-700 mb-2">CONFIRMADO! 🎉</h3>
            <p className="text-xl text-gray-700">Estamos muito felizes por você vir!</p>
            <p className="mt-4 text-gray-600">Contamos com sua presença!</p>
          </div>
        );
      } else {
        setMensagem(
          <div className="text-center py-4">
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Que pena! 😢</h3>
            <p className="text-lg">Sua ausência será sentida!</p>
            <p className="mt-2 text-gray-600">Caso mude de ideia, você pode confirmar depois.</p>
          </div>
        );
      }
      
      // Recarrega os dados do convidado
      const response = await fetch(`http://localhost:5000/api/convidados/${convidadoId}`);
      if (response.ok) {
        const data = await response.json();
        setConvidado(data);
        if (data.acompanhantes) {
          setAcompanhantes(
            data.acompanhantes.map(a => ({ 
              ...a, 
              confirmado: a.confirmado === 1 
            }))
          );
        }
      }
    } catch (error) {
      console.error("Erro:", error);
      setError(error.message || "Ocorreu um erro. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 py-16 px-4 sm:px-6 lg:px-8 pt-24 relative overflow-hidden">
        {/* Efeito de confete */}
        {showConfetti && (
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            
          </div>
        )}

        {/* Animated background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-purple-300 mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: "0s" }}></div>
          <div className="absolute top-40 right-20 w-72 h-72 rounded-full bg-pink-300 mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: "1s" }}></div>
          <div className="absolute bottom-10 left-1/3 w-80 h-80 rounded-full bg-blue-300 mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: "2s" }}></div>
        </div>
        
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="backdrop-blur-md bg-white/80 rounded-3xl overflow-hidden border border-white/30 shadow-2xl">
            {/* Imagem do Evento - Tamanho aumentado e mais chamativo */}
            <div className="relative h-[32rem] overflow-hidden">
              <img
                src={eventoImage}
                alt="Imagem do Evento"
                className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
             
            </div>

            <div className=" bottom-0 left-0 right-0 p-8 text-gray text-center">
                <h1 className="text-5xl font-bold mb-4 text-shadow-lg">{evento.nome || "Nome do Evento"}</h1>
                <p className="text-2xl opacity-90 mb-6 text-shadow">{evento.descricao || "Descrição do evento"}</p>
                <ChevronsUp size={48} className="mx-auto mt-4 animate-bounce text-yellow-300" />
              </div>

            {/* Detalhes do Evento */}
            <div className="p-8 space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4 text-gray-700 bg-white/90 p-5 rounded-xl border border-gray-200 shadow-sm">
                  <Clock className="w-8 h-8 text-indigo-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-xl mb-1">Data e Hora</h3>
                    <p className="text-lg">
                      {evento.data_evento
                        ? new Date(evento.data_evento).toLocaleString("pt-BR", {
                            weekday: 'long',
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : "Data não disponível"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 text-gray-700 bg-white/90 p-5 rounded-xl border border-gray-200 shadow-sm">
                  <MapPin className="w-8 h-8 text-indigo-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-xl mb-1">Localização</h3>
                    <p className="text-lg">{evento.local || "Local não informado"}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15550.029344321243!2d-38.53476171451526!3d-13.003331889437622!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x716037ee92ceae7%3A0x97ede61f92ef397b!2sBarra%2C%20Salvador%20-%20BA!5e0!3m2!1spt-PT!2sbr!4v1742953169002!5m2!1spt-PT!2sbr" 
                  width="100%" 
                  height="350" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-lg"
                ></iframe>
              </div>
            </div>

            {/* Seção de Confirmação */}
            <div className="p-8 pt-0 pb-10">
              {error && (
                <div className="bg-red-50 text-red-600 p-5 rounded-xl mb-8 flex items-start gap-4 border border-red-100">
                  <X size={24} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold mb-1">Ocorreu um erro</h3>
                    <p>{error}</p>
                  </div>
                </div>
              )}

              {mensagem && (
                <div className={`p-8 rounded-xl mb-8 ${
                  mensagem.props?.children?.props?.className?.includes('text-emerald-700') 
                    ? "bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200"
                    : "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200"
                }`}>
                  {mensagem}
                </div>
              )}

              {/* Seção de Acompanhantes */}
              <div className="mb-10">
                {limiteAcompanhantes > 0 && (
                  <div className="flex items-center justify-between p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl mb-8 border border-indigo-100">
                    <label className="flex items-center gap-4 cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={desejaInformarAcompanhante}
                          onChange={handleToggleAcompanhante}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-6 w-6"
                        />
                      </div>
                      <span className="text-gray-800 font-semibold text-xl">
                        Informar acompanhantes? ({acompanhantes.length}/{limiteAcompanhantes})
                      </span>
                    </label>
                    {desejaInformarAcompanhante && acompanhantes.length < limiteAcompanhantes && (
                      <button
                        onClick={handleAddAcompanhante}
                        className="flex items-center gap-3 text-indigo-600 hover:text-indigo-800 font-medium text-lg"
                      >
                        <Plus size={24} />
                        <span>Adicionar</span>
                      </button>
                    )}
                  </div>
                )}

                {desejaInformarAcompanhante && (
                  <div className="space-y-8">
                    {acompanhantes.map((acompanhante, index) => (
                      <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 shadow-md relative">
                        <div className="flex justify-between items-start mb-5">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id={`confirmar-${index}`}
                              checked={acompanhante.confirmado}
                              onChange={() => toggleConfirmacaoAcompanhante(index)}
                              className={`rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mr-4 h-6 w-6 ${
                                !acompanhante.id ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                              }`}
                            />
                            <label htmlFor={`confirmar-${index}`} className="font-semibold text-gray-800 text-xl">
                              Acompanhante {index + 1}
                            </label>
                          </div>
                          {(!acompanhante.id || acompanhantes.length > 1) && (
                            <button 
                              onClick={() => handleRemoveAcompanhante(index)}
                              className="text-gray-400 hover:text-red-500 transition-colors p-1"
                              aria-label="Remover acompanhante"
                            >
                              <X size={24} />
                            </button>
                          )}
                        </div>
                        
                        <div className="space-y-5">
                          <div className="relative">
                            <User size={24} className="absolute left-4 top-4 text-gray-400" />
                            <input
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-5 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                              type="text"
                              placeholder="Nome completo"
                              value={acompanhante.nome}
                              onChange={(e) => handleChangeAcompanhante(index, "nome", e.target.value)}
                              disabled={!!acompanhante.id}
                            />
                          </div>
                          
                          <div className="relative">
                            <Phone size={24} className="absolute left-4 top-4 text-gray-400" />
                            <input
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-5 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                              type="tel"
                              placeholder="Telefone com DDD (opcional)"
                              value={acompanhante.telefone}
                              onChange={(e) => handleChangeAcompanhante(index, "telefone", e.target.value)}
                              disabled={!!acompanhante.id}
                            />
                          </div>
                          
                          <div className="relative">
                            <Mail size={24} className="absolute left-4 top-4 text-gray-400" />
                            <input
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-5 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                              type="email"
                              placeholder="E-mail (opcional)"
                              value={acompanhante.email}
                              onChange={(e) => handleChangeAcompanhante(index, "email", e.target.value)}
                              disabled={!!acompanhante.id}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {acompanhantes.some(a => !a.id) && (
                      <button
                        type="button"
                        onClick={salvarAcompanhantes}
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl py-4 px-6 flex items-center justify-center gap-3 transition-all disabled:opacity-70 text-xl"
                      >
                        {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Check size={24} />}
                        <span>Salvar Acompanhantes</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Botões de Confirmação */}
              <div className="flex gap-6">
                <button
                  onClick={() => confirmarPresenca("sim")}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-5 rounded-xl flex items-center justify-center gap-4 transition-all disabled:opacity-70 text-xl shadow-lg hover:shadow-emerald-200/50"
                >
                  {isLoading ? <Loader2 className="w-7 h-7 animate-spin" /> : (
                    <>
                      <Check size={28} />
                      <span>Confirmar Presença</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => confirmarPresenca("nao")}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-5 rounded-xl flex items-center justify-center gap-4 transition-all disabled:opacity-70 text-xl shadow-lg hover:shadow-gray-200/50"
                >
                  {isLoading ? <Loader2 className="w-7 h-7 animate-spin" /> : (
                    <>
                      <X size={28} />
                      <span>Não Poderei Ir</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default EventCredential;