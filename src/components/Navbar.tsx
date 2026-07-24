import React from 'react';
import { Box, Camera, BookOpen, Layers, HelpCircle, Sparkles } from 'lucide-react';

export type ActiveTab = 'tutorial' | 'scanner' | '3d-canvas' | 'notation';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 backdrop-blur-md bg-opacity-90">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:h-16 sm:py-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        {/* Brand Logo & Name */}
        <div 
          className="flex w-full sm:w-auto items-center space-x-3 cursor-pointer group"
          onClick={() => setActiveTab('tutorial')}
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
            <Box className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base sm:text-lg tracking-tight text-slate-100 flex flex-wrap items-center gap-1.5">
              Rubik Solver <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-medium border border-indigo-500/30">3D IA</span>
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">Guía por Capas, Escáner de Foto y Simulación 3D</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav aria-label="Navegación principal" className="mobile-edge-scroll w-full sm:w-auto flex items-center justify-around sm:justify-start gap-1 sm:gap-2 overflow-x-auto pb-0.5 sm:pb-0">
          <button
            id="nav-tab-tutorial"
            onClick={() => setActiveTab('tutorial')}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'tutorial'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span className="hidden md:inline">Guía por Capas</span>
          </button>

          <button
            id="nav-tab-scanner"
            onClick={() => setActiveTab('scanner')}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors relative ${
              activeTab === 'scanner'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Camera className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">Foto y Cámara IA</span>
            <span className="flex h-2 w-2 relative md:hidden">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </button>

          <button
            id="nav-tab-3d"
            onClick={() => setActiveTab('3d-canvas')}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === '3d-canvas'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Box className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">Cubo 3D Libre</span>
          </button>

          <button
            id="nav-tab-notation"
            onClick={() => setActiveTab('notation')}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'notation'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden md:inline">Notación</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
