import { useState } from "react";
import { Search, Filter, X, Printer } from "lucide-react";

const GuestActions = ({
  filters,
  setFilters,

}) => {

  return (
    <div className="relative overflow-hidden bg-white p-7 mb-6"
         style={{
           background: "linear-gradient(135deg, rgba(252,246,255,1) 0%, rgba(240,237,255,1) 100%)"
         }}>
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-gradient-to-r from-purple-200/40 to-indigo-300/30"
           style={{ 
             filter: "blur(80px)", 
             transform: "translate(20%, -50%)",
             zIndex: "0" 
           }}></div>
      <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-gradient-to-r from-pink-200/30 to-purple-300/20"
           style={{ 
             filter: "blur(60px)", 
             transform: "translate(-30%, 30%)",
             zIndex: "0" 
           }}></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <div className="p-2 rounded-lg bg-purple-100 mr-3">
              <Filter className="h-5 w-5 text-purple-700" />
            </div>
            <span className="bg-gradient-to-r from-purple-800 to-indigo-700 bg-clip-text text-transparent">
              Filtros
            </span>
          </h3>
          <button
            onClick={() => {
              setFilters({ status: "all", searchName: "" });
              setFiltroImpressao("todos");
            }}
            className="flex items-center px-3 py-1.5 rounded-full bg-white/80 hover:bg-white text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-all duration-200 border border-purple-100 shadow-sm hover:shadow cursor-pointer"
          >
            <X className="h-3.5 w-3.5 mr-1.5" />
            Limpar tudo
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-purple-700 mb-1.5 ml-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-4 py-2.5 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 text-sm bg-white/70 backdrop-blur-sm hover:bg-white transition-all duration-200 ease-in-out shadow-sm cursor-pointer appearance-none"
              style={{
                backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%236b46c1'%3e%3cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3e%3c/svg%3e\")",
                backgroundPosition: "right 0.75rem center",
                backgroundSize: "1.25em 1.25em",
                backgroundRepeat: "no-repeat",
                paddingRight: "2.5rem"
              }}
            >
              <option value="all">Todos</option>
              <option value="confirmed">Confirmados</option>
              <option value="pending">Pendentes</option>
              <option value="cancelled">Não comparecerá</option>
            </select>
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="block text-xs font-medium text-purple-700 mb-1.5 ml-1">Buscar por nome</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-purple-800" />
              </div>
              <input
                type="text"
                placeholder="Buscar convidados ou acompanhantes..."
                value={filters.searchName}
                onChange={(e) => setFilters({ ...filters, searchName: e.target.value })}
                className="w-full pl-11 pr-12 py-2.5 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 text-sm bg-white/70 backdrop-blur-sm hover:bg-white placeholder-purple-300 shadow-sm transition-all duration-200"
              />
              {filters.searchName && (
                <button
                  onClick={() => setFilters({ ...filters, searchName: "" })}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-purple-400 hover:text-purple-700 transition duration-150 ease-in-out"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>       
      </div>
    </div>
  );
};

export default GuestActions;