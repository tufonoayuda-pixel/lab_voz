"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Loader2, Mic, MicOff, Pause, Play, RotateCcw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { PitchVisualizer } from "@/components/voice-lab/pitch-visualizer";
import { cn } from "@/lib/utils";
import { PatientInfoForm } from "@/components/voice-lab/patient-info-form"; // Import the new form

const noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const noteFromPitch = (frequency: number): { note: string; octave: number; noteIndex: number; cents: number } => {
  const A4 = 440; // A4 frequency
  const A4_MIDI = 69; // A4 MIDI note number

  // Calculate MIDI note number from frequency
  const midiNoteFloat = 12 * (Math.log(frequency / A4) / Math.log(2)) + A4_MIDI;
  const roundedNoteNum = Math.round(midiNoteFloat); // Closest MIDI note

  // Calculate target frequency for the rounded MIDI note
  const targetFrequency = A4 * Math.pow(2, (roundedNoteNum - A4_MIDI) / 12);

  // Calculate cents deviation
  const cents = 1200 * (Math.log(frequency / targetFrequency) / Math.log(2));

  const noteIndex = roundedNoteNum % 12;
  const octave = Math.floor(roundedNoteNum / 12) - 1;

  return { note: noteStrings[noteIndex], octave, noteIndex: roundedNoteNum, cents };
};

