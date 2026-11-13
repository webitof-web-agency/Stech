import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { Package, CheckCircle2, AlertCircle, FileCheck, ShieldCheck, ArrowRight } from 'lucide-react';

export const MaterialStoreModule: React.FC = () => {
  const {
    activeProject,
    activeJobCard,
    issueMaterialToJobCard,
    setCurrentTab,
    setUserRole,
    setActiveStageId,
  } = useERP();

  const [issueSlipNo, setIssueSlipNo] = useState(`ISS-${Date.now().toString().slice(-4)}`);
  const [issuedBy, setIssuedBy] = useState('Store Keeper - Ramesh K.');
  const [notes, setNotes] = useState(
    'Raw material visual inspection OK. Mill test certificates verified for chemical and mechanical properties.'
  );
  const [isSuccess, setIsSuccess] = useState(false);

  if (!activeProject || !activeJobCard) {
    return <div className="p-8 text-center text-slate-500">No project selected.</div>;
  }

  const handleIssueMaterials = (e: React.FormEvent) => {
    e.preventDefault();
    const heatNos = activeProject.bomItems
      .map((item) => item.allocatedHeatNo)
      .filter((h): h is string => Boolean(h));

    issueMaterialToJobCard(activeJobCard.id, {
      issueSlipNo,
      issuedBy,
      heatNumbers: heatNos.length > 0 ? heatNos : ['HT-DEFAULT-01'],
      notes,
    });

    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  const isAlreadyIssued = Boolean(activeJobCard.materialIssue);

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
              STORE & INVENTORY DISPATCH
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Drawing: {activeProject.drawingNumber}
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Material Indent & Store Issue Slip
          </h2>
        </div>

        <div className="text-xs font-mono text-slate-500">
          Flow: Availability → Reservation → Issue → Shopfloor
        </div>
      </div>

      {/* BOM & Stock Reservation Table */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-mono flex items-center gap-2">
            <Package className="w-4 h-4 text-amber-500" />
            <span>Bill of Materials (BOM) & Heat Number Reservation</span>
          </h3>
          <span className="text-xs font-mono text-slate-500">
            Total Batch: <strong className="text-slate-800 dark:text-slate-200">{activeJobCard.totalQuantity} Units</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[11px]">
                <th className="py-2.5 px-3">PART NO</th>
                <th className="py-2.5 px-3">ITEM DESCRIPTION</th>
                <th className="py-2.5 px-3">MATERIAL GRADE</th>
                <th className="py-2.5 px-3">DIMENSIONS</th>
                <th className="py-2.5 px-3">ALLOCATED HEAT NO</th>
                <th className="py-2.5 px-3 text-right">REQUIRED</th>
                <th className="py-2.5 px-3 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {activeProject.bomItems.map((bom) => (
                <tr key={bom.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">
                    {bom.partNo}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                    {bom.description}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-blue-600 dark:text-blue-400">
                    {bom.materialGrade}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">{bom.dimension}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-200">
                    {bom.allocatedHeatNo || 'Pending Allocation'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-slate-100">
                    {bom.grossRequirement} {bom.uom}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      RESERVED & READY
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Store Issue Authorization Form */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-mono mb-4 flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-emerald-500" />
          <span>Material Store Issue Slip Sign-off</span>
        </h3>

        {isAlreadyIssued ? (
          <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>Material Successfully Issued to Shopfloor</span>
            </div>
            <div className="text-xs font-mono text-slate-700 dark:text-slate-300 space-y-1">
              <div>
                <strong>Issue Slip No:</strong> #{activeJobCard.materialIssue?.issueSlipNo}
              </div>
              <div>
                <strong>Issued By:</strong> {activeJobCard.materialIssue?.issuedBy} on{' '}
                {activeJobCard.materialIssue?.issueDate}
              </div>
              <div>
                <strong>Allocated Heat Codes:</strong>{' '}
                {activeJobCard.materialIssue?.heatNumbers.join(', ')}
              </div>
              <div>
                <strong>MTC Verified:</strong> Yes (Mill Test Certificate filed)
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                type="button"
                onClick={() => {
                  setActiveStageId('cutting');
                  setUserRole('operator');
                  setCurrentTab('cutting');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-xs"
              >
                <span>Proceed to Cutting Workstation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleIssueMaterials} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Issue Slip Number
                </label>
                <input
                  type="text"
                  value={issueSlipNo}
                  onChange={(e) => setIssueSlipNo(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Store Keeper / Authorizing In-charge
                </label>
                <input
                  type="text"
                  value={issuedBy}
                  onChange={(e) => setIssuedBy(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Store Notes & Mill Certificate Remarks
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500 font-mono">
                Will advance Job Card to Cutting & Profiling stage.
              </span>

              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Authorize & Issue to Fabrication</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
