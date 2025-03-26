import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Check, X, Clock, ChevronsUp, User, MapPin, Plus, Mail, Phone } from "lucide-react";
import eventoImage from '../../backend/uploads/convite.jpg';

function EventCredential() {
  const { convidadoId } = useParams();
  const [evento, setEvento] = useState(null);
  const [convidado, setConvidado] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [acompanhantes, setAcompanhantes] = useState([]);
  const [desejaInformarAcompanhante, setDesejaInformarAcompanhante] = useState(false);
  const [error, setError] = useState("");

  const buscarDadosConvidado = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/convidados/${convidadoId}`);
      if (!response.ok) throw new Error("Erro ao carregar dados");
      
      const data = await response.json();
      setConvidado(data);
      
      if (data.acompanhantes) {
        setAcompanhantes(data.acompanhantes.map(a => ({ 
          ...a, 
          confirmado: a.confirmado === 1 
        })));
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      setError("Erro ao atualizar dados do convidado");
    }
  };

  useEffect(() => {
    const buscarEventoEConvidado = async () => {
      try {
        setIsLoading(true);
        const [eventoResponse, convidadoResponse] = await Promise.all([
          fetch(`http://localhost:5000/api/eventos/${convidadoId}`),
          fetch(`http://localhost:5000/api/convidados/${convidadoId}`)
        ]);
  
        if (!eventoResponse.ok || !convidadoResponse.ok) {
          throw new Error("Erro ao carregar dados.");
        }
  
        const [eventoData, convidadoData] = await Promise.all([
          eventoResponse.json(),
          convidadoResponse.json()
        ]);
  
        if (eventoData.length > 0) {
          setEvento(eventoData[0]);
        }
  
        if (convidadoData) {
          setConvidado(convidadoData);
          if (convidadoData.acompanhantes && convidadoData.acompanhantes.length > 0) {
            setAcompanhantes(
              convidadoData.acompanhantes.map(a => ({ 
                ...a, 
                confirmado: a.confirmado === 1 
              }))
            );
            setDesejaInformarAcompanhante(true);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        setMensagem("Erro ao carregar dados do evento.");
      } finally {
        setIsLoading(false);
      }
    };
  
    buscarEventoEConvidado();
  }, [convidadoId]);

  const handleToggleAcompanhante = () => {
    setDesejaInformarAcompanhante(!desejaInformarAcompanhante);
    if (!desejaInformarAcompanhante) {
      setAcompanhantes([]);
    }
  };

  const handleAddAcompanhante = () => {
    setAcompanhantes([...acompanhantes, { nome: "", telefone: "", email: "", confirmado: false }]);
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

  const toggleConfirmacaoAcompanhante = (index) => {
    const updatedAcompanhantes = [...acompanhantes];
    updatedAcompanhantes[index].confirmado = !updatedAcompanhantes[index].confirmado;
    setAcompanhantes(updatedAcompanhantes);
  };

  const salvarAcompanhantes = async () => {
    const temAcompanhantesInvalidos = acompanhantes.some(a => !a.nome || !a.telefone);
    
    if (temAcompanhantesInvalidos) {
      setError("Nome e telefone são obrigatórios para todos os acompanhantes!");
      return;
    }
  
    setIsLoading(true);
    setError("");
    
    try {
      const novosAcompanhantes = acompanhantes.filter(a => !a.id);
      const acompanhantesAtualizados = [...acompanhantes.filter(a => a.id)];
  
      for (const acompanhante of novosAcompanhantes) {
        const response = await fetch(
          `http://localhost:5000/api/convidados/${convidadoId}/acompanhantes`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nome: acompanhante.nome,
              telefone: acompanhante.telefone,
              email: acompanhante.email || ""
            })
          }
        );
  
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText);
        }
  
        const data = await response.json();
        acompanhantesAtualizados.push({
          ...acompanhante,
          id: data.id,
          confirmado: false
        });
      }
  
      setAcompanhantes(acompanhantesAtualizados);
      setMensagem("Acompanhantes salvos com sucesso!");
    } catch (error) {
      console.error("Erro:", error);
      setError("Erro ao salvar acompanhantes. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const confirmarPresenca = async (status) => {
    setIsLoading(true);
    setError("");
    
    try {
      // 1. Confirmar convidado principal
      const responseConvidado = await fetch(
        `http://localhost:5000/api/convidados/${convidadoId}/confirmacao?status=${status}`,
        { method: "GET" }
      );

      if (!responseConvidado.ok) {
        throw new Error("Erro ao confirmar presença do convidado principal");
      }

      // 2. Se confirmando presença, confirmar acompanhantes selecionados
      if (status === "sim") {
        const acompanhantesParaEnviar = acompanhantes
          .filter(a => a.id) // Apenas acompanhantes com ID
          .map(a => ({
            id: a.id,
            confirmado: a.confirmado
          }));

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

      setMensagem(
        status === "sim" 
          ? "Presença confirmada com sucesso! ✅" 
          : "Você escolheu não participar. ❌"
      );
      
      // Recarrega os dados para garantir sincronização
      await buscarDadosConvidado();
    } catch (error) {
      console.error("Erro:", error);
      setError(error.message || "Ocorreu um erro. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F4F4F9]/30 to-[#B6D4E6]/30 p-6">
      <div className="max-w-md w-full border border-[#D0D9E3] shadow-xl overflow-hidden rounded-2xl transform hover:scale-[1.01] transition-transform duration-300">
        {evento && (
          <>
            <div className="relative overflow-hidden">
              <img
                src={eventoImage}
                alt="Imagem do Evento"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                  {evento.nome || "Nome não disponível"}
                </h1>
                <p className="text-white/90 text-sm drop-shadow-md">
                  {evento.descricao || "Descrição não disponível"}
                </p>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 text-[#3b3e41]">
                <MapPin className="w-5 h-5 text-[#591238]" />
                <span>{evento.local || "Local não informado"}</span>
              </div>

              <div className="flex items-center gap-3 text-[#3b3e41]">
                <Clock className="w-5 h-5 text-[#591238]" />
                <span>
                  {evento.data_evento
                    ? new Date(evento.data_evento).toLocaleString("pt-BR", {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : "Data não disponível"}
                </span>
              </div>

              <div className="mt-4 rounded-lg overflow-hidden shadow-sm border border-gray-200">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15550.029344321243!2d-38.53476171451526!3d-13.003331889437622!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x716037ee92ceae7%3A0x97ede61f92ef397b!2sBarra%2C%20Salvador%20-%20BA!5e0!3m2!1spt-PT!2sbr!4v1742953169002!5m2!1spt-PT!2sbr" 
                  width="100%" 
                  height="250" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-lg"
                ></iframe>
              </div>
            </div>
          </>
        )}

        <div className="p-6 pt-0">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 flex items-start gap-2 border border-red-100">
              <X size={18} className="flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {mensagem && (
            <div
              className={`p-4 rounded-lg mb-4 text-center ${
                mensagem.includes("confirmada")
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                  : mensagem.includes("não participar")
                  ? "bg-blue-50 text-blue-700 border border-blue-100"
                  : "bg-amber-50 text-amber-700 border border-amber-100"
              }`}
            >
              <p className="font-medium text-sm">{mensagem}</p>
            </div>
          )}

          <div className="mb-6">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={desejaInformarAcompanhante}
                  onChange={handleToggleAcompanhante}
                  className="rounded border-gray-300 text-[#591238] focus:ring-[#591238]"
                />
                <span className="text-gray-700 font-medium">Informar acompanhantes?</span>
              </label>
              {desejaInformarAcompanhante && (
                <button
                  onClick={handleAddAcompanhante}
                  className="text-sm flex items-center gap-1 text-[#591238] hover:text-[#7a1a48]"
                >
                  <Plus size={16} />
                  Adicionar
                </button>
              )}
            </div>

            {desejaInformarAcompanhante && (
              <div className="space-y-3">
                {acompanhantes.map((acompanhante, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`confirmar-${index}`}
                          checked={acompanhante.confirmado}
                          onChange={() => toggleConfirmacaoAcompanhante(index)}
                          disabled={!acompanhante.id}
                          className={`rounded border-gray-300 text-[#591238] focus:ring-[#591238] mr-2 ${
                            !acompanhante.id ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                          }`}
                        />
                        <label htmlFor={`confirmar-${index}`} className="font-medium text-gray-700">
                          Acompanhante {index + 1}
                        </label>
                      </div>
                      {!acompanhante.id && (
                        <button 
                          onClick={() => handleRemoveAcompanhante(index)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          aria-label="Remover acompanhante"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div className="relative">
                        <User size={16} className="absolute left-3 top-3 text-gray-400" />
                        <input
                          className="w-full bg-white border border-gray-200 rounded-md py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#591238] focus:border-[#591238] transition-all"
                          type="text"
                          placeholder="Nome completo"
                          value={acompanhante.nome}
                          onChange={(e) => handleChangeAcompanhante(index, "nome", e.target.value)}
                          disabled={!!acompanhante.id}
                        />
                      </div>
                      
                      <div className="relative">
                        <Phone size={16} className="absolute left-3 top-3 text-gray-400" />
                        <input
                          className="w-full bg-white border border-gray-200 rounded-md py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#591238] focus:border-[#591238] transition-all"
                          type="tel"
                          placeholder="Telefone (com DDD)"
                          value={acompanhante.telefone}
                          onChange={(e) => handleChangeAcompanhante(index, "telefone", e.target.value)}
                          disabled={!!acompanhante.id}
                        />
                      </div>
                      
                      <div className="relative">
                        <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
                        <input
                          className="w-full bg-white border border-gray-200 rounded-md py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#591238] focus:border-[#591238] transition-all"
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
                    className="w-full bg-[#591238] hover:bg-[#7a1a48] text-white font-medium rounded-md py-2 px-4 flex items-center justify-center gap-2 text-sm transition-colors disabled:opacity-70"
                  >
                    {isLoading ? <Clock className="w-4 h-4 animate-spin" /> : <Check size={16} />}
                    Salvar Acompanhantes
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => confirmarPresenca("sim")}
              disabled={isLoading}
              className="flex-1 bg-[#591238] hover:bg-[#7a1a48] text-white font-medium py-3 rounded-md flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
            >
              {isLoading ? <Clock className="w-4 h-4 animate-spin" /> : <Check size={16} />}
              Confirmar
            </button>

            <button
              onClick={() => confirmarPresenca("nao")}
              disabled={isLoading}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 rounded-md flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
            >
              {isLoading ? <Clock className="w-4 h-4 animate-spin" /> : <X size={16} />}
              Recusar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventCredential;