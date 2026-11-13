import React, { useState, useEffect } from 'react';
import { useERP } from '../context/ERPContext';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Layers,
  RotateCcw,
  FileText,
  X,
  Play,
  ShieldCheck,
  PackageCheck,
  Scissors,
  Flame,
  GitMerge,
  Truck,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  stepNumber?: number;
  onStepChange?: (step: number) => void;
}

export const SimulationStepModal: React.FC<Props> = ({
  isOpen,
  onClose,
  stepNumber,
  onStepChange,
}) => {
  const { demoStep, runDemoStep, setCurrentTab, setUserRole, setActiveStageId } = useERP();

  const [activeStep, setActiveStep] = useState<number>(stepNumber || demoStep || 1);

  useEffect(() => {
    if (stepNumber !== undefined) {
      setActiveStep(stepNumber);
    }
  }, [stepNumber]);

  useEffect(() => {
    if (demoStep) {
      setActiveStep(demoStep);
    }
  }, [demoStep]);

  if (!isOpen) return null;

  const STEP_DETAILS: Record<
    number,
    {
      title: string;
      actor: string;
      department: string;
      icon: React.ElementType;
      summary: string;
      changes: { label: string; value: string; isHighlight?: boolean }[];
      photoUrl?: string;
      destinationTab: string;
      destinationStageId?: string;
      destinationRole: any;
      nextStep?: number;
    }
  > = {
    1: {
      title: 'Project Overview & JCB-001 Excavator Structure',
      actor: 'Ananya Sharma (Project Manager)',
      department: 'Management & PMO',
      icon: Layers,
      summary: 'Opened Project Manager Dashboard for 4 Sets of JCB 220X Excavator packages. Target delivery: Dec 2026.',
      changes: [
        { label: 'Active Project', value: 'JCB-001 (4 Sets 220X Excavator)' },
        { label: 'Main Assembly', value: 'ARM-ASM (Monoboom + Dipper + Bucket)' },
        { label: 'Project Status', value: 'IN PRODUCTION' },
      ],
      destinationTab: 'dashboard',
      destinationRole: 'project_manager',
      nextStep: 2,
    },
    2: {
      title: '3-Tier Product Structure Hierarchy',
      actor: 'Ananya Sharma (Project Manager)',
      department: 'Management & PMO',
      icon: GitMerge,
      summary: 'Examined 3-tier hierarchy: Master JCB-001 → ARM-ASM → Boom, Dipper, Bucket + 4 Bought-Out items.',
      changes: [
        { label: 'Master Project', value: 'JCB-001' },
        { label: 'Main Assembly', value: 'ARM-ASM (Working Equipment)' },
        { label: 'Sub-Assemblies', value: 'BOOM-01, DIPPER-01, BUCKET-01' },
        { label: 'Bought-Out Items', value: 'Parker 160mm Cylinders, 40Cr Pins, Bolts, Hoses' },
      ],
      destinationTab: 'assembly_hierarchy',
      destinationRole: 'project_manager',
      nextStep: 3,
    },
    3: {
      title: 'Reusable Workflow Route Applied',
      actor: 'System Admin',
      department: 'Systems & Engineering',
      icon: GitMerge,
      summary: 'Applied "Standard Heavy Fabrication" template snapshot to Boom Sub-Assembly (BOOM-01).',
      changes: [
        { label: 'Source Template', value: 'Standard Heavy Fabrication (STD-FAB v2.1)' },
        { label: 'Target Job Card', value: 'BOOM-01 (Monoboom)' },
        { label: 'Route Stages', value: 'Cutting → Fit-Up → Welding → QC → Machining → Painting' },
        { label: 'Snapshot Isolation', value: 'Template copied locally without affecting master template' },
      ],
      destinationTab: 'workflow_builder',
      destinationRole: 'admin',
      nextStep: 4,
    },
    4: {
      title: 'Drawing Release Gate Signed Off',
      actor: 'Ananya Sharma (Project Manager)',
      department: 'Engineering / PMO',
      icon: FileText,
      summary: 'Project Manager signed off Rev A drawing gate (DWG-JCB-ARM-001 Rev A). Distributed to floor.',
      changes: [
        { label: 'Drawing Number', value: 'DWG-JCB-ARM-001 Rev A' },
        { label: 'Approval Status', value: 'RELEASED (Locked)', isHighlight: true },
        { label: 'ECO Reference', value: 'ECO-2026-081 Domex Steel Spec' },
        { label: 'Floor Unlocked', value: 'Cutting & Drilling Authorized' },
      ],
      destinationTab: 'drawing_release',
      destinationRole: 'project_manager',
      nextStep: 5,
    },
    5: {
      title: 'BOM Requirement & Stock Availability Checked',
      actor: 'Dinesh Patil (Stores Officer)',
      department: 'Stores & Material',
      icon: PackageCheck,
      summary: 'Stores verified 15,800 kg IS 2062 E350 high-tensile plate requirement against warehouse stock.',
      changes: [
        { label: 'Material Grade', value: 'IS 2062 E350 (25mm High Tensile)' },
        { label: 'Gross Requirement', value: '15,800 kg' },
        { label: 'Current Stock', value: '7,888 kg' },
        { label: 'Shortage Status', value: 'Partial Reservation (Heat Lots Allocated)' },
      ],
      destinationTab: 'bom_requirement',
      destinationRole: 'stores',
      nextStep: 6,
    },
    6: {
      title: 'Material Issued with Heat Number',
      actor: 'Dinesh Patil (Stores Officer)',
      department: 'Stores & Material',
      icon: PackageCheck,
      summary: 'Issued structural steel plate to Cutting Bay under Material Issue Slip #MIS-2026-0041.',
      changes: [
        { label: 'Issue Slip No', value: '#MIS-2026-0041', isHighlight: true },
        { label: 'Allocated Heat No', value: 'HT-2026-9921 / HT-2026-9922' },
        { label: 'Dispatched To', value: 'Cutting Bay (CNC Laser Table 1)' },
        { label: 'Job Card Status', value: 'Material Issued → In Progress' },
      ],
      destinationTab: 'material_issued',
      destinationRole: 'stores',
      nextStep: 7,
    },
    7: {
      title: 'Cutting Executed: 18.5kg Scrap & Photo Proof Logged',
      actor: 'Ganesh Shinde (CNC Operator)',
      department: 'Cutting Bay',
      icon: Scissors,
      summary: 'Operator profiled 4 boom blanks on Trumpf 12kW laser, weighed 18.5 kg scrap offcut, and uploaded spark photo.',
      photoUrl: '/public/assets/aistudio/image_7b8a5e34.png',
      changes: [
        { label: 'Machine', value: 'Trumpf TruLaser 5040 12kW' },
        { label: 'Output Produced', value: '4 Cut Blanks (100% Completed)', isHighlight: true },
        { label: 'Scrap Captured', value: '18.5 kg Offcut Plate' },
        { label: 'Photo Attached', value: 'Cutting Proof Photo Uploaded' },
      ],
      destinationTab: 'cutting',
      destinationStageId: 'cutting',
      destinationRole: 'operator',
      nextStep: 8,
    },
    8: {
      title: 'Fit-Up & Robotic Welding Completed',
      actor: 'Satish Kamble & Mohan Lal',
      department: 'Fabrication & Welding',
      icon: Flame,
      summary: 'Boom box aligned in heavy platen jig; robotic tandem cell completed full-penetration seams per WPS-JCB-E350-01.',
      photoUrl: '/public/assets/aistudio/image_75b0e7a9.png',
      changes: [
        { label: 'Fit-up Status', value: 'Tacked on Platen Bed (Completed)' },
        { label: 'Welding Machine', value: 'Panasonic 6-Axis Robotic Tandem Cell' },
        { label: 'WPS Spec', value: 'WPS-JCB-E350-01 (Multi-pass GMAW)' },
        { label: 'Welder Stamp', value: 'WPQ-W04 Hard-Stamped' },
      ],
      destinationTab: 'welding',
      destinationStageId: 'welding',
      destinationRole: 'operator',
      nextStep: 9,
    },
    9: {
      title: 'QC Inspection FAIL: Root Gap 4.5mm > 2.5mm Spec',
      actor: 'Vikram Singh (ASNT Level II Inspector)',
      department: 'Quality Assurance',
      icon: AlertTriangle,
      summary: 'Inspector measured 4.5mm root gap on Joint J-02 (> 2.5mm WPS limit). Flagged defect, attached photo, and routed rework.',
      photoUrl: '/public/assets/aistudio/image_f341b204.png',
      changes: [
        { label: 'Inspection Result', value: 'FAIL / REJECT', isHighlight: true },
        { label: 'Measured Gap', value: '4.5 mm (Nominal: 2.0 ± 0.5 mm)' },
        { label: 'Rework Ticket', value: '#RW-2026-0012 Generated' },
        { label: 'Loopback Target', value: 'Routed Back to Welding Bay 3' },
      ],
      destinationTab: 'inspection',
      destinationStageId: 'inspection',
      destinationRole: 'quality',
      nextStep: 10,
    },
    10: {
      title: 'Welding Bay Rework Executed',
      actor: 'Mohan Lal (Welder)',
      department: 'Welding Bay',
      icon: RotateCcw,
      summary: 'Welder received rework ticket #RW-2026-0012, carbon-arc gouged defective root, re-beveled to 30°, and re-welded.',
      changes: [
        { label: 'Rework Ticket', value: '#RW-2026-0012' },
        { label: 'Corrective Action', value: 'Gouged, ground, preheated to 120°C, and re-welded' },
        { label: 'Labor Hours Logged', value: '1.5 Hours Rework' },
        { label: 'Rework Status', value: 'Repair Completed → Awaiting Re-inspection', isHighlight: true },
      ],
      destinationTab: 'welding',
      destinationStageId: 'welding',
      destinationRole: 'operator',
      nextStep: 11,
    },
    11: {
      title: 'QC Passed Re-Inspection (Green Tag Released)',
      actor: 'Vikram Singh (ASNT Level II Inspector)',
      department: 'Quality Assurance',
      icon: ShieldCheck,
      summary: 'Inspector re-tested repaired joint with ultrasonic (UT) and magnetic particle (MPI). Passed 100% root fusion.',
      changes: [
        { label: 'Re-Inspection Result', value: 'PASSED (Green Tag Issued)', isHighlight: true },
        { label: 'NDT Method', value: 'Ultrasonic Testing (AWS D1.1 Class A)' },
        { label: 'Rework Ticket', value: 'Closed & Cleared' },
        { label: 'Downstream Gate', value: 'Unlocked for Machining & Painting' },
      ],
      destinationTab: 'inspection',
      destinationStageId: 'inspection',
      destinationRole: 'quality',
      nextStep: 12,
    },
    12: {
      title: 'Boom Sub-Assembly (BOOM-01) Completed',
      actor: 'Ananya Sharma (Project Manager)',
      department: 'Fabrication Management',
      icon: CheckCircle2,
      summary: 'All operations on Monoboom BOOM-01 completed. Sub-assembly cleared for Main Assembly integration.',
      changes: [
        { label: 'Sub-Assembly', value: 'BOOM-01 (Monoboom)' },
        { label: 'Overall Status', value: 'COMPLETED (4 Nos)', isHighlight: true },
        { label: 'Integration Readiness', value: 'Ready for Arm Main Assembly' },
      ],
      destinationTab: 'assembly_hierarchy',
      destinationRole: 'project_manager',
      nextStep: 13,
    },
    13: {
      title: 'ARM-ASM Main Assembly & Master JCB-001 Rollup Complete',
      actor: 'Ananya Sharma (Project Manager)',
      department: 'Project Management & Client Delivery',
      icon: Truck,
      summary: 'Verified 4 bought-out parts (Parker cylinders, 40Cr pins, bolts, hoses). Completed ARM-ASM and JCB-001 Master Project!',
      changes: [
        { label: 'Main Assembly', value: 'ARM-ASM Completed' },
        { label: 'Bought-Out Check', value: 'All 4 Parts Verified & Torque-Checked' },
        { label: 'Master Project', value: 'JCB-001 220X (4 Sets) 100% DELIVERED', isHighlight: true },
        { label: 'Audit Dossier', value: 'Full Immutable Traceability Timeline Generated' },
      ],
      destinationTab: 'traceability',
      destinationRole: 'project_manager',
    },
  };

  const current = STEP_DETAILS[activeStep] || STEP_DETAILS[1];
  const Icon = current.icon;

  const handleOpenStation = () => {
    setUserRole(current.destinationRole);
    if (current.destinationStageId) {
      setActiveStageId(current.destinationStageId);
    }
    setCurrentTab(current.destinationTab as any);
    onClose();
  };

  const handleNextStep = () => {
    if (current.nextStep) {
      runDemoStep(current.nextStep);
      setActiveStep(current.nextStep);
      if (onStepChange) {
        onStepChange(current.nextStep);
      }
    }
  };

  const handlePrevStep = () => {
    const prev = activeStep - 1;
    if (prev >= 1) {
      runDemoStep(prev);
      setActiveStep(prev);
      if (onStepChange) {
        onStepChange(prev);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-black font-mono flex items-center justify-center text-xs shadow-xs">
              0{activeStep}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Simulation Applied
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-xs font-mono text-slate-500">Step {activeStep} of 13</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                {current.title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Actor & Department Banner */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 font-mono">
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Action Owner / Role</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{current.actor}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase block">Department</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{current.department}</span>
            </div>
          </div>

          {/* Action Summary */}
          <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 text-slate-700 dark:text-slate-300 leading-relaxed">
            <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1">
              What Just Happened:
            </span>
            {current.summary}
          </div>

          {/* Real State Mutations Made */}
          <div>
            <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide font-mono block mb-2">
              Live Shopfloor State Updates:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {current.changes.map((ch, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border text-xs font-mono ${
                    ch.isHighlight
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 font-bold text-amber-900 dark:text-amber-200'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="text-[10px] text-slate-400 block mb-0.5">{ch.label}:</span>
                  <span className="block truncate">{ch.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Photographic Evidence Attachment if applicable */}
          {current.photoUrl && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
                Attached Shopfloor Proof Photo
              </span>
              <div className="h-40 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950 flex items-center justify-center">
                <img
                  src={current.photoUrl}
                  alt={current.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              Close
            </button>

            {activeStep > 1 && (
              <button
                type="button"
                onClick={handlePrevStep}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                title="Go back to previous step"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Prev (0{activeStep - 1})</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenStation}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 text-white transition-colors cursor-pointer shadow-xs"
            >
              <span>View Station Console</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            {current.nextStep ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 transition-all cursor-pointer shadow-xs"
              >
                <span>Next Step (0{current.nextStep})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                All 13 Steps Completed!
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
