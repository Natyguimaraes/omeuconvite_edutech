import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Check,
  Trash2,
  Edit,
  Send,
  Plus,
  ChevronLeft,
  Loader2,
  Users,
  CalendarIcon,
  X,
} from "lucide-react";
import { toast } from "sonner";

const Confirmacao = () => {
  const navigate = useNavigate();
  const { id: convidadoIdParam } = useParams();
  const [eventos, setEventos] = useState([]);
  const [convidados, setConvidados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editIndex, setEditIndex] = useState(null);
  const [editingAcompanhante, setEditingAcompanhante] = useState(null);
  const [editData, setEditData] = useState({
    nome: "",
    telefone: "",
    email: "",
    acompanhantes: [],
  });

  // Função segura para obter convidados por evento
  const getConvidadosPorEvento = (eventoId) => {
    if (!Array.isArray(convidados)) return [];
    return convidados.filter(c => c?.evento_id === eventoId);
  };

  // Função segura para contar participantes
  const contarParticipantes = (convidadosEvento) => {
    if (!Array.isArray(convidadosEvento)) return 0;
    
    return convidadosEvento.reduce((acc, convidado) => {
      const acompanhantesCount = Array.isArray(convidado.acompanhantes) 
        ? convidado.acompanhantes.length 
        : 0;
      return acc + 1 + acompanhantesCount;
    }, 0);
  };

  useEffect(() => {
    async function fetchDados() {
      setLoading(true);
      try {
        const [eventosRes, convidadosRes] = await Promise.all([
          fetch("http://localhost:5000/api/eventos"),
          fetch("http://localhost:5000/api/convidados"),
        ]);
  
        if (!eventosRes.ok || !convidadosRes.ok) {
          throw new Error("Erro ao buscar dados");
        }
  
        const eventosData = await eventosRes.json();
        const convidadosData = await convidadosRes.json();
  
        setEventos(Array.isArray(eventosData) ? eventosData : []);
        setConvidados(Array.isArray(convidadosData.data) ? convidadosData.data : []);
        
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error(`Erro ao buscar dados: ${error.message}`);
        setEventos([]);
        setConvidados([]);
      } finally {
        setLoading(false);
      }
    }
    fetchDados();
  }, []);

  const handleEdit = (id) => {
    const convidado = convidados.find((c) => c.id === id);
    if (!convidado) return;
    setEditIndex(id);
    setEditData({
      nome: convidado.nome || "",
      telefone: convidado.telefone || "",
      email: convidado.email || "",
      acompanhantes: [...(convidado.acompanhantes || [])],
    });
  };

  const handleDeleteConvidado = async (id) => {
    if (!window.confirm("Tem certeza que deseja remover este convidado?"))
      return;

    try {
      const response = await fetch(`http://localhost:5000/api/convidados/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) throw new Error("Erro ao excluir convidado");
      
      setConvidados((prev) => prev.filter((c) => c.id !== id));
      toast.success("Convidado removido com sucesso!");
    } catch (error) {
      toast.error(`Erro ao excluir convidado: ${error.message}`);
    }
  };

  const handleUpdate = async () => {
    if (!editIndex) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/convidados/${editIndex}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });

      if (!response.ok) throw new Error("Erro ao atualizar convidado");
      
      setConvidados((prev) =>
        prev.map((c) => (c.id === editIndex ? { ...c, ...editData } : c))
      );
      setEditIndex(null);
      toast.success("Convidado atualizado com sucesso!");
    } catch (error) {
      toast.error(`Erro ao atualizar convidado: ${error.message}`);
    }
  };

  const handleDeleteAcompanhante = async (convidadoId, acompanhanteId) => {
    if (!acompanhanteId || isNaN(acompanhanteId) || acompanhanteId <= 0) {
      toast.error("ID do acompanhante inválido");
      return;
    }
  
    try {
      const response = await fetch(
        `http://localhost:5000/api/convidados/acompanhantes/${acompanhanteId}`,
        { 
          method: "DELETE",
          headers: { "Content-Type": "application/json" }
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao excluir acompanhante");
      }
  
      setConvidados(prev => prev.map(c => 
        c.id === convidadoId
          ? {
              ...c,
              acompanhantes: c.acompanhantes.filter(a => a.id !== acompanhanteId)
            }
          : c
      ));
  
      toast.success("Acompanhante removido com sucesso!");
    } catch (error) {
      console.error("Erro na exclusão:", error);
      toast.error(`Falha: ${error.message}`);
    }
  };

  const handleUpdateAcompanhante = async (convidadoId, acompanhanteId, newData) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/convidados/${convidadoId}/acompanhantes/${acompanhanteId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome: newData.nome,
            telefone: newData.telefone || null,
            email: newData.email || null
          })
        }
      );
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || "Erro ao atualizar acompanhante");
      }
  
      setConvidados(prev => prev.map(c => {
        if (c.id !== convidadoId) return c;
        
        return {
          ...c,
          acompanhantes: c.acompanhantes.map(a => 
            a.id === acompanhanteId ? { ...a, ...newData } : a
          )
        };
      }));
  
      setEditingAcompanhante(null);
      toast.success(data.message || "Acompanhante atualizado!");
  
    } catch (error) {
      console.error("Erro na atualização:", error);
      toast.error(error.message);
    }
  };

  const handleAddAcompanhante = () => {
    setEditData((prev) => ({
      ...prev,
      acompanhantes: [...prev.acompanhantes, { nome: "", telefone: "" }],
    }));
  };

  const handleSendWhatsapp = async (convidado) => {
    const linkConfirmacao = `http://localhost:5173/confirmacao/${convidado.id}`;
    const mensagem = `Olá ${convidado.nome}, confirme sua presença no evento acessando este link: ${linkConfirmacao}`;
    const linkWhatsapp = `https://api.whatsapp.com/send?phone=55${
      convidado.telefone
    }&text=${encodeURIComponent(mensagem)}`;

    try {
      const resposta = await fetch(
        `http://localhost:5000/api/convidados/${convidado.id}/confirmar`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (resposta.ok) {
        setConvidados((prev) =>
          prev.map((c) =>
            c.id === convidado.id ? { ...c, confirmado: true } : c
          )
        );
        toast.success("Confirmação enviada via WhatsApp!");
      } else {
        toast.error("Erro ao atualizar a confirmação.");
      }
    } catch (error) {
      toast.error("Erro ao enviar a mensagem.");
    }

    window.open(linkWhatsapp, "_blank");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
        <p className="text-gray-600">Carregando convidados...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8 page-transition">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-blue-600 transition-colors mb-6"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span>Voltar</span>
        </button>

        <div className="flex items-center mb-8">
          <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-medium mr-3">
            Confirmações
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Lista de Convidados
          </h1>
        </div>

        <div className="space-y-8">
          {Array.isArray(eventos) && eventos.map((evento) => {
            const convidadosEvento = getConvidadosPorEvento(evento.id);
            const totalParticipantes = contarParticipantes(convidadosEvento);

            return (
              <div
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md"
                key={evento.id}
              >
                <div className="p-6 border-b border-gray-100">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <CalendarIcon className="h-5 w-5 text-blue-600" />
                      <h3 className="text-xl font-semibold text-gray-900">
                        {evento.nome}
                      </h3>
                    </div>
                    <div className="flex items-center">
                      <div className="flex items-center mr-3 bg-green-100 text-green-600 py-1 px-3 rounded-full text-xs font-medium">
                        <Users className="h-3 w-3 mr-1" />
                        <span>{totalParticipantes} convidados</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  {convidadosEvento.length > 0 ? (
                    <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50/80">
                            <th className="px-6 py-3 text-left font-medium text-gray-600 tracking-wider">
                              Nome
                            </th>
                            <th className="px-6 py-3 text-left font-medium text-gray-600 tracking-wider">
                              Telefone
                            </th>
                            <th className="px-6 py-3 text-left font-medium text-gray-600 tracking-wider">
                              Email
                            </th>
                            <th className="px-6 py-3 text-left font-medium text-gray-600 tracking-wider">
                              Confirmado
                            </th>
                            <th className="px-6 py-3 text-left font-medium text-gray-600 tracking-wider">
                              Acompanhantes
                            </th>
                            <th className="px-6 py-3 text-right font-medium text-gray-600 tracking-wider">
                              Ações
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {convidadosEvento.map((convidado) => (
                            <tr
                              key={convidado.id}
                              className="hover:bg-gray-50/50 transition-colors"
                            >
                              {editIndex === convidado.id ? (
                                <>
                                  <td className="px-6 py-4">
                                    <input
                                      type="text"
                                      name="nome"
                                      value={editData.nome}
                                      onChange={(e) =>
                                        setEditData({
                                          ...editData,
                                          nome: e.target.value,
                                        })
                                      }
                                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                                    />
                                  </td>
                                  <td className="px-6 py-4">
                                    <input
                                      type="text"
                                      name="telefone"
                                      value={editData.telefone}
                                      onChange={(e) =>
                                        setEditData({
                                          ...editData,
                                          telefone: e.target.value,
                                        })
                                      }
                                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                                    />
                                  </td>
                                  <td className="px-6 py-4">
                                    <input
                                      type="email"
                                      name="email"
                                      value={editData.email}
                                      onChange={(e) =>
                                        setEditData({
                                          ...editData,
                                          email: e.target.value,
                                        })
                                      }
                                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                                    />
                                  </td>
                                  <td className="px-6 py-4">
                                    {convidado.confirmado ? (
                                      <span className="text-green-500">
                                        Confirmado
                                      </span>
                                    ) : (
                                      <span className="text-red-500">
                                        Não confirmado
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="space-y-2">
                                      {editData.acompanhantes.map((acompanhante, index) => (
                                        <div
                                          key={index}
                                          className="flex items-center space-x-2 pb-2 border-b border-gray-100"
                                        >
                                          <div className="flex-1 grid grid-cols-2 gap-2">
                                            <input
                                              type="text"
                                              value={acompanhante.nome || ""}
                                              onChange={(e) => {
                                                const updatedAcompanhantes = [...editData.acompanhantes];
                                                updatedAcompanhantes[index] = {
                                                  ...updatedAcompanhantes[index],
                                                  nome: e.target.value,
                                                };
                                                setEditData({
                                                  ...editData,
                                                  acompanhantes: updatedAcompanhantes,
                                                });
                                              }}
                                              placeholder="Nome"
                                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                            />
                                            <input
                                              type="text"
                                              value={acompanhante.telefone || ""}
                                              onChange={(e) => {
                                                const updatedAcompanhantes = [...editData.acompanhantes];
                                                updatedAcompanhantes[index] = {
                                                  ...updatedAcompanhantes[index],
                                                  telefone: e.target.value,
                                                };
                                                setEditData({
                                                  ...editData,
                                                  acompanhantes: updatedAcompanhantes,
                                                });
                                              }}
                                              placeholder="Telefone"
                                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                            />
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const updatedAcompanhantes = [...editData.acompanhantes];
                                              updatedAcompanhantes.splice(index, 1);
                                              setEditData({
                                                ...editData,
                                                acompanhantes: updatedAcompanhantes
                                              });
                                            }}
                                            className="bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200 transition-colors"
                                            title="Remover acompanhante"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>

                                    <button
                                      onClick={handleAddAcompanhante}
                                      className="text-blue-600 mt-2 flex items-center text-sm hover:text-blue-700 transition-colors"
                                    >
                                      <Plus className="h-4 w-4 mr-1" />
                                      Adicionar acompanhante
                                    </button>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <button
                                      onClick={handleUpdate}
                                      className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                      <Check className="h-4 w-4" />
                                    </button>
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="px-6 py-4">
                                    {convidado.nome}
                                  </td>
                                  <td className="px-6 py-4">
                                    {convidado.telefone}
                                  </td>
                                  <td className="px-6 py-4">
                                    {convidado.email}
                                  </td>
                                  <td className="px-6 py-4">
                                    {convidado.confirmado ? (
                                      <span className="text-green-500 font-medium">
                                        Confirmado
                                      </span>
                                    ) : (
                                      <span className="text-red-500 font-medium">
                                        Não confirmado
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4">
                                    {convidado.acompanhantes && convidado.acompanhantes.length > 0 ? (
                                      <div className="space-y-1">
                                        {convidado.acompanhantes.map((acompanhante, index) => (
                                          <div
                                            key={`${acompanhante.id}-${index}`}
                                            className="flex items-center justify-between text-sm text-gray-700 bg-gray-50 p-2 rounded-lg"
                                          >
                                            {editingAcompanhante === `${convidado.id}-${acompanhante.id}` ? (
                                              <>
                                                <div className="flex-1 grid grid-cols-2 gap-2">
                                                  <input
                                                    type="text"
                                                    value={acompanhante.nome || ""}
                                                    onChange={(e) => {
                                                      const updatedConvidados = [...convidados];
                                                      const convidadoIndex = updatedConvidados.findIndex(c => c.id === convidado.id);
                                                      updatedConvidados[convidadoIndex].acompanhantes[index].nome = e.target.value;
                                                      setConvidados(updatedConvidados);
                                                    }}
                                                    placeholder="Nome"
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                                  />
                                                  <input
                                                    type="text"
                                                    value={acompanhante.telefone || ""}
                                                    onChange={(e) => {
                                                      const updatedConvidados = [...convidados];
                                                      const convidadoIndex = updatedConvidados.findIndex(c => c.id === convidado.id);
                                                      updatedConvidados[convidadoIndex].acompanhantes[index].telefone = e.target.value;
                                                      setConvidados(updatedConvidados);
                                                    }}
                                                    placeholder="Telefone"
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                                  />
                                                </div>
                                                <div className="flex items-center space-x-1 ml-2">
                                                  <button
                                                    onClick={() => {
                                                      handleUpdateAcompanhante(
                                                        convidado.id,
                                                        acompanhante.id,
                                                        acompanhante
                                                      );
                                                    }}
                                                    className="bg-green-100 text-green-600 p-1.5 rounded-full hover:bg-green-200 transition-colors"
                                                  >
                                                    <Check className="h-3.5 w-3.5" />
                                                  </button>
                                                  <button
                                                    onClick={() => setEditingAcompanhante(null)}
                                                    className="bg-gray-100 text-gray-600 p-1.5 rounded-full hover:bg-gray-200 transition-colors"
                                                  >
                                                    <X className="h-3.5 w-3.5" />
                                                  </button>
                                                </div>
                                              </>
                                            ) : (
                                              <>
                                                <div>
                                                  <span className="font-medium">{acompanhante.nome}</span>
                                                  {acompanhante.telefone && (
                                                    <span className="text-gray-500 ml-2">
                                                      {acompanhante.telefone}
                                                    </span>
                                                  )}
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                  <button
                                                    onClick={() => setEditingAcompanhante(`${convidado.id}-${acompanhante.id}`)}
                                                    className="text-blue-600 p-1 rounded-full hover:bg-blue-50 transition-colors"
                                                  >
                                                    <Edit className="h-3.5 w-3.5" />
                                                  </button>
                                                  <button
                                                    onClick={() => {
                                                      if (window.confirm(`Remover ${acompanhante.nome}?`)) {
                                                        handleDeleteAcompanhante(convidado.id, acompanhante.id);
                                                      }
                                                    }}
                                                    className="text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors"
                                                  >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                  </button>
                                                </div>
                                              </>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-sm text-gray-400">
                                        Sem acompanhantes
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 text-right whitespace-nowrap">
                                    <div className="flex justify-end space-x-2">
                                      <button
                                        onClick={() => handleSendWhatsapp(convidado)}
                                        className="text-green-600 p-1.5 rounded-full hover:bg-green-50 transition-colors"
                                        title="Enviar WhatsApp"
                                      >
                                        <Send className="h-5 w-5" />
                                      </button>
                                      <button
                                        onClick={() => handleEdit(convidado.id)}
                                        className="text-blue-600 p-1.5 rounded-full hover:bg-blue-50 transition-colors"
                                        title="Editar convidado"
                                      >
                                        <Edit className="h-5 w-5" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteConvidado(convidado.id)}
                                        className="text-red-600 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                                        title="Remover convidado"
                                      >
                                        <Trash2 className="h-5 w-5" />
                                      </button>
                                    </div>
                                  </td>
                                </>
                              )}
                            </tr>
                          ))}
                        </tbody>
                        </table>
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      Nenhum convidado encontrado para este evento.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Confirmacao;