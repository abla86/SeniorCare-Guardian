import React, { useState } from 'react';
import { 
  AlertTriangle, 
  AlertOctagon, 
  Bell, 
  BellRing, 
  ShieldAlert, 
  CheckCircle2, 
  Activity, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Copy, 
  Trash2, 
  Clock, 
  User, 
  HardDrive, 
  Heart, 
  Info, 
  X, 
  ChevronRight, 
  Sparkles, 
  Radio,
  FileText,
  Check
} from 'lucide-react';
import { SystemLogEntry, VisualAlert, LogLevel, LogSource } from '../types';

interface LogAndAlertsViewProps {
  logs: SystemLogEntry[];
  alerts: VisualAlert[];
  onAddLog: (level: LogLevel, source: LogSource, message: string, details?: string) => void;
  onDismissAlert: (alertId: string) => void;
  onTriggerTestAlert: (type: 'fall' | 'hardware' | 'emergency' | 'medication') => void;
  onNavigateTab: (tab: 'senior' | 'storage' | 'health') => void;
  onClearLogs: () => void;
}

export const LogAndAlertsView: React.FC<LogAndAlertsViewProps> = ({
  logs,
  alerts,
  onAddLog,
  onDismissAlert,
  onTriggerTestAlert,
  onNavigateTab,
  onClearLogs
}) => {
  // Add log form state
  const [showAddLogModal, setShowAddLogModal] = useState<boolean>(false);
  const [newLogLevel, setNewLogLevel] = useState<LogLevel>('info');
  const [newLogSource, setNewLogSource] = useState<LogSource>('PLEIE_NOTAT');
  const [newLogMessage, setNewLogMessage] = useState<string>('');
  const [newLogDetails, setNewLogDetails] = useState<string>('');

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('ALL');
  const [selectedSourceFilter, setSelectedSourceFilter] = useState<string>('ALL');
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);

  // Active (non-dismissed) alerts
  const activeAlerts = alerts.filter(a => !a.dismissed);
  const criticalCount = activeAlerts.filter(a => a.severity === 'critical').length;
  const warningCount = activeAlerts.filter(a => a.severity === 'warning').length;

  // Filtered logs
  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchQuery === '' || 
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesLevel = selectedLevelFilter === 'ALL' || log.level === selectedLevelFilter;
    const matchesSource = selectedSourceFilter === 'ALL' || log.source === selectedSourceFilter;

    return matchesSearch && matchesLevel && matchesSource;
  });

  const handleCreateLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogMessage.trim()) return;

    onAddLog(newLogLevel, newLogSource, newLogMessage.trim(), newLogDetails.trim() || undefined);
    setNewLogMessage('');
    setNewLogDetails('');
    setShowAddLogModal(false);
  };

  const handleCopyLogs = () => {
    const text = logs.map(l => `[${l.timestamp}] [${l.level.toUpperCase()}] [${l.source}]: ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `velferds-logg-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const quickTemplates = [
    { title: 'Tilsyn utført', text: 'Daglig tilsyn utført i hjemmet. Bruker er i god form og opplagt.', level: 'success' as LogLevel, source: 'PLEIE_NOTAT' as LogSource },
    { title: 'Blodtrykk målt', text: 'Blodtrykk målt til 125/80 mmHg, puls 68 bpm. Normale verdier.', level: 'info' as LogLevel, source: 'PLEIE_NOTAT' as LogSource },
    { title: 'Middag servert', text: 'Varm middag servert og spist. God appetitt.', level: 'info' as LogLevel, source: 'PLEIE_NOTAT' as LogSource },
    { title: 'Uro / svimmelhet', text: 'Bruker melder om lett forbigående svimmelhet ved oppreisning. Ekstra oppfølging bestilt.', level: 'warn' as LogLevel, source: 'PLEIE_NOTAT' as LogSource }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Visuelle Varsler & Hendelseslogg
            </h1>
            <span className="bg-slate-900 text-white text-xs font-extrabold px-3 py-1 rounded-full">
              Sanntid
            </span>
          </div>
          <p className="text-slate-600 text-base sm:text-lg mt-1">
            Overvåk aktive alarmtilstander, systemvarsler og pleielogger for omsorgspersonell og pårørende.
          </p>
        </div>

        {/* Action button: Add new log */}
        <div className="flex items-center gap-3">
          <button
            id="btn-open-add-log"
            onClick={() => setShowAddLogModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-base px-5 py-3.5 rounded-2xl shadow-md transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>Legg til i logg</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SEKSJON 1: VISUELLE VARSLER (STATUS & AKTIVE VARSLER) */}
      {/* ========================================================================= */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <BellRing className="w-6 h-6 text-rose-600 animate-pulse" />
            <h2 className="text-2xl font-extrabold text-slate-900">
              Aktive Visuelle Varsler ({activeAlerts.length})
            </h2>
          </div>

          {/* Quick simulator triggers */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 hidden sm:inline">Simuler varsel:</span>
            <button
              onClick={() => onTriggerTestAlert('fall')}
              className="text-xs font-bold bg-rose-100 hover:bg-rose-200 text-rose-800 px-3 py-1.5 rounded-xl border border-rose-300 transition-colors"
            >
              + Fallalarm (Kritisk)
            </button>
            <button
              onClick={() => onTriggerTestAlert('hardware')}
              className="text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-800 px-3 py-1.5 rounded-xl border border-amber-300 transition-colors"
            >
              + SD-slitasje (Advarsel)
            </button>
            <button
              onClick={() => onTriggerTestAlert('medication')}
              className="text-xs font-bold bg-purple-100 hover:bg-purple-200 text-purple-800 px-3 py-1.5 rounded-xl border border-purple-300 transition-colors"
            >
              + Medisinpåminnelse
            </button>
          </div>
        </div>

        {/* Visual Alert Status Banner */}
        {activeAlerts.length === 0 ? (
          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-6 text-emerald-950 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-200 text-emerald-800 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold">
                  Alle systemer nominelle – Ingen aktive feilvarsler
                </h3>
                <p className="text-sm sm:text-base text-emerald-800 mt-0.5">
                  Lagring er stabil, helsesensorer er tilkoblet og ingen nødsituasjoner er rapportert.
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-block bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl">
              Normal drift
            </span>
          </div>
        ) : (
          <div className="space-y-4">
            {activeAlerts.map(alert => {
              const isCritical = alert.severity === 'critical';
              const isWarning = alert.severity === 'warning';
              const isReminder = alert.severity === 'reminder';

              return (
                <div
                  key={alert.id}
                  id={`alert-card-${alert.id}`}
                  className={`rounded-3xl p-5 sm:p-6 border-2 transition-all shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isCritical 
                      ? 'bg-rose-50 border-rose-400 text-rose-950 ring-4 ring-rose-300/40 animate-pulse-slow' 
                      : isWarning 
                      ? 'bg-amber-50 border-amber-400 text-amber-950' 
                      : isReminder
                      ? 'bg-purple-50 border-purple-300 text-purple-950'
                      : 'bg-blue-50 border-blue-300 text-blue-950'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow ${
                      isCritical 
                        ? 'bg-rose-600 text-white' 
                        : isWarning 
                        ? 'bg-amber-500 text-slate-950' 
                        : 'bg-purple-600 text-white'
                    }`}>
                      {isCritical ? (
                        <AlertOctagon className="w-8 h-8 animate-bounce" />
                      ) : (
                        <AlertTriangle className="w-8 h-8" />
                      )}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          isCritical 
                            ? 'bg-rose-600 text-white' 
                            : isWarning 
                            ? 'bg-amber-600 text-white' 
                            : 'bg-purple-600 text-white'
                        }`}>
                          {alert.severity}
                        </span>
                        <span className="text-xs font-semibold text-slate-600">
                          {alert.timestamp}
                        </span>
                        <span className="text-xs font-bold text-slate-500 uppercase">
                          Kilde: {alert.source}
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black mt-1">
                        {alert.title}
                      </h3>
                      <p className="text-base text-slate-800 mt-1 leading-relaxed">
                        {alert.description}
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-300/60">
                    {alert.targetTab && (
                      <button
                        onClick={() => onNavigateTab(alert.targetTab!)}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm px-4 py-2.5 rounded-xl shadow transition-all flex items-center gap-1.5"
                      >
                        <span>{alert.actionLabel || 'Undersøk'}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      id={`btn-dismiss-alert-${alert.id}`}
                      onClick={() => onDismissAlert(alert.id)}
                      className="bg-white hover:bg-slate-100 text-slate-700 font-bold text-sm px-4 py-2.5 rounded-xl border border-slate-300 shadow-sm transition-all"
                    >
                      Kvitter ut
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* SEKSJON 2: HENDELSESLOGG (HISTORIKK & LOGGFØRING) */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-xl">
        
        {/* Log header & Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
              <Activity className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                System- og Hendelseslogg
              </h2>
              <p className="text-sm text-slate-500">
                Viser {filteredLogs.length} av {logs.length} registrerte hendelser
              </p>
            </div>
          </div>

          {/* Log Export and Utility buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleCopyLogs}
              className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-300 hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition-colors"
              title="Kopier logg til utklippstavle"
            >
              {copiedSuccess ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copiedSuccess ? 'Kopiert!' : 'Kopier'}</span>
            </button>

            <button
              onClick={handleExportJson}
              className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-300 hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition-colors"
              title="Last ned logg som JSON"
            >
              <Download className="w-4 h-4" />
              <span>Eksporter</span>
            </button>

            <button
              onClick={onClearLogs}
              className="px-3.5 py-2 rounded-xl text-xs font-bold border border-rose-200 text-rose-700 hover:bg-rose-50 flex items-center gap-1.5 transition-colors"
              title="Nullstill hendelseslogg"
            >
              <Trash2 className="w-4 h-4" />
              <span>Tøm logg</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-6">
          
          {/* Search Bar */}
          <div className="sm:col-span-6 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Søk i logger (f.eks. 'SD', 'fall', 'medisin', 'Ingrid')..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:outline-none text-sm text-slate-900"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter by Level */}
          <div className="sm:col-span-3">
            <select
              value={selectedLevelFilter}
              onChange={(e) => setSelectedLevelFilter(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-700 focus:border-blue-600 focus:outline-none"
            >
              <option value="ALL">Alle alvorlighetsgrader</option>
              <option value="error">Kun Feil / Kritisk</option>
              <option value="warn">Kun Advarsler</option>
              <option value="success">Kun Suksess</option>
              <option value="info">Kun Info</option>
            </select>
          </div>

          {/* Filter by Source */}
          <div className="sm:col-span-3">
            <select
              value={selectedSourceFilter}
              onChange={(e) => setSelectedSourceFilter(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-700 focus:border-blue-600 focus:outline-none"
            >
              <option value="ALL">Alle kilder</option>
              <option value="STORAGE_DAEMON">Lagringsdaemon</option>
              <option value="HEALTH_BLE">Helse BLE / Sensor</option>
              <option value="SENIOR_UI">Senior Brukergrensesnitt</option>
              <option value="FALL_RADAR">Fallradar</option>
              <option value="PLEIE_NOTAT">Pleienotater</option>
              <option value="VARSELSYSTEM">Varselsystem</option>
            </select>
          </div>
        </div>

        {/* Log Entries Stream */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-950 font-mono text-xs shadow-inner">
          <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live telemetristrøm &bull; logging aktiv</span>
            </span>
            <span>{filteredLogs.length} hendelser</span>
          </div>

          <div className="divide-y divide-slate-800 max-h-[460px] overflow-y-auto p-2">
            {filteredLogs.length === 0 ? (
              <div className="py-12 text-center text-slate-500 font-sans">
                Ingen hendelser samsvarer med valgt filter.
              </div>
            ) : (
              filteredLogs.map(entry => {
                const isError = entry.level === 'error';
                const isWarn = entry.level === 'warn';
                const isSuccess = entry.level === 'success';

                return (
                  <div 
                    key={entry.id} 
                    className="p-3 hover:bg-slate-900/80 transition-colors flex flex-col sm:flex-row sm:items-start gap-3"
                  >
                    {/* Time & Badge */}
                    <div className="flex items-center gap-2 shrink-0 sm:w-48">
                      <span className="text-slate-500">{entry.timestamp}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isError ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                        isWarn ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        isSuccess ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                        'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        {entry.level.toUpperCase()}
                      </span>
                    </div>

                    {/* Source */}
                    <div className="shrink-0 sm:w-36 text-slate-400 font-bold">
                      [{entry.source}]
                    </div>

                    {/* Message */}
                    <div className="flex-1 min-w-0">
                      <p className={`${
                        isError ? 'text-rose-400 font-bold' :
                        isWarn ? 'text-amber-300' :
                        isSuccess ? 'text-emerald-400' :
                        'text-slate-200'
                      }`}>
                        {entry.message}
                      </p>
                      {entry.details && (
                        <p className="text-slate-500 text-[11px] mt-1 font-sans">
                          Notat: {entry.details}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* MODAL: LEGG TIL NY LOGGHENDELSE / PLEIENOTAT */}
      {/* ========================================================================= */}
      {showAddLogModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
              <div className="flex items-center gap-3">
                <FileText className="w-7 h-7 text-emerald-600" />
                <h3 className="text-2xl font-black text-slate-900">
                  Legg til ny logghendelse
                </h3>
              </div>
              <button
                onClick={() => setShowAddLogModal(false)}
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateLog} className="space-y-4">
              {/* Hurtigmaler */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                  Bruk en hurtigmal:
                </label>
                <div className="flex flex-wrap gap-2">
                  {quickTemplates.map((template, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setNewLogMessage(template.text);
                        setNewLogLevel(template.level);
                        setNewLogSource(template.source);
                      }}
                      className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-xl border border-slate-300 transition-colors"
                    >
                      +{template.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Source & Level */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    Kilde:
                  </label>
                  <select
                    value={newLogSource}
                    onChange={(e) => setNewLogSource(e.target.value as LogSource)}
                    className="w-full p-3 rounded-xl border border-slate-300 text-sm font-semibold focus:border-emerald-600 focus:outline-none"
                  >
                    <option value="PLEIE_NOTAT">Pleienotat (Tilsyn)</option>
                    <option value="HEALTH_BLE">Helse / Medisin</option>
                    <option value="SENIOR_UI">Seniormodus UI</option>
                    <option value="STORAGE_DAEMON">Lagringsdaemon</option>
                    <option value="FALL_RADAR">Fallradar</option>
                    <option value="VARSELSYSTEM">Varselsystem</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    Alvorlighetsgrad:
                  </label>
                  <select
                    value={newLogLevel}
                    onChange={(e) => setNewLogLevel(e.target.value as LogLevel)}
                    className="w-full p-3 rounded-xl border border-slate-300 text-sm font-semibold focus:border-emerald-600 focus:outline-none"
                  >
                    <option value="info">Info (Vanlig notat)</option>
                    <option value="success">Suksess (Fullført oppgave)</option>
                    <option value="warn">Advarsel (Bør følges opp)</option>
                    <option value="error">Kritisk / Feil (Haster)</option>
                  </select>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Loggbeskjed / Observasjon: *
                </label>
                <textarea
                  required
                  rows={3}
                  value={newLogMessage}
                  onChange={(e) => setNewLogMessage(e.target.value)}
                  placeholder="F.eks: Gjennomført ettermiddagstilsyn. Kari har drukket et glass vann og hviler."
                  className="w-full p-3 rounded-xl border border-slate-300 text-base focus:border-emerald-600 focus:outline-none"
                />
              </div>

              {/* Additional details */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Ekstra detaljer (valgfritt):
                </label>
                <input
                  type="text"
                  value={newLogDetails}
                  onChange={(e) => setNewLogDetails(e.target.value)}
                  placeholder="F.eks: Vurdering gjort av sykepleier Anne"
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:border-emerald-600 focus:outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddLogModal(false)}
                  className="px-5 py-3 rounded-xl text-slate-700 font-bold hover:bg-slate-100 text-sm"
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-3 rounded-xl text-base shadow-md transition-all flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Lagre hendelse i logg</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
