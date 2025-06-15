import React from 'react';
import clsx from 'clsx';
import { GitBranch, Share2 } from 'lucide-react';

export type Tab = 'graph' | 'tree';

interface TabsProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const tabsConfig: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'graph', label: 'Force Graph', icon: Share2 },
  { id: 'tree', label: 'Tidy Tree', icon: GitBranch },
];

const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex space-x-1 rounded-lg bg-slate-200 p-1 mb-4">
      {tabsConfig.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'w-full flex items-center justify-center rounded-md py-2.5 text-sm font-medium leading-5 transition-all duration-300',
              'focus:outline-none focus:ring-2 ring-offset-2 ring-offset-slate-200 ring-white',
              {
                'bg-white text-accent shadow': activeTab === tab.id,
                'text-primary hover:bg-white/[0.6] hover:text-accent': activeTab !== tab.id,
              }
            )}
          >
            <Icon className="w-5 h-5 mr-2" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;