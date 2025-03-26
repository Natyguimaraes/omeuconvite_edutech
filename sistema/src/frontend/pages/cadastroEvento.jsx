import { useState } from 'react';
import { ArrowLeft, CalendarIcon, ImagePlus, MapPin, PenLine, Sparkles } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";

function CadastroEventos() {
    const navigate = useNavigate();
    const [imagem_evento, setImagemEvento] = useState(null); // Alterado para File
    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [dataEvento, setDataEvento] = useState('');
    const [local, setLocal] = useState('');
    const [administrador_id, setAdministradorId] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCadastro = async () => {
        setError('');
        setSuccess('');
        setIsSubmitting(true);
      
        // Recupera o adminId do localStorage
        const adminId = localStorage.getItem("adminId");
        console.log("Admin ID recuperado do localStorage:", adminId); // Log para depuração
      
        if (!adminId) {
          setError("ID do administrador não encontrado.");
          toast.error("ID do administrador não encontrado.");
          setIsSubmitting(false);
          return;
        }
      
        // Converte o adminId para número
        const adminIdNumber = Number(adminId);
        console.log("Admin ID convertido para número:", adminIdNumber); // Log para depuração
      
        if (isNaN(adminIdNumber)) {
          setError("ID do administrador inválido.");
          toast.error("ID do administrador inválido.");
          setIsSubmitting(false);
          return;
        }

        // Cria um FormData para enviar os dados do formulário
        const formData = new FormData();
        formData.append('imagem_evento', imagem_evento);
        formData.append('nome', nome);
        formData.append('descricao', descricao);
        formData.append('data_evento', dataEvento);
        formData.append('local', local);
        formData.append('administrador_id', adminIdNumber); // Adiciona o adminId ao FormData

        console.log("Dados do FormData:", { // Log para depuração
            nome,
            descricao,
            dataEvento,
            local,
            administrador_id: adminIdNumber,
            imagem_evento: imagem_evento ? imagem_evento.name : "Nenhuma imagem selecionada",
        });

        try {
            const resposta = await fetch('http://localhost:5000/api/eventos', {
                method: 'POST',
                body: formData, // Envia o FormData (não precisa de headers 'Content-Type')
            });

            const dados = await resposta.json();
            console.log("Resposta da API:", dados); // Log para depuração

            if (resposta.ok) {
                toast.success('Evento cadastrado com sucesso!');
                setSuccess('Evento cadastrado com sucesso!');
                setImagemEvento(null);
                setNome('');
                setDescricao('');
                setDataEvento('');
                setLocal('');
            } else {
                setError(dados.erro || 'Erro ao cadastrar evento.');
                toast.error(dados.erro || 'Erro ao cadastrar evento.');
            }
        } catch (err) {
            console.error("Erro na requisição:", err);
            setError('Erro ao cadastrar evento. Tente novamente mais tarde.');
            toast.error('Erro ao cadastrar evento. Tente novamente mais tarde.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-event-background to-event-accent/10 py-12 px-4 sm:px-6 lg:px-8 page-transition">
            <div className="max-w-3xl mx-auto">
                <button 
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center text-event-text-secondary hover:text-event-primary transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    <span>Voltar para a listagem</span>
                </button>
                
                <div className="event-chip bg-event-primary/10 text-event-primary mb-3 inline-flex">
                    <Sparkles className="h-4 w-4 mr-1" />
                    <span>Novo Evento</span>
                </div>
                
                <h1 className="text-4xl font-bold tracking-tight text-event-text-primary mb-6">
                    Cadastro de Evento
                </h1>
                
                <div className="backdrop-blur-sm bg-white/50 rounded-3xl shadow-xl border border-white/80 overflow-hidden">
                    <div className="p-8">
                        {error && (
                            <div className="mb-6 bg-red-50 text-red-600 rounded-xl p-4">
                                <p>{error}</p>
                            </div>
                        )}
                        
                        {success && (
                            <div className="mb-6 bg-green-50 text-green-600 rounded-xl p-4">
                                <p>{success}</p>
                            </div>
                        )}
                        
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="flex items-center text-sm font-medium text-event-text-secondary">
                                    <ImagePlus className="h-4 w-4 mr-2 text-event-primary" />
                                    Imagem do evento
                                </label>
                                <div className="relative">
                                    <input 
                                        type="file"
                                        accept="image/*"
                                        className="w-full px-4 py-3 rounded-xl bg-white/70 border border-gray-200 focus:border-event-primary focus:ring-1 focus:ring-event-primary focus:outline-none transition-all shadow-sm"
                                        onChange={e => setImagemEvento(e.target.files[0])} // Captura o arquivo selecionado
                                    />
                                </div>
                            </div>
                            
                            {/* Restante do formulário */}
                            <div className="space-y-2">
                                <label className="flex items-center text-sm font-medium text-event-text-secondary">
                                    <Sparkles className="h-4 w-4 mr-2 text-event-primary" />
                                    Nome do evento
                                </label>
                                <input
                                    type="text"
                                    placeholder="Digite o nome do evento"
                                    value={nome}
                                    onChange={e => setNome(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-white/70 border border-gray-200 focus:border-event-primary focus:ring-1 focus:ring-event-primary focus:outline-none transition-all shadow-sm"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="flex items-center text-sm font-medium text-event-text-secondary">
                                    <PenLine className="h-4 w-4 mr-2 text-event-primary" />
                                    Descrição
                                </label>
                                <textarea
                                    placeholder="Descreva o seu evento"
                                    value={descricao}
                                    onChange={e => setDescricao(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl bg-white/70 border border-gray-200 focus:border-event-primary focus:ring-1 focus:ring-event-primary focus:outline-none transition-all shadow-sm resize-none"
                                />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="flex items-center text-sm font-medium text-event-text-secondary">
                                        <CalendarIcon className="h-4 w-4 mr-2 text-event-primary" />
                                        Data e hora
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={dataEvento}
                                        onChange={e => setDataEvento(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-white/70 border border-gray-200 focus:border-event-primary focus:ring-1 focus:ring-event-primary focus:outline-none transition-all shadow-sm"
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="flex items-center text-sm font-medium text-event-text-secondary">
                                        <MapPin className="h-4 w-4 mr-2 text-event-primary" />
                                        Local
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Digite o local do evento"
                                        value={local}
                                        onChange={e => setLocal(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-white/70 border border-gray-200 focus:border-event-primary focus:ring-1 focus:ring-event-primary focus:outline-none transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                            
                            <div className="pt-4 space-y-4 mt-8 bg-[rgb(135,167,188)] text-white font-medium py-2.5 px-4 rounded-full transition-all duration-200 hover:bg-[rgb(120,150,170)] active:bg-[rgb(110,140,155)] active:scale-95 shadow-sm">
                                <button 
                                    className="btn-primary w-full flex items-center justify-center relative"
                                    onClick={handleCadastro}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="opacity-0">Cadastrar evento</span>
                                            <span className="absolute inset-0 flex items-center justify-center">
                                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            </span>
                                        </>
                                    ) : (
                                        <span>Cadastrar evento</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CadastroEventos;