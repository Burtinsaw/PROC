import React, { useContext } from 'react';
import { ToggleButtonGroup, ToggleButton } from '@mui/material';
import ThemeContext from '../../contexts/ThemeContext';

// PresetToggle: classic / neo / aurora arasında seçim.
// Not: togglePreset döngüsel olduğundan direkt belirli preset'e geçmek için
// gerekli sayıda çağrı yapıyoruz. (Basit çözüm; ileride context'e setPreset eklenebilir.)
export default function PresetToggle(props){
  const { preset, togglePreset } = useContext(ThemeContext);
  const order = ['classic','neo','aurora'];

  const handle = (_, val) => {
    if(!val || val===preset) return;
    localStorage.setItem('designPreset', val);
    let current = preset;
    let safety = 0;
    while(current !== val && safety < 6){
      togglePreset();
      const idx = order.indexOf(current);
      current = order[(idx+1)%order.length];
      safety++;
    }
  };

  return (
    <ToggleButtonGroup size="small" value={preset} exclusive onChange={handle} {...props}>
      {order.map(p => <ToggleButton key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</ToggleButton>)}
    </ToggleButtonGroup>
  );
}
