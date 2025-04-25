import { useState, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { ScanLine, X, RefreshCcw } from "lucide-react";

export default function QRCodeScanButton() {
  const [showScanner, setShowScanner] = useState(false);
  const [scanner, setScanner] = useState(null);
  const [cameras, setCameras] = useState([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const [isSwitching, setIsSwitching] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const stopScanner = async () => {
    if (scanner) {
      await scanner.stop();
      scanner.clear();
      setScanner(null);
    }
  };

  const startScanner = async (cameraId) => {
    const html5QrCode = new Html5Qrcode("reader");

    const handleScanSuccess = async (decodedText) => { 
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

      await html5QrCode.stop();
      html5QrCode.clear();
      setShowScanner(false);
      setScanner(null);
    };

    try {
      await html5QrCode.start(
        { deviceId: { exact: cameraId } },
        {
          fps: 10,
          qrbox: 250,
          aspectRatio: 1.777,
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true,
          },
          videoConstraints: {
            deviceId: cameraId,
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "environment",
          },
        },
        handleScanSuccess
      );

      setScanner(html5QrCode);
    } catch (err) {
      console.warn("Tentando fallback com config padrão...");

      try {
        await html5QrCode.start(
          cameraId,
          { fps: 10, qrbox: 250, aspectRatio: 1.777 },
          handleScanSuccess
        );

        setScanner(html5QrCode);
      } catch (fallbackErr) {
        console.error("Erro ao iniciar o scanner:", fallbackErr);
        alert("Erro ao iniciar o scanner.");
      }
    }
  };

  const switchCamera = async () => {
    if (cameras.length <= 1 || isSwitching) return;

    setIsSwitching(true);
    try {
      await stopScanner();
      const nextIndex = (currentCameraIndex + 1) % cameras.length;
      setCurrentCameraIndex(nextIndex);
    } finally {
      setIsSwitching(false);
    }
  };

  useEffect(() => {
    if (showScanner && cameras.length === 0) {
      Html5Qrcode.getCameras()
        .then((devices) => {
          if (devices.length === 0) {
            alert("Nenhuma câmera encontrada.");
            return;
          }

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
      startScanner(cameras[currentCameraIndex].id);
    }

    return () => {
      stopScanner();
    };
  }, [currentCameraIndex, cameras, showScanner]);

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
              onClick={async () => {
                await stopScanner();
                setShowScanner(false);
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
                disabled={isSwitching}
                className="mt-3 w-full text-center text-blue-600 text-sm hover:underline flex items-center justify-center gap-1"
              >
                <RefreshCcw size={14} className={isSwitching ? "animate-spin" : ""} />
                Alternar câmera
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
