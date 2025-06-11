import { Check, Trash2, Plus, X } from "lucide-react";
import { formatPhoneNumber } from "../../utils/phoneUtils"; 
import { toast } from "sonner"; 

export default function EditGuestModal({
  show,
  onClose,
  editData,
  setEditData,
  onSave,
  onDeleteAcompanhante,
  onAddAcompanhante,
  convidadoId, 
  eventoId, 
}) {
  if (!show) return null;

  const handleConvidadoChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "telefone") {
      
      newValue = value.replace(/\D/g, ""); 
      setEditData((prev) => ({
        ...prev,
        [name]: newValue,
      }));
    } else {
      setEditData((prev) => ({
        ...prev,
        [name]: newValue,
      }));
    }
  };

  const handleAcompanhanteChange = (e, index) => {
  const { name, value } = e.target;
  
  const newValue = name === 'telefone' ? value.replace(/\D/g, '') : value;

  const updatedAcompanhantes = editData.acompanhantes.map((acompanhante, i) =>
    i === index ? { ...acompanhante, [name]: newValue } : acompanhante
  );
  setEditData(prev => ({ ...prev, acompanhantes: updatedAcompanhantes }));
};

  const handleDeleteAcompanhanteFromModal = (acompanhanteToDelete) => {
    if (!window.confirm(`Tem certeza que deseja remover ${acompanhanteToDelete.nome || 'este acompanhante'}?`)) {
      return;
    }

    const updatedAcompanhantes = editData.acompanhantes.filter(
      (a) => a.id !== acompanhanteToDelete.id
    );
    setEditData((prev) => ({ ...prev, acompanhantes: updatedAcompanhantes }));
    toast.info(`Acompanhante ${acompanhanteToDelete.nome || 'temporário'} removido do formulário. Salve as alterações para finalizar.`);

    if (acompanhanteToDelete.id && !String(acompanhanteToDelete.id).startsWith('temp-')) {
      onDeleteAcompanhante(convidadoId, acompanhanteToDelete.id); // Esta função já chamará fetchDados
    }
  };


  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-3xl border border-gray-100 w-full max-w-4xl max-h-[95vh] overflow-hidden animate-scale-in">
        {/* Header com gradiente */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Editar Convidado</h2>
              <p className="text-indigo-100 text-sm">
                Atualize as informações do convidado e seus acompanhantes
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all duration-200 hover:scale-110"
            >
              <X className="h-6 w-6 cursor-pointer" />
            </button>
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="p-8 overflow-y-auto max-h-[calc(95vh-200px)]">
          {/* Seção do Convidado Principal */}
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full mr-3"></div>
              <h3 className="text-xl font-semibold text-gray-800">Informações Principais</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Nome Completo
                </label>
                <input
                  type="text"
                  name="nome"
                  value={editData.nome || ""} 
                  onChange={handleConvidadoChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200 text-gray-800 placeholder-gray-400"
                  placeholder="Digite o nome completo"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Telefone</label>
                <input
                  type="text"
                  name="telefone"
                  value={formatPhoneNumber(editData.telefone || "")} 
                  onChange={handleConvidadoChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200 text-gray-800 placeholder-gray-400"
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={editData.email || ""}
                  onChange={handleConvidadoChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200 text-gray-800 placeholder-gray-400"
                  placeholder="email@exemplo.com"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Limite de Acompanhantes
                </label>
                <input
                  type="number"
                  min="0"
                  value={editData.limite_acompanhante}
                  onChange={(e) =>
                    setEditData({ ...editData, limite_acompanhante: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200 text-gray-800"
                />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-indigo-50/30 rounded-2xl p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full mr-3"></div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Acompanhantes</h3>
                  <p className="text-sm text-gray-600">
                    {editData.acompanhantes?.length || 0} de{" "}
                    {editData.limite_acompanhante || 0} adicionados
                  </p>
                </div>
              </div>

              <button
                onClick={onAddAcompanhante}
                disabled={editData.acompanhantes?.length >= (editData.limite_acompanhante || 0)}
                className="bg-gray-700 hover:bg-gray-500 disabled:from-gray-400 disabled:to-gray-400 text-white px-4 py-2 rounded-xl flex items-center text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Acompanhante
              </button>
            </div>

            <div className="space-y-4">
              {editData.acompanhantes?.length > 0 ? (
                editData.acompanhantes.map((acompanhante, index) => (
                  <div
                    key={acompanhante.id || `modal-temp-${index}`}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            Nome
                          </label>
                          <input
                            type="text"
                            name="nome"
                            value={acompanhante.nome || ""}
                            onChange={(e) => handleAcompanhanteChange(e, index)}
                            placeholder="Nome do acompanhante"
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all duration-200"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            Telefone
                          </label>
                          <input
                            type="text"
                            name="telefone"
                            value={formatPhoneNumber(acompanhante.telefone || "")} // Exibe formatado
                            onChange={(e) => handleAcompanhanteChange(e, index)} // Salva o número puro no estado
                            placeholder="(11) 99999-9999"
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all duration-200"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={acompanhante.email || ""}
                            onChange={(e) => handleAcompanhanteChange(e, index)}
                            placeholder="email@exemplo.com"
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all duration-200"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteAcompanhanteFromModal(acompanhante)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-3 rounded-xl transition-all duration-200 hover:scale-110 group-hover:opacity-100 opacity-70"
                        title="Remover acompanhante"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-lg font-medium">Nenhum acompanhante adicionado</p>
                  <p className="text-gray-400 text-sm">
                    Clique em "Adicionar Acompanhante" para adicionar
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-50/80 backdrop-blur-sm border-t border-gray-200 p-6">
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-8 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 hover:scale-105 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={onSave}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center cursor-pointer"
            >
              <Check className="h-5 w-5 mr-2" />
              Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

