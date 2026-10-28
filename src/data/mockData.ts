import { 
  StorageMetrics, 
  SeniorContact, 
  MedicationItem, 
  ScheduleEvent, 
  IndoorClimate, 
  HealthVitals, 
  SystemLogEntry, 
  EmergencyMessageEvent, 
  VisualAlert,
  UserProfile,
  ConsentItem,
  AuditLogEntry,
  SecurityStatus,
  SeniorDeviceBattery
} from '../types';

export const INITIAL_MICROSD_METRICS: StorageMetrics = {
  medium: 'microSD',
  modelName: 'SanDisk Ultra 32GB A1 Class 10',
  totalCapacityGB: 32,
  tbwWritten: 18.4,
  tbwRating: 25.0, // Typical endurance for consumer SD
  wearLevelingPercentage: 26, // Only 26% life left!
  badBlocksCount: 42,
  reallocatedSectors: 89,
  readOnlyRisk: 'moderate',
  tempCelsius: 48,
  writeRateKBps: 240,
  avgDailyWritesMB: 4800,
  estimatedRemainingDays: 45,
  log2ramEnabled: false,
  walModeEnabled: false,
  filesystemStatus: 'warning',
  ioWaitPercent: 14.8,
  lastSmartScan: 'I dag kl. 14:32'
};

export const INITIAL_NVME_METRICS: StorageMetrics = {
  medium: 'nvmeSSD',
  modelName: 'Kingston NV2 / Transcend Industrial M.2 NVMe 256GB',
  totalCapacityGB: 256,
  tbwWritten: 19.2,
  tbwRating: 320.0, // High endurance
  wearLevelingPercentage: 94, // 94% life remaining
  badBlocksCount: 0,
  reallocatedSectors: 0,
  readOnlyRisk: 'low',
  tempCelsius: 38,
  writeRateKBps: 35,
  avgDailyWritesMB: 650,
  estimatedRemainingDays: 3280,
  log2ramEnabled: true,
  walModeEnabled: true,
  filesystemStatus: 'healthy',
  ioWaitPercent: 0.4,
  lastSmartScan: 'I dag kl. 14:32'
};

export const INITIAL_CONTACTS: SeniorContact[] = [
  {
    id: '1',
    name: 'Demo-pårørende A',
    relation: 'Pårørende / Primærkontakt',
    phone: 'Ikke oppgitt (demo)',
    avatarBg: 'bg-emerald-600',
    initials: 'IN',
    statusBadge: 'Tilgjengelig nå'
  },
  {
    id: '2',
    name: 'Demo-pårørende B',
    relation: 'Pårørende',
    phone: 'Ikke oppgitt (demo)',
    avatarBg: 'bg-blue-600',
    initials: 'HE',
    statusBadge: 'Tilgjengelig (på jobb)'
  },
  {
    id: '3',
    name: 'Hjemmesykepleien',
    relation: 'Vakttelefon Sone Sentrum',
    phone: 'Ikke oppgitt (demo)',
    avatarBg: 'bg-teal-700',
    initials: 'HS',
    statusBadge: 'Døgnbemannet vakt'
  }
];

export const INITIAL_EMERGENCY_MESSAGES: EmergencyMessageEvent[] = [
  {
    id: 'msg-1',
    recipientId: '1',
    recipientName: 'Demo-pårørende A',
    message: 'Jeg har tatt morgenmedisin og har det fint.',
    timestamp: 'I dag kl. 08:35',
    status: 'delivered',
    isEmergency: false
  }
];

export const INITIAL_MEDICATIONS: MedicationItem[] = [
  {
    id: 'm1',
    name: 'Morgenmedisin (Dosett rom 1)',
    time: '08:30',
    dosage: '1 tabl. Blodtrykk + Vitamin D',
    taken: true,
    importantNote: 'Tas med et glass vann'
  },
  {
    id: 'm2',
    name: 'Middagsmedisin (Dosett rom 2)',
    time: '13:30',
    dosage: '1 tabl. Kalsium',
    taken: true
  },
  {
    id: 'm3',
    name: 'Kveldsmedisin (Dosett rom 3)',
    time: '20:00',
    dosage: '1 tabl. Hjertemedisin',
    taken: false,
    importantNote: 'Viktig: Ta før sengetid'
  }
];

