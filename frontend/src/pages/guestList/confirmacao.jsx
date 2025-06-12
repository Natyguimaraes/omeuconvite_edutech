import React from "react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import {
  Check,
  Trash2,
  Edit,
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
import { FaWhatsapp } from "react-icons/fa";
import { toast } from "sonner";
import BadgeConvidadoStatus from "../../components/BadgeConvidadoStatus";
import QRCodeScanButton from "../../components/qrcode/QrCodeButon";
import GuestActions from "../../components/pageList/GuestFilters";
import { formatPhoneNumber, isValidPhoneNumber } from "../../utils/phoneUtils";
import GuestSearchAdd from "../../components/pageList/buscaConvidado";
import PrintList from "../../components/pageList/printList";

const Confirmacao = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const eventoIdFromQuery = searchParams.get("eventoId");
  const eventoId = eventoIdFromQuery || sessionStorage.getItem("eventoId");

  useEffect(() => {
    if (eventoIdFromQuery) {
      sessionStorage.setItem("eventoId", eventoIdFromQuery);
    }
  }, [eventoIdFromQuery]);

  const [filters, setFilters] = useState(() => {
    const savedFilters = localStorage.getItem("convidadosFilters");
    return savedFilters
      ? JSON.parse(savedFilters)
      : {
          status: "all",
          searchName: "",
        };
  });

  const [eventos, setEventos] = useState([]);
  const [convidados, setConvidados] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editIndex, setEditIndex] = useState(null);
  const [editData, setEditData] = useState({
    nome: "",
    telefone: "",
    email: "",
    limite_acompanhante: 0,
    acompanhantes: [],
  });
  const [acompanhantesToDelete, setAcompanhantesToDelete] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [addingGuest, setAddingGuest] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGuest, setNewGuest] = useState({
    nome: "",
    telefone: "",
    email: "",
    limite_acompanhante: 0,
    evento_id: eventoId || "",
  });

  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const apiEventos = `${baseUrl}/api/eventos`;
  const apiConvidados = `${baseUrl}/api/convidados`;

  useEffect(() => {
    localStorage.setItem("convidadosFilters", JSON.stringify(filters));
  }, [filters]);

  const getConvidadosPorEvento = (currentEventoId) => {
    if (!Array.isArray(convidados)) {
      console.warn("convidados is not an array", convidados);
      return [];
    }

    const eventoIdNum = parseInt(currentEventoId);

    return convidados
      .filter((convidado) => {
        const eventosConvidado = Array.isArray(convidado?.eventos)
          ? convidado.eventos
          : [];
        return eventosConvidado.some((evento) => evento?.id === eventoIdNum);
      })
      .map((convidado) => {
        const eventosConvidado = Array.isArray(convidado.eventos)
          ? convidado.eventos
          : [];

        const eventoRelacao = eventosConvidado.find(
          (e) => e?.id === eventoIdNum
        );

        // Filtra acompanhantes que pertencem a este convidado E a este evento
        const acompanhantesDoEvento = Array.isArray(convidado.acompanhantes)
          ? convidado.acompanhantes.filter(
              (a) =>
                Number(a.convidado_evento_evento_id) === eventoIdNum &&
                Number(a.convidado_evento_convidado_id) === convidado.id
            )
          : [];

        return {
          ...convidado,
          confirmado: Number(eventoRelacao?.confirmado) === 1,
          presente: Number(eventoRelacao?.token_usado) === 1,
          limite_acompanhante: Number(eventoRelacao?.limite_acompanhante) || 0,
          acompanhantes: acompanhantesDoEvento.map((a) => ({
            ...a,
            presente: Number(a.token_usado) === 1,
            confirmado: Number(a.confirmado) === 1,
          })),
        };
      });
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
    convidadosEvento.forEach((convidado) => {
      if (convidado.confirmado) count++;
      if (Array.isArray(convidado.acompanhantes)) {
        count += convidado.acompanhantes.filter((a) => a.confirmado).length;
      }
    });
    return count;
  };

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      return;
    }

    const term = searchTerm.toLowerCase();

    const results = convidados.filter((c) => {
      const nomeMatch = c.nome.toLowerCase().includes(term);
      const estaNoEventoAtual = c.eventos?.some(
        (e) => e.id === parseInt(eventoId)
      );

      return nomeMatch && !estaNoEventoAtual;
    });

    setSearchResults(results);
  }, [searchTerm, convidados, eventoId]);

  const handleAddToEvent = async (convidado) => {
    setAddingGuest(true);
    try {
      const response = await fetch(
        `${apiConvidados}/${convidado.id}/eventos/${eventoId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            limite_acompanhante:
              Number(convidado.limite_acompanhante) ||
              Number(convidado.limite_padrao) ||
              0,
            confirmado: false,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao adicionar convidado ao evento");
      }

      fetchDados();
      toast.success(`${convidado.nome} adicionado ao evento com sucesso!`);
      setSearchTerm("");
      setSearchResults([]);
    } catch (error) {
      console.error("Erro ao adicionar:", error);
      toast.error(error.message);
    } finally {
      setAddingGuest(false);
    }
  };

  const handleNewGuestChange = (e) => {
    const { name, value } = e.target;

    if (name === "telefone") {
      setNewGuest((prev) => ({
        ...prev,
        [name]: formatPhoneNumber(value),
      }));
    } else {
      setNewGuest((prev) => ({
        ...prev,
        [name]: name === "limite_acompanhante" ? Math.max(0, parseInt(value) || 0) : value,
      }));
    }
  };

  const handleAddNewGuest = async () => {
    if (!newGuest.nome.trim()) {
      toast.error("O nome do convidado é obrigatório");
      return;
    }

    const phoneDigits = newGuest.telefone.replace(/\D/g, "");
    if (!isValidPhoneNumber(newGuest.telefone)) {
      toast.error("Por favor, insira um telefone válido com DDD (10 ou 11 dígitos)");
      return;
    }

    if (!eventoId && !newGuest.evento_id) {
      toast.error("Selecione um evento para o convidado");
      return;
    }

    setAddingGuest(true);

    try {
      const convidadoData = {
        nome: newGuest.nome.trim(),
        telefone: phoneDigits,
        email: newGuest.email.trim() || null,
        limite_acompanhante: Number(newGuest.limite_acompanhante) || 0,
        evento_id: parseInt(eventoId || newGuest.evento_id),
        // administrador_id: localStorage.getItem('adminId'), // Se você tiver um adminId no frontend
      };

      const response = await fetch(apiConvidados, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(convidadoData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao cadastrar convidado");
      }

      await fetchDados();

      toast.success(`${newGuest.nome} cadastrado com sucesso!`);
      setShowAddForm(false);
      setNewGuest({
        nome: "",
        telefone: "",
        email: "",
        limite_acompanhante: 0,
        evento_id: eventoId || "",
      });
    } catch (error) {
      console.error("Erro no cadastro:", error);
      toast.error(error.message || "Erro ao cadastrar convidado");
    } finally {
      setAddingGuest(false);
    }
  };

  const handleUpdate = async () => {
    if (!editIndex) return;

    try {
      setLoading(true);

      const payload = {
        nome: editData.nome,
        telefone: formatPhoneNumber(editData.telefone).replace(/\D/g, ''),
        email: editData.email,
        limite_acompanhante: editData.limite_acompanhante,
        eventoId: parseInt(eventoId), // Para atualizar a relação convidado_evento
        acompanhantes: editData.acompanhantes.map((a) => ({
          id: a.id,
          nome: a.nome,
          telefone: formatPhoneNumber(a.telefone || '').replace(/\D/g, ''),
          email: a.email || null,
          confirmado: a.confirmado,
          convidado_evento_convidado_id: editIndex,
          convidado_evento_evento_id: parseInt(eventoId),
        })),
        acompanhantes_to_delete: acompanhantesToDelete,
      };

      const response = await fetch(`${apiConvidados}/${editIndex}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao atualizar convidado");
      }

      await fetchDados();
      setEditIndex(null);
      setAcompanhantesToDelete([]);
      toast.success("Convidado e acompanhantes atualizados com sucesso!");
    } catch (error) {
      console.error("Erro na atualização:", error);
      toast.error(`Falha ao atualizar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const adminId = localStorage.getItem("adminId");

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

      const eventosProcessados = Array.isArray(eventosData)
        ? eventosData
            .filter((e) => (adminId ? e.administrador_id == adminId : true))
            .map((e) => ({
              ...e,
              id: Number(e.id),
              data_evento: e.data_evento || new Date().toISOString(),
            }))
        : [];

      setEventos(eventosProcessados);

      const convidadosProcessados = Array.isArray(convidadosData.data)
        ? convidadosData.data.map((c) => ({
            id: c.id,
            nome: c.nome,
            telefone: formatPhoneNumber(c.telefone),
            email: c.email,
            limite_acompanhante: c.limite_acompanhante,
            ativo_convidado: c.ativo_convidado,
            administrador_id: c.administrador_id,
            eventos: Array.isArray(c.eventos)
              ? c.eventos
              : c.eventos_json // Se vier como JSON string, parseie
              ? JSON.parse(c.eventos_json)
              : [],
            acompanhantes: Array.isArray(c.acompanhantes)
              ? c.acompanhantes
              : c.acompanhantes_json // Se vier como JSON string, parseie
              ? JSON.parse(c.acompanhantes_json)
              : [],
          }))
        : [];

      setConvidados(convidadosProcessados);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error(`Erro ao buscar dados: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDados();
  }, [adminId]);

  const handleEdit = (id) => {
    const convidado = convidados.find((c) => c.id === id);
    if (!convidado) return;

    setEditIndex(id);
    setEditData({
      nome: convidado.nome || "",
      telefone: convidado.telefone || "",
      email: convidado.email || "",
      limite_acompanhante:
        convidado.eventos?.find((e) => e.id === parseInt(eventoId))
          ?.limite_acompanhante || 0,
      acompanhantes: [...(convidado.acompanhantes || [])],
    });
    setAcompanhantesToDelete([]);
  };

  const handleDeleteConvidado = async (id) => {
    if (
      !window.confirm("Tem certeza que deseja remover este convidado do evento?")
    )
      return;

    try {
      const response = await fetch(
        `${apiConvidados}/${id}/eventos/${eventoId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao remover convidado do evento");
      }

      await fetchDados();
      toast.success("Convidado removido do evento com sucesso!");
    } catch (error) {
      toast.error(`Erro ao remover convidado: ${error.message}`);
    }
  };

  const handleDeleteAcompanhanteFromEditData = (acompanhanteId, index) => {
    setEditData((prevEditData) => {
      const updatedAcompanhantes = prevEditData.acompanhantes.filter(
        (_, i) => i !== index
      );

      if (acompanhanteId) {
        setAcompanhantesToDelete((prev) => [...prev, acompanhanteId]);
      }

      return {
        ...prevEditData,
        acompanhantes: updatedAcompanhantes,
      };
    });
    toast.info("Acompanhante marcado para exclusão (será removido ao salvar)");
  };

  const handleAddAcompanhante = () => {
    if (editData.acompanhantes.length >= (editData.limite_acompanhante || 0)) {
      toast.error(`Limite de ${editData.limite_acompanhante} acompanhantes atingido`);
      return;
    }

    const convidadoEmEdicao = convidados.find((c) => c.id === editIndex);
    const statusConvidadoPrincipal =
      convidadoEmEdicao?.eventos?.find((e) => e.id === parseInt(eventoId))
        ?.confirmado || 0;

    const novoAcompanhante = {
      nome: "",
      telefone: "",
      email: "",
      confirmado: statusConvidadoPrincipal,
      convidado_evento_convidado_id: editIndex,
      convidado_evento_evento_id: parseInt(eventoId),
    };

    setEditData((prev) => ({
      ...prev,
      acompanhantes: [...prev.acompanhantes, novoAcompanhante],
    }));
  };

  const handleSendWhatsapp = async (convidado) => {
    const frontendUrl = import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173";
    const linkConfirmacao = `${frontendUrl}/convite/${convidado.id}?eventoId=${eventoId}`;

    const evento = eventos.find((e) => e.id === parseInt(eventoId));
    const mensagem = `${convidado.nome}! ${
      evento?.mensagem_whatsapp || "Você está convidado para nosso evento!"
    }: ${linkConfirmacao}`;

    const linkWhatsapp = `https://api.whatsapp.com/send?phone=55${convidado.telefone.replace(/\D/g, '')}&text=${encodeURIComponent(
      mensagem
    )}`;

    try {
      const resposta = await fetch(
        `${apiConvidados}/${convidado.id}/eventos/${eventoId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ confirmado: 1 }),
        }
      );

      if (!resposta.ok) {
        const errorData = await resposta.json();
        throw new Error(errorData.message || "Erro ao atualizar a confirmação");
      }

      await fetchDados();
      toast.success("Confirmação enviada via WhatsApp!");
    } catch (error) {
      toast.error(`Erro ao enviar a mensagem: ${error.message}`);
      console.error("Erro ao enviar whatsapp/confirmar:", error);
    }

    window.open(linkWhatsapp, "_blank");
  };

  const toggleConfirmacao = async (convidadoId, acompanhanteId = null) => {
    try {
      let url;
      let currentStatus;
      let bodyData = {};

      if (!acompanhanteId) {
        const convidado = convidados.find((c) => c.id === convidadoId);
        currentStatus = convidado.eventos?.find(
          (e) => e.id === parseInt(eventoId)
        )?.confirmado;
        url = `${apiConvidados}/${convidadoId}/eventos/${eventoId}`;
        bodyData = { confirmado: currentStatus === 1 ? 0 : 1 };
      } else {
        const convidado = convidados.find((c) => c.id === convidadoId);
        const acompanhante = convidado.acompanhantes.find(
          (a) => a.id === acompanhanteId
        );
        currentStatus = acompanhante.confirmado;
        url = `${apiConvidados}/acompanhantes/${acompanhanteId}`;
        bodyData = { confirmado: currentStatus === 1 ? 0 : 1 };
      }

      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao atualizar confirmação");
      }

      await fetchDados();
      toast.success("Status de confirmação atualizado com sucesso!");
    } catch (error) {
      toast.error(`Erro: ${error.message}`);
    }
  };

  const togglePresenca = async (convidadoId, acompanhanteId = null) => {
    try {
      let url;
      if (!acompanhanteId) {
        url = `${apiConvidados}/${convidadoId}/eventos/${eventoId}/presenca`;
      } else {
        url = `${apiConvidados}/acompanhantes/${acompanhanteId}/presenca`;
      }

      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao atualizar presença");
      }

      await fetchDados();

      toast.success("Presença atualizada com sucesso!");
    } catch (error) {
      toast.error(`Erro: ${error.message}`);
    }
  };

  const aplicarFiltros = (convidadosDoEvento) => {
    if (!Array.isArray(convidadosDoEvento)) return [];

    return convidadosDoEvento.filter((convidado) => {
      const convidadoEventoRelacao = convidado.eventos?.find(
        (e) => e.id === parseInt(eventoId)
      );
      const confirmadoNoEvento = convidadoEventoRelacao?.confirmado;

      if (filters.status === "confirmed" && confirmadoNoEvento !== true) {
        return false;
      }
      if (filters.status === "pending" && confirmadoNoEvento !== false) {
        return false;
      }
      if (filters.status === "present" && !convidado.presente) {
        return false;
      }
      if (filters.status === "absent" && convidado.presente) {
        return false;
      }

      if (filters.searchName) {
        const searchTermLower = filters.searchName.toLowerCase();
        const nomeMatch = convidado.nome
          ?.toLowerCase()
          ?.includes(searchTermLower);
        const acompanhanteMatch = convidado.acompanhantes?.some((a) =>
          a.nome?.toLowerCase()?.includes(searchTermLower)
        );

        if (!nomeMatch && !acompanhanteMatch) {
          return false;
        }
      }

      return true;
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
        <p className="text-gray-600">Carregando convidados...</p>
      </div>
    );
  }

  // Novo contador global para as linhas da tabela
  let globalIndex = 0;

  return (
    <>
      <div className="min-h-screen bg-white py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-indigo-100 hover:text-indigo-700 transition-all shadow-sm mb-6 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span>Voltar</span>
            </button>

            <div className="flex items-center gap-2">
              <QRCodeScanButton onScan={(data) => console.log("QR Lido:", data)} />
            </div>
          </div>

          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight mt-2 sm:mt-0">
              Lista de{" "}
              <span className="bg-gradient-to-br from-indigo-600 to-violet-500 bg-clip-text text-transparent">
                Convidados
              </span>
            </h1>
          </div>

          <GuestSearchAdd
            eventos={eventos}
            convidados={convidados}
            eventoId={eventoId}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            searchResults={searchResults}
            setSearchResults={setSearchResults}
            addingGuest={addingGuest}
            setAddingGuest={setAddingGuest}
            showAddForm={showAddForm}
            setShowAddForm={setShowAddForm}
            newGuest={newGuest}
            setNewGuest={setNewGuest}
            handleAddToEvent={handleAddToEvent}
            handleAddNewGuest={handleAddNewGuest}
            handleNewGuestChange={handleNewGuestChange}
          />

          <PrintList
            filters={filters}
            setFilters={setFilters}
            getConvidadosPorEvento={getConvidadosPorEvento}
            eventos={eventos}
            eventoId={eventoId}
          />

          <div className="space-y-10 shadow-lg">
            {Array.isArray(eventos) &&
              eventos
                .filter((evento) => !eventoId || evento.id == eventoId)
                .map((evento) => {
                  const convidadosEvento = aplicarFiltros(
                    getConvidadosPorEvento(evento.id)
                  );
                  const totalParticipantes = contarParticipantes(convidadosEvento);
                  const totalConfirmados = contarConfirmados(convidadosEvento);
                  return (
                    <div
                      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                      key={evento.id}
                    >
                      <GuestActions filters={filters} setFilters={setFilters} />
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
                                  <Users className="w-4 h-4" />
                                </th>
                                <th className="px-4 py-3 text-left font-medium text-gray-600 tracking-wider">
                                  Convidado
                                </th>
                                <th className="px-4 py-3 text-left font-medium text-gray-600 tracking-wider hidden sm:table-cell">
                                  Telefone
                                </th>
                                <th className="px-4 py-3 text-left font-medium text-gray-600 tracking-wider hidden sm:table-cell">
                                  Email
                                </th>
                                <th className="px-4 py-3 text-left font-medium text-gray-600 tracking-wider">
                                  Status
                                </th>
                                <th className="px-4 py-3 text-left font-medium text-gray-600 tracking-wider">
                                  Presente na Festa
                                </th>
                                <th className="px-4 py-3 text-right font-medium text-gray-600 tracking-wider">
                                  Ações
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {/* Move o contador global para fora do map, antes do tbody */}
                              {/* E itera diretamente pelos convidadosEvento */}
                              {convidadosEvento.map((convidado) => {
                                globalIndex++; // Incrementa para o convidado principal
                                const isEditing = editIndex === convidado.id;

                                return (
                                  // Use um fragmento para retornar a linha do convidado e as linhas dos acompanhantes
                                  <React.Fragment key={convidado.id}>
                                    <tr className="hover:bg-gray-50/50 transition-colors">
                                      {isEditing ? (
                                        <td className="px-4 py-4" colSpan={7}>
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
                                                  className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
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
                                                      telefone: formatPhoneNumber(e.target.value),
                                                    })
                                                  }
                                                  className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                                />
                                              </div>
                                              <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                                  Limite de Acompanhantes
                                                </label>
                                                <input
                                                  type="number"
                                                  min="0"
                                                  value={editData.limite_acompanhante}
                                                  onChange={(e) =>
                                                    setEditData({
                                                      ...editData,
                                                      limite_acompanhante:
                                                        parseInt(e.target.value) || 0,
                                                    })
                                                  }
                                                  className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                                />
                                              </div>
                                            </div>

                                            <div>
                                              <div className="flex justify-between items-center mb-2">
                                                <label className="block text-xs font-medium text-gray-500">
                                                  Acompanhantes (
                                                  {editData.acompanhantes?.length || 0}/
                                                  {editData.limite_acompanhante || 0})
                                                </label>
                                                <button
                                                  onClick={handleAddAcompanhante}
                                                  className="text-white flex p-3 items-center text-xs text-bold rounded-2xl cursor-pointer bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                                                  disabled={
                                                    editData.acompanhantes?.length >=
                                                    (editData.limite_acompanhante || 0)
                                                  }
                                                >
                                                  <Plus className="h-3 w-3 mr-1" />
                                                  Adicionar acompanhante
                                                </button>
                                              </div>
                                              <div className="space-y-2">
                                                {editData.acompanhantes.map(
                                                  (acompanhante, index) => (
                                                    <div
                                                      key={acompanhante.id || `new-${index}`}
                                                      className="flex items-center space-x-2 pb-2 border-b border-gray-100"
                                                    >
                                                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                                                          className="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm"
                                                        />
                                                        <input
                                                          type="text"
                                                          value={formatPhoneNumber(acompanhante.telefone || "")}
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
                                                          className="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm"
                                                        />
                                                      </div>
                                                      <button
                                                        type="button"
                                                        onClick={() =>
                                                          handleDeleteAcompanhanteFromEditData(
                                                            acompanhante.id,
                                                            index
                                                          )
                                                        }
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
                                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                                              >
                                                Cancelar
                                              </button>
                                              <button
                                                onClick={handleUpdate}
                                                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
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

                                          <td className="">
                                            <div className="px-4 py-4 text-gray-700 hidden sm:table-cell">
                                              {convidado.email}
                                            </div>
                                          </td>

                                          <td className="px-4 py-4">
                                            <BadgeConvidadoStatus
                                              status={
                                                convidado.confirmado ? 1 : 0
                                              }
                                            />
                                          </td>
                                          <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                              <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                  type="checkbox"
                                                  checked={convidado.presente}
                                                  onChange={() =>
                                                    togglePresenca(convidado.id)
                                                  }
                                                  className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-indigo-500 transition-colors duration-300"></div>
                                                <div className="absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full shadow-md transition-all duration-300 peer-checked:translate-x-full"></div>
                                              </label>
                                              <span className="text-sm font-medium">
                                                {convidado.presente ? (
                                                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 shadow-sm">
                                                    <CheckCircle className="w-4 h-4" />
                                                    Presente
                                                  </span>
                                                ) : (
                                                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-700">
                                                    <XCircle className="w-4 h-4" />
                                                    Ausente
                                                  </span>
                                                )}
                                              </span>
                                            </div>
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
                                                <FaWhatsapp className="h-4 w-4 cursor-pointer" />
                                              </button>
                                              <button
                                                onClick={() => handleEdit(convidado.id)}
                                                className="text-indigo-600 p-1.5 rounded-full hover:bg-indigo-50 transition-colors"
                                                title="Editar convidado"
                                              >
                                                <Edit className="h-4 w-4 cursor-pointer" />
                                              </button>
                                              <button
                                                onClick={() =>
                                                  handleDeleteConvidado(convidado.id)
                                                }
                                                className="text-red-600 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                                                title="Remover convidado"
                                              >
                                                <Trash2 className="h-4 w-4 cursor-pointer" />
                                              </button>
                                            </div>
                                          </td>
                                        </>
                                      )}
                                    </tr>

                                    {/* Acompanhantes */}
                                    {convidado.acompanhantes?.map((acompanhante) => {
                                      globalIndex++; // Incrementa para cada acompanhante
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
                                            <div className="flex items-center pl-8 md:pl-10">
                                              <div className="bg-purple-100 p-2 rounded-full mr-3">
                                                <UserPlus className="h-4 w-4 text-purple-600" />
                                              </div>
                                              <div>
                                                <div className="font-medium text-gray-900">
                                                  {acompanhante.nome} (Acomp.)
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1 sm:hidden">
                                                  {acompanhante.telefone}
                                                </div>
                                              </div>
                                            </div>
                                          </td>
                                          <td className="px-4 py-3 hidden sm:table-cell">
                                            <div className="text-gray-700">
                                              {acompanhante.telefone}
                                            </div>
                                          </td>
                                          <td className="px-4 py-3 hidden sm:table-cell">
                                            <div className="text-gray-700">
                                              {acompanhante.email}
                                            </div>
                                          </td>
                                          <td className="px-4 py-3">
                                            <BadgeConvidadoStatus
                                              status={
                                                acompanhante.confirmado ? 1 : 0
                                              }
                                            />
                                          </td>
                                          <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                              <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                  type="checkbox"
                                                  checked={acompanhante.presente}
                                                  onChange={() =>
                                                    togglePresenca(
                                                      convidado.id,
                                                      acompanhante.id
                                                    )
                                                  }
                                                  className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-indigo-500 transition-colors duration-300"></div>
                                                <div className="absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full shadow-md transition-all duration-300 peer-checked:translate-x-full"></div>
                                              </label>
                                              <span className="text-sm font-medium">
                                                {acompanhante.presente ? (
                                                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 shadow-sm">
                                                    <CheckCircle className="w-4 h-4" />
                                                    Presente
                                                  </span>
                                                ) : (
                                                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-700">
                                                    <XCircle className="w-4 h-4" />
                                                    Ausente
                                                  </span>
                                                )}
                                              </span>
                                            </div>
                                          </td>

                                          <td className="px-4 py-3 text-right whitespace-nowrap">
                                            {/* As ações de edição e deleção para acompanhantes agora são tratadas no modal de edição do convidado principal */}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </React.Fragment>
                                );
                              })}
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
    </>
  );
};

export default Confirmacao;