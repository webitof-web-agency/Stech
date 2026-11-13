import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { ReworkTicket } from '../types/erp';
import { RotateCcw, AlertTriangle, X, Check, ArrowLeft } from 'lucide-react';

interface ReworkRoutingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultFromStageId?: string;
  defaultToStageId?: string;
}

export const ReworkRoutingModal: React.FC<ReworkRoutingModalProps> = ({
  isOpen,
  onClose,
  defaultFromStageId,
  defaultToStageId,
}) => {
  const { activeJobCard, createReworkFallbackTicket } = useERP();

  const [toStageId, setToStageId] = useState<string>(defaultToStageId || 'welding');
  const [quantity, setQuantity] = useState<number>(1);
  const [defectCategory, setDefectCategory] = useState<ReworkTicket['defectCategory']>('Weld Porosity / Undercut');
  const [defectDetails, setDefectDetails] = useState<string>(
    'Dimensional mismatch / weld joint defect identified during inspection check.'
  );
  const [correctiveAction, setCorrectiveAction] = useState<string>(
    'Gouge out defective weld pass with carbon-arc or grinding disc. Re-align and re-weld per qualified WPS before re-inspection.'
  );
  const [inspectorName, setInspectorName] = useState<string>('Vikram Singh (ASNT Level II)');

  React.useEffect(() => {
    if (isOpen && defaultToStageId) {
      setToStageId(defaultToStageId);
    }
  }, [isOpen, defaultToStageId]);

  if (!isOpen || !activeJobCard) return null;

  // Potential previous fallback stages
  const fallbackStages = [
    { id: 'cutting', name: 'Cutting & Drilling (Re-profile / Trim)' },
    { id: 'fitup', name: 'Fit-up & Tack Alignment (Break & Re-align)' },
    { id: 'welding', name: 'Welding Bay (Gouge, Grind & Re-weld)' },
    { id: 'machining', name: 'Machining Shop (Re-face / Re-bore)' },
    { id: 'painting', name: 'Surface Prep & Painting (Blast & Re-coat)' },
  ];

  const currentOp = activeJobCard.operations.find(
    (o) => o.stageId === (defaultFromStageId || activeJobCard.currentStageId)
  ) || activeJobCard.operations[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createReworkFallbackTicket({
      jobCardId: activeJobCard.id,
      fromStageId: currentOp.stageId,
      toStageId,
      quantity: Math.max(1, quantity),
      defectCategory,
      defectDetails,
      correctiveAction,
      inspectorName,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
            <RotateCcw className="w-4 h-4" />
            <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Raise Non-Linear Rework & Fallback Ticket
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Explanation Alert */}
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-0.5">Non-Linear Shopfloor Return Routing</p>
              <p className="text-slate-600 dark:text-slate-300">
                When a part fails QC, fit-up, or assembly checks, this ticket routes the specific affected piece count back to the responsible previous workstation with corrective instructions, without halting conforming parts.
              </p>
            </div>
          </div>

          {/* Job Card Context Bar */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs font-mono">
            <div>
              <span className="text-slate-400 text-[10px] block">JOB CARD & PART</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {activeJobCard.jobCardNo} · {activeJobCard.partNo}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">DISPATCHED FROM STAGE</span>
              <span className="font-semibold text-purple-600 dark:text-purple-400">
                {currentOp.stageName}
              </span>
            </div>
          </div>

          {/* Routing Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Target Previous Step */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Return Back To Step <span className="text-red-500">*</span>
              </label>
              <select
                value={toStageId}
                onChange={(e) => setToStageId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
              >
                {fallbackStages.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    ← {stage.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Affected Part Quantity */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Affected Quantity to Return (Nos) <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max={activeJobCard.totalQuantity}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-xs text-slate-500 font-mono whitespace-nowrap">
                  / {activeJobCard.totalQuantity} total
                </span>
              </div>
            </div>
          </div>

          {/* Defect Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Defect Classification <span className="text-red-500">*</span>
            </label>
            <select
              value={defectCategory}
              onChange={(e) => setDefectCategory(e.target.value as ReworkTicket['defectCategory'])}
              className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="Weld Porosity / Undercut">Weld Porosity / Undercut / Fusion Defect</option>
              <option value="Dimension Mismatch">Dimension Mismatch / Length / Tolerance Failure</option>
              <option value="Fit-up Angle Deviance">Fit-up Angle Deviance / Squareness Skew</option>
              <option value="Machining Runout">Machining Runout / Hole Center Off-Pitch</option>
              <option value="Paint Blister / Low DFT">Paint Blister / Low Dry Film Thickness</option>
              <option value="Surface Scratch / Burr">Surface Scratch / Burr / Sharp Edge</option>
              <option value="Other">Other Non-Conformance</option>
            </select>
          </div>

          {/* Defect Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Defect Description & Findings
            </label>
            <textarea
              rows={2}
              value={defectDetails}
              onChange={(e) => setDefectDetails(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="State exact discrepancy, location, and dimensions..."
            />
          </div>

          {/* Corrective Action */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Mandatory Corrective Action for Target Station
            </label>
            <textarea
              rows={2}
              value={correctiveAction}
              onChange={(e) => setCorrectiveAction(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Instructions for the operator (e.g. grinding, re-clamping, re-machining)..."
            />
          </div>

          {/* Inspector / Issuer Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Authorizing QC Inspector / Engineer
            </label>
            <input
              type="text"
              value={inspectorName}
              onChange={(e) => setInspectorName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 dark:bg-purple-600 dark:hover:bg-purple-500 rounded-lg shadow-xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Dispatch Rework Loopback Ticket</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
