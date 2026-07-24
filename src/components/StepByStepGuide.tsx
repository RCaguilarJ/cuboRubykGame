import React, { useState } from 'react';
import { TUTORIAL_STEPS } from '../data/tutorialSteps';
import { TutorialStep, MoveNotation } from '../types';
import { RubikViewer3D } from './RubikViewer3D';
import { Layers, ChevronRight, PlayCircle, CheckCircle2, Lightbulb, Target, Sparkles, BookOpen } from 'lucide-react';

interface StepByStepGuideProps {
  onOpenScannerForStep?: (stepTitle: string) => void;
}

export const StepByStepGuide: React.FC<StepByStepGuideProps> = ({ onOpenScannerForStep }) => {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const currentStep: TutorialStep = TUTORIAL_STEPS[activeStepIndex];

  const [activeAlgorithmMoves, setActiveAlgorithmMoves] = useState<MoveNotation[]>(
    currentStep.interactiveMoves || currentStep.algorithms[0]?.moves || []
  );

  const handleSelectStep = (index: number) => {
    setActiveStepIndex(index);
    const selected = TUTORIAL_STEPS[index];
    setActiveAlgorithmMoves(selected.interactiveMoves || selected.algorithms[0]?.moves || []);
  };

  const handleTestAlgorithm = (moves: MoveNotation[]) => {
    setActiveAlgorithmMoves([...moves]);
  };

  return (
    <div className="space-y-5 sm:space-y-8 min-w-0">
      {/* Hero Welcome Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-4 border border-indigo-500/30">
            <Layers className="w-3.5 h-3.5" />
            <span>Método de Capas (Layer-by-Layer)</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Aprende a Resolver el Cubo Rubik <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-400">Paso a Paso</span>
          </h1>
          <p className="text-slate-300 mt-3 text-sm sm:text-base leading-relaxed">
            Sigue nuestra guía interactiva ilustrada. Desde los giros básicos de vértices y aristas hasta la solución de los niveles superiores. ¡Haz clic en cualquier paso para ver y probar la animación 3D en tiempo real!
          </p>
        </div>
      </div>

      {/* Main Steps Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 min-w-0">
        {/* Left Sidebar Steps Timeline (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center justify-between">
            <span>Pasos de Resolución</span>
            <span className="text-xs text-indigo-400 font-medium">{TUTORIAL_STEPS.length} Etapas</span>
          </h3>

          <div className="flex lg:block gap-2 lg:space-y-2 overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto lg:max-h-[600px] pb-1 lg:pb-0 lg:pr-1 custom-scrollbar mobile-edge-scroll snap-x">
            {TUTORIAL_STEPS.map((step, idx) => {
              const isActive = idx === activeStepIndex;
              return (
                <button
                  key={step.id}
                  onClick={() => handleSelectStep(idx)}
                  className={`w-[82vw] max-w-[320px] shrink-0 lg:w-full lg:max-w-none text-left p-3.5 rounded-xl transition-all border flex items-start space-x-3 group relative snap-start ${
                    isActive
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-600/10'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-200'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-sm font-bold truncate">{step.title}</p>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                          step.levelTag === 'Básico'
                            ? 'bg-slate-800 text-slate-300'
                            : step.levelTag === 'Capa 1'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : step.levelTag === 'Capa 2'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}
                      >
                        {step.levelTag}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{step.subtitle}</p>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-indigo-400 shrink-0 self-center" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Detail & Interactive 3D Demo Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Step Header Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-5 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                  Etapa {activeStepIndex + 1} de {TUTORIAL_STEPS.length}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">{currentStep.title}</h2>
                <p className="text-sm text-slate-300 mt-0.5">{currentStep.subtitle}</p>
              </div>

              {/* Action: Open scanner if stuck */}
              {onOpenScannerForStep && (
                <button
                  onClick={() => onOpenScannerForStep(currentStep.title)}
                  className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition shadow-sm shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>¿Atascado? Usar Foto IA</span>
                </button>
              )}
            </div>

            {/* Target Goal Banner */}
            <div className="bg-indigo-950/40 border border-indigo-800/60 rounded-xl p-3.5 flex items-start space-x-3 text-xs text-indigo-200">
              <Target className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-indigo-300">Objetivo de este nivel: </span>
                <span>{currentStep.targetGoal}</span>
              </div>
            </div>

            {/* Explanation & Detail Points */}
            <div className="text-slate-300 text-sm leading-relaxed space-y-3">
              <p className="whitespace-pre-line">{currentStep.description}</p>

              {currentStep.detailPoints.length > 0 && (
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Instrucciones Clave:
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {currentStep.detailPoints.map((point, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Algorithms Section */}
            {currentStep.algorithms.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-400" /> Algoritmos de este nivel
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentStep.algorithms.map((algo, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-slate-700 transition"
                    >
                      <div>
                        <p className="text-xs font-bold text-white">{algo.name}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{algo.condition}</p>

                        {/* Move chips */}
                        <div className="flex flex-wrap gap-1 mt-2.5">
                          {algo.moves.map((m, mIdx) => (
                            <span
                              key={mIdx}
                              className="px-2 py-0.5 text-xs font-mono font-bold bg-indigo-950 text-indigo-300 rounded border border-indigo-800/60"
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <p className="text-[11px] text-amber-300/90 flex items-start gap-1">
                          <Lightbulb className="w-3 h-3 text-amber-400 shrink-0" /> {algo.tip}
                        </p>
                        <button
                          onClick={() => handleTestAlgorithm(algo.moves)}
                          className="w-full sm:w-auto justify-center px-2.5 py-2 sm:py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 shrink-0 transition"
                        >
                          <PlayCircle className="w-3.5 h-3.5" /> Probar 3D
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Embedded 3D Simulator player for the active algorithm */}
          <RubikViewer3D
            initialMoves={activeAlgorithmMoves}
            title={`Demostración 3D - ${currentStep.title}`}
            subtitle="Presiona Reproducir para ver exactamente cómo se mueven las piezas en este nivel."
          />
        </div>
      </div>
    </div>
  );
};
