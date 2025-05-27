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
import NavBar from "../components/menu";
import BadgeConvidadoStatus from "../components/BadgeConvidadoStatus";
import QRCodeScanButton from '../components/QrCodeButon';
import GuestActions from "../components/GuestFilters";
import { formatPhoneNumber, isValidPhoneNumber } from '../components/phoneUtils';
import GuestSearchAdd from "../components/buscaConvidado";
import PrintList from "../components/printList";


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

  useEffect(() => {
    console.log(convidados)
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
 const getConvidadosPorEvento = (eventoId) => {
  if (!Array.isArray(convidados)) {
    console.warn('convidados is not an array', convidados);
    return [];
  }

  const eventoIdNum = parseInt(eventoId);

  return convidados
    .filter(convidado => {
      try {
        const eventosConvidado = Array.isArray(convidado?.eventos) ? 
          convidado.eventos : [];
        
        return eventosConvidado.some(evento => evento?.id === eventoIdNum);
      } catch (error) {
        console.error('Error filtering convidado:', error, convidado);
        return false;
      }
    })
    .map(convidado => {
      try {
        const eventosConvidado = Array.isArray(convidado.eventos) ? 
          convidado.eventos : [];
          
        const eventoRelacao = eventosConvidado.find(e => e?.id === eventoIdNum);

        // DEBUG: Mostra os dados completos do convidado
        console.log('Dados completos do convidado:', convidado);
        
        // Pega todos os acompanhantes do convidado que pertencem a este evento
        const acompanhantesDoEvento = Array.isArray(convidado.acompanhantes) 
          ? convidado.acompanhantes.filter(a => {
              // Verifica múltiplas possibilidades de como o evento pode estar referenciado
              const eventoAcompanhante = a.eventoId || a.evento_id;
              return eventoAcompanhante == eventoIdNum;
            })
          : [];

        // DEBUG: Mostra os acompanhantes filtrados
        console.log(`Acompanhantes de ${convidado.nome} para evento ${eventoId}:`, acompanhantesDoEvento);

        return {
          ...convidado,
          confirmado: eventoRelacao?.confirmado || false,
          presente: Number(eventoRelacao?.token_usado) === 1,
          limite_acompanhante: eventoRelacao?.limite_acompanhante || 0,
          acompanhantes: acompanhantesDoEvento.map(a => ({
            ...a,
            id: a.id || Math.random().toString(36).substr(2, 9), // Garante um ID
            presente: Number(a.token_usado) === 1,
            confirmado: a.confirmado || 0
          }))
        };
      } catch (error) {
        console.error('Error mapping convidado:', error, convidado);
        return {
          ...convidado,
          confirmado: false,
          presente: false,
          limite_acompanhante: 0,
          acompanhantes: []
        };
      }
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
    convidadosEvento.forEach(convidado => {
      if (Number(convidado.confirmado) === 1) count++;
      if (Array.isArray(convidado.acompanhantes)) {
        count += convidado.acompanhantes.filter(a => Number(a.confirmado) === 1).length;
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
    
    // Filtra convidados que:
    // 1. Correspondem ao termo de busca
    // 2. Não estão no evento atual
    // 3. Pertencem a eventos do admin logado
    const results = convidados.filter(c => {
      const nomeMatch = c.nome.toLowerCase().includes(term);
      const naoEstaNoEventoAtual = !c.eventos?.some(e => e.id === parseInt(eventoId));
      const pertenceAEventoDoAdmin = c.eventos?.some(e => 
        eventos.some(ev => ev.id === e.id) // Verifica se o evento existe na lista de eventos do admin
      );
      
      return nomeMatch && naoEstaNoEventoAtual ;  {/*&& pertenceAEventoDoAdmin*/}
    });
  
    setSearchResults(results);
  }, [searchTerm, convidados, eventoId, eventos]);

  // Adicionar convidado existente ao evento
 const handleAddToEvent = async (convidado) => {
  setAddingGuest(true);
  try {
    const response = await fetch(`${apiConvidados}/${convidado.id}/eventos/${eventoId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        limite_acompanhante: Number(convidado.limite_acompanhante) || 
                             Number(convidado.limite_padrao) || 0, // Tenta ambos os campos
        confirmado: false
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Erro ao adicionar convidado ao evento");
    }

    // Atualiza o convidado na lista
    setConvidados(prev => prev.map(c => {
      if (c.id !== convidado.id) return c;
      
      const eventosAtualizados = Array.isArray(c.eventos) 
        ? [...c.eventos, { 
            id: parseInt(eventoId), 
            limite_acompanhante: Number(convidado.limite_acompanhante) || 
                               Number(convidado.limite_padrao) || 0,
            confirmado: false,
            novoEvento: true
          }]
        : [{ 
            id: parseInt(eventoId), 
            limite_acompanhante: Number(convidado.limite_acompanhante) || 
                               Number(convidado.limite_padrao) || 0,
            confirmado: false,
            novoEvento: true
          }];
      
      return {
        ...c,
        eventos: eventosAtualizados
      };
    }));
    
    setSearchResults(prev => prev.filter(c => c.id !== convidado.id));
    setSearchTerm("");
    
    toast.success(`${convidado.nome} adicionado ao evento com sucesso!`);
  } catch (error) {
    console.error("Erro ao adicionar:", error);
    toast.error(error.message);
  } finally {
    setAddingGuest(false);
  }
};
  // Função para lidar com mudanças nos campos do formulário
  const handleNewGuestChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'telefone') {
      // Aplica a máscara apenas para o campo de telefone
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

  // Adicionar novo convidado e associar ao evento
  const handleAddNewGuest = async () => {
    // Validação reforçada
    if (!newGuest.nome.trim()) {
      toast.error("O nome do convidado é obrigatório");
      return;
    }
  
    // Validação do telefone
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
      // Dados básicos do convidado - remove a máscara antes de enviar
      const convidadoData = {
        nome: newGuest.nome.trim(),
        telefone: phoneDigits, // Envia apenas os dígitos
        email: newGuest.email.trim() || null,
        limite_acompanhante: Number(newGuest.limite_acompanhante) || 0
      };

      // 1. Cria o convidado com tratamento de resposta melhorado
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
      
      // Verificação crítica - adapte conforme a estrutura real da sua API
      const novoConvidadoId = responseData.id || responseData.data?.id;
      if (!novoConvidadoId) {
        throw new Error("Não foi possível obter o ID do convidado criado");
      }

      const targetEventoId = eventoId || newGuest.evento_id;
      
      // 2. Associa ao evento apenas se temos um ID de evento válido
      if (targetEventoId && targetEventoId !== "undefined") {
        try {
          const responseAssociacao = await fetch(
            `${apiConvidados}/${novoConvidadoId}/eventos/${targetEventoId}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                limite_acompanhante: Number(newGuest.limite_acompanhante) || 0,
                confirmado: false
              }),
            }
          );

          if (!responseAssociacao.ok) {
            const error = await responseAssociacao.json();
            throw new Error(error.message || "Erro ao associar convidado ao evento");
          }
        } catch (associacaoError) {
          // Rollback seguro com tratamento de erro
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

      // Atualiza a lista local de convidados
      setConvidados(prev => [...prev, {
        id: novoConvidadoId,
        nome: newGuest.nome.trim(),
        telefone: newGuest.telefone.trim(),
        email: newGuest.email.trim() || null,
        eventos: targetEventoId ? [{ 
          id: parseInt(targetEventoId),
          limite_acompanhante: Number(newGuest.limite_acompanhante) || 0,
          confirmado: false
        }] : []
      }]);

      // Feedback e reset (mantido igual)
      toast.success(`${newGuest.nome} cadastrado com sucesso!`);
      setShowAddForm(false);
      setNewGuest({
        nome: "",
        telefone: "",
        email: "",
        limite_acompanhante: 0,
        evento_id: eventoId || ""
      });

    } catch (error) {
      console.error("Erro no cadastro:", error);
      toast.error(error.message || "Erro ao cadastrar convidado");
    } finally {
      setAddingGuest(false);
    }
  };

  // Atualizar convidado
  const handleUpdate = async () => {
    if (!editIndex) return;

    console.log(editData)

    try {
      setLoading(true);
      
      const response = await fetch(`${apiConvidados}/${editIndex}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: editData.nome,
          telefone: editData.telefone,
          email: editData.email,
          limite_acompanhante: editData.limite_acompanhante
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao atualizar convidado");
      }

      for (const acompanhante of editData.acompanhantes) {
        console.log(acompanhante)

        if (acompanhante.id) {
          await fetch(`${apiConvidados}/${editIndex}/acompanhantes/${acompanhante.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nome: acompanhante.nome,
              telefone: acompanhante.telefone || null,
              email: acompanhante.email || null,
            }),
          });

        } else
          console.log(await fetch(`${apiConvidados}/${editIndex}/acompanhantes/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nome: acompanhante.nome,
              telefone: acompanhante.telefone || null,
              email: acompanhante.email || null,
              eventoId: eventoId,
            }),
          }));
      }

      const updatedConvidado = await response.json();
      
      // Atualiza também a relação com o evento se limite_acompanhante mudou
      if (eventoId) {
        await fetch(
          `${apiConvidados}/${editIndex}/eventos/${eventoId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              limite_acompanhante: editData.limite_acompanhante
            }),
          }
        );
      }

      setConvidados(prev => prev.map(c =>
        c.id === editIndex ? {...c, ...editData} : c
      ));

      setEditIndex(null);
      toast.success("Convidado atualizado com sucesso!");

      window.location.reload()
    } catch (error) {
      console.error("Erro na atualização:", error);
      toast.error(`Falha ao atualizar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  //buscar dados somente do administrador logado.
  const adminId = localStorage.getItem('adminId');
  // Buscar dados iniciais
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
  
      // Processa eventos - filtra por adminId e converte tipos
      const eventosProcessados = Array.isArray(eventosData)
        ? eventosData
            .filter(e => adminId ? e.administrador_id == adminId : true)
            .map(e => ({
              ...e,
              id: Number(e.id),
              data_evento: e.data_evento || new Date().toISOString()
            }))
        : [];
  
      setEventos(eventosProcessados);
      
      // Processa convidados
      const convidadosProcessados = Array.isArray(convidadosData.data)
        ? convidadosData.data.map(c => ({
            ...c,
            eventos: c.eventos || [],
            acompanhantes: c.acompanhantes ? 
              c.acompanhantes.filter(a => a.eventoId === eventoId) : 
              []
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
  }, []);

  const handleEdit = (id) => {
    const convidado = convidados.find((c) => c.id === id);
    if (!convidado) return;
    setEditIndex(id);
    setEditData({
      nome: convidado.nome || "",
      telefone: convidado.telefone || "",
      email: convidado.email || "",
      limite_acompanhante: convidado.eventos?.find(e => e.id === parseInt(eventoId))?.limite_acompanhante || 0,
      acompanhantes: [...(convidado.acompanhantes || [])],
    });
  };

  // Remover convidado do evento (não deleta o convidado, só remove a associação)
  const handleDeleteConvidado = async (id) => {
    if (!window.confirm("Tem certeza que deseja remover este convidado do evento?"))
      return;

    try {
      const response = await fetch(`${apiConvidados}/${id}/eventos/${eventoId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao remover convidado do evento");
      }

      setConvidados(prev => prev.map(c => 
        c.id === id 
          ? { 
              ...c, 
              eventos: c.eventos?.filter(e => e.id !== parseInt(eventoId)) 
            } 
          : c
      ));
      
      toast.success("Convidado removido do evento com sucesso!");
    } catch (error) {
      toast.error(`Erro ao remover convidado: ${error.message}`);
    }
  };

  // Deletar acompanhante
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

      setConvidados(prev => prev.map(convidado => {
        if (convidado.id !== convidadoId) return convidado;
        return {
          ...convidado,
          acompanhantes: convidado.acompanhantes.filter(a => a.id !== acompanhanteId)
        };
      }));

      toast.success("Acompanhante removido com sucesso!");
    } catch (error) {
      console.error("Erro na exclusão:", error);
      toast.error(`Falha: ${error.message}`);
    }
  };

  // Atualizar acompanhante
  const handleUpdateAcompanhante = async (convidadoId, acompanhanteId, newData) => {
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao atualizar acompanhante");
      }

      setConvidados(prev => prev.map(convidado => {
        if (convidado.id !== convidadoId) return convidado;
        return {
          ...convidado,
          acompanhantes: convidado.acompanhantes.map(a => 
            a.id === acompanhanteId ? { ...a, ...newData } : a
          )
        };
      }));

      setEditingAcompanhante(null);
      toast.success("Acompanhante atualizado com sucesso!");
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
  
  const novoAcompanhante = { 
    nome: "", 
    telefone: "", 
    email: "",
    confirmado: 0, // Explicitamente pendente o acompanhante
    eventoId: editData.id
  };
  
  console.log("Novo acompanhante criado aqui :", novoAcompanhante);
  
  setEditData((prev) => ({
    ...prev,
    acompanhantes: [...prev.acompanhantes, novoAcompanhante],
  }));
};

  // Enviar WhatsApp
  const handleSendWhatsapp = async (convidado) => {
    const frontendUrl = import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173";
    const linkConfirmacao = `${frontendUrl}/convite/${convidado.id}?eventoId=${eventoId}`;
    
    // Encontra o evento específico pelo ID
    const evento = eventos.find(e => e.id === parseInt(eventoId));
    
    // Usa a mensagem do evento ou uma mensagem padrão
    const mensagem = `${convidado.nome}! ${evento?.mensagem_whatsapp || "Você está convidado para nosso evento!"}: ${linkConfirmacao}`;
    
    const linkWhatsapp = `https://api.whatsapp.com/send?phone=55${convidado.telefone}&text=${encodeURIComponent(mensagem)}`;

    try {
      const resposta = await fetch(`${apiConvidados}/${convidado.id}/eventos/${eventoId}/confirmar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      if (!resposta.ok) {
        throw new Error("Erro ao atualizar a confirmação");
      }

      setConvidados(prev => prev.map(c => 
        c.id === convidado.id
          ? {
              ...c,
              eventos: c.eventos.map(e => 
                e.id === parseInt(eventoId) ? { ...e, confirmado: true } : e
              )
            }
          : c
      ));

      toast.success("Confirmação enviada via WhatsApp!");
    } catch (error) {
      toast.error("Erro ao enviar a mensagem.");
    }

    window.open(linkWhatsapp, "_blank");
};
  // Toggle confirmação
  const toggleConfirmacao = async (convidadoId, acompanhanteId = null) => {
    try {
      if (!acompanhanteId) {
        // Toggle confirmação do convidado no evento
        const convidado = convidados.find(c => c.id === convidadoId);
        const estaConfirmado = convidado.eventos?.find(e => e.id === parseInt(eventoId))?.confirmado;
        
        const response = await fetch(
          `${apiConvidados}/${convidadoId}/eventos/${eventoId}/confirmar`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ confirmado: !estaConfirmado }),
          }
        );
  
        if (!response.ok) {
          throw new Error("Erro ao atualizar confirmação");
        }
  
        const data = await response.json(); 
  
        setConvidados(prev => prev.map(c => 
          c.id === convidadoId
            ? {
                ...c,
                eventos: c.eventos.map(e => 
                  e.id === parseInt(eventoId) 
                    ? { 
                        ...e, 
                        confirmado: !estaConfirmado,
                        token_usado: data.token_usado // Atualiza o token_usado com a resposta da API
                      } 
                    : e
                )
              }
            : c
        ));
      } else {
        // Toggle confirmação do acompanhante
        const response = await fetch(
          `${apiConvidados}/${convidadoId}/acompanhantes/${acompanhanteId}/confirmar`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
          }
        );
  
        if (!response.ok) {
          throw new Error("Erro ao atualizar confirmação do acompanhante");
        }
  
        const data = await response.json(); // Adicione esta linha
  
        setConvidados(prev => prev.map(c => {
          if (c.id !== convidadoId) return c;
          return {
            ...c,
            acompanhantes: c.acompanhantes.map(a => 
              a.id === acompanhanteId 
                ? { 
                    ...a, 
                    confirmado: !a.confirmado,
                    token_usado: data.token_usado // Atualiza o token_usado com a resposta da API
                  } 
                : a
            )
          };
        }));
      }
  
      toast.success("Status atualizado com sucesso!");
    } catch (error) {
      toast.error(`Erro: ${error.message}`);
    }
  };

const togglePresenca = async (convidadoId, acompanhanteId = null) => {
  try {
    if (!acompanhanteId) {
      // Toggle presença do convidado principal
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

      const data = await response.json();

      setConvidados(prev => prev.map(c => 
        c.id === convidadoId
          ? {
              ...c,
              eventos: c.eventos.map(e => 
                e.id === parseInt(eventoId) 
                  ? { 
                      ...e, 
                      token_usado: data.token_usado
                    } 
                  : e
              ),
              presente: data.token_usado === 1
            }
          : c
      ));
    } else {
      // Toggle presença do acompanhante
      const response = await fetch(
        `${apiConvidados}/${convidadoId}/acompanhantes/${acompanhanteId}/presenca`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao atualizar presença do acompanhante");
      }

      const data = await response.json();

      setConvidados(prev => prev.map(c => {
        if (c.id !== convidadoId) return c;
        return {
          ...c,
          acompanhantes: c.acompanhantes.map(a => 
            a.id === acompanhanteId 
              ? { 
                  ...a, 
                  token_usado: data.token_usado,
                  presente: data.token_usado === 1
                } 
              : a
          )
        };
      }));
    }

    toast.success("Presença atualizada com sucesso!");
  } catch (error) {
    toast.error(`Erro: ${error.message}`);
  }
};
  // Função de filtro corrigida
  const aplicarFiltros = (convidados) => {
    if (!Array.isArray(convidados)) return [];
    
    return convidados.filter(convidado => {
      // Verifica status no evento específico
      const confirmadoNoEvento = convidado.eventos?.find(e => e.id === parseInt(eventoId))?.confirmado;
      
      // Filtro por status
      if (filters.status === "confirmed" && confirmadoNoEvento !== 1) {
        return false;
      }
      if (filters.status === "pending" && confirmadoNoEvento !== 0) {
        return false;
      }
      if (filters.status === "cancelled" && confirmadoNoEvento !== 2) {
        return false;
      }
  
      // Filtro por nome (mais seguro)
      if (filters.searchName) {
        const searchTerm = filters.searchName.toLowerCase();
        const nomeMatch = convidado.nome?.toLowerCase()?.includes(searchTerm) || false;
        const acompanhanteMatch = convidado.acompanhantes?.some(a => 
          a.nome?.toLowerCase()?.includes(searchTerm)
        ) || false;
        
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

  return (
    <>
      <NavBar />
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
                  ); // ← Linha modificada
                  const totalParticipantes =
                    contarParticipantes(convidadosEvento);
                  const totalConfirmados = contarConfirmados(convidadosEvento);
                  return (
                    <>
                   
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
                            <div className="flex items-center bg-indigo-50 text-indigo-600 py-1 px-3 rounded-full text-xs font-medium self-start md:self-auto">
                              <Users className="h-3 w-3 mr-1" />
                              <span>
                                {totalConfirmados}/{totalParticipantes}{" "}
                                confirmados
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
                                    Contato
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
                                                      className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200" />
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
                                                      className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                                                  </div>
                                                  <div>
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">
                                                      Limite de Acompanhantes
                                                    </label>
                                                    <input
                                                      type="number"
                                                      min="0"
                                                      value={editData.limite_acompanhante ||
                                                        0}
                                                      onChange={(e) => setEditData({
                                                        ...editData,
                                                        limite_acompanhante: parseInt(
                                                          e.target.value
                                                        ) || 0,
                                                      })}
                                                      className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                                                  </div>
                                                </div>

                                                <div>
                                                  <div className="flex justify-between items-center mb-2">
                                                    <label className="block text-xs font-medium text-gray-500">
                                                      Acompanhantes (
                                                      {editData.acompanhantes
                                                        ?.length || 0}
                                                      /
                                                      {editData.limite_acompanhante ||
                                                        0}
                                                      )
                                                    </label>
                                                    <button
                                                      onClick={handleAddAcompanhante}
                                                      className="text-white flex p-3 items-center text-xs text-bold rounded-2xl cursor-pointer bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                                                      disabled={editData.acompanhantes
                                                        ?.length >=
                                                        (editData.limite_acompanhante ||
                                                          0)}
                                                    >
                                                      <Plus className="h-3 w-3 mr-1" />
                                                      Adicionar acompanhante
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
                                                              value={acompanhante.nome ||
                                                                ""}
                                                              onChange={(e) => {
                                                                const updatedAcompanhantes = [
                                                                  ...editData.acompanhantes,
                                                                ];
                                                                updatedAcompanhantes[index] = {
                                                                  ...updatedAcompanhantes[index],
                                                                  nome: e.target
                                                                    .value,
                                                                };
                                                                setEditData({
                                                                  ...editData,
                                                                  acompanhantes: updatedAcompanhantes,
                                                                });
                                                              } }
                                                              placeholder="Nome"
                                                              className="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" />
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
                                                                  telefone: formatPhoneNumber(e.target
                                                                    .value),
                                                                };
                                                                setEditData({
                                                                  ...editData,
                                                                  acompanhantes: updatedAcompanhantes,
                                                                });
                                                              } }
                                                              placeholder="Telefone"
                                                              className="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" />
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
                                              <td className="px-4 py-4">
                                                <BadgeConvidadoStatus
                                                  status={convidado.confirmado || 0} />
                                              </td>
                                              <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                  <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                      type="checkbox"
                                                      checked={convidado.presente}
                                                      onChange={() => togglePresenca(convidado.id)}
                                                      className="sr-only peer" />
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
                                                    onClick={() => handleSendWhatsapp(
                                                      convidado
                                                    )}
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
                                                    onClick={() => handleDeleteConvidado(
                                                      convidado.id
                                                    )}
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
                                        {convidado.acompanhantes?.map(
                                          (acompanhante) => {
                                            globalIndex++;
                                            const isEditingAcomp = editingAcompanhante ===
                                              `${convidado.id}-${acompanhante.id}`;

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
                                                          (c) => c.id ===
                                                            convidado.id
                                                        );
                                                        const acompanhanteIndex = updatedConvidados[convidadoIndex].acompanhantes.findIndex(
                                                          (a) => a.id ===
                                                            acompanhante.id
                                                        );
                                                        updatedConvidados[convidadoIndex].acompanhantes[acompanhanteIndex].nome = e.target.value;
                                                        setConvidados(
                                                          updatedConvidados
                                                        );
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
                                                          (c) => c.id ===
                                                            convidado.id
                                                        );
                                                        const acompanhanteIndex = updatedConvidados[convidadoIndex].acompanhantes.findIndex(
                                                          (a) => a.id ===
                                                            acompanhante.id
                                                        );
                                                        updatedConvidados[convidadoIndex].acompanhantes[acompanhanteIndex].telefone =
                                                          e.target.value;
                                                        setConvidados(
                                                          updatedConvidados
                                                        );
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
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${acompanhante.confirmado == 0
                                                        ? "bg-red-100 text-red-800"
                                                        : acompanhante.confirmado ==
                                                          1
                                                          ? "bg-green-100 text-green-800"
                                                          : "bg-yellow-100 text-yellow-800"}`}
                                                  >
                                                    {acompanhante.confirmado ==
                                                      0 ? (
                                                      <>
                                                        <CheckCircle className="h-3 w-3 mr-1" />
                                                        Pendente
                                                      </>
                                                    ) : acompanhante.confirmado ==
                                                      1 ? (
                                                      <>
                                                        <XCircle className="h-3 w-3 mr-1" />
                                                        Confirmado
                                                      </>
                                                    ) : (
                                                      <>
                                                        <XCircle className="h-3 w-3 mr-1" />
                                                        Não comparecerá
                                                      </>
                                                    )}
                                                  </button>
                                                </td>
                                                <td className="px-4 py-3">
                                                  <div className="flex items-center gap-3">
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                      <input
                                                        type="checkbox"
                                                        checked={acompanhante.presente}
                                                        onChange={() => togglePresenca(convidado.id, acompanhante.id)}
                                                        className="sr-only peer" />
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
                                                          <Check className="h-4 w-4 cursor-pointer" />
                                                        </button>
                                                        <button
                                                          onClick={() => setEditingAcompanhante(
                                                            null
                                                          )}
                                                          className="text-gray-600 p-1.5 rounded-full hover:bg-gray-50 transition-colors"
                                                        >
                                                          <X className="h-4 w-4 cursor-pointer" />
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
                                                          <Edit className="h-4 w-4 cursor-pointer" />
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
                                                          <Trash2 className="h-4 w-4 cursor-pointer" />
                                                        </button>
                                                      </>
                                                    )}
                                                  </div>
                                                </td>
                                              </tr>
                                            );
                                          }
                                        )}
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
                      </div></>
                  );
                })}
          </div>
        </div>
      </div>
    </>
  );
};

export default Confirmacao;