import { FaWhatsapp } from "react-icons/fa";
import { motion } from "framer-motion";


function Rodape() {
  const whatsappNumber = "75999924885";
  const whatsappMessage = "Olá, gostaria de contratar seus serviços para um evento!";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <footer className="bg-white py-6 px-4 border-t border-gray-200">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        {/* Logo e texto */}
        <div className="mb-6 text-center">
          <p className="text-gray-600 text-sm">
            Desenvolvido por <span className="font-semibold text-indigo-600">EduTec</span>
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Solução profissional para gestão de eventos
          </p>
        </div>
        
        {/* Botão de WhatsApp destacado */}
        <motion.a
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 hover:bg-green-600 text-white font-medium py-1 px-6 rounded-full shadow-md flex items-center transition-all duration-300"
        >
          <FaWhatsapp className="mr-2 text-xl" />
          <div className="text-center">
            <p className="text-sm">Contrate para seu evento</p>
            <p className="text-xs font-light">(75) 99992-4885</p>
          </div>
        </motion.a>

        {/* Direitos autorais */}
        <p className="text-gray-400 text-xs mt-6">
          &copy; {new Date().getFullYear()} Todos os direitos reservados
        </p>
      </div>
    </footer>
  );
}

export default Rodape;