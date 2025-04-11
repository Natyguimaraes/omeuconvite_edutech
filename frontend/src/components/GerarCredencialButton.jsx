import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Ticket, Calendar, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

function GerarCredencialButton({ 
  data_gerar_qrcode,
  convidadoId,
  convidadoNome,
  convidadoTelefone,
  convidadoEmail,
  eventoNome,
  eventoData,
  eventoLocal,
  acompanhantes = [],
  isAcompanhante = false,
  acompanhanteId = null,
}) {
  const navigate = useNavigate();
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dataFormatada, setDataFormatada] = useState('Carregando...');
  const [tempoRestante, setTempoRestante] = useState('');
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Função para formatar data de forma segura
  const formatarDataExibicao = (dataString) => {
    try {
      if (!dataString) return 'Data não definida';
      
      const data = new Date(dataString);
      if (isNaN(data.getTime())) return 'Data inválida';

      const options = { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      
      return data.toLocaleString('pt-BR', options);
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return 'Data incorreta';
    }
  };

  // Função para calcular tempo restante e contador regressivo
  const calcularTempoRestante = (dataLiberacao) => {
    const agora = new Date();
    const diff = dataLiberacao - agora;
    
    if (diff <= 0) {
      setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return 'Disponível agora';
    }
    
    // Calcula o contador regressivo
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    setCountdown({ days, hours, minutes, seconds });
    
    if (days > 0) return `em ${days} dia(s) e ${hours} hora(s)`;
    if (hours > 0) return `em ${hours} hora(s) e ${minutes} minuto(s)`;
    return `em ${minutes} minuto(s)`;
  };

  useEffect(() => {
    const verificarDisponibilidade = () => {
      try {
        const agora = new Date();
        setCurrentDate(agora);
  
        if (!data_gerar_qrcode || data_gerar_qrcode.trim() === "") {
          setIsAvailable(true); // Se não houver data definida, considera como disponível
          setDataFormatada('Disponível agora');
          setIsLoading(false);
          return;
        }
  
        let dataLiberacao;
        
        if (data_gerar_qrcode.includes(" ")) {
          const [dataParte, horaParte] = data_gerar_qrcode.split(" ");
          const [ano, mes, dia] = dataParte.split("-").map(Number);
          const [hora, minuto, segundo] = horaParte.split(":").map(Number);
          dataLiberacao = new Date(ano, mes - 1, dia, hora, minuto, segundo);
        } else {
          dataLiberacao = new Date(data_gerar_qrcode);
        }
  
        if (isNaN(dataLiberacao.getTime())) {
          console.error("Data inválida:", data_gerar_qrcode);
          setIsAvailable(false);
          setDataFormatada('Data inválida');
          setIsLoading(false);
          return;
        }
  
        const disponivel = agora >= dataLiberacao;
        setIsAvailable(disponivel);
        setDataFormatada(formatarDataExibicao(dataLiberacao));
        setTempoRestante(calcularTempoRestante(dataLiberacao));
        
      } catch (error) {
        console.error("Erro na verificação:", error);
        setIsAvailable(false);
        setDataFormatada('Erro ao verificar');
      } finally {
        setIsLoading(false);
      }
    };
  
    verificarDisponibilidade();
    const intervalo = setInterval(verificarDisponibilidade, 1000); // Atualiza a cada segundo para o contador
    
    return () => clearInterval(intervalo);
  }, [data_gerar_qrcode]);
  
  const handleGerarCredencial = () => {
    if (!isAvailable) return;
    
    navigate('/credenciais', {
      state: {
        convidado: {
          id: convidadoId,
          nome: convidadoNome,
          telefone: convidadoTelefone,
          email: convidadoEmail
        },
        evento: {
          nome: eventoNome,
          data_evento: eventoData,
          local: eventoLocal
        },
        acompanhantes: acompanhantes.filter(a => a.nome && a.id)
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-4">
        <Loader2 className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-xs mx-auto">
      <motion.button
        whileHover={isAvailable ? { scale: 1.02 } : {}}
        whileTap={isAvailable ? { scale: 0.98 } : {}}
        onClick={handleGerarCredencial}
        className={`relative overflow-hidden w-full flex flex-col items-center p-4 rounded-xl shadow-lg transition-all ${
          isAvailable
            ? "bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 cursor-pointer"
            : "bg-gradient-to-r from-purple-500 to-indigo-600 cursor-not-allowed opacity-90"
        }`}
        disabled={!isAvailable}
      >
        {/* Efeito de brilho quando disponível */}
        {isAvailable && (
          <motion.div 
            className="absolute inset-0 bg-white/10"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 0.3, 0],
              x: ["-100%", "100%"]
            }}
            transition={{ 
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}

        <div className="flex items-center gap-2 z-10">
          <Ticket size={18} className="text-white" />
          <span className="text-lg font-bold text-white">
            {isAcompanhante ? "Ver Credencial" : "Minha Credencial"}
          </span>
        </div>

        {isAvailable ? (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 mt-2 text-sm text-white/90 z-10"
          >
            <Calendar size={16} />
            <span>Gerado em: <span className="font-medium">{dataFormatada}</span></span>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full mt-3 z-10"
          >
            <div className="flex items-center justify-center gap-2 text-sm text-white/90 mb-2">
              <Clock size={16} />
              <span>Disponível {tempoRestante}</span>
            </div>
            
            {/* Contador regressivo */}
            <div className="grid grid-cols-4 gap-2 w-full">
              <div className="bg-white/20 rounded-lg p-2 text-center">
                <div className="text-xs text-white/70">Dias</div>
                <div className="font-bold text-white">{countdown.days}</div>
              </div>
              <div className="bg-white/20 rounded-lg p-2 text-center">
                <div className="text-xs text-white/70">Horas</div>
                <div className="font-bold text-white">{countdown.hours}</div>
              </div>
              <div className="bg-white/20 rounded-lg p-2 text-center">
                <div className="text-xs text-white/70">Min</div>
                <div className="font-bold text-white">{countdown.minutes}</div>
              </div>
              <div className="bg-white/20 rounded-lg p-2 text-center">
                <div className="text-xs text-white/70">Seg</div>
                <div className="font-bold text-white">{countdown.seconds}</div>
              </div>
            </div>

            <div className="text-xs text-center mt-2 text-white/70">
              Em {dataFormatada}
            </div>
          </motion.div>
        )}
      </motion.button>
    </div>
  );
}

export default GerarCredencialButton;