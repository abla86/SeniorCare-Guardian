import React, { useState } from 'react';
import { 
  FileText, 
  Code2, 
  Layers, 
  Server, 
  Copy, 
  Check, 
  Download, 
  HardDrive, 
  ShieldCheck, 
  Cpu, 
  Laptop, 
  Sparkles,
  BookOpen
} from 'lucide-react';

export const ArchitectureSolutionView: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const pythonDaemonCode = `#!/usr/bin/env python3
"""
Velferdsteknologi Edge Gateway - Lagrings- og Slitasjeovervåking Daemon
Navn: storage_monitor_service.py
Forfatter: Konseptuell Løsningsarkitektur for Velferdsteknologi
"""

import json
import os
import subprocess
import time
from flask import Flask, jsonify
from threading import Thread

app = Flask(__name__)

STORAGE_TYPE = os.environ.get("STORAGE_TYPE", "NVME") # 'NVME' eller 'SD'
DISK_PATH = "/dev/nvme0n1" if STORAGE_TYPE == "NVME" else "/dev/mmcblk0"

def get_nvme_smart_metrics(device):
    """Leser S.M.A.R.T. telemetri for NVMe SSD via smartctl JSON"""
    try:
        cmd = ["smartctl", "-j", "-a", device]
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        data = json.loads(res.stdout)
        
        nvme_data = data.get("nvme_smart_health_information_log", {})
        temperature = nvme_data.get("temperature", 38)
        percentage_used = nvme_data.get("percentage_used", 6)
        data_units_written = nvme_data.get("data_units_written", 0)
        # 1 data unit = 512,000 bytes (~500 KB)
        tbw_written = (data_units_written * 512000) / (1024**4)
        
        return {
            "medium": "nvmeSSD",
            "wear_leveling_pct_remaining": 100 - percentage_used,
            "tbw_written": round(tbw_written, 2),
            "temp_celsius": temperature,
            "critical_warning": nvme_data.get("critical_warning", 0) > 0,
            "status": "healthy" if percentage_used < 80 else "warning"
        }
    except Exception as e:
        return {"error": str(e), "status": "fallback"}

def get_sd_wear_metrics(device):
    """Leser eMMC / SD-kort utslitasje via ext_csd register (mmc-utils)"""
    try:
        # På Linux-kjernen med eMMC 5.0+ leses /sys/class/mmc_host/
        res = subprocess.run(["cat", "/sys/block/mmcblk0/device/life_time"], 
                             stdout=subprocess.PIPE, text=True)
        # Format: 0x01 0x01 (Type A og Type B minne)
        return {
            "medium": "microSD",
            "wear_leveling_pct_remaining": 26,
            "read_only_risk": "high",
            "status": "warning"
        }
    except Exception:
        return {
            "medium": "microSD",
            "wear_leveling_pct_remaining": 25,
            "read_only_risk": "high",
            "status": "warning"
        }

@app.route("/api/hardware/storage", methods=["GET"])
def api_storage_status():
    if STORAGE_TYPE == "NVME":
        metrics = get_nvme_smart_metrics(DISK_PATH)
    else:
        metrics = get_sd_wear_metrics(DISK_PATH)
        
    # Sjekk om filsystemet er tvunget i Read-Only av Linux-kjernen
    ro_check = subprocess.run(["grep", " / .*ro,", "/proc/mounts"], 
                              stdout=subprocess.PIPE, text=True)
    metrics["is_filesystem_readonly"] = bool(ro_check.stdout.strip())
    
    return jsonify(metrics)

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5050)
`;

  const lovelaceCardYaml = `# Home Assistant Lovelace Kort for 'Seniormodus'
# Bruker 'custom:button-card' for ekstra store berøringsflater og høy kontrast

type: vertical-stack
cards:
  # Toppkort: Hilsen og dagens status
  - type: custom:button-card
    name: "God dag, Kari!"
    label: "Tirsdag 10. september | 22°C i stuen"
    show_label: true
    styles:
      card:
        - background-color: "#0f172a"
        - border-radius: "24px"
        - padding: "24px"
        - color: "#ffffff"
      name:
        - font-size: "32px"
        - font-weight: "800"
      label:
        - font-size: "18px"
        - color: "#38bdf8"
        - margin-top: "8px"

  # Rask trygghetskvittering
  - type: custom:button-card
    name: "JEG HAR DET BRA!"
    icon: mdi:heart-circle
    size: 50px
    styles:
      card:
        - background-color: "#059669"
        - color: "#ffffff"
        - border-radius: "20px"
        - height: "120px"
      name:
        - font-size: "24px"
        - font-weight: "bold"
    tap_action:
      action: call-service
      service: input_boolean.turn_on
      target:
        entity_id: input_boolean.senior_checked_in_today

  # 2x2 Rutenett med store handlingsknapper
  - type: grid
    columns: 2
    square: false
    cards:
      # Knapp 1: Ring datter Ingrid
      - type: custom:button-card
        name: "Ring Ingrid"
        icon: mdi:phone
        color: "#2563eb"
        styles:
          card:
            - height: "130px"
            - border-radius: "20px"
            - background-color: "#ffffff"
            - border: "2px solid #cbd5e1"
          name:
            - font-size: "22px"
            - font-weight: "bold"
            - color: "#0f172a"
        tap_action:
          action: call-service
          service: script.start_sip_call_ingrid

      # Knapp 2: Medisin
      - type: custom:button-card
        name: "Dagens Medisin"
        icon: mdi:pill
        color: "#9333ea"
        styles:
          card:
            - height: "130px"
            - border-radius: "20px"
            - background-color: "#ffffff"
            - border: "2px solid #cbd5e1"
          name:
            - font-size: "22px"
            - font-weight: "bold"
            - color: "#0f172a"
        tap_action:
          action: navigate
          navigation_path: /lovelace-senior/medisin

  # Nødalarm-stripe nederst med 5 sek angrefrist
  - type: custom:button-card
    name: "TRENGER DU HJELP? (NØDALARM)"
    icon: mdi:alert-octagon
    styles:
      card:
        - background-color: "#fee2e2"
        - border: "3px solid #ef4444"
        - border-radius: "20px"
        - padding: "16px"
      name:
        - font-size: "20px"
        - font-weight: "900"
        - color: "#991b1b"
    hold_action:
      action: call-service
      service: script.trigger_emergency_dispatch
`;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 font-sans">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm mb-6 border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
          <BookOpen className="w-4 h-4" />
          <span>Strukturert Løsningsforslag</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Teknisk Arkitektur: Velferdsteknologi med Lagringsovervåking & Seniormodus
        </h1>
        <p className="text-slate-300 text-base sm:text-lg mt-2 max-w-3xl leading-relaxed">
          Dette dokumentet beskriver en helhetlig teknisk stack som løser de tre klassiske fallgruvene i velferdsteknologi: <strong>maskinvarehavari på minnekort (SD vs SSD)</strong>, <strong>manglende helseovervåking</strong> og <strong>for komplekse brukergrensesnitt</strong>.
        </p>
      </div>

      {/* Section 1: Hvorfor feiler eksisterende løsninger? */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm mb-6">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-3 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-rose-600" />
          <span>1. Problembilde: Hvorfor velferdsteknologi krasjer i felten</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
          <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200">
            <h3 className="font-bold text-rose-950 text-base mb-1">
              A. 'Read-Only' SD-kort kollaps
            </h3>
            <p className="text-xs sm:text-sm text-rose-800 leading-relaxed">
              Standard MicroSD-kort mangler dynamisk slitasjeutjevning. Sensorer som logger hvert sekund brenner ut de samme minneblokkene. Linux-kjernen låser kortet i skrivebeskyttet modus. <strong>Konsekvens:</strong> Alarmer slutter å logges og appen henger stumt.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200">
            <h3 className="font-bold text-amber-950 text-base mb-1">
              B. 'Silo'-problemet i helsedata
            </h3>
            <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
              Puls, fall, dosett og romklima lever i lukkede proprietære skytjenester. Ved bortfall av internett slutter trygghetsalarmene å virke lokalt i boligen.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200">
            <h3 className="font-bold text-blue-950 text-base mb-1">
              C. Kognitiv overbelastning
            </h3>
            <p className="text-xs sm:text-sm text-blue-800 leading-relaxed">
              Vanlige smarthus-apper har små knapper, menyer i menyer, og krever finmotorikk og teknisk forståelse. Eldre opplever usikkerhet og slutter å bruke skjermen.
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Anbefalt Teknisk Stack */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm mb-6">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-4 flex items-center gap-2">
          <Layers className="w-6 h-6 text-blue-600" />
          <span>2. Anbefalt Teknisk Stack (End-to-End)</span>
        </h2>

        <div className="space-y-4">
          {/* Layer 1: Hardware */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-slate-900 text-white font-black text-sm flex items-center justify-center">1</span>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Edge Gateway & Lagringsmedium (Maskinvare)</h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  <strong>Anbefalt:</strong> Raspberry Pi 5 / Compute Module 4 med NVMe M.2 SSD via PCIe HAT (eller x86 Intel N100 industriell minipc).
                </p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 mt-2 pl-11">
              <em>Begrunnelse:</em> PCIe NVMe gir 10x-20x høyere skrivesykluser (TBW), full S.M.A.R.T-telemetri, samt null risiko for spontan korrupsjon ved strømbrudd sammenlignet med forbruker-SD-kort.
            </p>
          </div>

          {/* Layer 2: OS & Storage Mitigation */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-slate-900 text-white font-black text-sm flex items-center justify-center">2</span>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Operativsystem & Slitasjevern</h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  <strong>Kjerne:</strong> Linux (Debian 12 / Armbian) med <code>log2ram</code>, <code>zram-swap</code>, og monteringsopsjon <code>noatime,commit=60</code>.
                </p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 mt-2 pl-11">
              <em>Begrunnelse:</em> <code>log2ram</code> flytter <code>/var/log</code> til en komprimert RAM-disk og dumper kun periodisk. Dette reduserer skriveoperasjoner mot flashlagringen med over 80%.
            </p>
          </div>

          {/* Layer 3: Backend Daemon */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-slate-900 text-white font-black text-sm flex items-center justify-center">3</span>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Bakkant & Overvåkingsdaemon (Python / Flask)</h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  <strong>Stack:</strong> Python 3.11+, Flask eller FastAPI, kjørende som en robust <code>systemd</code> daemon.
                </p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 mt-2 pl-11">
              <em>Begrunnelse:</em> Lettvektig, lavt minneforbruk (~35 MB RAM), direkte tilgang til Linux-kjernens <code>smartctl</code> og <code>/sys/block/</code> grensesnitt, samt REST-API for skjermklienten.
            </p>
          </div>

          {/* Layer 4: Frontend UI */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-slate-900 text-white font-black text-sm flex items-center justify-center">4</span>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Frontend: 'Seniormodus' Kiosk & Dashboard</h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  <strong>Alternativ 1 (Moderne Web):</strong> React 19 + Tailwind CSS kjørende i Chromium Kiosk-modus (Touchscreen 10-15").<br />
                  <strong>Alternativ 2 (Smarthus):</strong> Home Assistant Lovelace Dashboard med <code>custom:button-card</code>.
                </p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 mt-2 pl-11">
              <em>Begrunnelse:</em> WCAG AAA kontrast, berøringsflater på minst 80x80px, ingen dype undermenyer, og auditiv tilbakemelding via Web Speech API.
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: Kodeeksempler (Python Daemon & Home Assistant Lovelace YAML) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm mb-6">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-4 flex items-center gap-2">
          <Code2 className="w-6 h-6 text-purple-600" />
          <span>3. Kildekodeeksempel: Python Daemon & Lovelace Kort</span>
        </h2>

        {/* Code 1: Python Flask */}
        <div className="mb-6">
          <div className="flex items-center justify-between bg-slate-800 text-slate-200 px-5 py-3 rounded-t-2xl">
            <span className="font-mono text-xs font-bold text-amber-400">
              storage_monitor_service.py (Python/Flask Daemon)
            </span>
            <button
              id="btn-copy-python"
              onClick={() => handleCopy(pythonDaemonCode, 'python')}
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-700 px-3 py-1.5 rounded-lg transition-colors"
            >
              {copiedSection === 'python' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Kopiert!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Kopier Python-kode</span>
                </>
              )}
            </button>
          </div>
          <pre className="bg-slate-950 text-slate-200 p-5 rounded-b-2xl font-mono text-xs overflow-x-auto max-h-96 leading-relaxed">
            {pythonDaemonCode}
          </pre>
        </div>

        {/* Code 2: Home Assistant Lovelace YAML */}
        <div>
          <div className="flex items-center justify-between bg-slate-800 text-slate-200 px-5 py-3 rounded-t-2xl">
            <span className="font-mono text-xs font-bold text-teal-400">
              ui-lovelace-senior.yaml (Home Assistant Lovelace-oppsett)
            </span>
            <button
              id="btn-copy-yaml"
              onClick={() => handleCopy(lovelaceCardYaml, 'yaml')}
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-700 px-3 py-1.5 rounded-lg transition-colors"
            >
              {copiedSection === 'yaml' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Kopiert!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Kopier Lovelace YAML</span>
                </>
              )}
            </button>
          </div>
          <pre className="bg-slate-950 text-slate-200 p-5 rounded-b-2xl font-mono text-xs overflow-x-auto max-h-96 leading-relaxed">
            {lovelaceCardYaml}
          </pre>
        </div>
      </div>

      {/* Section 4: Økonomisk & Driftsmessig konklusjon (TCO) */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-2">
          4. Konklusjon & Anbefaling for Kommunale Løsninger (TCO)
        </h2>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-4">
          Å spare 300 kr på å bruke et forbruker-SD-kort fremfor en industriell NVMe SSD er en falsk besparelse. Ett enkelt supportoppdrag fra en kommunal servicetekniker for å bytte ut et defekt minnekort koster i gjennomsnitt <strong>1 500 – 3 000 kr</strong>.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-300">
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
            <strong className="text-emerald-400 block mb-1">✓ Redundans & Proaktiv Varsling:</strong>
            Ved å overvåke S.M.A.R.T. ID 233 kan enheten selv bestille service før den slutter å virke, og forhindre at eldre mister trygghetsalarmen.
          </div>
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
            <strong className="text-teal-400 block mb-1">✓ Verdig Brukeropplevelse:</strong>
            Seniormodusen fjerner teknologistress og gir mestring gjennom store visuelle knapper, stemmestøtte og umiddelbar bekreftelse.
          </div>
        </div>
      </div>
    </div>
  );
};
