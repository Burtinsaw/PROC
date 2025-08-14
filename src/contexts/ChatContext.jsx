import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { getPresence } from '../api/messages';

const ChatContext = createContext(null);
export const useChat = () => useContext(ChatContext);

export function ChatProvider({ children, userId }){
  const socketRef = useRef(null);
  const [presence, setPresence] = useState({});

  useEffect(() => {
    if (!userId) return;
    const url = import.meta.env.VITE_APP_SOCKET_URL || (typeof window !== 'undefined' && (window.__API_ORIGIN || window.location.origin)) || '';
    const socket = io(url, { path: '/socket.io', transports: ['websocket'], auth: { userId } });
    socketRef.current = socket;
  const tick = async ()=>{ try { setPresence(await getPresence()); } catch { /* ignore */ } };
    tick();
    const t = setInterval(tick, 15000);
    socket.on('message:new', () => tick());
    return () => { clearInterval(t); socket.disconnect(); };
  }, [userId]);

  const value = useMemo(() => ({ socket: socketRef.current, presence }), [presence]);
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
