import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { JobCard, AssemblyLevel } from '../types/erp';
import {
  ArrowRight,
  RotateCcw,
  Plus,
  Search,
  GitMerge,
  GripVertical,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';

interface ShopfloorBoardProps {
  onOpenJobDrawer: (jobCard: JobCard, stageId: string) => void;
  onOpenNewJobModal: () => void;
  onOpenReworkModal: (fromStageId: string, toStageId?: string) => void;
}

export const ShopfloorBoard: React.FC<ShopfloorBoardProps> = ({
  onOpenJobDrawer,
  onOpenNewJobModal,
  onOpenReworkModal,
}) => {
  const {
    jobCards,
    activeProjectId,
    workflowStages,
    updateStageQuantities,
    moveJobCardToStage,
    setActiveJobCardId,
    setActiveStageId,
    setCurrentTab,
  } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'urgent'>('all');
  const [filterLevel, setFilterLevel] = useState<'all' | AssemblyLevel>('all');
  const [hideEmptyLanes, setHideEmptyLanes] = useState(false);

  // Drag & Drop State
  const [draggedCard, setDraggedCard] = useState<{ jobCardId: string; fromStageId: string } | null>(null);
  const [dragOverStageId, setDragOverStageId] = useState<string | null>(null);
  const [boardToast, setBoardToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setBoardToast(msg);
    setTimeout(() => setBoardToast(null), 3500);
  };

  // Filter jobs by current active project, search, priority & assembly level
  const filteredJobs = jobCards.filter((jc) => {
    const matchesProject = !activeProjectId || jc.projectId === activeProjectId;
    const matchesSearch =
      jc.jobCardNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      jc.partNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      jc.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === 'all' || jc.priority === filterPriority;
    const matchesLevel = filterLevel === 'all' || jc.assemblyLevel === filterLevel;
    return matchesProject && matchesSearch && matchesPriority && matchesLevel;
  });

  const handleDropOnStage = (targetStageId: string) => {
    setDragOverStageId(null);
    if (!draggedCard) return;

    const { jobCardId, fromStageId } = draggedCard;
    setDraggedCard(null);
    if (fromStageId === targetStageId) return;

    const fromIdx = workflowStages.findIndex((s) => s.id === fromStageId);
    const toIdx = workflowStages.findIndex((s) => s.id === targetStageId);
    const jc = jobCards.find((j) => j.id === jobCardId);
    const targetStage = workflowStages.find((s) => s.id === targetStageId);

    if (toIdx < fromIdx) {
      // Dragged backward -> trigger Non-Linear Rework Routing Modal pre-filled
      setActiveJobCardId(jobCardId);
      onOpenReworkModal(fromStageId, targetStageId);
    } else {
      // Dragged forward -> advance job card to target stage
      moveJobCardToStage(jobCardId, fromStageId, targetStageId);
      showToast(`Moved ${jc?.partNo || 'Job'} forward to ${targetStage?.name || targetStageId}.`);
    }
  };

  return (
    <div className="w-full max-w-full min-w-0 space-y-4">
      {/* 1. Clean 2-Row Header & Filter Bar (Zero Horizontal Overflow) */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 min-w-0">
        {/* Top Row: Title + Primary Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                Shopfloor Kanban Board
              </h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                {filteredJobs.length} Active Jobs
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Drag cards forward to advance stages, drag backward to route rework, or click any card to inspect details.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setHideEmptyLanes(!hideEmptyLanes)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                hideEmptyLanes
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
              title="Toggle visibility of empty workflow lanes"
            >
              {hideEmptyLanes ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{hideEmptyLanes ? 'Show All Lanes' : 'Active Lanes Only'}</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentTab('assembly_hierarchy')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 hover:bg-blue-100 transition-colors cursor-pointer"
              title="View 3-tier sub/main/master assembly hierarchy"
            >
              <GitMerge className="w-3.5 h-3.5" />
              <span>Assembly Tree</span>
            </button>

            <button
              type="button"
              onClick={onOpenNewJobModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Job</span>
            </button>
          </div>
        </div>

        {/* Second Row: Wrapping Filters */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800">
          {/* Quick Search */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2 text-slate-400" />
            <input
              type="text"
              placeholder="Search part or job #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Priority filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium">
            <button
              type="button"
              onClick={() => setFilterPriority('all')}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                filterPriority === 'all'
                  ? 'bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              All Priority
            </button>
            <button
              type="button"
              onClick={() => setFilterPriority('high')}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                filterPriority === 'high'
                  ? 'bg-white dark:bg-slate-900 font-bold text-amber-600 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              High
            </button>
            <button
              type="button"
              onClick={() => setFilterPriority('urgent')}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                filterPriority === 'urgent'
                  ? 'bg-white dark:bg-slate-900 font-bold text-red-600 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Urgent
            </button>
          </div>

          {/* Assembly Level Filter */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium">
            <button
              type="button"
              onClick={() => setFilterLevel('all')}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                filterLevel === 'all'
                  ? 'bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              All Tiers
            </button>
            <button
              type="button"
              onClick={() => setFilterLevel('sub_assembly')}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                filterLevel === 'sub_assembly'
                  ? 'bg-purple-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Sub-Assy
            </button>
            <button
              type="button"
              onClick={() => setFilterLevel('main_assembly')}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                filterLevel === 'main_assembly'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Main Module
            </button>
            <button
              type="button"
              onClick={() => setFilterLevel('master_assembly')}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                filterLevel === 'master_assembly'
                  ? 'bg-amber-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Master Unit
            </button>
          </div>
        </div>
      </div>

      {boardToast && (
        <div className="px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{boardToast}</span>
        </div>
      )}

      {/* 2. Drag-and-Drop Kanban Columns (Contained Horizontal Scroll) */}
      <div className="w-full min-w-0 overflow-x-auto pb-3">
        <div className="flex items-stretch gap-3 min-w-max">
          {workflowStages.map((stage, stageIdx) => {
            const jobsAtThisStage = filteredJobs
              .map((jc) => {
                const op = jc.operations.find((o) => o.stageId === stage.id);
                return { jc, op };
              })
              .filter(({ jc, op }) => {
                if (!op) return false;
                const hasActiveWork = op.quantities.inProgress > 0 || op.quantities.rework > 0;
                const isActivePending = jc.currentStageId === stage.id && op.status !== 'completed';
                return hasActiveWork || isActivePending;
              });

            // Keep column visible when dragging so user can drop onto any stage, unless explicitly hiding empty lanes while idle
            if (hideEmptyLanes && !draggedCard && jobsAtThisStage.length === 0) {
              return null;
            }

            const totalPiecesHere = jobsAtThisStage.reduce(
              (acc, { op }) => acc + (op?.quantities.inProgress || 0) + (op?.quantities.rework || 0),
              0
            );

            const isDropTarget = dragOverStageId === stage.id && draggedCard?.fromStageId !== stage.id;
            const draggedFromIdx = draggedCard
              ? workflowStages.findIndex((s) => s.id === draggedCard.fromStageId)
              : -1;
            const isBackwardDrop = isDropTarget && draggedFromIdx > stageIdx;

            const nextStage = stageIdx < workflowStages.length - 1 ? workflowStages[stageIdx + 1] : null;

            return (
              <div
                key={stage.id}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (dragOverStageId !== stage.id) setDragOverStageId(stage.id);
                }}
                onDragLeave={() => {
                  if (dragOverStageId === stage.id) setDragOverStageId(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDropOnStage(stage.id);
                }}
                className={`shrink-0 rounded-xl border flex flex-col max-h-[calc(100vh-270px)] min-h-[300px] shadow-xs transition-all ${
                  jobsAtThisStage.length > 0 || isDropTarget ? 'w-72' : 'w-56 opacity-85 hover:opacity-100'
                } ${
                  isDropTarget
                    ? isBackwardDrop
                      ? 'bg-purple-50/80 dark:bg-purple-950/30 border-purple-500 ring-2 ring-purple-500/40'
                      : 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-500 ring-2 ring-amber-500/40'
                    : 'bg-slate-100/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Column Header */}
                <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-900/90 rounded-t-xl gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                      {String(stageIdx + 1).padStart(2, '0')}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {stage.name}
                    </span>
                  </div>

                  <span
                    className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                      totalPiecesHere > 0
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                        : 'text-slate-400'
                    }`}
                  >
                    {totalPiecesHere} pcs
                  </span>
                </div>

                {/* Drop Hint Banner */}
                {isDropTarget && (
                  <div
                    className={`mx-2 mt-2 px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold text-center border border-dashed ${
                      isBackwardDrop
                        ? 'bg-purple-100/80 dark:bg-purple-950/50 text-purple-800 dark:text-purple-200 border-purple-400'
                        : 'bg-amber-100/80 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 border-amber-400'
                    }`}
                  >
                    {isBackwardDrop ? 'Drop to Route Rework ↺' : 'Drop to Advance Stage →'}
                  </div>
                )}

                {/* Column Body / Job Cards */}
                <div className="p-2 space-y-2.5 overflow-y-auto flex-1">
                  {jobsAtThisStage.length === 0 ? (
                    <div className="p-4 text-center text-[11px] text-slate-400 font-mono rounded-lg border border-dashed border-slate-200 dark:border-slate-800">
                      {draggedCard ? 'Drop card here' : 'Station empty'}
                    </div>
                  ) : (
                    jobsAtThisStage.map(({ jc, op }) => {
                      if (!op) return null;
                      const hasRework = op.quantities.rework > 0;
                      const openTicket = jc.reworkTickets.find(
                        (t) => t.toStageId === stage.id && t.status === 'open'
                      );
                      const canAdvance =
                        op.quantities.completed < jc.totalQuantity &&
                        (op.quantities.inProgress > 0 || op.quantities.pending > 0);
                      const isDraggingThis =
                        draggedCard?.jobCardId === jc.id && draggedCard?.fromStageId === stage.id;

                      return (
                        <div
                          key={`${jc.id}_${stage.id}`}
                          draggable
                          onDragStart={() => setDraggedCard({ jobCardId: jc.id, fromStageId: stage.id })}
                          onDragEnd={() => {
                            setDraggedCard(null);
                            setDragOverStageId(null);
                          }}
                          className={`p-3 rounded-lg bg-white dark:bg-slate-800 border transition-all hover:shadow-md cursor-grab active:cursor-grabbing ${
                            isDraggingThis
                              ? 'opacity-45 scale-[0.98]'
                              : hasRework
                              ? 'border-purple-400 dark:border-purple-600 ring-1 ring-purple-400'
                              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                          }`}
                          onClick={() => {
                            setActiveJobCardId(jc.id);
                            setActiveStageId(stage.id);
                            onOpenJobDrawer(jc, stage.id);
                          }}
                        >
                          {/* Drag Handle, Tier Badge & Quantity */}
                          <div className="flex items-center justify-between gap-1 mb-1.5">
                            <div className="flex items-center gap-1 min-w-0">
                              <GripVertical className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              {jc.assemblyLevel === 'sub_assembly' && (
                                <span className="text-[9px] font-bold font-mono px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300">
                                  SUB-ASSY
                                </span>
                              )}
                              {jc.assemblyLevel === 'main_assembly' && (
                                <span className="text-[9px] font-bold font-mono px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300">
                                  MAIN MODULE
                                </span>
                              )}
                              {jc.assemblyLevel === 'master_assembly' && (
                                <span className="text-[9px] font-bold font-mono px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-200">
                                  MASTER
                                </span>
                              )}
                              {jc.priority !== 'normal' && (
                                <span
                                  className={`text-[9px] font-bold font-mono px-1 py-0.2 rounded uppercase ${
                                    jc.priority === 'urgent'
                                      ? 'bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-300'
                                      : 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300'
                                  }`}
                                >
                                  {jc.priority}
                                </span>
                              )}
                            </div>

                            <span className="font-mono text-[10px] text-slate-500 shrink-0">
                              {jc.totalQuantity} pcs
                            </span>
                          </div>

                          {/* Part No & Description */}
                          <div className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate mb-0.5">
                            {jc.partNo}
                          </div>

                          <p className="text-[11px] text-slate-500 line-clamp-1 mb-1.5">
                            {jc.description}
                          </p>

                          {/* Hierarchy Relationship hint */}
                          {jc.assemblyLevel === 'sub_assembly' && jc.parentAssemblyId && (
                            <div className="text-[10px] font-mono text-purple-600 dark:text-purple-400 mb-2 truncate">
                              ↳ Feeds {jobCards.find((p) => p.id === jc.parentAssemblyId)?.partNo || 'Main Module'}
                            </div>
                          )}
                          {jc.assemblyLevel === 'main_assembly' && jc.childAssemblyIds && jc.childAssemblyIds.length > 0 && (
                            <div className="text-[10px] font-mono text-blue-600 dark:text-blue-400 mb-2 truncate">
                              ↳ Requires {jc.childAssemblyIds.length} Sub-Assemblies
                            </div>
                          )}

                          {/* Rework Loopback Notice if this part returned from QC/Assembly */}
                          {hasRework && (
                            <div className="mb-2 p-1.5 rounded bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-[10px] text-purple-800 dark:text-purple-300 flex items-start gap-1 font-mono">
                              <RotateCcw className="w-3 h-3 text-purple-600 mt-0.5 shrink-0" />
                              <span className="truncate">
                                Returned: {openTicket?.defectDetails || 'Weld/dimension issue'}
                              </span>
                            </div>
                          )}

                          {/* Piece Breakdown Mini-Matrix */}
                          <div className="grid grid-cols-4 gap-1 p-1.5 rounded bg-slate-50 dark:bg-slate-900/60 text-center font-mono text-[10px] mb-2">
                            <div>
                              <span className="text-slate-400 block text-[9px]">DONE</span>
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                {op.quantities.completed}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[9px]">ACTIVE</span>
                              <span className="font-bold text-blue-600 dark:text-blue-400">
                                {op.quantities.inProgress}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[9px]">WAIT</span>
                              <span className="text-slate-500">
                                {op.quantities.pending}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[9px]">FIX</span>
                              <span className={`font-bold ${op.quantities.rework > 0 ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'}`}>
                                {op.quantities.rework}
                              </span>
                            </div>
                          </div>

                          {/* Operator & Machine Info */}
                          <div className="flex items-center justify-between gap-2 text-[10px] text-slate-500 font-mono mb-2">
                            <span className="truncate">{op.operator.name.split(' ')[0]}</span>
                            <span className="truncate">{op.machine.code}</span>
                          </div>

                          {/* 1-Click Action Buttons on Card */}
                          <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-700/60">
                            <button
                              type="button"
                              disabled={!canAdvance}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!canAdvance) return;
                                const newCompleted = Math.min(jc.totalQuantity, op.quantities.completed + 1);
                                const payload =
                                  op.quantities.inProgress > 0
                                    ? { completed: newCompleted, inProgress: Math.max(0, op.quantities.inProgress - 1) }
                                    : { completed: newCompleted, pending: Math.max(0, op.quantities.pending - 1) };
                                updateStageQuantities(jc.id, stage.id, payload);
                                showToast(`+1 piece completed on ${jc.partNo} (${stage.name}).`);
                              }}
                              className="flex-1 flex items-center justify-center gap-1 py-1 rounded bg-emerald-600 hover:bg-emerald-700 disabled:opacity-45 disabled:cursor-not-allowed text-white text-[10px] font-semibold transition-colors cursor-pointer"
                              title="Mark 1 finished piece done"
                            >
                              <span>+1 Done</span>
                            </button>

                            {nextStage && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveJobCardToStage(jc.id, stage.id, nextStage.id);
                                  showToast(`Moved ${jc.partNo} to ${nextStage.name}.`);
                                }}
                                className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-[10px] font-semibold transition-colors cursor-pointer flex items-center gap-0.5"
                                title={`Move to ${nextStage.name}`}
                              >
                                <span>Next</span>
                                <ArrowRight className="w-2.5 h-2.5" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveJobCardId(jc.id);
                                onOpenReworkModal(stage.id);
                              }}
                              className="p-1 rounded bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[10px] cursor-pointer"
                              title="Send back to earlier step if defect found"
                            >
                              <RotateCcw className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

