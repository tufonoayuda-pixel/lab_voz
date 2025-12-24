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
      // Scroll to the top to show the latest pitches, giving a "falling" effect
      historyRef.current.scrollTop = 0; // Keep the newest items at the top
    }
  }, [history]);

  // Note index range for horizontal positioning
  const noteRange = maxNoteIndex - minNoteIndex;

  return (
    <div className="relative w-full h-48 bg-gray-50 dark:bg-gray-800 rounded-md mt-4 border border-gray-200 dark:border-gray-700 overflow-y-auto overflow-x-hidden">
      <div ref={historyRef} className="absolute inset-0 flex flex-col-reverse"> {/* flex-col-reverse to stack vertically, new items appear at the top */}
        {history.slice(-maxHistoryItems).map((item, index) => {
          // Calculate horizontal position based on noteIndex (MIDI note)
          // 0% is left, 100% is right
          const notePosition = ((item.noteIndex - minNoteIndex) / noteRange) * 100;
          const clampedNotePosition = Math.max(0, Math.min(100, notePosition));

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
              {/* Pitch indicator dot */}
              {item.noteIndex !== -1 && ( // Only show if a valid note is detected
                <div
                  className={cn("absolute h-2 w-2 rounded-full", indicatorColor)} // Small dot/circle
                  style={{
                    left: `calc(${clampedNotePosition}% - 4px)`, // Position horizontally based on note, adjust for dot width
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