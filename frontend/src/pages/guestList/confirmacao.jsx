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
  Clock // Importado para BadgeConvidadoStatus
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { toast } from "sonner";
import BadgeConvidadoStatus from "../../components/BadgeConvidadoStatus";
import QRCodeScanButton from '../../components/qrcode/QrCodeButon';
import GuestActions from "../../components/pageList/GuestFilters";
import { formatPhoneNumber, isValidPhoneNumber } from "../../utils/phoneUtils"
import GuestSearchAdd from "../../components/pageList/buscaConvidado"
import PrintList from "../../components/pageList/printList";
import EditGuestModal from "../../components/modal/EditGuestModal";

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
    const savedFilters = localStorage.getItem('convidadosFilters');
    return savedFilters ? JSON.parse(savedFilters) : {
      status: "all",
      searchName: "",
    };
  });

  const [eventos, setEventos] = useState([]);
  const [convidados, setConvidados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editIndex, setEditIndex] = useState(null); // ID do convidado que está sendo editado (no modal)

  const [editData, setEditData] = useState({ // Dados que preenchem o formulário do modal
    nome: "",
    telefone: "",
    email: "",
    limite_acompanhante: 0,
    acompanhantes: [],
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [addingGuest, setAddingGuest] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Estado para controlar a visibilidade do modal
  const [showEditModal, setShowEditModal] = useState(false);


  useEffect(() => {
    console.log("Estado atual dos convidados (do React):", convidados);
  }, [convidados]);

  useEffect(() => {
    localStorage.setItem('convidadosFilters', JSON.stringify(filters));
  }, [filters]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newGuest, setNewGuest] = useState({
    nome: "",
    telefone: "",
    email: "",
    limite_acompanhante: 0,
    evento_id: eventoId || ""
  });

  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const apiEventos = `${baseUrl}/api/eventos`;
  const apiConvidados = `${baseUrl}/api/convidados`;

  // Função para obter convidados de um evento específico
  const getConvidadosPorEvento = (currentEventoId) => {
    if (!Array.isArray(convidados)) {
      console.warn('getConvidadosPorEvento: convidados is not an array', convidados);
      return [];
    }

    const eventoIdNum = parseInt(currentEventoId);
    console.log("getConvidadosPorEvento - Evento ID selecionado (numérico):", eventoIdNum, "É NaN?", isNaN(eventoIdNum));

    const filteredConvidados = convidados
      .filter(convidado => {
        try {
          const eventosConvidado = Array.isArray(convidado?.eventos) ?
            convidado.eventos : [];

          // Log para depuração dos IDs dos eventos do convidado
          if (eventosConvidado.length === 0) {
            console.log(`getConvidadosPorEvento - Convidado "${convidado.nome}" NÃO TEM EVENTOS associados.`);
            return false;
          }

          const isAssociated = eventosConvidado.some(evento => {
              const eventoIdConvidado = Number(evento?.id);
              const match = eventoIdConvidado === eventoIdNum;
              console.log(`getConvidadosPorEvento - Convidado "${convidado.nome}" Evento ID: ${eventoIdConvidado} (Tipo: ${typeof eventoIdConvidado}) === Selecionado ID: ${eventoIdNum} (Tipo: ${typeof eventoIdNum}) -> Match: ${match}`);
              return match;
          });
          console.log(`getConvidadosPorEvento - Convidado "${convidado.nome}" Associado ao evento ${eventoIdNum}?`, isAssociated);
          return isAssociated;

        } catch (error) {
          console.error('getConvidadosPorEvento - Erro durante a filtragem de convidado:', error, convidado);
          return false;
        }
      })
      .map(convidado => {
        try {
          const eventosConvidado = Array.isArray(convidado.eventos) ?
            convidado.eventos : [];

          const eventoRelacao = eventosConvidado.find(e => Number(e?.id) === eventoIdNum);

          const acompanhantesDoEvento = Array.isArray(convidado.acompanhantes)
            ? convidado.acompanhantes.filter(a => {
                const acompEventoId = Number(a.convidado_evento_evento_id);
                console.log(`   Acompanhante "${a.nome}" Ref ID: ${acompEventoId} (Tipo: ${typeof acompEventoId}) === Evento ID: ${eventoIdNum} (Tipo: ${typeof eventoIdNum}) -> Match: ${acompEventoId === eventoIdNum}`);
                return acompEventoId === eventoIdNum;
              })
            : [];

          return {
            ...convidado,
            confirmado: eventoRelacao?.confirmado || 0,
            presente: Number(eventoRelacao?.token_usado) === 1,
            limite_acompanhante: eventoRelacao?.limite_acompanhante || 0,
            acompanhantes: acompanhantesDoEvento.map(a => ({
              ...a,
              id: a.id || `temp-${Math.random().toString(36).substr(2, 9)}`,
              presente: Number(a.token_usado) === 1,
              confirmado: a.confirmado || 0
            }))
          };
        } catch (error) {
          console.error('getConvidadosPorEvento - Erro mapping convidado:', error, convidado);
          return {
            ...convidado,
            confirmado: 0,
            presente: false,
            limite_acompanhante: 0,
            acompanhantes: []
          };
        }
      });
      console.log("getConvidadosPorEvento - Convidados filtrados para exibição:", filteredConvidados);
      return filteredConvidados;
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

  //contar confirmados
  const contarConfirmados = (convidadosEvento) => {
    if (!Array.isArray(convidadosEvento)) return 0;

    let count = 0;
    convidadosEvento.forEach(convidado => {
      if (Number(convidado.confirmado) === 1) count++;
      if (Array.isArray(convidado.acompanhantes)) {
        count += convidado.acompanhantes.filter(a => Number(a.confirmado) === 1).length;
      }
    });
    return count;
  };

  //contar pendentes
  const contarPendentes = (convidadosEvento) => {
    if (!Array.isArray(convidadosEvento)) return 0;

    let count = 0;
    convidadosEvento.forEach(convidado => {
      if (Number(convidado.confirmado) === 0) count++;
      if (Array.isArray(convidado.acompanhantes)) {
        count += convidado.acompanhantes.filter(a => Number(a.confirmado) === 0).length;
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

    const results = convidados.filter(c => {
      const nomeMatch = c.nome.toLowerCase().includes(term);
      const naoEstaNoEventoAtual = !c.eventos?.some(e => e.id === parseInt(eventoId));

      return nomeMatch && naoEstaNoEventoAtual;
    });

    setSearchResults(results);
  }, [searchTerm, convidados, eventoId, eventos]);

  const handleAddToEvent = async (convidado) => {
    setAddingGuest(true);
    try {
      const response = await fetch(`${apiConvidados}/${convidado.id}/eventos/${eventoId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          limite_acompanhante: Number(convidado.limite_acompanhante) ||
            Number(convidado.limite_padrao) || 0,
          confirmado: false
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao adicionar convidado ao evento");
      }

      toast.success(`${convidado.nome} adicionado ao evento com sucesso!`);
      fetchDados();
      setSearchTerm("");
    } catch (error) {
      console.error("Erro ao adicionar:", error);
      toast.error(error.message);
    } finally {
      setAddingGuest(false);
    }
  };

  const handleNewGuestChange = (e) => {
    const { name, value } = e.target;

    if (name === 'telefone') {
      const formattedValue = formatPhoneNumber(value);
      setNewGuest(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else {
      setNewGuest(prev => ({
        ...prev,
        [name]: name === 'limite_acompanhante' ?
          (value === '' ? '' : Math.max(0, parseInt(value) || 0)) :
          value
      }));
    }
  };

  const handleAddNewGuest = async () => {
    if (!newGuest.nome.trim()) {
      toast.error("O nome do convidado é obrigatório");
      return;
    }

    const phoneDigits = newGuest.telefone.replace(/\D/g, '');
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
        limite_acompanhante: Number(newGuest.limite_acompanhante) || 0
      };

      const responseConvidado = await fetch(apiConvidados, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(convidadoData),
      });

      if (!responseConvidado.ok) {
        const error = await responseConvidado.json();
        throw new Error(error.message || "Erro ao criar convidado");
      }

      const responseData = await responseConvidado.json();
      const novoConvidadoId = responseData.id || responseData.data?.id;
      if (!novoConvidadoId) {
        throw new Error("Não foi possível obter o ID do convidado criado");
      }

      const targetEventoId = eventoId || newGuest.evento_id;

      if (targetEventoId && targetEventoId !== "undefined") {
        try {
          const responseAssociacao = await fetch(
            `${apiConvidados}/${novoConvidadoId}/eventos/${targetEventoId}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                limite_acompanhante: Number(newGuest.limite_acompanhante) || 0,
                confirmado: 0
              }),
            }
          );

          if (!responseAssociacao.ok) {
            const error = await responseAssociacao.json();
            throw new Error(error.message || "Erro ao associar convidado ao evento");
          }
        } catch (associacaoError) {
          try {
            await fetch(`${apiConvidados}/${novoConvidadoId}`, {
              method: "DELETE"
            });
          } catch (rollbackError) {
            console.error("Erro no rollback:", rollbackError);
          }
          throw associacaoError;
        }
      }

      toast.success(`${newGuest.nome} cadastrado com sucesso!`);
      setShowAddForm(false);
      setNewGuest({
        nome: "",
        telefone: "",
        email: "",
        limite_acompanhante: 0,
        evento_id: eventoId || ""
      });
      fetchDados();

    } catch (error) {
      console.error("Erro no cadastro:", error);
      toast.error(error.message || "Erro ao cadastrar convidado");
    } finally {
      setAddingGuest(false);
    }
  };

  const handleUpdate = async () => {
    if (!editIndex) return;

    const convidadoPrincipal = convidados.find(c => c.id === editIndex);
    const statusConvidadoPrincipal = convidadoPrincipal?.eventos?.find(e => e.id === parseInt(eventoId))?.confirmado ?? 0;

    try {
      setLoading(true);

      // 1. Atualizar Convidado Principal
      const responseConvidado = await fetch(`${apiConvidados}/${editIndex}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: editData.nome,
          telefone: editData.telefone.replace(/\D/g, ''),
          email: editData.email || null,
        }),
      });

      if (!responseConvidado.ok) {
        const errorData = await responseConvidado.json();
        throw new Error(errorData.message || "Erro ao atualizar convidado principal");
      }
      toast.success("Convidado principal atualizado!");

      // 2. Atualizar Limite de Acompanhantes (se eventoId existir)
      if (eventoId) {
        await fetch(
          `${apiConvidados}/${editIndex}/eventos/${eventoId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              limite_acompanhante: Number(editData.limite_acompanhante) || 0,
            }),
          }
        );
        toast.info("Limite de acompanhantes atualizado.");
      }

      // 3. Processar Acompanhantes
      const currentConvidadoData = convidados.find(c => c.id === editIndex);
      const existingAcompanhantesIds = new Set(
        currentConvidadoData?.acompanhantes
          ?.filter(a => Number(a.convidado_evento_evento_id) === parseInt(eventoId))
          .map(a => a.id) || []
      );

      const updatedAcompanhantesToProcess = new Set();

      for (const acompanhante of editData.acompanhantes) {
        const cleanPhone = acompanhante.telefone ? String(acompanhante.telefone).replace(/\D/g, '') : "";
        const cleanEmail = acompanhante.email || "";

        if (acompanhante.id && !String(acompanhante.id).startsWith('temp-') && existingAcompanhantesIds.has(acompanhante.id)) {
          // ATUALIZAR um acompanhante existente
          const updateResponse = await fetch(`${apiConvidados}/acompanhantes/${acompanhante.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nome: acompanhante.nome,
              telefone: cleanPhone,
              email: cleanEmail,
            }),
          });

          if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            throw new Error(`Erro ao atualizar acompanhante ${acompanhante.nome}: ${errorData.error || updateResponse.statusText}`);
          }
          updatedAcompanhantesToProcess.add(acompanhante.id);
        } else if (String(acompanhante.id).startsWith('temp-') || !acompanhante.id) {
          // ADICIONAR um acompanhante NOVO (com ID temporário ou sem ID)
          if (!acompanhante.nome.trim()) {
            throw new Error("Nome de um novo acompanhante é obrigatório.");
          }
          if (cleanPhone && !isValidPhoneNumber(cleanPhone)) {
            toast.error(`Telefone do acompanhante ${acompanhante.nome} é inválido.`);
            throw new Error(`Telefone do acompanhante ${acompanhante.nome} é inválido.`);
          }

          const addAcompanhanteResponse = await fetch(`${apiConvidados}/${editIndex}/acompanhantes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nome: acompanhante.nome,
              telefone: cleanPhone,
              email: cleanEmail,
              convidado_id: editIndex,
              evento_id: parseInt(eventoId),
              confirmado: statusConvidadoPrincipal
            }),
          });

          if (!addAcompanhanteResponse.ok) {
            const errorData = await addAcompanhanteResponse.json();
            throw new Error(`Erro ao adicionar acompanhante: ${errorData.error || addAcompanhanteResponse.statusText}`);
          }
          const newAcompData = await addAcompanhanteResponse.json();
          updatedAcompanhantesToProcess.add(newAcompData.id || newAcompData.data?.id);
          toast.success(`Acompanhante ${acompanhante.nome} adicionado!`);
        }
      }

      // 4. Remover acompanhantes que estavam na lista original mas não estão mais no editData
      const acompanhantesParaRemover = Array.from(existingAcompanhantesIds).filter(id => !updatedAcompanhantesToProcess.has(id));

      for (const idToRemove of acompanhantesParaRemover) {
        const deleteResponse = await fetch(`${apiConvidados}/acompanhantes/${idToRemove}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });
        if (!deleteResponse.ok) {
          const errorData = await deleteResponse.json();
          console.error(`Erro ao remover acompanhante ${idToRemove}:`, errorData);
          toast.error(`Erro ao remover acompanhante antigo (ID: ${idToRemove}).`);
        } else {
          toast.info(`Acompanhante removido (ID: ${idToRemove}).`);
        }
      }

      setEditIndex(null);
      setShowEditModal(false);
      toast.success("Convidado e acompanhantes atualizados com sucesso!");
      fetchDados();
    } catch (error) {
      console.error("Erro geral na atualização:", error);
      toast.error(`Falha ao atualizar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const adminId = localStorage.getItem('adminId');
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

      const rawEvents = eventosData.data || eventosData;
      const rawGuests = convidadosData.data || convidadosData;


      const eventosProcessados = Array.isArray(rawEvents)
        ? rawEvents
          .filter(e => adminId ? e.administrador_id == adminId : true)
          .map(e => ({
            ...e,
            id: Number(e.id),
            data_evento: e.data_evento || new Date().toISOString()
          }))
        : [];

      setEventos(eventosProcessados);

      const convidadosProcessados = Array.isArray(rawGuests)
        ? rawGuests.map(c => ({
          ...c,
          eventos: c.eventos || [],
          acompanhantes: c.acompanhantes || []
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
  }, [eventoId]);

  const handleEdit = (id) => {
    const convidado = convidados.find((c) => c.id === id);
    if (!convidado) return;

    setEditIndex(id);

    const convidadoEventoRelacao = convidado.eventos?.find(e => e.id === parseInt(eventoId));

    const processedAcompanhantes = (convidado.acompanhantes || [])
      .filter(a => Number(a.convidado_evento_evento_id) === parseInt(eventoId))
      .map(a => ({
        ...a,
        telefone: a.telefone || '', // Garante que telefone seja string vazia se for null/undefined
        email: a.email || ''        // Garante que email seja string vazia se for null/undefined
      }));

    setEditData({
      nome: convidado.nome || "",
      telefone: formatPhoneNumber(convidado.telefone || ""),
      email: convidado.email || "",
      limite_acompanhante: convidadoEventoRelacao?.limite_acompanhante || 0,
      acompanhantes: processedAcompanhantes, // Usa a lista de acompanhantes processada
    });
    setShowEditModal(true);
  };

  const handleDeleteConvidado = async (id) => {
    if (!window.confirm("Tem certeza que deseja remover este convidado do evento? Isso também removerá seus acompanhantes associados a este evento."))
      return;

    try {
      const response = await fetch(`${apiConvidados}/${id}/eventos/${eventoId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao remover convidado do evento");
      }

      toast.success("Convidado removido do evento com sucesso!");
      fetchDados();
    } catch (error) {
      toast.error(`Erro ao remover convidado: ${error.message}`);
    }
  };

  const handleDeleteAcompanhante = async (convidadoId, acompanhanteId) => {
    if (!acompanhanteId || isNaN(acompanhanteId) || acompanhanteId <= 0) {
      toast.error("ID do acompanhante inválido");
      return;
    }

    if (!window.confirm("Tem certeza que deseja inativar este acompanhante?")) return;

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
        throw new Error(errorData.error || "Erro ao inativar acompanhante");
      }

      toast.success("Acompanhante inativado com sucesso!");
      // Atualiza o estado local para remover o acompanhante imediatamente
      setConvidados(prevConvidados =>
        prevConvidados.map(c =>
          c.id === convidadoId
            ? {
                ...c,
                acompanhantes: c.acompanhantes.filter(a => a.id !== acompanhanteId)
              }
            : c
        )
      );
      fetchDados(); // Para garantir que os dados globais sejam atualizados
    } catch (error) {
      console.error("Erro na inativação:", error);
      toast.error(`Falha: ${error.message}`);
    }
  };

  const handleUpdateAcompanhante = async (convidadoId, acompanhanteId, newData) => {
    try {
      const cleanPhone = newData.telefone ? newData.telefone.replace(/\D/g, '') : null;
      const response = await fetch(
        `${apiConvidados}/acompanhantes/${acompanhanteId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome: newData.nome,
            telefone: cleanPhone,
            email: newData.email || null,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao atualizar acompanhante");
      }

      toast.success("Acompanhante atualizado com sucesso!");
      fetchDados();
    } catch (error) {
      console.error("Erro na atualização:", error);
      toast.error(error.message);
    }
  };

  const handleAddAcompanhante = () => {
    if (editData.acompanhantes.length >= (editData.limite_acompanhante || 0)) {
      toast.error(`Limite de ${editData.limite_acompanhante} acompanhantes atingido`);
      return;
    }

    const convidadoPrincipal = convidados.find(c => c.id === editIndex);
    const statusConvidadoPrincipal = convidadoPrincipal?.eventos?.find(e => e.id === parseInt(eventoId))?.confirmado ?? 0;

    const novoAcompanhante = {
      id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      nome: "",
      telefone: "",
      email: "",
      confirmado: statusConvidadoPrincipal,
      convidado_evento_evento_id: parseInt(eventoId),
      convidado_evento_convidado_id: editIndex,
    };

    setEditData(prev => ({
      ...prev,
      acompanhantes: [...prev.acompanhantes, novoAcompanhante]
    }));

    toast.info("Novo campo de acompanhante adicionado! Não esqueça de 'Salvar Alterações'.");
  };

  const handleSendWhatsapp = async (convidado) => {
    const frontendUrl = import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173";
    const linkConfirmacao = `${frontendUrl}/convite/${convidado.id}?eventoId=${eventoId}`;

    const evento = eventos.find(e => e.id === parseInt(eventoId));

    const mensagem = `${convidado.nome}! ${evento?.mensagem_whatsapp || "Você está convidado para nosso evento!"}: ${linkConfirmacao}`;

    const linkWhatsapp = `https://api.whatsapp.com/send?phone=55${convidado.telefone}&text=${encodeURIComponent(mensagem)}`;

    try {
      const resposta = await fetch(`${apiConvidados}/${convidado.id}/eventos/${eventoId}/confirmacao`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmado: 1 }),
      });

      if (!resposta.ok) {
        throw new Error("Erro ao atualizar a confirmação após enviar WhatsApp");
      }

      toast.success("Confirmação enviada via WhatsApp!");
      fetchDados();
    } catch (error) {
      toast.error("Erro ao enviar a mensagem.");
    }

    window.open(linkWhatsapp, "_blank");
  };

  const toggleConfirmacao = async (convidadoId, acompanhanteId = null) => {
    try {
      if (!acompanhanteId) {
        const convidado = convidados.find(c => c.id === convidadoId);
        const eventoRelacao = convidado.eventos?.find(e => e.id === parseInt(eventoId));
        const estaConfirmado = eventoRelacao?.confirmado;

        let novoStatusConfirmacao;
        if (estaConfirmado === 1) {
          novoStatusConfirmacao = 2;
        } else if (estaConfirmado === 0 || estaConfirmado === 2) {
          novoStatusConfirmacao = 1;
        }

        const response = await fetch(
          `${apiConvidados}/${convidadoId}/eventos/${eventoId}/confirmacao`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ confirmado: novoStatusConfirmacao }),
          }
        );

        if (!response.ok) {
          throw new Error("Erro ao atualizar confirmação");
        }

        toast.success("Status de confirmação atualizado com sucesso!");
        fetchDados();
      } else {
        const convidado = convidados.find(c => c.id === convidadoId);
        const acompanhante = convidado.acompanhantes.find(a => a.id === acompanhanteId);
        const estaConfirmado = acompanhante?.confirmado;

        let novoStatusConfirmacao;
        if (estaConfirmado === 1) {
          novoStatusConfirmacao = 2;
        } else if (estaConfirmado === 0 || estaConfirmado === 2) {
          novoStatusConfirmacao = 1;
        }

        const response = await fetch(
          `${apiConvidados}/acompanhantes/${acompanhanteId}/confirmar`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ confirmado: novoStatusConfirmacao }),
          }
        );

        if (!response.ok) {
          throw new Error("Erro ao atualizar confirmação do acompanhante");
        }

        toast.success("Status de confirmação do acompanhante atualizado com sucesso!");
        fetchDados();
      }
    } catch (error) {
      toast.error(`Erro: ${error.message}`);
    }
  };

  const togglePresenca = async (convidadoId, acompanhanteId = null) => {
    try {
      if (!acompanhanteId) {
        const response = await fetch(
          `${apiConvidados}/${convidadoId}/eventos/${eventoId}/presenca`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!response.ok) {
          throw new Error("Erro ao atualizar presença");
        }

        toast.success("Presença do convidado atualizada com sucesso!");
        fetchDados();
      } else {
        const response = await fetch(
          `${apiConvidados}/acompanhantes/${acompanhanteId}/presenca`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!response.ok) {
          throw new Error("Erro ao atualizar presença do acompanhante");
        }

        toast.success("Presença do acompanhante atualizada com sucesso!");
        fetchDados();
      }
    } catch (error) {
      toast.error(`Erro: ${error.message}`);
    }
  };

  // Funções para Contagem Contínua dos convidados e acompanhantes
  const flattenParticipants = (convidadosEvento) => {
    if (!Array.isArray(convidadosEvento)) return [];

    let currentGlobalIndex = 0;
    const flattenedList = [];

    convidadosEvento.forEach(convidado => {
      // Adiciona o convidado principal
      currentGlobalIndex++;
      flattenedList.push({
        type: 'convidado',
        id: convidado.id,
        data: convidado,
        globalIndex: currentGlobalIndex
      });

      // Adiciona os acompanhantes do convidado
      convidado.acompanhantes.forEach(acompanhante => {
        currentGlobalIndex++;
        flattenedList.push({
          type: 'acompanhante',
          id: acompanhante.id,
          convidadoId: convidado.id, // Para referência ao pai
          data: acompanhante,
          globalIndex: currentGlobalIndex
        });
      });
    });

    return flattenedList;
  };


  //filtros pendentes/confirmados e ausentes
  const aplicarFiltros = (convidados) => {
    if (!Array.isArray(convidados)) return [];

    return convidados.filter(convidado => {
      const convidadoEventoRelacao = convidado.eventos?.find(e => Number(e.id) === parseInt(eventoId));

      if (!convidadoEventoRelacao) {
          return false;
      }

      const confirmadoNoEvento = Number(convidadoEventoRelacao.confirmado);

      let passesStatusFilter = true;
      if (filters.status === "confirmed" && confirmadoNoEvento !== 1) {
        passesStatusFilter = false;
      }
      if (filters.status === "pending" && confirmadoNoEvento !== 0) {
        passesStatusFilter = false;
      }
      if (filters.status === "cancelled" && confirmadoNoEvento !== 2) {
        passesStatusFilter = false;
      }

      let passesSearchFilter = true;
      if (filters.searchName) {
        const searchTerm = filters.searchName.toLowerCase();
        const nomeMatch = convidado.nome?.toLowerCase()?.includes(searchTerm) || false;
        const acompanhanteMatch = convidado.acompanhantes?.some(a =>
          a.nome?.toLowerCase()?.includes(searchTerm)
        ) || false;

        if (!nomeMatch && !acompanhanteMatch) {
          passesSearchFilter = false;
        }
      }

      const finalPass = passesStatusFilter && passesSearchFilter;
      return finalPass;
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

  //caso nenhum evento seja passado na url redireciona para a página de eventos
  if (!eventoId || isNaN(parseInt(eventoId))) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
        <div className="text-center text-gray-700">
          <p className="text-xl font-semibold mb-4">Nenhum evento selecionado.</p>
          <p className="mb-6">Por favor, selecione um evento para visualizar os convidados.</p>
          <button
            onClick={() => navigate('/eventos')} // Redireciona para a página de eventos
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <CalendarIcon className="h-5 w-5 mr-2" /> Ir para Eventos
          </button>
        </div>
      </div>
    );
  }

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
              <QRCodeScanButton
                onScan={(data) => console.log("QR Lido:", data)}
              />
            </div>
          </div>


          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight mt-2 sm:mt-0">
              Lista de <span className="bg-gradient-to-br from-indigo-600 to-violet-500 bg-clip-text text-transparent">Convidados</span>
            </h1>
          </div>



          {/* Barra de busca e adicionar convidado */}
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
          />

{/*Para filtrar */}

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
                .filter((evento) => !eventoId || evento.id == parseInt(eventoId))
                .map((evento) => {
                  const convidadosEvento = aplicarFiltros(
                    getConvidadosPorEvento(evento.id)
                  );

                  const totalParticipantes =
                    contarParticipantes(convidadosEvento);
                  const totalConfirmados = contarConfirmados(convidadosEvento);

                  const totalPendentes = contarPendentes(convidadosEvento);


                  // Achatamos a lista de participantes para numeração contínua
                  const allParticipants = flattenParticipants(convidadosEvento);

                  return (
                    <div
                      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                      key={evento.id}
                    >
                      <GuestActions
                        filters={filters}
                        setFilters={setFilters} />
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
                                {new Date(
                                  evento.data_evento
                                ).toLocaleDateString("pt-BR", {
                                  day: "2-digit",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                          </div>
                          {/* Contagem Separada de Participantes e Confirmados */}
                          <div className="flex items-center gap-3">
                            {/* Badge Total de Participantes */}
                            <div className="flex items-center bg-indigo-50 text-indigo-600 py-1 px-3 rounded-full text-xs font-medium">
                              <Users className="h-3 w-3 mr-1" />
                              <span>Total: {totalParticipantes}</span>
                            </div>
                            {/* Badge Total de Confirmados */}
                            <div className="flex items-center bg-green-50 text-green-600 py-1 px-3 rounded-full text-xs font-medium">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              <span>Confirmados: {totalConfirmados}</span>
                            </div>
                              {/* Badge total de pendentes */}
                            <div className="flex items-center bg-yellow-50 text-yellow-600 py-1 px-3 rounded-full text-xs font-medium">
                              <Clock className="h-3 w-3 mr-1" /> {/* Ícone de relógio para pendente */}
                              <span>Pendentes: {totalPendentes}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        {allParticipants.length > 0 ? (
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="px-4 py-3 text-left font-medium text-gray-600 tracking-wider w-12">
                                  <Users className="w-4 h-4" />
                                </th>
                                <th className="px-4 py-3 text-left font-medium text-gray-600 tracking-wider">
                                  Nome
                                </th>
                                <th className="px-4 py-3 text-left font-medium text-gray-600 tracking-wider hidden sm:table-cell">
                                  Contato
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
                              {allParticipants.map((participant) => (
                                <tr
                                  key={participant.type === 'convidado' ? participant.id : `${participant.convidadoId}-${participant.id}`}
                                  className={participant.type === 'convidado' ? 'hover:bg-gray-50/50 transition-colors' : 'bg-gray-50 hover:bg-gray-100/50 transition-colors'}
                                >
                                  <td className="px-4 py-4">
                                    <div className="flex justify-center">
                                      <span className={`${participant.type === 'convidado' ? 'bg-indigo-100 text-indigo-600' : 'bg-purple-100 text-purple-600'} font-medium rounded-full h-6 w-6 flex items-center justify-center text-xs`}>
                                        {participant.globalIndex}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-4">
                                    <div className={`flex items-center ${participant.type === 'acompanhante' ? 'pl-8 md:pl-10' : ''}`}>
                                      <div className={`${participant.type === 'convidado' ? 'bg-indigo-100 text-indigo-600' : 'bg-purple-100 text-purple-600'} p-2 rounded-full mr-3`}>
                                        {participant.type === 'convidado' ? <User className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                                      </div>
                                      <div>
                                        <div className="font-medium text-gray-900">
                                          {participant.data.nome}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1 sm:hidden">
                                          {formatPhoneNumber(participant.data.telefone || '')}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 hidden sm:table-cell">
                                    <div className="text-gray-700">
                                      {formatPhoneNumber(participant.data.telefone || '')}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 hidden sm:table-cell">
                                    <div className="text-gray-700">
                                      {participant.data.email}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4">
                                    <BadgeConvidadoStatus
                                      status={participant.data.confirmado || 0}
                                    />
                                  </td>
                                  <td className="px-4 py-4">
                                    <div className="flex items-center gap-3">
                                      <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={participant.data.presente}
                                          onChange={() => togglePresenca(participant.type === 'convidado' ? participant.id : participant.convidadoId, participant.type === 'acompanhante' ? participant.id : null)}
                                          className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-indigo-500 transition-colors duration-300"></div>
                                        <div className="absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full shadow-md transition-all duration-300 peer-checked:translate-x-full"></div>
                                      </label>
                                      <span className="text-sm font-medium">
                                        {participant.data.presente ? (
                                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 shadow-sm">
                                            <CheckCircle className="h-4 w-4" />
                                            Presente
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-700">
                                            <XCircle className="h-4 w-4" />
                                            Ausente
                                          </span>
                                        )}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 text-right whitespace-nowrap">
                                    <div className="flex justify-end space-x-1">
                                      {participant.type === 'convidado' ? (
                                        <>
                                          <button
                                            onClick={() => handleSendWhatsapp(participant.data)}
                                            className="text-green-600 p-1.5 rounded-full hover:bg-green-50 transition-colors"
                                            title="Enviar WhatsApp"
                                          >
                                            <FaWhatsapp className="h-4 w-4 cursor-pointer" />
                                          </button>
                                          <button
                                            onClick={() => handleEdit(participant.id)}
                                            className="text-indigo-600 p-1.5 rounded-full hover:bg-indigo-50 transition-colors"
                                            title="Editar convidado"
                                          >
                                            <Edit className="h-4 w-4 cursor-pointer" />
                                          </button>
                                          <button
                                            onClick={() => handleDeleteConvidado(participant.id)}
                                            className="text-red-600 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                                            title="Remover convidado"
                                          >
                                            <Trash2 className="h-4 w-4 cursor-pointer" />
                                          </button>
                                        </>
                                      ) : (
                                        <>
                                          {/* Ações para acompanhantes (apenas remover, edição via modal principal) */}
                                          <button
                                            onClick={() => {
                                              if (window.confirm(`Remover ${participant.data.nome}?`)) {
                                                handleDeleteAcompanhante(participant.convidadoId, participant.id);
                                                // Nota: A remoção do estado local em Confirmacao.jsx
                                                // é feita dentro de handleDeleteAcompanhante agora.
                                              }
                                            }}
                                            className="text-red-600 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                                            title="Remover acompanhante"
                                          >
                                            <Trash2 className="h-4 w-4 cursor-pointer" />
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </td>
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

      {/* Renderiza o modal de edição */}
      {showEditModal && (
        <EditGuestModal
          show={showEditModal}
          onClose={() => setShowEditModal(false)}
          editData={editData}
          setEditData={setEditData}
          onSave={handleUpdate}
          onDeleteAcompanhante={handleDeleteAcompanhante}
          onAddAcompanhante={handleAddAcompanhante}
          convidadoId={editIndex}
          eventoId={eventoId}
        />
      )}
    </>
  );
};

export default Confirmacao;    