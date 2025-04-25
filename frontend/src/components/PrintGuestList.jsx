import { useState } from 'react';
import { Printer } from 'lucide-react';

const PrintGuestList = ({ eventos, eventoId, getConvidadosPorEvento }) => {
  const [filtro, setFiltro] = useState('todos');

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const eventoAtual = eventos.find(e => e.id === parseInt(eventoId));
    const convidadosEvento = getConvidadosPorEvento(eventoId);

    let totalExibidos = 0;
    let globalIndex = 0;

    const aplicarFiltro = (convidado) => {
      const confirmadoPrincipal = Number(convidado.confirmado) === 1;
      const naoIra = Number(convidado.confirmado) === 2;
      const pendente = Number(convidado.confirmado) === 0;

      switch (filtro) {
        case 'confirmados': return confirmadoPrincipal || (convidado.acompanhantes || []).some(a => Number(a.confirmado) === 1);
        case 'pendentes': return pendente || (convidado.acompanhantes || []).some(a => Number(a.confirmado) === 0);
        case 'nao_ira': return naoIra || (convidado.acompanhantes || []).some(a => Number(a.confirmado) === 2);
        default: return true;
      }
    };

    let printContent = `
      <html>
        <head>
          <title>Lista de Convidados - ${eventoAtual?.nome || 'Evento'}</title>
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
            <div class="event-name">${eventoAtual?.nome || 'Evento'}</div>
            <div class="event-date">
              ${eventoAtual?.data_evento ? new Date(eventoAtual.data_evento).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', weekday: 'long' }) : ''}
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th width="50">#</th>
                <th>Nome</th>
                <th width="140">Status</th>
              </tr>
            </thead>
            <tbody>
    `;

    convidadosEvento
      .filter(aplicarFiltro)
      .forEach((convidado) => {
        const statusPrincipal = Number(convidado.confirmado);
        const statusText = statusPrincipal === 1
          ? '<span class="status-confirmado">Confirmado</span>'
          : statusPrincipal === 2
          ? '<span class="status-nao">Não comparecerá</span>'
          : '<span class="status-pendente">Pendente</span>';

        globalIndex++;
        totalExibidos++;
        printContent += `
          <tr>
            <td>${globalIndex}</td>
            <td><strong>${convidado.nome}</strong></td>
            <td>${statusText}</td>
          </tr>
        `;

        (convidado.acompanhantes || []).forEach((a) => {
          if (!aplicarFiltro({ ...a })) return;
          const statusA = Number(a.confirmado);
          const statusTextA = statusA === 1
            ? '<span class="status-confirmado">Confirmado</span>'
            : statusA === 2
            ? '<span class="status-nao">Não Comparecerá</span>'
            : '<span class="status-pendente">Pendente</span>';

          globalIndex++;
          totalExibidos++;
          printContent += `
            <tr class="acompanhante-row">
              <td>${globalIndex}</td>
              <td>${a.nome}</td>
              <td>${statusTextA}</td>
            </tr>
          `;
        });
      });

    printContent += `
            </tbody>
          </table>

          <div class="stats">
            <div class="stat-item">
              <div class="stat-value">${totalExibidos}</div>
              <div>Convidados listados</div>
            </div>
          </div>

          <div class="footer">
            Gerado em ${new Date().toLocaleString('pt-BR')} • omeuconvite.com
          </div>

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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
    <label htmlFor="filtro" className="text-sm font-medium text-gray-700">
      Filtro para impressão:
    </label>
    <select
      id="filtro"
      value={filtro}
      onChange={(e) => setFiltro(e.target.value)}
      className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
    >
      <option value="todos">Todos</option>
      <option value="confirmados">Confirmados</option>
      <option value="pendentes">Pendentes</option>
      <option value="nao_ira">Não comparecerá</option>
    </select>
  </div>

  <button
    onClick={handlePrint}
    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-all text-sm shadow-sm"
  >
    <Printer className="h-4 w-4" />
    <span>Imprimir Lista</span>
  </button>
</div>

  );
};

export default PrintGuestList;
