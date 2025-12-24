"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface PianoProps {
  activeNoteIndex: number;
}

const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const whiteKeyMidiOffsetsInOctave = [0, 2, 4, 5, 7, 9, 11]; // C, D, E, F, G, A, B
const blackKeyMidiOffsetsInOctave = [1, 3, 6, 8, 10]; // C#, D#, F#, G#, A#

const WHITE_KEY_WIDTH_PX = 48; // Corresponds to w-12
const BLACK_KEY_WIDTH_PX = 28; // Corresponds to w-7
const BLACK_KEY_HEIGHT_PX = 100; // Corresponds to h-24 (approx)
const WHITE_KEY_HEIGHT_PX = 160; // Corresponds to h-40 (approx)

// Relative left positions for black keys within an octave, based on white key widths
// C# (1): after C (0)
// D# (3): after D (2)
// F# (6): after F (5)
// G# (8): after G (7)
// A# (10): after A (9)
const blackKeyRelativeXOffsets: { [key: number]: number } = {
  1: WHITE_KEY_WIDTH_PX - BLACK_KEY_WIDTH_PX / 2, // C#
  3: 2 * WHITE_KEY_WIDTH_PX - BLACK_KEY_WIDTH_PX / 2, // D#
  6: 4 * WHITE_KEY_WIDTH_PX - BLACK_KEY_WIDTH_PX / 2, // F#
  8: 5 * WHITE_KEY_WIDTH_PX - BLACK_KEY_WIDTH_PX / 2, // G#
  10: 6 * WHITE_KEY_WIDTH_PX - BLACK_KEY_WIDTH_PX / 2, // A#
};

export const Piano: React.FC<PianoProps> = ({ activeNoteIndex }) => {
  const startMidiNote = 36; // C2
  const endMidiNote = 84; // C6

  const whiteKeysToRender = [];
  const blackKeysToRender = [];
  let currentWhiteKeyXOffset = 0; // Tracks the total width of white keys rendered so far
  let lastWhiteKeyIndex = -1; // To identify the index of the very last white key in whiteKeysToRender array

  // First pass: Render white keys and calculate their positions
  for (let midi = startMidiNote; midi <= endMidiNote; midi++) {
    const noteMidiOffsetInOctave = midi % 12;
    const octave = Math.floor(midi / 12) - 1;
    const noteName = noteNames[noteMidiOffsetInOctave];
    const isWhiteKey = whiteKeyMidiOffsetsInOctave.includes(noteMidiOffsetInOctave);
    const isActive = activeNoteIndex === midi;

    if (isWhiteKey) {
      whiteKeysToRender.push(
        <div
          key={midi}
          className={cn(
            "absolute top-0 w-12 border-r border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-100",
            "flex items-end justify-center pb-2 text-xs font-medium text-gray-600 dark:text-gray-600",
            isActive && "bg-blue-400 dark:bg-blue-400 text-blue-900 dark:text-blue-900",
            midi === startMidiNote && "rounded-l-lg"
          )}
          style={{ left: currentWhiteKeyXOffset + "px", height: WHITE_KEY_HEIGHT_PX + "px", zIndex: 0 }}
        >
          {noteName === "C" && `C${octave}`}
        </div>
      );
      lastWhiteKeyIndex = whiteKeysToRender.length - 1; // Update index of the last white key
      currentWhiteKeyXOffset += WHITE_KEY_WIDTH_PX;
    }
  }

  // Apply rounded-r-lg and border-r-0 to the actual last white key
  if (lastWhiteKeyIndex !== -1) {
    const lastWhiteKeyElement = whiteKeysToRender[lastWhiteKeyIndex];
    lastWhiteKeyElement.props.className = cn(
      lastWhiteKeyElement.props.className,
      "rounded-r-lg border-r-0"
    );
  }

  // Second pass: Render black keys, positioned relative to the white keys
  let currentOctaveStartMidi = startMidiNote;

  for (let midi = startMidiNote; midi <= endMidiNote; midi++) {
    const noteMidiOffsetInOctave = midi % 12;
    const isBlackKey = blackKeyMidiOffsetsInOctave.includes(noteMidiOffsetInOctave);
    const isActive = activeNoteIndex === midi;

    if (noteMidiOffsetInOctave === 0 && midi !== startMidiNote) { // New octave starts (C note)
      currentOctaveStartMidi = midi;
    }

    if (isBlackKey) {
      const numFullOctavesBefore = Math.floor((currentOctaveStartMidi - startMidiNote) / 12);
      const baseOffset = numFullOctavesBefore * 7 * WHITE_KEY_WIDTH_PX; // 7 white keys per octave

      const blackKeyLeft = baseOffset + blackKeyRelativeXOffsets[noteMidiOffsetInOctave];

      blackKeysToRender.push(
        <div
          key={midi}
          className={cn(
            "absolute top-0 w-7 h-24 bg-gray-900 dark:bg-gray-900 border border-gray-700 dark:border-gray-600 rounded-sm",
            isActive && "bg-blue-600 dark:bg-blue-600",
            "z-10" // Ensure black keys are on top
          )}
          style={{ left: blackKeyLeft + "px", height: BLACK_KEY_HEIGHT_PX + "px" }}
        />
      );
    }
  }

  const totalPianoWidth = currentWhiteKeyXOffset;

  return (
    <div className="flex justify-center items-center overflow-x-auto py-2">
      <div
        className="relative border rounded-lg shadow-md bg-white dark:bg-gray-800"
        style={{ width: totalPianoWidth + "px", height: WHITE_KEY_HEIGHT_PX + "px" }}
      >
        {whiteKeysToRender}
        {blackKeysToRender}
      </div>
    </div>
  );
};