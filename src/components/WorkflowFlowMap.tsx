import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { StageInspectorCard, StageDetail } from './StageInspectorCard';
import {
  FileText,
  PackageCheck,
  Scissors,
  Hammer,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Cog,
  Paintbrush,
  Boxes,
  Truck,
  RotateCcw,
  Sparkles,
  GitMerge,
  Info,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface Props {
  onOpenTraveler: () => void;
  onOpenReworkModal: (fromStageId?: string) => void;
  onOpenQCModal: (stageId: string) => void;
}

export const WorkflowFlowMap: React.FC<Props> = ({
  onOpenTraveler,
  onOpenReworkModal,
  onOpenQCModal,
}) => {
  const { activeJobCard, activeProject, setCurrentTab, setUserRole, runDemoStep } = useERP();

  const [selectedStageId, setSelectedStageId] = useState<string>('welding');

  // Complete end-to-end fabrication lifecycle stages with real data handoffs
  const FLOW_STAGES: StageDetail[] = [
    {
      id: 'drawing_release',
      stepNumber: 1,
      title: 'Drawing Release Gate',
      department: 'ENG / Design',
      targetRole: 'project_manager',
      targetTab: 'drawing_release',
      status: 'completed',
      incomingData: {
        origin: 'Engineering CAD Team',
        description: '3D SolidWorks CAD model, GD&T tolerance specifications, and engineering change order.',
        referenceDocs: ['DWG-JCB-ARM-001 Rev A', 'ECO-2026-081 Approval Slip'],
      },
      actions: [
        {
          label: 'Open Drawing Register & CAD',
          description: 'Review technical drawing revisions and dimensional notes.',
          icon: FileText,
          actionType: 'navigate',
        },
        {
          label: 'Simulate Step 2: PM Release Gate',
          description: 'Sign off Rev A approval and unlock floor release.',
          icon: Sparkles,
          actionType: 'quick_trigger',
          badge: 'Demo Step 2',
        },
      ],
      outgoingData: {
        destination: 'Stores & Shopfloor Workstations',
        description: 'Locked, released drawing version officially published for BOM extraction and floor fabrication.',
        artifactsProduced: ['Released Drawing PDF with QR Stamp', 'Engineering Baseline Lock'],
      },
    },
    {
      id: 'bom_material',
      stepNumber: 2,
      title: 'BOM & Material Reservation',
      department: 'Stores / Material',
      targetRole: 'stores',
      targetTab: 'material_issued',
      status: 'completed',
      incomingData: {
        origin: 'Design BOM & Warehouse Stock Ledger',
        description: 'Gross steel need (15,800 kg IS 2062 E350 high tensile plate) matched against warehouse heat lots.',
        referenceDocs: ['BOM-BCM-SF-001 Rev B', 'Mill Test Certificate #MTC-9921'],
      },
      actions: [
        {
          label: 'Open Material Store Module',
          description: 'Inspect current warehouse stock, reserved lots, and shortages.',
          icon: PackageCheck,
          actionType: 'navigate',
        },
        {
          label: 'Simulate Step 6: Issue Material Slip',
          description: 'Stamp Heat Number HT-2026-9921 and issue plates to floor.',
          icon: Sparkles,
          actionType: 'quick_trigger',
          badge: 'Demo Step 6',
        },
      ],
      outgoingData: {
        destination: 'Cutting & Profiling Bay',
        description: 'Raw plates transferred with physical heat stamp markings and digital store reservation receipt.',
        artifactsProduced: ['Material Issue Slip #MIS-2026-0041', 'Heat Traceability Tag HT-2026-9921'],
      },
    },
    {
      id: 'cutting',
      stepNumber: 3,
      title: 'CNC Cutting & Drilling',
      department: 'Cutting Bay',
      targetRole: 'operator',
      targetTab: 'cutting',
      status: 'completed',
      incomingData: {
        origin: 'Stores Transfer & CNC Programming',
        description: 'Heat-stamped 25mm structural steel plate and optimized DXF plasma nesting layouts.',
        referenceDocs: ['Nesting Job #NST-BOOM-01', 'Heat Lot HT-2026-9921'],
      },
      actions: [
        {
          label: 'Open Cutting Workstation',
          description: 'Track CNC spindle hours, feed rates, and gas pressure.',
          icon: Scissors,
          actionType: 'navigate',
        },
        {
          label: 'Simulate Step 7: Log 18.5kg Scrap',
          description: 'Capture offcut scrap weight and upload photo proof.',
          icon: Sparkles,
          actionType: 'quick_trigger',
          badge: 'Demo Step 7',
        },
      ],
      outgoingData: {
        destination: 'Fit-Up & Tack Bay',
        description: 'Beveled web plates and top/bottom flanges profile-cut within ±0.8mm tolerance.',
        artifactsProduced: ['Machined Plate Set (8 Pcs)', 'Scrap Reconciliation Record (18.5 kg)'],
      },
    },
    {
      id: 'fitup',
      stepNumber: 4,
      title: 'Fit-Up & Tack Assembly',
      department: 'Fabrication Floor',
      targetRole: 'operator',
      targetTab: 'fitup',
      status: 'completed',
      incomingData: {
        origin: 'Cutting Bay & Platen Fixture',
        description: 'Profile-cut plates, internal box stiffeners, and heavy assembly platen clamp jig.',
        referenceDocs: ['Fit-up Checklist #CHK-FIT-08', 'Weld Joint Geometry Spec'],
      },
      actions: [
        {
          label: 'Open Fit-Up Console',
          description: 'Check platen clamping, root alignment, and tack spacing.',
          icon: Hammer,
          actionType: 'navigate',
        },
        {
          label: 'Print Job Traveler Slip',
          description: 'Generate physical paper traveler with barcode tracking.',
          icon: FileText,
          actionType: 'dialog',
          dialogType: 'traveler',
        },
      ],
      outgoingData: {
        destination: 'Welding Bay',
        description: 'Rigidly tacked boom box assembly with measured 2.0mm root gap ready for multi-pass welding.',
        artifactsProduced: ['Tack Inspection Sign-off', 'WIP Box Assembly'],
      },
    },
    {
      id: 'welding',
      stepNumber: 5,
      title: 'Welding Bay (WPS-E350)',
      department: 'Welding Bay',
      targetRole: 'operator',
      targetTab: 'welding',
      status: 'in_progress',
      incomingData: {
        origin: 'Fit-Up Platen & Welding Consumables',
        description: 'Tacked boom assembly, ESAB SAW 4.0mm wire, and WPS-JCB-E350-01 qualified welding procedure.',
        referenceDocs: ['WPS-JCB-E350-01', 'Welder Qualification WPQ-W04'],
      },
      actions: [
        {
          label: 'Open Welding Console',
          description: 'Log arc hours, pre-heat temperature (120°C), and interpass temps.',
          icon: Flame,
          actionType: 'navigate',
        },
        {
          label: 'Simulate Step 10: Rework Repair',
          description: 'Execute grinding, re-beveling, and re-welding per WPS.',
          icon: RotateCcw,
          actionType: 'quick_trigger',
          badge: 'Demo Step 10',
        },
      ],
      outgoingData: {
        destination: 'In-Process QC Inspection',
        description: 'Full-penetration longitudinal welds completed with welder identification hard-stamped.',
        artifactsProduced: ['Welded Monoboom Assembly', 'Weld Arc Hour Log (6.5 hrs)'],
      },
    },
    {
      id: 'inspection',
      stepNumber: 6,
      title: 'In-Process QC & Rework Loop',
      department: 'Quality Assurance',
      targetRole: 'quality',
      targetTab: 'inspection',
      status: 'rework',
      incomingData: {
        origin: 'Welding Bay',
        description: 'Completed welded structure submitted for ASNT Level II non-destructive testing & dimensional review.',
        referenceDocs: ['NDT Procedure #PR-QC-NDT-02', 'Inspection Report #QC-2026-0089'],
      },
      actions: [
        {
          label: 'Open QC Inspection Station',
          description: 'Examine root gap, weld porosity, undercut, and ultrasonic results.',
          icon: ShieldCheck,
          actionType: 'navigate',
        },
        {
          label: 'Simulate Step 9: Fail Root Gap (4.5mm)',
          description: 'Reject inspection, attach defect photo, and route rework.',
          icon: AlertTriangle,
          actionType: 'quick_trigger',
          badge: 'Demo Step 9',
        },
        {
          label: 'Simulate Step 11: Pass Re-Inspection',
          description: 'Re-inspect repaired weld, approve clearance, and issue Green Tag.',
          icon: CheckCircle2,
          actionType: 'quick_trigger',
          badge: 'Demo Step 11',
        },
      ],
      outgoingData: {
        destination: 'Machining (if Passed) OR Welding Bay (if Rework)',
        description: 'Non-linear fallback loop: failing sends part back to Welding with defect ticket; passing releases it.',
        artifactsProduced: ['QC Clearance Green Tag', 'Rework Ticket #RW-2026-0012'],
      },
    },
    {
      id: 'machining',
      stepNumber: 7,
      title: 'CNC Line Boring & Milling',
      department: 'Machining Center',
      targetRole: 'operator',
      targetTab: 'machining',
      status: 'pending',
      incomingData: {
        origin: 'Quality Inspection (QC Passed)',
        description: 'Cleared boom structure transferred to CNC horizontal floor borer for pivot bore finishing.',
        referenceDocs: ['Line Boring Drawing #DWG-BOR-02', 'H7 Tolerance Spec'],
      },
      actions: [
        {
          label: 'Open Machining Console',
          description: 'Record bore internal diameters, concentricity, and surface finish.',
          icon: Cog,
          actionType: 'navigate',
        },
      ],
      outgoingData: {
        destination: 'Surface Prep & Painting',
        description: 'Pivot pin holes machined to +0.030mm H7 tolerance with mirror bushing finish.',
        artifactsProduced: ['Coordinate Measurement (CMM) Report', 'Finished Pivot Bores'],
      },
    },
    {
      id: 'painting',
      stepNumber: 8,
      title: 'Surface Prep & Painting',
      department: 'Paint Shop',
      targetRole: 'operator',
      targetTab: 'painting',
      status: 'pending',
      incomingData: {
        origin: 'Machining Center',
        description: 'Machined boom structure, grit blasting abrasive, and JCB Industrial Yellow polyurethane paint.',
        referenceDocs: ['Paint Spec #PS-JCB-POLY-22', 'Surface Profile Gauge Sa 2.5'],
      },
      actions: [
        {
          label: 'Open Painting Workstation',
          description: 'Verify blast profile, record dry film thickness (DFT 120µm).',
          icon: Paintbrush,
          actionType: 'navigate',
        },
      ],
      outgoingData: {
        destination: 'Main Assembly Section',
        description: 'Corrosion-protected, polyurethane-coated boom cured and prepped for hydraulic fitment.',
        artifactsProduced: ['Dry Film Thickness (DFT) Test Certificate', 'Coated Monoboom'],
      },
    },
    {
      id: 'sub_assembly',
      stepNumber: 9,
      title: 'Sub-Assembly Sign-Off',
      department: 'Fabrication Management',
      targetRole: 'project_manager',
      targetTab: 'assembly_hierarchy',
      status: 'in_progress',
      incomingData: {
        origin: 'Individual Sub-Assembly Routes',
        description: 'Boom (BOOM-01), Dipper Arm (DIPPER-01), and Rock Bucket (BUCKET-01) sub-assemblies.',
        referenceDocs: ['Sub-Assembly Traveler Package', 'Final QC Dossier'],
      },
      actions: [
        {
          label: 'View Assembly Hierarchy',
          description: 'Inspect live status across Boom, Dipper, and Bucket components.',
          icon: GitMerge,
          actionType: 'navigate',
        },
        {
          label: 'Simulate Step 12: Complete Boom',
          description: 'Lock Boom sub-assembly as completed and release for Main Assembly.',
          icon: CheckCircle2,
          actionType: 'quick_trigger',
          badge: 'Demo Step 12',
        },
      ],
      outgoingData: {
        destination: 'Main Assembly Bay',
        description: 'All 3 structural sub-assemblies cleared and physically staged for the excavator arm assembly.',
        artifactsProduced: ['Sub-Assembly Completion Certificate', 'Staged Component Set'],
      },
    },
    {
      id: 'main_assembly',
      stepNumber: 10,
      title: 'Main Assembly (Arm ASM)',
      department: 'Assembly Floor',
      targetRole: 'project_manager',
      targetTab: 'assembly_hierarchy',
      status: 'pending',
      incomingData: {
        origin: 'Sub-Assemblies + Bought-Out Component Store',
        description: 'Boom + Dipper + Bucket paired with Parker cylinders, 40Cr pivot pins, flange bolts, and hydraulic hoses.',
        referenceDocs: ['Bought-Out Checklist #BOC-JCB-04', 'Torque Spec Chart #TS-M24'],
      },
      actions: [
        {
          label: 'Inspect 4 Bought-Out Parts',
          description: 'Verify cylinders, pivot pins, flange bolts, and hoses are received and torque-checked.',
          icon: Boxes,
          actionType: 'navigate',
        },
        {
          label: 'Simulate Step 13: Complete Arm ASM',
          description: 'Complete ARM-ASM and roll up to Master JCB-001 machine.',
          icon: CheckCircle2,
          actionType: 'quick_trigger',
          badge: 'Demo Step 13',
        },
      ],
      outgoingData: {
        destination: 'Master Machine Rollup',
        description: 'Completely assembled excavator working equipment (ARM-ASM) ready for vehicle chassis mounting.',
        artifactsProduced: ['ARM-ASM Main Assembly Gate Sign-Off', 'Torque Verification Sheet'],
      },
    },
    {
      id: 'master_project',
      stepNumber: 11,
      title: 'Master JCB-001 Delivery Rollup',
      department: 'Executive / Client PM',
      targetRole: 'project_manager',
      targetTab: 'traceability',
      status: 'pending',
      incomingData: {
        origin: 'All Main Assemblies & Quality Dossier',
        description: 'ARM-ASM plus full documentation from drawing release, heat numbers, scrap, and QC re-inspection.',
        referenceDocs: ['Project Purchase Order #JCB-PO-2026-901', 'Traceability Audit Ledger'],
      },
      actions: [
        {
          label: 'View Traceability Timeline',
          description: 'Browse complete immutable chronological audit trail with photo proofs.',
          icon: Layers,
          actionType: 'navigate',
        },
        {
          label: 'Print Master Job Traveler',
          description: 'Download physical client compliance dossier with signatures.',
          icon: FileText,
          actionType: 'dialog',
          dialogType: 'traveler',
        },
      ],
      outgoingData: {
        destination: 'JCB Earthmovers India Ltd (Client Deliverable)',
        description: '4 Sets of 220X Tracked Excavators delivered with 100% full digital manufacturing compliance history.',
        artifactsProduced: ['Client Delivery Dossier', 'End-to-End Audit Certificate'],
      },
    },
  ];

  const currentStage = FLOW_STAGES.find((s) => s.id === selectedStageId) || FLOW_STAGES[4];

  return (
    <div className="space-y-6 max-w-7xl mx-auto min-w-0">
      {/* 1. Header Overview & Educational Kicker */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 lg:p-6 shadow-sm min-w-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider font-mono">
                Interactive Lifecycle Flow Map
              </span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-xs text-slate-500 font-mono">
                Project: {activeProject?.code || 'JCB-001'} (220X Excavator)
              </span>
            </div>
            <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Fabrication Lifecycle & Action Flow
            </h1>
            <p className="text-xs lg:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Click any stage below to inspect incoming data dependencies, station actions, and downstream deliverables.
              Every button triggers real modal dialogs and live state transitions with zero dead clicks.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenTraveler}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Job Traveler</span>
            </button>
            <button
              type="button"
              onClick={() => runDemoStep(1)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-xs cursor-pointer font-bold"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Start Demo Tour</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Interactive Horizontal Pipeline Strip (Contained Scroll) */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm min-w-0">
        <div className="flex items-center justify-between gap-3 mb-3">
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide font-mono">
            Pipeline Stages (Click to Inspect & Trigger Actions)
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            Selected: <strong className="text-amber-600 dark:text-amber-400">{currentStage.title}</strong>
          </span>
        </div>

        {/* Scrollable Node Row with strictly contained overflow */}
        <div className="overflow-x-auto pb-3 pt-1 scrollbar-thin">
          <div className="flex items-stretch gap-2 min-w-max">
            {FLOW_STAGES.map((stg, idx) => {
              const isSelected = selectedStageId === stg.id;
              const isReworkNode = stg.id === 'inspection';

              return (
                <React.Fragment key={stg.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedStageId(stg.id)}
                    className={`flex flex-col justify-between p-3 rounded-xl border text-left transition-all w-44 shrink-0 cursor-pointer ${
                      isSelected
                        ? 'ring-2 ring-amber-500 bg-amber-50/70 dark:bg-amber-950/40 border-amber-400 dark:border-amber-600 shadow-sm'
                        : isReworkNode
                        ? 'bg-purple-50/40 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800/80 hover:border-purple-400'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          0{stg.stepNumber}
                        </span>
                        {isReworkNode && (
                          <span className="text-[9px] font-mono text-purple-600 dark:text-purple-400 font-bold flex items-center gap-0.5">
                            <RotateCcw className="w-2.5 h-2.5" />
                            REWORK
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate w-full mb-0.5">
                        {stg.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate w-full">
                        {stg.department}
                      </p>
                    </div>

                    <div className="pt-2 mt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-400">Click to view</span>
                      {isSelected ? (
                        <span className="text-amber-600 dark:text-amber-400 font-bold">Active</span>
                      ) : (
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {idx < FLOW_STAGES.length - 1 && (
                    <div className="flex items-center justify-center text-slate-300 dark:text-slate-700 shrink-0">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Deep Dive Action Inspector Card for Selected Stage */}
      <StageInspectorCard
        stage={currentStage}
        onOpenTraveler={onOpenTraveler}
        onOpenReworkModal={onOpenReworkModal}
        onOpenQCModal={onOpenQCModal}
      />
    </div>
  );
};
