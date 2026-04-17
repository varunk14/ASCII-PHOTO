import React, { useEffect, useState } from 'react';

interface Heart {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  emoji: string;
}

const EMOJIS = ['♡', '♥', '✧', '⋆', '｡', '˚', '✿', '❀', '♪'];

export const FloatingHearts: React.FC = () => {
  const [hearts, setHearts] = useState<Heart[]>([]);

  useEffect(() => {
    const initial: Heart[] = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: 10 + Math.random() * 18,
      duration: 8 + Math.random() * 12,
      delay: Math.random() * 10,
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
    }));
    setHearts(initial);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute opacity-20"
          style={{
            left: `${heart.x}%`,
            bottom: '-30px',
            fontSize: `${heart.size}px`,
            color: heart.id % 3 === 0 ? '#f9a8d4' : heart.id % 3 === 1 ? '#d8b4fe' : '#fda4af',
            animation: `floatUp ${heart.duration}s linear ${heart.delay}s infinite`,
          }}
        >
          {heart.emoji}
        </div>
      ))}
      <style>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.2;
          }
          90% {
            opacity: 0.15;
          }
          100% {
            transform: translateY(-110vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
