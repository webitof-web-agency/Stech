import React from 'react';
import { useERP } from '../context/ERPContext';
import { NavigationTab } from '../types/erp';
import {
  LayoutDashboard,
  FileText,
  ListTree,
  Boxes,
  ClipboardList,
  PackageCheck,
  Scissors,
  Hammer,
  Flame,
  Cog,
  CheckCircle2,
  Paintbrush,
  Layers,
  Truck,
  Sliders,
  ChevronLeft,
  ChevronRight,
  GitMerge,
  History,
} from 'lucide-react';

interface SidebarNavProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenNewJobModal: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  isCollapsed,
  onToggleCollapse,
  onOpenNewJobModal,
}) => {
  const { currentTab, setCurrentTab, userRole, setUserRole, setActiveStageId, activeProject } = useERP();

  const navItems: { tab: NavigationTab; label: string; icon: React.ElementType; stageId?: string; badge?: string }[] = [
    { tab: 'flow_map', label: 'Flow Map & Actions', icon: GitMerge, badge: 'MAP' },
    { tab: 'dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
    { tab: 'assembly_hierarchy', label: 'Product Hierarchy', icon: Layers, badge: '3-TIER' },
    { tab: 'workflow_builder', label: 'Workflow Templates', icon: Sliders },
    { tab: 'drawing_release', label: 'Drawing Release Gate', icon: FileText, stageId: 'drawing_release' },
    { tab: 'bom_requirement', label: 'BOM & Material Need', icon: ListTree },
    { tab: 'material_issued', label: 'Material Issued (Store)', icon: PackageCheck, stageId: 'material_issue' },
    { tab: 'work_orders', label: 'Live Floor Board', icon: ClipboardList },
    { tab: 'cutting', label: 'Cutting & Drilling', icon: Scissors, stageId: 'cutting' },
    { tab: 'fitup', label: 'Fit-up & Tack', icon: Hammer, stageId: 'fitup' },
    { tab: 'welding', label: 'Welding Bay (Rework)', icon: Flame, stageId: 'welding', badge: 'REWORK' },
    { tab: 'inspection', label: 'QC Inspection & Fail', icon: CheckCircle2, stageId: 'inspection' },
    { tab: 'machining', label: 'Machining & Boring', icon: Cog, stageId: 'machining' },
    { tab: 'painting', label: 'Shot Blast & Painting', icon: Paintbrush, stageId: 'painting' },
    { tab: 'assembly', label: 'Main Assembly', icon: Layers, stageId: 'assembly' },
    { tab: 'traceability', label: 'Traceability & Audit', icon: History, badge: 'LOGS' },
    { tab: 'dispatch', label: 'Final Dispatch Gate', icon: Truck, stageId: 'dispatch' },
  ];

  const handleSelectTab = (item: typeof navItems[0]) => {
    setCurrentTab(item.tab);
    if (item.stageId) {
      setActiveStageId(item.stageId);
      if (item.stageId === 'inspection') {
        setUserRole('quality');
      } else if (item.stageId === 'material_issue') {
        setUserRole('stores');
      } else if (item.stageId === 'dispatch') {
        setUserRole('project_manager');
      } else {
        setUserRole('operator');
      }
    } else if (item.tab === 'bom_requirement' || item.tab === 'material_mrp') {
      setUserRole('stores');
    } else if (item.tab === 'dashboard' || item.tab === 'assembly_hierarchy' || item.tab === 'flow_map') {
      setUserRole('project_manager');
    } else if (item.tab === 'work_orders') {
      setUserRole('department_hod');
    } else if (item.tab === 'drawing_release') {
      setUserRole('project_manager');
    } else if (item.tab === 'workflow_builder') {
      setUserRole('admin');
    } else if (item.tab === 'traceability') {
      setUserRole('management_viewer');
    }
  };

  return (
    <aside
      className={`shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col z-20 ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-slate-200 dark:border-slate-800">
        {!isCollapsed && (
          <div className="min-w-0 pr-1">
            <div className="text-[11px] font-bold text-amber-500 uppercase tracking-wider font-mono">
              STECH WORKFLOW
            </div>
            <div className="text-xs text-slate-500 font-medium truncate">
              {activeProject ? `${activeProject.code} · Active Line` : 'Fabrication Line'}
            </div>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mx-auto cursor-pointer"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.tab;

          return (
            <button
              key={item.tab}
              onClick={() => handleSelectTab(item)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
              {!isCollapsed && (
                <span className="truncate flex-1">
                  {item.label}
                </span>
              )}
              {!isCollapsed && item.badge && !isActive && (
                <span className={`text-[9px] px-1 py-0.2 rounded font-mono font-bold ${
                  item.badge === 'REWORK' ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300' :
                  item.badge === 'LOGS' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' :
                  'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer: + New Work Order CTA */}
      <div className="p-2 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={onOpenNewJobModal}
          className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-xs cursor-pointer ${
            isCollapsed ? 'px-1' : 'px-3'
          }`}
          title="Create a new fabrication job"
        >
          <span className="text-base leading-none">+</span>
          {!isCollapsed && <span>New Work Order</span>}
        </button>
      </div>
    </aside>
  );
};
