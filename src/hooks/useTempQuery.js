// Lightweight temporary query hook to mimic subset of @tanstack/react-query
// Fallback while react-query dependency is unavailable.
import { useEffect, useRef, useState, useCallback } from 'react';

const cache = new Map();

function getCacheEntry(key){
  const k = JSON.stringify(key);
  let entry = cache.get(k);
  if(!entry){ entry = { status:'idle', data:undefined, error:undefined, updatedAt:0, promise:null }; cache.set(k, entry); }
  return [entry, k];
}

export default function useTempQuery({ queryKey, queryFn, staleTime = 30_000, enabled = true }){
  const [, force] = useState(0);
  const mounted = useRef(true);
  useEffect(()=>()=>{ mounted.current=false; },[]);
  const [entry, cacheKey] = getCacheEntry(queryKey);

  const isStale = Date.now() - entry.updatedAt > staleTime;

  const exec = useCallback(()=>{
    if(!enabled) return;
    if(entry.promise) return entry.promise;
    entry.status='loading'; entry.error=undefined;
    const p = Promise.resolve().then(queryFn).then(data=>{
      entry.status='success'; entry.data=data; entry.updatedAt=Date.now(); entry.promise=null; if(mounted.current) force(x=>x+1); return data;
    }).catch(err=>{ entry.status='error'; entry.error=err; entry.promise=null; if(mounted.current) force(x=>x+1); throw err; });
    entry.promise=p; force(x=>x+1); return p;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, enabled]);

  useEffect(()=>{ if(enabled && (entry.status==='idle' || isStale)) exec(); }, [exec, enabled, isStale, entry.status]);

  return {
    data: entry.data,
    error: entry.error,
    isLoading: entry.status==='loading' || entry.status==='idle',
    isError: entry.status==='error',
    status: entry.status,
    refetch: exec,
    isStale
  };
}
