import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  Search,
  Filter,
  Phone,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import NavBar from "../components/menu"

const Confirmacao = () => {
  // 1. Hooks do React Router
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const eventoId = searchParams.get("eventoId");

  // 2. Estados 
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
  const [editIndex, setEditIndex] = useState(null);
  const [editingAcompanhante, setEditingAcompanhante] = useState(null);
  const [editData, setEditData] = useState({
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

  // 3. para persistir filtros
  useEffect(() => {
    localStorage.setItem('convidadosFilters', JSON.stringify(filters));
  }, [filters]);

  // Novo convidado
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGuest, setNewGuest] = useState({
    nome: "",
    telefone: "",
    email: "",
    limite_acompanhante: 0,
    evento_id: eventoId || "",
  });

  // Configuração base da API
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const apiEventos = `${baseUrl}/api/eventos`;
  const apiConvidados = `${baseUrl}/api/convidados`;

  const getConvidadosPorEvento = (eventoId) => {
    if (!Array.isArray(convidados)) return [];
    
    let filtered = convidados.filter((c) => c?.evento_id === parseInt(eventoId));
    
    if (filters.status !== "all") {
      filtered = filtered.filter(convidado => {
        if (filters.status === "confirmed") {
          return convidado.confirmado || 
                 (convidado.acompanhantes?.some(a => a.confirmado));
        } else {
          return !convidado.confirmado && 
                 !convidado.acompanhantes?.some(a => a.confirmado);
        }
      });
    }
    
    if (filters.searchName) {
      const term = filters.searchName.toLowerCase();
      filtered = filtered.filter(convidado => {
        const nomeMatch = convidado.nome.toLowerCase().includes(term);
        const acompanhantesMatch = convidado.acompanhantes?.some(a => 
          a.nome.toLowerCase().includes(term)
        );
        return nomeMatch || acompanhantesMatch;
      });
    }
    
    return filtered;
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

  // Busca de convidados por nome
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      return;
    }

    const term = searchTerm.toLowerCase();
    const results = convidados.filter(c => 
      c.nome.toLowerCase().includes(term) && 
      c.evento_id !== parseInt(eventoId)
    );

    setSearchResults(results);
  }, [searchTerm, convidados, eventoId]);

  // Função para adicionar convidado existente de outro evento
  const handleAddToEvent = async (convidado) => {
    setAddingGuest(true);
    try {
      const jaExiste = convidados.some(
        (c) => c.evento_id === parseInt(eventoId) && 
              (c.telefone === convidado.telefone || 
               (c.email && convidado.email && c.email === convidado.email))
      );
      
      if (jaExiste) {
        toast.error("Convidado já está neste evento");
        return;
      }

      const tempId = Date.now();
      const tempConvidado = {
        id: tempId,
        ...convidado,
        evento_id: parseInt(eventoId),
        confirmado: false,
        acompanhantes: []
      };

      setConvidados(prev => [...prev, tempConvidado]);
      setSearchResults(prev => prev.filter(c => c.id !== convidado.id));
      setSearchTerm("");

      const response = await fetch(apiConvidados, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: convidado.nome,
          telefone: convidado.telefone,
          email: convidado.email || null,
          limite_acompanhante: convidado.limite_acompanhante || 0,
          evento_id: parseInt(eventoId),
          acompanhantes: []
        }),
      });

      if (!response.ok) {
        setConvidados(prev => prev.filter(c => c.id !== tempId));
        setSearchResults(prev => [...prev, convidado]);
        const error = await response.json();
        throw new Error(error.message || "Erro ao adicionar convidado");
      }

      const novoConvidado = await response.json();
      
      setConvidados(prev => prev.map(c => 
        c.id === tempId ? novoConvidado : c
      ));
      
      toast.success(`${convidado.nome} adicionado com sucesso!`);
    } catch (error) {
      console.error("Erro ao adicionar:", error);
      toast.error(error.message);
    } finally {
      setAddingGuest(false);
    }
  };

  // Função para adicionar novo convidado
  const handleAddNewGuest = async () => {
    if (!newGuest.nome || !newGuest.telefone) {
      toast.error("Nome e telefone são obrigatórios");
      return;
    }

    if (!newGuest.evento_id) {
      toast.error("Selecione um evento");
      return;
    }

    try {
      setAddingGuest(true);
      
      const tempId = Date.now();
      const tempConvidado = {
        id: tempId,
        ...newGuest,
        evento_id: parseInt(newGuest.evento_id),
        confirmado: false,
        acompanhantes: []
      };

      setConvidados(prev => [...prev, tempConvidado]);

      const response = await fetch(apiConvidados, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: newGuest.nome,
          telefone: newGuest.telefone,
          email: newGuest.email || null,
          limite_acompanhante: newGuest.limite_acompanhante || 0,
          evento_id: parseInt(newGuest.evento_id),
          acompanhantes: []
        }),
      });

      if (!response.ok) {
        setConvidados(prev => prev.filter(c => c.id !== tempId));
        const error = await response.json();
        throw new Error(error.message || "Erro ao adicionar convidado");
      }

      const novoConvidado = await response.json();
      
      setConvidados(prev => prev.map(c => 
        c.id === tempId ? novoConvidado : c
      ));
      
      toast.success(`${newGuest.nome} adicionado com sucesso!`);
      setShowAddForm(false);
      setNewGuest({
        nome: "",
        telefone: "",
        email: "",
        limite_acompanhante: 0,
        evento_id: eventoId || "",
      });
      fetchDados();
    } catch (error) {
      console.error("Erro ao adicionar:", error);
      toast.error(error.message);
    } finally {
      setAddingGuest(false);
    }
  };

  // Atualizar convidado
  const handleUpdate = async () => {
    if (!editIndex) return;

    try {
      setLoading(true);
      
      const prevConvidados = [...convidados];
      setConvidados(prev => prev.map(c => 
        c.id === editIndex ? { ...c, ...editData } : c
      ));

      const response = await fetch(`${apiConvidados}/${editIndex}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });

      if (!response.ok) {
        setConvidados(prevConvidados);
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao atualizar convidado");
      }

      const updatedConvidado = await response.json();
      
      setConvidados(prev => prev.map(c => 
        c.id === editIndex ? { ...c, ...updatedConvidado } : c
      ));

      setEditIndex(null);
      toast.success("Convidado atualizado com sucesso!");
    } catch (error) {
      console.error("Erro na atualização:", error);
      toast.error(`Falha ao atualizar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

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
    } finally {
      setLoading(false);
    }
  }
  
  // Buscar dados iniciais
  useEffect(() => {
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
      limite_acompanhante: convidado.limite_acompanhante || 0,
      acompanhantes: [...(convidado.acompanhantes || [])],
    });
  };

  // Deletar convidado
  const handleDeleteConvidado = async (id) => {
    if (!window.confirm("Tem certeza que deseja remover este convidado?"))
      return;

    const prevConvidados = [...convidados];
    setConvidados(prev => prev.filter(c => c.id !== id));

    try {
      const response = await fetch(`${apiConvidados}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setConvidados(prevConvidados);
        throw new Error("Erro ao excluir convidado");
      }
      
      toast.success("Convidado removido com sucesso!");
    } catch (error) {
      toast.error(`Erro ao excluir convidado: ${error.message}`);
    }
  };

  // Deletar acompanhante
  const handleDeleteAcompanhante = async (convidadoId, acompanhanteId) => {
    if (!acompanhanteId || isNaN(acompanhanteId) || acompanhanteId <= 0) {
      toast.error("ID do acompanhante inválido");
      return;
    }

    const prevConvidados = [...convidados];
    setConvidados(prev => prev.map(convidado => {
      if (convidado.id !== convidadoId) return convidado;
      return {
        ...convidado,
        acompanhantes: convidado.acompanhantes.filter(a => a.id !== acompanhanteId)
      };
    }));

    try {
      const response = await fetch(
        `${apiConvidados}/acompanhantes/${acompanhanteId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        setConvidados(prevConvidados);
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao excluir acompanhante");
      }

      toast.success("Acompanhante removido com sucesso!");
    } catch (error) {
      console.error("Erro na exclusão:", error);
      toast.error(`Falha: ${error.message}`);
    }
  };

  // Atualizar acompanhante
  const handleUpdateAcompanhante = async (
    convidadoId,
    acompanhanteId,
    newData
  ) => {
    try {
      setConvidados(prev => prev.map(convidado => {
        if (convidado.id !== convidadoId) return convidado;
        return {
          ...convidado,
          acompanhantes: convidado.acompanhantes.map(a => 
            a.id === acompanhanteId ? { ...a, ...newData } : a
          )
        };
      }));

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
        setConvidados(prev => [...prev]);
        throw new Error(data.error || "Erro ao atualizar acompanhante");
      }

      setEditingAcompanhante(null);
      toast.success(data.message || "Acompanhante atualizado!");
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
    setEditData((prev) => ({
      ...prev,
      acompanhantes: [...prev.acompanhantes, { nome: "", telefone: "", email: "" }],
    }));
  };

  // Enviar WhatsApp
  const handleSendWhatsapp = async (convidado) => {
    const frontendUrl =
      import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173";
    const linkConfirmacao = `${frontendUrl}/ana_luiza/${convidado.id}`;
    const mensagem = `Olá ${convidado.nome}, confirme sua presença no evento acessando este link: ${linkConfirmacao}`;
    const linkWhatsapp = `https://api.whatsapp.com/send?phone=55${
      convidado.telefone
    }&text=${encodeURIComponent(mensagem)}`;

    try {
      // setConvidados(prev => prev.map(c => 
      //   c.id === convidado.id ? { ...c, confirmado: true } : c
      // ));

      const resposta = await fetch(`${apiConvidados}/${convidado.id}/confirmar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      if (!resposta.ok) {
        setConvidados(prev => [...prev]);
        throw new Error("Erro ao atualizar a confirmação");
      }

      toast.success("Confirmação enviada via WhatsApp!");
    } catch (error) {
      toast.error("Erro ao enviar a mensagem.");
    }

    window.open(linkWhatsapp, "_blank");
  };

  // Toggle confirmação
  const toggleConfirmacao = async (convidadoId, acompanhanteId = null) => {
    try {
      // Atualização otimista
      setConvidados(prev => prev.map(convidado => {
        if (convidado.id !== convidadoId) return convidado;
        
        if (!acompanhanteId) {
          return {
            ...convidado,
            confirmado: !convidado.confirmado
          };
        }
        
        return {
          ...convidado,
          acompanhantes: convidado.acompanhantes.map(a => 
            a.id === acompanhanteId 
              ? { ...a, confirmado: !a.confirmado } 
              : a
          )
        };
      }));

      let url;
      if (acompanhanteId) {
        url = `${apiConvidados}/${convidadoId}/acompanhantes/${acompanhanteId}/confirmar`;
      } else {
        url = `${apiConvidados}/${convidadoId}/confirmar`;
      }

      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        setConvidados(prev => [...prev]);
        throw new Error("Erro ao atualizar confirmação");
      }

      // Atualiza com dados do servidor
      const updatedData = await response.json();
      setConvidados(prev => prev.map(c => 
        c.id === convidadoId ? { ...c, ...updatedData } : c
      ));

      toast.success("Status atualizado com sucesso!");
    } catch (error) {
      toast.error(`Erro: ${error.message}`);
    }
  };

  const renderFilters = () => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-gray-700 flex items-center">
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </h3>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="text-indigo-600 text-sm"
        >
          {showFilters ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>
      
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 text-sm"
            >
              <option value="all">Todos</option>
              <option value="confirmed">Confirmados</option>
              <option value="pending">Pendentes</option>
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Buscar por nome
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar convidados ou acompanhantes..."
                value={filters.searchName}
                onChange={(e) => setFilters({...filters, searchName: e.target.value})}
                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 text-sm"
              />
              {filters.searchName && (
                <button
                  onClick={() => setFilters({...filters, searchName: ""})}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-500" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
        <p className="text-gray-600">Carregando convidados...</p>
      </div>
    );
  }

  return (
    <><NavBar />
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

        {/* Barra de busca e adicionar convidado */}
        <div className="mb-8 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base"
                placeholder="Buscar convidados de outros eventos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg flex items-center justify-center transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              <span>Adicionar Convidado</span>
            </button>
          </div>

          {/* Formulário para adicionar novo convidado */}
          {showAddForm && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-medium text-gray-800 mb-4 flex items-center">
                <UserPlus className="h-5 w-5 text-indigo-600 mr-2" />
                Novo Convidado
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label htmlFor="nome_convidado">Nome</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="text"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="Nome completo"
                    value={newGuest.nome}
                    onChange={(e) => setNewGuest({ ...newGuest, nome: e.target.value })} />
                </div>
                </div>

                <div className="flex flex-col gap-1">
                <label htmlFor="telefone_convidado">Telefone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="text"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="0000000-0000"
                    value={newGuest.telefone}
                    onChange={(e) => setNewGuest({ ...newGuest, telefone: e.target.value })} />
                </div>
                </div>

                <div className="flex flex-col gap-1">
                <label htmlFor="email_convidado">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="email"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="(Opcional)"
                    value={newGuest.email}
                    onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })} />
                </div>
                </div>

                <div className="flex flex-col gap-1">
                <label htmlFor="acompanhantes_convidado">Limite de acompanhantes</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="number"
                    min="0"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="Limite de acompanhantes"
                    value={newGuest.limite_acompanhante}
                    onChange={(e) => setNewGuest({ ...newGuest, limite_acompanhante: parseInt(e.target.value) || 0 })} />
                </div>
                </div>

                {!eventoId && (
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-3 text-gray-400" size={18} />
                    <select
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      value={newGuest.evento_id}
                      onChange={(e) => setNewGuest({ ...newGuest, evento_id: e.target.value })}
                    >
                      <option value="">Selecione o evento</option>
                      {eventos.map(evento => (
                        <option key={evento.id} value={evento.id}>{evento.nome}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddNewGuest}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                  disabled={addingGuest}
                >
                  {addingGuest ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  <span>Salvar</span>
                </button>
              </div>
            </div>
          )}

          {/* Resultados da busca */}
          {searchTerm && searchResults.length > 0 && (
            <div className="mt-2 bg-white rounded-md shadow-lg overflow-hidden border border-gray-200">
              <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {searchResults.map((convidado) => (
                  <li
                    key={convidado.id}
                    className="p-4 hover:bg-indigo-50 transition-colors cursor-pointer flex justify-between items-center"
                    onClick={() => handleAddToEvent(convidado)}
                  >
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                        <User className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{convidado.nome}</p>
                        <p className="text-sm text-gray-500">{convidado.telefone}</p>
                        <p className="text-xs text-gray-400">
                          Evento: {eventos.find(e => e.id === convidado.evento_id)?.nome || 'Outro'}
                        </p>
                      </div>
                    </div>
                    <button
                      className="ml-4 bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToEvent(convidado);
                      } }
                      disabled={addingGuest}
                    >
                      {addingGuest ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {searchTerm && searchResults.length === 0 && (
            <div className="mt-2 bg-white rounded-lg shadow-sm p-4 text-center text-gray-500">
              Nenhum convidado encontrado em outros eventos
            </div>
          )}
        </div>

        {/* Filtros */}
        {renderFilters()}

        <div className="space-y-6">
          {Array.isArray(eventos) &&
            eventos
              .filter(evento => !eventoId || evento.id == eventoId)
              .map((evento) => {
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
                                                  onChange={(e) => setEditData({
                                                    ...editData,
                                                    nome: e.target.value,
                                                  })}
                                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                                              </div>
                                              <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                                  Telefone
                                                </label>
                                                <input
                                                  type="text"
                                                  name="telefone"
                                                  value={editData.telefone}
                                                  onChange={(e) => setEditData({
                                                    ...editData,
                                                    telefone: e.target.value,
                                                  })}
                                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                                              </div>
                                              <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                                  Limite de Acompanhantes
                                                </label>
                                                <input
                                                  type="number"
                                                  min="0"
                                                  value={editData.limite_acompanhante || 0}
                                                  onChange={(e) => setEditData({
                                                    ...editData,
                                                    limite_acompanhante: parseInt(e.target.value) || 0,
                                                  })}
                                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                                              </div>
                                            </div>

                                            <div>
                                              <div className="flex justify-between items-center mb-2">
                                                <label className="block text-xs font-medium text-gray-500">
                                                  Acompanhantes ({editData.acompanhantes?.length || 0}/{editData.limite_acompanhante || 0})
                                                </label>
                                                <button
                                                  onClick={handleAddAcompanhante}
                                                  className="text-indigo-600 flex items-center text-xs hover:text-indigo-700 transition-colors"
                                                  disabled={editData.acompanhantes?.length >= (editData.limite_acompanhante || 0)}
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
                                                          value={acompanhante.nome || ""}
                                                          onChange={(e) => {
                                                            const updatedAcompanhantes = [
                                                              ...editData.acompanhantes,
                                                            ];
                                                            updatedAcompanhantes[index] = {
                                                              ...updatedAcompanhantes[index],
                                                              nome: e.target.value,
                                                            };
                                                            setEditData({
                                                              ...editData,
                                                              acompanhantes: updatedAcompanhantes,
                                                            });
                                                          } }
                                                          placeholder="Nome"
                                                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                                                        <input
                                                          type="text"
                                                          value={acompanhante.telefone ||
                                                            ""}
                                                          onChange={(e) => {
                                                            const updatedAcompanhantes = [
                                                              ...editData.acompanhantes,
                                                            ];
                                                            updatedAcompanhantes[index] = {
                                                              ...updatedAcompanhantes[index],
                                                              telefone: e.target.value,
                                                            };
                                                            setEditData({
                                                              ...editData,
                                                              acompanhantes: updatedAcompanhantes,
                                                            });
                                                          } }
                                                          placeholder="Telefone"
                                                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                                                      </div>
                                                      <button
                                                        type="button"
                                                        onClick={() => {
                                                          const updatedAcompanhantes = [
                                                            ...editData.acompanhantes,
                                                          ];
                                                          updatedAcompanhantes.splice(
                                                            index,
                                                            1
                                                          );
                                                          setEditData({
                                                            ...editData,
                                                            acompanhantes: updatedAcompanhantes,
                                                          });
                                                        } }
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
                                              onClick={() => toggleConfirmacao(convidado.id)}
                                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${convidado.confirmado
                                                  ? "bg-green-100 text-green-800"
                                                  : "bg-red-100 text-red-800"}`}
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
                                                onClick={() => handleSendWhatsapp(convidado)}
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
                                                onClick={() => handleDeleteConvidado(convidado.id)}
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
                                                  const acompanhanteIndex = updatedConvidados[convidadoIndex].acompanhantes.findIndex(
                                                    (a) => a.id === acompanhante.id
                                                  );
                                                  updatedConvidados[convidadoIndex].acompanhantes[acompanhanteIndex].nome = e.target.value;
                                                  setConvidados(updatedConvidados);
                                                } }
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
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
                                                  const acompanhanteIndex = updatedConvidados[convidadoIndex].acompanhantes.findIndex(
                                                    (a) => a.id === acompanhante.id
                                                  );
                                                  updatedConvidados[convidadoIndex].acompanhantes[acompanhanteIndex].telefone = e.target.value;
                                                  setConvidados(updatedConvidados);
                                                } }
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                                            ) : (
                                              <div className="text-gray-700">
                                                {acompanhante.telefone}
                                              </div>
                                            )}
                                          </td>
                                          <td className="px-4 py-3">
                                            <button
                                              onClick={() => toggleConfirmacao(
                                                convidado.id,
                                                acompanhante.id
                                              )}
                                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${acompanhante.confirmado
                                                  ? "bg-green-100 text-green-800"
                                                  : "bg-red-100 text-red-800"}`}
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
                                                    } }
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
                                                    onClick={() => setEditingAcompanhante(
                                                      `${convidado.id}-${acompanhante.id}`
                                                    )}
                                                    className="text-indigo-600 p-1.5 rounded-full hover:bg-indigo-50 transition-colors"
                                                    title="Editar acompanhante"
                                                  >
                                                    <Edit className="h-4 w-4" />
                                                  </button>
                                                  <button
                                                    onClick={() => {
                                                      if (window.confirm(
                                                        `Remover ${acompanhante.nome}?`
                                                      )) {
                                                        handleDeleteAcompanhante(
                                                          convidado.id,
                                                          acompanhante.id
                                                        );
                                                      }
                                                    } }
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
    </div></>
  );
};

export default Confirmacao;