import { FaWhatsapp } from "react-icons/fa";
import { motion } from "framer-motion";

function Rodape() {
  // Dados do WhatsApp
  const whatsappInfo = {
    number: "75998054428",
    formattedNumber: "(75) 99805-4428",
    message: "Olá, gostaria de contratar seus serviços para um evento!",
    url: `https://wa.me/75998054428?text=${encodeURIComponent(
      "Olá, gostaria de contratar seus serviços para um evento!"
    )}`,
  };

    return (
      <footer className="bg-gradient-to-b from-purple-100 to-white py-8 px-6">
        <div className="max-w-md mx-auto">
          <div className="flex flex-col items-center gap-6">
            {/* Botão WhatsApp */}
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              href={whatsappInfo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 hover:bg-purple-700 text-white font-medium py-1 px-2 rounded-3xl shadow-lg flex items-center gap-3 transition-all duration-200"
            >
              <FaWhatsapp className="text-xl" />
              <div className="text-left leading-tight">
                <p className="text-sm font-semibold">Contato via WhatsApp</p>
                <p className="text-xs font-light text-center">{whatsappInfo.formattedNumber}</p>
              </div>
            </motion.a>
  
            <div className="w-full border-t border-purple-200"></div>
  
            {/* Informações do rodapé */}
            <div className="text-center space-y-1">
              <p className="text-gray-700 text-sm font-medium">
                Seu melhor gerenciador de eventos
              </p>
              <a
                href="https://www.omeuconvite.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-700 hover:text-purple-900 underline text-sm"
              >
                Visite nosso site: www.omeuconvite.com
              </a>
              <p className="text-gray-500 text-xs mt-2">
                &copy; {new Date().getFullYear()} O Meu Convite • Desenvolvido por{" "}
                <span className="font-semibold text-purple-600">EduTec</span>
              </p>
            </div>
          </div>
        </div>
      </footer>
    );
  }
  
  export default Rodape;