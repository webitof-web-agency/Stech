import React, { useRef } from 'react';
import { useERP } from '../context/ERPContext';
import { X, Printer, Download } from 'lucide-react';

export const JobCardTravelerModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { activeJobCard, activeProject, drawings } = useERP();
  const sheetRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !activeJobCard || !activeProject) return null;

  const matchedDrawing = drawings.find(
    (d) =>
      activeJobCard.drawingRef.toUpperCase().includes(d.drawingNo.toUpperCase()) ||
      d.assemblyId === activeJobCard.id
  );

  const handleDownloadHtml = () => {
    if (!sheetRef.current) return;
    const htmlContent = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Shop Traveler - ${activeJobCard.jobCardNo}</title>
<style>
  body { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; color: #000; padding: 24px; font-size: 12px; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 16px; }
  th, td { border: 1px solid #000; padding: 6px; text-align: left; }
  th { background: #f1f5f9; font-size: 11px; }
  .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; border: 1px solid #000; padding: 10px; margin-bottom: 16px; }
</style>
</head>
<body>${sheetRef.current.innerHTML}</body>
</html>`;
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Traveler-${activeJobCard.jobCardNo}-${activeJobCard.partNo}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs print:static print:p-0 print:bg-white">
      <div className="w-full max-w-4xl max-h-[90vh] bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col print:max-h-none print:border-0 print:shadow-none print:rounded-none">
        {/* Top toolbar */}
        <div className="flex items-center justify-between px-5 py-3 bg-slate-100 border-b border-slate-200 no-print">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-700">
              JOB TRAVELER DOCUMENT · {activeJobCard.jobCardNo}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadHtml}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-white hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Sheet</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Traveler Sheet</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded text-slate-500 hover:text-slate-800 cursor-pointer"
              aria-label="Close traveler sheet"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Sheet Body */}
        <div ref={sheetRef} className="p-8 overflow-y-auto font-mono text-xs space-y-6 bg-white text-black print:overflow-visible print:p-2">
          {/* Company & Document Header */}
          <div className="border-b-2 border-black pb-4 flex items-start justify-between">
            <div className="space-y-1">
              <h1 className="text-xl font-bold tracking-tight uppercase">
                STECH Fabrication Facility
              </h1>
              <p className="text-[11px] text-slate-600">
                Heavy Structural, Earthmoving & Precision Machining Division
              </p>
              <p className="text-[11px] text-slate-600">
                ISO 9001:2015 · AWS D1.1 · Digital Shopfloor Traceability Traveler
              </p>
            </div>

            <div className="text-right border border-black p-2 rounded">
              <div className="text-sm font-bold">SHOP TRAVELER</div>
              <div className="text-xs font-bold">{activeJobCard.jobCardNo}</div>
              <div className="text-[10px] text-slate-500 mt-1">BARCODE: *{activeJobCard.jobCardNo}*</div>
            </div>
          </div>

          {/* Job Card Metadata Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border border-black p-3 text-[11px]">
            <div>
              <span className="text-slate-500 text-[9px] block">CLIENT / PROJECT</span>
              <span className="font-bold">{activeProject.client} ({activeProject.code})</span>
            </div>
            <div>
              <span className="text-slate-500 text-[9px] block">PART NUMBER</span>
              <span className="font-bold">{activeJobCard.partNo}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[9px] block">DRAWING REF / STATUS</span>
              <span className="font-bold">
                {activeJobCard.drawingRef} ({activeJobCard.drawingRev})
              </span>
              <span className={`block text-[9px] font-bold ${matchedDrawing?.status === 'released' ? 'text-emerald-700' : 'text-amber-700'}`}>
                {matchedDrawing ? matchedDrawing.status.replace('_', ' ').toUpperCase() : 'UNREGISTERED REF'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[9px] block">ORDER QUANTITY</span>
              <span className="font-bold text-sm">{activeJobCard.totalQuantity} NOS</span>
            </div>

            <div className="col-span-2 pt-2 border-t border-slate-300">
              <span className="text-slate-500 text-[9px] block">PART DESCRIPTION</span>
              <span>{activeJobCard.description}</span>
            </div>
            <div className="pt-2 border-t border-slate-300">
              <span className="text-slate-500 text-[9px] block">ALLOCATED HEAT NUMBERS</span>
              <span className={`font-bold ${activeJobCard.materialIssue ? 'text-blue-700' : 'text-amber-700'}`}>
                {activeJobCard.materialIssue?.heatNumbers.join(', ') || 'Pending Store Issue'}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-300">
              <span className="text-slate-500 text-[9px] block">TARGET DATE</span>
              <span>{activeJobCard.targetDate}</span>
            </div>
          </div>

          {/* Sequential Operations Ledger */}
          <div>
            <div className="text-xs font-bold uppercase mb-1">
              OPERATIONAL ROUTING & STAGE SIGN-OFF
            </div>
            <table className="w-full text-left text-[11px] border border-black border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-black text-[10px]">
                  <th className="p-1.5 border-r border-black">OP</th>
                  <th className="p-1.5 border-r border-black">OPERATION NAME</th>
                  <th className="p-1.5 border-r border-black">WORK CENTER / MACHINE</th>
                  <th className="p-1.5 border-r border-black">OPERATOR</th>
                  <th className="p-1.5 border-r border-black text-right">PLAN/ACT</th>
                  <th className="p-1.5 border-r border-black text-center">QTY PASS</th>
                  <th className="p-1.5 border-r border-black text-center">QC STAMP</th>
                  <th className="p-1.5">SIGNATURE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {activeJobCard.operations.map((op) => (
                  <tr key={op.id} className="border-b border-slate-300">
                    <td className="p-1.5 border-r border-black font-bold">0{op.sequence}</td>
                    <td className="p-1.5 border-r border-black font-semibold">
                      {op.stageName}
                    </td>
                    <td className="p-1.5 border-r border-black text-slate-600">
                      {op.machine.code}
                    </td>
                    <td className="p-1.5 border-r border-black">
                      {op.operator.name} ({op.operator.badgeId})
                    </td>
                    <td className="p-1.5 border-r border-black text-right font-mono">
                      {op.plannedHours}h / {op.actualHours}h
                    </td>
                    <td className="p-1.5 border-r border-black text-center font-bold">
                      {op.quantities.completed} / {activeJobCard.totalQuantity}
                    </td>
                    <td className="p-1.5 border-r border-black text-center">
                      {op.inspection.result === 'pass' ? (
                        <span className="font-bold text-emerald-700">[PASSED ✓]</span>
                      ) : op.inspection.result === 'fail' ? (
                        <span className="font-bold text-red-700">[FAILED ✗]</span>
                      ) : op.inspection.result === 'rework' ? (
                        <span className="font-bold text-purple-700">[REWORK ↺]</span>
                      ) : op.inspection.result === 'hold' ? (
                        <span className="font-bold text-amber-700">[HOLD]</span>
                      ) : (
                        <span className="text-slate-400">[PENDING]</span>
                      )}
                    </td>
                    <td className="p-1.5 font-mono text-[10px] text-slate-600">
                      {op.status === 'completed'
                        ? `Verified: ${op.operator.name.split(' ')[0]}`
                        : op.status === 'in_progress'
                        ? 'In Progress'
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Non-Linear Rework Fallback Audit Trail Table */}
          {activeJobCard.reworkTickets.length > 0 && (
            <div>
              <div className="text-xs font-bold uppercase mb-1 text-purple-900">
                NON-LINEAR REWORK FALLBACK & CORRECTION AUDIT TRAIL
              </div>
              <table className="w-full text-left text-[11px] border border-black border-collapse">
                <thead>
                  <tr className="bg-purple-50 border-b border-black text-[10px]">
                    <th className="p-1.5 border-r border-black">TICKET #</th>
                    <th className="p-1.5 border-r border-black">LOOPBACK ROUTE</th>
                    <th className="p-1.5 border-r border-black">QTY</th>
                    <th className="p-1.5 border-r border-black">DEFECT DESCRIPTION</th>
                    <th className="p-1.5 border-r border-black">CORRECTIVE ACTION</th>
                    <th className="p-1.5 border-r border-black">REWORK HRS</th>
                    <th className="p-1.5">INSPECTOR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {activeJobCard.reworkTickets.map((t) => (
                    <tr key={t.id} className="border-b border-slate-300">
                      <td className="p-1.5 border-r border-black font-bold">#{t.id}</td>
                      <td className="p-1.5 border-r border-black font-semibold">
                        {t.fromStageName} → {t.toStageName}
                      </td>
                      <td className="p-1.5 border-r border-black text-center font-bold">
                        {t.quantity}
                      </td>
                      <td className="p-1.5 border-r border-black text-red-700">
                        {t.defectCategory}: {t.defectDetails}
                      </td>
                      <td className="p-1.5 border-r border-black">
                        {t.correctiveAction}
                      </td>
                      <td className="p-1.5 border-r border-black text-center font-bold">
                        {t.loggedReworkHours || 1.5}h
                      </td>
                      <td className="p-1.5 font-mono text-[10px]">
                        {t.inspectorName}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer Sign-off Boxes */}
          <div className="pt-4 grid grid-cols-3 gap-4 text-center text-[10px]">
            <div className="border border-black p-4">
              <span className="block text-slate-500 mb-6">PRODUCTION SUPERVISOR</span>
              <div className="border-t border-black pt-1 font-bold">AUTHORIZED SIGNATURE</div>
            </div>
            <div className="border border-black p-4">
              <span className="block text-slate-500 mb-6">QUALITY CONTROL INSPECTOR</span>
              <div className="border-t border-black pt-1 font-bold">Vikram Singh (ASNT Level II)</div>
            </div>
            <div className="border border-black p-4">
              <span className="block text-slate-500 mb-6">CUSTOMER / THIRD PARTY INSPECTOR</span>
              <div className="border-t border-black pt-1 font-bold">CLIENT ACCEPTANCE</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
