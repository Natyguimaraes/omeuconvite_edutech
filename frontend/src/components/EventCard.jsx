import { format } from "date-fns";
import { BarChart3, CalendarIcon, Check, Edit, Heart, MapPin, PartyPopper, Trash2, Users, XCircle,  } from "lucide-react";

export default function EventCard({
  evento,
  convidados,
  totalAcompanhantes,
  totalConvidados,
  totalConfirmados,
  totalAusentes,
  isExpanded,
  onClick,
  onVerDetalhes,
  onEditar,
  onExcluir,
	totalPendentes,
}) {
  const totalParticipantes = totalConvidados + totalAcompanhantes;

  return (
    <div
      key={evento.id}
      className="relative bg-white rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
      onClick={onClick}
    >
      <div className="absolute top-0 left-0 w-full h-20 sm:h-24 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-t-2xl"></div>

      <div className="relative px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
        <div className="flex justify-between items-start mb-6 sm:mb-8 relative z-10 mt-2">
          <div className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-600 shadow-sm">
            <CalendarIcon className="h-3 sm:h-3.5 w-3 sm:w-3.5 mr-1" />
            {format(new Date(evento.data_evento), "dd MMM, yyyy")}
          </div>
          <div className="flex space-x-1">
            <button
              onClick={onEditar}
              className="p-1 sm:p-2 text-gray-400 hover:text-indigo-500 bg-white rounded-full shadow-sm hover:shadow-md transition-all duration-200"
              title="Editar evento"
            >
              <Edit className="h-3 sm:h-4 w-3 sm:w-4" />
            </button>
            <button
              onClick={onExcluir}
              className="p-1 sm:p-2 text-gray-400 hover:text-red-500 bg-white rounded-full shadow-sm hover:shadow-md transition-all duration-200"
              title="Excluir evento"
            >
              <Trash2 className="h-3 sm:h-4 w-3 sm:w-4" />
            </button>
          </div>
        </div>

        <div className="cursor-pointer group">
          <div className="mb-3 sm:mb-4">
            <h3 className="mt-10 text-lg sm:text-xl font-bold text-gray-800 group-hover:text-indigo-600 transition-colors line-clamp-2">
              {evento.nome}
            </h3>
            <p className="text-gray-500 text-xs sm:text-sm mt-1 sm:mt-2 mb-2 sm:mb-3 line-clamp-2">
              {evento.descricao}
            </p>
          </div>

          <div className="grid grid-cols-6 content-center gap-1 sm:gap-2 mb-3 sm:mb-4">
            <div className="col-span-2 flex flex-col items-center justify-center bg-gray-50 rounded-lg p-1 sm:p-2">
              <Users className="h-3 sm:h-4 w-3 sm:w-4 text-indigo-500 mb-0 sm:mb-1" />
              <span className="text-xs font-medium text-gray-600">
                {totalConvidados}
              </span>
              <span className="text-[10px] sm:text-xs text-gray-500">
                Convidados
              </span>
            </div>

            <div className="col-span-2 flex flex-col items-center justify-center bg-gray-50 rounded-lg p-1 sm:p-2">
              <Heart className="h-3 sm:h-4 w-3 sm:w-4 text-pink-500 mb-0 sm:mb-1" />
              <span className="text-xs font-medium text-gray-600">
                {totalAcompanhantes}
              </span>
              <span className="text-[10px] sm:text-xs text-gray-500">
                Acomp.
              </span>
            </div>

            <div className="col-span-2 flex flex-col items-center justify-center bg-gray-50 rounded-lg p-1 sm:p-2">
              <PartyPopper className="h-3 sm:h-4 w-3 sm:w-4 text-amber-500 mb-0 sm:mb-1" />
              <span className="text-xs font-medium text-gray-600">
                {totalParticipantes}
              </span>
              <span className="text-[10px] sm:text-xs text-gray-500">
                Total
              </span>
            </div>

            <div className="col-span-2 flex flex-col items-center justify-center bg-gray-50 rounded-lg p-1 sm:p-2">
              <Check className="h-3 sm:h-4 w-3 sm:w-4 text-green-500 mb-0 sm:mb-1" />
              <span className="text-xs font-medium text-gray-600">
                {totalConfirmados}
              </span>
              <span className="text-[10px] sm:text-xs text-gray-500">
                Confirmado
              </span>
            </div>
            <div className="col-span-2 flex flex-col items-center justify-center bg-gray-50 rounded-lg p-1 sm:p-2">
              <XCircle className="h-3 sm:h-4 w-3 sm:w-4 text-yellow-500 mb-0 sm:mb-1" />
              <span className="text-xs font-medium text-gray-600">
                {totalAusentes}
              </span>
              <span className="text-[10px] sm:text-xs text-gray-500">
                Ausentes
              </span>
            </div>

						<div className="col-span-2 flex flex-col items-center justify-center bg-gray-50 rounded-lg p-1 sm:p-2">
							<XCircle className="h-3 sm:h-4 w-3 sm:w-4 text-red-500 mb-0 sm:mb-1" />
							<span className="text-xs font-medium text-gray-600">
                {totalPendentes}
              </span>
							<span className="text-[10px] sm:text-xs text-gray-500">
                Pendentes
              </span>
						</div>

          </div>

          <div className="flex justify-between items-center text-gray-500 text-xs sm:text-sm border-t pt-3 sm:pt-4 border-gray-100">
            <div className="flex items-center">
              <CalendarIcon className="h-3 sm:h-4 w-3 sm:w-4 mr-1 text-indigo-400" />
              <span>{format(new Date(evento.data_evento), "HH:mm")}</span>
            </div>

            <div className="flex items-center">
              <MapPin className="h-3 sm:h-4 w-3 sm:w-4 mr-1 text-indigo-400" />
              <span className="truncate max-w-[80px] sm:max-w-[120px]">
                {evento.local || "Sem local"}
              </span>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-gray-100 animate-fade-in">
            <button
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-medium py-2 sm:py-3 px-3 sm:px-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-indigo-200/50 active:scale-95 flex items-center justify-center text-sm sm:text-base"
              onClick={(e) => {
                e.stopPropagation();
                onVerDetalhes();
              }}
            >
              <BarChart3 className="h-4 sm:h-5 w-4 sm:w-5 mr-2" />
              <span>Ver Detalhes</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
