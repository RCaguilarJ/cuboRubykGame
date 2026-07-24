import React, { useState } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { StepByStepGuide } from './components/StepByStepGuide';
import { PhotoScanner } from './components/PhotoScanner';
import { RubikViewer3D } from './components/RubikViewer3D';
import { NotationGuide } from './components/NotationGuide';
import { Box, Heart } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('tutorial');
  const [selectedStepForScanner, setSelectedStepForScanner] = useState<string>('Cruz Blanca (Capa 1)');

  const handleOpenScannerForStep = (stepTitle: string) => {
    setSelectedStepForScanner(stepTitle);
    setActiveTab('scanner');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full min-w-0 mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {activeTab === 'tutorial' && (
          <StepByStepGuide onOpenScannerForStep={handleOpenScannerForStep} />
        )}

        {activeTab === 'scanner' && (
          <PhotoScanner initialStageName={selectedStepForScanner} />
        )}

        {activeTab === '3d-canvas' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-start gap-2">
                <Box className="w-6 h-6 text-indigo-400 shrink-0" />
                <span>Simulador de Cubo Rubik 3D Libre</span>
              </h2>
              <p className="text-sm text-slate-300 mt-1">
                Practica tus giros, prueba tus propios algoritmos o utiliza el mezclador aleatorio para entrenar tu velocidad.
              </p>
            </div>
            <RubikViewer3D />
          </div>
        )}

        {activeTab === 'notation' && <NotationGuide />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800/80 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="flex flex-wrap items-center justify-center gap-1 text-center">
            Rubik Solver 3D &copy; {new Date().getFullYear()} &bull; Creado con
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> e Inteligencia Artificial Gemini
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <button
              onClick={() => setActiveTab('tutorial')}
              className="hover:text-slate-200 transition"
            >
              Guía de Capas
            </button>
            <button
              onClick={() => setActiveTab('scanner')}
              className="hover:text-slate-200 transition"
            >
              Escáner de Foto
            </button>
            <button
              onClick={() => setActiveTab('3d-canvas')}
              className="hover:text-slate-200 transition"
            >
              Simulador 3D
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
