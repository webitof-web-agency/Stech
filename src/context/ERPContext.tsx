import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  DEFAULT_WORKFLOW_STAGES,
  INITIAL_AUDIT_LOGS,
  INITIAL_DRAWINGS,
  INITIAL_JOB_CARDS,
  INITIAL_MACHINES,
  INITIAL_OPERATORS,
  INITIAL_PROJECTS,
  INITIAL_TEMPLATES,
} from '../data/initialData';
import {
  AssemblyLevel,
  AuditLogEvent,
  BOMItem,
  BoughtOutItem,
  CustomFieldDefinition,
  DimensionCheck,
  DrawingRecord,
  JobCard,
  JobCardOperation,
  Machine,
  NavigationTab,
  Operator,
  ProofMedia,
  Project,
  QCResult,
  ReworkTicket,
  StageQuantities,
  UserRole,
  WorkflowStageConfig,
  WorkflowTemplate,
} from '../types/erp';

export interface RolePermissions {
  canReleaseDrawings: boolean;
  canIssueMaterials: boolean;
  canExecuteProduction: boolean;
  canFailQC: boolean;
  canPassQC: boolean;
  canCreateRework: boolean;
  canReorderRoutes: boolean;
  canCompleteAssemblies: boolean;
  canConfigureTemplates: boolean;
  allowedDepartments: string[];
}

export function getRolePermissions(role: UserRole): RolePermissions {
  switch (role) {
    case 'admin':
      return {
        canReleaseDrawings: true,
        canIssueMaterials: true,
        canExecuteProduction: true,
        canFailQC: true,
        canPassQC: true,
        canCreateRework: true,
        canReorderRoutes: true,
        canCompleteAssemblies: true,
        canConfigureTemplates: true,
        allowedDepartments: ['ALL'],
      };
    case 'project_manager':
      return {
        canReleaseDrawings: true,
        canIssueMaterials: false,
        canExecuteProduction: false,
        canFailQC: false,
        canPassQC: false,
        canCreateRework: false,
        canReorderRoutes: true,
        canCompleteAssemblies: true,
        canConfigureTemplates: true,
        allowedDepartments: ['MGT', 'ENG', 'ALL'],
      };
    case 'design_engineer':
      return {
        canReleaseDrawings: false, // can upload, only PM releases
        canIssueMaterials: false,
        canExecuteProduction: false,
        canFailQC: false,
        canPassQC: false,
        canCreateRework: false,
        canReorderRoutes: false,
        canCompleteAssemblies: false,
        canConfigureTemplates: false,
        allowedDepartments: ['ENG'],
      };
    case 'stores':
      return {
        canReleaseDrawings: false,
        canIssueMaterials: true,
        canExecuteProduction: false,
        canFailQC: false,
        canPassQC: false,
        canCreateRework: false,
        canReorderRoutes: false,
        canCompleteAssemblies: false,
        canConfigureTemplates: false,
        allowedDepartments: ['STR'],
      };
    case 'department_hod':
    case 'supervisor':
      return {
        canReleaseDrawings: false,
        canIssueMaterials: false,
        canExecuteProduction: true,
        canFailQC: false,
        canPassQC: false,
        canCreateRework: false,
        canReorderRoutes: false,
        canCompleteAssemblies: true,
        canConfigureTemplates: false,
        allowedDepartments: ['CUT', 'FIT', 'WLD', 'MCH', 'PNT', 'ASY'],
      };
    case 'operator':
    case 'fabrication':
    case 'machining':
    case 'assembly_paint':
      return {
        canReleaseDrawings: false,
        canIssueMaterials: false,
        canExecuteProduction: true,
        canFailQC: false,
        canPassQC: false,
        canCreateRework: false,
        canReorderRoutes: false,
        canCompleteAssemblies: false,
        canConfigureTemplates: false,
        allowedDepartments: ['CUT', 'FIT', 'WLD', 'MCH', 'PNT', 'ASY'],
      };
    case 'quality':
      return {
        canReleaseDrawings: false,
        canIssueMaterials: false,
        canExecuteProduction: false,
        canFailQC: true,
        canPassQC: true,
        canCreateRework: true,
        canReorderRoutes: false,
        canCompleteAssemblies: false,
        canConfigureTemplates: false,
        allowedDepartments: ['QC'],
      };
    case 'management_viewer':
      return {
        canReleaseDrawings: false,
        canIssueMaterials: false,
        canExecuteProduction: false,
        canFailQC: false,
        canPassQC: false,
        canCreateRework: false,
        canReorderRoutes: false,
        canCompleteAssemblies: false,
        canConfigureTemplates: false,
        allowedDepartments: [],
      };
    case 'workflow_admin':
      return {
        canReleaseDrawings: true,
        canIssueMaterials: true,
        canExecuteProduction: true,
        canFailQC: true,
        canPassQC: true,
        canCreateRework: true,
        canReorderRoutes: true,
        canCompleteAssemblies: true,
        canConfigureTemplates: true,
        allowedDepartments: ['ALL'],
      };
    default:
      return {
        canReleaseDrawings: true,
        canIssueMaterials: true,
        canExecuteProduction: true,
        canFailQC: true,
        canPassQC: true,
        canCreateRework: true,
        canReorderRoutes: true,
        canCompleteAssemblies: true,
        canConfigureTemplates: true,
        allowedDepartments: ['ALL'],
      };
  }
}

interface ERPContextType {
  projects: Project[];
  jobCards: JobCard[];
  machines: Machine[];
  operators: Operator[];
  workflowStages: WorkflowStageConfig[];
  workflowTemplates: WorkflowTemplate[];
  drawings: DrawingRecord[];
  auditLogs: AuditLogEvent[];
  activeProjectId: string;
  activeJobCardId: string;
  activeStageId: string | null;
  userRole: UserRole;
  currentTab: NavigationTab;
  isDarkMode: boolean;
  activeJobCard: JobCard | undefined;
  activeProject: Project | undefined;
  permissions: RolePermissions;

  // Guided Client Demo Tour (13 Steps) & Demo Data Package
  demoStep: number;
  isDemoTourOpen: boolean;
  setIsDemoTourOpen: (open: boolean) => void;
  runDemoStep: (stepNumber: number) => void;
  isDemoMode: boolean;
  toggleDemoMode: (enabled: boolean) => void;

  // Navigation & Role Actions
  setActiveProjectId: (id: string) => void;
  setActiveJobCardId: (id: string) => void;
  setActiveStageId: (stageId: string | null) => void;
  setUserRole: (role: UserRole) => void;
  setCurrentTab: (tab: NavigationTab) => void;
  toggleDarkMode: () => void;
  resetToDemoData: () => void;

  // Audit Logging
  addAuditLog: (
    action: string,
    entityType: AuditLogEvent['entityType'],
    entityId: string,
    entityCode: string,
    summary: string,
    proofUrl?: string,
    status?: AuditLogEvent['status']
  ) => void;

  // Dynamic Custom Workflow & Route Snapshots
  updateWorkflowStage: (stageId: string, updates: Partial<WorkflowStageConfig>) => void;
  addWorkflowStage: (newStage: WorkflowStageConfig) => void;
  deleteWorkflowStage: (stageId: string) => void;
  addCustomFieldToStage: (stageId: string, field: CustomFieldDefinition) => void;
  applyTemplateToSubAssembly: (jobCardId: string, templateId: string) => void;
  customizeSubAssemblyRouteStage: (jobCardId: string, stageId: string, updates: Partial<JobCardOperation>) => void;

