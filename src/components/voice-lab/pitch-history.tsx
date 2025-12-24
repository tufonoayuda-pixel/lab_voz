"use client";

import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface PitchHistoryProps {
  history: { cents: number; noteIndex: number }[];
  minNoteIndex: number; // e.g., 36 (C2)
  maxNoteIndex: number; // e.g., 84 (C6)
  maxHistoryItems?: number;
}

const whiteKeyMidiOffsetsInOctave = [0, 2, 4, 5, 7, 9, 11]; // C, D, E, F, G, A, B

export const PitchHistory: React.FC<PitchHistoryProps> = ({
  history,
  minNoteIndex,
  maxNoteIndex,
  maxHistoryItems = 100, // Keep a reasonable number for performance and visual clarity
}) => {
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = 0; // Keep the newest items at the top
    }
  }, [history]);

  const totalNotesRange = maxNoteIndex - minNoteIndex + 1;
  const columnWidthPercentage = 100 / totalNotesRange;

  // Generate vertical grid lines for each note
  const gridLines = Array.from({ length: totalNotesRange }).map((_, i) => {
    const midiNote = minNoteIndex + i;
    const noteMidiOffsetInOctave = midiNote % 12;
    const isWhiteKey = whiteKeyMidiOffsetsInOctave.includes(noteMidiOffsetInOctave);

    return (
      <div
        key={`grid-line-${midiNote}`}
        className={cn(
          "absolute top-0 bottom-0 w-px",
          isWhiteKey ? "bg-gray-200 dark:bg-gray-700" : "bg-gray-300 dark:bg-gray-600" // Differentiate white/black key lines
        )}
        style={{ left: `${i * columnWidthPercentage}%` }}
      />
    );
  });

  return (
    <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-md mt-4 border border-gray-200 dark:border-gray-700 overflow-y-auto overflow-x-hidden">
      {/* Vertical grid lines */}
      {gridLines}

      <div ref={historyRef} className="absolute inset-0 flex flex-col-reverse">
        {history.slice(-maxHistoryItems).map((item, index) => {
          // Calculate horizontal position based on noteIndex (MIDI note)
          // Position the bar in the center of its corresponding note column
          const noteColumnIndex = item.noteIndex - minNoteIndex;
          const barLeftPosition = (noteColumnIndex * columnWidthPercentage) + (columnWidthPercentage / 2);

          // Determine color based on cents deviation
          let indicatorColor = "bg-red-500 dark:bg-red-400"; // Default for off-pitch
          if (item.noteIndex !== -1) {
            if (Math.abs(item.cents) <= 5) { // Within 5 cents, considered good
              indicatorColor = "bg-green-500 dark:bg-green-400";
            } else if (Math.abs(item.cents) <= 12) { // Within 12 cents, slightly off
              indicatorColor = "bg-yellow-500 dark:bg-yellow-400";
            }
          }

          return (
            <div
              key={index}
              className="relative w-full h-2 flex-shrink-0" // Each row is 2px high
            >
              {/* Pitch indicator bar */}
              {item.noteIndex !== -1 && ( // Only show if a valid note is detected
                <div
                  className={cn("absolute h-full w-px", indicatorColor)} // Vertical bar
                  style={{
                    left: `calc(${barLeftPosition}% - 0.5px)`, // Position horizontally, adjust for bar width
                    top: '0px', // Align to top of the 2px row
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};