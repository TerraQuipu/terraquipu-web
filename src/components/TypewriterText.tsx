'use client';

import React, { useState, useEffect } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number; // milliseconds per character
  className?: string;
  onDone?: () => void;
}

export default function TypewriterText({
  text,
  speed = 16,
  className = '',
  onDone,
}: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState('');
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setIsDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      if (i <= text.length) {
        setDisplayed(text.slice(0, i));
      } else {
        setIsDone(true);
        clearInterval(interval);
        if (onDone) onDone();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  const handleSkip = () => {
    setDisplayed(text);
    setIsDone(true);
    if (onDone) onDone();
  };

  return (
    <span
      onClick={handleSkip}
      className={`cursor-pointer inline ${className}`}
      title="Toca para mostrar todo el texto de inmediato"
    >
      {displayed}
      {!isDone && (
        <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-emerald-600 animate-pulse align-middle rounded-xs" />
      )}
    </span>
  );
}
