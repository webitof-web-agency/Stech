import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { JobCard, AssemblyLevel, BoughtOutItem } from '../types/erp';
import {
  GitMerge,
  Layers,
  Boxes,
  CheckCircle2,
  Clock,
  RotateCcw,
  AlertTriangle,
  ArrowRight,
  Plus,
  Wrench,
  Check,
  ChevronRight,
  ShieldCheck,
  Zap,
  Package,
  CheckCheck,
} from 'lucide-react';

export const AssemblyTreeModule: React.FC<{
  onOpenWorkstation: (jobCardId: string, stageId: string) => void;
  onOpenReworkModal: (fromStageId?: string) => void;
}> = ({ onOpenWorkstation, onOpenReworkModal }) => {
  const {
    jobCards,
    activeProject,
    setActiveJobCardId,
    setActiveStageId,
    setCurrentTab,
    setUserRole,
    updateStageQuantities,
    completeSubAssembly,
    completeMainAssembly,
    completeMasterProject,
    completeReworkExecution,
    passQCReinspection,
  } = useERP();

  const [activeFilter, setActiveFilter] = useState<'all' | AssemblyLevel | 'bought_out'>('all');

  // Group job cards by level for the active project
  const masterJob = jobCards.find(
    (jc) => jc.assemblyLevel === 'master_assembly' && (jc.projectId === activeProject?.id || jc.id === 'jc_jcb_master')
  ) || jobCards[0];

  const mainAssemblies = jobCards.filter(
    (jc) => jc.assemblyLevel === 'main_assembly' && (jc.projectId === activeProject?.id || jc.id === 'jc_arm_main')
  );

  const subAssemblies = jobCards.filter(
    (jc) => jc.assemblyLevel === 'sub_assembly' && (jc.projectId === activeProject?.id || ['jc_boom_01', 'jc_dipper_01', 'jc_bucket_01'].includes(jc.id))
  );

  const boughtOutItems = activeProject?.boughtOutItems || [];

  // Calculate readiness metrics
  const completedSubCount = subAssemblies.filter((s) => s.overallStatus === 'completed').length;
  const readyMainCount = mainAssemblies.filter((m) => m.overallStatus === 'completed').length;
  const masterProgressPercent = mainAssemblies.length > 0
    ? Math.round((readyMainCount / mainAssemblies.length) * 100)
    : 35;

  const handleQuickAdvance = (jc: JobCard) => {
    const op = jc.operations.find((o) => o.stageId === jc.currentStageId) || jc.operations[0];
    if (op.quantities.inProgress > 0) {
      updateStageQuantities(jc.id, op.stageId, {
        completed: op.quantities.completed + 1,
        inProgress: op.quantities.inProgress - 1,
      });
    } else if (op.quantities.pending > 0) {
      updateStageQuantities(jc.id, op.stageId, {
        completed: op.quantities.completed + 1,
        pending: op.quantities.pending - 1,
      });
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6">
      {/* 1. Header with clean stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-mono">
              Product Structure & Hierarchy
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Deliverable: {activeProject?.code} ({activeProject?.name})
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            Master (JCB-001) → Main (Arm) → Sub-Assemblies & Bought-Out
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Fabricated Sub-Assemblies (Boom, Dipper, Bucket) join with purchased Bought-Out Items (Cylinders, Pins, Bolts) into Main Assembly, then roll up to Master completion.
          </p>
        </div>

        {/* Level filter tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-mono self-start sm:self-auto flex-wrap">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            All Hierarchy
          </button>
          <button
            onClick={() => setActiveFilter('sub_assembly')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeFilter === 'sub_assembly'
                ? 'bg-purple-600 text-white font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Sub-Assemblies ({subAssemblies.length})
          </button>
          <button
            onClick={() => setActiveFilter('bought_out')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeFilter === 'bought_out'
                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Bought-Out ({boughtOutItems.length})
          </button>
          <button
            onClick={() => setActiveFilter('main_assembly')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeFilter === 'main_assembly'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Main Assembly ({mainAssemblies.length})
          </button>
          <button
            onClick={() => setActiveFilter('master_assembly')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeFilter === 'master_assembly'
                ? 'bg-amber-600 text-white font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Master Unit (1)
          </button>
        </div>
      </div>

      {/* 2. 3-Tier Summary Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tier 1: Sub-Assemblies & Bought-Out */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1">
            <span className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-bold">
              <Boxes className="w-4 h-4" />
              Tier 1: Sub-Assemblies
            </span>
            <span className="font-mono">{completedSubCount}/{subAssemblies.length} Done</span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
            {subAssemblies.length} Fabricated
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-purple-600 h-full rounded-full transition-all"
              style={{ width: `${subAssemblies.length ? (completedSubCount / subAssemblies.length) * 100 : 0}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            BOOM-01 (In Rework), DIPPER-01 (Welding), BUCKET-01 (Fit-up).
          </p>
        </div>

        {/* Tier 2: Main Assembly */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1">
            <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold">
              <Layers className="w-4 h-4" />
              Tier 2: Main Assembly
            </span>
            <span className="font-mono">{readyMainCount}/{mainAssemblies.length} Ready</span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
            ARM-ASM Main
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all"
              style={{ width: `${mainAssemblies.length ? (readyMainCount / mainAssemblies.length) * 100 : 0}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Integrates all 3 Sub-Assemblies + 4 Bought-Out components.
          </p>
        </div>

        {/* Tier 3: Master Assembly */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1">
            <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
              <GitMerge className="w-4 h-4" />
              Tier 3: Master Unit
            </span>
            <span className="font-mono font-bold text-amber-600">{activeProject?.status === 'completed' ? '100%' : `${masterProgressPercent}%`} Ready</span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
            JCB-001 Complete
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all"
              style={{ width: `${activeProject?.status === 'completed' ? 100 : masterProgressPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Final hydraulic test, 220X cab integration & dispatch certification.
          </p>
        </div>
      </div>

      {/* 3. Interactive Hierarchy Tree (Visual Lanes) */}
      <div className="space-y-6">
        {/* MASTER UNIT INTEGRATION BAR */}
        {masterJob && (activeFilter === 'all' || activeFilter === 'master_assembly') && (
          <div className="p-5 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border-2 border-amber-300 dark:border-amber-700/60 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold shrink-0">
                  <GitMerge className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-mono">
                      MASTER DELIVERABLE
                    </span>
                    <span className="text-xs text-slate-500 font-mono">{masterJob.jobCardNo}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                    {activeProject?.code} · {masterJob.description}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Customer: <strong>JCB Earthmovers India Ltd</strong> · Target: 4 Complete Tracked Excavator Units.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => completeMasterProject(activeProject?.id || 'prj_jcb_001')}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>Complete Master Project Rollup</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MAIN ASSEMBLY (ARM-ASM) WITH BOUGHT-OUT & SUB-ASSEMBLIES */}
        {(activeFilter === 'all' || activeFilter === 'main_assembly' || activeFilter === 'sub_assembly' || activeFilter === 'bought_out') && (
          <div className="space-y-4">
            {mainAssemblies.map((mainAssy) => {
              const childSubs = subAssemblies.filter(
                (s) => s.parentAssemblyId === mainAssy.id || (mainAssy.childAssemblyIds && mainAssy.childAssemblyIds.includes(s.id))
              );
              const allSubsDone = childSubs.length > 0 && childSubs.every((s) => s.overallStatus === 'completed');
              const hasReworkInGroup = childSubs.some((s) => s.overallStatus === 'rework' || s.reworkTickets.some((t) => t.status === 'open'));
              const heroBoom = childSubs.find((s) => s.id === 'jc_boom_01');
              const openTicket = heroBoom?.reworkTickets.find((t) => t.status === 'open');

              return (
                <div
                  key={mainAssy.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5"
                >
                  {/* Main Assembly Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-mono">
                          MAIN ASSEMBLY
                        </span>
                        <span className="text-xs font-mono text-slate-500">{mainAssy.jobCardNo}</span>
                        {allSubsDone && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-mono">
                            All Child Sub-Assemblies Ready ✓
                          </span>
                        )}
                        {hasReworkInGroup && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 font-mono flex items-center gap-1">
                            <RotateCcw className="w-2.5 h-2.5" />
                            <span>Child Under Rework</span>
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                        {mainAssy.partNo} · <span className="font-normal text-slate-600 dark:text-slate-300">{mainAssy.description}</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Drawing: <strong>{mainAssy.drawingRef}</strong> · Assembly Gate: Combines Boom, Dipper, Bucket + Hydraulic Cylinders
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => completeMainAssembly(mainAssy.id)}
                        className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs flex items-center gap-1.5 ${
                          mainAssy.overallStatus === 'completed'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-blue-600 hover:bg-blue-500 text-white'
                        }`}
                      >
                        <CheckCheck className="w-4 h-4" />
                        <span>{mainAssy.overallStatus === 'completed' ? 'Arm Assembly Completed ✓' : 'Complete Arm Main Assembly'}</span>
                      </button>
                    </div>
                  </div>

                  {/* ACTIVE REWORK BANNER FOR DEMO HERO (BOOM-01) */}
                  {openTicket && (
                    <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border-2 border-purple-300 dark:border-purple-800 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200 shrink-0">
                          <RotateCcw className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-purple-900 dark:text-purple-200 uppercase font-mono">
                            DEMO STEP 9-11: QC Inspection Failed → Active Rework in Welding Bay
                          </div>
                          <p className="text-xs font-semibold text-purple-950 dark:text-purple-100 mt-0.5">
                            Defect: {openTicket.defectDetails}
                          </p>
                          <p className="text-[11px] text-purple-700 dark:text-purple-300 mt-0.5">
                            Fix: <strong>{openTicket.correctiveAction}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        <button
                          onClick={() => {
                            completeReworkExecution('jc_boom_01', openTicket.id, 3.5, 'Gouged out joint J-02 and deposited re-weld per WPS R-02.');
                            passQCReinspection('jc_boom_01', openTicket.id, 'Visual and ultrasonic inspection confirmed full penetration.');
                          }}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors cursor-pointer shadow-xs"
                          title="Simulate rework fix and QC pass in 1 click"
                        >
                          1-Click: Fix Rework & Pass QC Re-Inspection →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SUB-ASSEMBLIES FEEDING THIS MAIN ASSEMBLY */}
                  {(activeFilter === 'all' || activeFilter === 'sub_assembly') && (
                    <div className="space-y-3">
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono flex items-center justify-between">
                        <span>1. Fabricated Sub-Assemblies ({childSubs.length})</span>
                        <span className="text-[11px] text-slate-400 font-normal lowercase">follows assigned production route</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {childSubs.map((sub) => {
                          const currentOp = sub.operations.find((o) => o.stageId === sub.currentStageId) || sub.operations[0];
                          const isDone = sub.overallStatus === 'completed';
                          const isRework = sub.overallStatus === 'rework' || sub.reworkTickets.some((t) => t.status === 'open');

                          return (
                            <div
                              key={sub.id}
                              className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 text-xs transition-all ${
                                isDone
                                  ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                                  : isRework
                                  ? 'bg-purple-50/70 dark:bg-purple-950/30 border-purple-300 dark:border-purple-800 ring-1 ring-purple-400'
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                              }`}
                            >
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-bold font-mono text-slate-900 dark:text-slate-100">
                                    {sub.partNo}
                                  </span>
                                  {isDone ? (
                                    <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                                      DONE ✓
                                    </span>
                                  ) : isRework ? (
                                    <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 animate-pulse">
                                      REWORK ↺
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                                      {currentOp.stageName.split(' ')[0]}
                                    </span>
                                  )}
                                </div>

                                <p className="text-[11px] text-slate-500 line-clamp-2 mb-2">{sub.description}</p>

                                <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/60 font-mono text-[10px] space-y-1">
                                  <div className="flex items-center justify-between text-slate-500">
                                    <span>Drawing:</span>
                                    <strong className="text-slate-700 dark:text-slate-300">{sub.drawingRef}</strong>
                                  </div>
                                  <div className="flex items-center justify-between text-slate-500">
                                    <span>Station:</span>
                                    <strong className="text-blue-600">{currentOp.stageName}</strong>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                <button
                                  onClick={() => handleQuickAdvance(sub)}
                                  className="flex-1 py-1 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800/60 text-[11px] font-semibold cursor-pointer transition-colors"
                                >
                                  +1 Done
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveJobCardId(sub.id);
                                    setActiveStageId(sub.currentStageId);
                                    setCurrentTab('cutting');
                                    setUserRole('operator');
                                  }}
                                  className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-[11px] font-semibold cursor-pointer transition-colors"
                                >
                                  Console →
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* BOUGHT-OUT COMPONENTS CHECKLIST */}
                  {(activeFilter === 'all' || activeFilter === 'bought_out') && (
                    <div className="space-y-3 pt-2">
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono flex items-center justify-between">
                        <span>2. Bought-Out Components Checklist ({boughtOutItems.length})</span>
                        <span className="text-[11px] text-slate-400 font-normal lowercase">purchased items bypass fabrication</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {boughtOutItems.map((bop) => (
                          <div
                            key={bop.id}
                            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-xs flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold font-mono text-slate-900 dark:text-slate-100 truncate">
                                  {bop.code}
                                </span>
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold uppercase">
                                  {bop.status.replace('_', ' ')}
                                </span>
                              </div>
                              <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs mb-1 line-clamp-1">{bop.name}</p>
                              <p className="text-[10px] text-slate-500 line-clamp-2">{bop.specification}</p>
                            </div>

                            <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700/60 text-[10px] font-mono flex items-center justify-between text-slate-500">
                              <span>Supplier: <strong>{bop.supplier.split(' ')[0]}</strong></span>
                              <span>Req: <strong className="text-slate-900 dark:text-slate-100">{bop.requiredQty} {bop.uom}</strong></span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
