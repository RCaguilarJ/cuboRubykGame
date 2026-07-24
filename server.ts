import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";

let solverInitialization: Promise<any> | null = null;

async function getCubeSolver() {
  if (!solverInitialization) {
    solverInitialization = import("./vendor/cubejs/index.cjs").then((module) => {
      const Cube = (module as any).default || module;
      Cube.initSolver();
      return Cube;
    });
  }
  return solverInitialization;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for JSON payload (large enough for base64 images)
  app.use(express.json({ limit: "25mb" }));

  // Helper lazy init for Gemini API
  const getGeminiAI = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  app.post("/api/solve-cube", async (req, res) => {
    try {
      const { facelets } = req.body as { facelets?: string };
      if (!facelets || !/^[URFDLB]{54}$/.test(facelets)) {
        return res.status(400).json({ success: false, error: "El estado debe contener exactamente 54 casillas válidas." });
      }

      for (const face of ["U", "R", "F", "D", "L", "B"]) {
        if ([...facelets].filter((value) => value === face).length !== 9) {
          return res.status(400).json({ success: false, error: `El color ${face} debe aparecer exactamente 9 veces.` });
        }
      }

      const Cube = await getCubeSolver();
      const cube = Cube.fromString(facelets);
      const algorithm = cube.isSolved() ? "" : cube.solve();
      const moves = algorithm.trim() ? algorithm.trim().split(/\s+/) : [];
      res.json({ success: true, algorithm, moves, moveCount: moves.length });
    } catch (error: any) {
      console.error("Invalid cube state:", error);
      res.status(422).json({
        success: false,
        error: "El estado no es físicamente posible. Revisa colores, centros y orientación de las seis caras.",
      });
    }
  });

  // Multimodal Gemini API route for Rubik's cube photo analysis & troubleshooting
  app.post("/api/analyze-cube", async (req, res) => {
    try {
      const { imageBase64, mimeType = "image/jpeg", currentStep, prompt } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ error: "No image provided" });
      }

      const ai = getGeminiAI();

      const systemInstruction = `Eres un experto mundial y tutor amable de Cubo Rubik. 
Tu tarea es analizar la fotografía o captura del cubo Rubik enviado por el usuario, identificar el estado visual, el nivel o capa actual (Cruz Blanca, Esquinas Blancas, Capa Media, Cruz Amarilla, Permutación/Orientación Amarilla), e indicarle exactamente cómo proceder.

Responde SIEMPRE en formato JSON estructurado con los siguientes campos:
{
  "detectedFace": "Nombre de la cara principal vista (ej: Cara Superior Amarilla, Frente Rojo, etc.)",
  "identifiedStage": "Paso identificado (ej: 'Cruz Amarilla - Patrón en L', 'Capa Media Incompleta', 'Orientando Esquinas', etc.)",
  "explanation": "Explicación clara y comprensiva en español de lo que ves en la foto y qué se necesita hacer.",
  "moves": ["U", "R", "U'", "R'"], // Arreglo de movimientos recomendados en notación estándar
  "tips": ["Consejo clave 1", "Consejo clave 2"],
  "confidence": "Alta" | "Media" | "Baja"
}

Importante: Los movimientos en 'moves' deben usar únicamente notación oficial de Cubo Rubik (U, U', U2, D, D', D2, R, R', R2, L, L', L2, F, F', F2, B, B', B2).`;

      const userTextPrompt = prompt || `Analiza esta foto de mi cubo Rubik. ${currentStep ? `Estoy intentando el paso: ${currentStep}.` : ''} Por favor dime qué estado ves y qué movimientos debo realizar para avanzar.`;

      // Clean base64 data if data URL prefix exists
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType || "image/jpeg",
                data: cleanBase64,
              },
            },
            {
              text: userTextPrompt,
            },
          ],
        },
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const text = response.text || "{}";
      let parsedResult;
      try {
        parsedResult = JSON.parse(text);
      } catch (e) {
        parsedResult = {
          rawText: text,
          explanation: text,
          moves: [],
          tips: ["Intenta tomar la foto con buena iluminación y centrándo la cara frontal y superior."],
        };
      }

      res.json({ success: true, result: parsedResult });
    } catch (error: any) {
      console.error("Error analyzing cube photo:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error al analizar la imagen con Gemini AI",
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = __dirname;
    app.use(express.static(distPath));
    app.use((_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Rubik Solver 3D Server running on http://localhost:${PORT}`);
  });

  server.on("error", (error) => {
    console.error("Unable to start the HTTP server:", error);
    process.exitCode = 1;
  });
}

startServer().catch((error) => {
  console.error("Application startup failed:", error);
  process.exitCode = 1;
});
