import { FaWhatsapp } from "react-icons/fa";
import { motion } from "framer-motion";

function Rodape() {
  const whatsappInfo = {
    number: "75998054428",
    formattedNumber: "(75) 99805-4428",
    message: "Olá, gostaria de contratar seus serviços para um evento!",
    url: `https://wa.me/75998054428?text=${encodeURIComponent(
      "Olá, gostaria de contratar seus serviços para um evento!"
    )}`,
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white pt-6 pb-4 px-4 text-center text-sm text-gray-700 border-t border-gray-200">
      {/* Logo */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="flex justify-center mb-3"
      >
        <img 
          src="/omeuconvitelogo1.png" 
          alt="O Meu Convite" 
          className="w-16 h-16 object-cover rounded-full border border-gray-300 bg-white p-1 shadow-sm"
        />
      </motion.div>

      {/* Frase principal */}
      <p className="text-sm text-gray-800 font-medium mb-2">
        O seu melhor gerenciador de eventos
      </p>

      {/* WhatsApp */}
      <motion.a
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        href={whatsappInfo.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white py-1.5 px-3 rounded-full shadow-sm mb-3 transition-all duration-300 text-sm"
      >
        <FaWhatsapp className="text-lg" />
        Contato via WhatsApp - {whatsappInfo.formattedNumber}
      </motion.a>

      {/* Link do site */}
      <div className="mb-3 text-gray-700">
        <p className="font-medium">Visite nosso site</p>
        <a
          href="https://www.omeuconvite.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-800 hover:underline text-sm"
        >
          www.omeuconvite.com
        </a>
      </div>

      {/* Direitos e créditos */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>
          &copy; {currentYear} O Meu Convite • Todos os direitos reservados
        </p>
        <p>
          Desenvolvido com{" "}
          <span className="text-red-500 animate-pulse">❤</span> por{" "}
          <span className="font-semibold text-gray-800">EduTec</span>
        </p>
      </div>
    </footer>
  );
}

export default Rodape;

