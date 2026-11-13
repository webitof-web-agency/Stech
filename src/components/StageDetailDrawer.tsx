import React from 'react';
import { StageDetail } from './StageInspectorCard';
import {
  X,
  FileText,
  ShieldCheck,
  CheckCircle2,
  PackageCheck,
  ArrowRight,
  Layers,
  ExternalLink,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  stage: StageDetail;
  onNavigateToStation: () => void;
}

export const StageDetailDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  stage,
  onNavigateToStation,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-mono font-black flex items-center justify-center text-xs">
                0{stage.stepNumber}
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                  Technical Specifications Drawer
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                  {stage.title}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
            {/* Department & Operational Ownership */}
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Department:</span>
                <strong className="text-slate-900 dark:text-slate-100">{stage.department}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Target Role:</span>
                <strong className="text-slate-900 dark:text-slate-100">
                  {stage.targetRole.replace('_', ' ').toUpperCase()}
                </strong>
              </div>
            </div>

            {/* Input Data Received */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <PackageCheck className="w-3.5 h-3.5 text-blue-500" />
                <span>Input Dependencies & Inbound Logistics</span>
              </h4>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 leading-relaxed space-y-2">
                <p>
                  <strong>Source:</strong> {stage.incomingData.origin}
                </p>
                <p>{stage.incomingData.description}</p>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60">
                  <span className="text-[10px] font-mono text-slate-400 block mb-1">
                    Controlled Documents:
                  </span>
                  {stage.incomingData.referenceDocs.map((doc, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-mono">
                      <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Station Action Specifications */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                <span>Station Quality & Process Requirements</span>
              </h4>
              <div className="space-y-2">
                {stage.actions.map((act, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <span className="font-bold text-slate-900 dark:text-slate-100 block mb-0.5">
                      {act.label}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 text-[11px] block leading-relaxed">
                      {act.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Output Deliverables Produced */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Downstream Hand-Off Deliverables</span>
              </h4>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 leading-relaxed space-y-2">
                <p>
                  <strong>Destination:</strong> {stage.outgoingData.destination}
                </p>
                <p>{stage.outgoingData.description}</p>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60">
                  <span className="text-[10px] font-mono text-slate-400 block mb-1">
                    Attached Artifacts:
                  </span>
                  {stage.outgoingData.artifactsProduced.map((art, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-mono">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span>{art}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onNavigateToStation();
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors cursor-pointer shadow-xs"
            >
              <span>Go to Station Console</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
