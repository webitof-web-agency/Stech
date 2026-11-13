import React from 'react';
import { useERP } from '../context/ERPContext';
import { Boxes, CheckCircle2, AlertTriangle, ArrowRight, Layers, PackageCheck } from 'lucide-react';

export const MRPModule: React.FC = () => {
  const { activeProject, activeJobCard, setCurrentTab, setUserRole, setActiveStageId } = useERP();

  if (!activeProject || !activeJobCard) return null;

  const totalMaterials = activeProject.bomItems.length;
  const shortageItems = activeProject.bomItems.filter((b) => b.availableStock < b.grossRequirement);
  const totalShortageQty = shortageItems.reduce((acc, b) => acc + (b.grossRequirement - b.availableStock), 0);

  const handleProceedToWorkOrder = () => {
    setCurrentTab('work_orders');
    setUserRole('department_hod');
    setActiveStageId('cutting');
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6">
      {/* Title Bar matching screenshot 6 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-mono">
            FABRICATION WORKSPACE
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Material Availability / MRP
          </h2>
          <p className="text-xs text-slate-500">
            BOM requirement vs current stock, reserved/issued and incoming quantities with shortage and procurement requirement.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            Download PDF
          </button>
          <button
            onClick={() => setCurrentTab('bom_requirement')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
          >
            <span>Import BOM</span>
          </button>
        </div>
      </div>

      {/* Main MRP Record Card matching screenshot 6 */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5 shadow-xs">
        {/* Record Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 font-mono">
              MRP · {activeJobCard.jobCardNo}
            </span>
            <span className="text-xs text-slate-500 font-mono block">
              BOM-{activeProject.code} → Stock check · {shortageItems.length} material short
            </span>
          </div>

          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded font-mono ${
              shortageItems.length > 0
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
            }`}
          >
            {shortageItems.length > 0 ? 'Shortage / Partial' : 'Fully Available'}
          </span>
        </div>

        {/* Work Order Info Strip */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-xs font-mono">
          <div>
            <span className="text-slate-400 text-[10px] block">WORK ORDER</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{activeJobCard.jobCardNo}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">DRAWING</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{activeProject.drawingNumber} · {activeProject.drawingRevision}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">BOM</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">BOM-{activeProject.code} Rev.B</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">PRODUCT</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{activeProject.name}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">PRODUCTION QTY</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{activeJobCard.totalQuantity} Nos.</span>
          </div>
        </div>

        {/* Item by Item Calculation Strips matching screenshot 6 */}
        <div className="space-y-4">
          {activeProject.bomItems.map((bom) => {
            const hasShortage = bom.availableStock < bom.grossRequirement;
            const shortageQty = Math.max(0, bom.grossRequirement - bom.availableStock);

            return (
              <div
                key={bom.id}
                className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-2 text-xs font-mono"
              >
                <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-900 dark:text-slate-100 uppercase">
                    MATERIAL - {bom.description} ({bom.materialGrade})
                  </span>
                  <span className="text-slate-500 text-[11px]">Size: {bom.dimension}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-1">
                  <div>
                    <span className="text-slate-400 text-[10px] block">REQUIRED</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{bom.grossRequirement} {bom.uom}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">CURRENT STOCK</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{bom.currentStock} {bom.uom}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">RESERVED</span>
                    <span className="text-slate-700 dark:text-slate-300">{bom.reservedStock} {bom.uom}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">AVAILABLE</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{bom.availableStock} {bom.uom}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">SHORTAGE</span>
                    <span className={`font-bold ${hasShortage ? 'text-red-600 dark:text-red-400' : 'text-slate-400'}`}>
                      {shortageQty} {bom.uom}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">STATUS</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        hasShortage
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                          : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                      }`}
                    >
                      {hasShortage ? 'Shortage' : 'Available'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Footer matching screenshot 6 */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-400 text-[10px] block">TOTAL MATERIALS</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{totalMaterials}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">AVAILABLE</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  {totalMaterials - shortageItems.length}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">SHORTAGE</span>
                <span className="font-bold text-red-600 dark:text-red-400 text-sm">{shortageItems.length}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">TOTAL SHORTAGE</span>
                <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">{totalShortageQty.toLocaleString()} kg</span>
              </div>
            </div>

            <button
              onClick={handleProceedToWorkOrder}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors shrink-0 font-mono"
            >
              <span>Proceed to Work Order</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
