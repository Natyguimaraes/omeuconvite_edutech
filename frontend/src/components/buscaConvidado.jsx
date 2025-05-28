
import { Check, Loader2, Plus, User, Phone, Mail, Users, CalendarIcon, X, Search } from "lucide-react";
import { formatPhoneNumber, isValidPhoneNumber } from '../components/phoneUtils';

const GuestSearchAdd = ({
  eventos,
  eventoId,
  searchTerm,
  setSearchTerm,
  searchResults,
  addingGuest,
  showAddForm,
  setShowAddForm,
  newGuest,
  setNewGuest,
  handleAddToEvent,
  handleAddNewGuest,
}) => {
  // Função para lidar com mudanças nos campos do formulário
  const handleNewGuestChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'telefone') {
      // Aplica a máscara apenas para o campo de telefone
      const formattedValue = formatPhoneNumber(value);
      setNewGuest(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else {
      setNewGuest(prev => ({
        ...prev,
        [name]: name === 'limite_acompanhante' ? 
          (value === '' ? '' : Math.max(0, parseInt(value) || 0)) : 
          value
      }));
    }
  };

  return (
    <div className="mb-8 p-4 rounded-lg shadow-sm border border-gray-100">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-indigo-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg bg-gray-200 shadow-lg focus:outline-none focus:ring-1 focus:ring-purple-300 focus:border-purple-300 text-base"
            placeholder="Buscar convidados de outros eventos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-500" />
            </button>
          )}
        </div>

{/* botão para adioionar o convidado */}
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 duration-300 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-white px-5 py-3 rounded-lg flex items-center justify-center transition-all cursor-pointer"
        >
          
          <span>Adicionar Convidado</span>
        </button>
      </div>

      {/* Formulário para adicionar novo convidado */}
      {showAddForm && (
        <div className="mt-5 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-center mb-10">
                <div className="inline-flex items-center bg-indigo-100 px-4 py-2 rounded-full text-indigo-600 font-medium mb-4 shadow-sm">
                  <User className="w-4 h-4 mr-2" />
                  <span>Cadastro de Convidado</span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-800 mb-2">
                  Adicionar Novo Convidado
                </h1>
                <p className="text-gray-600 max-w-lg mx-auto">
                  Preencha os detalhes do convidado e defina o limite de acompanhantes
                </p>
              </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="nome">Nome*</label>
              <div className="relative">
                <User
                  className="absolute left-3 top-3 text-purple-400"
                  size={18}
                />
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  className="w-full bg-white/90 border border-gray-200 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
                  placeholder="Nome completo"
                  value={newGuest.nome}
                  onChange={handleNewGuestChange}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="telefone">Telefone*</label>
              <div className="relative">
                <Phone
                  className="absolute left-3 top-3 text-gray-400"
                  size={18}
                />
                <input
                  type="tel"
                  id="telefone"
                  name="telefone"
                  className="w-full bg-white/90 border border-gray-200 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
                  placeholder="(00) 00000-0000"
                  value={newGuest.telefone}
                  onChange={handleNewGuestChange}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="email">Email</label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-3 text-gray-400"
                  size={18}
                />
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full bg-white/90 border border-gray-200 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
                  placeholder="email@exemplo.com"
                  value={newGuest.email}
                  onChange={handleNewGuestChange}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="limite_acompanhante">
                Limite de Acompanhantes
              </label>
              <div className="relative">
                <Users
                  className="absolute left-3 top-3 text-gray-400"
                  size={18}
                />
                <input
                  type="number"
                  id="limite_acompanhante"
                  name="limite_acompanhante"
                  min="0"
                  className="w-full bg-white/90 border border-gray-200 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
                  value={newGuest.limite_acompanhante}
                  onChange={handleNewGuestChange}
                />
              </div>
            </div>

            {!eventoId && (
              <div className="flex flex-col gap-1">
                <label htmlFor="evento_id">Evento*</label>
                <div className="relative">
                  <CalendarIcon
                    className="absolute left-3 top-3 text-gray-400"
                    size={18}
                  />
                  <select
                    id="evento_id"
                    name="evento_id"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    value={newGuest.evento_id}
                    onChange={handleNewGuestChange}
                    required
                  >
                    <option value="">Selecione um evento</option>
                    {eventos.map((evento) => (
                      <option key={evento.id} value={evento.id}>
                        {evento.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={addingGuest}
            >
              Cancelar
            </button>
            <button
              onClick={handleAddNewGuest}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-3.5 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-indigo-200/50 flex items-center justify-center cursor-pointer"
              disabled={addingGuest}
            >
              {addingGuest ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Salvar
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Resultados da busca */}
      {searchTerm && searchResults.length > 0 && (
        <div className="mt-2 bg-white rounded-md shadow-lg overflow-hidden border border-gray-200">
          <ul className="divide-y divide-gray-300 max-h-96 overflow-y-auto">
            {searchResults.map((convidado) => {
              // Encontra o primeiro evento do convidado que pertence ao admin
              const eventoConvidado = convidado.eventos?.find(e => 
                eventos.some(ev => ev.id === e.id)
              );
              console.log("Search results:", searchResults);
              return (
                <li
                  key={convidado.id}
                  className="p-4 hover:bg-indigo-50 transition-colors cursor-pointer flex justify-between items-center"
                  onClick={() => handleAddToEvent(convidado)}
                >
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                      <User className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {convidado.nome}
                      </p>
                     <p className="text-sm text-gray-500">
                        {convidado.telefone}
                      </p>
                      <p>
                        {convidado.limite_acompanhante}
                      </p>
                      {eventoConvidado && (
                        <p className="text-xs text-gray-400">
                          Evento: {eventos.find(e => e.id === eventoConvidado.id)?.nome}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    className="ml-4 bg-indigo-800 text-white p-2 rounded-full hover:bg-indigo-600 transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToEvent(convidado);
                    }}
                    disabled={addingGuest}
                  >
                    {addingGuest ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {searchTerm && searchResults.length === 0 && (
        <div className="mt-2 bg-white rounded-lg shadow-sm p-4 text-center text-gray-500">
          Nenhum convidado encontrado em outros eventos
        </div>
      )}
    </div>
  );
};

export default GuestSearchAdd;