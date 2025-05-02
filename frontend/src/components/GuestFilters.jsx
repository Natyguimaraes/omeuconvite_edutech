// components/GuestFilters.jsx
import { Search, Filter, X } from "lucide-react";

const GuestFilters = ({ 
  filters, 
  setFilters, 
  showFilters, 
  setShowFilters 
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-gray-700 flex items-center">
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </h3>
        <div className="flex items-center">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="text-indigo-600 text-sm mr-2"
          >
            {showFilters ? 'Ocultar' : 'Mostrar'}
          </button>
          <button
            onClick={() => {
              setFilters({ status: "all", searchName: "" });
              setShowFilters(false);
            }}
            className="text-indigo-600 text-sm"
          >
            Limpar
          </button>
        </div>
      </div>
      
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 text-sm"
            >
              <option value="all">Todos</option>
              <option value="confirmed">Confirmados</option>
              <option value="pending">Pendentes</option>
              <option value="cancelled">Não comparecerá</option>
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Buscar por nome
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar convidados ou acompanhantes..."
                value={filters.searchName}
                onChange={(e) => setFilters({...filters, searchName: e.target.value})}
                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 text-sm"
              />
              {filters.searchName && (
                <button
                  onClick={() => setFilters({...filters, searchName: ""})}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-500" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestFilters;