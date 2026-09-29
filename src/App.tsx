/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Heart, 
  HardDrive, 
  Activity, 
  FileText, 
  Sliders, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  Bell,
  Cpu,
  User,
  Info,
  BellRing,
  AlertOctagon,
  X,
  Radio,
  ShieldCheck,
  Lock,
  Key,
  Shield
} from 'lucide-react';
import { SeniorModeView } from './components/SeniorModeView';
import { StorageDiagnostics } from './components/StorageDiagnostics';
import { HealthMonitorView } from './components/HealthMonitorView';
import { ArchitectureSolutionView } from './components/ArchitectureSolutionView';
import { LogAndAlertsView } from './components/LogAndAlertsView';
import { SecurityAndGdprView } from './components/SecurityAndGdprView';
import { 
  INITIAL_MICROSD_METRICS, 
  INITIAL_NVME_METRICS, 
  INITIAL_CONTACTS, 
  INITIAL_MEDICATIONS, 
  INITIAL_SCHEDULE, 
  INITIAL_CLIMATE, 
  INITIAL_VITALS, 
  INITIAL_LOGS,
  INITIAL_ALERTS,
  USER_PROFILES,
  INITIAL_SECURITY_STATUS,
  INITIAL_CONSENTS,
  INITIAL_AUDIT_LOG,
  INITIAL_BATTERIES
} from './data/mockData';
import { 
  StorageMetrics, 
  StorageMedium, 
  SystemLogEntry, 
  SeniorContact, 
  VisualAlert, 
  LogLevel, 
  LogSource,
  UserRole,
  UserProfile,
  ConsentItem,
  AuditLogEntry,
  SecurityStatus,
  SeniorDeviceBattery
} from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'senior' | 'storage' | 'health' | 'alerts' | 'security' | 'architecture'>('senior');
  const [currentRole, setCurrentRole] = useState<UserRole>('senior');
  const [userProfiles] = useState<Record<string, UserProfile>>(USER_PROFILES);
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>(INITIAL_SECURITY_STATUS);
  const [consents, setConsents] = useState<ConsentItem[]>(INITIAL_CONSENTS);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOG);
  const [kioskPin] = useState<string>('1234');
  const [isKioskLocked, setIsKioskLocked] = useState<boolean>(false);
  const [showKioskPinModal, setShowKioskPinModal] = useState<boolean>(false);
  const [pendingTab, setPendingTab] = useState<'senior' | 'storage' | 'health' | 'alerts' | 'security' | 'architecture' | null>(null);
  const [kioskPinInput, setKioskPinInput] = useState<string>('');
  const [kioskPinError, setKioskPinError] = useState<string>('');

  const [currentMedium, setCurrentMedium] = useState<StorageMedium>('microSD');
  const [storageMetrics, setStorageMetrics] = useState<StorageMetrics>(INITIAL_MICROSD_METRICS);
  const [contacts] = useState(INITIAL_CONTACTS);
  const [medications, setMedications] = useState(INITIAL_MEDICATIONS);
  const [schedule] = useState(INITIAL_SCHEDULE);
  const [climate, setClimate] = useState(INITIAL_CLIMATE);
  const [vitals, setVitals] = useState(INITIAL_VITALS);
  const [logs, setLogs] = useState<SystemLogEntry[]>(INITIAL_LOGS);
  const [alerts, setAlerts] = useState<VisualAlert[]>(INITIAL_ALERTS);
  const [batteries, setBatteries] = useState<SeniorDeviceBattery[]>(INITIAL_BATTERIES);
  const [lastCheckedIn, setLastCheckedIn] = useState<string>('14:28');
  const [hasCheckedInToday, setHasCheckedInToday] = useState<boolean>(true);
  const [isScanningSmart, setIsScanningSmart] = useState<boolean>(false);
  const [showLogDrawer, setShowLogDrawer] = useState<boolean>(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Toggle charging state for a senior device
  const handleChargeBattery = (id: string) => {
    setBatteries(prev => prev.map(b => {
      if (b.id === id) {
        const isNowCharging = !b.isCharging;
        const newPct = isNowCharging ? 100 : 22;
        const state = isNowCharging ? 'charging' : 'warning';
        const stateLabel = isNowCharging ? 'Lader nå (100%)' : 'Må lades i kveld (22%)';
        const advice = isNowCharging 
          ? 'Enheten lader nå. La den ligge på nattbordet.' 
          : 'Husk å sette klokken i laderen ved nattbordet før du legger deg.';
        
        addLog('info', 'SENIOR_UI', `Batteristatus oppdatert: ${b.name} -> ${isNowCharging ? 'LADER NÅ' : 'FRAKOBLET LADER'}`);
        triggerToast(isNowCharging ? `✅ ${b.name} lader nå!` : `ℹ️ ${b.name} koblet fra`);

        return {
          ...b,
          isCharging: isNowCharging,
          percentage: newPct,
          state,
          stateLabel,
          advice,
          lastChecked: 'Akkurat nå'
        };
      }
      return b;
    }));
  };

  // Show temporary toast notification
  const triggerToast = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => {
      setNotificationMsg(null);
    }, 4000);
  };

  const addLog = (level: LogLevel, source: LogSource, message: string, details?: string) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const newEntry: SystemLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: timeStr,
      level,
      source,
      message,
      details
    };
    setLogs(prev => [newEntry, ...prev.slice(0, 69)]);
  };

  // Dismiss visual alert
  const handleDismissAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, dismissed: true } : a));
    const target = alerts.find(a => a.id === alertId);
    if (target) {
      addLog('info', 'VARSELSYSTEM', `Visuelt varsel kvittert ut: "${target.title}"`);
    }
    triggerToast('Varsel er kvittert ut');
  };

  // Add custom or manual log entry
  const handleAddLog = (level: LogLevel, source: LogSource, message: string, details?: string) => {
    addLog(level, source, message, details);
    triggerToast(`Loggført: [${level.toUpperCase()}] ${message.slice(0, 36)}...`);
  };

  // Trigger test visual alerts
  const handleTriggerTestAlert = (type: 'fall' | 'hardware' | 'emergency' | 'medication') => {
    const now = new Date();
    const timeStr = `I dag kl. ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (type === 'fall') {
      handleTriggerSimulatedFall();
    } else if (type === 'hardware') {
      const newAlert: VisualAlert = {
        id: `alert-hw-${Date.now()}`,
        severity: 'warning',
        title: 'Kritisk maskinvarevarsel: MicroSD slitasje 26%',
        description: 'MicroSD /dev/mmcblk0 nærmer seg maksimal TBW-grense. Høy risiko for skrivefeil og korrupsjon.',
        timestamp: timeStr,
        source: 'hardware',
        actionLabel: 'Konfigurer SSD / log2ram',
        targetTab: 'storage',
        dismissed: false
      };
      setAlerts(prev => [newAlert, ...prev]);
      addLog('warn', 'STORAGE_DAEMON', 'Visuelt maskinvarevarsel simulert: MicroSD 26% levetid.');
      triggerToast('Visuelt varsel aktivert: MicroSD slitasje');
    } else if (type === 'emergency') {
      handleTriggerAlarm();
    } else if (type === 'medication') {
      const newAlert: VisualAlert = {
        id: `alert-med-${Date.now()}`,
        severity: 'reminder',
        title: 'Medisinpåminnelse: Kveldsmedisin ubesvart',
        description: 'Planlagt tidspunkt er passert. Dosettkammer er ennå ikke registrert åpnet.',
        timestamp: timeStr,
        source: 'medication',
        actionLabel: 'Se medisinplan',
        targetTab: 'senior',
        dismissed: false
      };
      setAlerts(prev => [newAlert, ...prev]);
      addLog('warn', 'HEALTH_BLE', 'Visuelt påminnelsesvarsel: Ubesvart medisinering.');
      triggerToast('Visuelt varsel aktivert: Medisinpåminnelse');
    }
  };

  const handleClearLogs = () => {
    setLogs([]);
    triggerToast('Hendelseslogg er tømt');
  };

  // Navigate with Kiosk PIN guard
  const handleNavigateTab = (tab: 'senior' | 'storage' | 'health' | 'alerts' | 'security' | 'architecture') => {
    if (isKioskLocked && activeTab === 'senior' && tab !== 'senior') {
      setPendingTab(tab);
      setKioskPinInput('');
      setKioskPinError('');
      setShowKioskPinModal(true);
      return;
    }
    setActiveTab(tab);
  };

  const handleUnlockKioskPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (kioskPinInput === kioskPin || kioskPinInput === '1234') {
      setShowKioskPinModal(false);
      if (pendingTab) {
        setActiveTab(pendingTab);
        setPendingTab(null);
      }
      addLog('info', 'SENIOR_UI', 'Kiosk PIN-lås verifisert. Navigasjon godkjent.');
    } else {
      setKioskPinError('Feil PIN-kode. Standard demo-kode er 1234.');
    }
  };

  // Toggle user consent (GDPR Art. 7)
  const handleToggleConsent = (consentId: string) => {
    setConsents(prev => prev.map(c => {
      if (c.id === consentId) {
        const newStatus = !c.granted;
        const actionStr = newStatus ? 'GITT' : 'TILBAKEKALT';
        addLog('info', 'VARSELSYSTEM', `GDPR Samtykke ${actionStr}: "${c.title}"`);
        
        // Append to audit trail
        const now = new Date();
        const timeStr = `I dag kl. ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        const newAudit: AuditLogEntry = {
          id: `aud-${Date.now()}`,
          timestamp: timeStr,
          actorName: userProfiles[currentRole]?.name || 'Bruker',
          actorRole: currentRole,
          action: 'UPDATE',
          resource: 'SYSTEM_CONFIG',
          justification: `Endret samtykkestatus til: ${actionStr} (GDPR Art. 7)`,
          ipAddress: '127.0.0.1 (Lokal Kiosk)',
          verified: true
        };
        setAuditLog(audPrev => [newAudit, ...audPrev]);

        triggerToast(`Samtykke ${actionStr.toLowerCase()}: ${c.title}`);
        return { ...c, granted: newStatus, lastUpdated: 'I dag' };
      }
      return c;
    }));
  };

  // Toggle Kiosk PIN lock
  const handleToggleKioskLock = (enable: boolean) => {
    setIsKioskLocked(enable);
    setSecurityStatus(prev => ({ ...prev, kioskPinLocked: enable }));
    addLog('info', 'SENIOR_UI', `Seniormodus PIN-lås ${enable ? 'AKTIVERT' : 'DEAKTIVERT'}. Sikkerhetskode: ${kioskPin}`);
    triggerToast(enable ? 'Kiosk PIN-lås aktivert' : 'Kiosk PIN-lås deaktivert');
  };

  // GDPR Art. 15 Data Export
  const handleExportGdprData = () => {
    const exportPayload = {
      gdprStatement: 'Innsynsbegjæring i henhold til personvernforordningen (GDPR) Art. 15 og 20',
      exportedAt: new Date().toISOString(),
      patient: {
        id: 'patient-kari-nordmann-82',
        name: 'Kari Nordmann',
        birthYear: 1944,
        residenceType: 'Kommunal omsorgsleilighet',
        carePlan: 'Velferdsteknologisk trygghetspakke 3'
      },
      consents: consents,
      vitalsTelemetri: vitals,
      climateSensorer: climate,
      medisineringDosett: medications,
      pårørendeKontakter: contacts,
      auditLogg: auditLog,
      maskinvareStatus: {
        medium: storageMetrics.medium,
        luks2Kryptert: true,
        tpm2Attestert: true,
        normenVersjon: 'Normen 6.0'
      }
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `kari-nordmann-helsedata-gdpr-innsyn-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    // Log to audit trail
    const now = new Date();
    const timeStr = `I dag kl. ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const newAudit: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      timestamp: timeStr,
      actorName: userProfiles[currentRole]?.name || 'Bruker',
      actorRole: currentRole,
      action: 'EXPORT',
      resource: 'VITALE_TEGN',
      justification: 'GDPR Art. 15 & 20 Fullstendig pasientdatauttrekk generert',
      ipAddress: '127.0.0.1 (Kryptert nedlasting)',
      verified: true
    };
    setAuditLog(prev => [newAudit, ...prev]);
    addLog('success', 'SENIOR_UI', 'Fullstendig pasientdatauttrekk generert og lastet ned (GDPR Art. 15).');
    triggerToast('Pasientdatauttrekk (.JSON) lastet ned!');
  };

  // Crypto Erase / GDPR Art. 17
  const handleExecuteCryptoErase = () => {
    const now = new Date();
    const timeStr = `I dag kl. ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const newAudit: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      timestamp: timeStr,
      actorName: userProfiles[currentRole]?.name || 'Admin',
      actorRole: currentRole,
      action: 'DELETE',
      resource: 'SYSTEM_CONFIG',
      justification: 'Kryptografisk sanering av TPM master-nøkkel (GDPR Art. 17 / NSM)',
      ipAddress: '127.0.0.1 (Krypto-sanering)',
      verified: true
    };
    setAuditLog(prev => [newAudit, ...prev]);
    addLog('error', 'STORAGE_DAEMON', 'KRITISK SIKKERHETSSANERING: TPM 2.0 masterkey destruert. NVMe lagring er sanert iht. NSM.');
    triggerToast('Sikker krypto-sanering fullført. Master-nøkler er slettet.');
  };

  // Add manual audit entry
  const handleAddAuditEntry = (action: AuditLogEntry['action'], resource: AuditLogEntry['resource'], justification: string) => {
    const now = new Date();
    const timeStr = `I dag kl. ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const profile = userProfiles[currentRole] || userProfiles['nurse'];
    const newAudit: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      timestamp: timeStr,
      actorName: profile.name,
      actorRole: currentRole,
      actorHprNumber: profile.hprNumber,
      action,
      resource,
      justification,
      ipAddress: currentRole === 'nurse' ? '10.140.22.4 (VKP Helsenett)' : '84.212.19.82 (BankID N4)',
      verified: true
    };
    setAuditLog(prev => [newAudit, ...prev]);
    addLog('info', currentRole === 'nurse' ? 'PLEIE_NOTAT' : 'SENIOR_UI', `Revisjonsspor ført: [${action}] ${resource} - "${justification}"`);
    triggerToast('Revisjonsoppslag er loggført');
  };

  // Change active user role
  const handleChangeRole = (newRole: UserRole) => {
    setCurrentRole(newRole);
    const profile = userProfiles[newRole];
    addLog('info', 'VARSELSYSTEM', `Aktiv brukerrolle endret til: ${profile.name} (${profile.title})`);
    triggerToast(`Aktiv rolle: ${profile.name}`);
  };


  // Active alerts calculations
  const activeAlerts = alerts.filter(a => !a.dismissed);
  const activeCriticalAlerts = activeAlerts.filter(a => a.severity === 'critical');
  const topAlert = activeCriticalAlerts.length > 0 ? activeCriticalAlerts[0] : activeAlerts[0];

  // Toggle storage medium (SD vs NVMe SSD)
  const handleToggleMedium = (medium: StorageMedium) => {
    setCurrentMedium(medium);
    const now = new Date();
    const timeStr = `I dag kl. ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (medium === 'microSD') {
      setStorageMetrics(INITIAL_MICROSD_METRICS);
      const hwAlert: VisualAlert = {
        id: `alert-hw-${Date.now()}`,
        severity: 'warning',
        title: 'Maskinvarevarsel: MicroSD slitasje på 26% levetid',
        description: 'Aktivt minnekort /dev/mmcblk0 har nådd 18.4 av 25 TBW. Risiko for korrupsjon ved strømbrudd. Anbefalt: Bytt til NVMe SSD eller aktiver log2ram.',
        timestamp: timeStr,
        source: 'hardware',
        actionLabel: 'Sjekk lagringshelse',
        targetTab: 'storage',
        dismissed: false
      };
      setAlerts(prev => [hwAlert, ...prev.filter(a => a.source !== 'hardware')]);
      addLog('warn', 'STORAGE_DAEMON', 'Byttet til aktiv lagring: SanDisk Ultra 32GB MicroSD. Advarsel: Lav utholdenhet.');
      triggerToast('Aktiv lagring endret til MicroSD (Høy slitasjerisiko)');
    } else {
      setStorageMetrics(INITIAL_NVME_METRICS);
      setAlerts(prev => prev.map(a => a.source === 'hardware' ? { ...a, dismissed: true } : a));
      addLog('success', 'STORAGE_DAEMON', 'Byttet til aktiv lagring: Industriell M.2 NVMe SSD. Slitasjehelse: 94% optimal.');
      triggerToast('Aktiv lagring endret til NVMe SSD (Maksimal stabilitet)');
    }
  };

  // Toggle log2ram
  const handleToggleLog2Ram = () => {
    setStorageMetrics(prev => {
      const nextState = !prev.log2ramEnabled;
      const newDailyMB = nextState ? 650 : 4800;
      const newWriteRate = nextState ? 35 : 240;
      addLog(
        nextState ? 'success' : 'warn',
        'STORAGE_DAEMON',
        nextState 
          ? 'log2ram aktivert: /var/log montert i RAM. Skrivebelastning redusert med 85%.' 
          : 'log2ram deaktivert: Logger skrives nå direkte til flash-blokker.'
      );
      triggerToast(nextState ? 'log2ram aktivert: 85% redusert slitasje' : 'log2ram deaktivert');
      return {
        ...prev,
        log2ramEnabled: nextState,
        avgDailyWritesMB: newDailyMB,
        writeRateKBps: newWriteRate
      };
    });
  };

  // Toggle SQLite WAL mode
  const handleToggleWalMode = () => {
    setStorageMetrics(prev => {
      const nextState = !prev.walModeEnabled;
      addLog(
        nextState ? 'info' : 'warn',
        'STORAGE_DAEMON',
        nextState 
          ? 'SQLite PRAGMA journal_mode=WAL satt. Sekvensiell I/O aktivert.' 
          : 'SQLite WAL deaktivert. Gikk tilbake til rollback journal.'
      );
      triggerToast(nextState ? 'SQLite WAL-modus aktivert' : 'SQLite WAL deaktivert');
      return {
        ...prev,
        walModeEnabled: nextState,
        ioWaitPercent: nextState ? 0.8 : 14.8
      };
    });
  };

  // Senior check-in
  const handleConfirmImOk = () => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setLastCheckedIn(timeStr);
    setHasCheckedInToday(true);
    addLog('success', 'SENIOR_UI', `Senior bekreftet trygghet kl. ${timeStr}. Varsling sendt til pårørende.`);
    triggerToast('Trygghetsmelding sendt til pårørende og vaktrom!');
  };

  // Senior takes medication
  const handleTakeMedication = (id: string) => {
    setMedications(prev => prev.map(m => m.id === id ? { ...m, taken: true } : m));
    const target = medications.find(m => m.id === id);
    addLog('success', 'HEALTH_BLE', `Medisin '${target?.name}' bekreftet tatt av senior.`);
    triggerToast(`Medisin registrert som tatt: ${target?.name}`);
  };

  // Senior or simulated alarm
  const handleTriggerAlarm = () => {
    const now = new Date();
    const timeStr = `I dag kl. ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newAlert: VisualAlert = {
      id: `alert-sos-${Date.now()}`,
      severity: 'critical',
      title: 'AKUTT NØDALARM: Utløst av bruker!',
      description: 'Senior har trykket på den store nødknappen på skjermen. Alle 3 nødkontakter og vaktsentral varsles umiddelbart via SMS og talesamtale.',
      timestamp: timeStr,
      source: 'emergency',
      actionLabel: 'Gå til Seniormodus',
      targetTab: 'senior',
      dismissed: false
    };
    setAlerts(prev => [newAlert, ...prev]);
    addLog('error', 'SENIOR_UI', 'AKUTT NØDALARM utløst fra berøringsskjerm! Pårørende og alarmsentral varsles.');
    triggerToast('🚨 AKUTT ALARM UTKALT! Pårørende ringes opp.');
  };

  // Senior sends emergency or quick message to contact
  const handleSendMessage = (contactName: string, message: string, isEmergency: boolean) => {
    addLog(
      isEmergency ? 'warn' : 'info',
      'SENIOR_UI',
      `${isEmergency ? 'NØDMELDING' : 'Melding'} sendt til ${contactName}: "${message}" via SMS-gateway.`
    );
    triggerToast(`${isEmergency ? 'Nødmelding' : 'Melding'} levert til ${contactName}`);
  };

  // Senior calls a contact
  const handleStartCall = (contact: SeniorContact) => {
    addLog('info', 'SENIOR_UI', `Oppringning initiert til ${contact.name} (${contact.phone}).`);
    triggerToast(`Ringer opp ${contact.name}...`);
  };

  // Health Fall simulation
  const handleTriggerSimulatedFall = () => {
    const now = new Date();
    const timeStr = `I dag kl. ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setVitals(prev => ({
      ...prev,
      fallDetected: true,
      lastMovementMinutesAgo: 0
    }));
    const newAlert: VisualAlert = {
      id: `alert-fall-${Date.now()}`,
      severity: 'critical',
      title: 'KRITISK: Fall detektert i stuen!',
      description: 'mmWave fallradar har registrert plutselig fall mot gulvflate. Ingen bevegelse de siste minuttene. Hjemmesykepleien og pårørende er varslet.',
      timestamp: timeStr,
      source: 'fall',
      actionLabel: 'Undersøk helsesensorer',
      targetTab: 'health',
      dismissed: false
    };
    setAlerts(prev => [newAlert, ...prev]);
    addLog('error', 'FALL_RADAR', 'mmWave sensor varsler: Hurtig fall mot gulvflate registrert i stue.');
    triggerToast('🚨 KRITISK FALLALARM AKTIVERT!');
  };

  const handleResetFallAlert = () => {
    setVitals(prev => ({
      ...prev,
      fallDetected: false
    }));
    setAlerts(prev => prev.map(a => a.source === 'fall' ? { ...a, dismissed: true } : a));
    addLog('success', 'FALL_RADAR', 'Fallalarm manuelt nullstilt. Normal situasjon bekreftet.');
    triggerToast('Fallalarm er nullstilt.');
  };

  // S.M.A.R.T diagnostic test simulation
  const handleRunSmartTest = () => {
    setIsScanningSmart(true);
    addLog('info', 'STORAGE_DAEMON', `Starter dyp S.M.A.R.T-skanning på ${storageMetrics.modelName}...`);
    
    setTimeout(() => {
      setIsScanningSmart(false);
      const now = new Date();
      const scanTime = `I dag kl. ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      setStorageMetrics(prev => ({
        ...prev,
        lastSmartScan: scanTime
      }));
      addLog('success', 'STORAGE_DAEMON', `S.M.A.R.T-skanning fullført for ${storageMetrics.modelName}.`);
      triggerToast('S.M.A.R.T-skanning fullført!');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      
      {/* Toast banner */}
      {notificationMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-fade-in">
          <Info className="w-5 h-5 text-teal-400 shrink-0" />
          <span className="font-semibold text-sm">{notificationMsg}</span>
        </div>
      )}

      {/* Navigation Header / Role Bar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3">
            
            {/* Logo & Prototype Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black text-xl shadow">
                V
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                    Velferdsteknologi Prototype
                  </h1>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                    Konsept
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Hardware-stabilitet (SD vs SSD) &bull; Helsetelemetri &bull; Seniormodus
                </p>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 overflow-x-auto">
              
              {/* Tab 1: Seniormodus */}
              <button
                id="nav-senior-mode"
                onClick={() => handleNavigateTab('senior')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
                  activeTab === 'senior'
                    ? 'bg-white text-teal-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Heart className={`w-4 h-4 ${activeTab === 'senior' ? 'text-teal-600 fill-teal-100' : 'text-slate-500'}`} />
                <span>Seniormodus (Bruker)</span>
                {isKioskLocked && (
                  <Lock className="w-3 h-3 text-amber-600" title="Kiosk PIN-lås aktiv" />
                )}
              </button>

              {/* Tab 2: Lagring & Maskinvare */}
              <button
                id="nav-storage-mode"
                onClick={() => handleNavigateTab('storage')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
                  activeTab === 'storage'
                    ? 'bg-white text-blue-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <HardDrive className={`w-4 h-4 ${activeTab === 'storage' ? 'text-blue-600' : 'text-slate-500'}`} />
                <span>Lagring (SD vs SSD)</span>
                {storageMetrics.wearLevelingPercentage < 30 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                )}
              </button>

              {/* Tab 3: Helseovervåking */}
              <button
                id="nav-health-mode"
                onClick={() => handleNavigateTab('health')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
                  activeTab === 'health'
                    ? 'bg-white text-purple-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Activity className={`w-4 h-4 ${activeTab === 'health' ? 'text-purple-600' : 'text-slate-500'}`} />
                <span>Helse & Sensorer</span>
                {vitals.fallDetected && (
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-bounce" />
                )}
              </button>

              {/* Tab 4: Visuelle Varsler & Hendelseslogg */}
              <button
                id="nav-alerts-mode"
                onClick={() => handleNavigateTab('alerts')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
                  activeTab === 'alerts'
                    ? 'bg-white text-rose-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BellRing className={`w-4 h-4 ${activeTab === 'alerts' ? 'text-rose-600' : 'text-slate-500'}`} />
                <span>Varsler &amp; Logg</span>
                {activeAlerts.length > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black text-white ${
                    activeCriticalAlerts.length > 0 ? 'bg-rose-600 animate-pulse' : 'bg-amber-600'
                  }`}>
                    {activeAlerts.length}
                  </span>
                )}
              </button>

              {/* Tab 5: Sikkerhet, GDPR & Pasientvern */}
              <button
                id="nav-security-mode"
                onClick={() => handleNavigateTab('security')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
                  activeTab === 'security'
                    ? 'bg-white text-indigo-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className={`w-4 h-4 ${activeTab === 'security' ? 'text-indigo-600' : 'text-slate-500'}`} />
                <span>Sikkerhet &amp; GDPR</span>
                <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black px-1.5 py-0.5 rounded-full border border-emerald-300">
                  Normen
                </span>
              </button>

              {/* Tab 6: Teknisk Arkitektur & Stack */}
              <button
                id="nav-architecture-mode"
                onClick={() => handleNavigateTab('architecture')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
                  activeTab === 'architecture'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className={`w-4 h-4 ${activeTab === 'architecture' ? 'text-slate-900' : 'text-slate-500'}`} />
                <span>Løsningsforslag (Stack)</span>
              </button>
            </div>

            {/* Quick Diagnostic Badges & Log Drawer Toggle */}
            <div className="hidden lg:flex items-center gap-2.5">
              <div 
                className="px-2.5 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-900 text-xs font-bold flex items-center gap-1.5"
                title="Sikkerhet og personvern iht. Normen 6.0"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Normen: 98%</span>
              </div>

              <div 
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 ${
                  storageMetrics.wearLevelingPercentage > 50 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>{currentMedium === 'microSD' ? 'SD: 26% levetid' : 'NVMe: 94% levetid'}</span>
              </div>

              <button
                id="btn-toggle-logs"
                onClick={() => setShowLogDrawer(prev => !prev)}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 relative"
                title="Vis telemetrilogg i sanntid"
              >
                <Bell className="w-4 h-4" />
                {activeAlerts.length > 0 && (
                  <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${
                    activeCriticalAlerts.length > 0 ? 'bg-rose-600 animate-pulse' : 'bg-amber-500'
                  }`} />
                )}
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* Global Visual Alert Banner (shown across all tabs when an active critical/warning alert is pending) */}
      {topAlert && activeTab !== 'alerts' && (
        <div 
          id={`global-alert-banner-${topAlert.id}`}
          className={`w-full border-b transition-all ${
            topAlert.severity === 'critical' 
              ? 'bg-rose-600 text-white border-rose-700' 
              : topAlert.severity === 'warning'
              ? 'bg-amber-500 text-slate-950 border-amber-600'
              : 'bg-indigo-600 text-white border-indigo-700'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                topAlert.severity === 'critical' 
                  ? 'bg-white text-rose-600 animate-bounce' 
                  : topAlert.severity === 'warning' 
                  ? 'bg-slate-950 text-amber-400' 
                  : 'bg-white text-indigo-600'
              }`}>
                {topAlert.severity === 'critical' ? (
                  <AlertOctagon className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                    topAlert.severity === 'critical' ? 'bg-white/20 text-white' : 'bg-slate-950 text-white'
                  }`}>
                    {topAlert.severity === 'critical' ? 'Kritisk visuelt varsel' : 'Visuelt maskinvarevarsel'}
                  </span>
                  <span className={`text-[11px] font-mono ${
                    topAlert.severity === 'warning' ? 'text-slate-900 font-semibold' : 'text-white/80'
                  }`}>
                    {topAlert.timestamp}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-extrabold truncate mt-0.5">
                  {topAlert.title}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              {topAlert.targetTab && (
                <button
                  onClick={() => setActiveTab(topAlert.targetTab!)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg shadow-xs transition-colors ${
                    topAlert.severity === 'warning'
                      ? 'bg-slate-950 hover:bg-slate-850 text-white'
                      : 'bg-white/20 hover:bg-white/30 text-white'
                  }`}
                >
                  {topAlert.actionLabel || 'Undersøk'}
                </button>
              )}
              <button
                onClick={() => setActiveTab('alerts')}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg shadow-xs transition-colors ${
                  topAlert.severity === 'warning'
                    ? 'bg-white hover:bg-slate-100 text-slate-950 font-black'
                    : 'bg-white hover:bg-slate-100 text-slate-900 font-black'
                }`}
              >
                Åpne varselsenter &amp; logg
              </button>
              <button
                onClick={() => handleDismissAlert(topAlert.id)}
                className={`p-1.5 rounded-lg transition-colors ${
                  topAlert.severity === 'warning' ? 'text-slate-850 hover:bg-amber-600/30' : 'text-white/80 hover:bg-white/20'
                }`}
                title="Lukk varsel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 py-4">
        {activeTab === 'senior' && (
          <SeniorModeView
            contacts={contacts}
            medications={medications}
            schedule={schedule}
            climate={climate}
            onConfirmImOk={handleConfirmImOk}
            onTakeMedication={handleTakeMedication}
            onTriggerAlarm={handleTriggerAlarm}
            onSendMessage={handleSendMessage}
            onStartCall={handleStartCall}
            lastCheckedIn={lastCheckedIn}
            hasCheckedInToday={hasCheckedInToday}
            activeAlerts={alerts}
            onDismissAlert={handleDismissAlert}
            batteries={batteries}
            onChargeBattery={handleChargeBattery}
          />
        )}

        {activeTab === 'storage' && (
          <StorageDiagnostics
            metrics={storageMetrics}
            onToggleMedium={handleToggleMedium}
            onToggleLog2Ram={handleToggleLog2Ram}
            onToggleWalMode={handleToggleWalMode}
            onRunSmartTest={handleRunSmartTest}
            isScanning={isScanningSmart}
          />
        )}

        {activeTab === 'health' && (
          <HealthMonitorView
            vitals={vitals}
            climate={climate}
            medications={medications}
            onTriggerSimulatedFall={handleTriggerSimulatedFall}
            onResetFallAlert={handleResetFallAlert}
          />
        )}

        {activeTab === 'alerts' && (
          <LogAndAlertsView
            logs={logs}
            alerts={alerts}
            onAddLog={handleAddLog}
            onDismissAlert={handleDismissAlert}
            onTriggerTestAlert={handleTriggerTestAlert}
            onNavigateTab={(tab) => handleNavigateTab(tab)}
            onClearLogs={handleClearLogs}
          />
        )}

        {activeTab === 'security' && (
          <SecurityAndGdprView
            currentRole={currentRole}
            userProfiles={userProfiles}
            securityStatus={securityStatus}
            consents={consents}
            auditLog={auditLog}
            vitals={vitals}
            medications={medications}
            kioskPin={kioskPin}
            isKioskLocked={isKioskLocked}
            onChangeRole={handleChangeRole}
            onToggleConsent={handleToggleConsent}
            onToggleKioskLock={handleToggleKioskLock}
            onExportGdprData={handleExportGdprData}
            onExecuteCryptoErase={handleExecuteCryptoErase}
            onAddAuditEntry={handleAddAuditEntry}
          />
        )}

        {activeTab === 'architecture' && (
          <ArchitectureSolutionView />
        )}
      </main>

      {/* Kiosk PIN Unlock Modal */}
      {showKioskPinModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Kiosk-sikkerhetslås</h3>
                  <p className="text-xs text-slate-500">Beskytter seniormodus mot feilklikk</p>
                </div>
              </div>
              <button
                id="btn-close-pin-modal"
                onClick={() => setShowKioskPinModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-600 mb-5 leading-relaxed">
              Seniormodus er låst for brukerens trygghet. Tast inn 4-sifret PIN-kode for helsepersonell eller pårørende for å åpne tekniske moduler.
            </p>

            <form onSubmit={handleUnlockKioskPin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  PIN-kode (4 siffer)
                </label>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <input
                    id="input-kiosk-pin"
                    type="password"
                    maxLength={4}
                    autoFocus
                    value={kioskPinInput}
                    onChange={(e) => {
                      setKioskPinInput(e.target.value.replace(/\D/g, ''));
                      setKioskPinError('');
                    }}
                    placeholder="••••"
                    className="w-full text-center text-3xl font-mono tracking-widest py-3 px-4 rounded-2xl border-2 border-slate-300 focus:border-indigo-600 focus:outline-hidden bg-slate-50 font-bold"
                  />
                </div>
                {kioskPinError && (
                  <p className="text-xs font-bold text-rose-600 text-center">{kioskPinError}</p>
                )}
                <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2 px-1">
                  <span>Standard demokode: <strong>1234</strong></span>
                  <button
                    type="button"
                    onClick={() => setKioskPinInput('1234')}
                    className="text-indigo-600 hover:underline font-semibold"
                  >
                    Fyll inn 1234
                  </button>
                </div>
              </div>

              {/* Quick Number Buttons for Touch / Tablet */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((btn) => (
                  <button
                    key={btn}
                    type="button"
                    onClick={() => {
                      if (btn === 'C') setKioskPinInput('');
                      else if (btn === '⌫') setKioskPinInput(prev => prev.slice(0, -1));
                      else if (kioskPinInput.length < 4) setKioskPinInput(prev => prev + btn);
                    }}
                    className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-bold text-lg transition-colors"
                  >
                    {btn}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  id="btn-cancel-kiosk-pin"
                  onClick={() => setShowKioskPinModal(false)}
                  className="w-1/2 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50"
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  id="btn-submit-kiosk-pin"
                  className="w-1/2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Key className="w-4 h-4" />
                  <span>Lås opp</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Telemetry Log Drawer (Collapsible) */}
      {showLogDrawer && (
        <div className="fixed bottom-0 right-0 left-0 md:left-auto md:w-96 bg-white border-t md:border-l border-slate-300 shadow-2xl z-50 p-4 max-h-96 flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2">
            <span className="font-bold text-xs uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-teal-600" />
              <span>Sanntids Hendelseslogg</span>
            </span>
            <button
              id="btn-close-logs"
              onClick={() => setShowLogDrawer(false)}
              className="text-xs text-slate-500 hover:text-slate-800 font-bold px-2 py-0.5 rounded"
            >
              Lukk
            </button>
          </div>
          <div className="overflow-y-auto space-y-2 flex-1 font-mono text-[11px]">
            {logs.map(entry => (
              <div key={entry.id} className="p-2 rounded bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between text-slate-400 mb-0.5">
                  <span className="font-bold text-slate-700">[{entry.source}]</span>
                  <span>{entry.timestamp}</span>
                </div>
                <p className={`leading-snug ${
                  entry.level === 'error' ? 'text-rose-600 font-bold' :
                  entry.level === 'warn' ? 'text-amber-700 font-medium' :
                  entry.level === 'success' ? 'text-emerald-700' : 'text-slate-600'
                }`}>
                  {entry.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Velferdsteknologisk Konseptprototype &bull; Sikret mot minnekortkorrupsjon (SD vs SSD)</span>
          <span className="font-medium text-slate-600">Utviklet med Python/Flask arkitektur &amp; Lovelace/React</span>
        </div>
      </footer>
    </div>
  );
}
