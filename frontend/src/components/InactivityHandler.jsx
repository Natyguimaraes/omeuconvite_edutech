//componente para deslogar o usuário se ficar inativo por muito tempo

// src/components/InactivityHandlerWithModal.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function InactivityHandlerWithModal({ timeout = 1 * 60 * 1000, warningBefore = 30 * 1000, onLogout }) {
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(warningBefore / 1000);
  const navigate = useNavigate();

  useEffect(() => {
    let activityTimer;
    let warningTimer;
    let countdownInterval;

    const resetTimers = () => {
      clearTimeout(activityTimer);
      clearTimeout(warningTimer);
      clearInterval(countdownInterval);

      setShowWarning(false);
      setCountdown(warningBefore / 1000);

      warningTimer = setTimeout(() => {
        setShowWarning(true);

        countdownInterval = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              handleLogout();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }, timeout - warningBefore);

      activityTimer = setTimeout(() => {
        handleLogout();
      }, timeout);
    };

    const handleLogout = () => {
      setShowWarning(false);
      clearTimeout(activityTimer);
      clearTimeout(warningTimer);
      clearInterval(countdownInterval);
      onLogout();
      navigate("/");
    };

    const events = ["mousemove", "keydown", "click", "scroll"];
    events.forEach((event) => window.addEventListener(event, resetTimers));

    resetTimers();

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimers));
      clearTimeout(activityTimer);
      clearTimeout(warningTimer);
      clearInterval(countdownInterval);
    };
  }, [timeout, warningBefore, onLogout, navigate]);

  return showWarning ? (
 <div className="fixed bottom-6 right-6 z-50">
  <div className="bg-white border border-purple-400 p-5 rounded-2xl shadow-2xl w-80 animate-fade-in-up">
    <h2 className="text-lg font-semibold text-gray-800">Sessão inativa</h2>
    <p className="text-gray-600 mt-1 text-sm">
      Você será desconectado por inatividade em{" "}
      <span className="font-bold text-indigo-600">{countdown}</span> segundos.
    </p>
    <p className="text-xs text-gray-400 mt-3">
      Mova o mouse ou pressione uma tecla para continuar.
    </p>
  </div>
</div>

  ) : null;
}

export default InactivityHandlerWithModal;
