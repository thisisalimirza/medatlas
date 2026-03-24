"use client";
import React, { useState } from "react";
import { HelpCircle } from "lucide-react";

interface TooltipProps {
  term: string;
  explanation: string;
  children?: React.ReactNode;
}

export default function Tooltip({ term, explanation, children }: TooltipProps) {
  const [show, setShow] = useState(false);

  return (
    <span className="relative inline-flex items-center gap-1">
      {children || <span className="font-medium">{term}</span>}
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        className="text-slate-400 hover:text-blue-500 transition-colors inline-flex"
        aria-label={`Learn about ${term}`}
      >
        <HelpCircle size={14} />
      </button>
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 bg-slate-800 text-white text-xs leading-relaxed rounded-lg shadow-xl z-50 pointer-events-none">
          <div className="font-semibold text-blue-300 mb-1">{term}</div>
          <div>{explanation}</div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
        </div>
      )}
    </span>
  );
}

// Inline label with tooltip
export function LabelWithTip({
  label,
  tip,
  className,
}: {
  label: string;
  tip: string;
  className?: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <span className={`relative inline-flex items-center gap-1 ${className || ""}`}>
      <span>{label}</span>
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        className="text-slate-400 hover:text-blue-500 transition-colors inline-flex shrink-0"
        aria-label={`Learn about ${label}`}
      >
        <HelpCircle size={13} />
      </button>
      {show && (
        <div className="absolute bottom-full left-0 mb-2 w-72 p-3 bg-slate-800 text-white text-xs leading-relaxed rounded-lg shadow-xl z-50 pointer-events-none">
          <div>{tip}</div>
          <div className="absolute top-full left-4 border-4 border-transparent border-t-slate-800" />
        </div>
      )}
    </span>
  );
}
