import { ColorCode, CubeFacelets, MoveNotation } from '../../types';

// Standard Rubik Color Palette
export const COLOR_HEX_MAP: Record<ColorCode, string> = {
  W: '#FFFFFF', // White (Up)
  Y: '#FFD700', // Yellow (Down)
  G: '#009E60', // Green (Front)
  B: '#0051BA', // Blue (Back)
  O: '#FF5800', // Orange (Left)
  R: '#C41E3A', // Red (Right)
};

export const COLOR_NAMES_ES: Record<ColorCode, string> = {
  W: 'Blanco',
  Y: 'Amarillo',
  G: 'Verde',
  B: 'Azul',
  O: 'Naranja',
  R: 'Rojo',
};

// Initial solved state (9 stickers per face: 0-2 top row, 3-5 middle row, 6-8 bottom row)
export function createSolvedCubeFacelets(): CubeFacelets {
  return {
    U: Array(9).fill('W'), // White Up
    D: Array(9).fill('Y'), // Yellow Down
    F: Array(9).fill('G'), // Green Front
    B: Array(9).fill('B'), // Blue Back
    L: Array(9).fill('O'), // Orange Left
    R: Array(9).fill('R'), // Red Right
  };
}

// Descriptions in Spanish for each move
export const MOVE_DESCRIPTIONS_ES: Record<MoveNotation, { title: string; desc: string }> = {
  'U': { title: 'U (Up)', desc: 'Girar la cara superior en sentido horario (hacia la izquierda)' },
  "U'": { title: "U' (Up Inverso)", desc: 'Girar la cara superior en sentido antihorario (hacia la derecha)' },
  'U2': { title: 'U2', desc: 'Girar la cara superior dos veces (180°)' },

  'D': { title: 'D (Down)', desc: 'Girar la cara inferior en sentido horario' },
  "D'": { title: "D' (Down Inverso)", desc: 'Girar la cara inferior en sentido antihorario' },
  'D2': { title: 'D2', desc: 'Girar la cara inferior dos veces (180°)' },

  'R': { title: 'R (Right)', desc: 'Girar la cara derecha hacia arriba (sentido horario)' },
  "R'": { title: "R' (Right Inverso)", desc: 'Girar la cara derecha hacia abajo (sentido antihorario)' },
  'R2': { title: 'R2', desc: 'Girar la cara derecha dos veces (180°)' },

  'L': { title: 'L (Left)', desc: 'Girar la cara izquierda hacia abajo (sentido horario)' },
  "L'": { title: "L' (Left Inverso)", desc: 'Girar la cara izquierda hacia arriba (sentido antihorario)' },
  'L2': { title: 'L2', desc: 'Girar la cara izquierda dos veces (180°)' },

  'F': { title: 'F (Front)', desc: 'Girar la cara frontal en sentido horario' },
  "F'": { title: "F' (Front Inverso)", desc: 'Girar la cara frontal en sentido antihorario' },
  'F2': { title: 'F2', desc: 'Girar la cara frontal dos veces (180°)' },

  'B': { title: 'B (Back)', desc: 'Girar la cara trasera en sentido horario' },
  "B'": { title: "B' (Back Inverso)", desc: 'Girar la cara trasera en sentido antihorario' },
  'B2': { title: 'B2', desc: 'Girar la cara trasera dos veces (180°)' },
};

// Generate random scramble sequence
export function generateScramble(length = 20): MoveNotation[] {
  const possibleBase: ('U' | 'D' | 'R' | 'L' | 'F' | 'B')[] = ['U', 'D', 'R', 'L', 'F', 'B'];
  const modifiers = ['', "'", '2'];
  const scramble: MoveNotation[] = [];

  let lastFace = '';
  for (let i = 0; i < length; i++) {
    let face: 'U' | 'D' | 'R' | 'L' | 'F' | 'B';
    do {
      face = possibleBase[Math.floor(Math.random() * possibleBase.length)];
    } while (face === lastFace);

    lastFace = face;
    const mod = modifiers[Math.floor(Math.random() * modifiers.length)];
    scramble.push(`${face}${mod}` as MoveNotation);
  }

  return scramble;
}

