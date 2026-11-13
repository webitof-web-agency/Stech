import React from 'react';
import { useERP } from '../context/ERPContext';
import {
  FileText,
  Boxes,
  PackageCheck,
  Scissors,
  Hammer,
  Flame,
  Cog,
  CheckCircle2,
  Paintbrush,
  Layers,
  Truck,
  ArrowRight,
  RotateCcw,
  Plus,
  Play,
  Check,
  AlertCircle,
  Wrench,
  Clock,
  Printer,
  GitMerge,
} from 'lucide-react';

export const SupervisorDashboard: React.FC<{ onOpenTraveler: () => void }> = ({
  onOpenTraveler,
}) => {
  const {
    jobCards,
    drawings,
    activeJobCard,
    activeProject,
    setActiveStageId,
    setCurrentTab,
    setUserRole,
    updateStageQuantities,
  } = useERP();

  if (!activeJobCard || !activeProject) {
    return <div className="p-8 text-center text-slate-500">No project data available.</div>;
  }

  // Find active operation on the current job card
  const currentOp =
    activeJobCard.operations.find((o) => o.stageId === activeJobCard.currentStageId) ||
    activeJobCard.operations[0];

  // Simple, plain-English counts
  const totalPieces = activeJobCard.totalQuantity;
  const completedPiecesAtCurrent = currentOp.quantities.completed;
  const reworkPieces = currentOp.quantities.rework || 0;
  const canQuickAdvance =
    completedPiecesAtCurrent < totalPieces &&
    (currentOp.quantities.inProgress > 0 || currentOp.quantities.pending > 0);

  // Active open rework ticket if any
  const activeReworkTicket = activeJobCard.reworkTickets.find((t) => t.status === 'open');

  // Dynamic project hierarchy summary counts
  const projectSubCount = jobCards.filter(
    (j) => j.projectId === activeProject.id && j.assemblyLevel === 'sub_assembly'
  ).length;
  const projectMainCount = jobCards.filter(
    (j) => j.projectId === activeProject.id && j.assemblyLevel === 'main_assembly'
  ).length;
  const boughtOutCount = activeProject.boughtOutItems?.length || 0;

  // Map stage IDs to their icon and route tab
  const getStageMeta = (stageId: string) => {
    switch (stageId) {
      case 'drawing_release':
        return { icon: FileText, tab: 'drawing_release' as const, role: 'project_manager' as const };
      case 'bom_requirement':
        return { icon: Boxes, tab: 'bom_requirement' as const, role: 'stores' as const };
      case 'material_issue':
        return { icon: PackageCheck, tab: 'material_issued' as const, role: 'stores' as const };
      case 'cutting':
        return { icon: Scissors, tab: 'cutting' as const, role: 'operator' as const };
      case 'fitup':
        return { icon: Hammer, tab: 'fitup' as const, role: 'operator' as const };
      case 'welding':
        return { icon: Flame, tab: 'welding' as const, role: 'operator' as const };
      case 'machining':
        return { icon: Cog, tab: 'machining' as const, role: 'operator' as const };
      case 'inspection':
        return { icon: CheckCircle2, tab: 'inspection' as const, role: 'quality' as const };
      case 'painting':
        return { icon: Paintbrush, tab: 'painting' as const, role: 'operator' as const };
      case 'assembly':
        return { icon: Layers, tab: 'assembly' as const, role: 'operator' as const };
      case 'dispatch':
        return { icon: Truck, tab: 'dispatch' as const, role: 'dispatch' as const };
      default:
        return { icon: Wrench, tab: 'cutting' as const, role: 'operator' as const };
    }
  };

  // Build steps from actual job card operations + gateway stages so custom routes stay accurate
  const linkedDrawingReleased = drawings.some(
    (d) =>
      (activeJobCard.drawingRef.toUpperCase().includes(d.drawingNo.toUpperCase()) ||
        d.assemblyId === activeJobCard.id) &&
      d.status === 'released'
  );

  const flowSteps = [
    ...(activeJobCard.operations.some((o) => o.stageId === 'drawing_release')
      ? []
      : [{ id: 'drawing_release', label: 'Drawing Released', isVirtualDone: linkedDrawingReleased }]),
    ...(activeJobCard.operations.some((o) => o.stageId === 'bom_requirement')
      ? []
      : [{ id: 'bom_requirement', label: 'BOM Parts List', isVirtualDone: activeProject.bomItems.length > 0 }]),
    ...activeJobCard.operations.map((op) => ({
      id: op.stageId,
      label: op.stageName,
      isVirtualDone: op.status === 'completed',
    })),
    ...(activeJobCard.operations.some((o) => o.stageId === 'dispatch')
      ? []
      : [{ id: 'dispatch', label: 'Ready to Ship', isVirtualDone: activeJobCard.overallStatus === 'completed' }]),
  ];

  // Quick 1-click +1 Done action
  const handleQuickAdvance = () => {
    if (!canQuickAdvance) return;
    if (currentOp.quantities.inProgress > 0) {
      updateStageQuantities(activeJobCard.id, currentOp.stageId, {
        completed: currentOp.quantities.completed + 1,
        inProgress: currentOp.quantities.inProgress - 1,
      });
    } else if (currentOp.quantities.pending > 0) {
      updateStageQuantities(activeJobCard.id, currentOp.stageId, {
        completed: currentOp.quantities.completed + 1,
        pending: currentOp.quantities.pending - 1,
      });
    }
  };

  const handleGoToStep = (stageId: string) => {
    const meta = getStageMeta(stageId);
    setActiveStageId(stageId);
    setCurrentTab(meta.tab);
    setUserRole(meta.role);
  };

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto space-y-6">
      {/* 1. Header Banner: Simple, Clear & Workable */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 tabular-nums">
              Active Job: <span className="font-mono">{activeJobCard.jobCardNo}</span>
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Client: {activeProject.client}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            {activeJobCard.partNo} · <span className="font-normal text-slate-600 dark:text-slate-300">{activeJobCard.description}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Total Batch: <strong className="text-slate-800 dark:text-slate-200">{totalPieces} Nos</strong> · Drawing: {activeJobCard.drawingRef} ({activeJobCard.drawingRev})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenTraveler}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors shadow-xs cursor-pointer"
            title="Print Physical Job Card Traveler"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Traveler</span>
          </button>
          <button
            type="button"
            onClick={() => setCurrentTab('work_orders')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>All Jobs Board</span>
          </button>
        </div>
      </div>

      {/* 2. Rework Alert Box (Shows up when something didn't fit or failed QC) */}
      {activeReworkTicket && (
        <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border-2 border-purple-300 dark:border-purple-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200 shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-purple-900 dark:text-purple-200 uppercase tracking-wide">
                Issue Reported at {activeReworkTicket.fromStageName} → Sent Back to Fix
              </div>
              <p className="text-sm font-semibold text-purple-950 dark:text-purple-100 mt-0.5">
                Defect: {activeReworkTicket.defectDetails}
              </p>
              <p className="text-xs text-purple-700 dark:text-purple-300 mt-0.5">
                Fix Action: <strong>{activeReworkTicket.correctiveAction}</strong> · Assigned to: <strong>{activeReworkTicket.toStageName}</strong> ({activeReworkTicket.quantity} piece affected)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleGoToStep(activeReworkTicket.toStageId)}
            className="px-3.5 py-2 text-xs font-bold rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors shrink-0 cursor-pointer shadow-xs"
          >
            Go to {activeReworkTicket.toStageName.split(' ')[0]} to Fix →
          </button>
        </div>
      )}

      {/* 3. 3 Simple Big Metrics (Plain Language, Consistent Typography) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Total in This Order</div>
            <div className="text-xl sm:text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100 mt-1">
              {totalPieces} Nos
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
              Material: {currentOp.material?.grade || 'Structural Steel'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-bold">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Current Station</div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              {currentOp.stageName}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Operator: {currentOp.operator?.name || 'Assigned Operator'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Pieces Needing Fix</div>
            <div className="text-xl sm:text-2xl font-bold tabular-nums text-purple-700 dark:text-purple-300 mt-1">
              {reworkPieces} Piece{reworkPieces === 1 ? '' : 's'}
            </div>
            <div className="text-[11px] text-purple-600 dark:text-purple-400 font-medium mt-0.5">
              {activeReworkTicket
                ? `Fixing in ${activeReworkTicket.toStageName}`
                : reworkPieces > 0
                ? 'Active rework queued'
                : 'No defects currently'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center font-bold">
            <RotateCcw className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 4. Assembly Hierarchy Quick Access Card */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50/70 via-blue-50/40 to-emerald-50/40 dark:from-amber-950/30 dark:via-blue-950/20 dark:to-emerald-950/20 border border-amber-300 dark:border-amber-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold shrink-0">
            <GitMerge className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                {activeProject.code} Product Structure & Hierarchy
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-amber-200/80 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-semibold">
                {activeProject.name}
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
              <strong>{projectSubCount} Sub-Assembl{projectSubCount === 1 ? 'y' : 'ies'}</strong> + <strong>{boughtOutCount} Bought-Out Component{boughtOutCount === 1 ? '' : 's'}</strong> roll into <strong>{projectMainCount} Main Module{projectMainCount === 1 ? '' : 's'}</strong> for final deliverable <strong>{activeProject.code}</strong>.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setCurrentTab('assembly_hierarchy')}
          className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shrink-0 shadow-xs cursor-pointer flex items-center gap-1.5"
        >
          <span>Open Product Hierarchy</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 5. The Visual Production Flow (Clickable & Dynamic per Job Route) */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Core Fabrication Flow
            </h2>
            <p className="text-xs text-slate-500">
              Click any step below to jump straight to that station console or engineering gate.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            Current: {currentOp.stageName}
          </span>
        </div>

        {/* Dynamic Step Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {flowSteps.map((step, idx) => {
            const meta = getStageMeta(step.id);
            const Icon = meta.icon;
            const op = activeJobCard.operations.find((o) => o.stageId === step.id);
            const isCurrent = activeJobCard.currentStageId === step.id;
            const isCompleted = op ? op.status === 'completed' : step.isVirtualDone;
            const hasRework = (op?.quantities.rework || 0) > 0;

            return (
              <button
                type="button"
                key={step.id}
                onClick={() => handleGoToStep(step.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between relative group ${
                  isCurrent
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950 dark:text-emerald-100'
                    : hasRework
                    ? 'bg-purple-50/60 dark:bg-purple-950/20 border-purple-400 text-purple-950 dark:text-purple-200'
                    : isCompleted
                    ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center tabular-nums text-[10px] font-bold">
                      {idx + 1}
                    </span>
                    <Icon className="w-4 h-4 text-slate-500" />
                  </div>

                  {isCurrent ? (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white tracking-wide">
                      ACTIVE
                    </span>
                  ) : hasRework ? (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-600 text-white tracking-wide">
                      FIX ↺
                    </span>
                  ) : isCompleted ? (
                    <span className="text-emerald-600 text-xs font-bold">✓</span>
                  ) : null}
                </div>

                <div className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">
                  {step.label}
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 font-medium tabular-nums">
                  {op ? (
                    <>
                      <span>Done: <strong className="text-emerald-600 font-semibold">{op.quantities.completed}</strong></span>
                      <span>Working: <strong className="text-blue-600 font-semibold">{op.quantities.inProgress}</strong></span>
                    </>
                  ) : (
                    <span className={isCompleted ? 'text-emerald-600 font-semibold' : ''}>
                      {isCompleted ? 'Verified ✓' : 'Open Gate →'}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Fast 1-Click Operations Console (Right on Dashboard!) */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Quick Action Station
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Work on {currentOp.stageName} ({activeJobCard.partNo})
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>Machine: <strong className="font-semibold text-slate-800 dark:text-slate-200">{currentOp.machine?.name || 'Assigned Machine'}</strong></span>
            <span>·</span>
            <span>Operator: <strong className="font-semibold text-slate-800 dark:text-slate-200">{currentOp.operator?.name || 'Assigned Operator'}</strong></span>
          </div>
        </div>

        {/* Piece Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-center">
            <div className="text-xs font-medium text-slate-500">Completed Pieces</div>
            <div className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400 mt-0.5">
              {currentOp.quantities.completed}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-center">
            <div className="text-xs font-medium text-slate-500">Working Right Now</div>
            <div className="text-2xl font-bold tabular-nums text-blue-600 dark:text-blue-400 mt-0.5">
              {currentOp.quantities.inProgress}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-center">
            <div className="text-xs font-medium text-slate-500">Waiting (Pending)</div>
            <div className="text-2xl font-bold tabular-nums text-slate-700 dark:text-slate-300 mt-0.5">
              {currentOp.quantities.pending}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-center">
            <div className="text-xs font-medium text-slate-500">Needs Fix (Rework)</div>
            <div className="text-2xl font-bold tabular-nums text-purple-600 dark:text-purple-400 mt-0.5">
              {currentOp.quantities.rework || 0}
            </div>
          </div>
        </div>

        {/* Big Obvious Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* Action 1: Advance 1 piece */}
          <button
            type="button"
            disabled={!canQuickAdvance}
            onClick={handleQuickAdvance}
            className="flex-1 min-w-[200px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-xs transition-colors cursor-pointer"
          >
            <Check className="w-5 h-5" />
            <span>
              {completedPiecesAtCurrent >= totalPieces
                ? 'All Pieces Completed at This Stage ✓'
                : canQuickAdvance
                ? 'Mark +1 Piece Done & Advance'
                : 'Awaiting Rework Repair'}
            </span>
          </button>

          {/* Action 2: Go to full workstation */}
          <button
            type="button"
            onClick={() => handleGoToStep(currentOp.stageId)}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 font-semibold text-sm transition-colors cursor-pointer shadow-xs"
          >
            <Wrench className="w-4 h-4" />
            <span>Open {currentOp.stageName.split(' ')[0]} Console</span>
          </button>

          {/* Action 3: Go to QC Review */}
          <button
            type="button"
            onClick={() => handleGoToStep('inspection')}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold text-sm transition-colors cursor-pointer shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>QC Review & Checks</span>
          </button>
        </div>
      </div>
    </div>
  );
};

