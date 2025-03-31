import { useState } from 'react';
import { ArrowLeft, CalendarIcon, ImagePlus, MapPin, PenLine, Sparkles, Loader2 } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import NavBar from "../components/menu"

function CadastroEventos() {
    const navigate = useNavigate();
    const [imagem_evento, setImagemEvento] = useState(null);
    const [imagemPreview, setImagemPreview] = useState(null);
    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [dataEvento, setDataEvento] = useState('');
    const [local, setLocal] = useState('');
    const [tipo, setTipoEvento] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const API_EVENTOS = `${API_URL}/api/eventos`;

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validação do tipo e tamanho do arquivo
            const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
            const maxSize = 10 * 1024 * 1024; // 10MB
            
            if (!validTypes.includes(file.type)) {
                setError('Por favor, selecione uma imagem JPEG, PNG ou GIF');
                return;
            }
            
            if (file.size > maxSize) {
                setError('A imagem deve ter no máximo 10MB');
                return;
            }

            setImagemEvento(file);
            setImagemPreview(URL.createObjectURL(file));
            setError('');
        }
    };

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
        formData.append('tipo', tipo);
        formData.append('administrador_id', adminIdNumber);

        try {
            const resposta = await fetch(API_EVENTOS, {
                method: 'POST',
                body: formData,
                // Não defina Content-Type - o navegador irá definir automaticamente
                // com o boundary correto para FormData
            });

            const dados = await resposta.json();

            if (resposta.ok) {
                toast.success('Evento cadastrado com sucesso!');
                resetForm();
                navigate('/eventos');
            } else {
                throw new Error(dados.erro || 'Erro ao cadastrar evento');
            }
        } catch (err) {
            console.error("Erro na requisição:", err);
            setError(err.message || 'Erro ao cadastrar evento. Tente novamente mais tarde.');
            toast.error(err.message || 'Erro ao cadastrar evento. Tente novamente mais tarde.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setImagemEvento(null);
        setImagemPreview(null);
        setNome('');
        setDescricao('');
        setDataEvento('');
        setLocal('');
        setTipoEvento('');
    };

    return (
        <><NavBar /><div className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 py-16 px-4 sm:px-6 lg:px-8 pt-24 relative overflow-hidden">
            {/* Fundo animado */}
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
                                        <div className="flex text-sm text-gray-600 justify-center">
                                            <label className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                                                <span>Enviar uma imagem</span>
                                                <input
                                                    type="file"
                                                    className="sr-only"
                                                    accept="image/jpeg, image/png, image/gif"
                                                    onChange={handleImageChange} />
                                            </label>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            PNG, JPG, GIF até 10MB
                                        </p>
                                        {imagemPreview && (
                                            <div className="mt-4">
                                                <img
                                                    src={imagemPreview}
                                                    alt="Pré-visualização"
                                                    className="mx-auto h-32 object-cover rounded-md"
                                                    onLoad={() => URL.revokeObjectURL(imagemPreview)} />
                                                <p className="text-sm text-gray-900 mt-2 truncate px-2">
                                                    {imagem_evento.name}
                                                </p>
                                            </div>
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
                                    required />
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
                                    className="w-full px-4 py-3 rounded-xl bg-white/90 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all resize-none" />
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
                                        required />
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
                                        required />
                                </div>
                            </div>

                            {/* Campo Tipo de Evento */}
                            <div className="space-y-2">
                                <label className="flex items-center text-sm font-medium text-gray-700">
                                    <Sparkles className="h-4 w-4 mr-2 text-indigo-500" />
                                    Tipo de Evento
                                </label>
                                <select
                                    className="w-full px-4 py-3 rounded-xl bg-white/90 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
                                    required
                                    value={tipo}
                                    onChange={e => setTipoEvento(e.target.value)}
                                >
                                    <option value="">Selecione o tipo de evento</option>

                                    {/* Aniversários */}
                                    <option value="Aniversário de adolescente">Aniversário de adolescente</option>
                                    <option value="Aniversário de adulto">Aniversário de adulto</option>
                                    <option value="Aniversário de debutante">Aniversário de debutante</option>
                                    <option value="Aniversário de pet">Aniversário de pet</option>
                                    <option value="Aniversário infantil">Aniversário infantil</option>

                                    {/* Bodas - Ordem Alfabética */}
                                    <option value="Bodas de Algodão (1 ano)">Bodas de Algodão (1 ano)</option>
                                    <option value="Bodas de Aço (11 anos)">Bodas de Aço (11 anos)</option>
                                    <option value="Bodas de Barro (8 anos)">Bodas de Barro (8 anos)</option>
                                    <option value="Bodas de Cerâmica (9 anos)">Bodas de Cerâmica (9 anos)</option>
                                    <option value="Bodas de Coral (35 anos)">Bodas de Coral (35 anos)</option>
                                    <option value="Bodas de Couro (3 anos)">Bodas de Couro (3 anos)</option>
                                    <option value="Bodas de Cristal (15 anos)">Bodas de Cristal (15 anos)</option>
                                    <option value="Bodas de Diamante (60 anos)">Bodas de Diamante (60 anos)</option>
                                    <option value="Bodas de Esmeralda (40 anos)">Bodas de Esmeralda (40 anos)</option>
                                    <option value="Bodas de Estanho (10 anos)">Bodas de Estanho (10 anos)</option>
                                    <option value="Bodas de Lã (4 anos)">Bodas de Lã (4 anos)</option>
                                    <option value="Bodas de Latão (7 anos)">Bodas de Latão (7 anos)</option>
                                    <option value="Bodas de Madeira (5 anos)">Bodas de Madeira (5 anos)</option>
                                    <option value="Bodas de Marfim (14 anos)">Bodas de Marfim (14 anos)</option>
                                    <option value="Bodas de Ouro (50 anos)">Bodas de Ouro (50 anos)</option>
                                    <option value="Bodas de Papel (2 anos)">Bodas de Papel (2 anos)</option>
                                    <option value="Bodas de Pérola (30 anos)">Bodas de Pérola (30 anos)</option>
                                    <option value="Bodas de Perfume (6 anos)">Bodas de Perfume (6 anos)</option>
                                    <option value="Bodas de Platina (70 anos)">Bodas de Platina (70 anos)</option>
                                    <option value="Bodas de Porcelana (20 anos)">Bodas de Porcelana (20 anos)</option>
                                    <option value="Bodas de Prata (25 anos)">Bodas de Prata (25 anos)</option>
                                    <option value="Bodas de Rendá (13 anos)">Bodas de Rendá (13 anos)</option>
                                    <option value="Bodas de Rubi (45 anos)">Bodas de Rubi (45 anos)</option>
                                    <option value="Bodas de Seda (12 anos)">Bodas de Seda (12 anos)</option>

                                    {/* Casamentos */}
                                    <option value="Casamento">Casamento</option>
                                    <option value="Casamento Civil">Casamento Civil</option>
                                    <option value="Casamento Religioso">Casamento Religioso</option>

                                    {/* Chás */}
                                    <option value="Chá de bebê">Chá de bebê</option>
                                    <option value="Chá de cozinha">Chá de cozinha</option>
                                    <option value="Chá de fralda">Chá de fralda</option>
                                    <option value="Chá de panela">Chá de panela</option>
                                    <option value="Chá de revelação">Chá de revelação</option>

                                    {/* Corporativos */}
                                    <option value="Conferência">Conferência</option>
                                    <option value="Congresso">Congresso</option>
                                    <option value="Corporativo">Corporativo</option>

                                    {/* Religiosos */}
                                    <option value="Batizado">Batizado</option>
                                    <option value="Culto">Culto</option>
                                    <option value="Crisma">Crisma</option>

                                    {/* Sociais */}
                                    <option value="Despedida de solteiro">Despedida de solteiro</option>
                                    <option value="Encontro de amigos">Encontro de amigos</option>
                                    <option value="Encontro de negócios">Encontro de negócios</option>
                                    <option value="Encontro familiar">Encontro familiar</option>
                                    <option value="Evento beneficente">Evento beneficente</option>
                                    <option value="Evento cultural">Evento cultural</option>
                                    <option value="Evento esportivo">Evento esportivo</option>
                                    <option value="Evento religioso">Evento religioso</option>
                                    <option value="Exposição">Exposição</option>
                                    <option value="Feira">Feira</option>
                                    <option value="Festa junina">Festa junina</option>
                                    <option value="Festa temática">Festa temática</option>
                                    <option value="Formatura">Formatura</option>
                                    <option value="Inauguração">Inauguração</option>
                                    <option value="Jantar">Jantar</option>
                                    <option value="Lançamento de produto">Lançamento de produto</option>
                                    <option value="Missa">Missa</option>
                                    <option value="Noivado">Noivado</option>
                                    <option value="Palestra">Palestra</option>
                                    <option value="Reunião">Reunião</option>
                                    <option value="Seminário">Seminário</option>
                                    <option value="Show">Show</option>
                                    <option value="Workshop">Workshop</option>
                                    <option value="Outro">Outro</option>
                                </select>
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
        </div></>
    );
}

export default CadastroEventos;