import React from 'react';
import { useERP } from '../context/ERPContext';
import {
  FileText,
  PackageCheck,
  Scissors,
  Hammer,
  Flame,
  Cog,
  CheckCircle2,
  Paintbrush,
  Boxes,
  Truck,
  ArrowRight,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';

interface StageNode {
  id: string;
  label: string;
  sublabel: string;
  icon: React.ElementType;
  category: string;
}

const STAGES: StageNode[] = [
  { id: 'drawing_release', label: 'Drawing Released', sublabel: 'CAD & BOM Release', icon: FileText, category: 'Engineering' },
  { id: 'material_issue', label: 'Material Issued', sublabel: 'Store & Heat No', icon: PackageCheck, category: 'Store' },
  { id: 'cutting', label: 'Cutting & Drilling', sublabel: 'Plasma, Band Saw', icon: Scissors, category: 'Fabrication' },
  { id: 'fitup', label: 'Fit-up & Tack', sublabel: 'Platen Alignment', icon: Hammer, category: 'Fabrication' },
  { id: 'welding', label: 'Welding', sublabel: 'MIG/TIG Multi-pass', icon: Flame, category: 'Fabrication' },
  { id: 'machining', label: 'Machining', sublabel: 'Turning & Milling', icon: Cog, category: 'Machining' },
  { id: 'inspection', label: 'In-Process QC', sublabel: 'NDT & Tolerances', icon: CheckCircle2, category: 'Quality' },
  { id: 'painting', label: 'Painting & Prep', sublabel: 'Blast & DFT Coat', icon: Paintbrush, category: 'Finishing' },
  { id: 'assembly', label: 'Assembly', sublabel: 'Fitment & Hardware', icon: Boxes, category: 'Finishing' },
  { id: 'dispatch', label: 'Dispatch', sublabel: 'Dossier & Delivery', icon: Truck, category: 'Dispatch' },
];

export const WorkflowFlowchart: React.FC = () => {
  const { activeJobCard, activeStageId, setActiveStageId } = useERP();

  if (!activeJobCard) return null;

  // Check if there are active rework tickets
  const openReworkTickets = activeJobCard.reworkTickets.filter((t) => t.status === 'open');

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 transition-colors">
      <div className="max-w-7xl mx-auto">
        {/* Header & Overall Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-mono">
              Production Workflow Pipeline
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Job Card: {activeJobCard.jobCardNo} ({activeJobCard.partNo})
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Batch: <strong className="text-slate-800 dark:text-slate-200 font-mono">{activeJobCard.totalQuantity} Nos</strong>
            </span>
          </div>

          {/* Quick Rework Indicator Banner if any tickets open */}
          {openReworkTickets.length > 0 && (
            <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-mono">
              <RotateCcw className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                Active Loopback: {openReworkTickets.length} Rework Return Ticket ({openReworkTickets[0].fromStageName} → {openReworkTickets[0].toStageName})
              </span>
            </div>
          )}
        </div>

        {/* Horizontal Flow Pipeline */}
        <div className="overflow-x-auto pb-2 pt-1">
          <div className="flex items-center min-w-max gap-1">
            {STAGES.map((stage, idx) => {
              const op = activeJobCard.operations.find((o) => o.stageId === stage.id);
              const isSelected = activeStageId === stage.id || (!activeStageId && activeJobCard.currentStageId === stage.id);
              const isCurrent = activeJobCard.currentStageId === stage.id;
              const hasRework = (op?.quantities.rework || 0) > 0 || (op?.status === 'rework');
              const isCompleted = op?.status === 'completed';
              const isInProgress = op?.status === 'in_progress' || op?.isRunning;

              const Icon = stage.icon;

              return (
                <React.Fragment key={stage.id}>
                  {/* Step Card Node */}
                  <button
                    onClick={() => setActiveStageId(stage.id)}
                    className={`group relative flex flex-col items-start p-2.5 rounded-lg border text-left transition-all w-36 shrink-0 ${
                      isSelected
                        ? 'ring-2 ring-amber-500 bg-amber-50/50 dark:bg-amber-950/20 border-amber-400 dark:border-amber-600'
                        : isCurrent
                        ? 'bg-slate-50 dark:bg-slate-800/90 border-blue-400 dark:border-blue-500 shadow-xs'
                        : isCompleted
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/80 hover:border-emerald-400'
                        : hasRework
                        ? 'bg-purple-50/50 dark:bg-purple-950/20 border-purple-300 dark:border-purple-800 hover:border-purple-400'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {/* Top Row: Icon + Sequence */}
                    <div className="flex items-center justify-between w-full mb-1">
                      <div
                        className={`p-1 rounded ${
                          isCompleted
                            ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50'
                            : hasRework
                            ? 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/50'
                            : isInProgress
                            ? 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50'
                            : 'text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-700/60'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 font-semibold">
                        0{idx + 1}
                      </span>
                    </div>

                    {/* Stage Name */}
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate w-full">
                      {stage.label}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate w-full mb-1.5">
                      {stage.sublabel}
                    </span>

                    {/* Quantity Breakdown Grid inside each stage node */}
                    {op && (
                      <div className="w-full pt-1.5 border-t border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-[11px] font-mono">
                        <div className="flex items-center gap-1.5">
                          {op.quantities.completed > 0 && (
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold" title="Completed units">
                              {op.quantities.completed}C
                            </span>
                          )}
                          {op.quantities.inProgress > 0 && (
                            <span className="text-blue-600 dark:text-blue-400 font-semibold" title="In-Progress units">
                              {op.quantities.inProgress}P
                            </span>
                          )}
                          {op.quantities.rework > 0 && (
                            <span className="text-purple-600 dark:text-purple-400 font-bold" title="Rework Loopback units">
                              {op.quantities.rework}R
                            </span>
                          )}
                          {op.quantities.pending > 0 && (
                            <span className="text-slate-400 dark:text-slate-500" title="Pending units">
                              {op.quantities.pending}W
                            </span>
                          )}
                        </div>

                        {op.isRunning && (
                          <span className="text-[10px] text-amber-500 font-semibold animate-pulse">
                            ACTIVE
                          </span>
                        )}
                      </div>
                    )}
                  </button>

                  {/* Flow Arrow */}
                  {idx < STAGES.length - 1 && (
                    <div className="flex items-center justify-center px-1 text-slate-300 dark:text-slate-700">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Explanatory Legend & Rework Loopback Notice */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-3">
            <span>Stage Counts:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-mono font-medium">C = Completed</span>
            <span className="text-blue-600 dark:text-blue-400 font-mono font-medium">P = In Progress</span>
            <span className="text-purple-600 dark:text-purple-400 font-mono font-medium">R = Rework Loopback</span>
            <span className="text-slate-500 font-mono">W = Waiting / Pending</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-purple-700 dark:text-purple-300 font-mono">
              <RotateCcw className="w-3 h-3" />
              Non-Linear Fallback Supported: QC & Assembly can route parts back to any prior stage
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
