import { useState } from "react";
import { Search, Filter, X, Printer } from "lucide-react";

const GuestActions = ({
  filters,
  setFilters,
  getConvidadosPorEvento,
  eventos,
  eventoId
}) => {
  const [filtroImpressao, setFiltroImpressao] = useState("todos");

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    const eventoAtual = eventos.find((e) => e.id === parseInt(eventoId));
    const convidadosEvento = getConvidadosPorEvento(eventoId);

    let totalExibidos = 0;
    let globalIndex = 0;

    const aplicarFiltro = (convidado) => {
      const confirmadoPrincipal = Number(convidado.confirmado) === 1;
      const naoIra = Number(convidado.confirmado) === 2;
      const pendente = Number(convidado.confirmado) === 0;

      switch (filtroImpressao) {
        case "confirmados":
          return (
            confirmadoPrincipal ||
            (convidado.acompanhantes || []).some((a) => Number(a.confirmado) === 1)
          );
        case "pendentes":
          return (
            pendente ||
            (convidado.acompanhantes || []).some((a) => Number(a.confirmado) === 0)
          );
        case "nao_ira":
          return (
            naoIra ||
            (convidado.acompanhantes || []).some((a) => Number(a.confirmado) === 2)
          );
        default:
          return true;
      }
    };

    let printContent = `
      <html>
        <head><title>Lista de Convidados - ${eventoAtual?.nome || "Evento"}</title>
       <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            h1 { color: #4f46e5; text-align: center; margin-bottom: 10px; font-size: 24px; }
            .event-info { text-align: center; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 20px; }
            .event-name { font-size: 20px; font-weight: bold; margin-bottom: 5px; }
            .event-date { color: #666; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px; }
            th { background-color: #4f46e5; color: white; text-align: left; padding: 10px; border: 1px solid #ddd; font-weight: bold; }
            td { padding: 10px; border: 1px solid #ddd; vertical-align: top; }
            .acompanhante-row td:first-child { padding-left: 30px; }
            .acompanhante-row td:nth-child(2) { padding-left: 30px; font-style: italic; }
            .footer { margin-top: 30px; text-align: right; font-size: 12px; color: #6b7280; border-top: 1px solid #eee; padding-top: 10px; }
            .stats { margin-top: 20px; display: flex; justify-content: center; background: #f9fafb; padding: 10px; border-radius: 8px; font-size: 13px; }
            .stat-item { text-align: center; }
            .stat-value { font-weight: bold; font-size: 16px; color: #4f46e5; }
            .status-confirmado { background-color: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 12px; font-size: 12px; }
            .status-pendente { background-color: #fef9c3; color: #92400e; padding: 4px 8px; border-radius: 12px; font-size: 12px; }
            .status-nao { background-color: #fee2e2; color: #991b1b; padding: 4px 8px; border-radius: 12px; font-size: 12px; }
            @page { size: auto; margin: 10mm; }
            @media print { body { margin: 0; padding: 10px; } }
            .print-button {
              position: fixed;
              bottom: 20px;
              left: 20px;
              background: #4f46e5;
              color: white;
              border: none;
              padding: 10px 16px;
              border-radius: 8px;
              cursor: pointer;
              font-size: 14px;
              box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
              z-index: 9999;
            }
            .print-button:hover { background: #4338ca; }
            @media print { .print-button { display: none; } }
          </style>

        </head>
        <body>
          <h1>Lista de Convidados</h1>
          <div class="event-info">
            <div class="event-name">${eventoAtual?.nome || "Evento"}</div>
            <div class="event-date">${eventoAtual?.data_evento ? new Date(eventoAtual.data_evento).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric", weekday: "long" }) : ""}</div>
          </div>
          <table><thead><tr><th>#</th><th>Nome</th><th>Status</th></tr></thead><tbody>
    `;

    convidadosEvento.filter(aplicarFiltro).forEach((convidado) => {
      const statusPrincipal = Number(convidado.confirmado);
      const statusText =
        statusPrincipal === 1
          ? '<span class="status-confirmado">Confirmado</span>'
          : statusPrincipal === 2
          ? '<span class="status-nao">Não comparecerá</span>'
          : '<span class="status-pendente">Pendente</span>';

      globalIndex++;
      totalExibidos++;
      printContent += `<tr><td>${globalIndex}</td><td><strong>${convidado.nome}</strong></td><td>${statusText}</td></tr>`;

      (convidado.acompanhantes || []).forEach((a) => {
        if (!aplicarFiltro({ ...a })) return;
        const statusA = Number(a.confirmado);
        const statusTextA =
          statusA === 1
            ? '<span class="status-confirmado">Confirmado</span>'
            : statusA === 2
            ? '<span class="status-nao">Não Comparecerá</span>'
            : '<span class="status-pendente">Pendente</span>';

        globalIndex++;
        totalExibidos++;
        printContent += `<tr class="acompanhante-row"><td>${globalIndex}</td><td>${a.nome}</td><td>${statusTextA}</td></tr>`;
      });
    });

    printContent += `
          </tbody></table>
          <div class="stats"><div class="stat-item"><div class="stat-value">${totalExibidos}</div><div>Convidados listados</div></div></div>
          <div class="footer">Gerado em ${new Date().toLocaleString("pt-BR")} • omeuconvite.com</div>
          <button onclick="window.print()" class="print-button">Imprimir</button>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Filter className="h-5 w-5 mr-2 text-indigo-500" />
          Filtros e Impressão
        </h3>
        <button
          onClick={() => {
            setFilters({ status: "all", searchName: "" });
            setFiltroImpressao("todos");
          }}
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition duration-150 ease-in-out flex items-center"
        >
          <X className="h-3.5 w-3.5 mr-1" />
          Limpar tudo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent text-sm bg-gray-50 hover:bg-gray-100 transition duration-150 ease-in-out shadow-sm"
          >
            <option value="all">Todos</option>
            <option value="confirmed">Confirmados</option>
            <option value="pending">Pendentes</option>
            <option value="cancelled">Não comparecerá</option>
          </select>
        </div>

        <div className="md:col-span-2 space-y-1.5">
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Buscar por nome</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Buscar convidados ou acompanhantes..."
              value={filters.searchName}
              onChange={(e) => setFilters({ ...filters, searchName: e.target.value })}
              className="w-full pl-11 pr-12 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent text-sm bg-gray-50 placeholder-gray-400 shadow-sm"
            />
            {filters.searchName && (
              <button
                onClick={() => setFilters({ ...filters, searchName: "" })}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition duration-150 ease-in-out"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2 border-t border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label htmlFor="filtro" className="text-sm font-medium text-gray-700">
            Filtro para impressão:
          </label>
          <select
            id="filtro"
            value={filtroImpressao}
            onChange={(e) => setFiltroImpressao(e.target.value)}
            className="border border-gray-200 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-indigo-300 focus:border-transparent bg-gray-50 shadow-sm"
          >
            <option value="todos">Todos</option>
            <option value="confirmados">Confirmados</option>
            <option value="pendentes">Pendentes</option>
            <option value="nao_ira">Não comparecerá</option>
          </select>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
        >
          <Printer className="h-4.5 w-4.5" />
          <span>Imprimir Lista</span>
        </button>
      </div>
    </div>
  );
};

export default GuestActions;