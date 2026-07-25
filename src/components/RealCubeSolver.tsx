import React, { useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Eraser, Lightbulb, Play, RotateCcw, Sparkles } from 'lucide-react';
import { MoveNotation } from '../types';
import { MOVE_DESCRIPTIONS_ES } from '../lib/rubik/cubeState.ts';

type Face = 'U' | 'R' | 'F' | 'D' | 'L' | 'B';
type StickerColor = 'W' | 'R' | 'G' | 'Y' | 'O' | 'B';

const FACES: { id: Face; name: string; center: StickerColor; position: string }[] = [
  { id: 'U', name: 'Arriba', center: 'W', position: 'Centro blanco arriba' },
  { id: 'R', name: 'Derecha', center: 'R', position: 'Centro rojo a la derecha' },
  { id: 'F', name: 'Frente', center: 'G', position: 'Centro verde de frente' },
  { id: 'D', name: 'Abajo', center: 'Y', position: 'Centro amarillo abajo' },
  { id: 'L', name: 'Izquierda', center: 'O', position: 'Centro naranja a la izquierda' },
  { id: 'B', name: 'Atrás', center: 'B', position: 'Centro azul atrás' },
];

const COLORS: { id: StickerColor; name: string; className: string }[] = [
  { id: 'W', name: 'Blanco', className: 'bg-white' },
  { id: 'Y', name: 'Amarillo', className: 'bg-yellow-400' },
  { id: 'G', name: 'Verde', className: 'bg-emerald-500' },
  { id: 'B', name: 'Azul', className: 'bg-blue-600' },
  { id: 'R', name: 'Rojo', className: 'bg-red-600' },
  { id: 'O', name: 'Naranja', className: 'bg-orange-500' },
];

const SOLVED: Record<Face, StickerColor[]> = {
  U: Array(9).fill('W'),
  R: Array(9).fill('R'),
  F: Array(9).fill('G'),
  D: Array(9).fill('Y'),
  L: Array(9).fill('O'),
  B: Array(9).fill('B'),
};

const COLOR_TO_FACE: Record<StickerColor, Face> = {
  W: 'U',
  R: 'R',
  G: 'F',
  Y: 'D',
  O: 'L',
  B: 'B',
};

const colorClass = (color: StickerColor | null) =>
  COLORS.find((item) => item.id === color)?.className || 'bg-slate-800';

