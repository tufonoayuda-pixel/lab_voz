"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface PianoProps {
  activeNoteIndex: number;
}

const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const whiteKeyMidiOffsetsInOctave = [0, 2, 4, 5, 7, 9, 11]; // C, D, E, F, G, A, B
const blackKeyMidiOffsetsInOctave = [1, 3, 6, 8, 10]; // C#, D#, F#, G#, A#

const WHITE_KEY_WIDTH_PX = 32; // Reduced from 48
const BLACK_KEY_WIDTH_PX = 20; // Reduced from 28
const BLACK_KEY_HEIGHT_PX = 70; // Reduced from 100
const WHITE_KEY_HEIGHT_PX = 110; // Reduced from 160

// Relative left positions for black keys within an octave, based on white key widths
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

  // Determine the actual last white key MIDI note that will be rendered
  let actualLastWhiteKeyMidi: number | null = null;
  for (let midi = endMidiNote; midi >= startMidiNote; midi--) {
    const noteMidiOffsetInOctave = midi % 12;
    if (whiteKeyMidiOffsetsInOctave.includes(noteMidiOffsetInOctave)) {
      actualLastWhiteKeyMidi = midi;
      break;
    }
  }

  // First pass: Render white keys and calculate their positions
  for (let midi = startMidiNote; midi <= endMidiNote; midi++) {
    const noteMidiOffsetInOctave = midi % 12;
    const octave = Math.floor(midi / 12) - 1;
    const noteName = noteNames[noteMidiOffsetInOctave];
    const isWhiteKey = whiteKeyMidiOffsetsInOctave.includes(noteMidiOffsetInOctave);
    const isActive = activeNoteIndex === midi;

    if (isWhiteKey) {
      const isFirstWhiteKey = midi === startMidiNote;
      const isLastRenderedWhiteKey = midi === actualLastWhiteKeyMidi;

      whiteKeysToRender.push(
        <div
          key={midi}
          className={cn(
            "absolute top-0 border-r border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-100",
            "flex items-end justify-center pb-1 text-[0.6rem] font-medium text-gray-600 dark:text-gray-600", // Adjusted font size and padding
            isActive && "bg-blue-400 dark:bg-blue-400 text-blue-900 dark:text-blue-900",
            isFirstWhiteKey && "rounded-l-lg",
            isLastRenderedWhiteKey && "rounded-r-lg border-r-0"
          )}
          style={{ width: WHITE_KEY_WIDTH_PX + "px", left: currentWhiteKeyXOffset + "px", height: WHITE_KEY_HEIGHT_PX + "px", zIndex: 0 }}
        >
          {noteName === "C" && `C${octave}`}
        </div>
      );
      currentWhiteKeyXOffset += WHITE_KEY_WIDTH_PX;
    }
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
            "absolute top-0 bg-gray-900 dark:bg-gray-900 border border-gray-700 dark:border-gray-600 rounded-sm",
            isActive && "bg-blue-600 dark:bg-blue-600",
            "z-10" // Ensure black keys are on top
          )}
          style={{ width: BLACK_KEY_WIDTH_PX + "px", height: BLACK_KEY_HEIGHT_PX + "px", left: blackKeyLeft + "px" }}
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