
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Loader2, Phone, Mail, MapPin, Clock, Ticket, Share2 } from 'lucide-react';
import QRCode from 'react-qr-code';
import Menu from '../components/menu';

export default function CredenciaisPage() {

  const location = useLocation();
  const navigate = useNavigate();
  const [credenciais, setCredenciais] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('convidado');

  useEffect(() => {
    const state = location.state;
    if (state && state.convidado && state.evento && state.acompanhantes) {
      setCredenciais(state);
      setLoading(false);
    } else {
      setError("Dados da credencial não encontrados");
      setLoading(false);
      setTimeout(() => navigate('/'), 3000);
    }
  }, [location, navigate]);

  const formatDate = (dateString) => {
    const options = {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  const shareViaWhatsApp = () => {
    if (!credenciais) return;

    const { convidado, evento, acompanhantes } = credenciais;
    const phoneNumber = convidado.telefone;

    if (!phoneNumber) {
      alert('Número de telefone não disponível para envio via WhatsApp');
      return;
    }

    const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173';

const eventDate = formatDate(evento.data_evento);
let message = `*Suas credenciais para ${evento.nome}*\n\n`;
message += `*Convidado Principal:* ${convidado.nome}\n`;
message += `*Evento:* ${evento.nome}\n`;
message += `*Data:* ${eventDate}\n`;
message += `*Local:* ${evento.local}\n\n`;
message += `*Link da credencial:* ${FRONTEND_URL}/credencial?id=${convidado.id}\n\n`;

if (acompanhantes.length > 0) {
  message += `*Acompanhantes:*\n`;
  acompanhantes.forEach(acomp => {
    message += `- ${acomp.nome}: ${FRONTEND_URL}/credencial?id=${convidado.id}-acompanhante-${acomp.id}\n`;
  });
}


    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <Loader2 className="animate-spin text-purple-600" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-red-500 text-xl">{error}</p>
      </div>
    );
  }

  return (
    <>
      <Menu />
      <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
  <h1 className="text-4xl font-medium text-gray-800 uppercase tracking-wide mb-2">
    {credenciais.evento.nome}
  </h1>
  <h2 className="text-sm text-gray-600">
    {formatDate(credenciais.evento.data_evento)}
  </h2>
</div>
<h3 className="ml-1 font-bold text-gray-800 "> Suas Credenciais </h3>
          <div className="flex justify-center border-b border-gray-200 mb-8 space-x-6">
            <button
              className={`py-2 px-4 font-medium text-sm transition-all rounded-t-md ${
                activeTab === 'convidado'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('convidado')}
            >
              Convidado Principal
            </button>

            {credenciais.acompanhantes.length > 0 && (
              <button
                className={`py-2 px-4 font-medium text-sm transition-all rounded-t-md ${
                  activeTab === 'acompanhantes'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('acompanhantes')}
              >
                Acompanhantes ({credenciais.acompanhantes.length})
              </button>
            )}
          </div>

          {activeTab === 'convidado' && (
            <div className="mb-14">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 transition-all hover:shadow-2xl">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-5 text-white text-center">
                  <h3 className="text-xl font-bold">{credenciais.evento.nome}</h3>
                  <p className="text-purple-200">Credencial Principal</p>
                </div>

                <div className="p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">{credenciais.convidado.nome}</h3>
                    <p className="text-purple-600 font-medium">Convidado Especial</p>
                  </div>

                  <div className="space-y-4 mb-6 text-gray-700">
                    <div className="flex items-center gap-3">
                      <Phone size={18} className="text-purple-600" />
                      <span>{credenciais.convidado.telefone || 'Não informado'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail size={18} className="text-purple-600" />
                      <span>{credenciais.convidado.email || 'Não informado'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock size={18} className="text-purple-600" />
                      <span>{formatDate(credenciais.evento.data_evento)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin size={18} className="text-purple-600" />
                      <span>{credenciais.evento.local}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-5 rounded-xl flex flex-col items-center transition-transform hover:scale-105">
                    <QRCode
                      value={`http://localhost:5000/credencial?id=${credenciais.convidado.id}`}
                      size={180}
                      level="H"
                      className="mb-3"
                    />
                    <p className="text-sm text-gray-500">ID: {credenciais.convidado.id}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'acompanhantes' && credenciais.acompanhantes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {credenciais.acompanhantes.map((acompanhante) => (
                <div key={acompanhante.id} className="bg-white rounded-2xl shadow-xl border border-gray-100 transition-all hover:shadow-2xl">
                  <div className="bg-gradient-to-r from-blue-500 to-sky-600 p-4 text-white text-center">
                    <h3 className="text-lg font-bold">{credenciais.evento.nome}</h3>
                    <p className="text-blue-100">Credencial de Acompanhante</p>
                  </div>

                  <div className="p-6">
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-bold text-gray-800">{acompanhante.nome}</h3>
                      <p className="text-blue-600 font-medium">Acompanhante</p>
                    </div>

                    <div className="space-y-2 mb-4 text-gray-700">
                      {acompanhante.telefone && (
                        <div className="flex items-center gap-2">
                          <Phone size={16} className="text-blue-600" />
                          <span>{acompanhante.telefone}</span>
                        </div>
                      )}
                      {acompanhante.email && (
                        <div className="flex items-center gap-2">
                          <Mail size={16} className="text-blue-600" />
                          <span>{acompanhante.email}</span>
                        </div>
                      )}
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center transition-transform hover:scale-105">
                      <QRCode
                        value={`http://localhost:5000/credencial?id=${credenciais.convidado.id}-acompanhante-${acompanhante.id}`}
                        size={150}
                        level="H"
                        className="mb-2"
                      />
                      <p className="text-xs text-gray-500">ID: {credenciais.convidado.id}-acompanhante-{acompanhante.id}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-12 flex justify-center gap-4">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 shadow-md transition-all"
            >
              <Ticket className="mr-2" size={18} />
              Imprimir Credenciais
            </button>

            <button
              onClick={shareViaWhatsApp}
              disabled={!credenciais?.convidado?.telefone}
              className="inline-flex items-center px-5 py-2.5 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 shadow-md transition-all disabled:opacity-50"
            >
              <Share2 className="mr-2" size={18} />
              Enviar via WhatsApp
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
