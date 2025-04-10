import { FaWhatsapp } from "react-icons/fa";
import { motion } from "framer-motion";

function Rodape() {
  // Dados do WhatsApp
  const whatsappInfo = {
    number: "75999924885",
    formattedNumber: "(75) 99992-4885",
    message: "Olá, gostaria de contratar seus serviços para um evento!",
    url: `https://wa.me/75999924885?text=${encodeURIComponent("Olá, gostaria de contratar seus serviços para um evento!")}`
  };

  return (
    <footer className="bg-gradient-to-b from-purple-100 to-white py-6 px-4">
      <div className="max-w-md mx-auto">
        <div className="flex flex-col items-center">
          
          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href={whatsappInfo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 hover:bg-purple-700 text-white font-medium py-2 px-5 rounded-full shadow-md flex items-center mb-4 transition-all duration-200"
          >
            <FaWhatsapp className="mr-2 text-lg" />
            <div className="text-center">
              <p className="text-xs font-semibold">Contato via WhatsApp</p>
              <p className="text-[10px] font-light mt-0.5">{whatsappInfo.formattedNumber}</p>
            </div>
          </motion.a>

          {/* Informações de direitos */}
          <div className="text-center">
            <p className="text-gray-600 text-xs mb-1">
              Seu melhor gerenciador de eventos
            </p>
            <p className="text-gray-400 text-[10px]">
              &copy; {new Date().getFullYear()} O Meu Convite • Desenvolvido por <span className="font-medium text-purple-500">EduTec</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Rodape;