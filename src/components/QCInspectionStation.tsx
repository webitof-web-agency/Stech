import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { QCResult } from '../types/erp';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  RotateCcw,
  PauseCircle,
  FileCheck,
  AlertTriangle,
  FileText,
  Clock,
  Camera,
  Check,
  ArrowRight,
} from 'lucide-react';

interface QCInspectionStationProps {
  onOpenReworkModal: (fromStageId: string) => void;
}

export const QCInspectionStation: React.FC<QCInspectionStationProps> = ({
  onOpenReworkModal,
}) => {
  const {
    activeJobCard,
    submitQCInspection,
    createReworkFallbackTicket,
    passQCReinspection,
  } = useERP();

  const [activeStageIdForQC, setActiveStageIdForQC] = useState<string>('welding');
  const [remarks, setRemarks] = useState<string>(
    'NDT ultrasonic examination and root gap verification performed against WPS-JCB-BOOM-04 Rev.2.'
  );
  const [inspectorName, setInspectorName] = useState<string>('Vikram Singh (ASNT Level II)');

  // Inspection Checklist parameters
  const [checklist, setChecklist] = useState<
    { id: string; parameter: string; nominal: string; tolerance: string; actual: string; status: 'ok' | 'out_of_spec' }[]
  >([
    { id: 'QC-01', parameter: 'Weld Root Gap (Joint J-02)', nominal: '2.5 mm', tolerance: '±0.5 mm', actual: '4.5 mm', status: 'out_of_spec' },
    { id: 'QC-02', parameter: 'Bevel Preparation Angle', nominal: '30°', tolerance: '±2.5°', actual: '30.5°', status: 'ok' },
    { id: 'QC-03', parameter: 'Ultrasonic (UT) Defect Scan', nominal: 'Zero Flaws', tolerance: 'AWS D1.1 Class B', actual: 'Localized Lack of Fusion', status: 'out_of_spec' },
    { id: 'QC-04', parameter: 'Boom Overall Straightness', nominal: '< 2.0 mm', tolerance: 'Max 2.5 mm', actual: '1.4 mm', status: 'ok' },
  ]);

  if (!activeJobCard) {
    return <div className="p-8 text-center text-slate-500">No active job card selected.</div>;
  }

  const selectedOp =
    activeJobCard.operations.find((o) => o.stageId === activeStageIdForQC) ||
    activeJobCard.operations[0];

  const openReworkTicket = activeJobCard.reworkTickets.find((t) => t.status === 'open' || t.status === 'reinspected');

  const handleFailInspectionDemo = () => {
    createReworkFallbackTicket({
      jobCardId: activeJobCard.id,
      fromStageId: 'inspection',
      toStageId: 'welding',
      quantity: 1,
      defectCategory: 'Weld Root Gap Exceeded',
      defectDetails: 'Root gap at boom pivot flange joint J-02 measured 4.5mm (exceeds WPS-JCB-BOOM-04 tolerance of 2.5mm ± 0.5mm). Resulted in excessive weld pool sink and localized undercut.',
      correctiveAction: 'Gouge out defective weld pass with carbon-arc or grinding disc. Clamp with backup ceramic bar, pre-heat to 130°C, and deposit multi-pass re-weld per WPS Repair Procedure R-02 before re-inspection.',
      inspectorName,
      evidencePhotoUrl: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800&auto=format&fit=crop&q=80',
    });
    alert('QC Inspection Failed: Raised additive rework ticket #RWK-JCB-001 routed to Welding Bay with photographic proof.');
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
              QUALITY ASSURANCE & NDT GATE
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Job Card: {activeJobCard.jobCardNo} ({activeJobCard.partNo})
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            QC Inspection & Non-Linear Rework Control
          </h2>
          <p className="text-xs text-slate-500">
            Inspect in-progress welds and dimensions. If non-conforming, fail the item, capture defect evidence, and route additive rework back to the responsible workstation.
          </p>
        </div>

        {/* Stage Selector for Inspection */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-mono">Inspect Gate:</span>
          <select
            value={activeStageIdForQC}
            onChange={(e) => setActiveStageIdForQC(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono"
          >
            {activeJobCard.operations.map((op) => (
              <option key={op.stageId} value={op.stageId}>
                0{op.sequence}. {op.stageName} ({op.quantities.completed} Done)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* RE-INSPECTION CLEARANCE BANNER (Step 11 in Demo Script) */}
      {openReworkTicket && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 via-blue-50 to-emerald-50 dark:from-purple-950/40 dark:via-blue-950/30 dark:to-emerald-950/30 border-2 border-purple-400 dark:border-purple-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-purple-600 text-white shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-purple-900 dark:text-purple-200 uppercase font-mono">
                Re-Inspection Gate: Ticket #{openReworkTicket.id}
              </div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                Defect: {openReworkTicket.defectCategory} ({openReworkTicket.quantity} Piece)
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Corrective action verified: Joint J-02 gouged, ceramic backed, and re-welded per WPS R-02.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                passQCReinspection(activeJobCard.id, openReworkTicket.id, 'Ultrasonic UT scan 100% clear. Zero porosity or undercut.');
                alert('QC Re-Inspection PASSED: Ticket closed. Downstream Machining & Painting unlocked!');
              }}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Pass Re-Inspection & Resume Route</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Inspection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Checklist Table & Evidence Capture */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-mono flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-blue-500" />
              <span>Inspection Checklist & Tolerance Matrix</span>
            </h3>
            <span className="text-xs font-mono text-slate-500">
              Gate: <strong className="text-slate-800 dark:text-slate-200">{selectedOp.stageName}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[11px]">
                  <th className="py-2 px-3">PARAMETER</th>
                  <th className="py-2 px-3">NOMINAL</th>
                  <th className="py-2 px-3">TOLERANCE</th>
                  <th className="py-2 px-3">ACTUAL MEASURED</th>
                  <th className="py-2 px-3 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {checklist.map((check, i) => (
                  <tr key={check.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                      {check.parameter}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{check.nominal}</td>
                    <td className="py-2.5 px-3 text-slate-500">{check.tolerance}</td>
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={check.actual}
                        onChange={(e) => {
                          const updated = [...checklist];
                          updated[i].actual = e.target.value;
                          setChecklist(updated);
                        }}
                        className={`w-28 px-2 py-1 text-xs rounded border font-mono ${
                          check.status === 'out_of_spec'
                            ? 'bg-red-50 dark:bg-red-950/40 border-red-300 text-red-700 dark:text-red-300 font-bold'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100'
                        }`}
                      />
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <select
                        value={check.status}
                        onChange={(e) => {
                          const updated = [...checklist];
                          updated[i].status = e.target.value as 'ok' | 'out_of_spec';
                          setChecklist(updated);
                        }}
                        className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                          check.status === 'ok'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                            : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-300'
                        }`}
                      >
                        <option value="ok">PASS ✓</option>
                        <option value="out_of_spec">FAIL ✗</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Inspector Remarks */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Quality Clearance Remarks & NDT Heat Code Verification
            </label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Action Buttons: Pass vs Fail/Rework */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-slate-500 font-mono">
              Signed By: <strong>{inspectorName}</strong>
            </span>

            <div className="flex items-center gap-2">
              {/* Pass Action */}
              <button
                onClick={() => {
                  submitQCInspection(activeJobCard.id, selectedOp.stageId, {
                    result: 'pass',
                    remarks,
                  });
                  alert('QC Gate Passed. Component cleared for next stage.');
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Pass Stage</span>
              </button>

              {/* DEMO FAIL INSPECTION BUTTON (Step 9 in script) */}
              <button
                onClick={handleFailInspectionDemo}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-purple-700 hover:bg-purple-600 text-white shadow-xs transition-colors cursor-pointer"
                title="Fail inspection and route 1 piece back to Welding"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Fail Inspection & Send to Welding Rework</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Rework Audit Trail & Open Tickets */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-mono flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-purple-600" />
              <span>Rework Fallback Tickets ({activeJobCard.reworkTickets.length})</span>
            </h3>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Additive corrective jobs created when parts failed inspection. Failed record remains in history.
          </p>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {activeJobCard.reworkTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-purple-200 dark:border-purple-900/60 space-y-1.5 text-xs font-mono"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-700 dark:text-purple-300">
                    #{ticket.id}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      ticket.status === 'open'
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 animate-pulse'
                        : ticket.status === 'reinspected'
                        ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                        : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                    }`}
                  >
                    {ticket.status.toUpperCase()}
                  </span>
                </div>

                <div className="text-slate-700 dark:text-slate-300">
                  <strong>Route:</strong> {ticket.fromStageName} →{' '}
                  <strong className="text-purple-600 dark:text-purple-400">{ticket.toStageName}</strong>{' '}
                  ({ticket.quantity} piece)
                </div>

                <div className="text-slate-500 text-[11px]">
                  <strong>Defect:</strong> {ticket.defectCategory}
                </div>

                <div className="text-slate-600 dark:text-slate-400 text-[11px] italic">
                  "{ticket.defectDetails}"
                </div>

                {ticket.evidencePhotoUrl && (
                  <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2">
                    <img
                      src={ticket.evidencePhotoUrl}
                      alt="Defect proof"
                      className="w-10 h-10 rounded object-cover border border-slate-300 dark:border-slate-700 shrink-0"
                    />
                    <span className="text-[10px] text-purple-700 dark:text-purple-300">
                      Defect evidence photo attached
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
