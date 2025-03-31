import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Check, X, Clock, User, MapPin, Plus, Mail, Phone, Loader2, Sparkles } from "lucide-react";
import Confetti from 'react-confetti';
import { motion, AnimatePresence } from "framer-motion";

function EventCredential() {
  const { convidadoId } = useParams();
  const [evento, setEvento] = useState({});
  const [convidado, setConvidado] = useState({});
  const [mensagem, setMensagem] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [acompanhantes, setAcompanhantes] = useState([]);
  const [desejaInformarAcompanhante, setDesejaInformarAcompanhante] = useState(false);
  const [error, setError] = useState("");
  const [limiteAcompanhantes, setLimiteAcompanhantes] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const API_CONVIDADOS = `${API_URL}/api/convidados`;
  const API_EVENTOS = `${API_URL}/api/eventos`;

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const ConfirmacaoButton = ({ confirmed, onClick, disabled }) => {
    return (
      <motion.button
        onClick={onClick}
        disabled={disabled}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        className={`relative overflow-hidden w-28 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
          confirmed 
            ? 'bg-gradient-to-r from-emerald-500 to-green-600 shadow-lg shadow-emerald-200/50' 
            : 'bg-gradient-to-r from-gray-300 to-gray-400 shadow-lg shadow-gray-200/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <motion.span 
          className={`absolute left-2 w-10 h-10 bg-white rounded-full shadow-md transition-all duration-300 ${
            confirmed ? 'transform translate-x-14' : 'transform translate-x-0'
          }`}
          layout
          transition={{ type: "spring", stiffness: 700, damping: 30 }}
        />
        <span className={`absolute text-white font-bold text-sm ${
          confirmed ? 'left-3' : 'right-3'
        }`}>
          {confirmed ? 'SIM' : 'NÃO'}
        </span>
      </motion.button>
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const convidadoResponse = await fetch(`${API_CONVIDADOS}/${convidadoId}`);
        const convidadoData = await convidadoResponse.json();
        
        const dadosConvidado = convidadoData.data || convidadoData;
        
        if (!dadosConvidado?.evento_id) {
          throw new Error("Convidado não associado a evento");
        }
    
        setConvidado(dadosConvidado);
        setLimiteAcompanhantes(dadosConvidado.limite_acompanhante || 0);
    
        const eventoResponse = await fetch(`${API_EVENTOS}/${dadosConvidado.evento_id}`);
        const eventoData = await eventoResponse.json();
        
        const eventoFormatado = eventoData.data || eventoData;
        setEvento({
          ...eventoFormatado,
          imagem_evento: eventoFormatado.imagem_url || eventoFormatado.imagem_evento
        });
    
        if (dadosConvidado.acompanhantes?.length > 0) {
          setAcompanhantes(dadosConvidado.acompanhantes.map(a => ({
            ...a,
            confirmado: a.confirmado === 1
          })));
          setDesejaInformarAcompanhante(true);
        }
    
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [convidadoId]);

  const handleToggleAcompanhante = () => {
    const newValue = !desejaInformarAcompanhante;
    setDesejaInformarAcompanhante(newValue);
    
    if (!newValue) {
      setAcompanhantes([]);
    } else if (convidado?.acompanhantes) {
      setAcompanhantes(
        convidado.acompanhantes.map(a => ({ 
          ...a, 
          confirmado: a.confirmado === 1 
        }))
      );
    }
  };

  const handleAddAcompanhante = () => {
    if (acompanhantes.length >= limiteAcompanhantes) {
      setError(`Limite de ${limiteAcompanhantes} acompanhantes atingido`);
      return;
    }
    setAcompanhantes([...acompanhantes, { nome: "", telefone: "", email: "", confirmado: true }]);
  };

  const handleRemoveAcompanhante = (index) => {
    const updatedAcompanhantes = [...acompanhantes];
    const removed = updatedAcompanhantes.splice(index, 1);
    
    if (removed[0]?.id) {
      setIsLoading(true);
      fetch(`${API_CONVIDADOS}/acompanhantes/${removed[0].id}`, {
        method: 'DELETE'
      })
      .then(response => {
        if (!response.ok) throw new Error("Erro ao remover acompanhante");
        setAcompanhantes(updatedAcompanhantes);
        setMensagem("Acompanhante removido com sucesso");
      })
      .catch(error => {
        console.error("Erro ao remover acompanhante:", error);
        setError("Erro ao remover acompanhante");
      })
      .finally(() => setIsLoading(false));
    } else {
      setAcompanhantes(updatedAcompanhantes);
    }
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
    setIsLoading(true);
    setError("");
    
    try {
      const novosAcompanhantes = acompanhantes.filter(a => !a.id);
      
      if (novosAcompanhantes.length === 0) {
        setMensagem("Nenhum novo acompanhante para salvar");
        return;
      }

      const temAcompanhantesInvalidos = novosAcompanhantes.some(a => !a.nome);
      if (temAcompanhantesInvalidos) {
        throw new Error("Nome é obrigatório para todos os acompanhantes");
      }

      const resultados = await Promise.all(
        novosAcompanhantes.map(async (acompanhante) => {
          const response = await fetch(
            `${API_CONVIDADOS}/${convidadoId}/acompanhantes`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                nome: acompanhante.nome,
                telefone: acompanhante.telefone || null,
                email: acompanhante.email || null,
                confirmado: true
              })
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Erro ao salvar acompanhante");
          }

          return await response.json();
        })
      );

      setAcompanhantes(prev => [
        ...prev.filter(a => a.id),
        ...resultados.map(r => ({
          ...r.data,
          confirmado: true
        }))
      ]);

      setMensagem({
        type: "success",
        content: "Acompanhantes salvos com sucesso!",
        emoji: "🎉"
      });
      
    } catch (error) {
      console.error("Erro ao salvar acompanhantes:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmarPresenca = async (status) => {
    setIsLoading(true);
    setError("");
    
    try {
      const responseConvidado = await fetch(
        `${API_CONVIDADOS}/${convidadoId}/confirmacao`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ confirmado: status === "sim" })
        }
      );

      if (!responseConvidado.ok) {
        throw new Error("Erro ao confirmar presença do convidado principal");
      }

      if (status === "sim") {
        const acompanhantesParaEnviar = acompanhantes
          .filter(a => a.id)
          .map(a => ({
            id: a.id,
            confirmado: a.confirmado
          }));

        if (acompanhantesParaEnviar.length > 0) {
          const responseAcompanhantes = await fetch(
            `${API_CONVIDADOS}/${convidadoId}/confirmar-acompanhantes`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                acompanhantes: acompanhantesParaEnviar
              })
            }
          );

          if (!responseAcompanhantes.ok) {
            const errorData = await responseAcompanhantes.json();
            throw new Error(errorData.erro || "Erro ao confirmar acompanhantes");
          }
        }

        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
        
        setMensagem({
          type: "success",
          content: (
            <div className="text-center">
              <h3 className="text-3xl md:text-4xl font-bold text-emerald-600 mb-4 tracking-tight">
                CONFIRMADO! 🎉
              </h3>
              <p className="text-xl md:text-2xl text-gray-700 mb-2">
                Ficamos muito felizes com sua confirmação!
              </p>
              <p className="mt-4 text-gray-600">
                Contamos com sua presença na celebração!
              </p>
            </div>
          )
        });
      } else {
        setMensagem({
          type: "info",
          content: (
            <div className="text-center">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-700 mb-3">
                Que pena! 😢
              </h3>
              <p className="text-lg md:text-xl">
                Sua ausência será sentida!
              </p>
              <p className="mt-2 text-gray-600">
                Caso mude de ideia, você pode confirmar depois.
              </p>
            </div>
          )
        });
      }
      
      const response = await fetch(`${API_CONVIDADOS}/${convidadoId}`);
      if (response.ok) {
        const data = await response.json();
        setConvidado(data);
        if (data.acompanhantes) {
          setAcompanhantes(
            data.acompanhantes.map(a => ({ 
              ...a, 
              confirmado: a.confirmado === 1 
            }))
          );
        }
      }
    } catch (error) {
      console.error("Erro:", error);
      setError(error.message || "Ocorreu um erro. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={800}
          gravity={0.15}
          tweenDuration={5000}
          colors={['#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#a855f7']}
          style={{ position: 'fixed', zIndex: 9999 }}
        />
      )}

      <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-indigo-50 pt-6 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Animated background elements */}
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
          {/* Event header with original image size */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl group mb-6 md:mb-8">
  <div className="relative overflow-hidden">
    <motion.div className="w-full overflow-hidden">
      <motion.img
        src={evento.imagem_evento || "/convite.jpg"}
        alt={`Imagem do evento ${evento.nome}`}
        className="w-full h-auto max-h-[500px] object-contain"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        loading="eager"
        onError={(e) => {
          console.error('Erro ao carregar imagem:', e);
          e.target.src = "/convite.jpg"; // Força o fallback em caso de erro
        }}
      />
                 
                </motion.div>
              ) : (
                <motion.div 
                  className="w-full h-60"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8 }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: 360 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  >
                    <Sparkles className="text-white w-16 h-16" />
                  </motion.div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Event name section below the image */}
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

          {/* Main content card */}
          <div className="backdrop-blur-md bg-white/90 rounded-3xl overflow-hidden border border-white/50 shadow-xl">
            {/* Event description and details */}
            <div className="p-6 md:p-8">
              <motion.p 
                className="text-lg md:text-xl text-gray-700 text-center mb-8 font-light leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.8 }}
              >
                {evento.descricao || "Descrição do evento"}
              </motion.p>
              
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
                    <h3 className="font-bold text-lg md:text-xl mb-1 text-gray-800">Data e Hora</h3>
                    <p className="text-base md:text-lg text-gray-600">
                      {evento.data_evento
                        ? new Date(evento.data_evento).toLocaleString("pt-BR", {
                            weekday: 'long',
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
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
                    <h3 className="font-bold text-lg md:text-xl mb-1 text-gray-800">Localização</h3>
                    <p className="text-base md:text-lg text-gray-600">{evento.local || "Local não informado"}</p>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Form Section */}
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
                      <h3 className="font-bold mb-1 text-lg">Ocorreu um erro</h3>
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
                      {typeof mensagem.content === 'string' ? (
                        <>
                          <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="text-4xl mb-4"
                          >
                            {mensagem.emoji || "🎉"}
                          </motion.div>
                          <p className="text-xl font-medium">{mensagem.content}</p>
                        </>
                      ) : (
                        mensagem.content
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

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
                          />
                          <div className={`block w-14 h-8 rounded-full transition-colors ${
                            desejaInformarAcompanhante ? 'bg-indigo-600' : 'bg-gray-300'
                          }`} />
                          <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                            desejaInformarAcompanhante ? 'transform translate-x-6' : ''
                          }`} />
                        </motion.div>
                      </div>
                      <span className="text-gray-800 font-semibold text-lg md:text-xl">
                        Informar acompanhantes? ({acompanhantes.length}/{limiteAcompanhantes})
                      </span>
                    </label>
                    {desejaInformarAcompanhante && acompanhantes.length < limiteAcompanhantes && (
                      <motion.button
                        onClick={handleAddAcompanhante}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium text-base md:text-lg px-5 py-3 rounded-xl transition-all shadow-lg hover:shadow-indigo-300/50"
                      >
                        <Plus size={20} />
                        <span>Adicionar Acompanhante</span>
                      </motion.button>
                    )}
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
                          className="bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-lg relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-50/40 to-pink-50/40 opacity-30" />
                          <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4 md:mb-5">
                              <h3 className="font-semibold text-gray-800 text-lg md:text-xl">
                                Acompanhante {index + 1}
                              </h3>
                              {(!acompanhante.id || acompanhantes.length > 1) && (
                                <motion.button 
                                  onClick={() => handleRemoveAcompanhante(index)}
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
                                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-5 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                  type="text"
                                  placeholder="Nome completo"
                                  value={acompanhante.nome || ""}
                                  onChange={(e) => handleChangeAcompanhante(index, "nome", e.target.value)}
                                  disabled={!!acompanhante.id}
                                />
                              </div>
                              
                              <div className="relative">
                                <div className="absolute left-4 top-4 text-gray-400">
                                  <Phone size={22} />
                                </div>
                                <input
                                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-5 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                  type="tel"
                                  placeholder="Telefone com DDD (opcional)"
                                  value={acompanhante.telefone || ""}
                                  onChange={(e) => handleChangeAcompanhante(index, "telefone", e.target.value)}
                                  disabled={!!acompanhante.id}
                                />
                              </div>
                              
                              <div className="relative">
                                <div className="absolute left-4 top-4 text-gray-400">
                                  <Mail size={22} />
                                </div>
                                <input
                                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-5 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                  type="email"
                                  placeholder="E-mail (opcional)"
                                  value={acompanhante.email || ""}
                                  onChange={(e) => handleChangeAcompanhante(index, "email", e.target.value)}
                                  disabled={!!acompanhante.id}
                                />
                              </div>

                              <div className="flex items-center gap-4 pt-2">
                                <span className="text-gray-700 font-medium text-base md:text-lg">Confirmar presença:</span>
                                <ConfirmacaoButton
                                  confirmed={acompanhante.confirmado}
                                  onClick={() => toggleConfirmacaoAcompanhante(index)}
                                  disabled={!acompanhante.id}
                                />
                                {!acompanhante.id && (
                                  <span className="text-sm text-gray-500">(Salve primeiro para confirmar)</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    
                    {acompanhantes.some(a => !a.id) && (
                      <motion.button
                        type="button"
                        onClick={salvarAcompanhantes}
                        disabled={isLoading}
                        whileHover={{ scale: isLoading ? 1 : 1.03 }}
                        whileTap={{ scale: isLoading ? 1 : 0.98 }}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl py-4 px-6 flex items-center justify-center gap-3 transition-all disabled:opacity-70 text-lg md:text-xl shadow-lg hover:shadow-purple-200/50"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span>Salvando...</span>
                          </>
                        ) : (
                          <>
                            <Check size={24} />
                            <span>Salvar Acompanhantes</span>
                            <motion.span
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              💾
                            </motion.span>
                          </>
                        )}
                      </motion.button>
                    )}
                  </div>
                )}
              </div>

              {/* Confirmation Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  onClick={() => confirmarPresenca("sim")}
                  disabled={isLoading}
                  whileHover={{ scale: isLoading ? 1 : 1.05, boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.3)" }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-5 rounded-xl flex items-center justify-center gap-4 transition-all disabled:opacity-70 text-lg md:text-xl shadow-lg hover:shadow-emerald-300/50"
                >
                  {isLoading ? (
                    <Loader2 className="w-7 h-7 animate-spin" />
                  ) : (
                    <>
                      <Check size={26} />
                      <span>Confirmar Presença</span>
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        🎉
                      </motion.span>
                    </>
                  )}
                </motion.button>

                <motion.button
                  onClick={() => confirmarPresenca("nao")}
                  disabled={isLoading}
                  whileHover={{ scale: isLoading ? 1 : 1.05, boxShadow: "0 10px 25px -5px rgba(156, 163, 175, 0.3)" }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-5 rounded-xl flex items-center justify-center gap-4 transition-all disabled:opacity-70 text-lg md:text-xl shadow-lg hover:shadow-gray-300/50"
                >
                  {isLoading ? (
                    <Loader2 className="w-7 h-7 animate-spin" />
                  ) : (
                    <>
                      <X size={26} />
                      <span>Não Poderei Ir</span>
                      <motion.span
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        😢
                      </motion.span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}

export default EventCredential;
