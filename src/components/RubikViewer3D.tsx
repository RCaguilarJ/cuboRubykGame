import React, { useEffect, useRef, useState } from 'react';
import { Rubik3DRenderer } from '../lib/rubik/rubik3d.ts';
import { MoveNotation } from '../types';
import { MOVE_DESCRIPTIONS_ES, generateScramble } from '../lib/rubik/cubeState.ts';
import { Play, Pause, RotateCcw, Shuffle, FastForward, Eye, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RubikViewer3DProps {
  initialMoves?: MoveNotation[];
  title?: string;
  subtitle?: string;
}

export const RubikViewer3D: React.FC<RubikViewer3DProps> = ({
  initialMoves,
  title = 'Simulador de Cubo Rubik 3D',
  subtitle = 'Arrastra con el mouse o dedo para rotar la cámara 360°. Usa las teclas o botones para girar las caras.',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<Rubik3DRenderer | null>(null);

  const [movesQueue, setMovesQueue] = useState<MoveNotation[]>(initialMoves || []);
  const [executedMoves, setExecutedMoves] = useState<MoveNotation[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(400); // 400ms speed per move
  const [activeTab, setActiveTab] = useState<'MOVES' | 'CAMERA'>('MOVES');

  // Initialize 3D renderer on mount
  useEffect(() => {
    if (!containerRef.current) return;

    const renderer = new Rubik3DRenderer({
      container: containerRef.current,
      onMoveComplete: (move) => {
        setExecutedMoves((prev) => [...prev, move]);
        setCurrentStepIndex((prev) => prev + 1);
      },
      onAnimationStateChange: (animating) => {
        setIsAnimating(animating);
      },
    });

    rendererRef.current = renderer;

    return () => {
      renderer.dispose();
      rendererRef.current = null;
    };
  }, []);

  // Update speed when slider changes
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setSpeed(speedMs);
    }
  }, [speedMs]);

  // Load new initial moves if provided
  useEffect(() => {
    if (initialMoves && initialMoves.length > 0) {
      setMovesQueue(initialMoves);
      setExecutedMoves([]);
      setCurrentStepIndex(-1);
    }
  }, [initialMoves]);

  // Playback timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (isPlaying) {
      if (currentStepIndex + 1 < movesQueue.length) {
        if (!isAnimating && rendererRef.current) {
          const nextMove = movesQueue[currentStepIndex + 1];
          rendererRef.current.queueMove(nextMove);
        }
      } else {
        setIsPlaying(false);
        // Trigger celebratory confetti if completing a full sequence
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isPlaying, isAnimating, currentStepIndex, movesQueue]);

  // Manual single move execution
  const handleManualMove = (move: MoveNotation) => {
    if (rendererRef.current) {
      rendererRef.current.queueMove(move);
    }
  };

  // Scramble cube
  const handleScramble = () => {
    setIsPlaying(false);
    if (rendererRef.current) {
      rendererRef.current.resetCube();
      const scramble = generateScramble(20);
      setMovesQueue(scramble);
      setExecutedMoves([]);
      setCurrentStepIndex(-1);
      rendererRef.current.queueMoves(scramble);
    }
  };

  // Reset cube
  const handleReset = () => {
    setIsPlaying(false);
    setMovesQueue([]);
    setExecutedMoves([]);
    setCurrentStepIndex(-1);
    if (rendererRef.current) {
      rendererRef.current.resetCube();
    }
  };

  // Play / Pause toggle
  const togglePlay = () => {
    if (currentStepIndex + 1 >= movesQueue.length && movesQueue.length > 0) {
      // Re-run sequence from start
      handleReset();
      setTimeout(() => {
        setIsPlaying(true);
      }, 200);
      return;
    }
    setIsPlaying(!isPlaying);
  };

  // Step next single move
  const handleStepNext = () => {
    if (currentStepIndex + 1 < movesQueue.length && rendererRef.current && !isAnimating) {
      const nextMove = movesQueue[currentStepIndex + 1];
      rendererRef.current.queueMove(nextMove);
    }
  };

  const currentMoveInfo = movesQueue[currentStepIndex]
    ? MOVE_DESCRIPTIONS_ES[movesQueue[currentStepIndex]]
    : null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-6 shadow-2xl space-y-4 sm:space-y-6 text-slate-100 min-w-0">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold text-white flex flex-col min-[420px]:flex-row min-[420px]:items-center gap-2 break-words">
            <span>{title}</span>
            <span className="text-xs bg-amber-500/20 text-amber-300 font-semibold px-2.5 py-0.5 rounded-full border border-amber-500/30">
              Interactive 3D
            </span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
        </div>

        {/* Top Control Action Buttons */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
          <button
            id="btn-scramble-cube"
            onClick={handleScramble}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700 transition-colors"
          >
            <Shuffle className="w-4 h-4 text-amber-400" />
            <span>Mezclar</span>
          </button>
          <button
            id="btn-reset-cube"
            onClick={handleReset}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-rose-400" />
            <span>Reiniciar</span>
          </button>
        </div>
      </div>

      {/* Main 3D Viewer & Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 min-w-0">
        {/* 3D Canvas Column (Takes 2 cols on large screens) */}
        <div className="lg:col-span-2 flex flex-col space-y-3">
          <div className="relative w-full h-[300px] min-[420px]:h-[340px] sm:h-[480px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner group">
            <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

            {/* Floating Camera Preset Overlay */}
            <div className="absolute top-2 left-2 right-2 sm:top-3 sm:left-3 sm:right-auto bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-xl p-1 flex items-center justify-center gap-1">
              <span className="hidden sm:flex text-xs text-slate-400 px-2 items-center gap-1 font-medium">
                <Eye className="w-3.5 h-3.5 text-indigo-400" /> Cámara:
              </span>
              <button
                onClick={() => rendererRef.current?.setCameraPreset('DEFAULT')}
                className="flex-1 sm:flex-none px-2 py-1.5 text-[11px] sm:text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition"
              >
                Isométrica
              </button>
              <button
                onClick={() => rendererRef.current?.setCameraPreset('FRONT')}
                className="flex-1 sm:flex-none px-2 py-1.5 text-[11px] sm:text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition"
              >
                Frente
              </button>
              <button
                onClick={() => rendererRef.current?.setCameraPreset('TOP')}
                className="flex-1 sm:flex-none px-2 py-1.5 text-[11px] sm:text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition"
              >
                Arriba
              </button>
            </div>

            {/* Active Move Overlay */}
            {currentMoveInfo && (
              <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 bg-slate-900/90 backdrop-blur-md border border-indigo-500/30 rounded-xl p-2 sm:p-3 flex items-center space-x-2 sm:space-x-3 shadow-xl">
                <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/30">
                  {movesQueue[currentStepIndex]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white truncate">{currentMoveInfo.title}</p>
                  <p className="text-xs text-slate-300 truncate">{currentMoveInfo.desc}</p>
                </div>
                <div className="text-[10px] sm:text-xs font-mono text-indigo-400 bg-indigo-950/80 px-2 sm:px-2.5 py-1 rounded-lg border border-indigo-800 shrink-0">
                  {currentStepIndex + 1} / {movesQueue.length}
                </div>
              </div>
            )}
          </div>

          {/* Sequence Playback Controller */}
          {movesQueue.length > 0 && (
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="grid grid-cols-1 min-[420px]:grid-cols-2 w-full sm:w-auto gap-2">
                <button
                  id="btn-toggle-play"
                  onClick={togglePlay}
                  className="justify-center flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-transform active:scale-95"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                  <span>{isPlaying ? 'Pausar' : currentStepIndex + 1 >= movesQueue.length ? 'Repetir Secuencia' : 'Reproducir'}</span>
                </button>

                <button
                  id="btn-step-next"
                  onClick={handleStepNext}
                  disabled={isPlaying || currentStepIndex + 1 >= movesQueue.length}
                  className="justify-center flex items-center space-x-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-sm font-medium border border-slate-700 transition-colors"
                >
                  <FastForward className="w-4 h-4" />
                  <span>Siguiente Paso</span>
                </button>
              </div>

              {/* Speed Slider */}
              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                  Velocidad: {Math.round(100000 / speedMs) / 100}x
                </span>
                <input
                  type="range"
                  min="150"
                  max="1000"
                  step="50"
                  value={speedMs}
                  onChange={(e) => setSpeedMs(Number(e.target.value))}
                  className="w-full sm:w-32 accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Moves Queue History Chips */}
          {movesQueue.length > 0 && (
            <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3">
              <div className="flex flex-col min-[420px]:flex-row min-[420px]:items-center justify-between gap-1 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Secuencia de Movimientos ({movesQueue.length})
                </span>
                {currentStepIndex >= movesQueue.length - 1 && movesQueue.length > 0 && (
                  <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Secuencia Completada
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 custom-scrollbar">
                {movesQueue.map((move, idx) => {
                  const isDone = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  return (
                    <span
                      key={idx}
                      className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg border transition-all ${
                        isCurrent
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20 scale-105 ring-2 ring-amber-400'
                          : isDone
                          ? 'bg-indigo-950 text-indigo-300 border-indigo-800/80 opacity-70'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {move}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Interactive Moves Pad & Explanation */}
        <div className="flex flex-col space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex-1 flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                <span>Tablero de Giros Manuales</span>
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Presiona cualquier botón para realizar el giro en vivo en el modelo 3D.
              </p>

              {/* Move Buttons Grid grouped by Face */}
              <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-2 text-xs">
                {/* U / U' */}
                <div className="bg-slate-900 border border-slate-800 p-2 rounded-xl flex flex-col space-y-1">
                  <span className="font-semibold text-slate-300 text-[11px] flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-400 inline-block"></span> Cara Arriba (U)
                  </span>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleManualMove('U')}
                      className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-mono font-bold rounded-lg border border-slate-700 transition"
                    >
                      U
                    </button>
                    <button
                      onClick={() => handleManualMove("U'")}
                      className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-mono font-bold rounded-lg border border-slate-700 transition"
                    >
                      U'
                    </button>
                  </div>
                </div>

                {/* D / D' */}
                <div className="bg-slate-900 border border-slate-800 p-2 rounded-xl flex flex-col space-y-1">
                  <span className="font-semibold text-slate-300 text-[11px] flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span> Cara Abajo (D)
                  </span>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleManualMove('D')}
                      className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-mono font-bold rounded-lg border border-slate-700 transition"
                    >
                      D
                    </button>
                    <button
                      onClick={() => handleManualMove("D'")}
                      className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-mono font-bold rounded-lg border border-slate-700 transition"
                    >
                      D'
                    </button>
                  </div>
                </div>

                {/* R / R' */}
                <div className="bg-slate-900 border border-slate-800 p-2 rounded-xl flex flex-col space-y-1">
                  <span className="font-semibold text-slate-300 text-[11px] flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span> Derecha (R)
                  </span>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleManualMove('R')}
                      className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-mono font-bold rounded-lg border border-slate-700 transition"
                    >
                      R
                    </button>
                    <button
                      onClick={() => handleManualMove("R'")}
                      className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-mono font-bold rounded-lg border border-slate-700 transition"
                    >
                      R'
                    </button>
                  </div>
                </div>

                {/* L / L' */}
                <div className="bg-slate-900 border border-slate-800 p-2 rounded-xl flex flex-col space-y-1">
                  <span className="font-semibold text-slate-300 text-[11px] flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span> Izquierda (L)
                  </span>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleManualMove('L')}
                      className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-mono font-bold rounded-lg border border-slate-700 transition"
                    >
                      L
                    </button>
                    <button
                      onClick={() => handleManualMove("L'")}
                      className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-mono font-bold rounded-lg border border-slate-700 transition"
                    >
                      L'
                    </button>
                  </div>
                </div>

                {/* F / F' */}
                <div className="bg-slate-900 border border-slate-800 p-2 rounded-xl flex flex-col space-y-1">
                  <span className="font-semibold text-slate-300 text-[11px] flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Frente (F)
                  </span>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleManualMove('F')}
                      className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-mono font-bold rounded-lg border border-slate-700 transition"
                    >
                      F
                    </button>
                    <button
                      onClick={() => handleManualMove("F'")}
                      className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-mono font-bold rounded-lg border border-slate-700 transition"
                    >
                      F'
                    </button>
                  </div>
                </div>

                {/* B / B' */}
                <div className="bg-slate-900 border border-slate-800 p-2 rounded-xl flex flex-col space-y-1">
                  <span className="font-semibold text-slate-300 text-[11px] flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span> Trasera (B)
                  </span>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleManualMove('B')}
                      className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-mono font-bold rounded-lg border border-slate-700 transition"
                    >
                      B
                    </button>
                    <button
                      onClick={() => handleManualMove("B'")}
                      className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-mono font-bold rounded-lg border border-slate-700 transition"
                    >
                      B'
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Practical Quick Tip Card */}
            <div className="bg-indigo-950/40 border border-indigo-800/60 rounded-xl p-3 text-xs text-indigo-200">
              <p className="font-semibold text-indigo-300 mb-1 flex items-center gap-1">
                💡 Consejo de Giro:
              </p>
              <p className="leading-relaxed">
                Los giros con apóstrofe (ej. <strong>R'</strong>) representan giros en sentido <strong>antihorario</strong> mirando la cara de frente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
