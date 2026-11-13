import React, { useState, useRef, useEffect } from 'react';
import { useERP } from '../context/ERPContext';
import { UserRole } from '../types/erp';
import {
  Factory,
  Layers,
  Moon,
  Sun,
  ChevronDown,
  FolderKanban,
} from 'lucide-react';

export const TopNav: React.FC<{ onOpenTraveler: () => void }> = ({ onOpenTraveler }) => {
  const {
    projects,
    jobCards,
    activeProject,
    activeProjectId,
    activeJobCard,
    setActiveProjectId,
    setActiveJobCardId,
    userRole,
    setUserRole,
    setCurrentTab,
    setActiveStageId,
    isDarkMode,
    toggleDarkMode,
  } = useERP();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState(false);

  const projectRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (projectRef.current && !projectRef.current.contains(event.target as Node)) {
        setShowProjectMenu(false);
      }
      if (roleRef.current && !roleRef.current.contains(event.target as Node)) {
        setShowRoleMenu(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowProjectMenu(false);
        setShowRoleMenu(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // MERN Prototype Plan Roles
  const rolesList: { id: UserRole; label: string; department: string; desc: string; defaultTab: any; stageId?: string }[] = [
    {
      id: 'project_manager',
      label: 'Project Manager',
      department: 'MGT / PM',
      desc: 'Create/manage projects, assemblies, routes, drawing approvals, overall monitoring',
      defaultTab: 'dashboard',
    },
    {
      id: 'admin',
      label: 'System Admin',
      department: 'ADMIN',
      desc: 'Users, roles, departments, templates, all projects and settings',
      defaultTab: 'workflow_builder',
    },
    {
      id: 'design_engineer',
      label: 'Design Engineer',
      department: 'ENG',
      desc: 'Upload drawings, CAD specifications and revisions',
      defaultTab: 'drawing_release',
    },
    {
      id: 'stores',
      label: 'Stores / Material Officer',
      department: 'STR',
      desc: 'BOM review, stock availability, steel reservation and issue',
      defaultTab: 'material_issued',
      stageId: 'material_issue',
    },
    {
      id: 'department_hod',
      label: 'Department HOD / Supervisor',
      department: 'FAB-HOD',
      desc: 'View department queue, assign operators/machines, approve completions',
      defaultTab: 'work_orders',
    },
    {
      id: 'operator',
      label: 'Cutting & Drilling Operator',
      department: 'CUT',
      desc: 'Execute CNC laser/plasma profiling, record scrap metal, upload proof',
      defaultTab: 'cutting',
      stageId: 'cutting',
    },
    {
      id: 'operator',
      label: 'Welding Bay Operator',
      department: 'WLD',
      desc: 'Execute robotic & manual welding, repair rework items per WPS',
      defaultTab: 'welding',
      stageId: 'welding',
    },
    {
      id: 'quality',
      label: 'QC Inspector (ASNT Level II)',
      department: 'QC',
      desc: 'Checklist, pass/fail, defect evidence, non-linear rework routing and re-inspection',
      defaultTab: 'inspection',
      stageId: 'inspection',
    },
    {
      id: 'management_viewer',
      label: 'Management Viewer',
      department: 'EXEC',
      desc: 'Read-only dashboards, traceability timeline, and project rollup',
      defaultTab: 'traceability',
    },
  ];

  const currentRoleObj = rolesList.find((r) => r.id === userRole) || rolesList[0];

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-2 sm:gap-3 px-3 lg:px-6 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors max-w-full min-w-0">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-black shadow-xs">
          <Factory className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap">
            STECH Fabrication OS
          </span>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Fabrication Management Platform
          </span>
        </div>
      </div>

      {/* Zone 2: Project Switcher & RBAC Role Dropdown */}
      <div className="flex items-center gap-2 lg:gap-3 overflow-visible py-1">
        {/* 1. Project Selector Dropdown */}
        <div ref={projectRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setShowProjectMenu((prev) => !prev);
              setShowRoleMenu(false);
            }}
            className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 transition-colors cursor-pointer shadow-xs"
            title="Switch Active Fabrication Project"
            aria-expanded={showProjectMenu}
          >
            <FolderKanban className="w-3.5 h-3.5 text-amber-500" />
            <span className="max-w-[130px] sm:max-w-[210px] truncate">
              {activeProject ? activeProject.code : 'Select Project'}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${showProjectMenu ? 'rotate-180' : ''}`} />
          </button>

          {showProjectMenu && (
            <div className="absolute left-0 mt-1.5 w-80 py-1.5 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono border-b border-slate-100 dark:border-slate-700 mb-1">
                Select Project
              </div>
              <div className="max-h-64 overflow-y-auto py-0.5">
                {projects.map((p) => {
                  const isSelected = p.id === activeProjectId;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setActiveProjectId(p.id);
                        const firstJob = jobCards.find((jc) => jc.projectId === p.id);
                        setActiveJobCardId(firstJob ? firstJob.id : '');
                        setShowProjectMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-semibold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                      }`}
                    >
                      <div className="flex flex-col truncate pr-2">
                        <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {p.code} · {p.name.split('—')[1] || p.name}
                        </span>
                        <span className="text-[11px] text-slate-500 font-normal truncate">
                          Client: {p.client} ({p.totalBatchQuantity} {p.unit})
                        </span>
                      </div>
                      {isSelected && <span className="text-amber-600 font-bold text-xs ml-2">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 2. RBAC Role Switcher Dropdown ("View As") */}
        <div ref={roleRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setShowRoleMenu((prev) => !prev);
              setShowProjectMenu(false);
            }}
            className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 hover:bg-blue-100/70 dark:hover:bg-blue-900/60 transition-colors cursor-pointer shadow-xs"
            title="Switch User Role / View As"
            aria-expanded={showRoleMenu}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] uppercase font-mono px-1 py-0.2 rounded bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-100 font-bold">
              ROLE
            </span>
            <span className="max-w-[120px] sm:max-w-[170px] truncate">
              {currentRoleObj.label}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-blue-600 dark:text-blue-400 transition-transform duration-200 ${showRoleMenu ? 'rotate-180' : ''}`} />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 sm:left-0 mt-1.5 w-80 py-1.5 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono border-b border-slate-100 dark:border-slate-700 mb-1 flex items-center justify-between">
                <span>Switch Role / Department (RBAC)</span>
                <span className="text-amber-500 font-mono">DEMO SWITCH</span>
              </div>
              <div className="max-h-96 overflow-y-auto py-0.5">
                {rolesList.map((r, idx) => {
                  const isCurrent = userRole === r.id;
                  return (
                    <button
                      key={`${r.id}-${idx}`}
                      type="button"
                      onClick={() => {
                        setUserRole(r.id);
                        if (r.defaultTab) setCurrentTab(r.defaultTab);
                        if (r.stageId) setActiveStageId(r.stageId);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full flex items-start justify-between px-3 py-2 text-xs text-left transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 font-semibold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                      }`}
                    >
                      <div className="flex flex-col pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 dark:text-slate-100">
                            {r.label}
                          </span>
                          <span className="text-[9px] font-mono px-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {r.department}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-normal line-clamp-1 mt-0.5">
                          {r.desc}
                        </span>
                      </div>
                      {isCurrent && <span className="text-blue-600 font-bold text-xs ml-1 shrink-0">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Zone 3: Actions & Theme */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Printable Job Traveler Button */}
        <button
          type="button"
          onClick={onOpenTraveler}
          disabled={!activeJobCard}
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors whitespace-nowrap cursor-pointer"
          title={activeJobCard ? 'Print physical Job Card Traveler with signatures' : 'Create or select a job card first'}
        >
          <Layers className="w-3.5 h-3.5 text-slate-500" />
          <span>Traveler</span>
        </button>

        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleDarkMode}
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          aria-label="Toggle theme"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
