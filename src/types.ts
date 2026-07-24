export type ColorCode = 'W' | 'Y' | 'G' | 'B' | 'R' | 'O';

export type FaceName = 'U' | 'D' | 'F' | 'B' | 'L' | 'R';

export type MoveNotation = 
  | 'U' | "U'" | 'U2' 
  | 'D' | "D'" | 'D2' 
  | 'R' | "R'" | 'R2' 
  | 'L' | "L'" | 'L2' 
  | 'F' | "F'" | 'F2' 
  | 'B' | "B'" | 'B2';

export interface TutorialStep {
  id: string;
  stage: number; // 0: Notación, 1: Primera Capa (Cruz), 2: Primera Capa (Esquinas), 3: Capa Media, 4: Cruz Amarilla, 5: Ordenar Cruz Amarilla, 6: Posición Esquinas, 7: Orientar Esquinas
  title: string;
  subtitle: string;
  levelTag: 'Básico' | 'Capa 1' | 'Capa 2' | 'Capa 3' | 'Avanzado';
  description: string;
  detailPoints: string[];
  algorithms: {
    name: string;
    moves: MoveNotation[];
    condition: string;
    tip: string;
  }[];
  interactiveMoves?: MoveNotation[];
  targetGoal: string;
}

export interface AnalysisResult {
  detectedFace?: string;
  identifiedStage?: string;
  explanation: string;
  moves: MoveNotation[];
  tips: string[];
  confidence?: 'Alta' | 'Media' | 'Baja';
  rawText?: string;
}

export interface CubeFacelets {
  U: ColorCode[]; // 9 facelets (0..8)
  D: ColorCode[];
  F: ColorCode[];
  B: ColorCode[];
  L: ColorCode[];
  R: ColorCode[];
}

export interface StepExecutionState {
  currentMoveIndex: number;
  totalMoves: number;
  isPlaying: boolean;
  speed: number; // in ms per move
  movesList: MoveNotation[];
}
