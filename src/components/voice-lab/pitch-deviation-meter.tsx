"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface PitchDeviationMeterProps {
  cents: number; // Current deviation in cents
}

export const PitchDeviationMeter: React.FC<PitchDeviationMeterProps> = ({ cents }) => {
  // Visual range for the meter, typically a semitone (-50 to +50 cents)
  const minCents = -50;
  const maxCents = 50;
  const range = maxCents - minCents;

  // Clamp cents to the visual range for positioning the indicator
  const clampedCents = Math.max(minCents, Math.min(maxCents, cents));

  // Calculate position as a percentage from the left (0% at minCents, 100% at maxCents)
  const indicatorPosition = ((clampedCents - minCents) / range) * 100;

  const markers = [
    { value: -50, label: "b(flat)" },
    { value: -12, label: "-12¢" },
    { value: -5, label: "-5¢ (*)" },
    { value: 0, label: "0¢", className: "bg-green-500 dark:bg-green-400" }, // Center line
    { value: 5, label: "+5¢ (*)" },
    { value: 12, label: "+12¢ (**)" },
    { value: 50, label: "#(sharp)" },
  ];

  return (
    <div className="relative w-full h-12 bg-gray-50 dark:bg-gray-800 rounded-md mb-4 border border-gray-200 dark:border-gray-700">
      {/* Cents markers */}
      {markers.map((marker) => {
        const markerPos = ((marker.value - minCents) / range) * 100;
        if (markerPos < 0 || markerPos > 100) return null;

        return (
          <div
            key={marker.value}
            className={cn(
              "absolute top-0 bottom-0 w-px",
              marker.value === 0 ? "bg-green-500 dark:bg-green-400" : "bg-gray-300 dark:bg-gray-600",
              marker.className
            )}
            style={{ left: `${markerPos}%` }}
          >
            <span
              className={cn(
                "absolute -top-5 text-xs text-gray-600 dark:text-gray-300",
                marker.value === minCents ? "left-0" : marker.value === maxCents ? "right-0" : "left-1/2 -translate-x-1/2"
              )}
            >
              {marker.label}
            </span>
          </div>
        );
      })}

      {/* Current pitch indicator */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-red-500 dark:bg-red-400"
        style={{ left: `calc(${indicatorPosition}% - 2px)` }} // Adjust for indicator width
      />
    </div>
  );
};