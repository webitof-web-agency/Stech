/**
 * STECH Fabrication Management - Core Domain Model & Types
 * MERN Architecture Specification
 *
 * Project / Master (JCB-001)
 *   → Main Assembly (Arm Assembly)
 *     → Sub-Assemblies (Boom, Dipper, Bucket) + Bought-Out Items (Hydraulic Cylinder, Pin Set, Bolt Set, Hoses)
 *       → Production Routes (Snapshot from Reusable Templates)
 *         → Job Cards / Operations (Start, Pause, Scrap, Proof Capture)
 *           → Inspection & Additive Rework Loop (Fail -> Weld Rework -> Re-inspect -> Pass)
 *             → Main Assembly Rollup → Master Project Completion
 */

export type ProjectCategory = 'earthmoving' | 'structural' | 'sheet_metal' | 'piping';

export type UserRole =
  | 'admin'
  | 'project_manager'
  | 'design_engineer'
  | 'stores'
  | 'department_hod'
  | 'operator'
  | 'quality'
  | 'management_viewer'
  // Compatibility aliases
  | 'all_workflow'
  | 'supervisor'
  | 'planning'
  | 'fabrication'
  | 'machining'
  | 'assembly_paint'
  | 'dispatch'
  | 'workflow_admin';

export type AssemblyLevel = 'sub_assembly' | 'main_assembly' | 'master_assembly';
export type ItemType = 'fabricated' | 'bought_out';

export type NavigationTab =
  | 'flow_map'
  | 'dashboard'
  | 'assembly_hierarchy'
  | 'drawing_release'
  | 'bom_requirement'
  | 'material_mrp'
  | 'work_orders'
  | 'material_issued'
  | 'cutting'
  | 'fitup'
  | 'welding'
  | 'machining'
  | 'inspection'
  | 'painting'
  | 'assembly'
  | 'dispatch'
  | 'workflow_builder'
  | 'traceability'
  | 'reports';

export type OperationStatus =
  | 'pending'
  | 'in_progress'
  | 'paused'
  | 'completed'
  | 'on_hold'
  | 'rework'
  | 'skipped';

export type QCResult = 'pending' | 'pass' | 'fail' | 'rework' | 'hold';

export interface CustomFieldDefinition {
  id: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select';
  required: boolean;
  defaultValue?: string | number | boolean;
  options?: string[];
  unit?: string;
}

export interface WorkflowStageConfig {
  id: string;
  name: string;
  sublabel: string;
  sequence: number;
  category: 'engineering' | 'store' | 'fabrication' | 'machining' | 'quality' | 'finishing' | 'dispatch';
  iconName: string;
  isStandard: boolean;
  departmentCode: string;
  
  // Transition Rules & Conditions
  mandatory: boolean;
  canSkip: boolean;
  proofRequired: boolean;
  requiresQCApproval: boolean;
  requiresHeatTracking: boolean;
  requiresAllQuantitiesCompleted: boolean;
  allowSplitBatchMove: boolean;
  isReworkDestinationAllowed: boolean;
  defaultReworkTargetStageId?: string;
  
  // Custom Form Fields for this stage
  customFields: CustomFieldDefinition[];
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  code: string;
  description: string;
  version: string;
  stages: WorkflowStageConfig[];
  active: boolean;
}

export interface BOMItem {
  id: string;
  partNo: string;
  description: string;
  materialGrade: string;
  dimension: string;
  uom: 'kg' | 'Nos' | 'm' | 'sheets' | 'liters';
  qtyPerUnit: number;
  grossRequirement: number;
  processLossPercent: number;
  netRequirement: number;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  allocatedHeatNo?: string;
  heatTrackingRequired: boolean;
  batchTrackingRequired: boolean;
  operationTarget: string;
  status: 'available' | 'partial' | 'shortage' | 'issued';
}

export interface BoughtOutItem {
  id: string;
  code: string;
  name: string;
  category: 'hydraulics' | 'fasteners' | 'bearings_pins' | 'electrical_hoses';
  specification: string;
  supplier: string;
  requiredQty: number;
  allocatedQty: number;
  status: 'in_stock' | 'allocated' | 'pending';
  uom: string;
  parentAssemblyId: string;
}

export interface DrawingRecord {
  id: string;
  assemblyId: string;
  drawingNo: string;
  title: string;
  revision: string;
  status: 'draft' | 'under_review' | 'released' | 'superseded';
  uploadedBy: string;
  uploadedAt: string;
  releasedBy?: string;
  releasedAt?: string;
  approvalRemarks?: string;
  fileUrl: string;
}

export interface ProofMedia {
  id: string;
  entityType: 'job_card' | 'inspection' | 'rework' | 'drawing';
  entityId: string;
  stageId: string;
  type: 'image' | 'video';
  url: string;
  caption: string;
  uploadedBy: string;
  uploadedAt: string;
  fileSize?: string;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  category: ProjectCategory;
  client: string;
  drawingNumber: string;
  drawingRevision: string;
  totalBatchQuantity: number;
  unit: string;
  plannedStartDate: string;
  targetCompletionDate: string;
  bomItems: BOMItem[];
  boughtOutItems: BoughtOutItem[];
  description: string;
  status: 'planning' | 'in_production' | 'completed';
}