export const INITIAL_SCHEDULE: ScheduleEvent[] = [
  {
    id: 's1',
    time: '11:00',
    title: 'Hjemmetjenesten besøk',
    subtitle: 'Morgentilsyn og sjekk av sårbandasje',
    type: 'visit'
  },
  {
    id: 's2',
    time: '13:30',
    title: 'Middagsmedisin',
    subtitle: 'Ta tablett sammen med lunsj',
    type: 'medicine'
  },
  {
    id: 's3',
    time: '16:00',
    title: 'Kaffebesøk av Ingrid',
    subtitle: 'Datteren din kommer innom med ferske boller',
    type: 'visit'
  }
];

export const INITIAL_CLIMATE: IndoorClimate = {
  temp: 21.8,
  humidity: 42,
  co2: 610,
  airQualityText: 'God'
};

export const INITIAL_VITALS: HealthVitals = {
  heartRateBpm: 68,
  spo2Percent: 97,
  lastMovementMinutesAgo: 4,
  fallSensorArmed: true,
  fallDetected: false,
  sleepHours: 7.5,
  presenceRoom: 'Stue (Godstol)',
  stepsToday: 1840
};

export const INITIAL_LOGS: SystemLogEntry[] = [
  {
    id: 'l1',
    timestamp: '14:32:05',
    level: 'info',
    source: 'STORAGE_DAEMON',
    message: 'Periodisk S.M.A.R.T-analyse fullført: /dev/mmcblk0 rapporterer 26% levetid gjenværende.'
  },
  {
    id: 'l2',
    timestamp: '14:30:12',
    level: 'warn',
    source: 'STORAGE_DAEMON',
    message: 'Høy I/O-skrivebelastning observert på SD-kort (240 KB/s vedvarende logging uten log2ram).'
  },
  {
    id: 'l3',
    timestamp: '14:28:44',
    level: 'success',
    source: 'SENIOR_UI',
    message: 'Senior trykket "Jeg har det bra". Status oppdatert for pårørende og vaktrom.'
  },
  {
    id: 'l4',
    timestamp: '14:15:00',
    level: 'info',
    source: 'FALL_RADAR',
    message: 'mmWave sensor bekrefter normal stående/sittende holdning i stue. Ingen fall registrert.'
  },
  {
    id: 'l5',
    timestamp: '13:30:20',
    level: 'success',
    source: 'HEALTH_BLE',
    message: 'Smart dosett lokk åpnet og lukket for kammer 2. Registrert som inntatt.'
  }
];

export const INITIAL_ALERTS: VisualAlert[] = [
  {
    id: 'alert-hw-1',
    severity: 'warning',
    title: 'Maskinvarevarsel: MicroSD slitasje på 26% levetid',
    description: 'Aktivt minnekort /dev/mmcblk0 har nådd 18.4 av 25 TBW. Risiko for korrupsjon ved strømbrudd. Anbefalt: Bytt til NVMe SSD eller aktiver log2ram.',
    timestamp: 'I dag kl. 14:32',
    source: 'hardware',
    actionLabel: 'Sjekk lagringshelse',
    targetTab: 'storage',
    dismissed: false
  },
  {
    id: 'alert-med-1',
    severity: 'reminder',
    title: 'Medisinpåminnelse: Kveldsmedisin gjenstår (kl. 20:00)',
    description: 'Dosett rom 3 (Melatonin) er ikke registrert inntatt ennå.',
    timestamp: 'I dag kl. 14:00',
    source: 'medication',
    actionLabel: 'Se medisiner',
    targetTab: 'senior',
    dismissed: false
  }
];

