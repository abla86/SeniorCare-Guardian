import React from 'react';
import { 
  Heart, 
  Activity, 
  Wind, 
  Pill, 
  ShieldAlert, 
  Radio, 
  Clock, 
  Thermometer, 
  CheckCircle2, 
  AlertTriangle,
  User,
  BedDouble,
  Footprints
} from 'lucide-react';
import { HealthVitals, IndoorClimate, MedicationItem } from '../types';

interface HealthMonitorViewProps {
  vitals: HealthVitals;
  climate: IndoorClimate;
  medications: MedicationItem[];
  onTriggerSimulatedFall: () => void;
  onResetFallAlert: () => void;
}

export const HealthMonitorView: React.FC<HealthMonitorViewProps> = ({
  vitals,
  climate,
  medications,
  onTriggerSimulatedFall,
  onResetFallAlert
}) => {
  const untakenMeds = medications.filter(m => !m.taken);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 font-sans">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-600 mb-1">
              <Activity className="w-4 h-4" />
              <span>Velferdsteknologisk Helsetelemetri</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Helseovervåking & Sensorstatus
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-1">
              Sanntidsovervåking av beboer Kari Nordmann (83 år). Kamerafri sensorteknologi sikrer fullt personvern.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {vitals.fallDetected ? (
              <button
                id="btn-reset-fall"
                onClick={onResetFallAlert}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Nullstill fallalarm</span>
              </button>
            ) : (
              <button
                id="btn-sim-fall"
                onClick={onTriggerSimulatedFall}
                className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-all"
              >
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Simuler fallvarsel (Test)</span>
              </button>
            )}
          </div>
        </div>

        {/* Fall Alarm Banner if active */}
        {vitals.fallDetected && (
          <div className="mt-6 bg-rose-600 text-white p-5 rounded-2xl shadow-xl flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-4">
              <ShieldAlert className="w-10 h-10 text-rose-200" />
              <div>
                <h3 className="text-xl font-black">FALL DETEKTERT I STUEN!</h3>
                <p className="text-sm text-rose-100 mt-0.5">
                  mmWave radarsensor registrerte brått fall til gulvnivå og fravær av bevegelse i 30 sekunder.
                </p>
              </div>
            </div>
            <span className="bg-white text-rose-700 font-extrabold px-4 py-2 rounded-xl text-sm">
              Alarm utløst
            </span>
          </div>
        )}
      </div>

      {/* Vitals Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
        
        {/* Metric 1: Hjertefrekvens */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Puls (BLE Sensorklokke)</span>
            <Heart className="w-5 h-5 text-rose-500 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900">
              {vitals.heartRateBpm}
            </span>
            <span className="text-sm font-semibold text-slate-500">BPM</span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold text-slate-700">Normal hvilepuls (60-80)</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Oksygenmetning: <strong className="text-slate-800">{vitals.spo2Percent}% SpO2</strong>
          </p>
        </div>

        {/* Metric 2: mmWave Radarsensor & Fallvern */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Fall- og nærværsradar</span>
            <Radio className="w-5 h-5 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-slate-900">
              {vitals.fallDetected ? 'ALARM UTKALT' : 'Ingen fall'}
            </span>
          </div>
          <p className="text-xs font-medium text-slate-700 mt-2">
            Nåværende posisjon: <strong className="text-blue-700">{vitals.presenceRoom}</strong>
          </p>
          <div className="mt-2 text-xs text-slate-500">
            Radarteknologi: 60GHz mikrobølger uten kameraer (Fullt personvern)
          </div>
        </div>

        {/* Metric 3: Medisin & Dosettstatus */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Smart dosett</span>
            <Pill className="w-5 h-5 text-purple-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {untakenMeds.length === 0 ? 'Fullført i dag' : `${untakenMeds.length} gjenstår`}
            </span>
          </div>
          <p className="text-xs font-medium text-slate-700 mt-2">
            Neste dose: <strong className="text-slate-900">{untakenMeds[0]?.time || 'I morgen 08:30'}</strong>
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Optisk sensor bekrefter uttak fra kammer 1 og 2
          </p>
        </div>

        {/* Metric 4: Aktivitet & Nattvandring */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Bevegelse & Søvn</span>
            <Footprints className="w-5 h-5 text-teal-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900">
              {vitals.lastMovementMinutesAgo}
            </span>
            <span className="text-xs font-semibold text-slate-500">min siden siste bevegelse</span>
          </div>
          <p className="text-xs font-medium text-slate-700 mt-2">
            Skritt i dag: <strong>{vitals.stepsToday}</strong> | Søvn: <strong>{vitals.sleepHours}t</strong>
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Nattvakt: Ingen unormal nattvandring registrert
          </p>
        </div>
      </div>

      {/* Detailed Sensor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Dosett Detaljer */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-extrabold text-slate-900 mb-4 flex items-center gap-2">
            <Pill className="w-5 h-5 text-purple-600" />
            <span>Medisinovervåking (Smart Dosettkammer)</span>
          </h3>
          <div className="space-y-3">
            {medications.map((med) => (
              <div 
                key={med.id}
                className={`p-4 rounded-2xl border flex items-center justify-between ${
                  med.taken ? 'bg-emerald-50/60 border-emerald-200' : 'bg-amber-50/60 border-amber-200'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-800">
                      Kl. {med.time}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{med.name}</h4>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{med.dosage}</p>
                </div>
                <div>
                  {med.taken ? (
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Registrert inntatt</span>
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>Venter på tidspunkt</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Inneklima & Miljøpåvirkning */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-extrabold text-slate-900 mb-4 flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-emerald-600" />
            <span>Romklima & Omgivelsessensorer</span>
          </h3>
          
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <span className="text-xs text-slate-500 font-semibold block">Temperatur</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{climate.temp} °C</span>
              <span className="text-[11px] text-emerald-600 font-medium">Optimalt (21-23°)</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <span className="text-xs text-slate-500 font-semibold block">Luftfuktighet</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{climate.humidity} %</span>
              <span className="text-[11px] text-emerald-600 font-medium">Behagelig</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <span className="text-xs text-slate-500 font-semibold block">CO2 Nivå</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{climate.co2} ppm</span>
              <span className="text-[11px] text-emerald-600 font-medium">Frisk inneluft</span>
            </div>
          </div>

          <div className="bg-teal-50 border border-teal-200 p-4 rounded-2xl text-teal-950 text-xs sm:text-sm">
            <h4 className="font-bold text-teal-900 mb-1">Hvorfor inneklima er kritisk for eldreomsorg:</h4>
            <p className="text-teal-800">
              Høyt CO2-nivå (&gt;1000 ppm) og overoppheting forårsaker forvirring, dehydrering og økt fallrisiko hos eldre. Systemet varsler automatisk pårørende ved fare for hypotermi eller hetebølge.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
