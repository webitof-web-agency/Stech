import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { NavigationTab, UserRole } from '../types/erp';
import { StageDetailDrawer } from './StageDetailDrawer';
import {
  ArrowRight,
  ArrowDownRight,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  Layers,
  FileText,
  Boxes,
  PackageCheck,
  ShieldCheck,
  Play,
  Eye,
} from 'lucide-react';

export interface StageDetail {
  id: string;
  stepNumber: number;
  title: string;
  department: string;
  targetRole: UserRole;
  targetTab: NavigationTab;
  status: 'completed' | 'in_progress' | 'rework' | 'pending';
  incomingData: {
    origin: string;
    description: string;
    referenceDocs: string[];
  };
  actions: {
    label: string;
    description: string;
    icon: React.ElementType;
    actionType: 'navigate' | 'dialog' | 'quick_trigger';
    dialogType?: 'traveler' | 'rework' | 'qc' | 'new_job';
    badge?: string;
  }[];
  outgoingData: {
    destination: string;
    description: string;
    artifactsProduced: string[];
  };
}

interface Props {
  stage: StageDetail;
  onOpenTraveler: () => void;
  onOpenReworkModal: (fromStageId?: string) => void;
  onOpenQCModal: (stageId: string) => void;
}

export const StageInspectorCard: React.FC<Props> = ({
  stage,
  onOpenTraveler,
  onOpenReworkModal,
  onOpenQCModal,
}) => {
  const {
    setCurrentTab,
    setUserRole,
    setActiveStageId,
    activeJobCard,
    activeProject,
    passQCReinspection,
    completeSubAssembly,
    completeMainAssembly,
    completeMasterProject,
    runDemoStep,
  } = useERP();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleNavigateToStation = () => {
    setUserRole(stage.targetRole);
    setActiveStageId(stage.id);
    setCurrentTab(stage.targetTab);
  };

  const handleActionClick = (action: StageDetail['actions'][0]) => {
    if (action.actionType === 'navigate') {
      handleNavigateToStation();
    } else if (action.dialogType === 'traveler') {
      onOpenTraveler();
    } else if (action.dialogType === 'rework') {
      onOpenReworkModal(stage.id);
    } else if (action.dialogType === 'qc') {
      onOpenQCModal(stage.id);
    } else if (action.actionType === 'quick_trigger') {
      if (action.badge && action.badge.includes('Demo Step')) {
        const stepNum = parseInt(action.badge.replace(/\D/g, ''), 10);
        if (!isNaN(stepNum)) {
          runDemoStep(stepNum);
          return;
        }
      }
      // Direct state quick actions
      if (stage.id === 'sub_assembly') {
        completeSubAssembly(activeJobCard?.id || 'jc_boom_01');
      } else if (stage.id === 'main_assembly') {
        completeMainAssembly('jc_arm_main');
      } else if (stage.id === 'master_project') {
        completeMasterProject(activeProject?.id || 'prj_jcb_001');
      }
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 lg:p-5 transition-all min-w-0">
      {/* Header with Title & Jump to Station */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 mb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-mono font-black flex items-center justify-center shrink-0 text-xs">
            0{stage.stepNumber}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                {stage.title}
              </h3>
              <span className="text-xs font-mono text-slate-400">·</span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                Dept: <strong className="text-slate-700 dark:text-slate-300">{stage.department}</strong>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">
              Action Role: {stage.targetRole.replace('_', ' ').toUpperCase()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          {/* Side Drawer Trigger for Deep Technical Specs */}
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            title="Open side drawer with full technical specs and GD&T notes"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Tech Specs Drawer</span>
          </button>

          <button
            type="button"
            onClick={handleNavigateToStation}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-xs cursor-pointer"
          >
            <span>Open Station</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3-Part Flow Anatomy: Data Received -> Actions Performed -> Data Produced */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4 min-w-0">
        {/* Column 1: Data Received (Where it comes from) */}
        <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3.5 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide font-mono">
              <ArrowDownRight className="w-3.5 h-3.5 text-blue-500" />
              <span>Inbound Data</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
              From: <strong className="text-slate-800 dark:text-slate-200">{stage.incomingData.origin}</strong>
            </p>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug line-clamp-2 mb-2">
              {stage.incomingData.description}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60">
            <span className="text-[10px] font-mono text-slate-400 block mb-1">Attached Documents:</span>
            <div className="flex flex-col gap-1">
              {stage.incomingData.referenceDocs.slice(0, 2).map((doc, idx) => (
                <div key={idx} className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400 font-mono truncate">
                  <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{doc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 2: What You Can Do Here (Clear high-intent action buttons) */}
        <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-amber-300/60 dark:border-amber-800/60 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide font-mono">
              <Play className="w-4 h-4 text-amber-500" />
              <span>What You Can Do Here</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
              Direct station controls with live modal dialogs & step updates:
            </p>

            <div className="flex flex-col gap-2">
              {stage.actions.map((act, idx) => {
                const Icon = act.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleActionClick(act)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-500 text-left transition-all group cursor-pointer shadow-xs min-w-0"
                  >
                    <div className="flex items-start gap-2 min-w-0 pr-1">
                      <div className="p-1 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate">
                          {act.label}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block line-clamp-1">
                          {act.description}
                        </span>
                      </div>
                    </div>
                    {act.badge ? (
                      <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 shrink-0 ml-1">
                        {act.badge}
                      </span>
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
            <span>Actions trigger real dialogs</span>
            <span className="text-emerald-600 font-mono font-medium">Zero dead clicks</span>
          </div>
        </div>

        {/* Column 3: Data Produced (Where it goes next) */}
        <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide font-mono">
              <ArrowRight className="w-4 h-4 text-emerald-500" />
              <span>Data Produced</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
              Destination: <strong className="text-slate-800 dark:text-slate-200">{stage.outgoingData.destination}</strong>
            </p>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug line-clamp-2 mb-2">
              {stage.outgoingData.description}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60">
            <span className="text-[10px] font-mono text-slate-400 block mb-1">Handoff Deliverables:</span>
            <div className="flex flex-col gap-1">
              {stage.outgoingData.artifactsProduced.slice(0, 2).map((art, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-mono truncate">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="truncate">{art}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Slide-out Technical Specifications & GD&T Drawer */}
      <StageDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        stage={stage}
        onNavigateToStation={handleNavigateToStation}
      />
    </div>
  );
};
