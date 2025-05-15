import { useState, useEffect } from 'react';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  // Componente estrela com melhor brilho e animação
  const Star = ({ style }) => (
    <div
      className="absolute text-white"
      style={{
        ...style,
        animation: `twinkle ${Math.random() * 5 + 3}s infinite ease-in-out`,
        filter: 'blur(1px)',
        pointerEvents: 'none',
      }}
    >
      ★
    </div>
  );

  // Aumentamos a quantidade de estrelas e variamos mais o tamanho
  const starPositions = Array.from({ length: 40 }).map(() => ({
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    fontSize: `${Math.random() * 12 + 5}px`,
    opacity: Math.random() * 0.6 + 0.2,
    animationDelay: `${Math.random() * 5}s`,
  }));

  // Partículas de brilho
  const glowParticles = Array.from({ length: 15 }).map(() => ({
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: `${Math.random() * 80 + 20}px`,
    opacity: Math.random() * 0.3 + 0.1,
    animationDuration: `${Math.random() * 10 + 8}s`,
  }));

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 w-full transition-all duration-700 backdrop-blur-xl overflow-hidden z-50 rounded-b-[30px] ${
          scrolled 
            ? 'bg-white/80 shadow-[0_10px_40px_-12px_rgba(112,66,247,0.3)]' 
            : 'bg-white/60'
        }`}
      >
        {/* Fundo com gradiente elegante */}
        <div 
          className="absolute inset-0 w-full h-full opacity-40" 
          style={{
            background: 'radial-gradient(circle at 50% -20%, rgba(221, 214, 254, 0.7), transparent 70%), radial-gradient(circle at 80% 50%, rgba(216, 180, 254, 0.4), transparent 50%)',
          }}
        />
        
        {/* Efeito de brilho do fundo */}
        <div 
          className="absolute inset-0 opacity-50" 
          style={{
            background: 'radial-gradient(circle at 50% 0%, rgba(244, 231, 255, 0.8), transparent 80%)',
            filter: 'blur(60px)',
          }}
        />
        
        {/* Partículas de brilho */}
        {glowParticles.map((particle, i) => (
          <div
            key={`particle-${i}`}
            className="absolute rounded-full bg-white/30"
            style={{
              top: particle.top,
              left: particle.left,
              width: particle.size,
              height: particle.size,
              opacity: particle.opacity,
              filter: 'blur(20px)',
              animation: `floatGlow ${particle.animationDuration} infinite ease-in-out`,
            }}
          />
        ))}
        
        {/* Estrelas */}
        {starPositions.map((pos, i) => (
          <Star key={i} style={pos} />
        ))}

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="flex justify-center items-center py-3">
            <div className="relative animate-float group">
              {/* Aura ao redor do logo */}
              <div
                className="absolute -inset-8 rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-700"
                style={{
                  background: 'radial-gradient(circle, rgba(216,180,254,0.8) 0%, rgba(224,231,255,0.3) 40%, rgba(255,255,255,0) 70%)',
                  filter: 'blur(20px)',
                  animation: 'pulse 8s infinite ease-in-out',
                }}
              />
              
              {/* Efeito de brilho mais suave e elegante */}
              <div
                className="absolute -inset-6 rounded-full opacity-30"
                style={{
                  background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(224,231,255,0.4) 40%, rgba(255,255,255,0) 70%)',
                  filter: 'blur(15px)',
                  animation: 'pulse 8s infinite ease-in-out',
                }}
              />
              
              {/* Reflexo superior */}
              <div 
                className="absolute -top-2 left-1/2 w-3/4 h-1/4 -translate-x-1/2 opacity-70" 
                style={{ 
                  background: 'linear-gradient(to bottom, rgba(255,255,255,0.8), transparent)',
                  borderRadius: '100% 100% 0 0',
                  transform: 'translateX(-50%) rotate(5deg)',
                  filter: 'blur(4px)'
                }}
              />

              {/* Container do logo com bordas mais suaves e efeito de luz */}
              <div className="relative rounded-full p-1.5 bg-gradient-to-b from-white/80 via-white/40 to-transparent overflow-hidden shadow-[0_5px_15px_rgba(0,0,0,0.1)] backdrop-blur-sm">
                <div className="relative overflow-hidden rounded-full">
                  {/* Efeito de brilho que se move */}
                  <div 
                    className="absolute inset-0 opacity-70 z-10 pointer-events-none"
                    style={{
                      background: 'linear-gradient(45deg, transparent 40%, rgba(255, 255, 255, 0.7) 45%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0.7) 55%, transparent 60%)',
                      backgroundSize: '300% 100%',
                      animation: 'shimmer 4s infinite linear',
                      filter: 'blur(2px)'
                    }}
                  />
                  
                  <img
                    src="/omeuconvitelogo1.png"
                    alt="O Meu Convite Logo"
                    className="h-28 w-28 md:h-32 md:w-32 object-cover rounded-full border border-white/40 transition-transform duration-500 group-hover:scale-110 shadow-[0_8px_32px_rgba(31,38,135,0.2)]"
                  />
                </div>
              </div>
              
              {/* Círculos decorativos */}
              <div className="absolute top-0 -left-4 w-4 h-4 rounded-full bg-gradient-to-r from-indigo-400/40 to-purple-500/40 blur-[2px] animate-orbitLeft"></div>
              <div className="absolute bottom-3 -right-3 w-3 h-3 rounded-full bg-gradient-to-r from-pink-400/40 to-purple-500/40 blur-[2px] animate-orbitRight"></div>
            </div>
          </div>
        </div>
        
        {/* Borda inferior com gradiente e cantos arredondados */}
        <div className="absolute bottom-0 left-0 w-full h-[3px] z-20 pointer-events-none bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-b-[30px]" />

        {/* Borda esquerda com gradiente e canto inferior esquerdo arredondado */}
        <div className="absolute top-0 left-0 h-full w-[3px] z-20 pointer-events-none bg-gradient-to-b from-indigo-500 to-purple-600 rounded-bl-[30px]" />

        {/* Borda direita com gradiente e canto inferior direito arredondado */}
        <div className="absolute top-0 right-0 h-full w-[3px] z-20 pointer-events-none bg-gradient-to-b from-indigo-500 to-purple-600 rounded-br-[30px]" />
      </nav>

      {/* Espaçador para compensar o menu fixo */}
      <div className="h-44 md:h-48"></div>

      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }

        @keyframes pulse {
          0% { opacity: 0.3; transform: scale(0.97); }
          50% { opacity: 0.7; transform: scale(1.05); }
          100% { opacity: 0.3; transform: scale(0.97); }
        }

        @keyframes twinkle {
          0% { opacity: 0.1; transform: scale(0.8); filter: blur(2px); }
          50% { opacity: 0.9; transform: scale(1.2); filter: blur(1px); }
          100% { opacity: 0.1; transform: scale(0.8); filter: blur(2px); }
        }

        @keyframes floatGlow {
          0% { transform: translateY(0px) translateX(0px); opacity: 0.1; }
          25% { transform: translateY(-15px) translateX(10px); opacity: 0.3; }
          50% { transform: translateY(0px) translateX(20px); opacity: 0.2; }
          75% { transform: translateY(15px) translateX(10px); opacity: 0.3; }
          100% { transform: translateY(0px) translateX(0px); opacity: 0.1; }
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @keyframes orbitLeft {
          0% { transform: rotate(0deg) translateX(20px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(20px) rotate(-360deg); }
        }

        @keyframes orbitRight {
          0% { transform: rotate(0deg) translateX(15px) rotate(0deg); }
          100% { transform: rotate(-360deg) translateX(15px) rotate(360deg); }
        }

        .animate-float {
          animation: float 8s infinite ease-in-out;
        }
        
        .animate-orbitLeft {
          animation: orbitLeft 12s infinite linear;
        }
        
        .animate-orbitRight {
          animation: orbitRight 10s infinite linear;
        }
      `}</style>
    </>
  );
};

export default Navbar;