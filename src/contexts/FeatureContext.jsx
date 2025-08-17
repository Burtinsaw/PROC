import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../utils/axios';

const FeatureContext = createContext({ loading: true, modules: {}, features: {}, issues: {} });

export function FeatureProvider({ children }) {
  const [state, setState] = useState({ loading: true, modules: {}, features: {}, issues: {} });
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const { data } = await api.get('/features');
        if (!mounted) return;
        setState({ loading: false, modules: data.modules || {}, features: data.features || {}, issues: data.issues || {} });
      } catch {
        if (!mounted) return;
        setState({ loading: false, modules: {}, features: {}, issues: {} });
      }
    };
    load();
    const t = setInterval(load, 15000);
    return () => { mounted = false; clearInterval(t); };
  }, []);
  return (
    <FeatureContext.Provider value={state}>
      {children}
    </FeatureContext.Provider>
  );
}

export function useFeatures(){
  return useContext(FeatureContext);
}
