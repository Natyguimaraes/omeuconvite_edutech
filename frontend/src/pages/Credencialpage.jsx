import { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Download, ChevronLeft, Users } from "lucide-react";
import QRCode from "react-qr-code";
import domtoimage from "dom-to-image-more";

export default function CredenciaisPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const credencialRef = useRef();
  const { state } = location;

  const [credenciais, setCredenciais] = useState({
    convidado: state?.convidado || null,
    evento: state?.evento || null,
    acompanhantes: state?.acompanhantes || [],
  });

  const formatarData = (dataString) => {
    return new Date(dataString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const downloadCredencial = async () => {
    const element = credencialRef.current;
    try {
      const dataUrl = await domtoimage.toPng(element, {
        bgcolor: "#fff",
        quality: 1,
        width: element.offsetWidth * 2,
        height: element.offsetHeight * 2,
        filter: (node) => node.id !== "download-btn", // Esconde o botão de download na imagem
      });

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `credencial-${credenciais.convidado.nome}.png`;
      link.click();
    } catch (err) {
      console.error("Erro ao baixar credencial:", err);
      alert("Erro ao baixar credencial");
    }
  };

  const downloadQRCode = async (id, nome) => {
    const element = document.getElementById(`acomp-${id}`);
    try {
      const dataUrl = await domtoimage.toPng(element, {
        bgcolor: "#fff",
        quality: 1,
        width: element.offsetWidth * 2,
        height: element.offsetHeight * 2,
        filter: (node) => node.id !== `download-btn-${id}`, // Esconde o botão de download do acompanhante na imagem
      });

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `credencial-${nome}.png`;
      link.click();
    } catch (err) {
      console.error("Erro ao baixar QR Code:", err);
      alert("Erro ao baixar QR Code");
    }
  };

  if (!credenciais.convidado || !credenciais.evento) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Credencial não encontrada</h2>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg"
          >
            Voltar para o início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-800"
          >
            <ChevronLeft size={20} />
            <span>Voltar</span>
          </button>
          <div className="w-8"></div>
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-bold">Credenciais do Evento</h1>
        </div>

        <div className="mt-10 p-10 bg-purple-100 rounded-2xl">
          <h2 className="text-xl font-bold mb-2">{credenciais.evento.nome}</h2>
          <div className="space-y-2 text-gray-700">
            <p>
              <span className="font-medium">Data:</span>{" "}
              {formatarData(credenciais.evento.data_evento)}
            </p>
            <p>
              <span className="font-medium">Local:</span>{" "}
              {credenciais.evento.local}
            </p>
          </div>
        </div>

        {/* Credencial principal */}
        <div className="flex flex-col items-center">
          <div
            ref={credencialRef}
            id="convidado-principal"
            className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-4 shadow-2xl flex flex-col items-center text-center w-full max-w-[300px]"
          >
            <h2 className="text-3xl font-bold text-purple-800 mb-2">
              {credenciais.evento.nome}
            </h2>
            <p className="text-xl text-gray-600 mb-1">
              {formatarData(credenciais.evento.data_evento)}
            </p>
            <p className="text-xl text-gray-600 mb-2">
              {credenciais.evento.local}
            </p>
            
            <div className="bg-white p-3 rounded-lg border border-gray-300 shadow-inner">
              <QRCode
                value={`${credenciais.convidado.token}`}
                size={200}
                level="H"
                className="mb-2"
              />
            </div>

            <p className="font-medium mt-2 text-gray-800">
              {credenciais.convidado.nome}
            </p>
            <p className="text-xs text-gray-500">Convidado Principal</p>

            <img
              src="/omeuconvitelogo.jpeg"
              alt="Logo O Meu Convite"
              className="w-25 mt-4 rounded-xl"
            />

            <p className="text-lg text-gray-400 mt-3">
              Visite nosso site: www.omeuconvite.com
            </p>

            <button
              id="download-btn"
              onClick={downloadCredencial}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Download size={18} />
              Baixar Credencial
            </button>
          </div>
        </div>

        {/* Acompanhantes */}
        {credenciais.acompanhantes.length > 0 && (
          <div className="bg-white rounded-xl shadow-2xl p-6 mt-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Users size={20} />
              Acompanhantes ({credenciais.acompanhantes.length})
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {credenciais.acompanhantes.map((acomp) => (
                <div
                  key={acomp.id}
                  id={`acomp-${acomp.id}`}
                  className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-4 shadow-md flex flex-col items-center text-center"
                >
                  <h2 className="text-3xl font-bold text-purple-800 mb-2">
                    {credenciais.evento.nome}
                  </h2>
                  <p className="text-xl text-gray-600 mb-1">
                    {formatarData(credenciais.evento.data_evento)}
                  </p>
                  <p className="text-xl text-gray-600 mb-2">
                    {credenciais.evento.local}
                  </p>

                  <div className="bg-white p-3 rounded-lg border border-gray-300 shadow-inner">
                    <QRCode
                      value={`${acomp.token}`}
                      size={200}
                      level="H"
                      className="mb-2"
                    />
                  </div>

                  <p className="font-medium mt-2 text-gray-800">{acomp.nome}</p>
                  <p className="text-xs text-gray-500">Acompanhante</p>
                  <img
                    src="/omeuconvitelogo.jpeg"
                    alt="Logo O Meu Convite"
                    className="w-25 mt-4 rounded-xl border-solid-black"
                  />
                  <p className="text-lg text-gray-400 mt-3">
                    Visite nosso site: www.omeuconvite.com
                  </p>

                  <button
                    id={`download-btn-${acomp.id}`}
                    onClick={() => downloadQRCode(acomp.id, acomp.nome)}
                    className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <Download size={16} />
                    Baixar Credencial
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

