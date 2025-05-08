import { useState, useEffect } from 'react';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

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
  const starPositions = Array.from({ length: 20 }).map(() => ({
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    fontSize: `${Math.random() * 10 + 6}px`,
    opacity: Math.random() * 0.5 + 0.2,
    animationDelay: `${Math.random() * 3}s`,
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
        className={`fixed top-0 w-full transition-all duration-500 backdrop-blur-lg overflow-hidden z-50 ${
          scrolled
            ? "bg-gradient-to-r from-purple-600/40 via-indigo-700/30 to-purple-600/40 shadow-lg py-2"
            : "bg-gradient-to-r from-purple-500/30 via-indigo-400/20 to-purple-500/30 py-4"
        }`}
        style={{
          borderBottom: `1px solid ${scrolled ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)'}`,
          borderRadius: '0 0 24px 24px',
          boxShadow: scrolled 
            ? '0 10px 30px -10px rgba(79, 70, 229, 0.2)' 
            : 'none'
        }}
      >
        {/* Efeito de brilho do fundo */}
        <div 
          className="absolute inset-0 opacity-30" 
          style={{
            background: 'radial-gradient(circle at 50% -20%, rgba(244, 231, 255, 0.3), transparent 70%)',
            filter: 'blur(40px)',
          }}
        ></div>
        
        {/* Estrelas */}
        {starPositions.map((pos, i) => (
          <Star key={i} style={pos} />
        ))}

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="flex justify-center items-center">
            <div className="relative animate-float">
              {/* Efeito de brilho mais suave e elegante */}
              <div
                className="absolute -inset-4 rounded-full opacity-40"
                style={{
                  background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(224,231,255,0.3) 40%, rgba(255,255,255,0) 70%)',
                  filter: 'blur(12px)',
                  animation: 'pulse 8s infinite ease-in-out',
                }}
              ></div>
              
              {/* Reflexo superior */}
              <div 
                className="absolute -top-2 left-1/2 w-3/4 h-1/4 -translate-x-1/2 opacity-70" 
                style={{ 
                  background: 'linear-gradient(to bottom, rgba(255,255,255,0.5), transparent)',
                  borderRadius: '100% 100% 0 0',
                  transform: 'translateX(-50%) rotate(5deg)',
                  filter: 'blur(4px)'
                }}
              ></div>

              {/* Container do logo com bordas mais suaves */}
              <div className="relative rounded-full p-1 bg-gradient-to-b from-white/40 to-transparent overflow-hidden">
                <img
                  src="/omeuconvitelogo1.png"
                  alt="O Meu Convite Logo"
                  className="h-28 w-28 md:h-32 md:w-32 object-cover rounded-full border border-white/20 shadow-lg transition-transform duration-300 hover:scale-110"
                  style={{ 
                    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.2)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
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
          50% { opacity: 0.6; transform: scale(1.03); }
          100% { opacity: 0.3; transform: scale(0.97); }
        }

        @keyframes twinkle {
          0% { opacity: 0.1; transform: scale(0.8); filter: blur(2px); }
          50% { opacity: 0.7; transform: scale(1.1); filter: blur(1px); }
          100% { opacity: 0.1; transform: scale(0.8); filter: blur(2px); }
        }

        .animate-float {
          animation: float 6s infinite ease-in-out;
        }
      `}</style>
    </>
  );
};

export default Navbar;