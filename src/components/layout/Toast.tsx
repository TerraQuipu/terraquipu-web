'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ToastProps {
  message: string | null;
  isVisible: boolean;
}

export default function Toast({ message, isVisible }: ToastProps) {
  if (!isVisible || !message) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-50 transform transition-all duration-200 ease-out flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-zinc-950 text-white border border-zinc-800 shadow-md max-w-md animate-in slide-in-from-bottom-3"
      role="alert"
    >
      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
      <p className="text-xs font-mono font-medium leading-tight">{message}</p>
    </div>
  );
}