  // Drawing Management
  createDrawingRecord: (data: {
    drawingNo: string;
    title: string;
    revision: string;
    assemblyId?: string;
    releaseImmediately?: boolean;
    remarks?: string;
  }) => DrawingRecord;
  releaseDrawingRevision: (drawingId: string, approverName: string, remarks?: string) => void;

  // Job Cards & Operations
  createNewFabricationJob: (data: {
    partNo: string;
    description: string;
    plannedQuantity: number;
    priority: 'normal' | 'high' | 'urgent';
    dueDate: string;
    drawingRef?: string;
    templateId?: string;
    assemblyLevel?: AssemblyLevel;
  }) => void;
  createBOMRecord: (
    projectId: string,
    data: {
      partNo: string;
      description: string;
      materialGrade: string;
      dimension: string;
      uom: BOMItem['uom'];
      qtyPerUnit: number;
      processLossPercent: number;
      heatTrackingRequired: boolean;
      batchTrackingRequired: boolean;
      operationTarget: string;
    }
  ) => void;

  // Shopfloor Execution Actions
  startOperation: (jobCardId: string, stageId: string) => void;
  pauseOperation: (jobCardId: string, stageId: string) => void;
  updateStageQuantities: (
    jobCardId: string,
    stageId: string,
    quantities: Partial<StageQuantities>,
    scrapWeightKg?: number,
    proof?: ProofMedia
  ) => void;
  assignOperatorAndMachine: (jobCardId: string, stageId: string, operatorId: string, machineId: string) => void;
  addProofToOperation: (jobCardId: string, stageId: string, proof: ProofMedia) => void;
  moveJobCardToStage: (jobCardId: string, fromStageId: string, toStageId: string) => void;

  // Store & Material Issue
  issueMaterialToJobCard: (
    jobCardId: string,
    data: { issueSlipNo: string; issuedBy: string; heatNumbers: string[]; notes: string }
  ) => void;

  // Quality Control & Non-Linear Rework Loop
  submitQCInspection: (
    jobCardId: string,
    stageId: string,
    data: {
      result: QCResult;
      remarks: string;
      dimensionChecks?: DimensionCheck[];
      weldingVisuals?: {
        porosity: 'none' | 'acceptable' | 'reject';
        undercut: 'none' | 'acceptable' | 'reject';
        penetration: 'full' | 'partial' | 'rework';
      };
      proofUrl?: string;
    }
  ) => void;
  createReworkFallbackTicket: (data: {
    jobCardId: string;
    fromStageId: string;
    toStageId: string;
    quantity: number;
    defectCategory: ReworkTicket['defectCategory'];
    defectDetails: string;
    correctiveAction: string;
    inspectorName: string;
    evidencePhotoUrl?: string;
  }) => void;
  completeReworkExecution: (jobCardId: string, ticketId: string, hoursSpent: number, repairNotes: string) => void;
  passQCReinspection: (jobCardId: string, ticketId: string, remarks: string) => void;

  // Assembly Completion Gates
  completeSubAssembly: (jobCardId: string) => void;
  completeMainAssembly: (mainAssemblyId: string) => void;
  completeMasterProject: (projectId: string) => void;
  dispatchJobCard: (jobCardId: string, notes: string) => void;
}

const STORAGE_KEY_JOBCARDS = 'stech_erp_jobcards_v7';
const STORAGE_KEY_PROJECTS = 'stech_erp_projects_v7';
const STORAGE_KEY_WORKFLOW = 'stech_erp_workflow_v7';
const STORAGE_KEY_TEMPLATES = 'stech_erp_templates_v7';
const STORAGE_KEY_DRAWINGS = 'stech_erp_drawings_v7';
const STORAGE_KEY_AUDIT = 'stech_erp_audit_v7';
const STORAGE_KEY_THEME = 'stech_erp_theme';

const ERPContext = createContext<ERPContextType | undefined>(undefined);

