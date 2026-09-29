import React, { useState, useEffect, useRef } from 'react';
import { 
  AlertTriangle, 
  XCircle, 
  CheckCircle2, 
  PhoneCall, 
  Volume2, 
  VolumeX, 
  Radio, 
  ShieldAlert,
  WifiOff,
  RefreshCw
} from 'lucide-react';

export interface TrygghetsalarmProps {
  /** Callback når nedtellingen fullføres og alarmen avfyres */
  onAlarmTriggered?: (alarmData: { timestamp: string; triggeredBy: string; offlineQueued: boolean }) => void;
  /** Callback når brukeren avbryter i løpet av 5-sekunders angrefrist */
  onAlarmCancelled?: (reason: string) => void;
  /** Brukernavn for personalisering og opplesing */
  userName?: string;
  /** Simuler nettverkssvikt for å vise offline-first lokal kø */
  simulateOffline?: boolean;
}

export const Trygghetsalarm: React.FC<TrygghetsalarmProps> = ({
  onAlarmTriggered,
  onAlarmCancelled,
  userName = 'Kari',
  simulateOffline = false
}) => {
  // Tilstandsmaskin: 'idle' | 'countdown' | 'triggered' | 'cancelled'
  const [alarmState, setAlarmState] = useState<'idle' | 'countdown' | 'triggered' | 'cancelled'>('idle');
  const [countdown, setCountdown] = useState<number>(5);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [offlineQueue, setOfflineQueue] = useState<Array<{ id: string; time: string }>>([]);

  const timerRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialiser Web Audio API for pulserende akustisk varsel (fungerer offline uten eksterne lydfiler)
  const playBeep = (freq = 880, duration = 0.15) => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('Web Audio API ikke tilgjengelig', e);
    }
  };

  // Talesyntese (tekst-til-tale) for svaksynte og kognitiv støtte (WCAG AAA)
  const speakText = (text: string) => {
    if (!soundEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'no-NO';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  // Start alarmsekvens med 5 sekunders angrefrist
  const handleStartAlarm = () => {
    setAlarmState('countdown');
    setCountdown(5);
    playBeep(880, 0.2);
    speakText('Nødalarm er aktivert. Varsler vaktsentral om fem sekunder. Trykk på den store grønne knappen for å avbryte.');

    let currentSec = 5;
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = window.setInterval(() => {
      currentSec -= 1;
      setCountdown(currentSec);

      if (currentSec > 0) {
        // Høyere frekvens for hvert sekund som går (progressiv akustisk indikator)
        playBeep(880 + (5 - currentSec) * 120, 0.15);
      } else {
        if (timerRef.current) clearInterval(timerRef.current);
        handleTriggerFinalAlarm();
      }
    }, 1000);
  };

  // Avbryt alarmen (Angrefrist)
  const handleCancelAlarm = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setAlarmState('cancelled');
    playBeep(440, 0.25);
    speakText('Alarmen er avbrutt. Ingen nødetater er varslet.');
    if (onAlarmCancelled) {
      onAlarmCancelled('Bruker trykket avbryt innen 5-sekunders angrefrist');
    }

    // Gå tilbake til utgangspunktet etter 3 sekunder
    setTimeout(() => {
      setAlarmState('idle');
    }, 3200);
  };

  // Endelig avfyring etter fullført nedtelling
  const handleTriggerFinalAlarm = () => {
    setAlarmState('triggered');
    playBeep(1200, 0.5);
    speakText('Nødalarm er sendt til kommunens vaktsentral og pårørende.');

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    if (simulateOffline) {
      // Offline-first: legg til i lokal WAL-buffer for umiddelbar gjenopptagelse
      setOfflineQueue(prev => [{ id: `alarm-${Date.now()}`, time: timeStr }, ...prev]);
    }

    if (onAlarmTriggered) {
      onAlarmTriggered({
        timestamp: timeStr,
        triggeredBy: userName,
        offlineQueued: simulateOffline
      });
    }
  };

  // Rydd opp timer ved unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // SVG Sirkel-parametere for 5-sekunders visuell ring
  const circleRadius = 78;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (countdown / 5) * circumference;

  return (
    <div 
      id="trygghetsalarm-container"
      className="w-full max-w-xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border-4 border-slate-200 shadow-2xl transition-all"
    >
      {/* Topplinje med tilgjengelighetsvalg & driftsstatus */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-rose-600" />
          <span className="font-extrabold text-slate-900 text-lg">
            Trygghetsalarm (Kiosk WCAG AAA)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {simulateOffline ? (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold border border-amber-300">
              <WifiOff className="w-3.5 h-3.5" />
              Lokal kø (Offline)
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full text-xs font-bold border border-emerald-300">
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-600" />
              Tilkoblet VKP
            </span>
          )}

          <button
            id="btn-toggle-alarm-sound"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            title={soundEnabled ? 'Lydvarsel og opplesing PÅ' : 'Lydvarsel AV'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 text-indigo-600" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TILSTAND 1: KLAR TIL BRUK (IDLE)                         */}
      {/* ========================================================= */}
      {alarmState === 'idle' && (
        <div className="text-center">
          <p className="text-lg sm:text-xl text-slate-700 mb-6 font-medium leading-relaxed">
            Trykk på den røde knappen hvis du har falt, er akutt syk eller trenger hjelp fra vaktsentralen.
          </p>

          {/* WCAG AAA Primærknapp: Minst 140x140px, massiv berøringsflate */}
          <button
            id="btn-trigger-main-alarm"
            onClick={handleStartAlarm}
            className="w-full sm:w-80 h-36 mx-auto bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-2xl sm:text-3xl rounded-3xl shadow-2xl border-4 border-rose-300 ring-8 ring-rose-100 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer"
            aria-label="Utløs trygghetsalarm med fem sekunders nedtelling"
          >
            <AlertTriangle className="w-12 h-12 text-white animate-pulse" />
            <span>NØDHJELP</span>
            <span className="text-xs font-bold uppercase tracking-widest text-rose-100 bg-rose-800/60 px-3 py-0.5 rounded-full">
              5 sek angrefrist
            </span>
          </button>

          <p className="text-xs text-slate-500 mt-6 flex items-center justify-center gap-2">
            <span>✓ Ingen fare for feiltrykk: Du har alltid 5 sekunder på å avbryte.</span>
          </p>
        </div>
      )}

      {/* ========================================================= */}
      {/* TILSTAND 2: VISUELL NEDTELLING (5 SEKUNDER ANGREFRIST)   */}
      {/* ========================================================= */}
      {alarmState === 'countdown' && (
        <div className="text-center py-2">
          <div className="relative w-44 h-44 mx-auto mb-4 flex items-center justify-center">
            {/* SVG sirkulær fremdriftsindikator */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 180 180">
              <circle
                cx="90"
                cy="90"
                r={circleRadius}
                className="stroke-slate-200"
                strokeWidth="14"
                fill="transparent"
              />
              <circle
                cx="90"
                cy="90"
                r={circleRadius}
                className="stroke-rose-600 transition-all duration-1000 ease-linear"
                strokeWidth="14"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Nedtellingssiffer i senter */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-6xl font-black text-rose-600 font-mono tracking-tighter">
                {countdown}
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-rose-800">
                sekunder
              </span>
            </div>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
            Varsler vaktsentralen...
          </h3>
          <p className="text-base sm:text-lg text-slate-600 mb-6">
            Var dette et uhell? Trykk på den store grønne knappen under for å avbryte.
          </p>

          {/* WCAG AAA Avbryt-knapp (Angreknapp): 84px høy, gigantisk touch-target */}
          <button
            id="btn-cancel-alarm-countdown"
            onClick={handleCancelAlarm}
            className="w-full h-24 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-2xl sm:text-3xl rounded-3xl shadow-2xl border-4 border-emerald-300 ring-8 ring-emerald-100 flex items-center justify-center gap-4 transition-all cursor-pointer"
            aria-label="Avbryt alarm, det var et uhell"
          >
            <XCircle className="w-10 h-10 text-emerald-200 shrink-0" />
            <span>AVBRYT ALARM</span>
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* TILSTAND 3: ALARM SENDT / UTKOBLET                     */}
      {/* ========================================================= */}
      {alarmState === 'triggered' && (
        <div className="text-center py-4 bg-rose-50 rounded-3xl p-6 border-2 border-rose-300">
          <div className="w-20 h-20 bg-rose-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce shadow-lg">
            <PhoneCall className="w-10 h-10" />
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-rose-950 mb-2">
            Alarm er sendt!
          </h3>
          <p className="text-lg text-slate-800 mb-6 leading-relaxed">
            Vaktsentralen og dine pårørende har mottatt varsel med prioritet 1. 
            Høyttaleren i rommet kobles opp nå.
          </p>

          {simulateOffline && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-100 border border-amber-300 text-amber-950 text-sm font-bold flex items-center gap-3 text-left">
              <WifiOff className="w-6 h-6 text-amber-800 shrink-0" />
              <div>
                <p>Offline redundans aktiv:</p>
                <p className="font-normal text-xs text-amber-900 mt-0.5">
                  Alarmen er lagret i lokal SQLite WAL-kø på enheten og overføres via GSM/SMS-fallback.
                </p>
              </div>
            </div>
          )}

          <button
            id="btn-reset-alarm"
            onClick={() => setAlarmState('idle')}
            className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg rounded-2xl shadow-md transition-colors"
          >
            Tilbake til hvilemodus
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* TILSTAND 4: AVBRUTT (BEKREFTET ANGRE)                   */}
      {/* ========================================================= */}
      {alarmState === 'cancelled' && (
        <div className="text-center py-6 bg-emerald-50 rounded-3xl p-6 border-2 border-emerald-300">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-black text-emerald-950 mb-1">
            Alarmen ble avbrutt
          </h3>
          <p className="text-base text-slate-700">
            Ingen melding ble sendt. Du er trygg, og systemet er i normal drift.
          </p>
        </div>
      )}

      {/* Offline Queue log indicator */}
      {offlineQueue.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-600 flex items-center justify-between">
          <span className="font-semibold">Lokalt bufrede hendelser: {offlineQueue.length}</span>
          <button 
            onClick={() => setOfflineQueue([])} 
            className="text-indigo-600 font-bold hover:underline flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            Tøm kø
          </button>
        </div>
      )}
    </div>
  );
};
