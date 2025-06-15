import React from 'react';
import { GitCommit, GitMerge, Github, ChevronsRight } from 'lucide-react';
import type { GraphStats } from '../utils/types';

interface StatsViewProps {
  stats: GraphStats;
}

const StatCard: React.FC<{ icon: React.ElementType, label: string, value: number | string }> = ({ icon: Icon, label, value }) => (
  <div className="flex items-center p-4 bg-slate-50 rounded-lg border border-slate-200">
    <div className="p-3 rounded-full bg-slate-200 mr-4">
      <Icon className="h-5 w-5 text-primary" />
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-700">{value}</p>
    </div>
  </div>
);

const StatsView: React.FC<StatsViewProps> = ({ stats }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-primary mb-4">Graph Statistics</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard icon={Github} label="Total Nodes" value={stats.totalNodes} />
        <StatCard icon={GitMerge} label="Total Edges" value={stats.totalEdges} />
        <StatCard icon={ChevronsRight} label="Max Depth" value={stats.maxDepth} />
        <StatCard icon={GitCommit} label="Leaf Nodes" value={stats.leafNodes} />
      </div>
    </div>
  );
};

export default StatsView;