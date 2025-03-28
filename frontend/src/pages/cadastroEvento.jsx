import { useState } from 'react';
import { ArrowLeft, CalendarIcon, ImagePlus, MapPin, PenLine, Sparkles, Loader2 } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";

function CadastroEventos() {
    const navigate = useNavigate();
    const [imagem_evento, setImagemEvento] = useState(null);
    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [dataEvento, setDataEvento] = useState('');
    const [local, setLocal] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

   
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const API_EVENTOS = `${API_URL}/api/eventos`;

    const handleCadastro = async () => {
        setError('');
        setIsSubmitting(true);
      
        const adminId = localStorage.getItem("adminId");
        if (!adminId) {
            setError("ID do administrador não encontrado.");
            toast.error("ID do administrador não encontrado.");
            setIsSubmitting(false);
            return;
        }
      
        const adminIdNumber = Number(adminId);
        if (isNaN(adminIdNumber)) {
            setError("ID do administrador inválido.");
            toast.error("ID do administrador inválido.");
            setIsSubmitting(false);
            return;
        }

        const formData = new FormData();
        if (imagem_evento) formData.append('imagem_evento', imagem_evento);
        formData.append('nome', nome);
        formData.append('descricao', descricao);
        formData.append('data_evento', dataEvento);
        formData.append('local', local);
        formData.append('administrador_id', adminIdNumber);

        try {
            const resposta = await fetch(API_EVENTOS, {
                method: 'POST',
                body: formData,
            });

            const dados = await resposta.json();

            if (resposta.ok) {
                toast.success('Evento cadastrado com sucesso!');
                setImagemEvento(null);
                setNome('');
                setDescricao('');
                setDataEvento('');
                setLocal('');
                navigate('/eventos');
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
        <>
           
            <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 py-16 px-4 sm:px-6 lg:px-8 pt-24 relative overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
                    <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-purple-300 mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: "0s" }}></div>
                    <div className="absolute top-40 right-20 w-72 h-72 rounded-full bg-pink-300 mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: "1s" }}></div>
                    <div className="absolute bottom-10 left-1/3 w-80 h-80 rounded-full bg-blue-300 mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: "2s" }}></div>
                </div>
                
                <div className="max-w-3xl mx-auto relative z-10">
                    <button 
                        onClick={() => navigate(-1)}
                        className="flex items-center text-gray-600 hover:text-indigo-600 mb-6 transition-colors group"
                    >
                        <ArrowLeft size={20} className="mr-1 group-hover:-translate-x-1 transition-transform" />
                        <span>Voltar para eventos</span>
                    </button>
                    
                    <div className="backdrop-blur-md bg-white/80 rounded-3xl overflow-hidden border border-white/30 shadow-xl">
                        <div className="p-8 sm:p-10">
                            <div className="text-center mb-10">
                                <div className="inline-flex items-center bg-indigo-100 px-4 py-2 rounded-full text-indigo-600 font-medium mb-4 shadow-sm">
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    <span>Cadastro de Eventos</span>
                                </div>
                                <h1 className="text-3xl font-extrabold tracking-tight text-gray-800 mb-2">
                                    Criar Novo Evento
                                </h1>
                                <p className="text-gray-600 max-w-lg mx-auto">
                                    Preencha os detalhes abaixo para criar um evento memorável
                                </p>
                            </div>
                            
                            {error && (
                                <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 border border-red-100 flex items-start">
                                    <span className="text-red-500">⚠️</span>
                                    <p className="ml-2">{error}</p>
                                </div>
                            )}
                            
                            <div className="space-y-6">
                                {/* Upload de imagem */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-gray-700">
                                        <span className="inline-flex items-center">
                                            <ImagePlus className="h-4 w-4 mr-2 text-indigo-500" />
                                            Imagem do Evento
                                        </span>
                                    </label>
                                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl bg-white/90">
                                        <div className="space-y-1 text-center">
                                            <div className="flex text-sm text-gray-600">
                                                <label className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                                                    <span>Enviar uma imagem</span>
                                                    <input 
                                                        type="file" 
                                                        className="sr-only" 
                                                        accept="image/*"
                                                        onChange={e => setImagemEvento(e.target.files[0])}
                                                    />
                                                </label>
                                                <p className="pl-1">ou arraste e solte</p>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                PNG, JPG, GIF até 10MB
                                            </p>
                                            {imagem_evento && (
                                                <p className="text-sm text-gray-900 mt-2">
                                                    {imagem_evento.name}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Nome do evento */}
                                <div className="space-y-2">
                                    <label className="flex items-center text-sm font-medium text-gray-700">
                                        <Sparkles className="h-4 w-4 mr-2 text-indigo-500" />
                                        Nome do Evento
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Festa de Aniversário"
                                        value={nome}
                                        onChange={e => setNome(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-white/90 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
                                        required
                                    />
                                </div>
                                
                                {/* Descrição */}
                                <div className="space-y-2">
                                    <label className="flex items-center text-sm font-medium text-gray-700">
                                        <PenLine className="h-4 w-4 mr-2 text-indigo-500" />
                                        Descrição
                                    </label>
                                    <textarea
                                        placeholder="Descreva seu evento com detalhes..."
                                        value={descricao}
                                        onChange={e => setDescricao(e.target.value)}
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-xl bg-white/90 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all resize-none"
                                    />
                                </div>
                                
                                {/* Data e Local */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="flex items-center text-sm font-medium text-gray-700">
                                            <CalendarIcon className="h-4 w-4 mr-2 text-indigo-500" />
                                            Data e Hora
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={dataEvento}
                                            onChange={e => setDataEvento(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl bg-white/90 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
                                            required
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="flex items-center text-sm font-medium text-gray-700">
                                            <MapPin className="h-4 w-4 mr-2 text-indigo-500" />
                                            Local do Evento
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Ex: Salão de Festas"
                                            value={local}
                                            onChange={e => setLocal(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl bg-white/90 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
                                            required
                                        />
                                    </div>
                                </div>
                                
                                {/* Botão de cadastro */}
                                <div className="pt-4">
                                    <button 
                                        onClick={handleCadastro}
                                        disabled={isSubmitting}
                                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-3.5 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-indigo-200/50 flex items-center justify-center"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                                Cadastrando...
                                            </>
                                        ) : (
                                            "Criar Evento"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default CadastroEventos;