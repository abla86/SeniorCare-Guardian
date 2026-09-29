/**
 * SeniorCare Guardian - Akustisk Lydgenerator (Web Audio API)
 * Genererer lovpålagte og tilgjengelighetstilpassede varsellyder offline:
 * 1. Nødvarslingslyd (to-toners pulserende sirene tilpasset aldershørsel)
 * 2. Batterivarsling (mild, oppmerksomhetsvekkende varseltone)
 * 3. Bekreftelsestone (beroligende, godkjent handling)
 */

let audioCtx: AudioContext | null = null;
let activeAlarmOscillators: { osc1: OscillatorNode; osc2: OscillatorNode; gainNode: GainNode; intervalId: number } | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Spiller en kraftig, vekslende to-toners nødvarslingslyd (sirene).
 * Frekvensene 960 Hz og 770 Hz er spesielt valgt for eldre fordi de skjærer 
 * gjennom bakgrunnsstøy uten å forårsake smertefull forvrengning.
 */
export function startEmergencyAlarmSiren(volume: number = 0.5): () => void {
  stopEmergencyAlarmSiren();

  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(960, now);

    // Fade-in for å unngå harde klikk
    gainNode.gain.setValueAtTime(0.01, now);
    gainNode.gain.exponentialRampToValueAtTime(Math.min(volume, 0.7), now + 0.1);

    // BiquadFilter for å dempe skarpe overtoner og gjøre lyden behageligere for høreapparater
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, now);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();

    // Vekslende sirenefrekvens: 960 Hz <-> 770 Hz hvert 400. millisekund
    let highTone = true;
    const intervalId = window.setInterval(() => {
      if (!audioCtx || audioCtx.state === 'closed') return;
      highTone = !highTone;
      const targetFreq = highTone ? 960 : 770;
      osc.frequency.cancelScheduledValues(ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(targetFreq, ctx.currentTime + 0.08);
    }, 400);

    activeAlarmOscillators = {
      osc1: osc,
      osc2: osc,
      gainNode,
      intervalId
    };

    return stopEmergencyAlarmSiren;
  } catch (err) {
    console.warn('Kunne ikke starte nødvarslingslyd:', err);
    return () => {};
  }
}

/**
 * Stopper pågående nødvarslingslyd med myk utfading.
 */
export function stopEmergencyAlarmSiren(): void {
  if (activeAlarmOscillators) {
    try {
      const { osc1, gainNode, intervalId } = activeAlarmOscillators;
      window.clearInterval(intervalId);
      if (audioCtx && audioCtx.state !== 'closed') {
        gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
        setTimeout(() => {
          try {
            osc1.stop();
            osc1.disconnect();
          } catch (e) {
            // Allerede stoppet
          }
        }, 120);
      }
    } catch (e) {
      console.warn('Feil ved stopp av nødvarslingslyd:', e);
    }
    activeAlarmOscillators = null;
  }
}

/**
 * Spiller en mild, 2-toners "pling-plong" for batterivarsel.
 * Trygg og ikke-skremmende for eldre (f.eks. 587 Hz D5 -> 440 Hz A4).
 */
export function playBatteryAlertSound(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Tone 1: 587 Hz (D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);

    gain1.gain.setValueAtTime(0.01, now);
    gain1.gain.exponentialRampToValueAtTime(0.3, now + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Tone 2: 440 Hz (A4)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(440.00, now + 0.38);

    gain2.gain.setValueAtTime(0.01, now + 0.38);
    gain2.gain.exponentialRampToValueAtTime(0.28, now + 0.43);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.38);
    osc2.stop(now + 0.85);
  } catch (err) {
    console.warn('Kunne ikke spille batterivarslingslyd:', err);
  }
}

/**
 * Spiller en beroligende C-dur bekreftelsestone (når alarm avbrytes eller "Jeg har det bra" trykkes).
 */
export function playReassuringChime(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5

    notes.forEach((freq, index) => {
      const startTime = now + index * 0.12;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.01, startTime);
      gain.gain.exponentialRampToValueAtTime(0.25, startTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.6);
    });
  } catch (err) {
    console.warn('Kunne ikke spille bekreftelsestone:', err);
  }
}
