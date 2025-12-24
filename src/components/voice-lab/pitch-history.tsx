"use client";

import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface PitchHistoryProps {
  history: { cents: number; noteIndex: number }[];
  minNoteIndex: number; // e.g., 48 (C3)
  maxNoteIndex: number; // e.g., 72 (C5)
  maxHistoryItems?: number;
}

export const PitchHistory: React.FC<PitchHistoryProps> = ({
  history,
  minNoteIndex,
  maxNoteIndex,
  maxHistoryItems = 100,
}) => {
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (historyRef.current) {
      // Scroll to the right to show the latest pitches
      historyRef.current.scrollLeft = historyRef.current.scrollWidth;
    }
  }, [history]);

  // Cents deviation range for horizontal positioning within a column
  const minCents = -50;
  const maxCents = 50;
  const centsRange = maxCents - minCents;

  // Note index range for vertical positioning
  const noteRange = maxNoteIndex - minNoteIndex;

  return (
    <div className="relative w-full h-48 bg-gray-50 dark:bg-gray-800 rounded-md mt-4 border border-gray-200 dark:border-gray-700 overflow-x-auto overflow-y-hidden">
      <div ref={historyRef} className="absolute inset-0 flex items-end pb-1">
        {history.slice(-maxHistoryItems).map((item, index) => {
          // Calculate vertical position based on noteIndex (MIDI note)
          // Invert the Y-axis so higher notes are higher on the display
          // 0% is bottom, 100% is top
          const notePosition = ((item.noteIndex - minNoteIndex) / noteRange) * 100;
          const clampedNotePosition = Math.max(0, Math.min(100, notePosition));

          // Calculate horizontal position within the column based on cents deviation
          // 0% is left, 100% is right
          const centsPosition = ((item.cents - minCents) / centsRange) * 100;
          const clampedCentsPosition = Math.max(0, Math.min(100, centsPosition));

          return (
            <div
              key={index}
              className="relative h-full w-4 flex-shrink-0 border-l border-gray-100 dark:border-gray-700" // Each column is 4px wide
            >
              {/* Pitch indicator bar */}
              {item.noteIndex !== -1 && ( // Only show if a valid note is detected
                <div
                  className="absolute w-1 bg-red-500 dark:bg-red-400"
                  style={{
                    bottom: `calc(${clampedNotePosition}% - 5px)`, // Position vertically based on note, adjust for bar height
                    left: `calc(${clampedCentsPosition}% - 2px)`, // Position horizontally based on cents, adjust for bar width
                    height: '10px', // Fixed height for the bar
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