import React, { useState } from 'react';
import { AsciiCanvas } from './components/AsciiCanvas';
import { ControlPanel } from './components/ControlPanel';
import { AsciiOptions } from './types';

const App: React.FC = () => {
  const [options, setOptions] = useState<AsciiOptions>({
    fontSize: window.innerWidth < 640 ? 6 : 8,
    brightness: 1.2,
    contrast: 1.1,
    colorMode: 'ice',
    density: 'classic',
  });

  return (
    <div className="relative w-screen h-screen overflow-hidden"
         style={{ background: '#020617' }}>
      {/* Main Canvas */}
      <div className="absolute inset-0 z-10">
        <AsciiCanvas options={options} />
      </div>

      {/* Controls */}
      <ControlPanel options={options} setOptions={setOptions} />

      {/* Subtle vignette */}
      <div className="absolute inset-0 z-0 pointer-events-none"
           style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(2, 6, 23, 0.5) 100%)' }} />
    </div>
  );
};

export default App;
