import { useState, useEffect } from 'react';

// Componente principal da Navbar
const Navbar = () => {
  // Estado para controlar se a página foi scrollada
  const [scrolled, setScrolled] = useState(false);
  
  // Componente de estrela individual
  // (Eu criei esse componente separado para facilitar a reutilização)
  const Star = ({ style }) => (
    <div 
      className="absolute text-gray-400 opacity-70"
      style={{
        ...style,  // Recebe as posições e tamanhos personalizados
        animation: `twinkle ${Math.random() * 4 + 2}s infinite ease-in-out`,
        filter: 'blur(0.5px)'  // Efeito de desfoque sutil
      }}
    >
      ★  
    </div>
  );

  // Gerando 12 posições aleatórias para as estrelas
  // (Aqui eu calculo onde cada estrela vai aparecer)
  const starPositions = Array.from({ length: 12 }).map((_, i) => ({
    top: `${Math.random() * 100}%`,  // Posição vertical aleatória
    left: `${Math.random() * 100}%`, // Posição horizontal aleatória
    fontSize: `${Math.random() * 6 + 8}px`,  // Tamanho entre 8px e 14px
    animationDelay: `${Math.random() * 2}s`  // Tempo de animação diferente para cada estrela
  }));

  // Efeito para detectar scroll da página
  // (Isso faz a navbar mudar de aparência quando rolamos a página)
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  return (
    <>
    
      
      {/* Navbar principal */}
      <nav className="top-0 w-full z-50 transition-all duration-300 overflow-hidden bg-gradient-to-r from-purple-300/90 via-indigo-200/90 to-purple-300/90 backdrop-blur-md py-1 shadow-lg rounded-b-4xl md:rounded-b-full ">
        
        {/* Renderizando todas as estrelas */}
        {starPositions.map((pos, index) => (
          <Star key={`star-${index}`} style={pos} />
        ))}

        {/* Container do conteúdo centralizado */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-center justify-center">
            {/* Container da logo com efeitos especiais */}
            <div className="relative flex justify-center z-10">
              <div 
                className="animate-float bg-transparent"
                style={{
                  animation: 'float 6s infinite ease-in-out'  // Animação de flutuação
                }}
              >
                {/* Efeito de glow atrás da logo */}
                <div 
                  className="absolute inset-0 rounded-full opacity-20"
                  style={{
                    background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)',
                    filter: 'blur(6px)',
                    animation: 'pulse 10s infinite ease-in-out'  // Animação de pulsação
                  }}
                ></div>
                
                {/* Imagem da logo principal */}
                <img 
                  src="/omeuconvitelogo1.png" 
                  alt="O Meu Convite Logo"
                  className="h-40 w-40 md:h-40 md:w-40 object-contain rounded-full transform transition-transform duration-500 hover:scale-110"
                  style={{
                    filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2))'  // Sombra sutil
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Definições de animações CSS globais */}
      {/* (Aqui eu coloco todos os keyframes que são usados nos efeitos) */}
      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(3deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes pulse {
          0% { opacity: 0.2; transform: scale(0.95); }
          50% { opacity: 0.4; transform: scale(1.05); }
          100% { opacity: 0.2; transform: scale(0.95); }
        }
        @keyframes twinkle {
          0% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 0.8; transform: scale(1.1); }
          100% { opacity: 0.3; transform: scale(0.8); }
        }
      `}</style>
    </>
  );
};

export default Navbar;