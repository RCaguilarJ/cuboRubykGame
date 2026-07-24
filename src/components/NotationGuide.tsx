import React, { useState } from 'react';
import { MoveNotation } from '../types';
import { MOVE_DESCRIPTIONS_ES } from '../lib/rubik/cubeState.ts';
import { RubikViewer3D } from './RubikViewer3D';
import { BookOpen, Box, Move, CheckCircle2, Info } from 'lucide-react';

export const NotationGuide: React.FC = () => {
  const [selectedDemoMove, setSelectedDemoMove] = useState<MoveNotation[]>(['R', 'U', "R'", "U'"]);

  const allMoves: MoveNotation[] = [
    'U', "U'", 'U2',
    'D', "D'", 'D2',
    'R', "R'", 'R2',
    'L', "L'", 'L2',
    'F', "F'", 'F2',
    'B', "B'", 'B2',
  ];

  return (
    <div className="space-y-5 sm:space-y-8 max-w-6xl min-w-0 mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>Glosario Oficial y Notación Singular</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Anatomía del Cubo y Notación de Movimientos
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Aprende a leer y ejecutar cualquier algoritmo del Cubo Rubik. Haz clic en cualquier símbolo de movimiento para ver la animación 3D correspondiente.
          </p>
        </div>
      </div>

      {/* Anatomy Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Centros */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg border border-amber-500/30">
            1
          </div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Centros (6 Piezas)</span>
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Tienen <strong>1 solo color</strong>. Nunca cambian de posición relativa entre sí. El centro determina el color definitivo que debe tener esa cara al resolver el cubo.
          </p>
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-400">
            📌 Regla: El centro Blanco siempre es opuesto al Amarillo. El Verde es opuesto al Azul. El Rojo es opuesto al Naranja.
          </div>
        </div>

        {/* Aristas */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg border border-emerald-500/30">
            2
          </div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Aristas / Bordes (12 Piezas)</span>
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Tienen <strong>2 colores</strong>. Se encuentran en las posiciones medias entre los vértices. Unen dos caras contiguas del cubo.
          </p>
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-400">
            📌 Regla: Durante la solución, ambas caras de la arista deben coincidir con sus dos centros respectivos.
          </div>
        </div>

        {/* Vértices / Esquinas */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-lg border border-rose-500/30">
            3
          </div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Vértices / Esquinas (8 Piezas)</span>
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Tienen <strong>3 colores</strong>. Se ubican en las esquinas del cubo y tocan tres caras adyacentes al mismo tiempo.
          </p>
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-400">
            📌 Regla: Para resolver una esquina, sus 3 parches de color deben alinearse con los 3 centros que la rodean.
          </div>
        </div>
      </div>

      {/* Interactive Moves Glossary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 min-w-0">
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4 min-w-0">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Move className="w-5 h-5 text-indigo-400" />
            <span>Catálogo de Movimientos Singulares</span>
          </h3>
          <p className="text-xs text-slate-400">
            Haz clic en cualquier botón para cargar la demostración animada en la vista 3D.
          </p>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {allMoves.map((m) => (
              <button
                key={m}
                onClick={() => setSelectedDemoMove([m])}
                className={`py-2.5 px-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                  selectedDemoMove.length === 1 && selectedDemoMove[0] === m
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-md ring-2 ring-indigo-400'
                    : 'bg-slate-950 text-slate-200 border-slate-800 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Move Descriptions List */}
          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
            {Object.entries(MOVE_DESCRIPTIONS_ES).map(([m, info]) => (
              <div
                key={m}
                onClick={() => setSelectedDemoMove([m as MoveNotation])}
                className="bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 rounded-xl p-3 flex items-start space-x-3 cursor-pointer transition"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-950 text-indigo-300 font-mono font-bold text-sm flex items-center justify-center shrink-0 border border-indigo-800/60">
                  {m}
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{info.title}</p>
                  <p className="text-[11px] text-slate-400">{info.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live 3D Renderer for Notation Demo */}
        <div className="lg:col-span-6 space-y-4">
          <RubikViewer3D
            initialMoves={selectedDemoMove}
            title={`Demostración del Giro ${selectedDemoMove.join(' ')}`}
            subtitle="Observa exactamente hacia dónde rota la cara del cubo."
          />
        </div>
      </div>
    </div>
  );
};
