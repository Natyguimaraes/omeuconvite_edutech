import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
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
  HeartCrack,
  SquarePen,
  PartyPopper,
  Plus,
} from "lucide-react";
import Confetti from "react-confetti";
import { motion, AnimatePresence } from "framer-motion";
import GerarCredencialButton from "../../components/qrcode/GerarCredencialButton";
import { formatPhoneNumber } from "../../utils/phoneUtils";

function EventCredential() {
  const [searchParams] = useSearchParams();
  const eventoId = searchParams.get("eventoId");

  const { convidadoId } = useParams();
  const [evento, setEvento] = useState({});
  const [convidadoStatus, setConvidadoStatus] = useState(null); // 'PENDENTE', 'CONFIRMADO', 'NAO_IREI'
  const [convidado, setConvidado] = useState({});
  const [mensagem, setMensagem] = useState(""); 
  const [isLoading, setIsLoading] = useState(false);
  const [acompanhantes, setAcompanhantes] = useState([]);
  const [desejaInformarAcompanhante, setDesejaInformarAcompanhante] =
    useState(false);
  const [error, setError] = useState(""); //msg erros
  const [limiteAcompanhantes, setLimiteAcompanhantes] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [confirmedStatus, setConfirmedStatus] = useState(null); 
  const [permiteAlterarDados, setPermiteAlterarDados] = useState(false); // Flag para habilitar/desabilitar campos

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const API_CONVIDADOS = `${API_URL}/api/convidados`;
  const API_EVENTOS = `${API_URL}/api/eventos`;


  const isConfirmed = useMemo(() => {
    return confirmedStatus !== null ? confirmedStatus : convidado?.confirmado;
  }, [confirmedStatus, convidado]);

  // Efeito para redimensionamento da janela (para Confetti)
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

      const convidadoResponse = await fetch(
        `${API_CONVIDADOS}/${convidadoId}?include=eventos,acompanhantes`
      );
      if (!convidadoResponse.ok) {
        throw new Error(
          `Erro ao buscar convidado: ${convidadoResponse.status}`
        );
      }

      const responseData = await convidadoResponse.json();
      const dadosConvidado = responseData.data || responseData;


      dadosConvidado.eventos = Array.isArray(dadosConvidado.eventos)
        ? dadosConvidado.eventos.filter((e) => String(e.id) === String(eventoId))
        : [];

      const eventoConvidadoRelacao = dadosConvidado.eventos?.[0] || null;

      // Valida se o convidado está associado a este evento
      if (!eventoConvidadoRelacao) {
        throw new Error("Convidado não associado a este evento específico.");
      }

      // 2. Determina o limite de acompanhantes (prioridade para o limite do evento)
      const limiteFinal = Number(eventoConvidadoRelacao?.limite_acompanhante) || 0;
      setLimiteAcompanhantes(limiteFinal);

      // Determina o status de confirmação do convidado principal para ESTE evento (0, 1, 2)
      const statusConvidadoPrincipal = Number(eventoConvidadoRelacao?.confirmado);

      // Define o estado de confirmedStatus (boolean) para o toggle
      setConfirmedStatus(statusConvidadoPrincipal === 1);

      // Define o status textual para exibição
      switch (statusConvidadoPrincipal) {
        case 2:
          setConvidadoStatus("NAO_IREI");
          break;
        case 1:
          setConvidadoStatus("CONFIRMADO");
          break;
        case 0:
          setConvidadoStatus("PENDENTE");
          break;
        default:
          setConvidadoStatus(null);
          break;
      }

      // 3. Processa acompanhantes existentes (filtrando por evento e convidado atual)
      const acompanhantesExistentesDoEvento = Array.isArray(
        dadosConvidado.acompanhantes
      )
        ? dadosConvidado.acompanhantes
            .filter(
              (a) =>
                Number(a.convidado_evento_evento_id) === Number(eventoId) &&
                Number(a.convidado_evento_convidado_id) ===
                  Number(convidadoId) &&
                Number(a.ativo_acompanhante) === 1 // Apenas acompanhantes ATIVOS
            )
            .map((a) => ({
              ...a,
              id: a.id,
              nome: a.nome || "",
              telefone: formatPhoneNumber(a.telefone || ""), // Formata aqui também
              email: a.email || "",
              confirmado: Number(a.confirmado), // Manter como número (0, 1, 2)
              convidado_evento_convidado_id: Number(a.convidado_evento_convidado_id),
              convidado_evento_evento_id: Number(a.convidado_evento_evento_id),
            }))
        : [];

      // Calcula quantos "slots" de acompanhantes vazios precisamos preencher ATÉ o limite
      const slotsParaPreencher = Math.max(
        0,
        limiteFinal - acompanhantesExistentesDoEvento.length
      );

      // Cria os slots vazios para novos acompanhantes, herdando o status do pai
      const novosAcompanhantesVazios = Array.from(
        { length: slotsParaPreencher },
        () => ({
          nome: "",
          telefone: "",
          email: "",
          confirmado: statusConvidadoPrincipal, // Status do convidado principal
          convidado_evento_convidado_id: Number(convidadoId),
          convidado_evento_evento_id: Number(eventoId),
        })
      );

      // Define o estado de acompanhantes com os existentes e os novos slots
      setAcompanhantes([...acompanhantesExistentesDoEvento, ...novosAcompanhantesVazios]);

      // Define se o toggle de "desejaInformarAcompanhante" deve estar ligado.
      // Ele deve estar ligado se houver limite OU se já houver acompanhantes existentes.
      setDesejaInformarAcompanhante(limiteFinal > 0 || acompanhantesExistentesDoEvento.length > 0);

      // 4. Busca dados completos do evento (se não vier no payload do convidado)
      // O eventoId da URL é a fonte principal.
      const eventoResponse = await fetch(`${API_EVENTOS}/${eventoId}`);
      if (!eventoResponse.ok) {
        throw new Error(`Erro ao buscar evento: ${eventoResponse.status}`);
      }
      const eventoData = await eventoResponse.json();
      const eventoFormatado = eventoData.data || eventoData;

      // 5. Atualiza estados do convidado e evento
      setConvidado({
        id: dadosConvidado.id,
        nome: dadosConvidado.nome || "Convidado",
        telefone: formatPhoneNumber(dadosConvidado.telefone || ""),
        email: dadosConvidado.email || "",
        confirmado: statusConvidadoPrincipal === 1, // Boolean para o isConfirmed
        limite_acompanhante: limiteFinal, // É o limite específico do evento
        // Mapeia acompanhantes já no formato que o `handleEdit` espera
        acompanhantes: acompanhantesExistentesDoEvento,
      });

      setEvento({
        id: eventoFormatado.id,
        nome: eventoFormatado.nome || "Evento",
        descricao: eventoFormatado.descricao || "Descrição do evento",
        data_evento: eventoFormatado.data_evento || new Date().toISOString(),
        data_gerar_qrcode: eventoFormatado.data_gerar_qrcode || eventoFormatado.dataGerarQrCode || null,
        local: eventoFormatado.local || "Local não especificado",
        imagem_evento: eventoFormatado.imagem_evento,
      });

    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      setError(error.message); // Define o erro como string
      setConvidado({
        id: convidadoId,
        nome: "Convidado",
        confirmado: false,
        limite_acompanhante: 0,
      });
      setEvento({
        nome: "Evento",
        descricao: "Descrição do evento",
        data_evento: new Date().toISOString(),
        local: "Local não especificado",
        imagem_evento: "",
      });
    } finally {
      setIsLoading(false);
    }
  }, [convidadoId, eventoId]); // Dependências de useCallback

  // Efeito para carregar dados iniciais
  useEffect(() => {
    fetchData();
  }, [fetchData]); // fetchData é uma dependência porque é um useCallback

  // Adicionar um novo campo de acompanhante vazio
  const handleAddAcompanhante = () => {
    if (acompanhantes.length >= limiteAcompanhantes) {
      setError(`Limite de ${limiteAcompanhantes} acompanhantes atingido`);
      return;
    }

    // Pega o status atual do convidado principal no eventoId, para novos acompanhantes
    // (Precisa buscar do estado `convidado` ou `convidados` se `convidado` não for o objeto completo)
    const convidadoAtual = convidado; // `convidado` já está no estado com o status correto

    const statusConvidadoPrincipalNoMomento = Number(
      convidadoAtual?.confirmado === true ? 1 : convidadoAtual?.confirmado === false ? 0 : convidadoAtual?.confirmado
    );


    setAcompanhantes([
      ...acompanhantes,
      {
        nome: "",
        telefone: "",
        email: "",
        confirmado: statusConvidadoPrincipalNoMomento, // Herda o status do pai
        convidado_evento_convidado_id: Number(convidadoId),
        convidado_evento_evento_id: Number(eventoId),
      },
    ]);
  };

  // Alternar se deseja informar acompanhantes
  const handleToggleAcompanhante = () => {
    // Permite alternar se não está confirmado e não está em modo de alteração de dados
    if (isConfirmed && !permiteAlterarDados) return;

    const newValue = !desejaInformarAcompanhante;
    setDesejaInformarAcompanhante(newValue);

    if (!newValue) {
      // Se desmarcar, limpa os acompanhantes no estado do formulário
      setAcompanhantes([]);
    } else {
      // Se marcar novamente, e a lista de acompanhantes no estado `convidado` está vazia
      // ou não contêm os acompanhantes do evento atual, precisa popular.

      // Pega o status atual do convidado principal no eventoId, para novos acompanhantes
      const convidadoAtual = convidado; // `convidado` já está no estado com o status correto
      const statusConvidadoPrincipalNoMomento = Number(
        convidadoAtual?.confirmado === true ? 1 : convidadoAtual?.confirmado === false ? 0 : convidadoAtual?.confirmado
      );

      // Recria a lista de acompanhantes, incluindo os existentes e novos slots, se houver limite
      const acompanhantesExistentesFiltrados = (convidado.acompanhantes || []).filter(a =>
        Number(a.convidado_evento_evento_id) === Number(eventoId) &&
        Number(a.convidado_evento_convidado_id) === Number(convidadoId) &&
        Number(a.ativo_acompanhante) === 1
      );

      const slotsParaPreencher = Math.max(0, limiteAcompanhantes - acompanhantesExistentesFiltrados.length);

      const novosAcompanhantesVazios = Array.from({ length: slotsParaPreencher }, () => ({
        nome: "",
        telefone: "",
        email: "",
        confirmado: statusConvidadoPrincipalNoMomento,
        convidado_evento_convidado_id: Number(convidadoId),
        convidado_evento_evento_id: Number(eventoId),
      }));

      setAcompanhantes([...acompanhantesExistentesFiltrados, ...novosAcompanhantesVazios]);
    }
  };

  // Remover acompanhante do formulário e do backend (se tiver ID)
  const handleRemoveAcompanhante = async (index) => {
    // Se o convidado principal está confirmado e não estamos em modo de alteração de dados
    if (isConfirmed && !permiteAlterarDados) return;

    const updatedAcompanhantes = [...acompanhantes];
    const removed = updatedAcompanhantes.splice(index, 1);

    if (removed[0]?.id) {
      // Se o acompanhante tem ID, tenta removê-lo do backend (inativar)
      setIsLoading(true);
      try {
        const response = await fetch(
          `${API_CONVIDADOS}/acompanhantes/${removed[0].id}`,
          {
            method: "DELETE",
          }
        );
        if (!response.ok) throw new Error("Erro ao remover acompanhante do sistema.");
        
        setAcompanhantes(updatedAcompanhantes);
        setMensagem({ type: "success", content: "Acompanhante removido com sucesso!" });
      } catch (error) {
        console.error("Erro ao remover acompanhante:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Apenas remove do estado se for um acompanhante novo (sem ID)
      setAcompanhantes(updatedAcompanhantes);
    }
  };

  // Lidar com mudanças nos campos dos acompanhantes
  const handleChangeAcompanhante = (index, field, value) => {
    // Permite alterar se não está confirmado OU se está em modo de alteração de dados
    if (isConfirmed && !permiteAlterarDados) return;

    const updatedAcompanhantes = [...acompanhantes];
    updatedAcompanhantes[index][field] = value;
    setAcompanhantes(updatedAcompanhantes);
  };

  // Salvar acompanhantes (novos e atualizados)
  const salvarAcompanhantes = async () => {
    setIsLoading(true);
    setError(""); // Limpa erros anteriores

    try {
      // Re-fetch para ter os dados mais atualizados do convidado (especialmente o limite de acompanhantes)
      const convidadoResponse = await fetch(`${API_CONVIDADOS}/${convidadoId}`);
      const convidadoData = await convidadoResponse.json();
      const dadosConvidadoOriginal = convidadoData.data || convidadoData;

      // Filtra acompanhantes originais apenas para o evento atual
      const acompanhantesOriginaisDoEvento = dadosConvidadoOriginal.acompanhantes?.filter(a =>
          Number(a.convidado_evento_evento_id) === Number(eventoId) &&
          Number(a.convidado_evento_convidado_id) === Number(convidadoId)
      ) || [];

      const acompanhantesAtuaisNoBanco = acompanhantesOriginaisDoEvento.length;
      const novosAcompanhantesNoForm = acompanhantes.filter(a => !a.id && a.nome).length;
      
      // Validação de limite: soma acompanhantes já existentes no banco com os NOVOS do formulário
      if (acompanhantesAtuaisNoBanco + novosAcompanhantesNoForm > limiteAcompanhantes) {
          throw new Error(`Limite de ${limiteAcompanhantes} acompanhantes atingido.`);
      }

      const acompanhantesParaProcessar = acompanhantes.filter(a => a.nome && a.nome.trim());
      const acompanhantesParaCriar = acompanhantesParaProcessar.filter(a => !a.id);
      const acompanhantesParaAtualizar = acompanhantesParaProcessar.filter(a => a.id);

      const promisesAcompanhantes = [];

      acompanhantesParaCriar.forEach(acompanhante => {
        promisesAcompanhantes.push(
          fetch(`${API_CONVIDADOS}/${convidadoId}/acompanhantes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nome: acompanhante.nome,
              telefone: acompanhante.telefone || null,
              email: acompanhante.email || null,
              confirmado: acompanhante.confirmado, // Usa o status do objeto
              evento_id: Number(eventoId), // ID do evento
            }),
          }).then(async (response) => {
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || `Erro ao criar acompanhante ${acompanhante.nome}`);
            }
            return response.json();
          })
        );
      });

      acompanhantesParaAtualizar.forEach(acompanhante => {
        promisesAcompanhantes.push(
          fetch(`${API_CONVIDADOS}/acompanhantes/${acompanhante.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nome: acompanhante.nome,
              telefone: acompanhante.telefone || null,
              email: acompanhante.email || null,
              confirmado: acompanhante.confirmado, // Usa o status do objeto
            }),
          }).then(async (response) => {
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || `Erro ao atualizar acompanhante ${acompanhante.nome}`);
            }
            return response.json();
          })
        );
      });

      await Promise.all(promisesAcompanhantes);
      
      // Após salvar, re-fetch os dados para atualizar o estado completo da tela
      await fetchData(); 

      setMensagem({ type: "success", content: "Acompanhantes salvos com sucesso!" });

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
        ),
      });
      throw error; // Rejeita a promise para que confirmarPresenca possa capturar
    } finally {
      setIsLoading(false);
    }
  };

  // Função principal para confirmar ou negar presença
  const confirmarPresenca = async (status) => {
    try {
      setIsLoading(true);
      setError("");
      setMensagem("");

      if (!evento?.id) {
        throw new Error("Dados do evento não carregados corretamente");
      }

      // Se há acompanhantes para informar, tenta salvá-los primeiro
      if (desejaInformarAcompanhante) {
        await salvarAcompanhantes(); // Se `salvarAcompanhantes` falhar, ele lançará um erro e a execução parará aqui
      }

      let statusEnviar = 0; // Padrão: Pendente
      if (status === "sim") statusEnviar = 1; // Confirmado
      if (status === "nao") statusEnviar = 2; // Não comparecerá

      const response = await fetch(
        `${API_CONVIDADOS}/${convidadoId}/eventos/${evento.id}`, // Rota PUT para a relação convidado-evento
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            confirmado: statusEnviar,
            limite_acompanhante: limiteAcompanhantes,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Erro ao confirmar presença do convidado principal");
      }

      setConfirmedStatus(status === "sim"); // Atualiza o estado local de confirmação
      await fetchData(); // Re-fetch para atualizar todos os dados da tela após a confirmação/alteração

      if (status === "sim") {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000); // Confetti por 5 segundos

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
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full bg-gradient-to-br from-pink-300 to-purple-400"
                    style={{
                      width: Math.random() * 70 + 50,
                      height: Math.random() * 50 + 20,
                      left: `${Math.random() * 80 + 10}%`,
                      bottom: 0,
                    }}
                    animate={{
                      y: [0, -100, -200],
                      opacity: [1, 0.8, 0],
                      scale: [1, 1.1, 1.2],
                    }}
                    transition={{
                      duration: Math.random() * 5 + 3,
                      ease: "easeOut",
                      repeat: Infinity,
                      repeatDelay: Math.random() * 4,
                    }}
                  />
                ))}
              </div>

              <motion.h3
                className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-indigo-500 mb-6 tracking-normal"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                PRESENÇA CONFIRMADA!
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
                Estou <span className="font-bold text-indigo-600">radiante</span>{" "}
                com sua confirmação!
              </motion.p>

              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(50)].map((_, i) => (
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
                      duration: Math.random() * 5 + 3,
                      delay: Math.random() * 1.0,
                    }}
                  >
                    {["🎉", "✨", "🎊", "🥳", "🎈"][Math.floor(Math.random() * 5)]}
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
                  duration: 0.6,
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
                Sua ausência será{" "}
                <span className="font-bold text-rose-600">muito sentida</span>!
              </motion.p>
            </motion.div>
          ),
        });
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
            <p className="text-xl font-medium text-red-600">Ops! Algo deu errado</p>
            <p className="text-gray-600">{error.message || "Tente novamente mais tarde"}</p>
          </motion.div>
        ),
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- Renderização do Componente ---
  return (
    <>
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

      <div className="min-h-screen bg-white pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden pt-10">
        {/* Background bubbles animation */}
        <div className="absolute bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400 w-32 h-32 rounded-full top-10 left-10 z-0 blur-xl animate-float opacity-60"></div>
        <div className="absolute bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-400 w-40 h-40 rounded-full top-20 right-20 z-0 blur-lg animate-pulse-glow opacity-50"></div>
        <div className="absolute bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-400 w-36 h-36 rounded-full top-1/3 left-1/4 z-0 blur-xl animate-float-slow opacity-40"></div>
        <div className="absolute bg-gradient-to-r from-orange-300 via-pink-300 to-rose-400 w-48 h-48 rounded-full bottom-32 right-10 z-0 blur-2xl animate-pulse-glow opacity-30"></div>
        <div className="absolute bg-gradient-to-r from-violet-300 via-purple-300 to-fuchsia-400 w-28 h-28 rounded-full bottom-10 left-16 z-0 blur-lg animate-float opacity-50"></div>
        <div className="absolute bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-400 w-52 h-52 rounded-full bottom-1/3 left-1/3 z-0 blur-3xl animate-float-slow opacity-25"></div>
        <div className="absolute bg-gradient-to-r from-lime-300 via-green-300 to-emerald-400 w-44 h-44 rounded-full top-1/2 right-1/4 z-0 blur-2xl animate-pulse-glow opacity-35"></div>

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
                  src={evento.imagem_evento}
                  alt={`Imagem do evento ${evento.nome}`}
                  className="w-full h-auto max-h-[700px] object-contain"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.2 }}
                  loading="eager"
                  onError={(e) => {
                    console.error("Erro ao carregar imagem:", e);
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
            {/* <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3900.989312273572!2d-38.386530382556124!3d-12.112883599999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x716b9f273764e37%3A0xcd8de6c2e5963b66!2sHaras%20Bom%20Jesus%20Eventos!5e0!3m2!1spt-PT!2sbr!4v1743444753198!5m2!1spt-PT!2sbr"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="rounded-3xl"
              title="Localização do Evento - Haras Bom Jesus Eventos"
            /> */}
          </motion.div>

          <div className="backdrop-blur-md bg-white/90 rounded-3xl overflow-hidden border border-white/50 shadow-xl">
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 gap-4 md:gap-6">
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

                {/* Bloco de exibição de dados do convidado principal */}
                <div className="flex flex-col px-4 w-full space-y-6">
                  <div className="text-center">
                    <h3 className="font-bold text-gray-800 text-2xl sm:text-3xl md:text-4xl mb-2">
                      Olá, {convidado.nome}! Você é nosso(a) convidado(a)
                    </h3>
                  </div>

                  <div>
                    <h1 className="font-semibold text-gray-800 text-lg md:text-xl mb-2">
                      Dados do Convidado
                    </h1>
                  </div>

                  <div className="grid grid-cols-1 gap-5">
                    {/* Nome */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-4 flex items-center text-gray-400">
                        <User size={22} />
                      </div>
                      <input
                        type="text"
                        value={convidado.nome || ""}
                        disabled
                        className="w-full bg-gray-100 border border-gray-300 rounded-xl py-3 pl-12 pr-5 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all cursor-not-allowed"
                      />
                    </div>

                    {/* Telefone */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-4 flex items-center text-gray-400">
                        <Phone size={22} />
                      </div>
                      <input
                        type="tel"
                        value={convidado.telefone || ""}
                        disabled
                        className="w-full bg-gray-100 border border-gray-300 rounded-xl py-3 pl-12 pr-5 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all cursor-not-allowed"
                      />
                    </div>

                    {/* Email */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-4 flex items-center text-gray-400">
                        <Mail size={22} />
                      </div>
                      <input
                        type="email"
                        value={convidado.email || ""}
                        disabled
                        className="w-full bg-gray-100 border border-gray-300 rounded-xl py-3 pl-12 pr-5 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Seção de Acompanhantes */}
            <div className="mb-8 md:mb-10">
              {limiteAcompanhantes > 0 && ( // Só mostra o toggle se houver limite
                <motion.div
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-5 md:p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl mb-6 md:mb-8 border border-indigo-100 shadow-md"
                  whileHover={{ scale: 1.005 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="flex items-center gap-4 cursor-pointer mb-4 sm:mb-0">
                    <div className="relative">
                      <motion.div whileTap={{ scale: 0.9 }} className="relative">
                        <input
                          type="checkbox"
                          checked={desejaInformarAcompanhante}
                          onChange={handleToggleAcompanhante}
                          className="sr-only"
                          disabled={isConfirmed && !permiteAlterarDados} // Desabilita se confirmado E não permite alterar
                        />
                        <div
                          className={`block w-14 h-8 rounded-full transition-colors ${
                            desejaInformarAcompanhante ? "bg-indigo-600" : "bg-gray-300"
                          } ${
                            isConfirmed && !permiteAlterarDados ? "opacity-50" : ""
                          }`}
                        />
                        <div
                          className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                            desejaInformarAcompanhante ? "transform translate-x-6" : ""
                          } ${
                            isConfirmed && !permiteAlterarDados ? "opacity-70" : ""
                          }`}
                        />
                      </motion.div>
                    </div>
                    <span
                      className={`text-gray-800 font-semibold text-lg md:text-xl ${
                        isConfirmed && !permiteAlterarDados ? "opacity-70" : ""
                      }`}
                    >
                      Preencha os dados dos(as) acompanhante(s). (
                      {acompanhantes.filter((a) => a.nome).length}/{limiteAcompanhantes})
                    </span>
                  </label>
                </motion.div>
              )}

              {desejaInformarAcompanhante && (
                <div className="space-y-4 md:space-y-6">
                  <AnimatePresence>
                    {acompanhantes.map((acompanhante, index) => (
                      <motion.div
                        key={acompanhante.id || `temp-${index}`} // Usar id real ou id temporário para a key
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.3 }}
                        className={`bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-lg relative overflow-hidden ${
                          isConfirmed && !permiteAlterarDados ? "opacity-80" : ""
                        }`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-50/40 to-pink-50/40 opacity-30" />
                        <div className="relative z-10">
                          <div className="flex justify-between items-start mb-4 md:mb-5">
                            <h3 className="font-semibold text-gray-800 text-lg md:text-xl">
                              Acompanhante {index + 1}
                            </h3>
                            {/* O botão de remover só aparece se não estiver confirmado E permite alterar dados, OU se for um acompanhante novo sem ID (para poder remover antes de salvar) */}
                            {(!acompanhante.id || acompanhantes.length > 1) &&
                              (!isConfirmed || permiteAlterarDados) && (
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
                                className={`w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-5 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all ${
                                  isConfirmed && !permiteAlterarDados
                                    ? "cursor-not-allowed"
                                    : ""
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
                                disabled={
                                  isConfirmed && !permiteAlterarDados ? true : false
                                }
                              />
                            </div>

                            <div className="relative">
                              <div className="absolute left-4 top-4 text-gray-400">
                                <Phone size={22} />
                              </div>
                              <input
                                className={`w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-5 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all ${
                                  isConfirmed && !permiteAlterarDados
                                    ? "cursor-not-allowed"
                                    : ""
                                }`}
                                type="tel"
                                placeholder="Telefone com DDD (opcional)"
                                value={acompanhante.telefone || ""}
                                onChange={(e) =>
                                  handleChangeAcompanhante(
                                    index,
                                    "telefone",
                                    formatPhoneNumber(e.target.value)
                                  )
                                }
                                disabled={
                                  isConfirmed && !permiteAlterarDados ? true : false
                                }
                              />
                            </div>

                            <div className="relative">
                              <div className="absolute left-4 top-4 text-gray-400">
                                <Mail size={22} />
                              </div>
                              <input
                                className={`w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-5 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all ${
                                  isConfirmed && !permiteAlterarDados
                                    ? "cursor-not-allowed"
                                    : ""
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
                                disabled={
                                  isConfirmed && !permiteAlterarDados ? true : false
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {/* Botão para adicionar mais acompanhantes */}
                  {acompanhantes.filter(a => a.nome).length < limiteAcompanhantes && ( // Mostra apenas se há espaço
                    <motion.button
                      onClick={handleAddAcompanhante}
                      disabled={isConfirmed && !permiteAlterarDados} // Desabilita se confirmado e não em modo alteração
                      className={`w-full flex items-center justify-center gap-2 py-4 mt-6 rounded-xl bg-gray-100 text-gray-700 font-semibold text-lg shadow-md hover:bg-gray-200 transition-all ${
                        isConfirmed && !permiteAlterarDados ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Plus size={20} /> Adicionar outro acompanhante
                    </motion.button>
                  )}
                </div>
              )}
            </div>

            {/* Seção de Mensagens e Botões de Ação */}
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
                {/* Botão "Confirmar Presença" */}
                {!isConfirmed ? (
                  <motion.button
                    onClick={() => confirmarPresenca("sim")}
                    disabled={isLoading || isConfirmed}
                    whileHover={{
                      scale: isLoading || isConfirmed ? 1 : 1.05,
                      boxShadow:
                        isLoading || isConfirmed
                          ? "none"
                          : "0 10px 25px -5px rgba(16, 185, 129, 0.3)",
                    }}
                    whileTap={{ scale: isLoading || isConfirmed ? 1 : 0.98 }}
                    className={`flex-1 cursor-pointer disabled:cursor-default bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-5 rounded-xl flex items-center justify-center gap-4 transition-all text-lg md:text-xl shadow-lg hover:shadow-purple-300/50
                      ${isLoading ? "opacity-70" : ""} 
                      ${isConfirmed ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {isLoading ? (
                      <Loader2 className="w-7 h-7 animate-spin" />
                    ) : (
                      <>
                        <Check size={26} />
                        <span>
                          {isConfirmed ? "Já confirmado!" : "Confirmar Presença"}
                        </span>
                        <motion.span
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          🎉
                        </motion.span>
                      </>
                    )}
                  </motion.button>
                ) : (
                  // Botão "Gerar Credencial" (se confirmado)
                  <GerarCredencialButton
                    data_gerar_qrcode={evento.data_gerar_qrcode}
                    convidadoId={convidado.id}
                    convidadoNome={convidado.nome}
                    convidadoTelefone={convidado.telefone}
                    convidadoEmail={convidado.email}
                    eventoNome={evento.nome}
                    eventoData={evento.data_evento}
                    eventoLocal={evento.local}
                    acompanhantes={acompanhantes.filter((a) => a.nome)}
                  />
                )}

                {/* Botão "Não Poderei Ir" / "Alterar Dados" */}
                {!isConfirmed ? (
                  <motion.button
                    disabled={isLoading || convidadoStatus === "NAO_IREI"}
                    onClick={() => {
                      confirmarPresenca("nao");
                      setPermiteAlterarDados(false);
                    }}
                    whileHover={{
                      scale: isLoading ? 1 : 1.05,
                      boxShadow:
                        isLoading ? "none" : "0 10px 25px -5px rgba(156, 163, 175, 0.3)",
                    }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    className={`flex-1 cursor-pointer bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-5 rounded-xl flex items-center justify-center gap-4 transition-all text-lg md:text-xl shadow-lg hover:shadow-gray-300/50
                      ${isLoading ? "opacity-70" : ""}
                      ${convidadoStatus === "NAO_IREI" ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {isLoading ? (
                      <Loader2 className="w-7 h-7 animate-spin" />
                    ) : (
                      <>
                        <X size={26} />
                        <span>
                          {convidadoStatus === "NAO_IREI"
                            ? "Ausência confirmada"
                            : "Não Poderei Ir"}
                        </span>
                        <motion.span
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          😢
                        </motion.span>
                      </>
                    )}
                  </motion.button>
                ) : (
                  // Botão "Alterar Dados" (se confirmado)
                  <motion.button
                    onClick={() => {
                      setPermiteAlterarDados((prev) => !prev); // Alterna o modo de alteração
                      // Se está desativando a alteração, recarrega os dados para resetar formulário
                      if (permiteAlterarDados) {
                        fetchData(); 
                      }
                    }}
                    disabled={isLoading}
                    whileHover={{
                      scale: isLoading ? 1 : 1.05,
                      boxShadow: isLoading
                        ? "none"
                        : "0 10px 25px -5px rgba(156, 163, 175, 0.3)",
                    }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    className={`flex-1 p-3 p-none cursor-pointer bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all text-lg md:text-xl shadow-lg hover:shadow-gray-300/50
                      ${isLoading ? "opacity-70" : ""}`}
                  >
                    {isLoading ? (
                      <Loader2 className="w-7 h-7 animate-spin" />
                    ) : (
                      <>
                        <SquarePen size={26} />
                        <span>{permiteAlterarDados ? "Salvar Alterações" : "Alterar Dados"}</span>
                        <motion.span
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
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