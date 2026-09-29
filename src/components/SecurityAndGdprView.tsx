import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Key, 
  Eye, 
  FileText, 
  Download, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  UserCheck, 
  HardDrive, 
  Fingerprint, 
  Check, 
  X, 
  AlertOctagon, 
  Clock, 
  HelpCircle, 
  ExternalLink,
  Search,
  FileSpreadsheet,
  ToggleLeft,
  ToggleRight,
  Shield,
  Smartphone,
  Cpu
} from 'lucide-react';
import { 
  UserProfile, 
  UserRole, 
  ConsentItem, 
  AuditLogEntry, 
  SecurityStatus,
  SystemLogEntry,
  HealthVitals,
  MedicationItem
} from '../types';

interface SecurityAndGdprViewProps {
  currentRole: UserRole;
  userProfiles: Record<string, UserProfile>;
  securityStatus: SecurityStatus;
  consents: ConsentItem[];
  auditLog: AuditLogEntry[];
  vitals: HealthVitals;
  medications: MedicationItem[];
  kioskPin: string;
  isKioskLocked: boolean;
  onChangeRole: (newRole: UserRole) => void;
  onToggleConsent: (consentId: string) => void;
  onToggleKioskLock: (enable: boolean) => void;
  onExportGdprData: () => void;
  onExecuteCryptoErase: () => void;
  onAddAuditEntry: (action: 'READ' | 'EXPORT' | 'UPDATE' | 'DELETE' | 'EMERGENCY_OVERRIDE', resource: 'MEDISINER' | 'VITALE_TEGN' | 'FALLRADAR_LOGG' | 'KONTAKTER' | 'SYSTEM_CONFIG', justification: string) => void;
}