export interface Machine {
  id: string;
  code: string;
  name: string;
  workCenter: string;
  hourlyRate: number;
  status: 'operational' | 'maintenance' | 'busy';
}

export interface Operator {
  id: string;
  badgeId: string;
  name: string;
  specialty: string;
  department: string;
  shift: 'Shift A (07:00-15:30)' | 'Shift B (15:30-00:00)' | 'Shift C (00:00-07:00)';
  qualificationLevel: string;
}

export interface StageQuantities {
  completed: number;
  inProgress: number;
  pending: number;
  rework: number;
  scrap: number; // captured especially for cutting
}

export interface DimensionCheck {
  id: string;
  parameter: string;
  nominal: string;
  tolerance: string;
  actual: string;
  status: 'ok' | 'out_of_spec' | 'pending';
}

export interface InspectionChecklistItem {
  id: string;
  parameter: string;
  specification: string;
  tolerance: string;
  actual: string;
  status: 'pass' | 'fail' | 'pending';
  remarks?: string;
}

export interface OperationInspection {
  inspectorId: string;
  inspectorName: string;
  result: QCResult;
  remarks: string;
  inspectionDate?: string;
  checklistItems?: InspectionChecklistItem[];
  dimensionChecks?: DimensionCheck[];
  weldingVisuals?: {
    porosity: 'none' | 'acceptable' | 'reject';
    undercut: 'none' | 'acceptable' | 'reject';
    penetration: 'full' | 'partial' | 'rework';
  };
  proofUrls?: string[];
}

export interface JobCardOperation {
  id: string;
  stageId: string;
  stageName: string;
  sequence: number;
  category: 'engineering' | 'store' | 'fabrication' | 'machining' | 'quality' | 'finishing' | 'dispatch';
  status: OperationStatus;
  
  // Department & Workstation
  departmentCode: string;
  operator: Operator;
  machine: Machine;
  
  // Material details
  material: {
    grade: string;
    heatNumber: string;
    dimension: string;
    batchNo: string;
    cutLengthOrBlank?: string;
  };

  // Timing & Hours
  plannedHours: number;
  actualHours: number;
  reworkHours: number;
  startTime: string | null;
  endTime: string | null;
  isRunning: boolean;
  timerStartedAt?: number;

  // Quantity Breakdown & Scrap
  quantities: StageQuantities;
  scrapWeightKg?: number;

  // Quality & Inspection
  inspection: OperationInspection;

  // Proof Evidence
  proofs?: ProofMedia[];

  // Workstation notes
  workInstructions?: string;
  delayReason?: string;
  skipReason?: string;

  // Dynamic values stored for custom fields
  customFieldValues?: Record<string, any>;
}

export interface ReworkTicket {
  id: string;
  jobCardId: string;
  correctiveJobCardId?: string; // Additive corrective job card
  partNo: string;
  fromStageId: string;
  fromStageName: string;
  toStageId: string;
  toStageName: string;
  quantity: number;
  defectCategory: 
    | 'Dimension Mismatch'
    | 'Weld Porosity / Undercut'
    | 'Weld Root Gap Exceeded'
    | 'Fit-up Angle Deviance'
    | 'Paint Blister / Low DFT'
    | 'Machining Runout'
    | 'Surface Scratch / Burr'
    | 'Other';
  defectDetails: string;
  correctiveAction: string;
  inspectorName: string;
  timestamp: string;
  status: 'open' | 'in_progress' | 'reinspected' | 'closed';
  loggedReworkHours: number;
  evidencePhotoUrl?: string;
}

export interface MaterialIssueRecord {
  issueSlipNo: string;
  issuedBy: string;
  issueDate: string;
  heatNumbers: string[];
  testCertVerified: boolean;
  notes: string;
}

export interface JobCard {
  id: string;
  jobCardNo: string;
  projectId: string;
  partNo: string;
  description: string;
  totalQuantity: number;
  itemType?: ItemType;
  drawingRef: string;
  drawingRev: string;
  targetDate: string;
  priority: 'normal' | 'high' | 'urgent';
  currentStageId: string;
  overallStatus: 'pending' | 'in_progress' | 'completed' | 'on_hold' | 'rework';
  assemblyLevel?: AssemblyLevel;
  parentAssemblyId?: string;
  childAssemblyIds?: string[];
  assignedRouteId?: string;
  operations: JobCardOperation[];
  reworkTickets: ReworkTicket[];
  materialIssue?: MaterialIssueRecord;
}

export interface AuditLogEvent {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  department: string;
  action: string;
  entityType: 'project' | 'assembly' | 'drawing' | 'material' | 'job_card' | 'inspection' | 'rework';
  entityId: string;
  entityCode: string;
  summary: string;
  proofUrl?: string;
  timestamp: string;
  status: 'success' | 'warning' | 'alert';
}