// Convert facelet rotation: 90 deg clockwise array permutation
function rotateFaceCW<T>(arr: T[]): T[] {
  return [
    arr[6], arr[3], arr[0],
    arr[7], arr[4], arr[1],
    arr[8], arr[5], arr[2],
  ];
}

function rotateFaceCCW<T>(arr: T[]): T[] {
  return [
    arr[2], arr[5], arr[8],
    arr[1], arr[4], arr[7],
    arr[0], arr[3], arr[6],
  ];
}

// Apply single move to facelet state representation
export function applyMoveToFacelets(state: CubeFacelets, move: MoveNotation): CubeFacelets {
  const next: CubeFacelets = {
    U: [...state.U],
    D: [...state.D],
    F: [...state.F],
    B: [...state.B],
    L: [...state.L],
    R: [...state.R],
  };

  const base = move[0] as 'U' | 'D' | 'R' | 'L' | 'F' | 'B';
  const isPrime = move.includes("'");
  const is2 = move.includes('2');

  const turns = is2 ? 2 : isPrime ? 3 : 1;

  for (let t = 0; t < turns; t++) {
    const tempF = [...next.F];
    const tempB = [...next.B];
    const tempU = [...next.U];
    const tempD = [...next.D];
    const tempL = [...next.L];
    const tempR = [...next.R];

    switch (base) {
      case 'U':
        next.U = rotateFaceCW(next.U);
        next.F[0] = tempR[0]; next.F[1] = tempR[1]; next.F[2] = tempR[2];
        next.L[0] = tempF[0]; next.L[1] = tempF[1]; next.L[2] = tempF[2];
        next.B[0] = tempL[0]; next.B[1] = tempL[1]; next.B[2] = tempL[2];
        next.R[0] = tempB[0]; next.R[1] = tempB[1]; next.R[2] = tempB[2];
        break;

      case 'D':
        next.D = rotateFaceCW(next.D);
        next.F[6] = tempL[6]; next.F[7] = tempL[7]; next.F[8] = tempL[8];
        next.R[6] = tempF[6]; next.R[7] = tempF[7]; next.R[8] = tempF[8];
        next.B[6] = tempR[6]; next.B[7] = tempR[7]; next.B[8] = tempR[8];
        next.L[6] = tempB[6]; next.L[7] = tempB[7]; next.L[8] = tempB[8];
        break;

      case 'R':
        next.R = rotateFaceCW(next.R);
        next.U[2] = tempF[2]; next.U[5] = tempF[5]; next.U[8] = tempF[8];
        next.B[0] = tempU[8]; next.B[3] = tempU[5]; next.B[6] = tempU[2];
        next.D[2] = tempB[6]; next.D[5] = tempB[3]; next.D[8] = tempB[0];
        next.F[2] = tempD[2]; next.F[5] = tempD[5]; next.F[8] = tempD[8];
        break;

      case 'L':
        next.L = rotateFaceCW(next.L);
        next.U[0] = tempB[8]; next.U[3] = tempB[5]; next.U[6] = tempB[2];
        next.F[0] = tempU[0]; next.F[3] = tempU[3]; next.F[6] = tempU[6];
        next.D[0] = tempF[0]; next.D[3] = tempF[3]; next.D[6] = tempF[6];
        next.B[8] = tempD[0]; next.B[5] = tempD[3]; next.B[2] = tempD[6];
        break;

      case 'F':
        next.F = rotateFaceCW(next.F);
        next.U[6] = tempL[8]; next.U[7] = tempL[5]; next.U[8] = tempL[2];
        next.R[0] = tempU[6]; next.R[3] = tempU[7]; next.R[6] = tempU[8];
        next.D[2] = tempR[0]; next.D[1] = tempR[3]; next.D[0] = tempR[6];
        next.L[8] = tempD[2]; next.L[5] = tempD[1]; next.L[2] = tempD[0];
        break;

      case 'B':
        next.B = rotateFaceCW(next.B);
        next.U[2] = tempR[2]; next.U[1] = tempR[5]; next.U[0] = tempR[8];
        next.L[0] = tempU[2]; next.L[3] = tempU[1]; next.L[6] = tempU[0];
        next.D[6] = tempL[0]; next.D[7] = tempL[3]; next.D[8] = tempL[6];
        next.R[8] = tempD[6]; next.R[5] = tempD[7]; next.R[2] = tempD[8];
        break;
    }
  }

  return next;
}
