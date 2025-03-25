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
              convidadoData.acompanhantes.map(a => ({ ...a, confirmado: false }))
            ); // Corrigido aqui
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
    if (acompanhantes.some(a => !a.nome || !a.telefone)) {
      setError("Nome e telefone são obrigatórios para todos os acompanhantes.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/convidados/${convidadoId}/acompanhantes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ acompanhantes })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.erro || "Erro ao salvar acompanhantes.");
      }

      const dados = await response.json();
      setAcompanhantes(dados.acompanhantes || []);
      setMensagem("Acompanhantes salvos com sucesso!");
      setError("");
    } catch (error) {
      console.error("Erro:", error);
      setError(error.message || "Erro ao salvar acompanhantes. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const confirmarPresenca = async (status) => {
    setIsLoading(true);
    try {
      // Confirmar convidado principal
      const responseConvidado = await fetch(
        `http://localhost:5000/api/convidados/${convidadoId}/confirmacao?status=${status}`,
        { method: "GET" }
      );

      if (!responseConvidado.ok) throw new Error("Erro ao confirmar presença.");

      if (status === "sim") {
        // Confirmar acompanhantes selecionados
        const acompanhantesConfirmados = acompanhantes.filter(a => a.confirmado);
        
        if (acompanhantesConfirmados.length > 0) {
          await fetch(
            `http://localhost:5000/api/convidados/${convidadoId}/confirmar-acompanhantes`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                acompanhantes: acompanhantesConfirmados
              })
            }
          );
        }

        setMensagem("Presença confirmada com sucesso! ✅");
      } else {
        setMensagem("Você escolheu não participar. ❌");
      }
    } catch (error) {
      setMensagem("Ocorreu um erro. Tente novamente.");
      console.error("Erro ao confirmar presença:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F4F4F9]/30 to-[#B6D4E6]/30 p-6">
      <div className="max-w-md w-full border border-[#D0D9E3] shadow-xl overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl">
        {evento && (
          <>
            <img
              src={eventoImage}
              alt="Imagem do Evento"
              className="w-full h-full object-cover p-10 inset-shadow-sm inset-shadow-black shadow-2xl"
            />
            <div className="relative z-10 p-6">
              <ChevronsUp color="#591238" className="h-13 w-13 m-auto mb-4 mt-4"/>
              
              <div className="flex items-center justify-center mb-6">
                <h1 className="text-2xl font-semibold text-[#28292b] tracking-normal text-balance">
                  {evento.nome || "Nome não disponível"}
                </h1>
              </div>
              <p className="text-center text-[#3b3e41] p-8 m-1 bg-[#CCCAC4]">
                {evento.descricao || "Descrição não disponível"}
              </p>

              <p className="flex items-center justify-center gap-1 text-[#3b3e41] p-3">
                <MapPin className="w-8 h-8" />
                {evento.local || "Local não informado"}
              </p>

              <p className="flex items-center justify-center gap-1 text-[#3b3e41]">
                <Clock className="w-4 h-4" />
                {evento.data_evento
                  ? new Date(evento.data_evento).toLocaleString("pt-BR")
                  : "Data não disponível"}
              </p>
            </div>
          </>
        )}

        <div className="relative z-10 pt-6 p-6">
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-xl mb-4 flex items-start">
              <X size={18} className="mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {mensagem && (
            <div
              className={`p-4 rounded-xl mb-4 text-center animate-fade-in ${
                mensagem.includes("confirmada")
                  ? "bg-[#6D9F6A]/10 text-[#6D9F6A] border border-[#6D9F6A]/20"
                  : mensagem.includes("não participar")
                  ? "bg-[#A7B6D5]/10 text-[#A7B6D5] border border-[#A7B6D5]/20"
                  : "bg-[#F4A261]/10 text-[#F4A261] border border-[#F4A261]/20"
              }`}
            >
              <p className="font-medium text-sm">{mensagem}</p>
            </div>
          )}

          <div className="mb-6">
            <label className="flex items-center space-x-2 cursor-pointer p-3 rounded-xl hover:bg-white/30 transition-colors mb-4">
              <input
                type="checkbox"
                checked={desejaInformarAcompanhante}
                onChange={handleToggleAcompanhante}
                className="rounded border-[#A7B6D5] text-[#6D9F6A] focus:ring-[#6D9F6A]/30"
              />
              <span className="text-[#6D7C9D]">Deseja informar acompanhantes?</span>
            </label>

            {desejaInformarAcompanhante && (
              <div className="space-y-4 mt-2 animate-fade-in">
                {acompanhantes.map((acompanhante, index) => (
                  <div key={index} className="bg-white/70 p-4 rounded-xl border border-[#D0D9E3]/30 relative">
                    <button 
                      onClick={() => handleRemoveAcompanhante(index)}
                      className="absolute top-3 right-3 text-red-400 hover:text-red-500 transition-colors"
                      aria-label="Remover acompanhante"
                    >
                      <X size={16} />
                    </button>
                    
                    <div className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        id={`confirmar-${index}`}
                        checked={acompanhante.confirmado}
                        onChange={() => toggleConfirmacaoAcompanhante(index)}
                        className="rounded border-[#A7B6D5] text-[#6D9F6A] focus:ring-[#6D9F6A]/30 mr-2"
                      />
                      <label htmlFor={`confirmar-${index}`} className="font-medium text-[#6D7C9D]">
                        Acompanhante {index + 1}
                      </label>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="relative">
                        <User size={16} className="absolute left-3 top-2.5 text-[#A7B6D5]" />
                        <input
                          className="w-full bg-white/80 border border-[#D0D9E3]/30 rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6D9F6A]/30 transition-all"
                          type="text"
                          placeholder="Nome"
                          value={acompanhante.nome}
                          onChange={(e) => handleChangeAcompanhante(index, "nome", e.target.value)}
                        />
                      </div>
                      
                      <div className="relative">
                        <Phone size={16} className="absolute left-3 top-2.5 text-[#A7B6D5]" />
                        <input
                          className="w-full bg-white/80 border border-[#D0D9E3]/30 rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6D9F6A]/30 transition-all"
                          type="text"
                          placeholder="Telefone"
                          value={acompanhante.telefone}
                          onChange={(e) => handleChangeAcompanhante(index, "telefone", e.target.value)}
                        />
                      </div>
                      
                      <div className="relative">
                        <Mail size={16} className="absolute left-3 top-2.5 text-[#A7B6D5]" />
                        <input
                          className="w-full bg-white/80 border border-[#D0D9E3]/30 rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6D9F6A]/30 transition-all"
                          type="email"
                          placeholder="Email (opcional)"
                          value={acompanhante.email}
                          onChange={(e) => handleChangeAcompanhante(index, "email", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={handleAddAcompanhante}
                  className="w-full bg-[#8e9ebd] hover:bg-[#A7B6D5]/90 text-black shadow-md hover:shadow-lg rounded-lg py-2 px-4 flex items-center justify-center gap-2 text-sm"
                >
                  <Plus size={16} />
                  Adicionar acompanhante
                </button>
                
                {acompanhantes.length > 0 && (
                  <button
                    type="button"
                    onClick={salvarAcompanhantes}
                    disabled={isLoading}
                    className="w-full bg-[#6D9F6A] hover:bg-[#6D9F6A]/90 text-white shadow-md hover:shadow-lg rounded-lg py-2 px-4 flex items-center justify-center gap-2 text-sm disabled:opacity-70"
                  >
                    {isLoading ? <Clock className="w-4 h-4 animate-spin" /> : <Check size={16} />}
                    Salvar Acompanhantes
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => confirmarPresenca("sim")}
              disabled={isLoading}
              className="flex-1 bg-[#502131] hover:bg-[#6e575f]/90 text-white shadow-md hover:shadow-lg disabled:opacity-70 rounded-2xl py-2 flex items-center justify-center gap-2"
            >
              {isLoading ? <Clock className="w-4 h-4 animate-spin" /> : <Check size={16} />}
              Confirmar Presença
            </button>

            <button
              onClick={() => confirmarPresenca("nao")}
              disabled={isLoading}
              className="flex-1 bg-[#596886] hover:bg-[#A7B6D5]/90 text-white shadow-md hover:shadow-lg disabled:opacity-70 rounded-2xl py-2 flex items-center justify-center gap-2"
            >
              {isLoading ? <Clock className="w-4 h-4 animate-spin" /> : <X size={16} />}
              Não vou participar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventCredential;