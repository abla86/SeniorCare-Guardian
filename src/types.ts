export type StorageMedium = 'microSD' | 'nvmeSSD';

export interface StorageMetrics {
  medium: StorageMedium;
  modelName: string;
  totalCapacityGB: number;
  tbwWritten: number;
  tbwRating: number;
  wearLevelingPercentage: number; // 0 to 100% health remaining
  badBlocksCount: number;
  reallocatedSectors: number;
  readOnlyRisk: 'low' | 'moderate' | 'critical';
  tempCelsius: number;
  writeRateKBps: number;
  avgDailyWritesMB: number;
  estimatedRemainingDays: number;
  log2ramEnabled: boolean;
  walModeEnabled: boolean;
  filesystemStatus: 'healthy' | 'warning' | 'read_only' | 'corrupted';
  ioWaitPercent: number;
  lastSmartScan: string;
}

export interface SeniorContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  avatarBg: string;
  initials: string;
  statusBadge?: string;
}

export interface EmergencyMessageEvent {
  id: string;
  recipientId: string;
  recipientName: string;
  message: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  isEmergency: boolean;
}

export interface MedicationItem {
  id: string;
  name: string;
  time: string;
  dosage: string;
  taken: boolean;
  importantNote?: string;
}

export interface ScheduleEvent {
  id: string;
  time: string;
  title: string;
  subtitle: string;
  type: 'visit' | 'medicine' | 'activity' | 'meal';
}

export interface IndoorClimate {
  temp: number;
  humidity: number;
  co2: number;
  airQualityText: 'Utmerket' | 'God' | 'Bør luftes';
}

export interface HealthVitals {
  heartRateBpm: number;
  spo2Percent: number;
  lastMovementMinutesAgo: number;
  fallSensorArmed: boolean;
  fallDetected: boolean;
  sleepHours: number;
  presenceRoom: string;
  stepsToday: number;
}

export type LogLevel = 'info' | 'warn' | 'error' | 'success';
export type LogSource = 'STORAGE_DAEMON' | 'HEALTH_BLE' | 'SENIOR_UI' | 'FALL_RADAR' | 'PLEIE_NOTAT' | 'VARSELSYSTEM';

export interface SystemLogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  source: LogSource;
  message: string;
  details?: string;
}

export interface VisualAlert {
  id: string;
  severity: 'critical' | 'warning' | 'reminder' | 'info';
  title: string;
  description: string;
  timestamp: string;
  source: 'fall' | 'hardware' | 'emergency' | 'medication' | 'climate';
  actionLabel?: string;
  targetTab?: 'senior' | 'storage' | 'health';
  dismissed?: boolean;
}

export type UserRole = 'senior' | 'relative' | 'nurse' | 'admin';

export interface UserProfile {
  id: string;
  role: UserRole;
  name: string;
  title: string;
  hprNumber?: string;
  securityLevel: string; // f.eks. "BankID Nivå 4 / Buypass"
  sessionExpires: string;
}

export interface ConsentItem {
  id: string;
  title: string;
  description: string;
  category: 'helse' | 'sikkerhet' | 'pårørende' | 'telemetri';
  granted: boolean;
  legalBasis: string; // f.eks. "GDPR Art. 6(1)(a) Samtykke" el. "Helsepersonelloven § 21"
  dataRetentionDays: number;
  lastUpdated: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  actorHprNumber?: string;
  action: 'READ' | 'EXPORT' | 'UPDATE' | 'DELETE' | 'EMERGENCY_OVERRIDE';
  resource: 'MEDISINER' | 'VITALE_TEGN' | 'FALLRADAR_LOGG' | 'KONTAKTER' | 'SYSTEM_CONFIG';
  justification: string;
  ipAddress: string;
  verified: boolean;
}

export interface SecurityStatus {
  encryptionAtRest: boolean; // LUKS2 AES-XTS-256
  encryptionInTransit: boolean; // TLS 1.3 + mTLS med HelseID
  tpmAttestation: 'VERIFIED' | 'WARNING' | 'FAILED';
  secureBootEnabled: boolean;
  kioskPinLocked: boolean;
  normenCompliancePercent: number; // e.g. 98%
  tamperSensorStatus: 'OK_SEALED' | 'TAMPER_DETECTED';
  offlineZeroLeakMode: boolean;
}

export interface SeniorDeviceBattery {
  id: string;
  name: string; // Tittel forståelig for senior, f.eks. "Trygghetsknapp rundt halsen"
  subtitle: string; // f.eks. "Det lille smykket du har på deg"
  location: string; // f.eks. "Bæres på kroppen"
  percentage: number; // 0 - 100
  state: 'good' | 'warning' | 'critical' | 'charging' | 'plugged';
  stateLabel: string; // f.eks. "Mye strøm (88%)" eller "Må lades i kveld (22%)"
  advice: string; // Enkelt råd tilpasset eldre, f.eks. "Du trenger ikke gjøre noe nå."
  chargingInstructions?: string; // F.eks. "Sett klokken i laderen ved nattbordet når du legger deg."
  iconType: 'pendant' | 'watch' | 'screen' | 'sensor' | 'radar';
  isCharging?: boolean;
  lastChecked: string;
}

