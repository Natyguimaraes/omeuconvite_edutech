import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Check, X, Clock, ChevronsUp, User, MapPin, Plus, Mail, Phone, Loader2, PartyPopper } from "lucide-react";
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

  // Configuração da URL da API
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

  // Componente do botão de confirmação premium
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
        
        setEvento(eventoData.data || eventoData);
    
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
  }, [convidadoId, API_CONVIDADOS, API_EVENTOS]);

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
        ...resultados.map(r => r.data)
      ]);

      setMensagem("Acompanhantes salvos com sucesso!");
      
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

        // efeitos de confirmação
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
        
        setMensagem(
          <div className="text-center animate-pulse">
            <PartyPopper className="w-12 h-12 mx-auto text-yellow-500 mb-4 animate-bounce" />
            <h3 className="text-3xl font-bold text-emerald-700 mb-2">CONFIRMADO! 🎉</h3>
            <p className="text-xl text-gray-700">Estamos muito felizes por você vir!</p>
            <p className="mt-4 text-gray-600">Contamos com sua presença!</p>
          </div>
        );
      } else {
        setMensagem(
          <div className="text-center py-4">
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Que pena! 😢</h3>
            <p className="text-lg">Sua ausência será sentida!</p>
            <p className="mt-2 text-gray-600">Caso mude de ideia, você pode confirmar depois.</p>
          </div>
        );
      }
      
      // Recarrega os dados do convidado
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
          numberOfPieces={500}
          gravity={0.2}
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-16 px-4 sm:px-6 lg:px-8 pt-24 relative overflow-hidden">
        {/* Efeitos de fundo animados */}
        <div className="absolute inset-0 overflow-hidden z-0">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-indigo-100 opacity-20"
              style={{
                width: Math.random() * 300 + 100,
                height: Math.random() * 300 + 100,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, Math.random() * 100 - 50],
                x: [0, Math.random() * 100 - 50],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{
                duration: Math.random() * 20 + 10,
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
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto relative z-10"
        >
          <div className="backdrop-blur-lg bg-white/90 rounded-3xl overflow-hidden border border-white/30 shadow-2xl">
            {/* Cabeçalho do Evento */}
            <div className="relative h-[28rem] overflow-hidden group">
              <motion.img
                src="/convite.jpg"
                alt="Imagem do Evento"
                className="w-full h-full object-cover object-center"
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.5 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white text-center">
                <motion.h1 
                  className="text-5xl font-bold mb-4 text-shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {evento.nome || "Nome do Evento"}
                </motion.h1>
                <motion.p 
                  className="text-2xl opacity-90 mb-6 text-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {evento.descricao || "Descrição do evento"}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <ChevronsUp size={48} className="mx-auto mt-4 animate-bounce text-yellow-300" />
                </motion.div>
              </div>
            </div>

            {/* Detalhes do Evento */}
            <div className="p-8 space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <motion.div 
                  className="flex items-start gap-4 text-gray-700 bg-white p-6 rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-shadow"
                  whileHover={{ y: -5 }}
                >
                  <div className="bg-indigo-100 p-3 rounded-xl">
                    <Clock className="w-8 h-8 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2 text-gray-800">Data e Hora</h3>
                    <p className="text-lg text-gray-600">
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
                  className="flex items-start gap-4 text-gray-700 bg-white p-6 rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-shadow"
                  whileHover={{ y: -5 }}
                >
                  <div className="bg-pink-100 p-3 rounded-xl">
                    <MapPin className="w-8 h-8 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2 text-gray-800">Localização</h3>
                    <p className="text-lg text-gray-600">{evento.local || "Local não informado"}</p>
                  </div>
                </motion.div>
              </div>

              <motion.div 
                className="rounded-2xl overflow-hidden shadow-xl border border-gray-200"
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15550.029344321243!2d-38.53476171451526!3d-13.003331889437622!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x716037ee92ceae7%3A0x97ede61f92ef397b!2sBarra%2C%20Salvador%20-%20BA!5e0!3m2!1spt-PT!2sbr!4v1742953169002!5m2!1spt-PT!2sbr" 
                  width="100%" 
                  height="350" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-xl"
                />
              </motion.div>
            </div>

            {/* Seção de Confirmação */}
            <div className="p-8 pt-0 pb-10">
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-red-50 text-red-600 p-5 rounded-xl mb-8 flex items-start gap-4 border border-red-100 shadow-md"
                  >
                    <div className="bg-red-100 p-2 rounded-full">
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
                    className={`p-8 rounded-xl mb-8 shadow-md ${
                      mensagem.props?.children?.props?.className?.includes('text-emerald-700') 
                        ? "bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200"
                        : "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200"
                    }`}
                  >
                    {mensagem}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Seção de Acompanhantes */}
              <div className="mb-10">
                {limiteAcompanhantes > 0 && (
                  <motion.div 
                    className="flex items-center justify-between p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl mb-8 border border-indigo-100 shadow-md"
                    whileHover={{ scale: 1.005 }}
                  >
                    <label className="flex items-center gap-4 cursor-pointer">
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
                      <span className="text-gray-800 font-semibold text-xl">
                        Informar acompanhantes? ({acompanhantes.length}/{limiteAcompanhantes})
                      </span>
                    </label>
                    {desejaInformarAcompanhante && acompanhantes.length < limiteAcompanhantes && (
                      <motion.button
                        onClick={handleAddAcompanhante}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-lg px-5 py-2 rounded-xl transition-all"
                      >
                        <Plus size={20} />
                        <span>Adicionar</span>
                      </motion.button>
                    )}
                  </motion.div>
                )}

                {desejaInformarAcompanhante && (
                  <div className="space-y-6">
                    <AnimatePresence>
                      {acompanhantes.map((acompanhante, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -100 }}
                          transition={{ duration: 0.3 }}
                          className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50 opacity-20" />
                          <div className="relative z-10">
                            <div className="flex justify-between items-start mb-5">
                              <h3 className="font-semibold text-gray-800 text-xl">
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
                            
                            <div className="space-y-5">
                              <div className="relative">
                                <div className="absolute left-4 top-4 text-gray-400">
                                  <User size={24} />
                                </div>
                                <input
                                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-5 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                  type="text"
                                  placeholder="Nome completo"
                                  value={acompanhante.nome}
                                  onChange={(e) => handleChangeAcompanhante(index, "nome", e.target.value)}
                                  disabled={!!acompanhante.id}
                                />
                              </div>
                              
                              <div className="relative">
                                <div className="absolute left-4 top-4 text-gray-400">
                                  <Phone size={24} />
                                </div>
                                <input
                                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-5 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                  type="tel"
                                  placeholder="Telefone com DDD (opcional)"
                                  value={acompanhante.telefone}
                                  onChange={(e) => handleChangeAcompanhante(index, "telefone", e.target.value)}
                                  disabled={!!acompanhante.id}
                                />
                              </div>
                              
                              <div className="relative">
                                <div className="absolute left-4 top-4 text-gray-400">
                                  <Mail size={24} />
                                </div>
                                <input
                                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-5 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                  type="email"
                                  placeholder="E-mail (opcional)"
                                  value={acompanhante.email}
                                  onChange={(e) => handleChangeAcompanhante(index, "email", e.target.value)}
                                  disabled={!!acompanhante.id}
                                />
                              </div>

                              {/* Botão de confirmação premium */}
                              <div className="flex items-center gap-4 pt-2">
                                <span className="text-gray-700 font-medium">Confirmar presença:</span>
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
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl py-4 px-6 flex items-center justify-center gap-3 transition-all disabled:opacity-70 text-xl shadow-lg hover:shadow-indigo-200/50"
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
                          </>
                        )}
                      </motion.button>
                    )}
                  </div>
                )}
              </div>

              {/* Botões de Confirmação */}
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  onClick={() => confirmarPresenca("sim")}
                  disabled={isLoading}
                  whileHover={{ scale: isLoading ? 1 : 1.03 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-5 rounded-xl flex items-center justify-center gap-4 transition-all disabled:opacity-70 text-xl shadow-lg hover:shadow-emerald-200/50"
                >
                  {isLoading ? (
                    <Loader2 className="w-7 h-7 animate-spin" />
                  ) : (
                    <>
                      <Check size={28} />
                      <span>Confirmar Presença</span>
                    </>
                  )}
                </motion.button>

                <motion.button
                  onClick={() => confirmarPresenca("nao")}
                  disabled={isLoading}
                  whileHover={{ scale: isLoading ? 1 : 1.03 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-5 rounded-xl flex items-center justify-center gap-4 transition-all disabled:opacity-70 text-xl shadow-lg hover:shadow-gray-200/50"
                >
                  {isLoading ? (
                    <Loader2 className="w-7 h-7 animate-spin" />
                  ) : (
                    <>
                      <X size={28} />
                      <span>Não Poderei Ir</span>
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