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

  const starPositions = Array.from({ length: 30 }).map(() => ({
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    fontSize: `${Math.random() * 10 + 4}px`,
    opacity: Math.random() * 0.4 + 0.1,
    animationDelay: `${Math.random() * 5}s`,
  }));

  const glowParticles = Array.from({ length: 10 }).map(() => ({
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: `${Math.random() * 60 + 20}px`,
    opacity: Math.random() * 0.2 + 0.05,
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
        className={`fixed top-0 w-full transition-all duration-700 backdrop-blur-md overflow-hidden z-50 rounded-b-[20px] ${
          scrolled
            ? 'bg-white/90 shadow-[0_4px_20px_rgba(0,0,0,0.05)]'
            : 'bg-white/70'
        }`}
      >
        {/* Fundo neutro e suave */}
        <div
          className="absolute inset-0 w-full h-full opacity-30"
          style={{
            background: 'radial-gradient(circle at 50% -20%, rgba(200, 200, 200, 0.4), transparent 60%)',
          }}
        />

        {/* Partículas de brilho ajustadas */}
        {glowParticles.map((particle, i) => (
          <div
            key={`particle-${i}`}
            className="absolute rounded-full bg-gray-300/20"
            style={{
              top: particle.top,
              left: particle.left,
              width: particle.size,
              height: particle.size,
              opacity: particle.opacity,
              filter: 'blur(15px)',
              animation: `floatGlow ${particle.animationDuration} infinite ease-in-out`,
            }}
          />
        ))}

        {/* Estrelas discretas */}
        {starPositions.map((pos, i) => (
          <Star key={i} style={pos} />
        ))}

        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="flex justify-center items-center py-2">
            <div className="relative animate-float group">
              {/* Aura mais discreta */}
              <div
                className="absolute -inset-6 rounded-full opacity-20"
                style={{
                  background: 'radial-gradient(circle, rgba(255,255,255,0.7) 0%, transparent 70%)',
                  filter: 'blur(10px)',
                  animation: 'pulse 10s infinite ease-in-out',
                }}
              />

              {/* Container do logo */}
              <div className="relative rounded-full p-1 bg-white border border-gray-200 shadow-sm">
                <div className="relative overflow-hidden rounded-full">
                  {/* Brilho sutil */}
                  <div
                    className="absolute inset-0 opacity-40 z-10 pointer-events-none"
                    style={{
                      background:
                        'linear-gradient(45deg, transparent 45%, rgba(255,255,255,0.6) 50%, transparent 55%)',
                      backgroundSize: '250% 100%',
                      animation: 'shimmer 6s infinite linear',
                      filter: 'blur(1px)',
                    }}
                  />

                  <img
                    src="/omeuconvitelogo1.png"
                    alt="Logo"
                    className="h-20 w-20 object-cover rounded-full border border-gray-300 shadow"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Espaçador com altura reduzida */}
      <div className="h-32 md:h-36"></div>

      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(1deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }

        @keyframes pulse {
          0% { opacity: 0.2; transform: scale(0.97); }
          50% { opacity: 0.5; transform: scale(1.03); }
          100% { opacity: 0.2; transform: scale(0.97); }
        }

        @keyframes twinkle {
          0% { opacity: 0.05; transform: scale(0.7); filter: blur(2px); }
          50% { opacity: 0.3; transform: scale(1); filter: blur(1px); }
          100% { opacity: 0.05; transform: scale(0.7); filter: blur(2px); }
        }

        @keyframes floatGlow {
          0% { transform: translateY(0px) translateX(0px); opacity: 0.05; }
          25% { transform: translateY(-10px) translateX(8px); opacity: 0.2; }
          50% { transform: translateY(0px) translateX(15px); opacity: 0.1; }
          75% { transform: translateY(10px) translateX(8px); opacity: 0.2; }
          100% { transform: translateY(0px) translateX(0px); opacity: 0.05; }
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .animate-float {
          animation: float 8s infinite ease-in-out;
        }
      `}</style>
    </>
  );
};

export default Navbar;
