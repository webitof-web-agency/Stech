import React, { useEffect, useState } from 'react';
import { useERP } from '../context/ERPContext';
import { JobCard, JobCardOperation } from '../types/erp';
import {
  X,
  Play,
  Pause,
  CheckCircle2,
  RotateCcw,
  Clock,
  User,
  Wrench,
  Layers,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  FileCheck,
  AlertTriangle,
} from 'lucide-react';

interface JobCardDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  jobCard: JobCard | null;
  stageId?: string;
  onStageChange?: (newStageId: string) => void;
  onOpenReworkModal: (fromStageId: string) => void;
  onOpenQCModal: (stageId: string) => void;
}

export const JobCardDrawer: React.FC<JobCardDrawerProps> = ({
  isOpen,
  onClose,
  jobCard,
  stageId,
  onStageChange,
  onOpenReworkModal,
  onOpenQCModal,
}) => {
  const {
    operators,
    machines,
    startOperation,
    pauseOperation,
    updateStageQuantities,
    assignOperatorAndMachine,
    completeReworkExecution,
    setActiveStageId,
  } = useERP();

  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isOpen || !jobCard) return null;

  const currentOp =
    jobCard.operations.find((o) => o.stageId === (stageId || jobCard.currentStageId)) ||
    jobCard.operations[0];

  const currentIdx = jobCard.operations.findIndex((o) => o.stageId === currentOp.stageId);
  const prevOp = currentIdx > 0 ? jobCard.operations[currentIdx - 1] : null;
  const nextOp = currentIdx < jobCard.operations.length - 1 ? jobCard.operations[currentIdx + 1] : null;

  const canAdvance =
    currentOp.quantities.completed < jobCard.totalQuantity &&
    (currentOp.quantities.inProgress > 0 || currentOp.quantities.pending > 0);

  // Format stopwatch
  const formatTimer = (op: JobCardOperation) => {
    if (!op.isRunning || !op.timerStartedAt) return null;
    const totalSecs = Math.floor(Math.max(0, (Date.now() - op.timerStartedAt) / 1000));
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Open rework ticket check
  const incomingReworkTicket = jobCard.reworkTickets.find(
    (t) => t.toStageId === currentOp.stageId && t.status === 'open'
  );

  const handleAdvanceOne = () => {
    if (!canAdvance) return;
    const newCompleted = Math.min(jobCard.totalQuantity, currentOp.quantities.completed + 1);
    const payload =
      currentOp.quantities.inProgress > 0
        ? { completed: newCompleted, inProgress: Math.max(0, currentOp.quantities.inProgress - 1) }
        : { completed: newCompleted, pending: Math.max(0, currentOp.quantities.pending - 1) };
    updateStageQuantities(jobCard.id, currentOp.stageId, payload);
  };

  const handleSwitchStage = (targetStageId: string) => {
    setActiveStageId(targetStageId);
    onStageChange?.(targetStageId);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Drawer Header */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-0.5">
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                STEP {currentIdx + 1} OF {jobCard.operations.length}
              </span>
              <span>·</span>
              <span className="truncate">{jobCard.jobCardNo}</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 truncate">
              <span className="truncate">{jobCard.partNo}</span>
              <span className="text-xs font-normal text-slate-500 font-mono shrink-0">
                ({jobCard.totalQuantity} pcs total)
              </span>
            </h3>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {prevOp && (
              <button
                type="button"
                onClick={() => handleSwitchStage(prevOp.stageId)}
                className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                title={`Previous: ${prevOp.stageName}`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            {nextOp && (
              <button
                type="button"
                onClick={() => handleSwitchStage(nextOp.stageId)}
                className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                title={`Next: ${nextOp.stageName}`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Active Station Banner */}
          <div className="p-4 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">
                CURRENT STATION
              </span>
              <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {currentOp.stageName}
              </h4>
            </div>

            {/* Start / Pause Timer */}
            {!currentOp.isRunning ? (
              <button
                onClick={() => startOperation(jobCard.id, currentOp.stageId)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-xs"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Start Timer</span>
              </button>
            ) : (
              <button
                onClick={() => pauseOperation(jobCard.id, currentOp.stageId)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-mono font-bold text-xs transition-colors shadow-xs"
              >
                <Pause className="w-3.5 h-3.5 fill-white" />
                <span>Pause ({formatTimer(currentOp) || 'Active'})</span>
              </button>
            )}
          </div>

          {/* Rework Notice if sent back */}
          {incomingReworkTicket && (
            <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-300 dark:border-purple-800 space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200 font-bold">
                <RotateCcw className="w-4 h-4 text-purple-600" />
                <span>Rework Issue: {incomingReworkTicket.quantity} piece returned</span>
              </div>
              <p className="text-purple-800 dark:text-purple-300">
                <strong>Problem:</strong> {incomingReworkTicket.defectDetails}
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                <strong>Action:</strong> {incomingReworkTicket.correctiveAction}
              </p>
              <button
                onClick={() => completeReworkExecution(jobCard.id, incomingReworkTicket.id, 1.0, 'Fixed in workstation drawer per WPS corrective action')}
                className="w-full mt-2 py-1.5 text-xs font-bold rounded-lg bg-purple-700 hover:bg-purple-800 text-white transition-colors cursor-pointer"
              >
                Mark Fixed ✓ Send Back to Inspection
              </button>
            </div>
          )}

          {/* Big Touch Steppers for Pieces */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono block">
              Pieces at this station
            </span>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Completed */}
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block">
                    Completed
                  </span>
                  <span className="text-[10px] text-emerald-600">Finished piece</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <button
                    onClick={() =>
                      updateStageQuantities(jobCard.id, currentOp.stageId, {
                        completed: Math.max(0, currentOp.quantities.completed - 1),
                      })
                    }
                    className="w-7 h-7 rounded bg-emerald-200 dark:bg-emerald-800 font-bold text-xs"
                  >
                    -
                  </button>
                  <span className="text-xl font-bold text-emerald-900 dark:text-emerald-100 w-6 text-center">
                    {currentOp.quantities.completed}
                  </span>
                  <button
                    onClick={() =>
                      updateStageQuantities(jobCard.id, currentOp.stageId, {
                        completed: Math.min(jobCard.totalQuantity, currentOp.quantities.completed + 1),
                        pending: Math.max(0, currentOp.quantities.pending - 1),
                      })
                    }
                    className="w-7 h-7 rounded bg-emerald-200 dark:bg-emerald-800 font-bold text-xs"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* In Progress */}
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-300 dark:border-blue-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-blue-800 dark:text-blue-300 block">
                    Working Now
                  </span>
                  <span className="text-[10px] text-blue-600">On machine</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <button
                    onClick={() =>
                      updateStageQuantities(jobCard.id, currentOp.stageId, {
                        inProgress: Math.max(0, currentOp.quantities.inProgress - 1),
                      })
                    }
                    className="w-7 h-7 rounded bg-blue-200 dark:bg-blue-800 font-bold text-xs"
                  >
                    -
                  </button>
                  <span className="text-xl font-bold text-blue-900 dark:text-blue-100 w-6 text-center">
                    {currentOp.quantities.inProgress}
                  </span>
                  <button
                    onClick={() =>
                      updateStageQuantities(jobCard.id, currentOp.stageId, {
                        inProgress: currentOp.quantities.inProgress + 1,
                        pending: Math.max(0, currentOp.quantities.pending - 1),
                      })
                    }
                    className="w-7 h-7 rounded bg-blue-200 dark:bg-blue-800 font-bold text-xs"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Waiting */}
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Waiting
                  </span>
                  <span className="text-[10px] text-slate-400">In queue</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <button
                    onClick={() =>
                      updateStageQuantities(jobCard.id, currentOp.stageId, {
                        pending: Math.max(0, currentOp.quantities.pending - 1),
                      })
                    }
                    className="w-7 h-7 rounded bg-slate-200 dark:bg-slate-700 font-bold text-xs"
                  >
                    -
                  </button>
                  <span className="text-xl font-bold text-slate-800 dark:text-slate-200 w-6 text-center">
                    {currentOp.quantities.pending}
                  </span>
                  <button
                    onClick={() =>
                      updateStageQuantities(jobCard.id, currentOp.stageId, {
                        pending: currentOp.quantities.pending + 1,
                      })
                    }
                    className="w-7 h-7 rounded bg-slate-200 dark:bg-slate-700 font-bold text-xs"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Rework */}
              <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-300 dark:border-purple-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-purple-800 dark:text-purple-300 block">
                    Needs Fix
                  </span>
                  <span className="text-[10px] text-purple-600">Rework</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <button
                    onClick={() =>
                      updateStageQuantities(jobCard.id, currentOp.stageId, {
                        rework: Math.max(0, currentOp.quantities.rework - 1),
                      })
                    }
                    className="w-7 h-7 rounded bg-purple-200 dark:bg-purple-800 font-bold text-xs"
                  >
                    -
                  </button>
                  <span className="text-xl font-bold text-purple-900 dark:text-purple-100 w-6 text-center">
                    {currentOp.quantities.rework}
                  </span>
                  <button
                    onClick={() =>
                      updateStageQuantities(jobCard.id, currentOp.stageId, {
                        rework: currentOp.quantities.rework + 1,
                      })
                    }
                    className="w-7 h-7 rounded bg-purple-200 dark:bg-purple-800 font-bold text-xs"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              disabled={!canAdvance}
              onClick={handleAdvanceOne}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {currentOp.quantities.completed >= jobCard.totalQuantity
                  ? 'Stage Completed ✓'
                  : 'Mark 1 Piece Done (+1) & Pass to Next Step'}
              </span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onOpenReworkModal(currentOp.stageId)}
                className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Send Back (Rework)</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenQCModal(currentOp.stageId)}
                className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Inspect at QC Gate</span>
              </button>
            </div>
          </div>

          {/* Operator, Machine, Material */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Operator</label>
                <select
                  value={currentOp.operator.id}
                  onChange={(e) =>
                    assignOperatorAndMachine(jobCard.id, currentOp.stageId, e.target.value, currentOp.machine.id)
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono"
                >
                  {operators.map((op) => (
                    <option key={op.id} value={op.id}>
                      {op.name} ({op.shift.split(' ')[0]})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Machine / Bay</label>
                <select
                  value={currentOp.machine.id}
                  onChange={(e) =>
                    assignOperatorAndMachine(jobCard.id, currentOp.stageId, currentOp.operator.id, e.target.value)
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono"
                >
                  {machines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.workCenter})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 font-mono text-[11px] space-y-1">
              <div>Drawing: <strong>{jobCard.drawingRef} ({jobCard.drawingRev})</strong></div>
              <div>Material: <strong>{currentOp.material.grade}</strong> (Heat: {currentOp.material.heatNumber})</div>
              <div>Due Date: <strong>{jobCard.targetDate}</strong></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
