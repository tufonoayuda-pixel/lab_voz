"use client";

import React from "react";
import { Piano } from "./piano";
import { PitchDeviationMeter } from "./pitch-deviation-meter";
import { PitchHistory } from "./pitch-history";

interface PitchVisualizerProps {
  pitch: { hz: number; note: string; octave: number; noteIndex: number; cents: number };
  pitchHistory: { cents: number; noteIndex: number }[];
}

export const PitchVisualizer: React.FC<PitchVisualizerProps> = ({ pitch, pitchHistory }) => {
  const minPianoNoteIndex = 48; // C3
  const maxPianoNoteIndex = 72; // C5

  return (
    <div className="flex flex-col items-center w-full">
      {/* Pitch Deviation Meter */}
      <PitchDeviationMeter cents={pitch.cents} />

      {/* Piano */}
      <Piano activeNoteIndex={pitch.noteIndex} />

      {/* Pitch History */}
      <PitchHistory
        history={pitchHistory}
        minNoteIndex={minPianoNoteIndex}
        maxNoteIndex={maxPianoNoteIndex}
      />

      {/* Explanatory text for cents */}
      <div className="text-xs text-muted-foreground mt-4 text-left w-full max-w-md">
        <p>(*) ±5¢ se considera un intervalo apenas perceptible incluso por oídos entrenados.</p>
        <p>(**) ±12¢ es una diferencia comúnmente audible, perceptible por oídos no entrenados.</p>
      </div>
    </div>
  );
};