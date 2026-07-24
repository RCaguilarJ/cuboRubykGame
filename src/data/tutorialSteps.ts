import { TutorialStep } from '../types';

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'intro-notation',
    stage: 0,
    title: '1. Conceptos Básicos y Notación',
    subtitle: 'Comprende la estructura del cubo y la lectura de algoritmos',
    levelTag: 'Básico',
    targetGoal: 'Identificar Vértices, Aristas, Centros y los movimientos estándar (U, D, R, L, F, B).',
    description:
      'El Cubo Rubik 3x3 consta de 26 piezas externas divididas en 3 tipos fundamentales:\n' +
      '• Centros (6 piezas): Tienen 1 solo color y nunca cambian de posición relativa entre sí.\n' +
      '• Aristas (12 piezas): Tienen 2 colores y unen dos caras adyacentes.\n' +
      '• Vértices / Esquinas (8 piezas): Tienen 3 colores y forman las esquinas del cubo.\n\n' +
      'Cada letra representa un giro de 90° en sentido horario mirando directamente esa cara:',
    detailPoints: [
      'U (Up / Arriba): Capa superior.',
      'D (Down / Abajo): Capa inferior.',
      'R (Right / Derecha): Capa derecha.',
      'L (Left / Izquierda): Capa izquierda.',
      'F (Front / Frente): Capa frontal que miras de frente.',
      'B (Back / Atrás): Capa trasera.',
      "Un apóstrofe (') indica giro ANTIHORARIO (ej: U'). Un número 2 indica giros de 180° (ej: R2).",
    ],
    algorithms: [
      {
        name: 'Giro Básico Sexy Move (Demo)',
        moves: ['R', 'U', "R'", "U'"],
        condition: 'El patrón más famoso del Cubo Rubik',
        tip: 'Practica este movimiento 6 veces seguidas y el cubo volverá a su estado inicial.',
      },
    ],
    interactiveMoves: ['R', 'U', "R'", "U'"],
  },
  {
    id: 'layer1-cross',
    stage: 1,
    title: '2. Primera Capa: La Cruz Blanca',
    subtitle: 'Forma una cruz en la cara blanca alineando los laterales',
    levelTag: 'Capa 1',
    targetGoal: 'Formar la Cruz Blanca en la cara superior con cada arista coincidiendo con el centro lateral.',
    description:
      'El primer objetivo práctico es armar una Cruz Blanca. ¡Atención! No basta con colocar 4 piezas blancas alrededor del centro blanco: el color lateral de cada arista DEBE coincidir con el centro de la cara contigua (Verde con Verde, Rojo con Rojo, etc.).',
    detailPoints: [
      'Sostén el cubo con el centro Blanco arriba (o amarillo arriba buscando las margarita de referencia).',
      'Localiza una arista con color blanco en cualquier parte del cubo.',
      'Gira la capa inferior o intermedia hasta alinear el color secundario de la arista con su centro lateral correspondiente.',
      'Si el blanco está mirando hacia ti en la capa frontal, usa la secuencia de inserción.',
    ],
    algorithms: [
      {
        name: 'Inserción Frontal de Arista',
        moves: ["F'", 'U', "L'", "U'"],
        condition: 'Si la pieza blanca está en la cara frontal mirando hacia ti',
        tip: 'Asegúrate de que al subir la arista, el centro adyacente conserve la coincidencia de color.',
      },
      {
        name: 'Voltear Arista Invertida',
        moves: ["F'", 'R', "U'", "R'"],
        condition: 'Si la arista blanca está en su sitio pero volteada con los colores al revés',
        tip: 'Saca la pieza lateralmente y vuelve a insertarla con la orientación correcta.',
      },
    ],
    interactiveMoves: ['F', 'R', 'U', "R'", "U'", "F'"],
  },
  {
    id: 'layer1-corners',
    stage: 2,
    title: '3. Primera Capa: Las Esquinas Blancas',
    subtitle: 'Completa la primera cara y la primera capa del cubo',
    levelTag: 'Capa 1',
    targetGoal: 'Completar la cara blanca superior con las 4 esquinas bien situadas y orientadas.',
    description:
      'Ahora colocaremos los 4 vértices / esquinas blancas. Al terminar este paso, la primera cara estará completamente blanca y la franja lateral superior formará una "T" limpia en cada cara lateral.',
    detailPoints: [
      'Busca en la capa inferior (capa D) una esquina que contenga el color BLANCO.',
      'Identifica sus otros dos colores (ejemplo: Blanco - Rojo - Verde).',
      'Coloca esa esquina justo DEBAJO del hueco donde debe ir (entre los centros Blanco, Rojo y Verde).',
      'Aplica el algoritmo "R\' D\' R D" sosteniendo el hueco objetivo arriba a la derecha.',
    ],
    algorithms: [
      {
        name: 'Algoritmo Repetitivo de Esquina (Sexy Move Invertido)',
        moves: ["R'", "D'", 'R', 'D'],
        condition: 'Repite de 1 a 5 veces hasta que la esquina quede arriba con la cara blanca orientada',
        tip: '¡NUNCA olvides dar el último movimiento D al final de la secuencia!',
      },
    ],
    interactiveMoves: ["R'", "D'", 'R', 'D'],
  },
  {
    id: 'layer2-edges',
    stage: 3,
    title: '4. Capa Media: Las Aristas Centrales',
    subtitle: 'Resuelve las 4 aristas del cinturón medio sin desarmar la capa superior',
    levelTag: 'Capa 2',
    targetGoal: 'Completar las dos primeras capas (F2L intuitivo del método de capas).',
    description:
      'Voltea el cubo de modo que la capa blanca completada quede abajo (D). Ahora la cara superior será la Amarilla. Buscaremos en la capa superior aristas que NO tengan color Amarillo.',
    detailPoints: [
      'Busca una arista en la capa superior (U) que no tenga amarillo (ej: Verde-Rojo).',
      'Gira la capa U hasta que el color frontal de la arista coincida con el centro lateral formando una "T" vertical.',
      'Mira si la arista debe ir hacia la DERECHA o hacia la IZQUIERDA.',
    ],
    algorithms: [
      {
        name: 'Insertar Arista a la DERECHA',
        moves: ['U', 'R', "U'", "R'", "U'", "F'", 'U', 'F'],
        condition: 'Si el color superior de la arista coincide con el centro de la DERECHA',
        tip: 'La secuencia primero aleja la arista y luego une la pareja esquina-arista para bajarla juntas.',
      },
      {
        name: 'Insertar Arista a la IZQUIERDA',
        moves: ["U'", "L'", 'U', 'L', 'U', 'F', "U'", "F'"],
        condition: 'Si el color superior de la arista coincide con el centro de la IZQUIERDA',
        tip: 'Si una arista está atascada en la capa media con colores invertidos, aplica este algoritmo para sacarla a la capa U.',
      },
    ],
    interactiveMoves: ['U', 'R', "U'", "R'", "U'", "F'", 'U', 'F'],
  },
  {
    id: 'layer3-cross',
    stage: 4,
    title: '5. Tercera Capa: La Cruz Amarilla',
    subtitle: 'Forma la cruz en la cara superior manteniendo la vista hacia arriba',
    levelTag: 'Capa 3',
    targetGoal: 'Obtener una cruz amarilla en la cara superior (U).',
    description:
      'Observa únicamente las piezas amarillas de la cara superior. Ignora de momento si coinciden con las caras laterales. Verás uno de los 4 estados posibles:',
    detailPoints: [
      '1. Punto Amarillo: Solo el centro es amarillo.',
      '2. "L" Amarilla: Dos aristas forman una L (colócala apuntando a las 9 y a las 12 del reloj).',
      '3. Línea Amarilla: Dos aristas forman una línea horizontal.',
      '4. Cruz Amarilla: ¡Paso completado!',
    ],
    algorithms: [
      {
        name: 'Algoritmo de la Cruz Amarilla (FRUR\'U\'F\')',
        moves: ['F', 'R', 'U', "R'", "U'", "F'"],
        condition: 'Se aplica desde el Punto para pasar a la L, de la L a la Línea, y de la Línea a la Cruz',
        tip: 'Asegúrate de colocar la L a las 9:00 o la Línea en posición HORIZONTAL antes de ejecutar.',
      },
    ],
    interactiveMoves: ['F', 'R', 'U', "R'", "U'", "F'"],
  },
  {
    id: 'layer3-permute-edges',
    stage: 5,
    title: '6. Tercera Capa: Ordenar las Aristas de la Cruz Amarilla',
    subtitle: 'Haz coincidir los colores laterales de la Cruz Amarilla con los centros',
    levelTag: 'Capa 3',
    targetGoal: 'Alinear los 4 brazos de la cruz amarilla con sus respectivos centros laterales (Rojo, Verde, Naranja, Azul).',
    description:
      'Gira la capa superior U hasta que coincidan al menos 2 aristas de la cruz con los centros laterales. Habrá dos casos: las dos aristas coincidentes están Contiguas (al lado) o Respuestas (frente a frente).',
    detailPoints: [
      'Si están contiguas: coloca una atrás (B) y la otra a la derecha (R).',
      'Si están opuestas: ejecuta el algoritmo desde cualquier frente, luego gira U y verás 2 contiguas.',
    ],
    algorithms: [
      {
        name: 'Algoritmo Sune para Aristas',
        moves: ['R', 'U', "R'", 'U', 'R', 'U2', "R'", 'U'],
        condition: 'Intercambia las aristas no alineadas manteniendo la cruz intacta',
        tip: 'Observa cómo el bloque blanco da una vuelta completa antes de retornar a su base.',
      },
    ],
    interactiveMoves: ['R', 'U', "R'", 'U', 'R', 'U2', "R'"],
  },
  {
    id: 'layer3-permute-corners',
    stage: 6,
    title: '7. Tercera Capa: Posicionar Esquinas Amarillas',
    subtitle: 'Coloca cada vértice en el rincón correcto (sin importar su orientación)',
    levelTag: 'Capa 3',
    targetGoal: 'Lograr que las 4 esquinas estén en sus vértices correspondientes entre sus 3 centros adyacentes.',
    description:
      'Revisa las 4 esquinas superiores. Una esquina está "en su sitio" si contiene los 3 colores de las 3 caras que la rodean (por ejemplo: la esquina Amarillo-Rojo-Verde está entre los centros Amarillo, Rojo y Verde), aunque los colores estén rotados.',
    detailPoints: [
      'Si tienes 1 esquina bien colocada: ponla en la posición superior derecha frontal (UFR).',
      'Si no tienes ninguna bien colocada: aplica el algoritmo desde cualquier cara y vuelve a buscar.',
      'Si las 4 están bien colocadas: ¡Avanza al paso final!',
    ],
    algorithms: [
      {
        name: 'Algoritmo de Permutación Niklas',
        moves: ['U', 'R', "U'", "L'", 'U', "R'", "U'", 'L'],
        condition: 'Mantiene fija la esquina superior derecha y rota en triángulo las otras 3',
        tip: 'Repite 1 o 2 veces sosteniendo siempre la esquina correcta a la derecha frente a ti.',
      },
    ],
    interactiveMoves: ['U', 'R', "U'", "L'", 'U', "R'", "U'", 'L'],
  },
  {
    id: 'layer3-orient-corners',
    stage: 7,
    title: '8. Paso Final: Orientar Esquinas Amarillas y Resolver',
    subtitle: 'El toque maestro para armar completamente tu Cubo Rubik',
    levelTag: 'Avanzado',
    targetGoal: 'Girar los parches amarillos hacia arriba para resolver el cubo al 100%.',
    description:
      '¡Atención máxima en este paso! Parece que el cubo se desarma mientras ejecutas el algoritmo, pero si mantienes la disciplina, se resolverá por completo al final.',
    detailPoints: [
      '1. Coloca el cubo con la esquina mal orientada en la posición ARRIBA - DERECHA - FRENTE.',
      '2. Ejecuta el algoritmo R\' D\' R D repetidamente (2 o 4 veces) hasta que la cara amarilla de esa esquina mire hacia ARRIBA.',
      '3. IMPORTANTE: Cuando el amarillo quede arriba, NO MUEVAS TODO EL CUBO. Gira solo la cara superior (U o U\') para traer la SIGUIENTE esquina rota a la posición arriba-derecha.',
      '4. Repite R\' D\' R D hasta acomodar la esquina y finalmente alinea la cara U.',
    ],
    algorithms: [
      {
        name: 'Algoritmo de Orientación de Vértice',
        moves: ["R'", "D'", 'R', 'D'],
        condition: 'Aplicar tantas veces como sea necesario para cada esquina desorientada',
        tip: 'NUNCA rotes el cuerpo del cubo entre esquina y esquina. Solo gira la capa U para traer la siguiente esquina.',
      },
    ],
    interactiveMoves: ["R'", "D'", 'R', 'D', "R'", "D'", 'R', 'D'],
  },
];
