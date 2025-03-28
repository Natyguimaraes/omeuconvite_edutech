import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  User,
  UserPlus,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

const Confirmacao = () => {
  const navigate = useNavigate();
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

  // Configuração base da API
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const apiEventos = `${baseUrl}/api/eventos`;
  const apiConvidados = `${baseUrl}/api/convidados`;

  const getConvidadosPorEvento = (eventoId) => {
    if (!Array.isArray(convidados)) return [];
    return convidados.filter((c) => c?.evento_id === eventoId);
  };

  const contarParticipantes = (convidadosEvento) => {
    if (!Array.isArray(convidadosEvento)) return 0;
    return convidadosEvento.reduce((acc, convidado) => {
      const acompanhantesCount = Array.isArray(convidado.acompanhantes)
        ? convidado.acompanhantes.length
        : 0;
      return acc + 1 + acompanhantesCount;
    }, 0);
  };

  const contarConfirmados = (convidadosEvento) => {
    if (!Array.isArray(convidadosEvento)) return 0;
    
    let count = 0;
    convidadosEvento.forEach(convidado => {
      if (convidado.confirmado) count++;
      if (Array.isArray(convidado.acompanhantes)) {
        count += convidado.acompanhantes.filter(a => a.confirmado).length;
      }
    });
    return count;
  };

  useEffect(() => {
    async function fetchDados() {
      setLoading(true);
      try {
        const [eventosRes, convidadosRes] = await Promise.all([
          fetch(apiEventos),
          fetch(apiConvidados),
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
  }, [apiEventos, apiConvidados]);

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
      const response = await fetch(`${apiConvidados}/${id}`, {
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
      const response = await fetch(`${apiConvidados}/${editIndex}`, {
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
        `${apiConvidados}/acompanhantes/${acompanhanteId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao excluir acompanhante");
      }

      setConvidados((prev) =>
        prev.map((c) =>
          c.id === convidadoId
            ? {
                ...c,
                acompanhantes: c.acompanhantes.filter(
                  (a) => a.id !== acompanhanteId
                ),
              }
            : c
        )
      );

      toast.success("Acompanhante removido com sucesso!");
    } catch (error) {
      console.error("Erro na exclusão:", error);
      toast.error(`Falha: ${error.message}`);
    }
  };

  const handleUpdateAcompanhante = async (
    convidadoId,
    acompanhanteId,
    newData
  ) => {
    try {
      const response = await fetch(
        `${apiConvidados}/${convidadoId}/acompanhantes/${acompanhanteId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome: newData.nome,
            telefone: newData.telefone || null,
            email: newData.email || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao atualizar acompanhante");
      }

      setConvidados((prev) =>
        prev.map((c) => {
          if (c.id !== convidadoId) return c;

          return {
            ...c,
            acompanhantes: c.acompanhantes.map((a) =>
              a.id === acompanhanteId ? { ...a, ...newData } : a
            ),
          };
        })
      );

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
    const frontendUrl =
      import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173";
    const linkConfirmacao = `${frontendUrl}/confirmacao/${convidado.id}`;
    const mensagem = `Olá ${convidado.nome}, confirme sua presença no evento acessando este link: ${linkConfirmacao}`;
    const linkWhatsapp = `https://api.whatsapp.com/send?phone=55${
      convidado.telefone
    }&text=${encodeURIComponent(mensagem)}`;

    try {
      const resposta = await fetch(`${apiConvidados}/${convidado.id}/confirmar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

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

  const toggleConfirmacao = async (convidadoId, acompanhanteId = null) => {
    try {
      let url;
      let body;

      if (acompanhanteId) {
        url = `${apiConvidados}/${convidadoId}/acompanhantes/${acompanhanteId}/confirmar`;
        body = {};
      } else {
        url = `${apiConvidados}/${convidadoId}/confirmar`;
        body = {};
      }

      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Erro ao atualizar confirmação");

      setConvidados((prev) =>
        prev.map((c) => {
          if (c.id !== convidadoId) return c;

          if (acompanhanteId) {
            return {
              ...c,
              acompanhantes: c.acompanhantes.map((a) =>
                a.id === acompanhanteId
                  ? { ...a, confirmado: !a.confirmado }
                  : a
              ),
            };
          } else {
            return { ...c, confirmado: !c.confirmado };
          }
        })
      );

      toast.success("Status atualizado com sucesso!");
    } catch (error) {
      toast.error(`Erro: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
        <p className="text-gray-600">Carregando convidados...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors mb-6"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span>Voltar</span>
        </button>

        <div className="flex items-center mb-8">
          <div className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-xs font-medium mr-3">
            Confirmações
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
            Lista de Convidados
          </h1>
        </div>

        <div className="space-y-6">
          {Array.isArray(eventos) &&
            eventos.map((evento) => {
              const convidadosEvento = getConvidadosPorEvento(evento.id);
              const totalParticipantes = contarParticipantes(convidadosEvento);
              const totalConfirmados = contarConfirmados(convidadosEvento);

              return (
                <div
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                  key={evento.id}
                >
                  <div className="p-4 md:p-6 border-b border-gray-100">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-indigo-100 p-2 rounded-lg">
                          <CalendarIcon className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                            {evento.nome}
                          </h3>
                          <p className="text-xs md:text-sm text-gray-500">
                            {new Date(evento.data_evento).toLocaleDateString(
                              "pt-BR",
                              {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center bg-indigo-50 text-indigo-600 py-1 px-3 rounded-full text-xs font-medium self-start md:self-auto">
                        <Users className="h-3 w-3 mr-1" />
                        <span>
                          {totalConfirmados}/{totalParticipantes} confirmados
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    {convidadosEvento.length > 0 ? (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-4 py-3 text-left font-medium text-gray-600 tracking-wider w-12">
                              👤
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-gray-600 tracking-wider">
                              Convidado
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-gray-600 tracking-wider hidden sm:table-cell">
                              Contato
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-gray-600 tracking-wider">
                              Status
                            </th>
                            <th className="px-4 py-3 text-right font-medium text-gray-600 tracking-wider">
                              Ações
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {(() => {
                            let globalIndex = 0;
                            return convidadosEvento.map((convidado) => {
                              globalIndex++;
                              const isEditing = editIndex === convidado.id;
                              
                              return (
                                <>
                                  <tr
                                    key={convidado.id}
                                    className="hover:bg-gray-50/50 transition-colors"
                                  >
                                    {isEditing ? (
                                      <td className="px-4 py-4" colSpan={5}>
                                        <div className="space-y-4">
                                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div>
                                              <label className="block text-xs font-medium text-gray-500 mb-1">
                                                Nome
                                              </label>
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
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                              />
                                            </div>
                                            <div>
                                              <label className="block text-xs font-medium text-gray-500 mb-1">
                                                Telefone
                                              </label>
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
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                              />
                                            </div>
                                            <div>
                                              <label className="block text-xs font-medium text-gray-500 mb-1">
                                                Email
                                              </label>
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
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                              />
                                            </div>
                                          </div>

                                          <div>
                                            <div className="flex justify-between items-center mb-2">
                                              <label className="block text-xs font-medium text-gray-500">
                                                Acompanhantes
                                              </label>
                                              <button
                                                onClick={handleAddAcompanhante}
                                                className="text-indigo-600 flex items-center text-xs hover:text-indigo-700 transition-colors"
                                              >
                                                <Plus className="h-3 w-3 mr-1" />
                                                Adicionar
                                              </button>
                                            </div>
                                            <div className="space-y-2">
                                              {editData.acompanhantes.map(
                                                (acompanhante, index) => (
                                                  <div
                                                    key={index}
                                                    className="flex items-center space-x-2 pb-2 border-b border-gray-100"
                                                  >
                                                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                      <input
                                                        type="text"
                                                        value={
                                                          acompanhante.nome || ""
                                                        }
                                                        onChange={(e) => {
                                                          const updatedAcompanhantes =
                                                            [
                                                              ...editData.acompanhantes,
                                                            ];
                                                          updatedAcompanhantes[
                                                            index
                                                          ] = {
                                                            ...updatedAcompanhantes[
                                                              index
                                                            ],
                                                            nome: e.target.value,
                                                          };
                                                          setEditData({
                                                            ...editData,
                                                            acompanhantes:
                                                              updatedAcompanhantes,
                                                          });
                                                        }}
                                                        placeholder="Nome"
                                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                                      />
                                                      <input
                                                        type="text"
                                                        value={
                                                          acompanhante.telefone ||
                                                          ""
                                                        }
                                                        onChange={(e) => {
                                                          const updatedAcompanhantes =
                                                            [
                                                              ...editData.acompanhantes,
                                                            ];
                                                          updatedAcompanhantes[
                                                            index
                                                          ] = {
                                                            ...updatedAcompanhantes[
                                                              index
                                                            ],
                                                            telefone:
                                                              e.target.value,
                                                          };
                                                          setEditData({
                                                            ...editData,
                                                            acompanhantes:
                                                              updatedAcompanhantes,
                                                          });
                                                        }}
                                                        placeholder="Telefone"
                                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                                      />
                                                    </div>
                                                    <button
                                                      type="button"
                                                      onClick={() => {
                                                        const updatedAcompanhantes =
                                                          [
                                                            ...editData.acompanhantes,
                                                          ];
                                                        updatedAcompanhantes.splice(
                                                          index,
                                                          1
                                                        );
                                                        setEditData({
                                                          ...editData,
                                                          acompanhantes:
                                                            updatedAcompanhantes,
                                                        });
                                                      }}
                                                      className="bg-red-100 text-red-600 p-1.5 rounded-full hover:bg-red-200 transition-colors"
                                                      title="Remover acompanhante"
                                                    >
                                                      <Trash2 className="h-3 w-3" />
                                                    </button>
                                                  </div>
                                                )
                                              )}
                                            </div>
                                          </div>

                                          <div className="flex justify-end space-x-2 pt-2">
                                            <button
                                              onClick={() => setEditIndex(null)}
                                              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                              Cancelar
                                            </button>
                                            <button
                                              onClick={handleUpdate}
                                              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                            >
                                              Salvar
                                            </button>
                                          </div>
                                        </div>
                                      </td>
                                    ) : (
                                      <>
                                        <td className="px-4 py-4">
                                          <div className="flex justify-center">
                                            <span className="bg-indigo-100 text-indigo-600 font-medium rounded-full h-6 w-6 flex items-center justify-center text-xs">
                                              {globalIndex}
                                            </span>
                                          </div>
                                        </td>
                                        <td className="px-4 py-4">
                                          <div className="flex items-center">
                                            <div className="bg-indigo-100 p-2 rounded-full mr-3">
                                              <User className="h-4 w-4 text-indigo-600" />
                                            </div>
                                            <div>
                                              <div className="font-medium text-gray-900">
                                                {convidado.nome}
                                              </div>
                                              <div className="text-xs text-gray-500 mt-1 sm:hidden">
                                                {convidado.telefone}
                                              </div>
                                            </div>
                                          </div>
                                        </td>
                                        <td className="px-4 py-4 hidden sm:table-cell">
                                          <div className="text-gray-700">
                                            {convidado.telefone}
                                          </div>
                                        </td>
                                        <td className="px-4 py-4">
                                          <button
                                            onClick={() =>
                                              toggleConfirmacao(convidado.id)
                                            }
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                              convidado.confirmado
                                                ? "bg-green-100 text-green-800"
                                                : "bg-red-100 text-red-800"
                                            }`}
                                          >
                                            {convidado.confirmado ? (
                                              <>
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                Confirmado
                                              </>
                                            ) : (
                                              <>
                                                <XCircle className="h-3 w-3 mr-1" />
                                                Pendente
                                              </>
                                            )}
                                          </button>
                                        </td>
                                        <td className="px-4 py-4 text-right whitespace-nowrap">
                                          <div className="flex justify-end space-x-1">
                                            <button
                                              onClick={() =>
                                                handleSendWhatsapp(convidado)
                                              }
                                              className="text-green-600 p-1.5 rounded-full hover:bg-green-50 transition-colors"
                                              title="Enviar WhatsApp"
                                            >
                                              <Send className="h-4 w-4" />
                                            </button>
                                            <button
                                              onClick={() => handleEdit(convidado.id)}
                                              className="text-indigo-600 p-1.5 rounded-full hover:bg-indigo-50 transition-colors"
                                              title="Editar convidado"
                                            >
                                              <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                              onClick={() =>
                                                handleDeleteConvidado(convidado.id)
                                              }
                                              className="text-red-600 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                                              title="Remover convidado"
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </button>
                                          </div>
                                        </td>
                                      </>
                                    )}
                                  </tr>

                                  {/* Acompanhantes */}
                                  {convidado.acompanhantes?.map((acompanhante) => {
                                    globalIndex++;
                                    const isEditingAcomp = editingAcompanhante === `${convidado.id}-${acompanhante.id}`;
                                    
                                    return (
                                      <tr
                                        key={`${convidado.id}-${acompanhante.id}`}
                                        className="bg-gray-50 hover:bg-gray-100/50 transition-colors"
                                      >
                                        <td className="px-4 py-3">
                                          <div className="flex justify-center">
                                            <span className="bg-purple-100 text-purple-600 font-medium rounded-full h-6 w-6 flex items-center justify-center text-xs">
                                              {globalIndex}
                                            </span>
                                          </div>
                                        </td>
                                        <td className="px-4 py-3">
                                          {isEditingAcomp ? (
                                            <input
                                              type="text"
                                              value={acompanhante.nome}
                                              onChange={(e) => {
                                                const updatedConvidados = [...convidados];
                                                const convidadoIndex = updatedConvidados.findIndex(
                                                  (c) => c.id === convidado.id
                                                );
                                                const acompanhanteIndex = updatedConvidados[
                                                  convidadoIndex
                                                ].acompanhantes.findIndex(
                                                  (a) => a.id === acompanhante.id
                                                );
                                                updatedConvidados[convidadoIndex].acompanhantes[
                                                  acompanhanteIndex
                                                ].nome = e.target.value;
                                                setConvidados(updatedConvidados);
                                              }}
                                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                            />
                                          ) : (
                                            <div className="flex items-center pl-8 md:pl-10">
                                              <div className="bg-purple-100 p-2 rounded-full mr-3">
                                                <UserPlus className="h-4 w-4 text-purple-600" />
                                              </div>
                                              <div>
                                                <div className="font-medium text-gray-900">
                                                  {acompanhante.nome}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1 sm:hidden">
                                                  {acompanhante.telefone}
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </td>
                                        <td className="px-4 py-3 hidden sm:table-cell">
                                          {isEditingAcomp ? (
                                            <input
                                              type="text"
                                              value={acompanhante.telefone}
                                              onChange={(e) => {
                                                const updatedConvidados = [...convidados];
                                                const convidadoIndex = updatedConvidados.findIndex(
                                                  (c) => c.id === convidado.id
                                                );
                                                const acompanhanteIndex = updatedConvidados[
                                                  convidadoIndex
                                                ].acompanhantes.findIndex(
                                                  (a) => a.id === acompanhante.id
                                                );
                                                updatedConvidados[convidadoIndex].acompanhantes[
                                                  acompanhanteIndex
                                                ].telefone = e.target.value;
                                                setConvidados(updatedConvidados);
                                              }}
                                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                            />
                                          ) : (
                                            <div className="text-gray-700">
                                              {acompanhante.telefone}
                                            </div>
                                          )}
                                        </td>
                                        <td className="px-4 py-3">
                                          <button
                                            onClick={() =>
                                              toggleConfirmacao(
                                                convidado.id,
                                                acompanhante.id
                                              )
                                            }
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                              acompanhante.confirmado
                                                ? "bg-green-100 text-green-800"
                                                : "bg-red-100 text-red-800"
                                            }`}
                                          >
                                            {acompanhante.confirmado ? (
                                              <>
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                Confirmado
                                              </>
                                            ) : (
                                              <>
                                                <XCircle className="h-3 w-3 mr-1" />
                                                Pendente
                                              </>
                                            )}
                                          </button>
                                        </td>
                                        <td className="px-4 py-3 text-right whitespace-nowrap">
                                          <div className="flex justify-end space-x-1">
                                            {isEditingAcomp ? (
                                              <>
                                                <button
                                                  onClick={() => {
                                                    handleUpdateAcompanhante(
                                                      convidado.id,
                                                      acompanhante.id,
                                                      acompanhante
                                                    );
                                                  }}
                                                  className="text-green-600 p-1.5 rounded-full hover:bg-green-50 transition-colors"
                                                >
                                                  <Check className="h-4 w-4" />
                                                </button>
                                                <button
                                                  onClick={() => setEditingAcompanhante(null)}
                                                  className="text-gray-600 p-1.5 rounded-full hover:bg-gray-50 transition-colors"
                                                >
                                                  <X className="h-4 w-4" />
                                                </button>
                                              </>
                                            ) : (
                                              <>
                                                <button
                                                  onClick={() =>
                                                    setEditingAcompanhante(
                                                      `${convidado.id}-${acompanhante.id}`
                                                    )
                                                  }
                                                  className="text-indigo-600 p-1.5 rounded-full hover:bg-indigo-50 transition-colors"
                                                  title="Editar acompanhante"
                                                >
                                                  <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                  onClick={() => {
                                                    if (
                                                      window.confirm(
                                                        `Remover ${acompanhante.nome}?`
                                                      )
                                                    ) {
                                                      handleDeleteAcompanhante(
                                                        convidado.id,
                                                        acompanhante.id
                                                      );
                                                    }
                                                  }}
                                                  className="text-red-600 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                                                  title="Remover acompanhante"
                                                >
                                                  <Trash2 className="h-4 w-4" />
                                                </button>
                                              </>
                                            )}
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </>
                              );
                            });
                          })()}
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