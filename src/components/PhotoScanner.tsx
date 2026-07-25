import React, { useRef, useState } from 'react';
import { Camera, Upload, Sparkles, AlertCircle, RefreshCw, Play, CheckCircle2, Lightbulb, Box } from 'lucide-react';
import { AnalysisResult, MoveNotation } from '../types';
import { RubikViewer3D } from './RubikViewer3D';

interface PhotoScannerProps {
  initialStageName?: string;
}

export const PhotoScanner: React.FC<PhotoScannerProps> = ({ initialStageName }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [userQuestion, setUserQuestion] = useState<string>('');
  const [selectedStage, setSelectedStage] = useState<string>(initialStageName || 'Cruz Blanca (Capa 1)');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Start device camera
  const startCamera = async () => {
    try {
      setErrorMessage(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error('Error accessing camera:', err);
      setErrorMessage('No se pudo acceder a la cámara. Revisa los permisos de tu navegador o sube una foto desde tu galería.');
      setIsCameraActive(false);
    }
  };

  // Stop device camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Capture photo from camera video stream
  const captureCameraPhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setSelectedImage(dataUrl);
      stopCamera();
    }
  };

  // Handle image upload from file picker
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setSelectedImage(dataUrl);
      stopCamera();
    };
    reader.readAsDataURL(file);
  };

  // Trigger Gemini AI analysis
  const handleAnalyzePhoto = async () => {
    if (!selectedImage) return;

    setIsLoading(true);
    setErrorMessage(null);
    setAnalysisResult(null);

    try {
      const response = await fetch('/api/analyze-cube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage,
          currentStep: selectedStage,
          prompt: userQuestion.trim()
            ? `Pregunta del usuario: "${userQuestion.trim()}". Etapa esperada: ${selectedStage}.`
            : `Estoy en la etapa: ${selectedStage}. Analiza mi foto del cubo y dime qué estado ves y qué movimientos debo realizar para avanzar.`,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Error al procesar la imagen.');
      }

      setAnalysisResult(data.result);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setErrorMessage(err.message || 'Ocurrió un error al analizar la fotografía. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-w-0 space-y-5 sm:space-y-8">
      {/* Scanner Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Asistente de Rescate con Visión IA</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            ¿Te Atascaste en tu Cubo? <span className="text-emerald-400">Toma una Foto</span>
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Nuestra IA Gemini analiza la orientación de las caras de tu cubo Rubik real, detecta la capa en la que te encuentras y te indica exactamente qué algoritmo o movimientos realizar para desbloquearte.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 min-w-0">
        {/* Left Photo Capture / Upload Column (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-5 min-w-0">
          <h3 className="text-base font-bold text-white flex flex-wrap items-center justify-between gap-2">
            <span>Captura o Foto de tu Cubo</span>
            {selectedImage && (
              <button
                onClick={() => {
                  setSelectedImage(null);
                  setAnalysisResult(null);
                }}
                className="text-xs text-rose-400 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Cambiar foto
              </button>
            )}
          </h3>

          {/* Camera Viewport or Selected Image Preview */}
          <div className="relative w-full h-[260px] sm:h-[320px] bg-slate-950 rounded-2xl overflow-hidden border-2 border-dashed border-slate-800 flex items-center justify-center">
            {isCameraActive ? (
              <div className="relative w-full h-full">
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                <div className="absolute inset-0 border-2 border-emerald-500/40 rounded-2xl pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-dashed border-emerald-400/70 rounded-xl"></div>
                </div>
                <button
                  id="btn-capture-photo"
                  onClick={captureCameraPhoto}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/40 flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" /> Tomar Foto
                </button>
              </div>
            ) : selectedImage ? (
              <img src={selectedImage} alt="Cubo Rubik capturado" className="w-full h-full object-contain p-2" />
            ) : (
              <div className="text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
                  <Camera className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">Apunta la cara principal del cubo</p>
                  <p className="text-xs text-slate-400 mt-1">Asegúrate de tener buena iluminación para distinguir los colores.</p>
                </div>
                <div className="flex flex-col min-[420px]:flex-row items-stretch min-[420px]:items-center justify-center gap-2 sm:gap-3 pt-2">
                  <button
                    id="btn-start-camera"
                    onClick={startCamera}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/30 flex items-center gap-1.5"
                  >
                    <Camera className="w-4 h-4" /> Abrir Cámara
                  </button>
                  <button
                    id="btn-upload-file"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center gap-1.5"
                  >
                    <Upload className="w-4 h-4 text-indigo-400" /> Sube una Imagen
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Additional Context Inputs */}
          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ¿En qué nivel o capa estabas trabajando?
              </label>
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="Cruz Blanca (Capa 1)">Paso 1: Cruz Blanca (Capa 1)</option>
                <option value="Esquinas Blancas (Capa 1)">Paso 2: Esquinas Blancas (Capa 1)</option>
                <option value="Capa Media (Aristas)">Paso 3: Capa Media / Cinturón (Aristas)</option>
                <option value="Cruz Amarilla (Capa 3)">Paso 4: Cruz Amarilla (Capa Superior)</option>
                <option value="Alinear Cruz Amarilla">Paso 5: Alinear Cruz Amarilla con Centros</option>
                <option value="Posicionar Esquinas Amarillas">Paso 6: Posicionar Esquinas Amarillas</option>
                <option value="Orientar Esquinas Amarillas">Paso 7: Orientar Esquinas Amarillas (Paso Final)</option>
                <option value="No estoy seguro / Evaluar cubo completo">No estoy seguro / Evaluar cubo completo</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ¿Algún detalle específico o duda? (Opcional)
              </label>
              <input
                type="text"
                value={userQuestion}
                onChange={(e) => setUserQuestion(e.target.value)}
                placeholder="Ej: Tengo la L amarilla pero no sé si rotar la cara..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              id="btn-analyze-cube"
              onClick={handleAnalyzePhoto}
              disabled={!selectedImage || isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analizando foto con IA...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Obtener Diagnóstico y Solución IA</span>
                </>
              )}
            </button>

            {errorMessage && (
              <div className="bg-rose-950/60 border border-rose-800 rounded-xl p-3 flex items-start space-x-2 text-xs text-rose-200">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Analysis Result & Solution Column (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {analysisResult ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-5 animate-fadeIn min-w-0">
              <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Diagnóstico IA Generativo
                  </span>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    {analysisResult.identifiedStage || 'Estado Identificado'}
                  </h3>
                </div>
                {analysisResult.confidence && (
                  <span className="text-xs bg-slate-800 text-slate-300 font-semibold px-2.5 py-1 rounded-full border border-slate-700">
                    Confianza: {analysisResult.confidence}
                  </span>
                )}
              </div>

              {/* Detected Face Badge */}
              {analysisResult.detectedFace && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center space-x-2 text-xs text-slate-300">
                  <Box className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>
                    <strong>Cara detectada:</strong> {analysisResult.detectedFace}
                  </span>
                </div>
              )}

              {/* Detailed Explanation */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Explicación del Estado</h4>
                <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/70 border border-slate-800 rounded-xl p-3.5">
                  {analysisResult.explanation}
                </p>
              </div>

              {/* Recommended Moves */}
              {analysisResult.moves && analysisResult.moves.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Play className="w-3.5 h-3.5 fill-emerald-400" /> Secuencia de Movimientos Recomendada
                  </h4>
                  <div className="flex flex-wrap gap-2 bg-indigo-950/50 border border-indigo-800/70 rounded-xl p-3.5">
                    {analysisResult.moves.map((move, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-indigo-600 text-white font-mono font-bold text-sm rounded-lg shadow-md border border-indigo-400/50"
                      >
                        {move}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actionable Tips */}
              {analysisResult.tips && analysisResult.tips.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Consejos para no atorarte
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {analysisResult.tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Interactive 3D Player for AI moves */}
              {analysisResult.moves && analysisResult.moves.length > 0 && (
                <div className="pt-2">
                  <RubikViewer3D
                    initialMoves={analysisResult.moves as MoveNotation[]}
                    title="Solución IA en 3D"
                    subtitle="Reproduce la secuencia exacta calculada por la IA para continuar con tu cubo."
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
                <Sparkles className="w-8 h-8 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Esperando tu fotografía</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  Toma o suba una foto clara de tu cubo Rubik para recibir un diagnóstico personalizado y la solución paso a paso.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
