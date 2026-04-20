import React, { useState } from 'react';
import { AsciiOptions, DENSITY_MAPS, DENSITY_LABELS, COLOR_LABELS } from '../types';
import { playButtonSound } from '../utils/soundEffects';

interface ControlPanelProps {
  options: AsciiOptions;
  setOptions: React.Dispatch<React.SetStateAction<AsciiOptions>>;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ options, setOptions }) => {
  const [open, setOpen] = useState(true);

  const set = (key: keyof AsciiOptions, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const tap = (key: keyof AsciiOptions, value: any) => {
    playButtonSound();
    set(key, value);
  };

  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 30 }}>
      {/* Toggle button - centered */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={() => setOpen(v => !v)}
          style={{
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(34, 211, 238, 0.2)',
            borderBottom: 'none',
            borderRadius: '8px 8px 0 0',
            padding: '4px 22px',
            color: '#22d3ee',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            backdropFilter: 'blur(8px)',
          }}
        >
          {open ? '▼' : '▲'}
        </button>
      </div>

      {/* Panel */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.92)',
        backdropFilter: 'blur(8px)',
        borderTop: '1px solid rgba(34, 211, 238, 0.1)',
        padding: open ? '10px 20px' : '0 20px',
        maxHeight: open ? '200px' : '0',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '8px 18px' }}>
          {/* Size slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ fontSize: '11px', color: 'rgba(34, 211, 238, 0.55)', fontWeight: 500 }}>Size</span>
            <input type="range" min="4" max="24" value={options.fontSize}
              onChange={e => set('fontSize', Number(e.target.value))}
              style={{ width: '80px', accentColor: '#22d3ee' }} />
            <span style={{ fontSize: '11px', color: '#64748b', width: '20px', textAlign: 'right' }}>{options.fontSize}</span>
          </div>

          {/* Brightness slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ fontSize: '11px', color: 'rgba(34, 211, 238, 0.55)', fontWeight: 500 }}>Bright</span>
            <input type="range" min="0.2" max="3" step="0.05" value={options.brightness}
              onChange={e => set('brightness', Number(e.target.value))}
              style={{ width: '80px', accentColor: '#22d3ee' }} />
            <span style={{ fontSize: '11px', color: '#64748b', width: '24px', textAlign: 'right' }}>{options.brightness.toFixed(1)}</span>
          </div>

          {/* Contrast slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ fontSize: '11px', color: 'rgba(34, 211, 238, 0.55)', fontWeight: 500 }}>Contrast</span>
            <input type="range" min="0.2" max="3" step="0.05" value={options.contrast}
              onChange={e => set('contrast', Number(e.target.value))}
              style={{ width: '80px', accentColor: '#22d3ee' }} />
            <span style={{ fontSize: '11px', color: '#64748b', width: '24px', textAlign: 'right' }}>{options.contrast.toFixed(1)}</span>
          </div>

          {/* Divider */}
          <div style={{ width: '1px', height: '22px', background: 'rgba(34, 211, 238, 0.15)' }} />

          {/* Theme buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '11px', color: 'rgba(34, 211, 238, 0.55)', fontWeight: 500, marginRight: '2px' }}>Theme</span>
            {(['ice', 'ember', 'neon', 'color', 'bw'] as const).map(m => (
              <button key={m} onClick={() => tap('colorMode', m)} style={{
                padding: '3px 9px', borderRadius: '4px', fontSize: '11px', border: 'none', cursor: 'pointer',
                background: options.colorMode === m ? '#22d3ee' : '#1e293b',
                color: options.colorMode === m ? '#0f172a' : '#94a3b8',
                fontWeight: options.colorMode === m ? 'bold' : 'normal',
              }}>{COLOR_LABELS[m]}</button>
            ))}
          </div>

          {/* Divider */}
          <div style={{ width: '1px', height: '22px', background: 'rgba(34, 211, 238, 0.15)' }} />

          {/* Style buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '11px', color: 'rgba(34, 211, 238, 0.55)', fontWeight: 500, marginRight: '2px' }}>Style</span>
            {(Object.keys(DENSITY_MAPS) as Array<keyof typeof DENSITY_MAPS>).map(m => (
              <button key={m} onClick={() => tap('density', m)} style={{
                padding: '3px 9px', borderRadius: '4px', fontSize: '11px', border: 'none', cursor: 'pointer',
                background: options.density === m ? '#22d3ee' : '#1e293b',
                color: options.density === m ? '#0f172a' : '#94a3b8',
                fontWeight: options.density === m ? 'bold' : 'normal',
              }}>{DENSITY_LABELS[m]}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
