export type SavedSession = {
  id: string;
  date: string;
  time: string;
  minPitch: { hz: number; note: string; octave: number } | null;
  maxPitch: { hz: number; note: string; octave: number } | null;
  avgPitch: number;
  recordedTimes: string[];
};