export const ERPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PROJECTS);
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [jobCards, setJobCards] = useState<JobCard[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_JOBCARDS);
    return saved ? JSON.parse(saved) : INITIAL_JOB_CARDS;
  });

  const [workflowStages, setWorkflowStages] = useState<WorkflowStageConfig[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_WORKFLOW);
    return saved ? JSON.parse(saved) : DEFAULT_WORKFLOW_STAGES;
  });

  const [workflowTemplates, setWorkflowTemplates] = useState<WorkflowTemplate[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TEMPLATES);
    return saved ? JSON.parse(saved) : INITIAL_TEMPLATES;
  });

  const [drawings, setDrawings] = useState<DrawingRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_DRAWINGS);
    return saved ? JSON.parse(saved) : INITIAL_DRAWINGS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEvent[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_AUDIT);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [machines] = useState<Machine[]>(INITIAL_MACHINES);
  const [operators] = useState<Operator[]>(INITIAL_OPERATORS);

  const [activeProjectId, setActiveProjectId] = useState<string>('prj_jcb_001');
  const [activeJobCardId, setActiveJobCardId] = useState<string>('jc_boom_01');
  const [activeStageId, setActiveStageId] = useState<string | null>('welding');
  const [userRole, setUserRole] = useState<UserRole>('project_manager');
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');

  // Guided demo tour state
  const [demoStep, setDemoStep] = useState<number>(1);
  const [isDemoTourOpen, setIsDemoTourOpen] = useState<boolean>(true);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEY_THEME);
    if (savedTheme) return savedTheme === 'dark';
    return true;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(STORAGE_KEY_THEME, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(STORAGE_KEY_THEME, 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_JOBCARDS, JSON.stringify(jobCards));
    } catch {}
  }, [jobCards]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
    } catch {}
  }, [projects]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_WORKFLOW, JSON.stringify(workflowStages));
    } catch {}
  }, [workflowStages]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DRAWINGS, JSON.stringify(drawings));
    } catch {}
  }, [drawings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(auditLogs));
    } catch {}
  }, [auditLogs]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  const activeJobCard = jobCards.find((jc) => jc.id === activeJobCardId);
  const activeProject = projects.find((p) => p.id === activeProjectId);
  const permissions = getRolePermissions(userRole);

  const addAuditLog = (
    action: string,
    entityType: AuditLogEvent['entityType'],
    entityId: string,
    entityCode: string,
    summary: string,
    proofUrl?: string,
    status: AuditLogEvent['status'] = 'success'
  ) => {
    const newLog: AuditLogEvent = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      actorId: userRole,
      actorName: userRole === 'project_manager' ? 'Ananya Sharma (PM)' : userRole === 'quality' ? 'Vikram Singh (QC)' : userRole === 'stores' ? 'Dinesh Patil (Stores)' : 'Ganesh Shinde (Operator)',
      actorRole: userRole,
      department: userRole === 'quality' ? 'Quality' : userRole === 'stores' ? 'Stores' : 'Fabrication',
      action,
      entityType,
      entityId,
      entityCode,
      summary,
      proofUrl,
      timestamp: new Date().toISOString().substring(0, 16).replace('T', ' '),
      status,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('stech_erp_demo_mode');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const resetToDemoData = () => {
    localStorage.removeItem(STORAGE_KEY_JOBCARDS);
    localStorage.removeItem(STORAGE_KEY_PROJECTS);
    localStorage.removeItem(STORAGE_KEY_WORKFLOW);
    localStorage.removeItem(STORAGE_KEY_DRAWINGS);
    localStorage.removeItem(STORAGE_KEY_AUDIT);
    setJobCards(INITIAL_JOB_CARDS);
    setProjects(INITIAL_PROJECTS);
    setWorkflowStages(DEFAULT_WORKFLOW_STAGES);
    setDrawings(INITIAL_DRAWINGS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setActiveProjectId('prj_jcb_001');
    setActiveJobCardId('jc_boom_01');
    setActiveStageId('welding');
    setUserRole('project_manager');
    setCurrentTab('dashboard');
    setDemoStep(1);
    setIsDemoTourOpen(true);
    setIsDemoMode(true);
    localStorage.setItem('stech_erp_demo_mode', JSON.stringify(true));
  };

  const toggleDemoMode = (enabled: boolean) => {
    setIsDemoMode(enabled);
    localStorage.setItem('stech_erp_demo_mode', JSON.stringify(enabled));
    if (!enabled) {
      // Empty clean floor state for testing
      setJobCards([]);
      setProjects([
        {
          ...INITIAL_PROJECTS[0],
          status: 'planning',
          boughtOutItems: INITIAL_PROJECTS[0].boughtOutItems.map((bo) => ({
            ...bo,
            status: 'pending',
            allocatedQty: 0,
          })),
        },
      ]);
      setAuditLogs([]);
    } else {
      resetToDemoData();
    }
  };

  // DRAWINGS
  const createDrawingRecord = (data: {
    drawingNo: string;
    title: string;
    revision: string;
    assemblyId?: string;
    releaseImmediately?: boolean;
    remarks?: string;
  }): DrawingRecord => {
    const nowIso = new Date().toISOString().substring(0, 16).replace('T', ' ');
    const canReleaseNow = Boolean(data.releaseImmediately && permissions.canReleaseDrawings);
    const uploaderName =
      userRole === 'project_manager'
        ? 'Ananya Sharma (Project Manager)'
        : userRole === 'admin'
        ? 'System Admin'
        : 'Rohan Deshmukh (Design Lead)';

    const newDrawing: DrawingRecord = {
      id: `dwg_${Date.now().toString().slice(-4)}`,
      assemblyId: data.assemblyId || activeJobCardId || 'custom_assembly',
      drawingNo: data.drawingNo.trim().toUpperCase(),
      title: data.title.trim() || `${data.drawingNo.trim()} Fabrication Drawing`,
      revision: data.revision.trim() || 'Rev A',
      status: canReleaseNow ? 'released' : 'under_review',
      uploadedBy: uploaderName,
      uploadedAt: nowIso,
      releasedBy: canReleaseNow ? uploaderName : undefined,
      releasedAt: canReleaseNow ? nowIso : undefined,
      approvalRemarks: canReleaseNow
        ? data.remarks || 'Released upon registration for production.'
        : data.remarks || 'Uploaded to CAD vault; awaiting PM release sign-off.',
      fileUrl: `/assets/drawings/${data.drawingNo.trim().toUpperCase()}-${data.revision.trim() || 'RevA'}.pdf`,
    };

    setDrawings((prev) => [newDrawing, ...prev]);
    addAuditLog(
      canReleaseNow ? 'RELEASE_DRAWING' : 'UPLOAD_DRAWING',
      'drawing',
      newDrawing.id,
      `${newDrawing.drawingNo} ${newDrawing.revision}`,
      canReleaseNow
        ? `Registered & released drawing ${newDrawing.drawingNo} (${newDrawing.revision}) for production.`
        : `Uploaded new drawing ${newDrawing.drawingNo} (${newDrawing.revision}) to CAD Vault (Under Review).`
    );

    return newDrawing;
  };

  const releaseDrawingRevision = (drawingId: string, approverName: string, remarks?: string) => {
    const nowIso = new Date().toISOString().substring(0, 16).replace('T', ' ');
    setDrawings((prev) =>
      prev.map((dwg) =>
        dwg.id === drawingId
          ? {
              ...dwg,
              status: 'released',
              releasedBy: approverName,
              releasedAt: nowIso,
              approvalRemarks: remarks || dwg.approvalRemarks,
            }
          : dwg
      )
    );
    const dwg = drawings.find((d) => d.id === drawingId);
    addAuditLog(
      'RELEASE_DRAWING',
      'drawing',
      drawingId,
      dwg?.drawingNo || drawingId,
      `Released drawing ${dwg?.drawingNo} ${dwg?.revision} for shopfloor production by ${approverName}.`
    );
  };

  // TEMPLATES & ROUTE SNAPSHOTS
  const applyTemplateToSubAssembly = (jobCardId: string, templateId: string) => {
    const tmpl = workflowTemplates.find((t) => t.id === templateId);
    if (!tmpl) return;

    setJobCards((prev) =>
      prev.map((jc) => {
        if (jc.id !== jobCardId) return jc;
        const newOps: JobCardOperation[] = tmpl.stages.map((stg) => {
          const existingOp = jc.operations.find((o) => o.stageId === stg.id);
          if (existingOp) return existingOp;
          return {
            id: `op_${jc.id}_${stg.id}`,
            stageId: stg.id,
            stageName: stg.name,
            sequence: stg.sequence,
            category: stg.category,
            departmentCode: stg.departmentCode,
            status: 'pending',
            operator: operators[stg.sequence % operators.length],
            machine: machines[stg.sequence % machines.length],
            material: {
              grade: 'Domex 700MC',
              heatNumber: 'Pending',
              dimension: 'Standard',
              batchNo: `BAT-${jc.partNo}`,
            },
            plannedHours: 12,
            actualHours: 0,
            reworkHours: 0,
            startTime: null,
            endTime: null,
            isRunning: false,
            quantities: { completed: 0, inProgress: 0, pending: jc.totalQuantity, rework: 0, scrap: 0 },
            inspection: { inspectorId: 'QC-401', inspectorName: 'Vikram Singh', result: 'pending', remarks: '' },
          };
        });

        return {
          ...jc,
          assignedRouteId: templateId,
          operations: newOps,
        };
      })
    );

    addAuditLog(
      'APPLY_ROUTE_TEMPLATE',
      'assembly',
      jobCardId,
      jobCards.find((j) => j.id === jobCardId)?.partNo || jobCardId,
      `Applied template snapshot '${tmpl.name}' to sub-assembly.`
    );
  };

  const customizeSubAssemblyRouteStage = (
    jobCardId: string,
    stageId: string,
    updates: Partial<JobCardOperation>
  ) => {
    setJobCards((prev) =>
      prev.map((jc) => {
        if (jc.id !== jobCardId) return jc;
        const updatedOps = jc.operations.map((op) => (op.stageId === stageId ? { ...op, ...updates } : op));
        return { ...jc, operations: updatedOps };
      })
    );
    addAuditLog(
      'CUSTOMIZE_ROUTE_SNAPSHOT',
      'job_card',
      jobCardId,
      jobCards.find((j) => j.id === jobCardId)?.partNo || jobCardId,
      `Customized route stage '${stageId}' specifically for this sub-assembly (without modifying master template).`
    );
  };

  // STAGE MANAGEMENT
  const updateWorkflowStage = (stageId: string, updates: Partial<WorkflowStageConfig>) => {
    setWorkflowStages((prev) => prev.map((s) => (s.id === stageId ? { ...s, ...updates } : s)));
  };

  const addWorkflowStage = (newStage: WorkflowStageConfig) => {
    setWorkflowStages((prev) => [...prev, newStage]);
  };

  const deleteWorkflowStage = (stageId: string) => {
    setWorkflowStages((prev) => prev.filter((s) => s.id !== stageId));
  };

  const addCustomFieldToStage = (stageId: string, field: CustomFieldDefinition) => {
    setWorkflowStages((prev) =>
      prev.map((s) => (s.id === stageId ? { ...s, customFields: [...s.customFields, field] } : s))
    );
  };

  // CREATE NEW WORK ORDER / FABRICATION JOB
  const createNewFabricationJob = (data: {
    partNo: string;
    description: string;
    plannedQuantity: number;
    priority: 'normal' | 'high' | 'urgent';
    dueDate: string;
    drawingRef?: string;
    templateId?: string;
    assemblyLevel?: AssemblyLevel;
  }) => {
    const newId = `jc_${Date.now().toString().slice(-4)}`;
    const drawingRef = data.drawingRef || activeProject?.drawingNumber || 'DWG-STD-01';
    const selectedTemplate = data.templateId
      ? workflowTemplates.find((t) => t.id === data.templateId)
      : undefined;
    const sourceStages = selectedTemplate?.stages.length ? selectedTemplate.stages : workflowStages;

    const initialOps: JobCardOperation[] = sourceStages.map((s, idx) => ({
      id: `op_${newId}_${s.id}`,
      stageId: s.id,
      stageName: s.name,
      sequence: s.sequence,
      category: s.category,
      departmentCode: s.departmentCode,
      status: idx === 0 ? 'in_progress' : 'pending',
      operator: operators[idx % operators.length],
      machine: machines[idx % machines.length],
      material: {
        grade: 'Domex 700MC',
        heatNumber: 'Pending Allocation',
        dimension: 'Standard',
        batchNo: `B-${newId}`,
      },
      plannedHours: 8,
      actualHours: 0,
      reworkHours: 0,
      startTime: idx === 0 ? new Date().toISOString().substring(0, 16).replace('T', ' ') : null,
      endTime: null,
      isRunning: false,
      quantities: {
        completed: 0,
        inProgress: idx === 0 ? data.plannedQuantity : 0,
        pending: idx === 0 ? 0 : data.plannedQuantity,
        rework: 0,
        scrap: 0,
      },
      inspection: {
        inspectorId: 'QC-401',
        inspectorName: 'Vikram Singh',
        result: 'pending',
        remarks: 'Initial job creation.',
      },
    }));

    const firstStageId = sourceStages[0]?.id || 'drawing_release';

    const newJobCard: JobCard = {
      id: newId,
      jobCardNo: `JOB-2026-${Date.now().toString().slice(-4)}`,
      projectId: activeProjectId,
      partNo: data.partNo,
      description: data.description,
      totalQuantity: data.plannedQuantity,
      itemType: 'fabricated',
      drawingRef,
      drawingRev: 'Rev A',
      targetDate: data.dueDate,
      priority: data.priority,
      currentStageId: firstStageId,
      overallStatus: 'in_progress',
      assemblyLevel: data.assemblyLevel || 'sub_assembly',
      assignedRouteId: selectedTemplate?.id,
      operations: initialOps,
      reworkTickets: [],
    };

    setJobCards((prev) => [newJobCard, ...prev]);
    setActiveJobCardId(newId);
    setActiveStageId(firstStageId);
    setCurrentTab('work_orders');
    addAuditLog(
      'CREATE_JOB_CARD',
      'job_card',
      newId,
      data.partNo,
      `Created new work order ${newJobCard.jobCardNo} for ${data.partNo} (${data.plannedQuantity} Nos) using ${selectedTemplate?.name || 'Active Route'}.`
    );
  };

  // CREATE BOM RECORD
  const createBOMRecord = (
    projectId: string,
    data: {
      partNo: string;
      description: string;
      materialGrade: string;
      dimension: string;
      uom: BOMItem['uom'];
      qtyPerUnit: number;
      processLossPercent: number;
      heatTrackingRequired: boolean;
      batchTrackingRequired: boolean;
      operationTarget: string;
    }
  ) => {
    const gross = data.qtyPerUnit * (activeProject?.totalBatchQuantity || 1);
    const net = gross * (1 + data.processLossPercent / 100);

    const newBOMItem: BOMItem = {
      id: `bom_${Date.now().toString().slice(-4)}`,
      partNo: data.partNo,
      description: data.description,
      materialGrade: data.materialGrade,
      dimension: data.dimension,
      uom: data.uom,
      qtyPerUnit: data.qtyPerUnit,
      grossRequirement: gross,
      processLossPercent: data.processLossPercent,
      netRequirement: Math.round(net * 100) / 100,
      currentStock: gross * 1.5,
      reservedStock: gross,
      availableStock: gross * 0.5,
      allocatedHeatNo: `HT-${Date.now().toString().slice(-4)}-X`,
      heatTrackingRequired: data.heatTrackingRequired,
      batchTrackingRequired: data.batchTrackingRequired,
      operationTarget: data.operationTarget,
      status: 'available',
    };

    setProjects((prev) =>
      prev.map((p) => (p.id !== projectId ? p : { ...p, bomItems: [newBOMItem, ...p.bomItems] }))
    );
    addAuditLog('CREATE_BOM_ITEM', 'material', newBOMItem.id, data.partNo, `Added BOM line item for ${data.partNo} (${data.dimension}).`);
  };

  // START / PAUSE
  const startOperation = (jobCardId: string, stageId: string) => {
    const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setJobCards((prev) =>
      prev.map((jc) => {
        if (jc.id !== jobCardId) return jc;
        const updatedOps = jc.operations.map((op) => {
          if (op.stageId !== stageId) return op;
          return {
            ...op,
            status: 'in_progress' as const,
            isRunning: true,
            timerStartedAt: Date.now(),
            startTime: op.startTime || nowIso,
            quantities: {
              ...op.quantities,
              inProgress: op.quantities.inProgress || (op.quantities.pending > 0 ? 1 : 0),
              pending: Math.max(0, op.quantities.pending - (op.quantities.inProgress === 0 && op.quantities.pending > 0 ? 1 : 0)),
            },
          };
        });
        return { ...jc, currentStageId: stageId, overallStatus: 'in_progress', operations: updatedOps };
      })
    );
    addAuditLog('START_OPERATION', 'job_card', jobCardId, stageId, `Started workstation operation '${stageId}' on ${jobCardId}.`);
  };

  const pauseOperation = (jobCardId: string, stageId: string) => {
    setJobCards((prev) =>
      prev.map((jc) => {
        if (jc.id !== jobCardId) return jc;
        const updatedOps = jc.operations.map((op) => {
          if (op.stageId !== stageId) return op;
          let addedHours = 0;
          if (op.timerStartedAt) {
            addedHours = Math.round(((Date.now() - op.timerStartedAt) / 3600000) * 10) / 10;
          }
          return {
            ...op,
            isRunning: false,
            timerStartedAt: undefined,
            actualHours: Math.round((op.actualHours + addedHours) * 10) / 10,
          };
        });
        return { ...jc, operations: updatedOps };
      })
    );
  };

  // UPDATE STAGE QUANTITIES WITH SCRAP AND PROOF
  const updateStageQuantities = (
    jobCardId: string,
    stageId: string,
    newQtys: Partial<StageQuantities>,
    scrapWeightKg?: number,
    proof?: ProofMedia
  ) => {
    const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setJobCards((prev) =>
      prev.map((jc) => {
        if (jc.id !== jobCardId) return jc;
        const targetIdx = jc.operations.findIndex((o) => o.stageId === stageId);
        if (targetIdx === -1) return jc;

        const targetOp = jc.operations[targetIdx];
        const prevCompleted = targetOp.quantities.completed;
        const mergedTargetQuantities: StageQuantities = { ...targetOp.quantities, ...newQtys };
        const deltaCompleted = Math.max(0, mergedTargetQuantities.completed - prevCompleted);
        const isFullyCompleted = mergedTargetQuantities.completed >= jc.totalQuantity;

        const updatedOps = jc.operations.map((op, idx) => {
          if (idx === targetIdx) {
            const mergedProofs = proof ? [...(op.proofs || []), proof] : op.proofs || [];
            return {
              ...op,
              quantities: mergedTargetQuantities,
              scrapWeightKg: scrapWeightKg !== undefined ? scrapWeightKg : op.scrapWeightKg,
              proofs: mergedProofs,
              status: isFullyCompleted ? ('completed' as const) : op.status === 'pending' && mergedTargetQuantities.inProgress > 0 ? ('in_progress' as const) : op.status,
              startTime: op.startTime || (deltaCompleted > 0 || mergedTargetQuantities.inProgress > 0 ? nowIso : null),
              endTime: isFullyCompleted ? nowIso : op.endTime,
              isRunning: isFullyCompleted ? false : op.isRunning,
            };
          }

          // Pass newly completed pieces to the next downstream operation
          if (idx === targetIdx + 1 && deltaCompleted > 0) {
            const moveCount = Math.min(op.quantities.pending, deltaCompleted);
            if (moveCount > 0 || op.status === 'pending') {
              return {
                ...op,
                status: op.status === 'pending' ? ('in_progress' as const) : op.status,
                quantities: {
                  ...op.quantities,
                  pending: Math.max(0, op.quantities.pending - moveCount),
                  inProgress: op.quantities.inProgress + moveCount,
                },
              };
            }
          }

          return op;
        });

        const nextOp = updatedOps[targetIdx + 1];
        const nextCurrentStageId =
          jc.currentStageId === stageId && isFullyCompleted && nextOp
            ? nextOp.stageId
            : jc.currentStageId;
        const allOpsDone = updatedOps.every((op) => op.status === 'completed');

        return {
          ...jc,
          currentStageId: nextCurrentStageId,
          overallStatus: allOpsDone ? ('completed' as const) : jc.overallStatus,
          operations: updatedOps,
        };
      })
    );

    addAuditLog(
      'UPDATE_QUANTITIES',
      'job_card',
      jobCardId,
      stageId,
      `Updated stage '${stageId}' quantities on ${jobCardId}: ${newQtys.completed !== undefined ? `${newQtys.completed} completed` : ''} ${scrapWeightKg ? `(${scrapWeightKg} kg scrap)` : ''}`,
      proof?.url
    );
  };

  const assignOperatorAndMachine = (
    jobCardId: string,
    stageId: string,
    operatorId: string,
    machineId: string
  ) => {
    const operator = operators.find((o) => o.id === operatorId);
    const machine = machines.find((m) => m.id === machineId);
    if (!operator || !machine) return;

    setJobCards((prev) =>
      prev.map((jc) => {
        if (jc.id !== jobCardId) return jc;
        const updatedOps = jc.operations.map((op) => (op.stageId === stageId ? { ...op, operator, machine } : op));
        return { ...jc, operations: updatedOps };
      })
    );
  };

  const addProofToOperation = (jobCardId: string, stageId: string, proof: ProofMedia) => {
    setJobCards((prev) =>
      prev.map((jc) => {
        if (jc.id !== jobCardId) return jc;
        const updatedOps = jc.operations.map((op) => {
          if (op.stageId !== stageId) return op;
          return { ...op, proofs: [...(op.proofs || []), proof] };
        });
        return { ...jc, operations: updatedOps };
      })
    );
    addAuditLog('UPLOAD_PROOF', 'job_card', jobCardId, stageId, `Uploaded proof evidence '${proof.caption}' to stage ${stageId}.`, proof.url);
  };

  const moveJobCardToStage = (jobCardId: string, fromStageId: string, toStageId: string) => {
    if (fromStageId === toStageId) return;
    const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 16);

    setJobCards((prev) =>
      prev.map((jc) => {
        if (jc.id !== jobCardId) return jc;
        const fromOp = jc.operations.find((o) => o.stageId === fromStageId);
        const movableQty =
          (fromOp?.quantities.inProgress || 0) + (fromOp?.quantities.pending || 0) || jc.totalQuantity;

        const hasTargetOp = jc.operations.some((o) => o.stageId === toStageId);
        let updatedOps = jc.operations.map((op) => {
          if (op.stageId === fromStageId) {
            return {
              ...op,
              status: 'completed' as const,
              isRunning: false,
              endTime: nowIso,
              quantities: {
                ...op.quantities,
                completed: Math.min(jc.totalQuantity, op.quantities.completed + (op.quantities.inProgress + op.quantities.pending)),
                inProgress: 0,
                pending: 0,
              },
            };
          }
          if (op.stageId === toStageId) {
            const addedQty = Math.min(jc.totalQuantity - op.quantities.completed, Math.max(1, movableQty));
            return {
              ...op,
              status: 'in_progress' as const,
              startTime: op.startTime || nowIso,
              quantities: {
                ...op.quantities,
                inProgress: Math.max(op.quantities.inProgress, addedQty),
                pending: Math.max(0, jc.totalQuantity - op.quantities.completed - Math.max(op.quantities.inProgress, addedQty)),
              },
            };
          }
          return op;
        });

        if (!hasTargetOp) {
          const globalStage = workflowStages.find((s) => s.id === toStageId);
          if (globalStage) {
            updatedOps = [
              ...updatedOps,
              {
                id: `op_${jc.id}_${globalStage.id}`,
                stageId: globalStage.id,
                stageName: globalStage.name,
                sequence: updatedOps.length + 1,
                category: globalStage.category,
                departmentCode: globalStage.departmentCode,
                status: 'in_progress' as const,
                operator: operators[0],
                machine: machines[0],
                material: fromOp?.material || {
                  grade: 'Structural Steel',
                  heatNumber: 'Allocated',
                  dimension: 'Standard',
                  batchNo: `B-${jc.id}`,
                },
                plannedHours: 8,
                actualHours: 0,
                reworkHours: 0,
                startTime: nowIso,
                endTime: null,
                isRunning: false,
                quantities: {
                  completed: 0,
                  inProgress: movableQty,
                  pending: Math.max(0, jc.totalQuantity - movableQty),
                  rework: 0,
                  scrap: 0,
                },
                inspection: {
                  inspectorId: 'QC-401',
                  inspectorName: 'Vikram Singh',
                  result: 'pending' as const,
                  remarks: 'Moved via Shopfloor Kanban.',
                },
              },
            ];
          }
        }

        return {
          ...jc,
          currentStageId: toStageId,
          overallStatus: toStageId === 'dispatch' ? jc.overallStatus : 'in_progress',
          operations: updatedOps,
        };
      })
    );

    const movedJob = jobCards.find((j) => j.id === jobCardId);
    addAuditLog(
      'KANBAN_STAGE_MOVE',
      'job_card',
      jobCardId,
      movedJob?.partNo || jobCardId,
      `Moved work order ${movedJob?.partNo || jobCardId} from '${fromStageId}' to '${toStageId}' on Shopfloor Kanban Board.`
    );
  };

  // STORE ISSUE
  const issueMaterialToJobCard = (
    jobCardId: string,
    data: { issueSlipNo: string; issuedBy: string; heatNumbers: string[]; notes: string }
  ) => {
    const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setJobCards((prev) =>
      prev.map((jc) => {
        if (jc.id !== jobCardId) return jc;
        const updatedOps = jc.operations.map((op) => {
          if (op.stageId === 'material_issue') {
            return {
              ...op,
              status: 'completed' as const,
              startTime: op.startTime || nowIso,
              endTime: nowIso,
              material: { ...op.material, heatNumber: data.heatNumbers.join(', ') },
              quantities: { ...op.quantities, completed: jc.totalQuantity, pending: 0 },
              inspection: {
                ...op.inspection,
                result: 'pass' as const,
                remarks: `Store issued via slip #${data.issueSlipNo}. Heat numbers ${data.heatNumbers.join(', ')} verified.`,
              },
            };
          }
          if (op.stageId === 'cutting' && op.status === 'pending') {
            return {
              ...op,
              status: 'in_progress' as const,
              quantities: { ...op.quantities, pending: jc.totalQuantity },
            };
          }
          return op;
        });

        return {
          ...jc,
          materialIssue: {
            issueSlipNo: data.issueSlipNo,
            issuedBy: data.issuedBy,
            issueDate: nowIso,
            heatNumbers: data.heatNumbers,
            testCertVerified: true,
            notes: data.notes,
          },
          operations: updatedOps,
        };
      })
    );

    addAuditLog(
      'ISSUE_MATERIAL',
      'material',
      jobCardId,
      data.issueSlipNo,
      `Stores issued material under slip #${data.issueSlipNo}. Heats: ${data.heatNumbers.join(', ')}. Cutting station activated.`
    );
  };

  // QC INSPECTION
  const submitQCInspection = (
    jobCardId: string,
    stageId: string,
    data: {
      result: QCResult;
      remarks: string;
      dimensionChecks?: DimensionCheck[];
      weldingVisuals?: {
        porosity: 'none' | 'acceptable' | 'reject';
        undercut: 'none' | 'acceptable' | 'reject';
        penetration: 'full' | 'partial' | 'rework';
      };
      proofUrl?: string;
    }
  ) => {
    const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setJobCards((prev) =>
      prev.map((jc) => {
        if (jc.id !== jobCardId) return jc;
        const updatedOps = jc.operations.map((op) => {
          if (op.stageId !== stageId) return op;
          return {
            ...op,
            status:
              data.result === 'pass'
                ? ('completed' as const)
                : data.result === 'rework'
                ? ('rework' as const)
                : data.result === 'hold'
                ? ('on_hold' as const)
                : op.status,
            inspection: {
              ...op.inspection,
              result: data.result,
              remarks: data.remarks,
              inspectionDate: nowIso,
              dimensionChecks: data.dimensionChecks || op.inspection.dimensionChecks,
              weldingVisuals: data.weldingVisuals || op.inspection.weldingVisuals,
              proofUrls: data.proofUrl ? [...(op.inspection.proofUrls || []), data.proofUrl] : op.inspection.proofUrls,
            },
          };
        });

        return {
          ...jc,
          overallStatus: data.result === 'rework' ? 'rework' : data.result === 'hold' ? 'on_hold' : jc.overallStatus,
          operations: updatedOps,
        };
      })
    );

    addAuditLog(
      data.result === 'pass' ? 'PASS_INSPECTION' : 'FAIL_INSPECTION',
      'inspection',
      jobCardId,
      stageId,
      `QC Inspection on '${stageId}': ${data.result.toUpperCase()}. ${data.remarks}`,
      data.proofUrl,
      data.result === 'pass' ? 'success' : 'alert'
    );
  };

  // REWORK ROUTING & LOOPBACK
  const createReworkFallbackTicket = (data: {
    jobCardId: string;
    fromStageId: string;
    toStageId: string;
    quantity: number;
    defectCategory: ReworkTicket['defectCategory'];
    defectDetails: string;
    correctiveAction: string;
    inspectorName: string;
    evidencePhotoUrl?: string;
  }) => {
    const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newTicketId = `rwk_${Date.now().toString().slice(-4)}`;

    setJobCards((prev) =>
      prev.map((jc) => {
        if (jc.id !== data.jobCardId) return jc;

        const fromOp = jc.operations.find((o) => o.stageId === data.fromStageId);
        const toOp = jc.operations.find((o) => o.stageId === data.toStageId);

        const newTicket: ReworkTicket = {
          id: newTicketId,
          jobCardId: data.jobCardId,
          correctiveJobCardId: `${data.jobCardId}_corr_${newTicketId}`,
          partNo: jc.partNo,
          fromStageId: data.fromStageId,
          fromStageName: fromOp?.stageName || data.fromStageId,
          toStageId: data.toStageId,
          toStageName: toOp?.stageName || data.toStageId,
          quantity: data.quantity,
          defectCategory: data.defectCategory,
          defectDetails: data.defectDetails,
          correctiveAction: data.correctiveAction,
          inspectorName: data.inspectorName,
          timestamp: nowIso,
          status: 'open',
          loggedReworkHours: 0,
          evidencePhotoUrl: data.evidencePhotoUrl,
        };

        const updatedOps = jc.operations.map((op) => {
          if (op.stageId === data.fromStageId) {
            return {
              ...op,
              status: 'rework' as const,
              quantities: {
                ...op.quantities,
                rework: (op.quantities.rework || 0) + data.quantity,
                inProgress: Math.max(0, (op.quantities.inProgress || 0) - data.quantity),
              },
            };
          }
          if (op.stageId === data.toStageId) {
            return {
              ...op,
              status: 'rework' as const,
              quantities: {
                ...op.quantities,
                rework: (op.quantities.rework || 0) + data.quantity,
              },
              workInstructions: `[CORRECTIVE REWORK FROM ${fromOp?.stageName}]: ${data.correctiveAction}`,
            };
          }
          return op;
        });

        return {
          ...jc,
          currentStageId: data.toStageId,
          overallStatus: 'rework',
          reworkTickets: [newTicket, ...jc.reworkTickets],
          operations: updatedOps,
        };
      })
    );

    addAuditLog(
      'CREATE_REWORK_TICKET',
      'rework',
      newTicketId,
      data.defectCategory,
      `Non-linear rework created: Routed ${data.quantity} piece back to '${data.toStageId}' for '${data.defectCategory}'. Defect: ${data.defectDetails}`,
      data.evidencePhotoUrl,
      'alert'
    );
  };

  // COMPLETE REWORK EXECUTION (SENDS BACK TO ORIGINATING GATE / QC FOR RE-INSPECTION)
  const completeReworkExecution = (
    jobCardId: string,
    ticketId: string,
    hoursSpent: number,
    repairNotes: string
  ) => {
    setJobCards((prev) =>
      prev.map((jc) => {
        if (jc.id !== jobCardId) return jc;

        const targetTicket = jc.reworkTickets.find((t) => t.id === ticketId);
        const repairStageId = targetTicket?.toStageId || 'welding';
        const returnGateId = targetTicket?.fromStageId || 'inspection';
        const qty = targetTicket?.quantity || 1;

        const updatedTickets = jc.reworkTickets.map((t) => {
          if (t.id !== ticketId) return t;
          return {
            ...t,
            status: 'reinspected' as const,
            loggedReworkHours: (t.loggedReworkHours || 0) + hoursSpent,
          };
        });

        // Rework is executed; place item back into the originating QC / gate queue for re-inspection
        const updatedOps = jc.operations.map((op) => {
          if (op.stageId === repairStageId && op.stageId !== returnGateId) {
            return {
              ...op,
              status: 'completed' as const,
              reworkHours: (op.reworkHours || 0) + hoursSpent,
              quantities: {
                ...op.quantities,
                rework: Math.max(0, (op.quantities.rework || 0) - qty),
                completed: Math.min(jc.totalQuantity, op.quantities.completed + qty),
              },
            };
          }
          if (op.stageId === returnGateId) {
            return {
              ...op,
              status: 'in_progress' as const,
              quantities: {
                ...op.quantities,
                rework: Math.max(0, (op.quantities.rework || 0) - qty),
                inProgress: op.quantities.inProgress + qty,
              },
            };
          }
          return op;
        });

        return {
          ...jc,
          currentStageId: returnGateId,
          overallStatus: 'in_progress',
          reworkTickets: updatedTickets,
          operations: updatedOps,
        };
      })
    );

    addAuditLog(
      'COMPLETE_REWORK',
      'rework',
      ticketId,
      'RWK-DONE',
      `Rework repair completed (${hoursSpent} hrs). Action: ${repairNotes}. Returned to inspection queue for verification.`
    );
  };

  // PASS QC RE-INSPECTION (UNLOCKS REST OF ROUTE)
  const passQCReinspection = (jobCardId: string, ticketId: string, remarks: string) => {
    const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setJobCards((prev) =>
      prev.map((jc) => {
        if (jc.id !== jobCardId) return jc;

        const targetTicket = jc.reworkTickets.find((t) => t.id === ticketId);
        const gateStageId = targetTicket?.fromStageId || 'inspection';
        const gateIdx = jc.operations.findIndex((o) => o.stageId === gateStageId);
        const nextStageOp = gateIdx >= 0 ? jc.operations[gateIdx + 1] : jc.operations.find((o) => o.stageId === 'machining');

        const updatedTickets = jc.reworkTickets.map((t) => {
          if (t.id !== ticketId) return t;
          return { ...t, status: 'closed' as const };
        });

        const updatedOps = jc.operations.map((op) => {
          if (op.stageId === gateStageId) {
            return {
              ...op,
              status: 'completed' as const,
              quantities: { completed: jc.totalQuantity, inProgress: 0, pending: 0, rework: 0, scrap: op.quantities.scrap },
              inspection: {
                ...op.inspection,
                result: 'pass' as const,
                remarks: `Re-inspection PASSED: ${remarks}`,
                inspectionDate: nowIso,
              },
            };
          }
          if (nextStageOp && op.stageId === nextStageOp.stageId && op.status !== 'completed') {
            return {
              ...op,
              status: 'in_progress' as const,
              quantities: { ...op.quantities, inProgress: jc.totalQuantity, pending: 0 },
            };
          }
          return op;
        });

        return {
          ...jc,
          currentStageId: nextStageOp?.stageId || gateStageId,
          overallStatus: 'in_progress',
          reworkTickets: updatedTickets,
          operations: updatedOps,
        };
      })
    );

    addAuditLog(
      'PASS_REINSPECTION',
      'inspection',
      ticketId,
      'QC-PASS',
      `QC Re-inspection PASSED for ${jobCardId}. Rework verified and closed; downstream route resumed.`
    );
  };

  // COMPLETE SUB-ASSEMBLY
  const completeSubAssembly = (jobCardId: string) => {
    setJobCards((prev) =>
      prev.map((jc) => {
        if (jc.id !== jobCardId) return jc;
        const allCompletedOps = jc.operations.map((op) => ({
          ...op,
          status: 'completed' as const,
          quantities: { completed: jc.totalQuantity, inProgress: 0, pending: 0, rework: 0, scrap: op.quantities.scrap },
        }));
        return {
          ...jc,
          overallStatus: 'completed' as const,
          currentStageId: 'painting',
          operations: allCompletedOps,
        };
      })
    );
    addAuditLog('COMPLETE_SUB_ASSEMBLY', 'assembly', jobCardId, jobCards.find((j) => j.id === jobCardId)?.partNo || jobCardId, `Sub-Assembly completed and locked. Ready for Main Assembly.`);
  };

  // COMPLETE MAIN ASSEMBLY
  const completeMainAssembly = (mainAssemblyId: string) => {
    setJobCards((prev) =>
      prev.map((jc) => {
        if (jc.id !== mainAssemblyId) return jc;
        const allCompletedOps = jc.operations.map((op) => ({
          ...op,
          status: 'completed' as const,
          quantities: { completed: jc.totalQuantity, inProgress: 0, pending: 0, rework: 0, scrap: 0 },
        }));
        return {
          ...jc,
          overallStatus: 'completed' as const,
          operations: allCompletedOps,
        };
      })
    );
    addAuditLog('COMPLETE_MAIN_ASSEMBLY', 'assembly', mainAssemblyId, 'ARM-ASM', `Arm Main Assembly completed! All Sub-Assemblies (Boom, Dipper, Bucket) and Bought-Out items integrated.`);
  };

  // COMPLETE MASTER PROJECT
  const completeMasterProject = (projectId: string) => {
    setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, status: 'completed' as const } : p)));
    setJobCards((prev) =>
      prev.map((jc) => {
        if (jc.projectId !== projectId) return jc;
        return { ...jc, overallStatus: 'completed' as const };
      })
    );
    addAuditLog('COMPLETE_PROJECT', 'project', projectId, 'JCB-001', `Master Excavator Project JCB-001 completely fabricated, inspected, and ready for dispatch!`);
  };

  // FINAL DISPATCH
  const dispatchJobCard = (jobCardId: string, notes: string) => {
    const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setJobCards((prev) =>
      prev.map((jc) => {
        if (jc.id !== jobCardId) return jc;
        const updatedOps = jc.operations.map((op) => {
          if (op.stageId === 'dispatch') {
            return {
              ...op,
              status: 'completed' as const,
              startTime: op.startTime || nowIso,
              endTime: nowIso,
              quantities: { ...op.quantities, completed: jc.totalQuantity, pending: 0 },
              inspection: { ...op.inspection, result: 'pass' as const, remarks: `Dispatched: ${notes}` },
            };
          }
          return op;
        });
        return { ...jc, overallStatus: 'completed', currentStageId: 'dispatch', operations: updatedOps };
      })
    );
    addAuditLog('DISPATCH', 'job_card', jobCardId, 'DSP-001', `Dispatched job card ${jobCardId} with PDI certificate. Notes: ${notes}`);
  };

  // 13-STEP CLIENT DEMO SCRIPT RUNNER & SIMULATOR
  const runDemoStep = (stepNumber: number) => {
    setDemoStep(stepNumber);
    switch (stepNumber) {
      case 1: // Project Manager opens JCB-001
        setUserRole('project_manager');
        setActiveProjectId('prj_jcb_001');
        setActiveJobCardId('jc_boom_01');
        setCurrentTab('dashboard');
        addAuditLog(
          'DEMO_OVERVIEW',
          'project',
          'prj_jcb_001',
          'JCB-001',
          'Demonstrated Project Manager overview of 4 Sets 220X Excavator package.'
        );
        break;
      case 2: // Show product structure hierarchy
        setUserRole('project_manager');
        setCurrentTab('assembly_hierarchy');
        addAuditLog(
          'DEMO_HIERARCHY',
          'project',
          'prj_jcb_001',
          'ARM-ASM',
          'Reviewed 3-tier hierarchy: JCB-001 -> ARM-ASM -> Boom, Dipper, Bucket + 4 Bought-Out items.'
        );
        break;
      case 3: // Route assignment & customization
        setUserRole('project_manager');
        setActiveJobCardId('jc_boom_01');
        setCurrentTab('workflow_builder');
        applyTemplateToSubAssembly('jc_boom_01', 'tmpl_std_fab');
        break;
      case 4: // Release drawing
        setUserRole('project_manager');
        setCurrentTab('drawing_release');
        releaseDrawingRevision(
          'dwg_boom_01',
          'Ananya Sharma (PM)',
          'Approved for cutting release per ECO-2026-081'
        );
        break;
      case 5: // Material requirement & MRP
        setUserRole('stores');
        setCurrentTab('bom_requirement');
        addAuditLog(
          'BOM_REVIEW',
          'job_card',
          'jc_boom_01',
          'BOM-BCM-SF-001',
          'Verified 15,800 kg IS 2062 E350 structural steel plate requirement against current stock.'
        );
        break;
      case 6: // Issue material
        setUserRole('stores');
        setCurrentTab('material_issued');
        issueMaterialToJobCard('jc_boom_01', {
          issueSlipNo: 'MIS-2026-0041',
          issuedBy: 'Dinesh Patil (Stores)',
          heatNumbers: ['HT-2026-9921', 'HT-2026-9922'],
          notes: '15,800 kg IS 2062 E350 issued to cutting bay for CNC profiling',
        });
        break;
      case 7: // Cutting operator with scrap & proof
        setUserRole('operator');
        setActiveJobCardId('jc_boom_01');
        setActiveStageId('cutting');
        setCurrentTab('cutting');
        updateStageQuantities(
          'jc_boom_01',
          'cutting',
          { completed: 4, inProgress: 0, pending: 0 },
          18.5,
          {
            id: `proof_cut_${Date.now()}`,
            entityType: 'job_card',
            entityId: 'jc_boom_01',
            stageId: 'cutting',
            type: 'image',
            url: '/public/assets/aistudio/image_7b8a5e34.png',
            caption: 'CNC Laser cutting complete. 18.5kg scrap plate offcut recorded in scrap balance.',
            uploadedBy: 'Ganesh Shinde (CNC Operator)',
            uploadedAt: new Date().toISOString().substring(0, 16).replace('T', ' '),
          }
        );
        break;
      case 8: // Fit-up & Welding
        setUserRole('operator');
        setActiveJobCardId('jc_boom_01');
        setActiveStageId('welding');
        setCurrentTab('welding');
        updateStageQuantities('jc_boom_01', 'fitup', { completed: 4, inProgress: 0, pending: 0 });
        updateStageQuantities(
          'jc_boom_01',
          'welding',
          { completed: 4, inProgress: 0, pending: 0 },
          0,
          {
            id: `proof_wld_${Date.now()}`,
            entityType: 'job_card',
            entityId: 'jc_boom_01',
            stageId: 'welding',
            type: 'image',
            url: '/public/assets/aistudio/image_75b0e7a9.png',
            caption: 'Full-penetration longitudinal welds completed per WPS-JCB-E350-01.',
            uploadedBy: 'Mohan Lal (Welder)',
            uploadedAt: new Date().toISOString().substring(0, 16).replace('T', ' '),
          }
        );
        break;
      case 9: // QC inspection fail with weld gap photo
        setUserRole('quality');
        setActiveJobCardId('jc_boom_01');
        setActiveStageId('inspection');
        setCurrentTab('inspection');
        submitQCInspection('jc_boom_01', 'inspection', {
          result: 'fail',
          remarks: 'Weld Root Gap measured 4.5mm at Joint J-02. Exceeds WPS max 2.5mm limit. Requires gouge and repair.',
          dimensionChecks: [
            { id: 'dc_1', parameter: 'Root Gap Joint J-02', nominal: '2.0 mm', tolerance: '± 0.5 mm', actual: '4.5 mm', status: 'out_of_spec' },
            { id: 'dc_2', parameter: 'Bevel Angle', nominal: '30°', tolerance: '± 2.5°', actual: '30.5°', status: 'ok' },
          ],
          proofUrl: '/public/assets/aistudio/image_f341b204.png',
        });
        createReworkFallbackTicket({
          jobCardId: 'jc_boom_01',
          fromStageId: 'inspection',
          toStageId: 'welding',
          quantity: 1,
          defectCategory: 'Weld Root Gap Exceeded',
          defectDetails: 'Root gap 4.5mm > 2.5mm WPS tolerance. Defect photo attached.',
          correctiveAction: 'Gouge out root pass, re-bevel to 30 deg, preheat to 120C, and re-weld per WPS-JCB-E350-01.',
          inspectorName: 'Vikram Singh (ASNT Level II)',
          evidencePhotoUrl: '/public/assets/aistudio/image_f341b204.png',
        });
        break;
      case 10: // Welding rework
        setUserRole('operator');
        setActiveJobCardId('jc_boom_01');
        setActiveStageId('welding');
        setCurrentTab('welding');
        const jc10 = jobCards.find((j) => j.id === 'jc_boom_01');
        const openTicket = jc10?.reworkTickets.find((t) => t.status === 'open');
        if (openTicket) {
          completeReworkExecution(
            'jc_boom_01',
            openTicket.id,
            1.5,
            'Gouged root pass, re-beveled, welded with Fronius 500i per WPS-JCB-E350-01.'
          );
        }
        break;
      case 11: // QC pass re-inspection
        setUserRole('quality');
        setActiveJobCardId('jc_boom_01');
        setActiveStageId('inspection');
        setCurrentTab('inspection');
        const jc11 = jobCards.find((j) => j.id === 'jc_boom_01');
        const inProgressTicket = jc11?.reworkTickets.find(
          (t) => t.status === 'in_progress' || t.status === 'open'
        );
        if (inProgressTicket) {
          passQCReinspection(
            'jc_boom_01',
            inProgressTicket.id,
            'Ultrasonic test (UT) & MPI passed. 100% root penetration confirmed. Green Tag released.'
          );
        } else {
          submitQCInspection('jc_boom_01', 'inspection', {
            result: 'pass',
            remarks: 'Re-inspection completed. 100% ultrasonic examination confirmed root fusion. Released to Machining.',
          });
        }
        break;
      case 12: // Boom sub-assembly complete
        setUserRole('project_manager');
        setActiveJobCardId('jc_boom_01');
        setCurrentTab('assembly_hierarchy');
        completeSubAssembly('jc_boom_01');
        break;
      case 13: // Arm Main Assembly complete -> JCB Project complete
        setUserRole('project_manager');
        setActiveJobCardId('jc_arm_main');
        setCurrentTab('traceability');
        completeMainAssembly('jc_arm_main');
        completeMasterProject('prj_jcb_001');
        break;
    }
  };

  return (
    <ERPContext.Provider
      value={{
        projects,
        jobCards,
        machines,
        operators,
        workflowStages,
        workflowTemplates,
        drawings,
        auditLogs,
        activeProjectId,
        activeJobCardId,
        activeStageId,
        userRole,
        currentTab,
        isDarkMode,
        activeJobCard,
        activeProject,
        permissions,
        demoStep,
        isDemoTourOpen,
        setIsDemoTourOpen,
        runDemoStep,
        isDemoMode,
        toggleDemoMode,
        setActiveProjectId,
        setActiveJobCardId,
        setActiveStageId,
        setUserRole,
        setCurrentTab,
        toggleDarkMode,
        resetToDemoData,
        addAuditLog,
        updateWorkflowStage,
        addWorkflowStage,
        deleteWorkflowStage,
        addCustomFieldToStage,
        applyTemplateToSubAssembly,
        customizeSubAssemblyRouteStage,
        createDrawingRecord,
        releaseDrawingRevision,
        createNewFabricationJob,
        createBOMRecord,
        startOperation,
        pauseOperation,
        updateStageQuantities,
        assignOperatorAndMachine,
        addProofToOperation,
        moveJobCardToStage,
        issueMaterialToJobCard,
        submitQCInspection,
        createReworkFallbackTicket,
        completeReworkExecution,
        passQCReinspection,
        completeSubAssembly,
        completeMainAssembly,
        completeMasterProject,
        dispatchJobCard,
      }}
    >
      {children}
    </ERPContext.Provider>
  );
};

export const useERP = (): ERPContextType => {
  const context = useContext(ERPContext);
  if (!context) {
    throw new Error('useERP must be used within an ERPProvider');
  }
  return context;
};
