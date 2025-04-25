import { Printer } from 'lucide-react'; 

const PrintGuestList = ({ eventos, eventoId, getConvidadosPorEvento, aplicarFiltros }) => {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const eventoAtual = eventos.find(e => e.id === parseInt(eventoId));
    const convidadosEvento = aplicarFiltros(getConvidadosPorEvento(eventoId));

    let totalConfirmados = 0;
    let globalIndex = 0;

    let printContent = `
      <html>
        <head>
          <title>Lista de Confirmados - ${eventoAtual?.nome || 'Evento'}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            h1 { color: #4f46e5; text-align: center; margin-bottom: 10px; font-size: 24px; }
            .event-info { text-align: center; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 20px; }
            .event-name { font-size: 20px; font-weight: bold; margin-bottom: 5px; }
            .event-date { color: #666; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px; }
            th { background-color: #4f46e5; color: white; text-align: left; padding: 10px; border: 1px solid #ddd; font-weight: bold; }
            td { padding: 10px; border: 1px solid #ddd; vertical-align: top; }
            .status-confirmed { background-color: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 12px; display: inline-block; font-size: 12px; }
            .acompanhante-row td:first-child { padding-left: 30px; }
            .acompanhante-row td:nth-child(2) { padding-left: 30px; font-style: italic; }
            .footer { margin-top: 30px; text-align: right; font-size: 12px; color: #6b7280; border-top: 1px solid #eee; padding-top: 10px; }
            .stats { margin-top: 20px; display: flex; justify-content: center; background: #f9fafb; padding: 10px; border-radius: 8px; font-size: 13px; }
            .stat-item { text-align: center; }
            .stat-value { font-weight: bold; font-size: 16px; color: #4f46e5; }
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
.print-button:hover {
  background: #4338ca;
}
@media print {
  .print-button {
    display: none;
  }
}

          </style>
        </head>
        <body>
          <h1>Lista de Confirmados</h1>
          <div class="event-info">
            <div class="event-name">${eventoAtual?.nome || 'Evento'}</div>
            <div class="event-date">
              ${eventoAtual?.data_evento ? new Date(eventoAtual.data_evento).toLocaleDateString('pt-BR', { 
                day: '2-digit', 
                month: 'long', 
                year: 'numeric',
                weekday: 'long'
              }) : ''}
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th width="50">#</th>
                <th>Nome</th>
                <th width="120">Status</th>
              </tr>
            </thead>
            <tbody>
    `;

    convidadosEvento.forEach((convidado) => {
      const confirmadoPrincipal = Number(convidado.confirmado) === 1;
      const acompanhantesConfirmados = convidado.acompanhantes?.filter(a => Number(a.confirmado) === 1) || [];

      if (!confirmadoPrincipal && acompanhantesConfirmados.length === 0) return;

      if (confirmadoPrincipal) {
        globalIndex++;
        totalConfirmados++;
        printContent += `
          <tr>
            <td>${globalIndex}</td>
            <td><strong>${convidado.nome}</strong></td>
            <td><span class="status-confirmed">Confirmado</span></td>
          </tr>
        `;
      }

      acompanhantesConfirmados.forEach((acompanhante) => {
        globalIndex++;
        totalConfirmados++;
        printContent += `
          <tr class="acompanhante-row">
            <td>${globalIndex}</td>
            <td>${acompanhante.nome}</td>
            <td><span class="status-confirmed">Confirmado</span></td>
          </tr>
        `;
      });
    });

    printContent += `
            </tbody>
          </table>

          <div class="stats">
            <div class="stat-item">
              <div class="stat-value">${totalConfirmados}</div>
              <div>Total Confirmados</div>
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
    <div className="flex justify-end">
    <button 
      onClick={handlePrint}
      className="flex items-center gap-1 px-3 py-2 mb-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
    >
      <Printer className="h-4 w-4" />
      <span>Imprimir Lista</span>
    </button>
  </div>
  
  );
};

export default PrintGuestList;