export const SecurityAndGdprView: React.FC<SecurityAndGdprViewProps> = ({
  currentRole,
  userProfiles,
  securityStatus,
  consents,
  auditLog,
  vitals,
  medications,
  kioskPin,
  isKioskLocked,
  onChangeRole,
  onToggleConsent,
  onToggleKioskLock,
  onExportGdprData,
  onExecuteCryptoErase,
  onAddAuditEntry
}) => {
  // Navigation sub-tab inside security
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'consent' | 'audit' | 'hardware' | 'erasure'>('overview');

  // Role switch dialog state
  const [showRoleModal, setShowRoleModal] = useState<boolean>(false);
  const [targetRole, setTargetRole] = useState<UserRole>(currentRole);
  const [rolePinInput, setRolePinInput] = useState<string>('');
  const [rolePinError, setRolePinError] = useState<string>('');

  // Erasure confirmation modal
  const [showErasureModal, setShowErasureModal] = useState<boolean>(false);
  const [erasureConfirmationText, setErasureConfirmationText] = useState<string>('');

  // Manual audit log dialog
  const [showAuditModal, setShowAuditModal] = useState<boolean>(false);
  const [auditAction, setAuditAction] = useState<'READ' | 'EXPORT' | 'UPDATE' | 'DELETE' | 'EMERGENCY_OVERRIDE'>('READ');
  const [auditResource, setAuditResource] = useState<'MEDISINER' | 'VITALE_TEGN' | 'FALLRADAR_LOGG' | 'KONTAKTER' | 'SYSTEM_CONFIG'>('VITALE_TEGN');
  const [auditJustification, setAuditJustification] = useState<string>('');

  // Search in audit log
  const [auditSearch, setAuditSearch] = useState<string>('');

  // Active user profile
  const activeProfile = userProfiles[currentRole] || userProfiles['senior'];

  // Handle role change verification
  const handleConfirmRoleChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetRole === 'admin' || targetRole === 'nurse') {
      if (rolePinInput !== '1234' && rolePinInput !== kioskPin) {
        setRolePinError('Ugyldig sikkerhetskode. For demo: Tast "1234"');
        return;
      }
    }
    onChangeRole(targetRole);
    setRolePinInput('');
    setRolePinError('');
    setShowRoleModal(false);
  };

  // Handle manual audit submission
  const handleSubmitAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditJustification.trim()) return;
    onAddAuditEntry(auditAction, auditResource, auditJustification.trim());
    setAuditJustification('');
    setShowAuditModal(false);
  };

  // Filtered audit trail
  const filteredAudit = auditLog.filter(item => {
    if (!auditSearch) return true;
    const q = auditSearch.toLowerCase();
    return item.actorName.toLowerCase().includes(q) ||
      item.justification.toLowerCase().includes(q) ||
      item.resource.toLowerCase().includes(q) ||
      item.action.toLowerCase().includes(q);
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 font-sans">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-900 text-white flex items-center justify-center shadow-md">
              <ShieldCheck className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  Sikkerhet, GDPR &amp; Pasientvern
                </h1>
                <span className="bg-emerald-100 text-emerald-900 text-xs font-black px-2.5 py-1 rounded-full border border-emerald-300">
                  Normen 6.0 godkjent
                </span>
              </div>
              <p className="text-slate-600 text-sm sm:text-base mt-0.5">
                Helhetlig beskyttelse av pasientdata i alle ledd: maskinvare, transport, samtykker og lovpålagt revisjon.
              </p>
            </div>
          </div>
        </div>

        {/* Current Active Role Badge & Switcher */}
        <div className="flex items-center gap-3 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
            <UserCheck className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Aktiv innlogget rolle:
            </div>
            <div className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <span>{activeProfile.name}</span>
              <span className="text-xs font-semibold text-slate-500">({activeProfile.title})</span>
            </div>
          </div>
          <button
            id="btn-switch-role"
            onClick={() => {
              setTargetRole(currentRole);
              setRolePinError('');
              setShowRoleModal(true);
            }}
            className="ml-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-extrabold px-3.5 py-2 rounded-xl transition-all shadow-xs"
          >
            Bytt rolle
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-8 border-b border-slate-200 pb-3">
        <button
          id="subtab-security-overview"
          onClick={() => setActiveSubTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-sm transition-all ${
            activeSubTab === 'overview'
              ? 'bg-indigo-900 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Sikkerhetsstatus (Alle ledd)</span>
        </button>

        <button
          id="subtab-security-consent"
          onClick={() => setActiveSubTab('consent')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-sm transition-all ${
            activeSubTab === 'consent'
              ? 'bg-indigo-900 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Samtykkestyring (GDPR)</span>
          <span className="bg-indigo-100 text-indigo-900 text-[11px] font-bold px-2 py-0.5 rounded-full">
            {consents.filter(c => c.granted).length}/{consents.length}
          </span>
        </button>

        <button
          id="subtab-security-audit"
          onClick={() => setActiveSubTab('audit')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-sm transition-all ${
            activeSubTab === 'audit'
              ? 'bg-indigo-900 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Revisjonslogg (Audit Trail)</span>
          <span className="bg-slate-200 text-slate-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
            {auditLog.length}
          </span>
        </button>

        <button
          id="subtab-security-hardware"
          onClick={() => setActiveSubTab('hardware')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-sm transition-all ${
            activeSubTab === 'hardware'
              ? 'bg-indigo-900 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>Maskinvare &amp; Kiosk-sikring</span>
        </button>

        <button
          id="subtab-security-erasure"
          onClick={() => setActiveSubTab('erasure')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-sm transition-all ${
            activeSubTab === 'erasure'
              ? 'bg-rose-700 text-white shadow-md'
              : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
          }`}
        >
          <Trash2 className="w-4 h-4" />
          <span>Innsyn &amp; Krypto-sletting</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. OVERVIEW: SIKKERHET I ALLE LEDD */}
      {/* ========================================================================= */}
      {activeSubTab === 'overview' && (
        <div className="space-y-8">
          
          {/* Key Security Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Pillar 1: Encryption At Rest */}
            <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <HardDrive className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                    Aktiv
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  Kryptering i hvile (At-Rest)
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  LUKS2 med <strong>AES-XTS-256</strong>. Disknøkkel låses opp via TPM 2.0-brikke. Hvis minnekort/SSD tas ut, kan data ikke leses.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Normen § 4.3 Tilfredsstilt</span>
              </div>
            </div>

            {/* Pillar 2: Encryption In Transit */}
            <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center">
                    <Lock className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-300">
                    TLS 1.3 mTLS
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  Transportlagssikkerhet
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Gjensidig autentisering (mTLS) med HelseID-klientsertifikat mot <strong>Norsk Helsenett (VKP)</strong>. Ingen åpne innkommende porter.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>End-to-End Kryptering</span>
              </div>
            </div>

            {/* Pillar 3: Hardware Integrity & TPM */}
            <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-purple-100 text-purple-900 border border-purple-300">
                    TPM 2.0 PCR OK
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  Maskinvareintegritet
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Kryptografisk målt oppstart (Measured Boot). Oppdager manipulert firmware eller uautoriserte boot-loaders.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Anti-Tamper Beskyttelse</span>
              </div>
            </div>

            {/* Pillar 4: Privacy & Zero Cloud Leak */}
            <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                    <Eye className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-teal-100 text-teal-900 border border-teal-300">
                    Edge AI / Ingen Video
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  Dataminimering (GDPR)
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  mmWave radarbølger tolkes lokalt på enheten. Ingen videokamera i boligen, og kun utledede hendelser (f.eks. «fall detektert») overføres.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Personvern by Design</span>
              </div>
            </div>

          </div>

          {/* Detailed Security Architecture: Ledd for Ledd */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-lg">
            <h2 className="text-2xl font-black text-slate-900 mb-2">
              Sikkerhetsarkitektur i alle ledd («Defense-in-Depth»)
            </h2>
            <p className="text-sm text-slate-600 mb-6 max-w-3xl">
              For at velferdsteknologi skal være godkjent for bruk i private hjem og omsorgsboliger, må sikkerheten være vanntett fra den fysiske sensoren til kommunens EPJ-system.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Ledd 1 & 2 */}
              <div className="space-y-4">
                {/* Ledd 1: Fysisk sensor og maskinvare */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="w-7 h-7 rounded-lg bg-indigo-900 text-white text-xs font-black flex items-center justify-center">
                      1
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Fysisk enhet &amp; Lagringsmedium
                    </h3>
                  </div>
                  <ul className="text-xs text-slate-700 space-y-1.5 pl-9 list-disc">
                    <li><strong>NVMe SSD med overprovisjonering:</strong> Beskytter mot plutselig filsystem-korrupsjon som rammer vanlige MicroSD-kort.</li>
                    <li><strong>TPM 2.0 Cryptographic Root of Trust:</strong> Nøkler lagres aldri i klartekst på filsystemet.</li>
                    <li><strong>Chassis Tamper Switch:</strong> Varsler umiddelbart hvis noen åpner dekselet eller kobler til eksterne USB-nøkler.</li>
                  </ul>
                </div>

                {/* Ledd 2: Operativsystem & Kant-programvare */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="w-7 h-7 rounded-lg bg-indigo-900 text-white text-xs font-black flex items-center justify-center">
                      2
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Operativsystem &amp; Lokal lagring
                    </h3>
                  </div>
                  <ul className="text-xs text-slate-700 space-y-1.5 pl-9 list-disc">
                    <li><strong>Skrivebeskyttet rotfilsystem (Read-Only RootFS):</strong> Hindrer ondsinnet endring av systemfiler.</li>
                    <li><strong>log2ram &amp; ZRAM:</strong> Logger samles i kryptert minne før de synkroniseres kontrollert, for å unngå overskriving og slitasje.</li>
                    <li><strong>Sandboxed systemd-tjenester:</strong> Hver sensor-tjeneste kjører i egne isolerte cgroups uten root-rettigheter.</li>
                  </ul>
                </div>
              </div>

              {/* Ledd 3 & 4 */}
              <div className="space-y-4">
                {/* Ledd 3: Kommunikasjon og Transport */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="w-7 h-7 rounded-lg bg-indigo-900 text-white text-xs font-black flex items-center justify-center">
                      3
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Nettverk, Transport &amp; Helsenett
                    </h3>
                  </div>
                  <ul className="text-xs text-slate-700 space-y-1.5 pl-9 list-disc">
                    <li><strong>mTLS mot VKP (Velferdsteknologisk knutepunkt):</strong> Data utveksles over sikret VPN på Norsk Helsenett.</li>
                    <li><strong>Ingen åpne lytteporter på Internett:</strong> Enheten initierer kun utgående sikrede WebSockets / MQTT-forbindelser.</li>
                    <li><strong>Bluetooth LE 5.3 med OOB-kryptering:</strong> Beskytter måledata fra smart dosett og pulssensorer mot sniffing.</li>
                  </ul>
                </div>

                {/* Ledd 4: Brukere, Roller og GDPR */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="w-7 h-7 rounded-lg bg-indigo-900 text-white text-xs font-black flex items-center justify-center">
                      4
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Brukerflate, Roller &amp; Lovpålagt Innsyn
                    </h3>
                  </div>
                  <ul className="text-xs text-slate-700 space-y-1.5 pl-9 list-disc">
                    <li><strong>Seniormodus med Kiosk PIN-sikring:</strong> Forhindrer utilsiktede endringer for beboer.</li>
                    <li><strong>Rollebasert tilgang (RBAC):</strong> Pårørende ser kun trygghetsstatus – aldri konfidensielle journalnotater.</li>
                    <li><strong>Spesifisert revisjonsspor (Pasientjournalloven § 22a):</strong> Alle helsepersonelloppslag loggføres uutslettelig.</li>
                  </ul>
                </div>
              </div>

            </div>
          </section>

          {/* Quick Actions Bar */}
          <div className="bg-indigo-950 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div>
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-black uppercase tracking-wider mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Normen 6.0 samsvarsjekk utført</span>
              </div>
              <h3 className="text-2xl font-black">
                Sikkerhetsgrad: 98% (Optimal driftstilstand)
              </h3>
              <p className="text-indigo-200 text-sm max-w-2xl mt-1">
                Kryptering i hvile, transportkryptering og revisjonslogg er aktiv. Samtykker er registrert og verifisert.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                id="btn-quick-export-gdpr"
                onClick={onExportGdprData}
                className="bg-white hover:bg-slate-100 text-slate-950 font-extrabold text-sm px-5 py-3 rounded-xl transition-all shadow-md flex items-center gap-2"
              >
                <Download className="w-4 h-4 text-indigo-700" />
                <span>Eksporter pasientdata (GDPR Art. 15)</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CONSENT: SAMTYKRESTYRING (GDPR ART. 6 & 7) */}
      {/* ========================================================================= */}
      {activeSubTab === 'consent' && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-6">
            <div>
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-7 h-7 text-indigo-700" />
                <h2 className="text-2xl font-black text-slate-900">
                  Samtykkeoversikt for Kari Nordmann (82)
                </h2>
              </div>
              <p className="text-slate-600 text-sm mt-1 max-w-3xl">
                I henhold til GDPR Art. 7 og Pasient- og brukerrettighetsloven § 4-1 kan beboer eller verge når som helst aktivere eller tilbakekalle spesifikke samtykker med umiddelbar virkning.
              </p>
            </div>

            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl px-4 py-3 text-right">
              <div className="text-[11px] font-bold text-indigo-800 uppercase">Aktive samtykker:</div>
              <div className="text-2xl font-black text-indigo-950">
                {consents.filter(c => c.granted).length} av {consents.length}
              </div>
            </div>
          </div>

          {/* Consents List */}
          <div className="space-y-4">
            {consents.map(item => (
              <div
                key={item.id}
                id={`consent-row-${item.id}`}
                className={`rounded-2xl p-5 border-2 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  item.granted 
                    ? 'bg-slate-50 border-indigo-200 shadow-xs' 
                    : 'bg-rose-50/50 border-rose-200'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    item.granted ? 'bg-indigo-900 text-white' : 'bg-slate-300 text-slate-600'
                  }`}>
                    {item.granted ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> : <X className="w-6 h-6 text-slate-600" />}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        item.category === 'sikkerhet' ? 'bg-amber-100 text-amber-900' :
                        item.category === 'helse' ? 'bg-emerald-100 text-emerald-900' :
                        item.category === 'pårørende' ? 'bg-blue-100 text-blue-900' :
                        'bg-purple-100 text-purple-900'
                      }`}>
                        Kategori: {item.category}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        Oppbevaring: {item.dataRetentionDays} dager
                      </span>
                      <span className="text-xs text-slate-400">
                        Sist oppdatert: {item.lastUpdated}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-slate-900 mt-1">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-0.5 max-w-2xl leading-relaxed">
                      {item.description}
                    </p>

                    <div className="mt-2 text-[11px] font-mono text-slate-500 bg-white inline-block px-2.5 py-1 rounded-lg border border-slate-200">
                      Behandlingsgrunnlag: {item.legalBasis}
                    </div>
                  </div>
                </div>

                {/* Interactive Toggle Switch */}
                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  <span className="text-xs font-extrabold text-slate-700">
                    {item.granted ? 'Aktivt samtykke' : 'Tilbakekalt'}
                  </span>
                  <button
                    id={`toggle-consent-${item.id}`}
                    onClick={() => onToggleConsent(item.id)}
                    className={`w-14 h-8 rounded-full transition-colors relative p-1 cursor-pointer ${
                      item.granted ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                    title={item.granted ? 'Klikk for å tilbakekalle' : 'Klikk for å godkjenne'}
                  >
                    <div className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                      item.granted ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Consent note */}
          <div className="mt-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <p>
              <strong>Merk ved tilbakekalling:</strong> Dersom samtykke til fallradar oppheves, vil sensoren deaktiveres lokalt og ingen bevegelsesdata overvåkes. Nødalarmknappen forblir alltid tilgjengelig for manuell bruk.
            </p>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 3. AUDIT TRAIL: LOVPÅLAGT REVISJONSLOGG */}
      {/* ========================================================================= */}
      {activeSubTab === 'audit' && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-6">
            <div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-7 h-7 text-indigo-700" />
                <h2 className="text-2xl font-black text-slate-900">
                  Lovpålagt Innsyns- og Revisjonslogg
                </h2>
              </div>
              <p className="text-slate-600 text-sm mt-1 max-w-3xl">
                Pasientjournalloven § 22a &amp; GDPR Art. 30 krever uutslettelig registrering av hvem som har lest eller endret pasientdata, med tidspunkt og tjenstlig begrunnelse.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                id="btn-open-audit-entry-modal"
                onClick={() => setShowAuditModal(true)}
                className="bg-indigo-900 hover:bg-indigo-800 active:scale-95 text-white font-extrabold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <span>Registrer oppslag / Tilsyn</span>
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative mb-6">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={auditSearch}
              onChange={(e) => setAuditSearch(e.target.value)}
              placeholder="Søk i revisjonsspor (aktør, HPR-nr, handling, formål)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-indigo-600 focus:outline-none"
            />
          </div>

          {/* Audit Trail Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-black border-b border-slate-200 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Tidspunkt</th>
                    <th className="py-3 px-4">Aktør &amp; Legitimasjon</th>
                    <th className="py-3 px-4">Rolle</th>
                    <th className="py-3 px-4">Handling</th>
                    <th className="py-3 px-4">Ressurs</th>
                    <th className="py-3 px-4">Tjenstlig begrunnelse</th>
                    <th className="py-3 px-4 text-right">Integritet</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredAudit.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-500 font-semibold">
                        Ingen revisjonshendelser funnet for valgt søk.
                      </td>
                    </tr>
                  ) : (
                    filteredAudit.map(entry => (
                      <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                          {entry.timestamp}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          <div>{entry.actorName}</div>
                          {entry.actorHprNumber && (
                            <div className="text-[10px] font-mono text-indigo-700 font-semibold">
                              {entry.actorHprNumber}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            entry.actorRole === 'nurse' ? 'bg-emerald-100 text-emerald-900' :
                            entry.actorRole === 'relative' ? 'bg-blue-100 text-blue-900' :
                            entry.actorRole === 'admin' ? 'bg-purple-100 text-purple-900' :
                            'bg-slate-200 text-slate-800'
                          }`}>
                            {entry.actorRole}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            entry.action === 'READ' ? 'bg-slate-100 text-slate-800 border border-slate-300' :
                            entry.action === 'EXPORT' ? 'bg-indigo-100 text-indigo-900 border border-indigo-300' :
                            entry.action === 'DELETE' ? 'bg-rose-100 text-rose-900 border border-rose-300' :
                            'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}>
                            {entry.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">
                          {entry.resource}
                        </td>
                        <td className="py-3 px-4 text-slate-700 max-w-xs">
                          {entry.justification}
                          <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                            IP: {entry.ipAddress}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <Check className="w-3 h-3" />
                            Signert
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 4. HARDWARE & KIOSK SIKRING */}
      {/* ========================================================================= */}
      {activeSubTab === 'hardware' && (
        <div className="space-y-6">
          
          {/* Senior Kiosk Lock Toggle Banner */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${
                isKioskLocked ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-slate-950'
              }`}>
                {isKioskLocked ? <Lock className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black text-slate-900">
                    Seniormodus PIN-lås (Kiosk Mode)
                  </h2>
                  <span className={`text-xs font-black px-2.5 py-1 rounded-full uppercase ${
                    isKioskLocked ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {isKioskLocked ? 'Aktiv (Beskyttet)' : 'Deaktivert (Åpen)'}
                  </span>
                </div>
                <p className="text-slate-600 text-sm mt-1 max-w-2xl">
                  Når PIN-lås er aktivert, kan ikke beboer eller uautoriserte personer navigere bort fra Seniormodus eller endre systeminnstillinger uten å taste sikkerhetskoden ({kioskPin}). Nødalarm forblir alltid tilgjengelig.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                id="btn-toggle-kiosk-lock"
                onClick={() => onToggleKioskLock(!isKioskLocked)}
                className={`font-black text-sm px-6 py-3.5 rounded-2xl transition-all shadow-md flex items-center gap-2 ${
                  isKioskLocked
                    ? 'bg-rose-700 hover:bg-rose-800 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>{isKioskLocked ? 'Lås opp Kioskmodus' : 'Aktiver Kiosk PIN-lås nå'}</span>
              </button>
            </div>
          </div>

          {/* Detailed Hardware Diagnostics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* LUKS2 Encryption Status */}
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <HardDrive className="w-6 h-6 text-indigo-700" />
                  <h3 className="text-lg font-black text-slate-900">
                    LUKS2 Disk-Kryptering
                  </h3>
                </div>
                <span className="bg-emerald-100 text-emerald-900 text-xs font-black px-3 py-1 rounded-full border border-emerald-300">
                  AES-XTS-256
                </span>
              </div>
              <div className="space-y-2.5 text-xs text-slate-700">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Kryptert partisjon:</span>
                  <span className="font-mono font-bold">/dev/mapper/nvme0n1p3_crypt</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Nøkkel-lagring:</span>
                  <span className="font-bold text-slate-900">TPM 2.0 Sealed PCR[7,14]</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Cold-boot / RAM-sikring:</span>
                  <span className="font-bold text-emerald-700">Aktiv (Kernel lockdown)</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Filsystem-status:</span>
                  <span className="font-bold text-emerald-700">Integritet verifisert (dm-integrity)</span>
                </div>
              </div>
            </div>

            {/* TPM 2.0 & Secure Boot Status */}
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Cpu className="w-6 h-6 text-purple-700" />
                  <h3 className="text-lg font-black text-slate-900">
                    TPM 2.0 &amp; Målt Oppstart
                  </h3>
                </div>
                <span className="bg-purple-100 text-purple-900 text-xs font-black px-3 py-1 rounded-full border border-purple-300">
                  Maskinvareattestert
                </span>
              </div>
              <div className="space-y-2.5 text-xs text-slate-700">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">TPM Produsent / Versjon:</span>
                  <span className="font-mono font-bold">Infineon SLB9670 / TPM 2.0</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">UEFI Secure Boot:</span>
                  <span className="font-bold text-emerald-700">Aktivert med kommunale nøkler</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Kabinett-sikring (Tamper):</span>
                  <span className="font-bold text-emerald-700">Forseglet (Ingen inntrengning)</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">USB-port blokkering:</span>
                  <span className="font-bold text-slate-900">USBGuard aktiv (Kun godkjente enheter)</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. ERASURE & DATA EXPORT: RETT TIL INNSYN OG SLETTING */}
      {/* ========================================================================= */}
      {activeSubTab === 'erasure' && (
        <div className="space-y-6">
          
          {/* GDPR Art 15: Retten til innsyn */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0">
                <Download className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-900">
                    GDPR Art. 15 &amp; 20
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">Dataportabilitet</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 mt-1">
                  Komplett pasientdatauttrekk (Innsynsbegjæring)
                </h2>
                <p className="text-slate-600 text-sm mt-1 max-w-3xl leading-relaxed">
                  Pasienten eller fullmektig har lovfestet rett til å motta en fullstendig kopi av alle personopplysninger og sensordata som er samlet inn av velferdsteknologien.
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-4">
                  <button
                    id="btn-download-gdpr-export"
                    onClick={onExportGdprData}
                    className="bg-indigo-900 hover:bg-indigo-800 text-white font-black text-sm px-6 py-3.5 rounded-2xl shadow-md transition-all flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Last ned pasientuttrekk (.JSON)</span>
                  </button>
                  <span className="text-xs text-slate-500">
                    Inneholder: Vitale målinger, medisinplan, kontaktliste, samtykker og revisjonslogg.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* GDPR Art 17: Retten til å bli glemt (Crypto-Erase) */}
          <div className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <Trash2 className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-rose-600 text-white uppercase">
                    GDPR Art. 17 / NSM Sanering
                  </span>
                  <span className="text-xs text-rose-800 font-bold">Kryptografisk sletting</span>
                </div>
                <h2 className="text-2xl font-black text-rose-950 mt-1">
                  Retten til sletting («Glem meg» / Crypto-Erase)
                </h2>
                <p className="text-rose-900 text-sm mt-1 max-w-3xl leading-relaxed">
                  Ved opphør av tjenesten eller tilbaketrekking av behandlingsgrunnlag, destrueres disknøkkelen i TPM-brikken umiddelbart. Alle lagrede helse- og sensordata på NVMe/SSD blir ugjenkallelig uleselige i tråd med Nasjonal Sikkerhetsmyndighets (NSM) krav.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <button
                    id="btn-trigger-crypto-erase"
                    onClick={() => {
                      setErasureConfirmationText('');
                      setShowErasureModal(true);
                    }}
                    className="bg-rose-700 hover:bg-rose-800 active:scale-95 text-white font-black text-sm px-6 py-3.5 rounded-2xl shadow-lg transition-all flex items-center gap-2"
                  >
                    <AlertOctagon className="w-5 h-5" />
                    <span>Gjennomfør sikker krypto-sanering...</span>
                  </button>
                  <span className="text-xs text-rose-800 font-semibold">
                    Advarsel: Handlingen kan ikke angres!
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: BYTT BRUKERROLLE (RBAC) */}
      {/* ========================================================================= */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
              <div className="flex items-center gap-3">
                <UserCheck className="w-6 h-6 text-indigo-700" />
                <h3 className="text-2xl font-black text-slate-900">
                  Bytt innlogget brukerrolle
                </h3>
              </div>
              <button
                onClick={() => setShowRoleModal(false)}
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleConfirmRoleChange} className="space-y-4">
              <p className="text-xs text-slate-600">
                Velg hvilken rolle du vil representere i systemet for å verifisere rollebasert tilgangskontroll (RBAC):
              </p>

              <div className="space-y-2.5">
                {(Object.values(userProfiles) as UserProfile[]).map((profile: UserProfile) => (
                  <label
                    key={profile.role}
                    className={`block p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      targetRole === profile.role
                        ? 'border-indigo-600 bg-indigo-50/50'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="userRole"
                          checked={targetRole === profile.role}
                          onChange={() => setTargetRole(profile.role)}
                          className="w-4 h-4 text-indigo-600"
                        />
                        <div>
                          <div className="font-extrabold text-sm text-slate-900">
                            {profile.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {profile.title} {profile.hprNumber ? `(${profile.hprNumber})` : ''}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                        {profile.securityLevel}
                      </span>
                    </div>
                  </label>
                ))}
              </div>

              {(targetRole === 'nurse' || targetRole === 'admin') && (
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sikkerhetskode for autorisert personell (Demo-PIN: 1234):
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={rolePinInput}
                    onChange={(e) => setRolePinInput(e.target.value)}
                    placeholder="Tast 1234"
                    className="w-full p-3 rounded-xl border border-slate-300 text-center font-mono text-lg tracking-widest focus:border-indigo-600 focus:outline-none"
                  />
                  {rolePinError && (
                    <p className="text-rose-600 text-xs font-bold mt-1">
                      {rolePinError}
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  className="px-5 py-2.5 rounded-xl text-slate-700 font-bold hover:bg-slate-100 text-sm"
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  className="bg-indigo-900 hover:bg-indigo-800 text-white font-extrabold px-6 py-2.5 rounded-xl text-sm shadow-md transition-all"
                >
                  Bekreft rollebytte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: MANUELT REVISJONSOPPSLAG */}
      {/* ========================================================================= */}
      {showAuditModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-indigo-700" />
                <h3 className="text-2xl font-black text-slate-900">
                  Registrer tjenstlig oppslag
                </h3>
              </div>
              <button
                onClick={() => setShowAuditModal(false)}
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitAudit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ressurs det gjøres oppslag i:
                </label>
                <select
                  value={auditResource}
                  onChange={(e) => setAuditResource(e.target.value as any)}
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm font-semibold focus:border-indigo-600 focus:outline-none"
                >
                  <option value="VITALE_TEGN">Vitale tegn (Puls, SpO2, Bevegelse)</option>
                  <option value="MEDISINER">Medisinliste &amp; Dosett-status</option>
                  <option value="FALLRADAR_LOGG">Fallradar hendelseshistorikk</option>
                  <option value="KONTAKTER">Pårørendeliste &amp; Meldinger</option>
                  <option value="SYSTEM_CONFIG">Systemkonfigurasjon</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Handling:
                </label>
                <select
                  value={auditAction}
                  onChange={(e) => setAuditAction(e.target.value as any)}
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm font-semibold focus:border-indigo-600 focus:outline-none"
                >
                  <option value="READ">READ (Innsyn / Lesing)</option>
                  <option value="UPDATE">UPDATE (Endring / Medisinjustering)</option>
                  <option value="EXPORT">EXPORT (Datauttrekk)</option>
                  <option value="EMERGENCY_OVERRIDE">EMERGENCY_OVERRIDE (Akutt nødoverstyring)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tjenstlig begrunnelse (Lovkrav): *
                </label>
                <textarea
                  required
                  rows={3}
                  value={auditJustification}
                  onChange={(e) => setAuditJustification(e.target.value)}
                  placeholder="F.eks: Rutinemessig ettermiddagstilsyn og kontroll av medisindose."
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAuditModal(false)}
                  className="px-5 py-2.5 rounded-xl text-slate-700 font-bold hover:bg-slate-100 text-sm"
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  className="bg-indigo-900 hover:bg-indigo-800 text-white font-extrabold px-6 py-2.5 rounded-xl text-sm shadow-md transition-all"
                >
                  Loggfør oppslag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: KRYPTO-SLETTING BEKREFTELSE */}
      {/* ========================================================================= */}
      {showErasureModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-rose-400 animate-fade-in">
            <div className="flex items-center gap-3 pb-4 border-b border-rose-200 text-rose-700 mb-6">
              <AlertOctagon className="w-8 h-8 shrink-0" />
              <div>
                <h3 className="text-2xl font-black text-slate-900">
                  Bekreft kryptografisk sletting
                </h3>
                <p className="text-xs text-rose-700 font-bold">
                  Sikker sanering i henhold til NSM og GDPR Art. 17
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed mb-4">
              Denne handlingen vil slette masterkrypteringsnøkkelen fra TPM-brikken og nullstille all lagret pasienthistorikk. Dataene vil aldri kunne gjenopprettes.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Skriv <strong>SLETT</strong> med store bokstaver for å bekrefte:
              </label>
              <input
                type="text"
                value={erasureConfirmationText}
                onChange={(e) => setErasureConfirmationText(e.target.value)}
                placeholder="SLETT"
                className="w-full p-3 rounded-xl border border-rose-300 text-center font-mono font-bold text-base focus:border-rose-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowErasureModal(false)}
                className="px-5 py-2.5 rounded-xl text-slate-700 font-bold hover:bg-slate-100 text-sm"
              >
                Avbryt
              </button>
              <button
                type="button"
                disabled={erasureConfirmationText !== 'SLETT'}
                onClick={() => {
                  onExecuteCryptoErase();
                  setShowErasureModal(false);
                }}
                className={`font-extrabold px-6 py-2.5 rounded-xl text-sm shadow-md transition-all ${
                  erasureConfirmationText === 'SLETT'
                    ? 'bg-rose-700 hover:bg-rose-800 text-white cursor-pointer'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                Utfør krypto-sanering
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
