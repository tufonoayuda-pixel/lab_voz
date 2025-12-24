"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface PianoProps {
  activeNoteIndex: number;
}

const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export const Piano: React.FC<PianoProps> = ({ activeNoteIndex }) => {
  const startIndex = 48; // C3
  const endIndex = 72; // C5

  const getNoteDisplay = (index: number) => {
    const note = noteNames[index % 12];
    const octave = Math.floor(index / 12) - 1;
    return `${note}${octave}`;
  };

  return (
    <div className="flex justify-center items-center overflow-x-auto py-2">
      <div className="flex border rounded-lg shadow-md bg-white dark:bg-gray-800">
        {Array.from({ length: endIndex - startIndex + 1 }).map((_, i) => {
          const noteIndex = startIndex + i;
          const noteName = noteNames[noteIndex % 12];
          const isSharp = noteName.includes("#");
          const isActive = activeNoteIndex === noteIndex;

          return (
            <div
              key={noteIndex}
              className={cn(
                "relative flex flex-col justify-end items-center",
                "h-24 w-8 sm:h-32 sm:w-10",
                "border-r border-gray-300 dark:border-gray-700",
                isSharp ? "bg-gray-900 text-white" : "bg-white text-gray-900",
                isActive && (isSharp ? "bg-blue-600" : "bg-blue-400"),
                i === 0 && "rounded-l-lg",
                i === endIndex - startIndex && "rounded-r-lg border-r-0",
              )}
            >
              <span
                className={cn(
                  "absolute bottom-2 text-xs font-medium",
                  isSharp ? "text-gray-300" : "text-gray-600",
                  isActive && (isSharp ? "text-white" : "text-blue-900"),
                )}
              >
                {getNoteDisplay(noteIndex)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};