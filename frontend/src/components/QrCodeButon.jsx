import { useState, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { ScanLine, X } from "lucide-react";

export default function QRCodeScanButton() {
  const [showScanner, setShowScanner] = useState(false);
  const [scanner, setScanner] = useState(null);

  useEffect(() => {
    if (showScanner && !scanner) {
      const html5QrCode = new Html5Qrcode("reader");
      html5QrCode
        .start(
          { facingMode: { exact: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
  { fps: 10, qrbox: 250 },
          async (decodedText) => {
            try {
              const response = await fetch(`${import.meta.env.VITE_API_URL}/api/presenca`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ token: decodedText }),
              });

              const data = await response.json();

              if (response.ok) {
                alert(data.mensagem || "Presença confirmada com sucesso!");
              } else {
                alert(data.mensagem || "Erro ao confirmar presença.");
              }
            } catch (error) {
              console.error("Erro ao registrar presença:", error);
              alert("Erro ao registrar presença. Verifique sua conexão.");
            }

            html5QrCode.stop().then(() => {
              html5QrCode.clear();
              setShowScanner(false);
              setScanner(null);
            });
          },
          (error) => {
            // erros de leitura contínuos podem ser ignorados ou logados se necessário
          }
        )
        .then(() => setScanner(html5QrCode))
        .catch((err) => console.error("Erro ao iniciar o scanner", err));
    }

    return () => {
      if (scanner) {
        scanner.stop().then(() => scanner.clear());
      }
    };
  }, [showScanner]);

  return (
    <div>
      <button
        onClick={() => setShowScanner(true)}
        className="inline-flex items-center gap-2 px-2 py-1 bg-green-600 text-white font-semibold rounded-xl shadow-md hover:bg-green-700 transition-all cursor-pointer"
      >
        <ScanLine size={20} />
        Ler QR Code
      </button>

      {showScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-xl shadow-xl relative w-[320px]">
            <button
              onClick={() => {
                if (scanner) {
                  scanner.stop().then(() => scanner.clear());
                }
                setShowScanner(false);
                setScanner(null);
              }}
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
            >
              <X size={18} />
            </button>
            <p className="text-center font-semibold mb-2">
              Aponte a câmera para o QR Code
            </p>
            <div id="reader" className="w-full" />
          </div>
        </div>
      )}
    </div>
  );
}