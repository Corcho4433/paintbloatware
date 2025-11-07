import { useState, useEffect } from "react";
import { Crown, Sparkles, Zap, Palette, Users, Star, ArrowLeft } from "lucide-react";
import fetchWithRefresh from "../hooks/authorization";
import { useNavigate } from "react-router-dom";
import { fetchAuthMe } from "../hooks/user";

const NitroPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [randomText, setRandomText] = useState("");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();
  const [pageLoading, setPageLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);


  useEffect(() => {
  const checkAuth = async () => {
      await fetchAuthMe();
  };
  
  checkAuth();
}, []);
  useEffect(() => {
    const container = document.getElementById('scroll-container');
    if (!container) return;
    const generateRandomCharacter = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      return chars[Math.floor(Math.random() * chars.length)];
    };
    const generateRandomText = () => {
      let string = "";
      for (let i = 0; i < 8000; i++) {
        string += generateRandomCharacter();
      }
      return string;
    };

    const handleMouseMove = (event: any) => {
      setRandomText(generateRandomText());
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    let lastCall = 0;

    const handleScroll = () => {
      const now = Date.now();
      if (now - lastCall > 20) { // cada 100 ms
        setRandomText(generateRandomText());
        lastCall = now;
      }
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('scroll', handleScroll);
    setRandomText(generateRandomText());

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('scroll', handleScroll);
    };
  }, [pageLoading]);

  useEffect(() => {
    
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setPageLoading(false), 300);
          return 100;
        }
        return Math.min(prev + Math.random() * 30, 100);
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetchWithRefresh("/api/subscribe", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: "PAINT_NITRO",
          amount: 15,
          email: "test_user_1844090774305363860@testuser.com"
        }),
      });

      const data = await res.json();
      console.log(data)
      if (!res.ok) {
        throw new Error(data.error.message || "Error al crear la suscripción");
      }

      if (data.init_point) {
        setTimeout(() => window.location.href = data.init_point, 2000)
      } else {
        throw new Error("No se recibió init_point del backend");
      }
    } catch (err: any) {
      setError(err.message || "Ocurrió un error inesperado");
      setLoading(false);
    }
  };

  const features = [
    { icon: Crown, text: "Badge exclusivo de Nitro" },
    { icon: Sparkles, text: "Acceso anticipado" },
    { icon: Palette, text: "Herramientas premium" },
    { icon: Zap, text: "Prioridad en soporte" },
    { icon: Users, text: "Comunidad exclusiva" },
    { icon: Star, text: "Sin anuncios" }
  ];
  if (pageLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center">
          {/* Logo/Texto principal */}
          <div className="mb-12 overflow-hidden">
            <h1 className="text-6xl md:text-8xl font-black text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-purple-400 bg-clip-text animate-pulse">
              PAINT NITRO
            </h1>
          </div>

          {/* Barra de progreso estilo retro */}
          <div className="w-80 mx-auto">
            <div className="border-4 border-purple-500 bg-black p-2 mb-4">
              <div
                className="h-8 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-purple-500 transition-all duration-300 relative overflow-hidden"
                style={{ width: `${loadingProgress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>

            {/* Porcentaje */}
            <div className="font-mono text-purple-400 text-2xl font-black">
              {Math.floor(loadingProgress)}%
            </div>

            {/* Texto de carga */}
            <div className="mt-4 font-mono text-gray-500 text-sm animate-pulse">
              CARGANDO EXPERIENCIA...
            </div>
          </div>

          {/* Iconos animados */}
          <div className="flex justify-center gap-6 mt-12">
            {[Crown, Sparkles, Zap].map((Icon, i) => (
              <Icon
                key={i}
                className="w-8 h-8 text-purple-500 animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Background con texto random y máscara */}
      <button
    onClick={() => navigate(-1)}
    className="fixed top-5 left-5 z-50 p-2 rounded-lg  transition-colors cursor-pointer"
    aria-label="Go back"
  >
    <ArrowLeft className="text-gray-300 hover:text-white w-10 h-10" />
  </button>
      <div id="scroll-container" className="h-screen overflow-y-auto">
        <div className="fixed inset-0 pointer-events-none select-none bg-black z-0">
          {/* Máscara circular que sigue el mouse */}
          
          <div
            className="absolute w-96 h-96 rounded-full -translate-x-1/2 -translate-y-1/2 z-20"
            style={{
              left: `${mousePosition.x}px`,
              top: `${mousePosition.y}px`,
              background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
              mixBlendMode: 'screen'
            }}
          />
          {/* Texto random visible solo en la máscara */}
          <div
            className="absolute inset-0 text-purple-400 text-2xl leading-relaxed break-all font-mono overflow-hidden"
            style={{
              maskImage: `radial-gradient(circle 200px at ${mousePosition.x}px ${mousePosition.y}px, black, transparent)`,
              WebkitMaskImage: `radial-gradient(circle 200px at ${mousePosition.x}px ${mousePosition.y}px, black, transparent)`
            }}
          >
            {randomText}
          </div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-20">
          {/* Title con marquee mejorado */}
          <div className="mb-16 overflow-hidden border-y-8 border-purple-500 py-8 bg-gradient-to-r from-purple-900/20 via-purple-500/20 to-purple-900/20 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent animate-pulse"></div>
            <div className="flex whitespace-nowrap animate-[scroll_20s_linear_infinite] relative z-10">
              <span className="inline-block text-9xl font-black mx-12 text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-purple-400 bg-clip-text drop-shadow-[0_0_30px_rgba(168,85,247,0.8)]">
                PAINT NITRO
              </span>
              <span className="inline-block text-9xl font-black mx-12 text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-purple-400 bg-clip-text drop-shadow-[0_0_30px_rgba(168,85,247,0.8)]">
                PAINT NITRO
              </span>

            </div>
          </div>

          <div className="text-center mb-16">
            <p className="text-4xl text-gray-300 mb-12 font-black max-w-3xl mx-auto leading-tight">
              DESBLOQUEA EL <span className="text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-purple-400 bg-clip-text">PODER COMPLETO</span> DE TU CREATIVIDAD
            </p>
            <div className="flex flex-col">
              {/* Precio con efecto glitch */}
              <div className="relative inline-block mx-auto w-[50%] mb-12">
                <div className="absolute inset-0 bg-purple-500 blur-xl opacity-40"></div>
                <div className="relative border-4 border-purple-500 rounded-none p-12 bg-black font-mono">
                  <div className="text-7xl font-black mb-2 text-white">
                    $15<span className="text-2xl text-gray-500">/MES</span>
                  </div>
                  <div className="text-purple-400 text-sm font-bold tracking-widest">
                    ► CANCELÁ CUANDO QUIERAS ◄
                  </div>
                </div>
              </div>

              {/* CTA Button estilo retro oscuro */}
              <div className="relative inline-block">

                <button
                  onClick={handleSubscribe}
                  disabled={loading}
                  className="cursor-pointer relative group px-12 py-6 bg-black text-white text-xl font-black border-4 border-purple-500 shadow-[8px_8px_0px_0px_rgba(168,85,247,1)] hover:shadow-[4px_4px_0px_0px_rgba(168,85,247,1)] hover:translate-x-1 hover:translate-y-1 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      PROCESANDO...
                    </span>
                  ) : (
                    <span className="flex items-center gap-3">
                      <Crown className="w-5 h-5" />
                      SUSCRIBIRME AHORA
                      <Sparkles className="w-5 h-5" />
                    </span>
                  )}
                </button>
              </div>
            </div>
            {error && (
              <div className="mt-6 p-4 border-4 border-red-500 bg-red-500/60 text-white font-mono max-w-md mx-auto">
                ⚠ {error}
              </div>
            )}
          </div>

          {/* Features con estilo lista */}
          <div className="max-w-3xl mx-auto mb-16">
            <h3 className="text-3xl font-black mb-8 text-center border-b-4 border-purple-500 pb-4">
              ¿QUÉ INCLUYE NITRO?
            </h3>
            <ul className="space-y-4">
              {features.map((feature, index) => (
                <li
                  key={index}
                  className="flex items-center gap-4 p-6 border-2 border-purple-500/50 bg-purple-950/50 hover:border-purple-400 hover:bg-purple-950/80 transition-all duration-300 group"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-600 flex items-center justify-center border-2 border-purple-400 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <span className="text-xl font-bold">{feature.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer */}
          <footer className="text-center border-t-4 border-purple-500 pt-8 font-mono">
            <p className="text-gray-500 text-sm mb-2">🔒 PAGOS SEGUROS CON MERCADO PAGO</p>
            <p className="text-purple-400 text-xs">
              © 2025 PAINT BLOATWARE - TODOS LOS DERECHOS RESERVADOS
            </p>
          </footer>
        </div>

        <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
      </div>
    </div>
  );
};

export default NitroPage;