export const RealCubeSolver: React.FC = () => {
  const [stickers, setStickers] = useState<Record<Face, (StickerColor | null)[]>>(
    () => Object.fromEntries(FACES.map(({ id }) => [id, [...SOLVED[id]]])) as Record<Face, StickerColor[]>,
  );
  const [selectedColor, setSelectedColor] = useState<StickerColor>('W');
  const [solution, setSolution] = useState<MoveNotation[]>([]);
  const [cubeAlreadySolved, setCubeAlreadySolved] = useState(false);
  const [currentMove, setCurrentMove] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const counts = useMemo(() => {
    const result = Object.fromEntries(COLORS.map(({ id }) => [id, 0])) as Record<StickerColor, number>;
    (Object.values(stickers).flat() as (StickerColor | null)[]).forEach((color) => {
      if (color) result[color] += 1;
    });
    return result;
  }, [stickers]);

  const countsAreValid = COLORS.every(({ id }) => counts[id] === 9);
  const allFilled = Object.values(stickers).flat().every(Boolean);

  const paintSticker = (face: Face, index: number) => {
    if (index === 4) return;
    setStickers((previous) => ({
      ...previous,
      [face]: previous[face].map((color, stickerIndex) => stickerIndex === index ? selectedColor : color),
    }));
    setSolution([]);
    setCubeAlreadySolved(false);
    setError('');
  };

  const clearCube = () => {
    setStickers(
      Object.fromEntries(
        FACES.map(({ id, center }) => [id, Array.from({ length: 9 }, (_, index) => index === 4 ? center : null)]),
      ) as Record<Face, (StickerColor | null)[]>,
    );
    setSolution([]);
    setCubeAlreadySolved(false);
    setCurrentMove(0);
    setError('');
  };

  const resetSolved = () => {
    setStickers(Object.fromEntries(FACES.map(({ id }) => [id, [...SOLVED[id]]])) as Record<Face, StickerColor[]>);
    setSolution([]);
    setCubeAlreadySolved(false);
    setCurrentMove(0);
    setError('');
  };

  const solveCube = async () => {
    setError('');
    setSolution([]);
    setCubeAlreadySolved(false);
    setCurrentMove(0);

    if (!allFilled || !countsAreValid) {
      setError('Cada color debe aparecer exactamente 9 veces antes de calcular la solución.');
      return;
    }

    const facelets = FACES
      .flatMap(({ id }) => stickers[id])
      .map((color) => COLOR_TO_FACE[color as StickerColor])
      .join('');
    setLoading(true);
    try {
      const response = await fetch('/api/solve-cube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facelets }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'No se pudo calcular una solución.');
      }
      setSolution(data.moves as MoveNotation[]);
      setCubeAlreadySolved(data.moveCount === 0);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Error desconocido al resolver el cubo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-w-0 space-y-5 sm:space-y-8">
      <section className="rounded-2xl sm:rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-slate-900 via-indigo-950/80 to-slate-900 p-4 sm:p-8 shadow-2xl">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
            <Sparkles className="h-3.5 w-3.5" /> Solucionador matemático 3×3
          </div>
          <h2 className="mt-4 text-2xl sm:text-4xl font-extrabold text-white">Registra tu cubo y obtén una solución real</h2>
          <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-300">
            Introduce los 54 colores manteniendo siempre el centro verde de frente y el blanco arriba.
            El cálculo valida las piezas y utiliza el algoritmo de dos fases de Kociemba; no depende de una respuesta generativa.
          </p>
        </div>
      </section>

      <div className="grid w-full min-w-0 grid-cols-1 xl:grid-cols-12 gap-5 lg:gap-8">
        <section className="min-w-0 xl:col-span-8 rounded-2xl border border-slate-800 bg-slate-900 p-3 min-[380px]:p-4 sm:p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-white">1. Selecciona un color y pinta cada cara</h3>
              <p className="mt-1 text-xs text-slate-400">Los centros están bloqueados porque determinan la orientación.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((color) => (
                <button
                  key={color.id}
                  onClick={() => setSelectedColor(color.id)}
                  title={color.name}
                  className={`h-10 w-10 rounded-xl border-2 ${color.className} ${
                    selectedColor === color.id ? 'border-indigo-300 ring-2 ring-indigo-500' : 'border-slate-700'
                  }`}
                  aria-label={`Seleccionar ${color.name}`}
                />
              ))}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 min-[430px]:grid-cols-2 lg:grid-cols-3 gap-4">
            {FACES.map((face) => (
              <div key={face.id} className="min-w-0 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">{face.id} · {face.name}</p>
                    <p className="text-[10px] text-slate-400">{face.position}</p>
                  </div>
                  <span className="rounded-md bg-slate-800 px-2 py-1 text-[10px] font-mono text-slate-300">{face.id}</span>
                </div>
                <div className="mx-auto grid w-full max-w-[190px] grid-cols-3 gap-1.5">
                  {stickers[face.id].map((color, index) => (
                    <button
                      key={index}
                      onClick={() => paintSticker(face.id, index)}
                      disabled={index === 4}
                      className={`aspect-square rounded-lg border-2 ${colorClass(color)} ${
                        index === 4 ? 'cursor-not-allowed border-slate-300/70' : 'border-slate-700 hover:border-indigo-400'
                      }`}
                      aria-label={`${face.name}, casilla ${index + 1}${index === 4 ? ', centro fijo' : ''}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <button onClick={clearCube} className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-200">
              <Eraser className="h-4 w-4" /> Vaciar casillas
            </button>
            <button onClick={resetSolved} className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-200">
              <RotateCcw className="h-4 w-4" /> Estado resuelto
            </button>
            <button
              onClick={solveCube}
              disabled={loading || !allFilled || !countsAreValid}
              className="sm:ml-auto flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-extrabold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Sparkles className="h-4 w-4" /> {loading ? 'Calculando…' : 'Calcular solución exacta'}
            </button>
          </div>
        </section>

        <aside className="min-w-0 xl:col-span-4 space-y-5">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5 shadow-xl">
            <h3 className="font-bold text-white">Conteo de colores</h3>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {COLORS.map((color) => (
                <div key={color.id} className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs ${
                  counts[color.id] === 9 ? 'border-emerald-800 bg-emerald-950/30' : 'border-slate-800 bg-slate-950'
                }`}>
                  <span className="flex items-center gap-2 text-slate-300">
                    <span className={`h-3 w-3 rounded-full ${color.className}`} /> {color.name}
                  </span>
                  <strong className={counts[color.id] === 9 ? 'text-emerald-400' : 'text-amber-400'}>{counts[color.id]}/9</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 text-xs leading-relaxed text-amber-100">
            <p className="flex items-center gap-2 font-bold text-amber-300"><Lightbulb className="h-4 w-4" /> Orientación obligatoria</p>
            <p className="mt-2">Al capturar U, R, F, D, L y B, no gires una cara como si fuera una fotografía independiente. Conserva el cubo en la orientación indicada; una cara rotada produce un estado imposible.</p>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-2xl border border-rose-800 bg-rose-950/50 p-4 text-xs text-rose-200">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" /> {error}
            </div>
          )}
        </aside>
      </div>

      {solution.length > 0 && (
        <section className="rounded-2xl border border-emerald-500/30 bg-slate-900 p-4 sm:p-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">2. Solución calculada</p>
              <h3 className="mt-1 text-xl font-bold text-white">{solution.length} movimientos para resolver</h3>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setCurrentMove(Math.max(0, currentMove - 1))} disabled={currentMove === 0} className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-bold disabled:opacity-40">Anterior</button>
              <button onClick={() => setCurrentMove(Math.min(solution.length, currentMove + 1))} disabled={currentMove === solution.length} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold disabled:opacity-40">Hecho, siguiente</button>
            </div>
          </div>

          {currentMove < solution.length ? (
            <div className="mt-5 flex flex-col sm:flex-row items-center gap-5 rounded-2xl border border-indigo-500/30 bg-indigo-950/30 p-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 font-mono text-3xl font-black text-white">
                {solution[currentMove]}
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-300">Movimiento {currentMove + 1} de {solution.length}</p>
                <h4 className="mt-1 text-lg font-bold text-white">{MOVE_DESCRIPTIONS_ES[solution[currentMove]]?.title}</h4>
                <p className="mt-1 text-sm text-slate-300">{MOVE_DESCRIPTIONS_ES[solution[currentMove]]?.desc}</p>
                <p className="mt-2 text-xs text-slate-400">Mantén blanco arriba y verde al frente durante toda la secuencia.</p>
              </div>
            </div>
          ) : (
            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-5 text-emerald-200">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              <div><p className="font-bold">Secuencia completada</p><p className="text-xs">Tu cubo debe estar resuelto. Si no lo está, revisa la captura y la orientación inicial.</p></div>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-1.5">
            {solution.map((move, index) => (
              <button key={`${move}-${index}`} onClick={() => setCurrentMove(index)} className={`rounded-lg border px-2.5 py-1 font-mono text-xs font-bold ${
                index < currentMove ? 'border-emerald-800 bg-emerald-950 text-emerald-300' :
                index === currentMove ? 'border-indigo-400 bg-indigo-600 text-white' :
                'border-slate-700 bg-slate-800 text-slate-300'
              }`}>{move}</button>
            ))}
          </div>
        </section>
      )}

      {cubeAlreadySolved && (
        <section className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-5 text-emerald-200">
          <CheckCircle2 className="h-8 w-8 shrink-0 text-emerald-400" />
          <div>
            <p className="font-bold">El estado registrado ya está resuelto</p>
            <p className="text-xs">No es necesario ejecutar ningún movimiento.</p>
          </div>
        </section>
      )}
    </div>
  );
};
