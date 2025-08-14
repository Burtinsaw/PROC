// Aurora specific helper style utilities
// Reusable SX snippets to keep components lean

export const glassPanel = (mode='light', options={}) => {
  const { radius=16, blur=18, borderOpacity=0.08, gradient=true } = options;
  const dark = mode==='dark';
  return {
    position: 'relative',
    borderRadius: radius,
    backdropFilter: `blur(${blur}px)`,
    WebkitBackdropFilter: `blur(${blur}px)`,
    background: gradient
      ? (dark
          ? 'linear-gradient(165deg, rgba(17,24,39,0.72), rgba(17,24,39,0.55))'
          : 'linear-gradient(165deg, rgba(255,255,255,0.75), rgba(255,255,255,0.55))')
      : (dark? 'rgba(17,24,39,0.55)':'rgba(255,255,255,0.55)'),
    boxShadow: dark
      ? '0 8px 32px -8px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08)'
      : '0 6px 30px -6px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)',
    '&:before': {
      content:'""',
      position:'absolute',
      inset:0,
      borderRadius:'inherit',
      pointerEvents:'none',
      background: dark
        ? 'radial-gradient(circle at 85% 25%, rgba(168,85,247,0.18), transparent 65%)'
        : 'radial-gradient(circle at 85% 25%, rgba(99,102,241,0.18), transparent 65%)'
    },
    border: '1px solid',
    borderColor: dark? `rgba(255,255,255,${borderOpacity})` : `rgba(0,0,0,${borderOpacity})`
  };
};

export default { glassPanel };
