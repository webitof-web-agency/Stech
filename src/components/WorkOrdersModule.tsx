import React from 'react';
import { useERP } from '../context/ERPContext';
import { ClipboardList, Plus, Play, RotateCcw, Clock, ArrowRight } from 'lucide-react';

export const WorkOrdersModule: React.FC<{
  onOpenNewJobModal: () => void;
  onOpenTraveler: () => void;
}> = ({ onOpenNewJobModal, onOpenTraveler }) => {
  const {
    jobCards,
    activeJobCardId,
    setActiveJobCardId,
    setCurrentTab,
    setActiveStageId,
    setUserRole,
  } = useERP();

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-mono">
            FABRICATION WORKSPACE
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Work Orders & Fabrication Job Cards
          </h2>
          <p className="text-xs text-slate-500">
            Manage active shopfloor work orders, part numbers, planned batch quantities, and current WIP stations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNewJobModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ New Work Order</span>
          </button>
        </div>
      </div>

      {/* Job Cards Ledger */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[11px]">
                <th className="py-2.5 px-3">WORK ORDER #</th>
                <th className="py-2.5 px-3">PART NUMBER</th>
                <th className="py-2.5 px-3">DESCRIPTION</th>
                <th className="py-2.5 px-3">DRAWING REF</th>
                <th className="py-2.5 px-3 text-center">ORDER QTY</th>
                <th className="py-2.5 px-3">CURRENT STATION</th>
                <th className="py-2.5 px-3">PRIORITY</th>
                <th className="py-2.5 px-3">DUE DATE</th>
                <th className="py-2.5 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {jobCards.map((jc) => {
                const isActive = jc.id === activeJobCardId;
                const currentOp = jc.operations.find((o) => o.stageId === jc.currentStageId) || jc.operations[0];
                const completedCount = jc.operations.filter((o) => o.status === 'completed').length;
                const percent = Math.round((completedCount / jc.operations.length) * 100);

                return (
                  <tr
                    key={jc.id}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                      isActive ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''
                    }`}
                  >
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-slate-100">
                      {jc.jobCardNo}
                    </td>
                    <td className="py-3 px-3 font-semibold text-emerald-700 dark:text-emerald-400">
                      {jc.partNo}
                    </td>
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300 max-w-[200px] truncate">
                      {jc.description}
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {jc.drawingRef} ({jc.drawingRev})
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-900 dark:text-slate-100">
                      {jc.totalQuantity} Nos
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                        {currentOp.stageName}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {percent}% completed ({completedCount}/{jc.operations.length})
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          jc.priority === 'urgent'
                            ? 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300'
                            : jc.priority === 'high'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {jc.priority.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500">{jc.targetDate}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          setActiveJobCardId(jc.id);
                          setActiveStageId(jc.currentStageId);
                          setCurrentTab('cutting');
                          setUserRole('fabrication');
                        }}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
                      >
                        Open Kiosk →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