export const USER_PROFILES: Record<string, UserProfile> = {
  senior: {
    id: 'usr-senior',
    role: 'senior',
    name: 'Fiktiv demo-person',
    title: 'Beboer / Bruker',
    securityLevel: 'Seniormodus (demo; ikke tilgangskontroll)',
    sessionExpires: 'Aktiv enhet'
  },
  relative: {
    id: 'usr-relative',
    role: 'relative',
    name: 'Demo-pårørende A',
    title: 'Pårørende / Datter',
    securityLevel: 'Demo-rolle; BankID ikke tilkoblet',
    sessionExpires: '28 minutter'
  },
  nurse: {
    id: 'usr-nurse',
    role: 'nurse',
    name: 'Demo-sykepleier',
    title: 'Hjemmesykepleien Sone Sentrum',
    hprNumber: 'DEMO-NOT-REAL',
    securityLevel: 'Demo-rolle; HelseID ikke tilkoblet',
    sessionExpires: '12 minutter'
  },
  admin: {
    id: 'usr-admin',
    role: 'admin',
    name: 'Demo-administrator',
    title: 'Demo-administrator',
    securityLevel: 'Demo-rolle; ingen YubiKey/mTLS-verifisering',
    sessionExpires: '8 minutter'
  }
};

export const INITIAL_SECURITY_STATUS: SecurityStatus = {
  encryptionAtRest: false, // Ikke målt av prototypen
  encryptionInTransit: false, // Ikke målt av prototypen
  tpmAttestation: 'WARNING',
  secureBootEnabled: false,
  kioskPinLocked: false,
  normenCompliancePercent: 0, // Ikke vurdert; 0 er kun en teknisk placeholder
  tamperSensorStatus: 'NOT_VERIFIED',
  offlineZeroLeakMode: false
};

export const INITIAL_CONSENTS: ConsentItem[] = [
  {
    id: 'consent-radar',
    title: 'mmWave Fallradar og Tilstedeværelse',
    description: 'Demo av en tenkt fallradar. Ingen faktisk sensor er koblet til og ingen fall eller inaktivitet detekteres.',
    category: 'sikkerhet',
    granted: true,
    legalBasis: 'Demo-placeholder — behandlingsgrunnlag er ikke juridisk vurdert',
    dataRetentionDays: 1, // Edge minimerer, rådata slettes etter 24 timer
    lastUpdated: '12.01.2026'
  },
  {
    id: 'consent-relative-sharing',
    title: 'Deling av trygghetsstatus med pårørende (Ingrid & Henrik)',
    description: 'Illustrerer mulig deling av demo-status. Ingen kontoer, reelle mottakere eller datadeling er tilkoblet.',
    category: 'pårørende',
    granted: true,
    legalBasis: 'Demo-placeholder — behandlingsgrunnlag er ikke juridisk vurdert',
    dataRetentionDays: 30,
    lastUpdated: '15.01.2026'
  },
  {
    id: 'consent-vitals-nursing',
    title: 'Helsedata & Dosett-status til Hjemmesykepleien',
    description: 'Illustrerer et mulig arbeidsforløp. Ingen data sendes til VKP, EPJ eller Norsk Helsenett.',
    category: 'helse',
    granted: true,
    legalBasis: 'Demo-placeholder — juridisk grunnlag og integrasjon er ikke vurdert',
    dataRetentionDays: 365,
    lastUpdated: '10.01.2026'
  },
  {
    id: 'consent-hardware-telemetry',
    title: 'Maskinvare-telemetri (S.M.A.R.T. og slitasjeovervåking)',
    description: 'Pseudonymisert feilsøking for å forhindre datakorrupsjon og krasj på grunn av minnekort/SSD-slitasje.',
    category: 'telemetri',
    granted: true,
    legalBasis: 'Demo-placeholder — behandlingsgrunnlag er ikke juridisk vurdert',
    dataRetentionDays: 90,
    lastUpdated: '01.01.2026'
  }
];

