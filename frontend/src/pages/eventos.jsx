import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarIcon,
  Users,
  PlusCircle,
  Loader2,
  Trash2,
  Edit,
  MapPin,
  Heart,
  PartyPopper,
  BarChart3,
} from "lucide-react";

import NavBar from "../components/menu";
import EventCard from "../components/EventCard";

function Eventos() {
  const [eventos, setEventos] = useState([]);
  const [convidados, setConvidados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [eventoExpandido, setEventoExpandido] = useState(null);
  const navigate = useNavigate();

  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const apiUrlEventos = `${baseUrl}/api/eventos`;
  const apiUrlConvidados = `${baseUrl}/api/convidados`;
  const textoCarregando = "Carregando eventos...";

  useEffect(() => {
    async function fetchDados() {
      setLoading(true);
      setError(null);
      try {
        // Busca eventos e convidados
        const [eventosResponse, convidadosResponse] = await Promise.all([
          fetch(apiUrlEventos),
          fetch(apiUrlConvidados)
        ]);

        if (!eventosResponse.ok) throw new Error("Erro ao buscar eventos");
        if (!convidadosResponse.ok) throw new Error("Erro ao buscar convidados");

        const [eventosData, convidadosData] = await Promise.all([
          eventosResponse.json(),
          convidadosResponse.json()
        ]);

        // Normalização dos eventos
        const eventosProcessados = Array.isArray(eventosData)
          ? eventosData.map(e => ({
              ...e,
              id: Number(e.id),
              data_evento: e.data_evento || new Date().toISOString()
            }))
          : [];

        // Normalização dos convidados com suporte a múltiplos eventos
        const convidadosProcessados = Array.isArray(convidadosData?.data)
          ? convidadosData.data.map(c => {
              if (!c) return null;
              
              // Processa eventos do convidado
              let eventosConvidado = [];
              if (c.eventos) {
                if (Array.isArray(c.eventos)) {
                  eventosConvidado = c.eventos.map(e => ({
                    ...e,
                    id: Number(e.id),
                    limite_acompanhante: e.limite_acompanhante || 0,
                    confirmado: e.confirmado || false
                  }));
                }
              }

              // Processa acompanhantes
              let acompanhantes = [];
              if (c.acompanhantes) {
                if (Array.isArray(c.acompanhantes)) {
                  acompanhantes = c.acompanhantes;
                }
              }

              return {
                ...c,
                id: Number(c.id),
                eventos: eventosConvidado,
                acompanhantes
              };
            }).filter(Boolean)
          : [];

        setEventos(eventosProcessados);
        setConvidados(convidadosProcessados);

      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDados();
  }, [apiUrlEventos, apiUrlConvidados]);

  const getConvidadosPorEvento = (eventoId) => {
    if (!Array.isArray(convidados)) return [];
    
    return convidados.filter(c => 
      c.eventos?.some(e => e.id === eventoId)
    );
  };

  const getTotalAcompanhantes = (convidadosEvento) => {
    if (!Array.isArray(convidadosEvento)) return 0;

    return convidadosEvento.reduce((total, convidado) => {
      if (!convidado?.acompanhantes) return total;
      return total + (Array.isArray(convidado.acompanhantes) ? convidado.acompanhantes.length : 0);
    }, 0);
  };

  const getConfirmadosPorEvento = (eventoId) => {
    const convidadosEvento = getConvidadosPorEvento(eventoId);
    return convidadosEvento.filter(c => 
      c.eventos?.find(e => e.id === eventoId)?.confirmado === 1
    ).length;
  };

  const getAusentesPorEvento = (eventoId) => {
    const convidadosEvento = getConvidadosPorEvento(eventoId);
    return convidadosEvento.filter(c =>
      c.eventos?.find(e => e.id === eventoId)?.confirmado === 2
    ).length;
    
  };

  const handleEventoClick = (eventoId, e) => {
    if (e?.target?.closest('button')) return;
    setEventoExpandido(eventoExpandido === eventoId ? null : eventoId);
  };

  const handleVerDetalhes = (eventoId) => {
    navigate(`/confirmacao?eventoId=${eventoId}`);
  };

  const handleEditarEvento = (eventoId, e) => {
    e.stopPropagation();
    navigate(`/cadastroEvento/${eventoId}`);
  };

  const handleExcluirEvento = async (eventoId, e) => {
    e.stopPropagation();
    
    if (window.confirm("Tem certeza que deseja excluir este evento?")) {
      try {
        const response = await fetch(`${apiUrlEventos}/${eventoId}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) throw new Error("Erro ao excluir evento");
        
        setEventos(eventos.filter(evento => evento.id !== eventoId));
        setConvidados(convidados.map(c => ({
          ...c,
          eventos: c.eventos?.filter(e => e.id !== eventoId) || []
        })));
        setEventoExpandido(null);
      } catch (error) {
        console.error("Erro ao excluir evento:", error);
        alert("Erro ao excluir evento");
      }
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-red-100 max-w-md w-full">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4 text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Oops! Algo deu errado</h2>
          <p className="text-red-500 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full py-3 px-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 active:translate-y-0"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 py-16 px-4 sm:px-6 lg:px-8 pt-24 relative overflow-hidden">
        {/* Fundo animado */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-purple-300 mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: "0s" }}></div>
          <div className="absolute top-40 right-20 w-72 h-72 rounded-full bg-pink-300 mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: "1s" }}></div>
          <div className="absolute bottom-10 left-1/3 w-80 h-80 rounded-full bg-blue-300 mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: "2s" }}></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Cabeçalho */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-purple-100 px-4 py-2 rounded-full text-purple-600 font-medium mb-4 shadow-sm">
              <PartyPopper className="w-4 h-4 mr-2" />
              <span>Sistema de Gestão de Eventos</span>
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Celebrações Inesquecíveis
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Transforme momentos especiais em memórias eternas com nosso sistema
              de gerenciamento de eventos
            </p>
          </div>

          {/* Controles */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-2xl mr-4">
                <CalendarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Seus Próximos Eventos
              </h2>
            </div>
            <div className="flex space-x-4">
              <button
                className="group bg-white px-5 py-3 rounded-xl border border-indigo-100 shadow-sm hover:shadow-md transition-all duration-200 text-indigo-600 font-medium flex items-center"
                onClick={() => navigate("/cadastroEvento")}
              >
                <PlusCircle className="h-5 w-5 mr-2 group-hover:animate-pulse" />
                <span>Novo Evento</span>
              </button>
              <button
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium py-3 px-5 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-indigo-200/50 active:scale-95 flex items-center"
                onClick={() => navigate("/cadastroConvidado")}
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                <span>Adicionar Convidado</span>
              </button>
            </div>
          </div>

          {/* Lista de Eventos */}
          {loading ? (
            <div className="flex flex-col items-center justify-center p-16 glass-card rounded-3xl animate-pulse">
              <Loader2 className="h-12 w-12 text-indigo-500 animate-spin mb-4" />
              <p className="text-lg text-gray-600">{textoCarregando}</p>
              <div className="mt-6 w-3/4 h-2 bg-indigo-100 rounded-full shimmer-effect"></div>
              <div className="mt-3 w-2/4 h-2 bg-indigo-100 rounded-full shimmer-effect"></div>
              <div className="mt-3 w-3/5 h-2 bg-indigo-100 rounded-full shimmer-effect"></div>
            </div>
          ) : (
            <div className="backdrop-blur-md bg-white/80 rounded-3xl overflow-hidden border border-white/30 shadow-xl">
              <div className="p-8 sm:p-10">
                {eventos.length > 0 ? (
                  <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {eventos.map((evento) => {
                      return (
                        <EventCard evento={evento}
                          convidados={getConvidadosPorEvento(evento.id)}
                          totalAcompanhantes={getTotalAcompanhantes(getConvidadosPorEvento(evento.id))}
                          totalConvidados={getConvidadosPorEvento(evento.id).length}
                          totalConfirmados={getConfirmadosPorEvento(evento.id)}
                          totalAusentes={getAusentesPorEvento(evento.id)}
                          isExpanded={eventoExpandido === evento.id}
                          onClick={(e) => handleEventoClick(evento.id, e)}
                          onVerDetalhes={() => handleVerDetalhes(evento.id)}
                          onEditar={(e) => handleEditarEvento(evento.id, e)}
                          onExcluir={(e) => handleExcluirEvento(evento.id, e)}
                        />
                      )
                    })}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-10 text-center border border-indigo-100 shadow-inner">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-50 rounded-full mb-4">
                      <CalendarIcon className="h-10 w-10 text-indigo-300" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-700 mb-2">Nenhum evento encontrado</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                      Parece que você ainda não tem eventos cadastrados. Que tal começar criando seu primeiro evento?
                    </p>
                    <button
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg active:scale-95 inline-flex items-center"
                      onClick={() => navigate("/cadastroEvento")}
                    >
                      <PlusCircle className="h-5 w-5 mr-2" />
                      <span>Criar Primeiro Evento</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="text-center mt-12 text-gray-500 text-sm">
            <p>Celebre com estilo. Gerencie com facilidade.</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Eventos;