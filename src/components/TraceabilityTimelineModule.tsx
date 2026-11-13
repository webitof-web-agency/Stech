import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import {
  FileText,
  PackageCheck,
  Scissors,
  Hammer,
  Flame,
  CheckCircle2,
  RotateCcw,
  Layers,
  Truck,
  ShieldCheck,
  Clock,
  ExternalLink,
  Filter,
  Image as ImageIcon,
  Check,
  AlertTriangle,
} from 'lucide-react';

export const TraceabilityTimelineModule: React.FC = () => {
  const { auditLogs, jobCards, activeProject, setCurrentTab, setActiveJobCardId, setActiveStageId } = useERP();
  const [filterType, setFilterType] = useState<string>('all');

  const filteredLogs = auditLogs.filter((log) => {
    if (filterType === 'all') return true;
    return log.entityType === filterType;
  });

  const boomJob = jobCards.find((j) => j.id === 'jc_boom_01') || jobCards[0];
  const armMainJob = jobCards.find((j) => j.id === 'jc_arm_main') || jobCards[1];

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-mono">
              Audit & Traceability
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Deliverable: {activeProject?.code} ({activeProject?.name})
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            Complete Production & Evidence Timeline
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable chain of custody: from CAD release and material heat allocation through cutting scrap, robotic welding, QC inspection failure, corrective rework, and assembly roll-up.
          </p>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-mono">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              filterType === 'all'
                ? 'bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            All Events ({auditLogs.length})
          </button>
          <button
            onClick={() => setFilterType('drawing')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              filterType === 'drawing'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Drawings
          </button>
          <button
            onClick={() => setFilterType('material')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              filterType === 'material'
                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Material
          </button>
          <button
            onClick={() => setFilterType('inspection')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              filterType === 'inspection'
                ? 'bg-purple-600 text-white font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            QC & Rework
          </button>
        </div>
      </div>

      {/* 2. End-to-End Product Life Chain Summary Card */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono mb-3">
          JCB Excavator Arm Fabrication Hierarchy Status
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Sub-Assembly */}
          <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
            <span className="text-[10px] font-mono text-purple-600 font-bold block">SUB-ASSEMBLY (HERO)</span>
            <div className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">{boomJob.partNo}</div>
            <div className="text-[11px] text-slate-500 line-clamp-1">{boomJob.description}</div>
            <div className="mt-2 text-[11px] font-mono flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span>Drawing: <strong>{boomJob.drawingRef}</strong></span>
              <span className="text-purple-600 font-bold">Rework in Welding</span>
            </div>
          </div>

          {/* Main Assembly */}
          <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
            <span className="text-[10px] font-mono text-blue-600 font-bold block">MAIN ASSEMBLY</span>
            <div className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">{armMainJob.partNo}</div>
            <div className="text-[11px] text-slate-500 line-clamp-1">Integrates Boom, Dipper, Bucket + Cylinders</div>
            <div className="mt-2 text-[11px] font-mono flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span>Child Subs: <strong>3 Fabricated</strong></span>
              <span>Bought-Out: <strong>4 In Stock</strong></span>
            </div>
          </div>

          {/* Master Project */}
          <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
            <span className="text-[10px] font-mono text-amber-600 font-bold block">MASTER DELIVERABLE</span>
            <div className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">{activeProject?.code}</div>
            <div className="text-[11px] text-slate-500 line-clamp-1">JCB Earthmovers India · 4 Excavator Sets</div>
            <div className="mt-2 text-[11px] font-mono flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span>Status: <strong className="text-blue-600">In Production</strong></span>
              <span>Target: <strong>Dec 2026</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Chronological Audit Log Timeline */}
      <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-200 dark:border-slate-800 space-y-6 my-4">
        {filteredLogs.map((log) => {
          const isAlert = log.status === 'alert';
          const isWarning = log.status === 'warning';

          return (
            <div key={log.id} className="relative group">
              {/* Timeline Node Dot */}
              <div
                className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                  isAlert
                    ? 'bg-purple-600 border-purple-300 text-white animate-pulse'
                    : isWarning
                    ? 'bg-amber-500 border-amber-300 text-slate-950'
                    : 'bg-emerald-600 border-emerald-300 text-white'
                }`}
              >
                {isAlert ? '!' : isWarning ? '⚡' : '✓'}
              </div>

              {/* Event Card */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                      {log.action}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase">
                      {log.entityType} · {log.entityCode}
                    </span>
                  </div>

                  <span className="text-slate-400 font-mono text-[11px]">
                    {log.timestamp} · {log.actorName} ({log.department})
                  </span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                  {log.summary}
                </p>

                {/* Evidence Proof Card if attached */}
                {log.proofUrl && (
                  <div className="mt-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={log.proofUrl}
                        alt="Proof thumbnail"
                        className="w-12 h-12 rounded-lg object-cover border border-slate-300 dark:border-slate-700 shrink-0"
                      />
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 block font-bold">ATTACHED PROOF EVIDENCE</span>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {log.action.includes('FAIL') ? 'Defect Evidence Photo (Root Gap Exceeded)' : 'Workstation Photographic Evidence'}
                        </span>
                      </div>
                    </div>

                    <a
                      href={log.proofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 transition-colors self-end sm:self-auto flex items-center gap-1 cursor-pointer"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>View Full Resolution</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
