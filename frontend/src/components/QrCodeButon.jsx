import { useState, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { ScanLine, X, RefreshCcw } from "lucide-react";

export default function QRCodeScanButton() {
  const [showScanner, setShowScanner] = useState(false);
  const [scanner, setScanner] = useState(null);
  const [cameras, setCameras] = useState([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);

  const startScanner = (cameraId) => {
    const html5QrCode = new Html5Qrcode("reader");
    html5QrCode
      .start(
        cameraId,
        {
          fps: 5,
          qrbox: 200,
          aspectRatio: 1.777,
        },
        async (decodedText) => {
          try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/presenca`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token: decodedText }),
            });

            const data = await response.json();

            alert(data.mensagem || (response.ok ? "Presença confirmada!" : "Erro ao confirmar presença."));
          } catch (error) {
            console.error("Erro ao registrar presença:", error);
            alert("Erro ao registrar presença.");
          }

          html5QrCode.stop().then(() => {
            html5QrCode.clear();
            setShowScanner(false);
            setScanner(null);
          });
        }
      )
      .then(() => setScanner(html5QrCode))
      .catch((err) => {
        console.error("Erro ao iniciar o scanner", err);
        alert("Erro ao iniciar o scanner.");
      });
  };

  useEffect(() => {
    if (showScanner && cameras.length === 0) {
      Html5Qrcode.getCameras()
        .then((devices) => {
          if (devices.length === 0) {
            alert("Nenhuma câmera encontrada.");
            return;
          }

          // Prioriza câmera traseira
          const sortedDevices = [
            ...devices.filter((d) => d.label.toLowerCase().includes("back")),
            ...devices.filter((d) => !d.label.toLowerCase().includes("back")),
          ];

          setCameras(sortedDevices);
          setCurrentCameraIndex(0);
        })
        .catch((err) => {
          console.error("Erro ao obter câmeras:", err);
          alert("Erro ao acessar a câmera.");
        });
    }
  }, [showScanner]);

  useEffect(() => {
    if (showScanner && cameras.length > 0) {
      if (scanner) {
        scanner.stop().then(() => {
          scanner.clear();
          startScanner(cameras[currentCameraIndex].id);
        });
      } else {
        startScanner(cameras[currentCameraIndex].id);
      }
    }

    return () => {
      if (scanner) {
        scanner.stop().then(() => scanner.clear());
      }
    };
  }, [currentCameraIndex, cameras, showScanner]);

  const switchCamera = () => {
    setCurrentCameraIndex((prevIndex) => (prevIndex + 1) % cameras.length);
  };

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
        <div className="fixed inset-0 bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-xl shadow-xl relative w-[340px]">
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
            <div className="mb-2 text-center text-sm text-gray-600">
              {cameras[currentCameraIndex]?.label || "Carregando..."}
            </div>
            <div id="reader" className="w-full" />
            {cameras.length > 1 && (
              <button
                onClick={switchCamera}
                className="mt-3 w-full text-center text-blue-600 text-sm hover:underline flex items-center justify-center gap-1"
              >
                <RefreshCcw size={14} />
                Alternar câmera
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
