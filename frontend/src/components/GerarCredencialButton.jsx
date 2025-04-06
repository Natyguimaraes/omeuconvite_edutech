import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Ticket, Calendar } from "lucide-react";
import PropTypes from 'prop-types';

function GerarCredencialButton({ data_gerar_qrcode }) {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    // Data fixa para 10/04/2025
    const DATA_QRCODE_FIXA = new Date('2025-04-10T00:00:00');
    
    // Valida e formata a data recebida
    const validateAndFormatDate = () => {
      // Usa a data fixa independentemente do que receber
      const date = DATA_QRCODE_FIXA;
      
      // Formata para exibição (10/04/2025)
      setFormattedDate(date.toLocaleDateString('pt-BR'));
      return date;
    };

    // Atualiza a data atual a cada minuto
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);

    // Verifica disponibilidade
    const checkAvailability = () => {
      const validDate = validateAndFormatDate();
      
      // Verifica se a data atual é posterior ou igual à data fixa
      setIsAvailable(currentDate >= validDate);
      setIsLoading(false);
    };

    checkAvailability();

    return () => clearInterval(interval);
  }, [data_gerar_qrcode, currentDate]);

  // Validação das props
  GerarCredencialButton.propTypes = {
    data_gerar_qrcode: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date)
    ])
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-4">
        <Loader2 className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="mt-8">
      <motion.button
        whileHover={isAvailable ? { scale: 1.02 } : {}}
        whileTap={isAvailable ? { scale: 0.98 } : {}}
        className={`w-full max-w-md mx-auto flex flex-col items-center justify-center p-6 rounded-2xl shadow-lg transition-all ${
          isAvailable
            ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white cursor-pointer hover:shadow-purple-300/50"
            : "bg-gray-100 text-gray-500 cursor-not-allowed"
        }`}
        disabled={!isAvailable}
      >
        <div className="flex items-center gap-3 mb-2">
          <Ticket size={24} className={isAvailable ? "text-white" : "text-gray-400"} />
          <span className="text-lg font-bold">
            {isAvailable ? "Gerar Credencial" : "Gerar Credencial"}
          </span>
        </div>
        
        {!isAvailable && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mt-2 text-sm bg-white/20 px-3 py-1 rounded-full"
          >
            <Calendar size={16} className="text-gray-500" />
            <span className="text-gray-600">
              Disponível a partir de 10/04/2025 {/* Texto fixo */}
            </span>
          </motion.div>
        )}
      </motion.button>

      {isAvailable && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-sm text-gray-600 mt-3"
        >
          Sua credencial e de seus acompanhantes estão prontas para serem geradas
        </motion.p>
      )}
    </div>
  );
}

export default GerarCredencialButton;