// src/components/Tabs.tsx

import React from 'react';
import { GitBranch, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <div className="flex space-x-1 rounded2-lg bg-slate-100 p-1 mb-4">
      {tabsConfig.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`
            relative w-full flex items-center justify-center rounded2-md py-2.5 text-sm font-medium leading-5
            transition-colors duration-200
            focus:outline-none focus-visible:ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-100
          `}
        >
          {/* This is the animated highlighter */}
          {activeTab === tab.id && (
            <motion.div
              layoutId="active-tab-highlighter"
              className="absolute inset-0 bg-white rounded2-md shadow2-sm"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}

          {/* Icon and Label (must be relative to be on top of the highlighter) */}
          <span className="relative z-10 flex items-center">
            <tab.icon
              className={`w-5 h-5 mr-2 transition-colors ${
                activeTab === tab.id ? 'text-blue-600' : 'text-slate-600'
              }`}
            />
            <span
              className={`transition-colors ${
                activeTab === tab.id ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </span>
          </span>
        </button>
      ))}
    </div>
  );
};

export default Tabs;