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
  Check,
  X
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

  const [editIndex, setEditIndex] = useState(null);
  const [editData, setEditData] = useState({
    imagem_evento: "", 
    nome: "",
    descricao: "",
    data_evento: "",
    data_gerar_qrcode: "",
    local: "",
    mensagem_whatsapp: "",
  });

  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const apiUrlEventos = `${baseUrl}/api/eventos`;
  const apiUrlConvidados = `${baseUrl}/api/convidados`;
  const textoCarregando = "Carregando eventos...";

  useEffect(() => {
    async function fetchDados() {
      setLoading(true);
      setError(null);
      try {
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

        console.log("convidadosData", convidadosData)

        const eventosProcessados = Array.isArray(eventosData)
          ? eventosData.map(e => ({
            ...e,
            id: Number(e.id),
            data_evento: e.data_evento || new Date().toISOString()
          }))
          : [];

        const convidadosProcessados = Array.isArray(convidadosData?.data)
          ? convidadosData.data.map(c => {
            if (!c) return null;
            
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

  const getTotalAcompanhantes = (convidadosEvento, eventoId) => {
    if (!Array.isArray(convidadosEvento)) return 0;

    return convidadosEvento.reduce((total, convidado) => {
      if (!convidado?.acompanhantes) return total;

      if (Array.isArray(convidado.acompanhantes))
        return total + convidado.acompanhantes.filter(a => String(a.eventoId) === String(eventoId)).length;
    }, 0);
  };

  const getConfirmadosPorEvento = (eventoId) => {
    const convidadosEvento = getConvidadosPorEvento(eventoId);
  
    let totalConfirmados = 0;
  
    convidadosEvento.forEach(convidado => {
      const eventoConvidado = convidado.eventos?.find(e => e.id === eventoId);
      if (eventoConvidado?.confirmado === 1) {
        // Conta o convidado
        totalConfirmados += 1;
  
        // Conta os acompanhantes (se houver)
        if (Array.isArray(convidado.acompanhantes)) {
          totalConfirmados += convidado.acompanhantes.filter(a => String(a.eventoId) === String(eventoId)).length;
        }
      }
    });
  
    return totalConfirmados;
  };
  

  const getAusentesPorEvento = (eventoId) => {
    const convidadosEvento = getConvidadosPorEvento(eventoId);

		const acompanhatesAusentes = convidadosEvento.reduce((total, convidado) => {
			if (!convidado?.acompanhantes) return total;
			return total + (Array.isArray(convidado.acompanhantes) ? convidado.acompanhantes.filter(a => a.confirmado === 2).length : 0);
		}, 0);

    return convidadosEvento.filter(c =>
      c.eventos?.find(e => e.id === eventoId)?.confirmado === 2
    ).length + acompanhatesAusentes;
  };

	const getPendentesPorEvento = (eventoId) => {
		const convidadosEvento = getConvidadosPorEvento(eventoId);

		console.log("convidadosEvento", convidadosEvento)

		const acompanhatesAusentes = convidadosEvento.reduce((total, convidado) => {
			if (!convidado?.acompanhantes) return total;
			return total + (Array.isArray(convidado.acompanhantes) ? convidado.acompanhantes.filter(a => !a.confirmado).length : 0);
		}, 0);

		return convidadosEvento.filter(c =>
			!c.eventos?.find(e => e.id === eventoId)?.confirmado
		).length + acompanhatesAusentes;
	};

  const handleEventoClick = (eventoId, e) => {
    if (e?.target?.closest('button')) return;
    setEventoExpandido(eventoExpandido === eventoId ? null : eventoId);
  };

  const handleVerDetalhes = (eventoId) => {
    navigate(`/confirmacao?eventoId=${eventoId}`);
  };

  const formatDataParaInput = (dataString) => {
    if (!dataString) return "";
    const data = new Date(dataString);
    return data.toISOString().slice(0, 16); // pega até 'YYYY-MM-DDTHH:MM'
  };
  
  const handleEditarEvento = (eventoId, e) => {
    e.stopPropagation();
    const evento = eventos.find(e => e.id === eventoId);
    setEditIndex(eventoId);
    setEditData({
     
      nome: evento.nome,
      descricao: evento.descricao,
      data_evento: formatDataParaInput(evento.data_evento),
      data_gerar_qrcode: formatDataParaInput(evento.data_gerar_qrcode),
      local: evento.local,
      mensagem_whatsapp: evento.mensagem_whatsapp,
    });
  };
  

  const handleCancelarEdicao = () => {
    setEditIndex(null);
    setEditData({
      
      nome: "",
      descricao: "",
      data_evento: "",
      data_gerar_qrcode: "",
      local: "",
      mensagem_whatsapp: "",
    });
  };

  const handleSalvarEdicao = async (eventoId) => {
    const dataEvento = new Date(editData.data_evento);
    const dataQRCode = new Date(editData.data_gerar_qrcode);
  
    if (dataQRCode >= dataEvento) {
      alert("A data para gerar o QR Code deve ser anterior à data do evento.");
      return;
    }
  
    try {
      const response = await fetch(`${apiUrlEventos}/${eventoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData)
      });
      
      if (!response.ok) throw new Error("Erro ao atualizar evento");
  
      setEventos(eventos.map(evento =>
        evento.id === eventoId ? { ...evento, ...editData } : evento
      ));
  
      setEditIndex(null);
    } catch (error) {
      console.error("Erro ao atualizar evento:", error);
      alert("Erro ao atualizar evento");
    }
  };
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
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
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-purple-300 mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: "0s" }}></div>
          <div className="absolute top-40 right-20 w-72 h-72 rounded-full bg-pink-300 mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: "1s" }}></div>
          <div className="absolute bottom-10 left-1/3 w-80 h-80 rounded-full bg-blue-300 mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: "2s" }}></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
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
                      const isEditing = editIndex === evento.id;
                      
                      return (
                        <div 
                          key={evento.id} 
                          className={`bg-white rounded-2xl overflow-hidden border transition-all duration-200 ${eventoExpandido === evento.id ? 'border-indigo-300 shadow-lg' : 'border-gray-100 shadow-md hover:shadow-lg'}`}
                        >
                          {isEditing ? (
                            <div className="p-6">
                  

                              <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                                <input
                                  type="text"
                                  name="nome"
                                  value={editData.nome}
                                  onChange={handleInputChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                              </div>
                              
                              <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                                <textarea
                                  name="descricao"
                                  value={editData.descricao}
                                  onChange={handleInputChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  rows="3"
                                />
                              </div>
                              
                              <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Data do Evento</label>
                                <input
                                  type="datetime-local"
                                  name="data_evento"
                                  value={editData.data_evento}
                                  onChange={handleInputChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                              </div>

                              <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Data para gerar QR Code</label>
                                <input
                                  type="datetime-local"
                                  name="data_gerar_qrcode"
                                  value={editData.data_gerar_qrcode}
                                  onChange={handleInputChange}
                                  min={new Date().toISOString().slice(0, 16)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                              </div>
                              
                              <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Local</label>
                                <input
                                  type="text"
                                  name="local"
                                  value={editData.local}
                                  onChange={handleInputChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                              </div>

                              <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem Whatsapp</label>
                                <input
                                  type="text"
                                  name="mensagem_whatsapp"
                                  value={editData.mensagem_whatsapp}
                                  onChange={handleInputChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                              </div>
                              
                              <div className="flex justify-end space-x-2 mt-4">
                                <button
                                  onClick={() => handleCancelarEdicao()}
                                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleSalvarEdicao(evento.id)}
                                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <EventCard 
                              evento={evento}
                              convidados={getConvidadosPorEvento(evento.id)}
                              totalAcompanhantes={getTotalAcompanhantes(getConvidadosPorEvento(evento.id), evento.id)}
                              totalConvidados={getConvidadosPorEvento(evento.id).length}
                              totalConfirmados={getConfirmadosPorEvento(evento.id)}
                              totalAusentes={getAusentesPorEvento(evento.id)}
																	totalPendentes={getPendentesPorEvento(evento.id)}
                              isExpanded={eventoExpandido === evento.id}
                              onClick={(e) => handleEventoClick(evento.id, e)}
                              onVerDetalhes={() => handleVerDetalhes(evento.id)}
                              onEditar={(e) => handleEditarEvento(evento.id, e)}
                              onExcluir={(e) => handleExcluirEvento(evento.id, e)}
                            />
                          )}
                        </div>
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