export const INITIAL_AUDIT_LOG: AuditLogEntry[] = [
  {
    id: 'aud-001',
    timestamp: 'I dag kl. 14:45:10',
    actorName: 'Demo-sykepleier',
    actorRole: 'nurse',
    actorHprNumber: 'HPR-9482103',
    action: 'READ',
    resource: 'MEDISINER',
    justification: 'Kontroll av ettermiddagsdose og dosett-integritet',
    ipAddress: 'Ikke samlet inn (demo)',
    verified: false
  },
  {
    id: 'aud-002',
    timestamp: 'I dag kl. 14:30:15',
    actorName: 'Demo-pårørende A',
    actorRole: 'relative',
    action: 'READ',
    resource: 'KONTAKTER',
    justification: 'Innsyn i daglig trygghetsinnsjekk og kalender',
    ipAddress: 'Ikke samlet inn (demo)',
    verified: false
  },
  {
    id: 'aud-003',
    timestamp: 'I dag kl. 13:12:00',
    actorName: 'Demo-administrator',
    actorRole: 'admin',
    action: 'READ',
    resource: 'SYSTEM_CONFIG',
    justification: 'S.M.A.R.T.-helsekontroll og slitasjeinspeksjon for lagring',
    ipAddress: 'Ikke samlet inn (demo)',
    verified: false
  },
  {
    id: 'aud-004',
    timestamp: 'I går kl. 19:20:00',
    actorName: 'Demo-sykepleier',
    actorRole: 'nurse',
    actorHprNumber: 'HPR-9482103',
    action: 'UPDATE',
    resource: 'MEDISINER',
    justification: 'Oppdatert kveldsdose for dosett rom 3 (Melatonin)',
    ipAddress: 'Ikke samlet inn (demo)',
    verified: false
  }
];

export const INITIAL_BATTERIES: SeniorDeviceBattery[] = [
  {
    id: 'bat-pendant',
    name: 'Trygghetsknapp rundt halsen',
    subtitle: 'Det røde trygghetssmykket du har på deg',
    location: 'Bæres på kroppen',
    percentage: 88,
    state: 'good',
    stateLabel: 'Mye strøm (88%)',
    advice: 'Alt er i orden. Du trenger ikke gjøre noe nå.',
    iconType: 'pendant',
    lastChecked: 'Sjekket for 3 minutter siden'
  },
  {
    id: 'bat-watch',
    name: 'Trygghetsarmbånd (Klokken)',
    subtitle: 'Klokken på venstre arm med pulsmåler og fallsensor',
    location: 'På armen',
    percentage: 22,
    state: 'warning',
    stateLabel: 'Må lades i kveld (22%)',
    advice: 'Husk å sette klokken i laderen ved nattbordet før du legger deg.',
    chargingInstructions: 'Legg klokken på den magnetiske ladeplaten på nattbordet. Det lyser grønt når den lader.',
    iconType: 'watch',
    lastChecked: 'Sjekket for 1 minutt siden'
  },
  {
    id: 'bat-screen',
    name: 'Trygghetsskjerm på veggen',
    subtitle: 'Skjermen du ser på nå',
    location: 'I stuen',
    percentage: 100,
    state: 'plugged',
    stateLabel: 'Koblet til strøm (100%)',
    advice: 'Skjermen får fast strøm fra veggen og er alltid på.',
    iconType: 'screen',
    lastChecked: 'Fast tilkobling OK'
  },
  {
    id: 'bat-doorsensor',
    name: 'Dørsensor i yttergangen',
    subtitle: 'Passer på at inngangsdøren er trygt lukket',
    location: 'Ytterdøren',
    percentage: 94,
    state: 'good',
    stateLabel: 'Fullt batteri (94%)',
    advice: 'Batteriet varer i minst 2 år. Pleietjenesten bytter dette ved behov.',
    iconType: 'sensor',
    lastChecked: 'Sjekket i dag kl. 12:00'
  },
  {
    id: 'bat-fallradar',
    name: 'Fallradar i taket',
    subtitle: 'Passer på deg automatisk uten kamera',
    location: 'I taket over sengen',
    percentage: 100,
    state: 'plugged',
    stateLabel: 'Fast strøm (Aktiv)',
    advice: 'Fungerer hele døgnet. Krever ingen batterier eller lading.',
    iconType: 'radar',
    lastChecked: 'Signal OK'
  }
];