export default function VoiceLabPage() {
  const { toast } = useToast();
  const [hasMicPermission, setHasMicPermission] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [pitch, setPitch] = useState({ hz: 0, note: "...", octave: 0, noteIndex: -1, cents: 0 });

  // Vocal Metrics State
  const [minPitch, setMinPitch] = useState<{ hz: number; note: string; octave: number } | null>(null);
  const [maxPitch, setMaxPitch] = useState<{ hz: number; note: string; octave: number } | null>(null);
  const [avgPitch, setAvgPitch] = useState<number>(0);
  const allPitchesRef = useRef<number[]>([]);

  // Pitch history state for the visualizer
  const [pitchHistory, setPitchHistory] = useState<{ cents: number; noteIndex: number }[]>([]);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number>();

  // Stopwatch state
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const [recordedTimes, setRecordedTimes] = useState<string[]>([]);
  const stopwatchIntervalRef = useRef<NodeJS.Timeout>();

  // Hydration fix
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const resetMetrics = () => {
    setMinPitch(null);
    setMaxPitch(null);
    setAvgPitch(0);
    allPitchesRef.current = [];
    setRecordedTimes([]);
    setStopwatchTime(0);
    if (isStopwatchRunning) {
      setIsStopwatchRunning(false);
    }
    setPitchHistory([]);
    toast({ title: "Métricas Reiniciadas", description: "Puede comenzar un nuevo análisis." });
  };

  const updateVocalMetrics = useCallback((currentHz: number, note: string, octave: number) => {
    if (currentHz > 0) {
      setMinPitch((prevMin) => {
        if (!prevMin || currentHz < prevMin.hz) {
          return { hz: currentHz, note, octave };
        }
        return prevMin;
      });
      setMaxPitch((prevMax) => {
        if (!prevMax || currentHz > prevMax.hz) {
          return { hz: currentHz, note, octave };
        }
        return prevMax;
      });
      allPitchesRef.current.push(currentHz);
      const sum = allPitchesRef.current.reduce((a, b) => a + b, 0);
      setAvgPitch(sum / allPitchesRef.current.length);
    }
  }, []);

  const updatePitch = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser || !audioContextRef.current || audioContextRef.current.state === "closed") {
      return;
    }

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);
    analyser.getFloatTimeDomainData(dataArray);

    let rms = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const val = dataArray[i];
      rms += val * val;
    }
    rms = Math.sqrt(rms / dataArray.length);

    if (rms < 0.01) {
      // not enough signal
      setPitch({ hz: 0, note: "...", octave: 0, noteIndex: -1, cents: 0 });
      setPitchHistory((prev) => [...prev, { cents: 0, noteIndex: -1 }]);
    } else {
      const r = new Float32Array(bufferLength);
      for (let i = 0; i < bufferLength; i++) {
        for (let j = 0; j < bufferLength - i; j++) {
          r[i] += dataArray[j] * dataArray[j + i];
        }
      }
      let d = 0;
      while (r[d] > r[d + 1]) d++;
      let maxval = -1,
        maxpos = -1;
      for (let i = d; i < bufferLength; i++) {
        if (r[i] > maxval) {
          maxval = r[i];
          maxpos = i;
        }
      }
      const T0 = maxpos;
      const freq = audioContextRef.current.sampleRate / T0;

      if (freq > 80 && freq < 1000) {
        // Reasonable human voice range
        const { note, octave, noteIndex, cents } = noteFromPitch(freq);
        setPitch({ hz: freq, note, octave, noteIndex, cents });
        updateVocalMetrics(freq, note, octave);
        setPitchHistory((prev) => [...prev, { cents, noteIndex }]);
      } else {
        setPitch({ hz: 0, note: "...", octave: 0, noteIndex: -1, cents: 0 });
        setPitchHistory((prev) => [...prev, { cents: 0, noteIndex: -1 }]);
      }
    }

    animationFrameRef.current = requestAnimationFrame(updatePitch);
  }, [updateVocalMetrics]);

  const startPitchDetection = async () => {
    if (isListening || !isClient) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasMicPermission(true);

      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = context;

      const analyser = context.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;

      const source = context.createMediaStreamSource(stream);
      mediaStreamSourceRef.current = source;
      source.connect(analyser);

      setIsListening(true);
      animationFrameRef.current = requestAnimationFrame(updatePitch);
    } catch (err) {
      console.error("Error accessing microphone", err);
      setHasMicPermission(false);
    }
  };

  const stopPitchDetection = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }
    if (mediaStreamSourceRef.current) {
      (mediaStreamSourceRef.current as any).mediaStream.getTracks().forEach((track: any) => track.stop());
      mediaStreamSourceRef.current.disconnect();
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
    }
    setIsListening(false);
    setPitch({ hz: 0, note: "...", octave: 0, noteIndex: -1, cents: 0 });
    setPitchHistory([]);
  }, []);

  useEffect(() => {
    return () => stopPitchDetection(); // Cleanup on unmount
  }, [stopPitchDetection]);

  // Stopwatch logic
  useEffect(() => {
    if (isStopwatchRunning && isClient) {
      stopwatchIntervalRef.current = setInterval(() => {
        setStopwatchTime((prev) => prev + 10);
      }, 10);
    } else {
      clearInterval(stopwatchIntervalRef.current);
    }
    return () => clearInterval(stopwatchIntervalRef.current);
  }, [isStopwatchRunning, isClient]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(2, "0")}`;
  };

  const handleRecordTime = () => {
    const time = formatTime(stopwatchTime);
    setRecordedTimes((prev) => [...prev, time]);
    toast({ title: "Tiempo Guardado", description: `Se ha registrado el tiempo: ${time}` });
  };

  if (!isClient) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
      <header className="text-center">
        <h1 className="text-3xl font-bold">Laboratorio de Voz</h1>
        <p className="text-muted-foreground">Herramientas de análisis acústico y vocal en tiempo real.</p>
      </header>

      {!hasMicPermission && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Se requiere acceso al micrófono</AlertTitle>
          <AlertDescription>
            Para usar las herramientas de análisis, debe permitir el acceso al micrófono.
            <Button onClick={startPitchDetection} variant="link" className="pl-2">
              Haga clic aquí para habilitar.
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Patient Information Form */}
      <PatientInfoForm />

      <div className="text-center p-4 rounded-lg border bg-card space-y-4" data-tour-id="laboratorio-main">
        {/* Current Pitch Display */}
        <div className="flex items-center justify-center gap-4">
          <p className="text-lg text-muted-foreground">Tono Actual:</p>
          <div className="flex items-center gap-2">
            <Mic className={cn("h-5 w-5", isListening ? "text-green-500" : "text-gray-400")} />
            <p className="text-4xl font-bold">
              {pitch.note}
              <span className="text-2xl text-muted-foreground">{pitch.octave > 0 ? pitch.octave : ""}</span>
            </p>
          </div>
          <Button onClick={isListening ? stopPitchDetection : startPitchDetection} variant={isListening ? "destructive" : "default"}>
            {isListening ? <MicOff className="mr-2 h-5 w-5" /> : <Mic className="mr-2 h-5 w-5" />}
            {isListening ? "Detener" : "Iniciar"}
          </Button>
        </div>

        {/* Pitch Visualizer (includes PitchDeviationMeter, Piano, PitchHistory) */}
        <PitchVisualizer pitch={pitch} pitchHistory={pitchHistory} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Métricas Vocales</CardTitle>
            <CardDescription>Análisis del rango y tono promedio de la muestra actual.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Tono Mínimo</p>
                <p className="text-2xl font-bold">{minPitch ? `${minPitch.note}${minPitch.octave}` : "-"}</p>
                <p className="text-xs text-muted-foreground">{minPitch ? `${minPitch.hz.toFixed(1)} Hz` : ""}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tono Máximo</p>
                <p className="text-2xl font-bold">{maxPitch ? `${maxPitch.note}${maxPitch.octave}` : "-"}</p>
                <p className="text-xs text-muted-foreground">{maxPitch ? `${maxPitch.hz.toFixed(1)} Hz` : ""}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tono Promedio (F0)</p>
                <p className="text-2xl font-bold">{avgPitch > 0 ? `${avgPitch.toFixed(1)} Hz` : "-"}</p>
                <p className="text-xs text-muted-foreground">
                  {avgPitch > 0 ? `${noteFromPitch(avgPitch).note}${noteFromPitch(avgPitch).octave}` : ""}
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={resetMetrics} variant="outline">
              <RotateCcw className="mr-2 h-4 w-4" /> Reiniciar Métricas
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Cronómetro</CardTitle>
            <CardDescription>Mida tiempos de fonación o espiración.</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="font-mono text-4xl">{isClient ? formatTime(stopwatchTime) : "00:00.00"}</p>
            <div className="flex justify-center gap-2">
              <Button onClick={() => setIsStopwatchRunning(!isStopwatchRunning)} variant="outline" size="icon">
                {isStopwatchRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button
                onClick={() => {
                  setIsStopwatchRunning(false);
                  setStopwatchTime(0);
                }}
                variant="outline"
                size="icon"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button onClick={handleRecordTime} variant="outline" size="icon">
                {/* Removed Save icon as it's not saving to a session */}
                Guardar Tiempo
              </Button>
            </div>
          </CardContent>
          {recordedTimes.length > 0 && (
            <CardFooter className="flex flex-col items-start gap-2 pt-4 border-t">
              <h4 className="font-medium text-sm">Tiempos Guardados:</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {recordedTimes.map((time, index) => (
                  <li key={index}>{time}</li>
                ))}
              </ul>
              <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => setRecordedTimes([])}>
                Limpiar
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}