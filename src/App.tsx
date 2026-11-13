import React, { useState } from 'react';
import { ERPProvider, useERP } from './context/ERPContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { TopNav } from './components/TopNav';
import { DemoControllerBar } from './components/DemoControllerBar';
import { WorkflowFlowMap } from './components/WorkflowFlowMap';
import { SidebarNav } from './components/SidebarNav';
import { SupervisorDashboard } from './components/SupervisorDashboard';
import { ShopfloorBoard } from './components/ShopfloorBoard';
import { JobCardWorkstation } from './components/JobCardWorkstation';
import { QCInspectionStation } from './components/QCInspectionStation';
import { AssemblyTreeModule } from './components/AssemblyTreeModule';
import { DrawingReleaseModule } from './components/DrawingReleaseModule';
import { TraceabilityTimelineModule } from './components/TraceabilityTimelineModule';
import { BOMManagerModule } from './components/BOMManagerModule';
import { MRPModule } from './components/MRPModule';
import { MaterialStoreModule } from './components/MaterialStoreModule';
import { DispatchModule } from './components/DispatchModule';
import { WorkflowConfigurator } from './components/WorkflowConfigurator';
import { ReworkRoutingModal } from './components/ReworkRoutingModal';
import { JobCardTravelerModal } from './components/JobCardTravelerModal';
import { NewJobModal } from './components/NewJobModal';
import { JobCardDrawer } from './components/JobCardDrawer';
import { JobCard } from './types/erp';
import {
  LayoutGrid,
  Layers,
  Sliders,
  CheckCircle2,
  GitMerge,
  FileText,
  History,
  Boxes,
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const {
    jobCards,
    currentTab,
    setCurrentTab,
    userRole,
    setUserRole,
    setActiveStageId,
    setActiveJobCardId,
    activeJobCard,
  } = useERP();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isReworkModalOpen, setIsReworkModalOpen] = useState(false);
  const [reworkFromStageId, setReworkFromStageId] = useState<string | undefined>(undefined);
  const [reworkToStageId, setReworkToStageId] = useState<string | undefined>(undefined);
  const [isTravelerModalOpen, setIsTravelerModalOpen] = useState(false);
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);

  // Drawer state for live board (stores ID and reads live JobCard from context)
  const [drawerJobCardId, setDrawerJobCardId] = useState<string | null>(null);
  const [drawerStageId, setDrawerStageId] = useState<string | undefined>(undefined);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const liveDrawerJobCard = drawerJobCardId
    ? jobCards.find((j) => j.id === drawerJobCardId) || null
    : null;

  const handleOpenReworkModal = (fromStageId?: string, toStageId?: string) => {
    setReworkFromStageId(fromStageId);
    setReworkToStageId(toStageId);
    setIsReworkModalOpen(true);
  };

  const handleOpenQCModal = (stageId: string) => {
    setActiveStageId(stageId);
    setUserRole('quality');
    setCurrentTab('inspection');
  };

  const handleOpenJobDrawer = (jobCard: JobCard, stageId: string) => {
    setDrawerJobCardId(jobCard.id);
    setDrawerStageId(stageId);
    setIsDrawerOpen(true);
  };

  // Render view based on active tab
  const renderContent = () => {
    switch (currentTab) {
      case 'flow_map':
        return (
          <WorkflowFlowMap
            onOpenTraveler={() => setIsTravelerModalOpen(true)}
            onOpenReworkModal={handleOpenReworkModal}
            onOpenQCModal={handleOpenQCModal}
          />
        );
      case 'dashboard':
        return <SupervisorDashboard onOpenTraveler={() => setIsTravelerModalOpen(true)} />;
      case 'drawing_release':
        return <DrawingReleaseModule />;
      case 'traceability':
        return <TraceabilityTimelineModule />;
      case 'cutting':
      case 'fitup':
      case 'welding':
      case 'machining':
      case 'painting':
      case 'assembly':
        return (
          <JobCardWorkstation
            onOpenReworkModal={handleOpenReworkModal}
            onOpenQCModal={handleOpenQCModal}
            onOpenTraveler={() => setIsTravelerModalOpen(true)}
          />
        );
      case 'bom_requirement':
        return <BOMManagerModule />;
      case 'material_mrp':
        return <MRPModule />;
      case 'work_orders':
        return (
          <ShopfloorBoard
            onOpenJobDrawer={handleOpenJobDrawer}
            onOpenNewJobModal={() => setIsNewJobModalOpen(true)}
            onOpenReworkModal={handleOpenReworkModal}
          />
        );
      case 'material_issued':
        return <MaterialStoreModule />;
      case 'inspection':
        return <QCInspectionStation onOpenReworkModal={handleOpenReworkModal} />;
      case 'assembly_hierarchy':
        return (
          <AssemblyTreeModule
            onOpenWorkstation={(jobCardId, stageId) => {
              setActiveJobCardId(jobCardId);
              setActiveStageId(stageId);
              setCurrentTab('cutting');
              setUserRole('operator');
            }}
            onOpenReworkModal={handleOpenReworkModal}
          />
        );
      case 'dispatch':
        return <DispatchModule onOpenTraveler={() => setIsTravelerModalOpen(true)} />;
      case 'workflow_builder':
        return <WorkflowConfigurator />;
      case 'reports':
        return <SupervisorDashboard onOpenTraveler={() => setIsTravelerModalOpen(true)} />;
      default:
        return (
          <ShopfloorBoard
            onOpenJobDrawer={handleOpenJobDrawer}
            onOpenNewJobModal={() => setIsNewJobModalOpen(true)}
            onOpenReworkModal={handleOpenReworkModal}
          />
        );
    }
  };

  return (
    <div className="min-h-screen max-w-full overflow-x-hidden bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col transition-colors selection:bg-amber-500/30 print:bg-white">
      {/* 1. Header with Top Bar Contract */}
      <div className={isTravelerModalOpen ? 'no-print' : ''}>
        <TopNav onOpenTraveler={() => setIsTravelerModalOpen(true)} />
      </div>

      {/* 2. Quick View Switcher Bar (Contained Overflow) */}
      <div className={`bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 backdrop-blur-xs px-3 lg:px-6 py-2 min-w-0 ${isTravelerModalOpen ? 'no-print' : ''}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 overflow-x-auto min-w-0 scrollbar-none">
          <div className="flex items-center gap-1.5 min-w-max text-xs font-medium">
            <span className="text-[11px] font-mono text-slate-400 mr-1 uppercase">View:</span>

            {/* View 0: Interactive Flow Map */}
            <button
              onClick={() => setCurrentTab('flow_map')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                currentTab === 'flow_map'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <GitMerge className="w-3.5 h-3.5" />
              <span>Flow Map</span>
            </button>

            {/* View 1: Dashboard Overview */}
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                currentTab === 'dashboard'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>Overview</span>
            </button>

            {/* View 2: Assembly Hierarchy */}
            <button
              onClick={() => setCurrentTab('assembly_hierarchy')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                currentTab === 'assembly_hierarchy'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Assembly Hierarchy</span>
            </button>

            {/* View 3: Drawings */}
            <button
              onClick={() => setCurrentTab('drawing_release')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                currentTab === 'drawing_release'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Drawings</span>
            </button>

            {/* View 4: Live Floor Board */}
            <button
              onClick={() => setCurrentTab('work_orders')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                currentTab === 'work_orders'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Live Floor Board</span>
            </button>

            {/* View 5: Workstation Console */}
            <button
              onClick={() => setCurrentTab('cutting')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                ['cutting', 'fitup', 'welding', 'machining', 'painting', 'assembly'].includes(currentTab)
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>Station Console</span>
            </button>

            {/* View 6: Materials & Store */}
            <button
              onClick={() => setCurrentTab('material_issued')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                currentTab === 'material_mrp' || currentTab === 'bom_requirement' || currentTab === 'material_issued'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>BOM & Store Issue</span>
            </button>

            {/* View 7: Templates & Routes */}
            <button
              onClick={() => setCurrentTab('workflow_builder')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                currentTab === 'workflow_builder'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Templates</span>
            </button>

            {/* View 8: Traceability & Timeline */}
            <button
              onClick={() => setCurrentTab('traceability')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                currentTab === 'traceability'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Traceability</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-500 shrink-0">
            <span>Part: <strong className="text-slate-900 dark:text-slate-100">{activeJobCard?.partNo}</strong></span>
          </div>
        </div>
      </div>

      {/* 3. Main Workspace Shell: Left Sidebar + Center Stage Viewport (Strict Overflow Containment) */}
      <div className={`flex-1 flex overflow-hidden min-w-0 max-w-full ${isTravelerModalOpen ? 'no-print' : ''}`}>
        <SidebarNav
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onOpenNewJobModal={() => setIsNewJobModalOpen(true)}
        />

        {/* Center Viewport */}
        <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden bg-slate-50 dark:bg-slate-950/60 p-2 sm:p-4 lg:p-6">
          {renderContent()}
        </main>
      </div>

      {/* 4. Floating Demo Controller Widget */}
      <div className={isTravelerModalOpen ? 'no-print' : ''}>
        <DemoControllerBar />
      </div>

      {/* 5. Modals & Drawers */}
      <ReworkRoutingModal
        isOpen={isReworkModalOpen}
        onClose={() => setIsReworkModalOpen(false)}
        defaultFromStageId={reworkFromStageId}
        defaultToStageId={reworkToStageId}
      />

      <JobCardTravelerModal
        isOpen={isTravelerModalOpen}
        onClose={() => setIsTravelerModalOpen(false)}
      />

      <NewJobModal
        isOpen={isNewJobModalOpen}
        onClose={() => setIsNewJobModalOpen(false)}
      />

      {liveDrawerJobCard && drawerStageId && (
        <JobCardDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          jobCard={liveDrawerJobCard}
          stageId={drawerStageId}
          onStageChange={(newStageId) => setDrawerStageId(newStageId)}
          onOpenReworkModal={handleOpenReworkModal}
          onOpenQCModal={(stage) => {
            setIsDrawerOpen(false);
            handleOpenQCModal(stage);
          }}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <ERPProvider>
      <ErrorBoundary>
        <MainLayout />
      </ErrorBoundary>
    </ERPProvider>
  );
}
