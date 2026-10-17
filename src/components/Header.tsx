import React from 'react';
import { Database, Plus, Download, LayoutDashboard } from 'lucide-react';

interface HeaderProps {
  activeView: string;
  onSelectView: (view: string) => void;
  onOpenDataManager: () => void;
  onAddWidget: () => void;
  onExport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onSelectView,
  onOpenDataManager,
  onAddWidget,
  onExport,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      {/* Zone 1, Zone 2, Zone 3 - Strict Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand title, one line */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onSelectView('all');
          }}
          className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <LayoutDashboard className="w-5 h-5 text-indigo-400" />
          <span>Vantage Data Studio</span>
        </a>

        {/* Zone 2: 4-5 concise nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <button
            onClick={() => onSelectView('all')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'all' ? 'text-white' : ''
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onSelectView('sales')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'sales' ? 'text-white' : ''
            }`}
          >
            Sales
          </button>
          <button
            onClick={() => onSelectView('saas')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'saas' ? 'text-white' : ''
            }`}
          >
            SaaS Growth
          </button>
          <button
            onClick={() => onSelectView('marketing')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'marketing' ? 'text-white' : ''
            }`}
          >
            Marketing
          </button>
          <button
            onClick={onOpenDataManager}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 text-indigo-300"
          >
            Data Hub
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenDataManager}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-xs flex items-center gap-2"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Provide / Import Data</span>
          </button>
        </div>
      </div>
    </header>
  );
};
