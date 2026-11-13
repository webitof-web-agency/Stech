import React from 'react';
import { useERP } from '../context/ERPContext';
import {
  Play,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Sparkles,
  UserCheck,
  X,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const DemoTourBar: React.FC = () => {
  const { demoStep, runDemoStep, isDemoTourOpen, setIsDemoTourOpen, userRole } = useERP();

  const demoSteps = [
    {
      step: 1,
      title: 'Open JCB-001 as Project Manager',
      role: 'Project Manager',
      desc: 'PM opens JCB-001 tracked excavator project with customer & schedule targets.',
      tab: 'dashboard',
    },
    {
      step: 2,
      title: 'Define Product Hierarchy',
      role: 'Project Manager',
      desc: 'Master Excavator → Main Arm Assembly → Sub-Assemblies (Boom, Dipper, Bucket) + Bought-Out Cylinders/Pins.',
      tab: 'assembly_hierarchy',
    },
    {
      step: 3,
      title: 'Assign Reusable Route Snapshot',
      role: 'Project Manager',
      desc: 'Apply Standard Fabrication template to Boom-01 and customize local stage without altering master template.',
      tab: 'workflow_builder',
    },
    {
      step: 4,
      title: 'Release Drawing Rev A',
      role: 'Project Manager / Design',
      desc: 'Design uploads JCB-ARM-BOOM-001 Rev A with Domex specifications; PM releases drawing for production.',
      tab: 'drawing_release',
    },
    {
      step: 5,
      title: 'Review BOM & Material Need',
      role: 'Stores / Material',
      desc: 'System checks stock for Domex 25mm plate (Heat HT-DOMEX-9924-A) and confirms availability.',
      tab: 'bom_requirement',
    },
    {
      step: 6,
      title: 'Issue Material to Floor',
      role: 'Stores / Material',
      desc: 'Stores issues raw steel under Slip #ISS-2026-JCB-004, activating Cutting & Drilling station.',
      tab: 'material_issued',
    },
    {
      step: 7,
      title: 'Execute Cutting (Capture Scrap & Proof)',
      role: 'Cutting Operator',
      desc: 'Operator profiles 4 boom blanks on 12kW laser, records 18.5kg scrap, and attaches cutting spark proof photo.',
      tab: 'cutting',
    },
    {
      step: 8,
      title: 'Fit-up & Robotic Welding',
      role: 'Welding Operator',
      desc: 'Fit-up clamps boom jig bed; robotic tandem cell completes multi-pass high-strength seams with proof.',
      tab: 'welding',
    },
    {
      step: 9,
      title: 'QC Inspection FAIL (Defect Found)',
      role: 'QC Inspector',
      desc: 'Inspector measures 4.5mm root gap on Joint J-02 (> 2.5mm tolerance), uploads photo evidence, and routes rework to Welding.',
      tab: 'inspection',
    },
    {
      step: 10,
      title: 'Welding Bay Executes Rework',
      role: 'Welding Operator',
      desc: 'Welding bay receives additive rework job, gouges defective pass, re-welds per WPS R-02, and returns to QC queue.',
      tab: 'welding',
    },
    {
      step: 11,
      title: 'QC Passes Re-Inspection',
      role: 'QC Inspector',
      desc: 'Inspector verifies repaired joint with ultrasonic test, marks PASS, and unlocks downstream Machining & Painting.',
      tab: 'inspection',
    },
    {
      step: 12,
      title: 'Complete Sub-Assembly (Boom-01)',
      role: 'Project Manager',
      desc: 'Line boring and painting finish; Boom-01 completes and is locked into auditable state.',
      tab: 'assembly_hierarchy',
    },
    {
      step: 13,
      title: 'Main Assembly Rollup → Master Complete',
      role: 'Project Manager',
      desc: 'Boom, Dipper, Bucket & Parker cylinders join into Arm Assembly, completing master JCB-001 deliverable!',
      tab: 'traceability',
    },
  ];

  const currentStepObj = demoSteps.find((s) => s.step === demoStep) || demoSteps[0];

  if (!isDemoTourOpen) {
    return (
      <div className="bg-slate-900 border-b border-amber-500/40 px-4 py-1.5 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-semibold text-amber-300 font-mono">STECH DEMO SCRIPT</span>
          <span className="text-slate-400">·</span>
          <span>Step {demoStep} of 13: <strong>{currentStepObj.title}</strong></span>
        </div>
        <button
          onClick={() => setIsDemoTourOpen(true)}
          className="text-xs px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-colors cursor-pointer font-medium"
        >
          Expand Guided Tour
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b-2 border-amber-500 text-white shadow-md z-30">
      <div className="max-w-7xl mx-auto px-4 py-2.5">
        {/* Top bar with Step Counter and Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/60 pb-2">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-amber-500 text-slate-950 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-bold tracking-wider uppercase font-mono text-amber-400">
              Interactive Client Demo Script (JCB Excavator Fabrication)
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200">
              Step {demoStep} / 13
            </span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Quick Prev / Next buttons */}
            <button
              onClick={() => runDemoStep(Math.max(1, demoStep - 1))}
              disabled={demoStep === 1}
              className="px-2 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 border border-slate-700 transition-colors cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>

            <button
              onClick={() => runDemoStep(Math.min(13, demoStep + 1))}
              disabled={demoStep === 13}
              className="px-3 py-1 text-xs font-bold rounded bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <span>Next Step</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsDemoTourOpen(false)}
              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
              title="Minimize Demo Tour"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Current Step Description & Action CTA */}
        <div className="py-2 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/60 text-amber-300 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              0{demoStep}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-slate-100">
                  {currentStepObj.title}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/60 font-semibold">
                  View As: {currentStepObj.role}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                {currentStepObj.desc}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
            <button
              onClick={() => runDemoStep(demoStep)}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Simulate / View Step</span>
            </button>
          </div>
        </div>

        {/* 13 Step Clickable Pill Navigation */}
        <div className="flex items-center gap-1 overflow-x-auto pt-1 pb-0.5">
          {demoSteps.map((s) => {
            const isCurrent = s.step === demoStep;
            const isPast = s.step < demoStep;
            return (
              <button
                key={s.step}
                onClick={() => runDemoStep(s.step)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                  isCurrent
                    ? 'bg-amber-500 text-slate-950 font-bold ring-2 ring-amber-300'
                    : isPast
                    ? 'bg-slate-800 text-emerald-400 hover:bg-slate-700 border border-emerald-900'
                    : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700 border border-slate-700/60'
                }`}
                title={`Step ${s.step}: ${s.title}`}
              >
                <span>{s.step}.</span>
                <span className="truncate max-w-[80px] sm:max-w-[110px]">{s.title.split(' ')[0]} {s.title.split(' ')[1] || ''}</span>
                {isPast && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
