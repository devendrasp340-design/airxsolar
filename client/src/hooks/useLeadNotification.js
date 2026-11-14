import { useState, useEffect, useCallback, useRef } from 'react';

export function useLeadNotification(enabled = true, interval = 10000) {
  const [leads, setLeads] = useState([]);
  const [newLeadCount, setNewLeadCount] = useState(0);
  const [hasNewLead, setHasNewLead] = useState(false);
  const prevCountRef = useRef(0);
  const initializedRef = useRef(false);

  const playNotificationSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;
      oscillator.start();
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      oscillator.stop(ctx.currentTime + 0.5);
      oscillator.onended = () => ctx.close().catch(() => {});
    } catch {
      // Audio not available
    }
  }, []);

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/leads', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        const leadsList = data.leads || data;
        setLeads(leadsList);

        const newCount = leadsList.filter((l) => l.status === 'New').length;
        setNewLeadCount(newCount);

        if (initializedRef.current && newCount > prevCountRef.current) {
          setHasNewLead(true);
          playNotificationSound();
          setTimeout(() => setHasNewLead(false), 5000);
        }
        initializedRef.current = true;
        prevCountRef.current = newCount;
      }
    } catch {
      // silent fail
    }
  }, [playNotificationSound]);

  useEffect(() => {
    if (!enabled) return;
    fetchLeads();
    const timer = setInterval(fetchLeads, interval);
    return () => clearInterval(timer);
  }, [enabled, interval, fetchLeads]);

  const dismissNotification = () => setHasNewLead(false);

  return { leads, newLeadCount, hasNewLead, dismissNotification, refetch: fetchLeads };
}

export default useLeadNotification;
