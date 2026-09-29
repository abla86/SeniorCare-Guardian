import React, { useState } from 'react';
import { 
  HardDrive, 
  AlertOctagon, 
  CheckCircle, 
  RefreshCw, 
  Sliders, 
  Zap, 
  Cpu, 
  TrendingUp, 
  Flame, 
  ShieldAlert, 
  Info,
  Server,
  Activity,
  Layers
} from 'lucide-react';
import { StorageMetrics } from '../types';

interface StorageDiagnosticsProps {
  metrics: StorageMetrics;
  onToggleMedium: (medium: 'microSD' | 'nvmeSSD') => void;
  onToggleLog2Ram: () => void;
  onToggleWalMode: () => void;
  onRunSmartTest: () => void;
  isScanning: boolean;
}

export const StorageDiagnostics: React.FC<StorageDiagnosticsProps> = ({
  metrics,
  onToggleMedium,
  onToggleLog2Ram,
  onToggleWalMode,
  onRunSmartTest,
  isScanning
}) => {
  const isSD = metrics.medium === 'microSD';
  const [activeTab, setActiveTab] = useState<'overview' | 'smart_registers' | 'mitigations'>('overview');

  // Calculate health color
  const getHealthColor = (pct: number) => {
    if (pct > 70) return 'text-emerald-600 bg-emerald-50 border-emerald-300';
    if (pct > 30) return 'text-amber-600 bg-amber-50 border-amber-300';
    return 'text-rose-600 bg-rose-50 border-rose-300';
  };

  const getProgressColor = (pct: number) => {
    if (pct > 70) return 'bg-emerald-500';
    if (pct > 30) return 'bg-amber-500';
    return 'bg-rose-500 animate-pulse';
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 font-sans">
      {/* Top Banner & Medium Selector */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              <Server className="w-4 h-4 text-blue-600" />
              <span>Maskinvarestabilitet & Lagringsslitasje</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Lagringsovervåking & Diskhelse
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-1 max-w-2xl">
              IOT- og velferdsteknologi på kant-enheter (f.eks. Raspberry Pi eller Home Assistant-bokser) feiler hyppigst på grunn av slitte MicroSD-kort som låser seg i skrivebeskyttet modus.
            </p>
          </div>

          {/* Medium Toggle */}
          <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center shrink-0 border border-slate-200">
            <button
              id="btn-select-microsd"
              onClick={() => onToggleMedium('microSD')}
              className={`px-5 py-3 rounded-xl font-bold text-sm sm:text-base flex items-center gap-2 transition-all ${
                isSD 
                  ? 'bg-rose-600 text-white shadow-md' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <AlertOctagon className="w-4 h-4" />
              <span>Standard MicroSD (Ustabil)</span>
            </button>
            <button
              id="btn-select-nvme"
              onClick={() => onToggleMedium('nvmeSSD')}
              className={`px-5 py-3 rounded-xl font-bold text-sm sm:text-base flex items-center gap-2 transition-all ${
                !isSD 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HardDrive className="w-4 h-4" />
              <span>Industriell NVMe SSD (Anbefalt)</span>
            </button>
          </div>
        </div>

        {/* Status Alert if MicroSD is active */}
        {isSD ? (
          <div className="mt-6 bg-rose-50 border-l-4 border-rose-600 p-4 sm:p-5 rounded-r-2xl text-rose-950 flex items-start gap-4">
            <AlertOctagon className="w-7 h-7 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-base sm:text-lg text-rose-900">
                Kritisk risiko: SD-kort har kun {metrics.wearLevelingPercentage}% levetid igjen ({metrics.estimatedRemainingDays} dager før svikt)
              </h4>
              <p className="text-sm sm:text-base text-rose-800 mt-1">
                Forbruker-SD-kort mangler avansert slitasjeutjevning (wear leveling controller) og tåler ikke kontinuerlig logging fra sensorer. Ved svikt remounter Linux-kjernen filsystemet som <strong>read-only</strong>, noe som fører til at trygghetsalarmer og helsedata slutter å lagres uten at brukeren merker det!
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-6 bg-emerald-50 border-l-4 border-emerald-600 p-4 sm:p-5 rounded-r-2xl text-emerald-950 flex items-start gap-4">
            <CheckCircle className="w-7 h-7 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-base sm:text-lg text-emerald-900">
                Optimal maskinvarestabilitet: Industriell NVMe SSD aktiv
              </h4>
              <p className="text-sm sm:text-base text-emerald-800 mt-1">
                Enheten har maskinvarebasert wear-leveling, strømbruddsbeskyttelse (PLP) og en beregnet levetid på over {Math.round(metrics.estimatedRemainingDays / 365)} år ved nåværende skrivemønster.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Metrics Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
        
        {/* Metric 1: Wear Leveling / Health */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Slitasjehelse</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900">
              {metrics.wearLevelingPercentage}%
            </span>
            <span className="text-xs font-semibold text-slate-500">gjenværende</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 mt-3 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${getProgressColor(metrics.wearLevelingPercentage)}`}
              style={{ width: `${metrics.wearLevelingPercentage}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {isSD ? 'Basert på eMMC/SD ext_csd register' : 'S.M.A.R.T. ID 233 (Media Wearout)'}
          </p>
        </div>

        {/* Metric 2: TBW Skrevet vs Kapasitet */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Skrevet data (TBW)</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900">
              {metrics.tbwWritten.toFixed(1)}
            </span>
            <span className="text-sm font-semibold text-slate-500">
              / {metrics.tbwRating} TBW
            </span>
          </div>
          <p className="text-xs font-medium text-slate-600 mt-3 flex items-center gap-1">
            <span>Daglig rate:</span>
            <strong className="text-slate-900">{metrics.avgDailyWritesMB} MB/døgn</strong>
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {metrics.log2ramEnabled ? '📉 85% redusert med log2ram' : '⚠️ Ufiltrert skriving rett til flash'}
          </p>
        </div>

        {/* Metric 3: Bad Blocks & Feilsektorer */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Dårlige blokker</span>
            <ShieldAlert className={`w-4 h-4 ${metrics.badBlocksCount > 0 ? 'text-rose-500' : 'text-emerald-500'}`} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl sm:text-4xl font-black ${metrics.badBlocksCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {metrics.badBlocksCount}
            </span>
            <span className="text-xs font-semibold text-slate-500">reallokerte</span>
          </div>
          <p className="text-xs font-medium text-slate-600 mt-3">
            Read-only låserisiko: <strong className={`font-bold ${metrics.readOnlyRisk === 'low' ? 'text-emerald-700' : 'text-rose-700'}`}>{metrics.readOnlyRisk.toUpperCase()}</strong>
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Filsystem: <span className="font-semibold">{metrics.filesystemStatus}</span>
          </p>
        </div>

        {/* Metric 4: I/O Skrivehastighet & I/O Wait */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Sanntids I/O Wait</span>
            <Cpu className="w-4 h-4 text-purple-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl sm:text-4xl font-black ${metrics.ioWaitPercent > 5 ? 'text-rose-600' : 'text-slate-900'}`}>
              {metrics.ioWaitPercent.toFixed(1)}%
            </span>
            <span className="text-xs font-semibold text-slate-500">CPU iowait</span>
          </div>
          <p className="text-xs font-medium text-slate-600 mt-3">
            Gjeldende I/O: <strong className="text-slate-900">{metrics.writeRateKBps} KB/s</strong>
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Temp: <span className="font-semibold">{metrics.tempCelsius}°C</span> (Termisk status OK)
          </p>
        </div>
      </div>

      {/* Tabs for Details */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4 mb-6">
          <button
            id="tab-overview"
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-bold text-sm sm:text-base rounded-xl transition-all ${
              activeTab === 'overview' 
                ? 'bg-slate-900 text-white' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sammenligning & Programvarevern
          </button>
          <button
            id="tab-smart-registers"
            onClick={() => setActiveTab('smart_registers')}
            className={`px-4 py-2 font-bold text-sm sm:text-base rounded-xl transition-all ${
              activeTab === 'smart_registers' 
                ? 'bg-slate-900 text-white' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            S.M.A.R.T. & Linux Kernel Telemetri
          </button>
        </div>

        {activeTab === 'overview' ? (
          <div>
            {/* Mitigation Toggles */}
            <div className="mb-8">
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-2">
                Programvaretiltak for å forlenge levetid på flashminne
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                Dersom en installasjon må kjøre på eksisterende SD-kort eller eMMC, må disse tiltakene aktiveres for å hindre havari innen 6–12 måneder:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Toggle 1: log2ram */}
                <div className="p-5 rounded-2xl border-2 border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-amber-500" />
                      <h4 className="font-bold text-base text-slate-900">
                        log2ram / ZRAM Loggbuffer
                      </h4>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">
                      Lagrer <code>/var/log</code> i RAM og skriver synkront kun 1 gang i døgnet eller ved kontrollert avslag. Reduserer flash-slitasje med 70–85%.
                    </p>
                    <span className={`inline-block mt-2 text-xs font-bold px-2.5 py-1 rounded-full ${metrics.log2ramEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                      {metrics.log2ramEnabled ? 'Aktiv (Beskytter lagringsmediet)' : 'Deaktivert (Fare for logging-flom)'}
                    </span>
                  </div>

                  <button
                    id="btn-toggle-log2ram"
                    onClick={onToggleLog2Ram}
                    className={`px-4 py-2 rounded-xl text-sm font-bold shrink-0 transition-all ${
                      metrics.log2ramEnabled 
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                        : 'bg-slate-800 text-white hover:bg-slate-900'
                    }`}
                  >
                    {metrics.log2ramEnabled ? 'Skru av' : 'Aktiver log2ram'}
                  </button>
                </div>

                {/* Toggle 2: SQLite WAL Mode */}
                <div className="p-5 rounded-2xl border-2 border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Layers className="w-5 h-5 text-blue-500" />
                      <h4 className="font-bold text-base text-slate-900">
                        SQLite WAL Mode (Write-Ahead Logging)
                      </h4>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">
                      Hindrer at databasen gjør tilfeldige 4KB-skrivinger for hver sensoravlesning. Gjør sekvensielle append-skrivinger som er skånsomme for flash-blokker.
                    </p>
                    <span className={`inline-block mt-2 text-xs font-bold px-2.5 py-1 rounded-full ${metrics.walModeEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                      {metrics.walModeEnabled ? 'PRAGMA journal_mode=WAL aktiv' : 'Rollback journal (Høy slitasje)'}
                    </span>
                  </div>

                  <button
                    id="btn-toggle-wal"
                    onClick={onToggleWalMode}
                    className={`px-4 py-2 rounded-xl text-sm font-bold shrink-0 transition-all ${
                      metrics.walModeEnabled 
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                        : 'bg-slate-800 text-white hover:bg-slate-900'
                    }`}
                  >
                    {metrics.walModeEnabled ? 'Skru av' : 'Aktiver WAL'}
                  </button>
                </div>
              </div>
            </div>

            {/* Comparison Matrix Table */}
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-3">
                Teknisk sammenligning: MicroSD vs Industriell NVMe SSD
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold">
                      <th className="p-3">Egenskap</th>
                      <th className="p-3 text-rose-800">Forbruker MicroSD (Klasse 10)</th>
                      <th className="p-3 text-emerald-800">Industriell NVMe / SATA SSD</th>
                      <th className="p-3">Betydning for Velferdsteknologi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">Levetid (TBW)</td>
                      <td className="p-3 text-rose-600 font-medium">15 – 30 TBW</td>
                      <td className="p-3 text-emerald-600 font-medium">150 – 600+ TBW</td>
                      <td className="p-3">SSD varer 10–20 ganger lenger ved døgnkontinuerlig sensorlogging.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">Wear Leveling Controller</td>
                      <td className="p-3 text-rose-600">Enkel / Fraværende</td>
                      <td className="p-3 text-emerald-600">Avansert dynamisk & statisk</td>
                      <td className="p-3">SD brenner ut de samme minneblokkene der systemlogger lagres.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">Feilmodus ved havari</td>
                      <td className="p-3 text-rose-600 font-medium">Låser seg i Read-Only uten forvarsel</td>
                      <td className="p-3 text-emerald-600 font-medium">SMART varsler i god tid før feil</td>
                      <td className="p-3">SD-kollaps fører til stum svikt i alarmmottak og fallvarsling.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">Ytelse under databaselaster</td>
                      <td className="p-3 text-rose-600">Høy I/O wait (5–20% CPU frosset)</td>
                      <td className="p-3 text-emerald-600">Ubetydelig I/O wait (&lt; 0.5%)</td>
                      <td className="p-3">Seniormodus forblir responsiv uten forsinkelse i berøringsknapper.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">Kostnad per installasjon</td>
                      <td className="p-3">~150 kr (Lav anskaffelse)</td>
                      <td className="p-3">~450 kr (Inkl. NVMe-adapter/hatt)</td>
                      <td className="p-3">Ett eneste utrykningsbesøk fra tekniker koster mer enn 10 SSD-er.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                Linux S.M.A.R.T & Driver-attributter ({metrics.modelName})
              </h3>
              <button
                id="btn-run-smart-scan"
                onClick={onRunSmartTest}
                disabled={isScanning}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                <span>{isScanning ? 'Kjører smartctl...' : 'Kjør ny helsesjekk'}</span>
              </button>
            </div>

            <div className="bg-slate-950 text-slate-200 rounded-2xl p-5 font-mono text-xs overflow-x-auto">
              <div className="text-emerald-400 mb-2">
                # smartctl -a {isSD ? '/dev/mmcblk0 (via mmc-utils /sys/class/mmc_host)' : '/dev/nvme0n1'}
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-800 pb-2">
                    <th className="py-1">ID#</th>
                    <th className="py-1">Attributt-navn</th>
                    <th className="py-1">Verdi / Nåværende</th>
                    <th className="py-1">Terskelverdi</th>
                    <th className="py-1">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  <tr>
                    <td className="py-1.5 text-amber-400">005</td>
                    <td className="py-1.5">Reallocated_Sector_Ct</td>
                    <td className="py-1.5">{metrics.reallocatedSectors}</td>
                    <td className="py-1.5">036</td>
                    <td className="py-1.5">{metrics.reallocatedSectors > 10 ? 'ADVARSEL' : 'OK'}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 text-amber-400">177</td>
                    <td className="py-1.5">Wear_Range_Delta</td>
                    <td className="py-1.5">{isSD ? 'Ikke støttet i SD-kontroller' : '002'}</td>
                    <td className="py-1.5">000</td>
                    <td className="py-1.5">{isSD ? 'IKKE TILGJENGELIG' : 'OK'}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 text-amber-400">233</td>
                    <td className="py-1.5">Media_Wearout_Indicator</td>
                    <td className="py-1.5">{metrics.wearLevelingPercentage}% gjenværende</td>
                    <td className="py-1.5">010</td>
                    <td className="py-1.5">{metrics.wearLevelingPercentage < 30 ? 'KRITISK' : 'OK'}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 text-amber-400">194</td>
                    <td className="py-1.5">Temperature_Celsius</td>
                    <td className="py-1.5">{metrics.tempCelsius} C</td>
                    <td className="py-1.5">070</td>
                    <td className="py-1.5">NORMAL</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 text-amber-400">199</td>
                    <td className="py-1.5">UDMA_CRC_Error_Count</td>
                    <td className="py-1.5">0</td>
                    <td className="py-1.5">000</td>
                    <td className="py-1.5">OK</td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-4 pt-4 border-t border-slate-800 text-slate-400 text-xs">
                Siste skanning utført: {metrics.lastSmartScan} | Daemon: /usr/local/bin/velferd_storage_daemon.py
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
