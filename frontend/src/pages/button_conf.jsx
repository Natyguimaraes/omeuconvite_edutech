import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  Check,
  X,
  Clock,
  User,
  MapPin,
  Mail,
  Phone,
  Loader2,
  Sparkles,
  HeartCrack, SquarePen,
} from "lucide-react";
import Confetti from "react-confetti";
import { motion, AnimatePresence } from "framer-motion";
import GerarCredencialButton from "../components/GerarCredencialButton"
import NavBar from "../components/menu";

function EventCredential() {
  const { convidadoId } = useParams();
  const [evento, setEvento] = useState({});
  const [convidadoStatus, setConvidadoStatus] = useState(null);
  const [convidado, setConvidado] = useState({});
  const [mensagem, setMensagem] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [acompanhantes, setAcompanhantes] = useState([]);
  const [desejaInformarAcompanhante, setDesejaInformarAcompanhante] =
    useState(false);
  const [error, setError] = useState("");
  const [limiteAcompanhantes, setLimiteAcompanhantes] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [confirmedStatus, setConfirmedStatus] = useState(null);
  const [permiteAlterarDados, setPermiteAlterarDados] = useState(false);
  const [limiteAcompanhante, setLimiteAcompanhante] = useState(0)
  const [quantidadeAcompanhante, setQuantidadeAcompanhante] = useState(0)

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const API_CONVIDADOS = `${API_URL}/api/convidados`;
  const API_EVENTOS = `${API_URL}/api/eventos`;

  const isConfirmed = useMemo(() => {
    return confirmedStatus !== null ? confirmedStatus : convidado?.confirmado;
  }, [confirmedStatus, convidado])

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const ConfirmacaoButton = ({ confirmed, onClick, disabled }) => {
    return (
      <motion.button
        onClick={onClick}
        disabled={disabled}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        className={`relative overflow-hidden w-28 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
          confirmed
            ? "bg-gradient-to-r from-emerald-500 to-green-600 shadow-lg shadow-emerald-200/50"
            : "bg-gradient-to-r from-gray-300 to-gray-400 shadow-lg shadow-gray-200/50"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <motion.span
          className={`absolute left-2 w-10 h-10 bg-white rounded-full shadow-md transition-all duration-300 ${
            confirmed ? "transform translate-x-14" : "transform translate-x-0"
          }`}
          layout
          transition={{ type: "spring", stiffness: 700, damping: 30 }}
        />
        <span
          className={`absolute text-white font-bold text-sm ${
            confirmed ? "left-3" : "right-3"
          }`}
        >
          {confirmed ? "SIM" : "NÃO"}
        </span>
      </motion.button>
    );
  };
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Busca dados do convidado incluindo eventos e acompanhantes
      const convidadoResponse = await fetch(`${API_CONVIDADOS}/${convidadoId}?include=eventos,acompanhantes`);
      if (!convidadoResponse.ok) {
        throw new Error(`Erro ao buscar convidado: ${convidadoResponse.status}`);
      }
      
      const responseData = await convidadoResponse.json();
      const dadosConvidado = responseData.data || responseData;

      // 2. Determina o limite de acompanhantes (prioridade para o limite do evento)
      const limiteEvento = dadosConvidado.eventos?.[0]?.limite_acompanhante;
      const limiteConvidado = dadosConvidado.limite_acompanhante || 0;
      
      // Prioridade: limite do evento > limite do convidado
      const limiteFinal = limiteEvento !== undefined ? limiteEvento : limiteConvidado;
      setLimiteAcompanhantes(limiteFinal);

      // 3. Processa acompanhantes existentes (se houver)
      const acompanhantesExistentes = Array.isArray(dadosConvidado.acompanhantes)
        ? dadosConvidado.acompanhantes.map(a => ({
            id: a.id,
            nome: a.nome || "",
            telefone: a.telefone || "",
            email: a.email || "",
            confirmado: a.confirmado === 1
          }))
        : [];

      // 4. Define estado dos acompanhantes
      if (acompanhantesExistentes.length > 0) {
        const limiteMenosQtdConvidadosExistente = limiteFinal - acompanhantesExistentes.length

        setAcompanhantes([
          ...acompanhantesExistentes,
          ...Array.from({ length: limiteMenosQtdConvidadosExistente }, () => ({
            nome: "",
            telefone: "",
            email: "",
            confirmado: true
          }))
        ]);
        setDesejaInformarAcompanhante(true);
      } else if (limiteFinal > 0) {
        // Mostra campos para novos acompanhantes se houver limite
        setDesejaInformarAcompanhante(true);
        setAcompanhantes(
          Array.from({ length: limiteFinal }, () => ({
            nome: "",
            telefone: "",
            email: "",
            confirmado: true
          }))
        );
      }

      // 5. Processa evento associado
      let eventoAssociado = null;
      
      if (dadosConvidado.evento_id) {
        eventoAssociado = { id: dadosConvidado.evento_id };
      } else if (Array.isArray(dadosConvidado.eventos)) {
        eventoAssociado = dadosConvidado.eventos.find(e => e.id) || null;
      }

      if (!eventoAssociado) {
        throw new Error("Convidado não possui evento associado");
      }

      // 6. Busca dados completos do evento
      const eventoResponse = await fetch(`${API_EVENTOS}/${eventoAssociado.id}`);
      if (!eventoResponse.ok) {
        throw new Error(`Erro ao buscar evento: ${eventoResponse.status}`);
      }

      const eventoData = await eventoResponse.json();
      const eventoFormatado = eventoData.data || eventoData;

      console.log(eventoAssociado)

      // 7. Atualiza estados
      setConvidado({
        id: dadosConvidado.id,
        nome: dadosConvidado.nome || "Convidado",
        telefone: dadosConvidado.telefone || "",
        email: dadosConvidado.email || "",
        confirmado: eventoAssociado.confirmado === 1,
        limite_acompanhante: limiteConvidado,
        acompanhantes: acompanhantesExistentes
      });

      setLimiteAcompanhante(eventoAssociado.limite_acompanhante || 0);
      setQuantidadeAcompanhante(acompanhantes.length)

      switch (eventoAssociado.confirmado) {
        
        case 2:
          setConvidadoStatus('NAO_IREI');
          break;
        case 1:
          setConvidadoStatus('CONFIRMADO');
          break;
        case 0:
          setConvidadoStatus('PENDENTE')
          break;
        default:

          break;
      }

      setEvento({
        id: eventoFormatado.id,
        nome: eventoFormatado.nome || "Evento",
        descricao: eventoFormatado.descricao || "Descrição do evento",
        data_evento: eventoFormatado.data_evento || new Date().toISOString(),
        dataGerarQrCode: eventoFormatado.dataGerarQrCode || null,
        local: eventoFormatado.local || "Local não especificado",
        imagem_evento: eventoFormatado.imagem_evento || "/convite.jpg"
      });

    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      setError(error.message);
      
      setConvidado({
        id: convidadoId,
        nome: "Convidado",
        confirmado: false,
        limite_acompanhante: 0
      });
      
      setEvento({
        nome: "Evento",
        descricao: "Descrição do evento",
        data_evento: new Date().toISOString(),
        local: "Local não especificado",
        imagem_evento: "/convite.jpg"
      });
    } finally {
      setIsLoading(false);
    }
  }, [convidadoId])

  useEffect(() => {
    fetchData();
  }, [convidadoId]);

  useEffect(() => {
    if (convidado?.limite_acompanhante > 0 && !desejaInformarAcompanhante && acompanhantes.length === 0) {
      setDesejaInformarAcompanhante(true);
      setAcompanhantes(
        Array.from({ length: convidado.limite_acompanhante }, () => ({
          nome: "",
          telefone: "",
          email: "",
          confirmado: true
        }))
      );
    }
  }, [convidado]);

  const handleAddAcompanhante = () => {
    if (isConfirmed || acompanhantes.length >= limiteAcompanhantes) {
      setError(`Limite de ${limiteAcompanhantes} acompanhantes atingido`);
      return;
    }
    
    setAcompanhantes([
      ...acompanhantes,
      { nome: "", telefone: "", email: "", confirmado: true }
    ]);
  };

  const handleToggleAcompanhante = () => {
    if (isConfirmed) return;
    
    const newValue = !desejaInformarAcompanhante;
    setDesejaInformarAcompanhante(newValue);
  
    if (!newValue) {
      setAcompanhantes([]);
    } else {
      const novosAcompanhantes = Array.from({ length: limiteAcompanhantes }, () => ({
        nome: "",
        telefone: "",
        email: "",
        confirmado: true
      }));
      
      if (convidado?.acompanhantes?.length > 0) {
        setAcompanhantes(convidado.acompanhantes);
      } else {
        setAcompanhantes(novosAcompanhantes);
      }
    }
  };

  const handleRemoveAcompanhante = (index) => {
    if (isConfirmed) return;
    
    const updatedAcompanhantes = [...acompanhantes];
    const removed = updatedAcompanhantes.splice(index, 1);

    if (removed[0]?.id) {
      setIsLoading(true);
      fetch(`${API_CONVIDADOS}/acompanhantes/${removed[0].id}`, {
        method: "DELETE",
      })
        .then((response) => {
          if (!response.ok) throw new Error("Erro ao remover acompanhante");
          setAcompanhantes(updatedAcompanhantes);
          setMensagem("Acompanhante removido com sucesso");
        })
        .catch((error) => {
          console.error("Erro ao remover acompanhante:", error);
          setError("Erro ao remover acompanhante");
        })
        .finally(() => setIsLoading(false));
    } else {
      setAcompanhantes(updatedAcompanhantes);
    }
  };

  const handleChangeAcompanhante = (index, field, value) => {
    if (isConfirmed) return;
    
    const updatedAcompanhantes = [...acompanhantes];
    updatedAcompanhantes[index][field] = value;
    setAcompanhantes(updatedAcompanhantes);
  };

  const salvarAcompanhantes = async () => {
    // if (isConfirmed) return;
    
    setIsLoading(true);
    setError("");
  
    try {
      const convidadoResponse = await fetch(`${API_CONVIDADOS}/${convidadoId}`);
      const convidadoData = await convidadoResponse.json();
      const dadosConvidado = convidadoData.data || convidadoData;
      
      const acompanhantesAtuais = dadosConvidado.acompanhantes?.length || 0;
      const novosAcompanhantes = acompanhantes.filter(a => !a.id && a.nome).length;
      
      if (acompanhantesAtuais + novosAcompanhantes > limiteAcompanhantes) {
        throw new Error(`Limite de ${limiteAcompanhantes} acompanhantes atingido para o evento: ${evento.nome}`);
      }
  
      const acompanhantesParaSalvar = acompanhantes
        .filter(a => !a.id)
        .filter(a => a.nome && a.nome.trim());

      const acompanhantesComId = acompanhantes
        .filter(a => !!a.id)
        .filter(a => a.nome && a.nome.trim());

      if (acompanhantesParaSalvar.length === 0 && acompanhantesComId.length === 0) {
        return;
      }
  
      const resultados = await Promise.all(
        acompanhantesParaSalvar.map(async (acompanhante) => {
          const response = await fetch(
            `${API_CONVIDADOS}/${convidadoId}/acompanhantes`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                nome: acompanhante.nome,
                telefone: acompanhante.telefone || null,
                email: acompanhante.email || null,
                confirmado: true,
              }),
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Erro ao salvar acompanhante");
          }

          return await response.json();
        })
      );

      const resultadoAcompanhanteComId = await Promise.all(
        acompanhantesComId.map(async (acompanhante) => {
          const response = await fetch(
            `${API_CONVIDADOS}/${convidadoId}/acompanhantes/${acompanhante.id}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                nome: acompanhante.nome,
                telefone: acompanhante.telefone || null,
                email: acompanhante.email || null,
                confirmado: true,
              }),
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Erro ao salvar acompanhante");
          }

          return await response.json();
        })
      )

      setAcompanhantes(prev => [
        ...prev.filter(a => a.id),
        ...resultados.map(r => ({
          ...r.data,
          confirmado: true,
        })),
      ]);

    } catch (error) {
      console.error("Erro ao salvar acompanhantes:", error);
      setError(error.message);
      
      setMensagem({
        type: "error",
        content: (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center text-red-500"
          >
            {error.message}
          </motion.div>
        )
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const confirmarPresenca = async (status) => {
    try {
      setIsLoading(true);
      setError("");
      setMensagem("");
  
      if (!evento?.id) {
        throw new Error("Dados do evento não carregados corretamente");
      }
  
      try {
        if (desejaInformarAcompanhante && acompanhantes.length > 0) {
          await salvarAcompanhantes();
        }
      } catch (error) {
        return;
      }

      let statusEnviar = 0;

      if (status === 'sim') statusEnviar = 1;
      if (status === 'nao') statusEnviar = 2;
  
      const response = await fetch(
        `${API_CONVIDADOS}/${convidadoId}/eventos/${evento.id}/confirmacao`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            confirmado: statusEnviar,
            limite_acompanhante: limiteAcompanhantes,
          }),
        }
      );

      await fetchData()
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Erro ao confirmar presença");
      }
  
      setConfirmedStatus(status === "sim");
  
      if (status === "sim") {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
  
        setMensagem({
          type: "success",
          content: (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="relative h-32 mb-6">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full bg-gradient-to-br from-pink-300 to-purple-400"
                    style={{
                      width: Math.random() * 60 + 40,
                      height: Math.random() * 60 + 40,
                      left: `${Math.random() * 80 + 10}%`,
                      bottom: 0,
                    }}
                    animate={{
                      y: [0, -100, -200],
                      opacity: [1, 0.8, 0],
                      scale: [1, 1.1, 1.2],
                    }}
                    transition={{
                      duration: Math.random() * 3 + 2,
                      ease: "easeOut",
                      repeat: Infinity,
                      repeatDelay: Math.random() * 5,
                    }}
                  />
                ))}
              </div>
  
              <motion.h3
                className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-green-600 mb-6 tracking-tight"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                PRESENÇA CONFIRMADA! 🎊
              </motion.h3>
  
              <motion.div
                className="mb-6"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 10, -10, 0],
                  y: [0, -10, 0],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              >
                <Sparkles className="w-16 h-16 mx-auto text-yellow-400" />
              </motion.div>
  
              <motion.p
                className="text-xl md:text-2xl text-gray-700 mb-4 font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.7 }}
              >
                Estou <span className="font-bold text-emerald-600">radiante</span> com sua confirmação!
              </motion.p>
  
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(30)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-yellow-400 text-xl"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      y: [0, Math.random() * 100 + 50],
                      x: [0, Math.random() * 40 - 20],
                      opacity: [1, 0],
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: Math.random() * 3 + 2,
                      delay: Math.random() * 1.5,
                    }}
                  >
                    {['🎉', '✨', '🎊', '🥳', '🎈'][Math.floor(Math.random() * 5)]}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ),
        });
      } else {
        setMensagem({
          type: "info",
          content: (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
                className="mb-6"
              >
                <HeartCrack className="w-16 h-16 mx-auto text-rose-400" />
              </motion.div>
  
              <motion.h3
                className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-600 mb-4 tracking-tight"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Que pena! 😢
              </motion.h3>
  
              <motion.p
                className="text-xl md:text-2xl text-gray-700 mb-4 font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.7 }}
              >
                Sua ausência será <span className="font-bold text-rose-600">muito sentida</span>!
              </motion.p>
            </motion.div>
          ),
        });
      }
  
      const updatedResponse = await fetch(`${API_CONVIDADOS}/${convidadoId}`);
      if (updatedResponse.ok) {
        const updatedData = (await updatedResponse.json()).data;
        setConvidado(updatedData);
        if (updatedData.acompanhantes) {
          setAcompanhantes(
            updatedData.acompanhantes.map(a => ({
              ...a,
              confirmado: a.confirmado === 1,
            }))
          );
        }
      }
  
    } catch (error) {
      console.error("Erro na confirmação:", error);
      setError(error.message || "Ocorreu um erro. Tente novamente.");
      
      setMensagem({
        type: "error",
        content: (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <motion.div
              animate={{ 
                x: [-10, 10, -10, 10, 0],
              }}
              transition={{ 
                duration: 0.5,
              }}
              className="mb-4 text-red-500"
            >
              <X className="w-12 h-12 mx-auto" />
            </motion.div>
            <p className="text-xl font-medium text-red-600">
              Ops! Algo deu errado
            </p>
            <p className="text-gray-600">
              {error.message || "Tente novamente mais tarde"}
            </p>
          </motion.div>
        ),
      });
  
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <NavBar />
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={1000}
          gravity={0.15}
          tweenDuration={20000}
          colors={[
            "#ec4899",
            "#8b5cf6",
            "#3b82f6",
            "#10b981",
            "#f59e0b",
            "#ef4444",
            "#a855f7",
          ]}
          style={{ position: "fixed", zIndex: 9999 }}
        />
      )}

      <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-indigo-50 pt-6 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-gradient-to-br from-pink-100/30 to-indigo-100/30"
              style={{
                width: Math.random() * 400 + 100,
                height: Math.random() * 400 + 100,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, Math.random() * 100 - 50],
                x: [0, Math.random() * 100 - 50],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{
                duration: Math.random() * 30 + 15,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-3xl mx-auto relative z-10"
        >
          <div className="relative rounded-3xl overflow-hidden shadow-2xl group mb-6 md:mb-8">
            <div className="relative overflow-hidden">
              <motion.div className="w-full overflow-hidden">
                <motion.img
                  src={evento.imagem_evento || "/convite.jpg"}
                  alt={`Imagem do evento ${evento.nome}`}
                  className="w-full h-auto max-h-[700px] object-contain"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.2 }}
                  loading="eager"
                  onError={(e) => {
                    console.error("Erro ao carregar imagem:", e);
                    e.target.src = "/convite.jpg";
                  }}
                />
              </motion.div>
            </div>
          </div>

          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-gray-900 tracking-tight">
              {evento.nome || "Nome do Evento"}
            </h1>
            <motion.div
              className="w-24 h-1 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 mx-auto mb-6 rounded-full"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            />
          </motion.div>

          <motion.p
            className="text-lg md:text-xl text-gray-700 text-center mb-8 font-bold leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            Bem-vindo(a), {convidado.nome || "convidado"}
          </motion.p>

          <motion.p
            className="text-xl md:text-xl text-gray-700 text-center mb-8 font-light leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            {evento.descricao || "Descrição do evento"}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mt-8 rounded-3xl overflow-hidden shadow-xl"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3900.989312273572!2d-38.386530382556124!3d-12.112883599999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x716b9f273764e37%3A0xcd8de6c2e5963b66!2sHaras%20Bom%20Jesus%20Eventos!5e0!3m2!1spt-PT!2sbr!4v1743444753198!5m2!1spt-PT!2sbr"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="rounded-3xl"
              title="Localização do Evento - Haras Bom Jesus Eventos"
            />
          </motion.div>

          <div className="backdrop-blur-md bg-white/90 rounded-3xl overflow-hidden border border-white/50 shadow-xl">
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <motion.div
                  className="flex items-start gap-4 text-gray-700 bg-gradient-to-br from-white to-pink-50 p-5 rounded-2xl border border-pink-100/70 shadow-md hover:shadow-lg transition-all"
                  whileHover={{ y: -5 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  <div className="bg-gradient-to-br from-pink-100 to-pink-200 p-3 rounded-xl shadow-inner">
                    <Clock className="w-7 h-7 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg md:text-xl mb-1 text-gray-800">
                      Data e Hora
                    </h3>
                    <p className="text-base md:text-lg text-gray-600">
                      {evento.data_evento
                        ? new Date(evento.data_evento).toLocaleString("pt-BR", {
                            weekday: "long",
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Data não disponível"}
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-start gap-4 text-gray-700 bg-gradient-to-br from-white to-indigo-50 p-5 rounded-2xl border border-indigo-100/70 shadow-md hover:shadow-lg transition-all"
                  whileHover={{ y: -5 }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9, duration: 0.5 }}
                >
                  <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 p-3 rounded-xl shadow-inner">
                    <MapPin className="w-7 h-7 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg md:text-xl mb-1 text-gray-800">
                      Localização
                    </h3>
                    <p className="text-base md:text-lg text-gray-600">
                      {evento.local || "Local não informado"}
                    </p>
                  </div>
                </motion.div>

                {/* exibir nome e telefone do convidado na tela de confirmação*/}

                {/*<motion.div 
                className="flex items-start gap-4 text-gray-700 bg-gradient-to-br from white to-indigo-50 p-5 rounded 2xl border border-indigo-100/70 shadow-md hover:shadow-lg transition-all w-125"
                > 
                <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 p-3 rounded-xl shadow-inner">
                <UserSearch className="w-7 h-7 text-indigo-600" />
                </div>

                <div className="">
                <h3 className="font-bold text-lg md:text-xl mb-1 text-gray-800"> Olá, {convidado.nome}! Você é nosso(a) convidado(a)</h3>
              <p className="text-lg font-bold text-gray-600"> Seu telefone: {convidado.telefone}</p>
              </div>
               </motion.div>
               */}

                {/* inputs */}

                {/* Forma 2 de exibição de convidado*/}
                <div className="flex flex-col w-155">
              
                  <div>
                   

                    <div className="w-68 md:w-32 lg:w-190">
                      <h3 className=" text-center m-auto md:w-32 lg:w-190 font-bold md:text-xl mb-4 text-gray-800 text-2xl">
                        {" "}
                        Olá, {convidado.nome}! Você é nosso(a) convidado(a)
                      </h3>
                    </div>
                  </div>
               
                <div>
                  <h1 className="font-semibold text-gray-800 text-lg md:text-xl ">
                    Convidado
                  </h1>
                </div>
                <div className="space-y-4">
                  <div className="relative">
                    <div className=" relative left-4 top-9 text-gray-400">
                      <User size={22} />
                    </div>
                    <input
                      className={`w-70 md:w-32 lg:w-175 bg-gray-100 border border-gray-300 rounded-xl py-3 pl-12 pr-5 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all}`}
                      type="text"
                      value={convidado.nome || ""}
                      disabled
                    />

                    <div className="relative left-5 top-9 text-gray-400">
                      <Phone size={22} />
                    </div>
                    <input
                      className={`w-70 md:w-32 lg:w-175 bg-gray-100 border border-gray-300 rounded-xl py-3 pl-12 pr-5 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all cursor-not-allowed}`}
                      type="tel"
                      value={convidado.telefone || ""}
                      disabled
                    />

                    <div className="relative left-5 top-9 text-gray-400">
                      <Mail size={22} />
                    </div>
                    <input
                      className={`w-70 md:w-32 lg:w-175 bg-gray-100 border border-gray-300 rounded-xl py-3 pl-12 pr-5 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all}`}
                      type="text"
                      value={convidado.email || "email"}
                      disabled
                    />
                  </div>
                </div>
              </div>
            </div>
            </div>
            {/* Forma 2 de exibição de convidado final*/}

            <div className="mb-8 md:mb-10">
              {limiteAcompanhantes > 0 && (
                <motion.div
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-5 md:p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl mb-6 md:mb-8 border border-indigo-100 shadow-md"
                  whileHover={{ scale: 1.005 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="flex items-center gap-4 cursor-pointer mb-4 sm:mb-0">
                    <div className="relative">
                      <motion.div
                        whileTap={{ scale: 0.9 }}
                        className="relative"
                      >
                        <input
                          type="checkbox"
                          checked={desejaInformarAcompanhante}
                          onChange={handleToggleAcompanhante}
                          className="sr-only"
                          disabled={isConfirmed}
                        />
                        <div
                          className={`block w-14 h-8 rounded-full transition-colors ${
                            desejaInformarAcompanhante
                              ? "bg-indigo-600"
                              : "bg-gray-300"
                          } ${isConfirmed ? "opacity-50" : ""}`}
                        />
                        <div
                          className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                            desejaInformarAcompanhante
                              ? "transform translate-x-6"
                              : ""
                          } ${isConfirmed ? "opacity-70" : ""}`}
                        />
                      </motion.div>
                    </div>
                    <span
                      className={`text-gray-800 font-semibold text-lg md:text-xl ${
                        isConfirmed ? "opacity-70" : ""
                      }`}
                    >
                      Preencha os dados dos(as) acompanhante(s). (
                      {acompanhantes.filter((a) => a.nome).length}/
                      {limiteAcompanhantes})
                    </span>
                  </label>
                </motion.div>
              )}

              {desejaInformarAcompanhante && (
                <div className="space-y-4 md:space-y-6">
                  <AnimatePresence>
                    {acompanhantes.map((acompanhante, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.3 }}
                        className={`bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-lg relative overflow-hidden ${
                          isConfirmed ? "opacity-80" : ""
                        }`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-50/40 to-pink-50/40 opacity-30" />
                        <div className="relative z-10">
                          <div className="flex justify-between items-start mb-4 md:mb-5">
                            <h3 className="font-semibold text-gray-800 text-lg md:text-xl">
                              Acompanhante {index + 1}
                            </h3>
                            {(!acompanhante.id || acompanhantes.length > 1) &&
                              !isConfirmed && (
                                <motion.button
                                  onClick={() =>
                                    handleRemoveAcompanhante(index)
                                  }
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                  aria-label="Remover acompanhante"
                                >
                                  <X size={24} />
                                </motion.button>
                              )}
                          </div>

                          <div className="space-y-4">
                            <div className="relative">
                              <div className="absolute left-4 top-4 text-gray-400">
                                <User size={22} />
                              </div>
                              <input
                                className={`w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-5 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all ${
                                  isConfirmed ? "cursor-not-allowed" : ""
                                }`}
                                type="text"
                                placeholder="Nome completo"
                                value={acompanhante.nome || ""}
                                onChange={(e) =>
                                  handleChangeAcompanhante(
                                    index,
                                    "nome",
                                    e.target.value
                                  )
                                }
                                disabled={(isConfirmed) && !permiteAlterarDados ? true : false}
                              />
                            </div>

                            <div className="relative">
                              <div className="absolute left-4 top-4 text-gray-400">
                                <Phone size={22} />
                              </div>
                              <input
                                className={`w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-5 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all ${
                                  isConfirmed ? "cursor-not-allowed" : ""
                                }`}
                                type="tel"
                                placeholder="Telefone com DDD (opcional)"
                                value={acompanhante.telefone || ""}
                                onChange={(e) =>
                                  handleChangeAcompanhante(
                                    index,
                                    "telefone",
                                    e.target.value
                                  )
                                }
                                disabled={(isConfirmed) && !permiteAlterarDados ? true : false}
                              />
                            </div>

                            <div className="relative">
                              <div className="absolute left-4 top-4 text-gray-400">
                                <Mail size={22} />
                              </div>
                              <input
                                className={`w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-5 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all ${
                                  isConfirmed ? "cursor-not-allowed" : ""
                                }`}
                                type="email"
                                placeholder="E-mail (opcional)"
                                value={acompanhante.email || ""}
                                onChange={(e) =>
                                  handleChangeAcompanhante(
                                    index,
                                    "email",
                                    e.target.value
                                  )
                                }
                                disabled={(isConfirmed) && !permiteAlterarDados ? true : false}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            <div className="p-6 md:p-8 pt-4 pb-10 border-t border-indigo-100">
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-red-50 text-red-600 p-4 md:p-5 rounded-xl mb-6 md:mb-8 flex items-start gap-4 border border-red-100 shadow-md"
                  >
                    <div className="bg-red-100 p-2 rounded-full flex-shrink-0">
                      <X size={20} className="text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1 text-lg">
                        Ocorreu um erro
                      </h3>
                      <p>{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {mensagem && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`p-6 md:p-8 rounded-xl mb-6 md:mb-8 shadow-md ${
                      mensagem.type === "success"
                        ? "bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-100"
                        : "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100"
                    }`}
                  >
                    <div className="flex flex-col items-center text-center">
                      {typeof mensagem.content === "string" ? (
                        <>
                          <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="text-4xl mb-4"
                          >
                            {mensagem.emoji || "🎉"}
                          </motion.div>
                          <p className="text-xl font-medium">
                            {mensagem.content}
                          </p>
                        </>
                      ) : (
                        mensagem.content
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex flex-col sm:flex-row gap-4">
                {!isConfirmed && (
                  <motion.button
                    onClick={() => confirmarPresenca("sim")}
                    disabled={isLoading || isConfirmed}
                    whileHover={{
                      scale: isLoading || isConfirmed ? 1 : 1.05,
                      boxShadow: isLoading || isConfirmed ? "none" : "0 10px 25px -5px rgba(16, 185, 129, 0.3)",
                    }}
                    whileTap={{scale: isLoading || isConfirmed ? 1 : 0.98}}
                    className={`flex-1 cursor-pointer disabled:cursor-default bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-5 rounded-xl flex items-center justify-center gap-4 transition-all text-lg md:text-xl shadow-lg hover:shadow-emerald-300/50
                    ${isLoading ? 'opacity-70' : ''} 
                    ${isConfirmed ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isLoading ? (
                      <Loader2 className="w-7 h-7 animate-spin"/>
                    ) : (
                      <>
                        <Check size={26}/>
                        <span>{isConfirmed ? "Já confirmado!" : "Confirmar Presença"}</span>
                        <motion.span
                          animate={{scale: [1, 1.2, 1]}}
                          transition={{duration: 1.5, repeat: Infinity}}
                        >
                          🎉
                        </motion.span>
                      </>
                    )}
                  </motion.button>
                )}

                {isConfirmed && (
                  <GerarCredencialButton data_gerar_qrcode={evento.data_gerar_qrcode}/>
                )}

                {!isConfirmed ? (
                    <motion.button
                      disabled={isLoading || convidadoStatus === 'NAO_IREI'}
                      onClick={() => {
                        confirmarPresenca("nao")
                        setPermiteAlterarDados(false)
                      }}
                      whileHover={{
                        scale: isLoading ? 1 : 1.05,
                        boxShadow: isLoading ? "none" : "0 10px 25px -5px rgba(156, 163, 175, 0.3)",
                      }}
                      whileTap={{scale: isLoading ? 1 : 0.98}}
                      className={`flex-1 cursor-pointer bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-5 rounded-xl flex items-center justify-center gap-4 transition-all text-lg md:text-xl shadow-lg hover:shadow-gray-300/50
                    ${isLoading ? 'opacity-70' : ''}
                    ${convidadoStatus === 'NAO_IREI' ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    >
                      {isLoading ? (
                        <Loader2 className="w-7 h-7 animate-spin"/>
                      ) : (
                        <>
                          <X size={26}/>
                          <span>{convidadoStatus === 'NAO_IREI' ? "Ausência confirmada" : "Não Poderei Ir"}</span>
                          <motion.span
                            animate={{rotate: [0, 10, -10, 0]}}
                            transition={{duration: 1.5, repeat: Infinity}}
                          >
                            😢
                          </motion.span>
                        </>
                      )}
                    </motion.button>)
                  : (
                    <motion.button
                      onClick={() => {
                        setConfirmedStatus(false)
                        setPermiteAlterarDados(true)
                      }}
                      disabled={isLoading}
                      whileHover={{
                        scale: isLoading ? 1 : 1.05,
                        boxShadow: isLoading ? "none" : "0 10px 25px -5px rgba(156, 163, 175, 0.3)",
                      }}
                      whileTap={{scale: isLoading ? 1 : 0.98}}
                      className={`flex-1 p-3 p-none cursor-pointer bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all text-lg md:text-xl shadow-lg hover:shadow-gray-300/50
                    ${isLoading ? 'opacity-70' : ''}`}
                    >
                      {isLoading ? (
                        <Loader2 className="w-7 h-7 animate-spin"/>
                      ) : (
                        <>
                          <SquarePen size={26}/>
                          <span>Alterar Dados</span>
                          <motion.span
                            animate={{rotate: [0, 10, -10, 0]}}
                            transition={{duration: 1.5, repeat: Infinity}}
                          >
                            🔄
                          </motion.span>
                        </>
                      )}
                    </motion.button>
                  )}
              </div>
            
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}

export default EventCredential;