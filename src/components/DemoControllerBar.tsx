import React, { useState, useEffect } from 'react';
import { useERP } from '../context/ERPContext';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  GitMerge,
  ChevronDown,
  ChevronUp,
  Database,
  Layers,
  CheckCircle2,
  Play,
} from 'lucide-react';

import { SimulationStepModal } from './SimulationStepModal';

export const DemoControllerBar: React.FC = () => {
  const {
    demoStep,
    runDemoStep,
    isDemoMode,
    toggleDemoMode,
    resetToDemoData,
    setCurrentTab,
  } = useERP();

  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [simulatedToast, setSimulatedToast] = useState<string | null>(null);
  const [isSimModalOpen, setIsSimModalOpen] = useState<boolean>(false);
  const [modalStepNumber, setModalStepNumber] = useState<number>(demoStep);

  useEffect(() => {
    setModalStepNumber(demoStep);
  }, [demoStep]);

  const DEMO_STEPS = [
    { step: 1, title: 'Project Overview & ARM-ASM Structure', role: 'Project Manager' },
    { step: 2, title: 'Define Product Structure Hierarchy', role: 'Project Manager' },
    { step: 3, title: 'Assign Route Template Snapshot', role: 'System Admin' },
    { step: 4, title: 'Release Drawing Rev A Gate', role: 'Project Manager' },
    { step: 5, title: 'BOM Requirement Review (15.8t)', role: 'Stores' },
    { step: 6, title: 'Issue Material Slip (Heat HT-9921)', role: 'Stores' },
    { step: 7, title: 'Cutting with 18.5kg Scrap & Photo', role: 'Operator' },
    { step: 8, title: 'Fit-up & Full Welding Complete', role: 'Operator' },
    { step: 9, title: 'QC Failed: Root Gap 4.5mm > 2.5mm', role: 'Quality' },
    { step: 10, title: 'Welding Bay Rework Executed', role: 'Operator' },
    { step: 11, title: 'QC Re-inspection Passed (Green Tag)', role: 'Quality' },
    { step: 12, title: 'Boom Sub-Assembly Completed', role: 'Project Manager' },
    { step: 13, title: 'ARM-ASM Main Assembly Completed', role: 'Project Manager' },
  ];

  const currentStepObj = DEMO_STEPS[demoStep - 1] || DEMO_STEPS[0];

  const handleSimulate = (step: number, openModal = true) => {
    runDemoStep(step);
    setModalStepNumber(step);
    const stepInfo = DEMO_STEPS.find((s) => s.step === step);
    setSimulatedToast(`✓ Step ${step}: ${stepInfo?.title}`);
    if (openModal) {
      setIsSimModalOpen(true);
    }
  };

  const handleNext = () => {
    if (demoStep < 13) {
      handleSimulate(demoStep + 1, true);
    }
  };

  const handlePrev = () => {
    if (demoStep > 1) {
      handleSimulate(demoStep - 1, true);
    }
  };

  return (
    <div className="fixed bottom-3 right-3 lg:bottom-4 lg:right-6 z-40 max-w-[calc(100vw-1.5rem)] sm:max-w-xl transition-all">
      <div className="bg-slate-900/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-100 rounded-xl border border-slate-700/80 shadow-2xl overflow-hidden">
        {/* Top Mini Header Strip */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800/90 border-b border-slate-700/60 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-bold tracking-tight font-mono text-[11px] text-amber-400">
              DEMO CONTROLLER
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-[11px] text-slate-300 font-mono truncate max-w-[140px] sm:max-w-xs">
              JCB-001 Flow Runner
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Direct Flow Map Jump */}
            <button
              type="button"
              onClick={() => setCurrentTab('flow_map')}
              className="text-[11px] px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors flex items-center gap-1 cursor-pointer font-medium"
              title="Open Interactive Lifecycle Flow Map"
            >
              <GitMerge className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">Flow Map</span>
            </button>

            {/* Collapse / Expand Toggle */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
              title={isExpanded ? 'Collapse controller' : 'Expand controller'}
              aria-label="Toggle controller"
            >
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Expanded Controller Body */}
        {isExpanded && (
          <div className="p-3 space-y-2.5 text-xs">
            {/* Simulation Feedback Toast */}
            {simulatedToast && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/20 border border-amber-500/50 text-amber-300 text-[11px] font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">{simulatedToast}</span>
              </div>
            )}

            {/* Step Navigation Row */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={demoStep <= 1}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-200 transition-colors cursor-pointer"
                  title="Previous Step"
                  aria-label="Previous step"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={demoStep >= 13}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-200 transition-colors cursor-pointer"
                  title="Next Step"
                  aria-label="Next step"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Step Title Dropdown / Selector */}
              <div className="flex-1 min-w-0 px-2">
                <select
                  value={demoStep}
                  onChange={(e) => handleSimulate(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500 cursor-pointer truncate"
                  aria-label="Jump to demo step"
                >
                  {DEMO_STEPS.map((s) => (
                    <option key={s.step} value={s.step}>
                      Step {s.step}/13: {s.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fast Execute Step Button */}
              <button
                type="button"
                onClick={() => handleSimulate(demoStep, true)}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 transition-all cursor-pointer flex items-center gap-1 shrink-0 shadow-sm"
                title="Execute Current Step Action & View Explanation"
              >
                <Play className="w-3 h-3 fill-current" />
                <span className="hidden sm:inline">Simulate</span>
              </button>
            </div>

            {/* Step Subtitle / Role indicator & Explain Step */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 border-t border-slate-800 pt-2">
              <div className="flex items-center gap-2 truncate">
                <span className="truncate">
                  Role: <strong className="text-slate-200 font-mono">{currentStepObj.role}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setModalStepNumber(demoStep);
                    setIsSimModalOpen(true);
                  }}
                  className="text-[10px] text-amber-400 hover:text-amber-300 underline font-mono cursor-pointer shrink-0"
                >
                  What changes?
                </button>
              </div>

              {/* Demo Mode Toggle & Data Reset */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => toggleDemoMode(!isDemoMode)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                    isDemoMode
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                  }`}
                  title="Toggle between rich JCB demo data and clean empty floor"
                >
                  Demo Mode: {isDemoMode ? 'ON' : 'OFF'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Reset prototype data to original JCB demo values?')) {
                      resetToDemoData();
                    }
                  }}
                  className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Reset demo data to initial factory state"
                  aria-label="Reset demo data"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rich Interactive Simulation Step Modal */}
      <SimulationStepModal
        isOpen={isSimModalOpen}
        onClose={() => setIsSimModalOpen(false)}
        stepNumber={modalStepNumber}
        onStepChange={(newStep) => setModalStepNumber(newStep)}
      />
    </div>
  );
};
