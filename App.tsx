import React, { useState } from 'react';
import { AsciiCanvas } from './components/AsciiCanvas';
import { ControlPanel } from './components/ControlPanel';
import { FloatingHearts } from './components/FloatingHearts';
import { AsciiOptions } from './types';

const App: React.FC = () => {
  const [options, setOptions] = useState<AsciiOptions>({
    fontSize: window.innerWidth < 640 ? 8 : 10,
    brightness: 1.0,
    contrast: 0.8,
    colorMode: 'sakura',
    density: 'classic',
    resolution: 0.2,
  });

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col" style={{ background: 'linear-gradient(135deg, #1a0a1a 0%, #0d0015 50%, #150a18 100%)' }}>
      {/* Floating decorative hearts in background */}
      <FloatingHearts />

      {/* Main Canvas */}
      <main className="flex-grow relative z-10">
        <AsciiCanvas options={options} />
      </main>

      {/* Controls */}
      <ControlPanel options={options} setOptions={setOptions} />

      {/* Subtle vignette overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none"
           style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(15, 0, 20, 0.4) 100%)' }} />
    </div>
  );
};

export default App;
