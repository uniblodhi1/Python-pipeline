import { useState, useMemo, useCallback } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, Area, AreaChart, ReferenceLine,
  ComposedChart, Bar, ReferenceArea
} from "recharts";

// ═══════════════════════════════════════════════════════════
// MATHEMATICAL MODEL: Islamic Eschatology Symbolic Simulation
// All values symbolic (0–10). NOT for real-world prediction.
// Based on Qur'an & Hadith classical signs framework.
// ═══════════════════════════════════════════════════════════

const SIGN_DESCRIPTIONS = {
  moralDecay: {
    name: "Moral Decay (الفساد الأخلاقي)",
    short: "Moral Decay",
    color: "#D4380D",
    sources: "Bukhari 81, Muslim 2671, Muslim 2128",
    desc: "Sexual immorality, intoxicants, loss of modesty"
  },
  oppressionTyranny: {
    name: "Oppression & Tyranny (الظلم)",
    short: "Oppression",
    color: "#AD2102",
    sources: "Abu Dawud 4283, Muslim 2897",
    desc: "Earth filled with injustice, prerequisite for Mahdi"
  },
  globalConflict: {
    name: "Wars & Al-Harj (الحرج)",
    short: "Wars/Conflict",
    color: "#CF1322",
    sources: "Muslim 157, Bukhari 7062, Muslim 2897",
    desc: "Killing increases, Malhama al-Kubra, fitnah"
  },
  deceptionLies: {
    name: "Deception & Ruwaybidah (الخداع)",
    short: "Deception",
    color: "#FA541C",
    sources: "Ibn Majah 4036, Ahmad 7912, Bukhari 7121",
    desc: "Liars trusted, honest doubted, 30 false prophets"
  },
  naturalDisasters: {
    name: "Natural Disasters (الزلازل)",
    short: "Disasters",
    color: "#D46B08",
    sources: "Bukhari 7121, Bukhari 1036, Muslim 157c",
    desc: "Earthquakes increase, climate transforms Arabia"
  },
  religiousDecline: {
    name: "Religious Decline (رفع العلم)",
    short: "Religious Decline",
    color: "#D48806",
    sources: "Bukhari 100, Muslim 2673, Muslim 145",
    desc: "Knowledge lifted, scholars perish, Islam becomes strange"
  },
  cosmicPhenomena: {
    name: "Cosmic Signs (الآيات الكونية)",
    short: "Cosmic Signs",
    color: "#7C3AED",
    sources: "Muslim 2901, Bukhari 4635, Quran 27:82",
    desc: "Smoke, sun from west, Beast, landslides"
  },
  socialConfusion: {
    name: "Social Confusion (الفتنة)",
    short: "Social Confusion",
    color: "#EB2F96",
    sources: "Bukhari 7094, Muslim 2885, Ahmad 10560",
    desc: "Fitnah enters every home, time compresses, graves envied"
  },
};

// Sigmoid growth function: S-curve from 0 to maxVal
const sigmoid = (t, midpoint, steepness, maxVal = 10) =>
  maxVal / (1 + Math.exp(-steepness * (t - midpoint)));

// Gaussian bump function for temporary effects
const gaussian = (t, center, width, amplitude) =>
  amplitude * Math.exp(-((t - center) ** 2) / (2 * width ** 2));

const DEFAULT_PARAMS = {
  horizonYears: 40,
  moralDecayRate: 0.18,
  oppressionRate: 0.20,
  conflictRate: 0.15,
  deceptionRate: 0.22,
  disasterRate: 0.12,
  religiousDeclineRate: 0.16,
  cosmicRate: 0.35,
  confusionRate: 0.19,
  mahdiAppearYear: 15,
  mahdiStabilizeStrength: 0.35,
  mahdiStabilizeDuration: 7,
  dajjalThreshold: 7.0,
  dajjalPeakIntensity: 9.8,
  dajjalYearLongDay: true,
  isaDescentDelay: 2.5,
};

function generateTimeline(params) {
  const {
    horizonYears, moralDecayRate, oppressionRate, conflictRate,
    deceptionRate, disasterRate, religiousDeclineRate, cosmicRate,
    confusionRate, mahdiAppearYear, mahdiStabilizeStrength,
    mahdiStabilizeDuration, dajjalThreshold, dajjalPeakIntensity,
    dajjalYearLongDay, isaDescentDelay
  } = params;

  const data = [];
  let dajjalAppearYear = null;
  let isaDescentYear = null;
  let dajjalDefeatedYear = null;
  const mahdiEndYear = mahdiAppearYear + mahdiStabilizeDuration;

  // Pre-calculate DPI to find threshold crossing
  for (let t = 0; t <= horizonYears; t += 0.5) {
    const baseMoral = sigmoid(t, horizonYears * 0.4, moralDecayRate);
    const baseOppression = sigmoid(t, horizonYears * 0.35, oppressionRate);
    const baseConflict = sigmoid(t, horizonYears * 0.45, conflictRate);
    const baseDeception = sigmoid(t, horizonYears * 0.3, deceptionRate);

    const mahdiEffect = (t >= mahdiAppearYear && t <= mahdiEndYear)
      ? mahdiStabilizeStrength * gaussian(t, mahdiAppearYear + mahdiStabilizeDuration / 2, mahdiStabilizeDuration / 3, 1)
      : 0;

    const adjustedMoral = Math.max(0, Math.min(10, baseMoral * (1 - mahdiEffect)));
    const adjustedOppression = Math.max(0, Math.min(10, baseOppression * (1 - mahdiEffect * 1.2)));
    const adjustedConflict = Math.max(0, Math.min(10, baseConflict * (1 - mahdiEffect * 0.8)));
    const adjustedDeception = Math.max(0, Math.min(10, baseDeception * (1 - mahdiEffect * 0.9)));

    const dpi = (
      adjustedMoral * 0.15 +
      adjustedOppression * 0.20 +
      adjustedConflict * 0.15 +
      adjustedDeception * 0.20 +
      sigmoid(t, horizonYears * 0.5, disasterRate) * 0.10 +
      sigmoid(t, horizonYears * 0.35, religiousDeclineRate) * 0.10 +
      sigmoid(t, horizonYears * 0.55, confusionRate) * 0.10
    );

    if (dajjalAppearYear === null && dpi >= dajjalThreshold && t > mahdiAppearYear) {
      dajjalAppearYear = t;
      isaDescentYear = dajjalAppearYear + isaDescentDelay;
      dajjalDefeatedYear = isaDescentYear + 0.5;
    }
  }

  if (!dajjalAppearYear) {
    dajjalAppearYear = mahdiEndYear + 2;
    isaDescentYear = dajjalAppearYear + isaDescentDelay;
    dajjalDefeatedYear = isaDescentYear + 0.5;
  }

  // Generate full timeline data
  for (let t = 0; t <= horizonYears; t += 0.5) {
    let moral = sigmoid(t, horizonYears * 0.4, moralDecayRate);
    let oppression = sigmoid(t, horizonYears * 0.35, oppressionRate);
    let conflict = sigmoid(t, horizonYears * 0.45, conflictRate);
    let deception = sigmoid(t, horizonYears * 0.3, deceptionRate);
    let disasters = sigmoid(t, horizonYears * 0.5, disasterRate);
    let religious = sigmoid(t, horizonYears * 0.35, religiousDeclineRate);
    let cosmic = sigmoid(t, horizonYears * 0.75, cosmicRate);
    let confusion = sigmoid(t, horizonYears * 0.55, confusionRate);

    let mahdiInfluence = 0;
    if (t >= mahdiAppearYear && t <= mahdiEndYear) {
      const progress = (t - mahdiAppearYear) / mahdiStabilizeDuration;
      mahdiInfluence = progress < 0.2
        ? progress / 0.2
        : progress < 0.7 ? 1.0
        : 1.0 - (progress - 0.7) / 0.3;
      mahdiInfluence *= mahdiStabilizeStrength;

      moral *= (1 - mahdiInfluence);
      oppression *= (1 - mahdiInfluence * 1.3);
      conflict *= (1 - mahdiInfluence * 0.7);
      deception *= (1 - mahdiInfluence * 1.1);
      religious *= (1 - mahdiInfluence * 0.6);
      confusion *= (1 - mahdiInfluence * 0.8);
    }
    const mahdiIndex = mahdiInfluence * 10;

    let dajjalInfluence = 0;
    if (t >= dajjalAppearYear && t <= dajjalDefeatedYear) {
      const dajjalDuration = dajjalDefeatedYear - dajjalAppearYear;
      const dp = (t - dajjalAppearYear) / dajjalDuration;

      if (dajjalYearLongDay) {
        if (dp < 0.3) {
          dajjalInfluence = (dp / 0.3) * dajjalPeakIntensity;
        } else if (dp < 0.5) {
          dajjalInfluence = dajjalPeakIntensity;
        } else if (dp < 0.7) {
          dajjalInfluence = dajjalPeakIntensity * 0.85;
        } else if (dp < 0.85) {
          dajjalInfluence = dajjalPeakIntensity * 0.7;
        } else {
          dajjalInfluence = dajjalPeakIntensity * 0.5;
        }
      } else {
        dajjalInfluence = gaussian(t, (dajjalAppearYear + dajjalDefeatedYear) / 2, dajjalDuration / 4, dajjalPeakIntensity);
      }

      const amp = dajjalInfluence / 10;
      moral = Math.min(10, moral + amp * 3);
      deception = Math.min(10, deception + amp * 4);
      confusion = Math.min(10, confusion + amp * 3.5);
      conflict = Math.min(10, conflict + amp * 2);
    }

    let isaInfluence = 0;
    if (t >= dajjalDefeatedYear) {
      const peaceProgress = Math.min(1, (t - dajjalDefeatedYear) / 5);
      isaInfluence = peaceProgress * 8;
      const reduction = peaceProgress * 0.9;
      moral *= (1 - reduction);
      oppression *= (1 - reduction);
      conflict *= (1 - reduction);
      deception *= (1 - reduction);
      confusion *= (1 - reduction);
      religious *= (1 - reduction);
      cosmic = Math.min(10, cosmic + peaceProgress * 4);
    }

    const dpi = (
      moral * 0.15 +
      oppression * 0.20 +
      conflict * 0.15 +
      deception * 0.20 +
      disasters * 0.10 +
      religious * 0.10 +
      confusion * 0.10
    );

    data.push({
      year: t,
      moralDecay: +moral.toFixed(2),
      oppression: +oppression.toFixed(2),
      conflict: +conflict.toFixed(2),
      deception: +deception.toFixed(2),
      disasters: +disasters.toFixed(2),
      religiousDecline: +religious.toFixed(2),
      cosmicSigns: +cosmic.toFixed(2),
      confusion: +confusion.toFixed(2),
      dpi: +dpi.toFixed(2),
      mahdiIndex: +mahdiIndex.toFixed(2),
      dajjalInfluence: +dajjalInfluence.toFixed(2),
      isaInfluence: +isaInfluence.toFixed(2),
    });
  }

  return {
    data,
    events: {
      mahdiAppear: mahdiAppearYear,
      mahdiEnd: mahdiEndYear,
      dajjalAppear: dajjalAppearYear,
      isaDescend: isaDescentYear,
      dajjalDefeated: dajjalDefeatedYear,
    }
  };
}

// ═══════════════════════════════════════════════════════════
// UI COMPONENTS
// ═══════════════════════════════════════════════════════════

const FONT = "'Amiri', 'Georgia', serif";
const MONO = "'JetBrains Mono', 'Fira Code', monospace";

const palette = {
  bg: "#0A0E17",
  card: "#111827",
  cardBorder: "#1E293B",
  gold: "#D4A853",
  goldDim: "#A68532",
  green: "#10B981",
  red: "#EF4444",
  purple: "#8B5CF6",
  blue: "#3B82F6",
  cyan: "#06B6D4",
  text: "#E2E8F0",
  textDim: "#94A3B8",
  textFaint: "#64748B",
  dajjalRed: "#DC2626",
  mahdiGreen: "#059669",
  isaBlue: "#2563EB",
};

const SliderParam = ({ label, value, onChange, min, max, step, unit = "", info }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
      <span style={{ fontSize: 11, color: palette.textDim, fontFamily: MONO, letterSpacing: 0.5 }}>{label}</span>
      <span style={{ fontSize: 12, color: palette.gold, fontFamily: MONO, fontWeight: 700 }}>
        {typeof value === "boolean" ? (value ? "ON" : "OFF") : value}{unit}
      </span>
    </div>
    {typeof value === "boolean" ? (
      <button
        onClick={() => onChange(!value)}
        style={{
          width: "100%", padding: "6px 0", border: `1px solid ${value ? palette.green : palette.cardBorder}`,
          background: value ? "rgba(16,185,129,0.15)" : "transparent", color: value ? palette.green : palette.textDim,
          borderRadius: 6, cursor: "pointer", fontSize: 11, fontFamily: MONO, transition: "all 0.2s"
        }}
      >
        {value ? "Year-Long Day: ENABLED" : "Year-Long Day: DISABLED"}
      </button>
    ) : (
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width: "100%", accentColor: palette.gold, cursor: "pointer" }}
      />
    )}
    {info && <div style={{ fontSize: 9, color: palette.textFaint, marginTop: 2, lineHeight: 1.3 }}>{info}</div>}
  </div>
);

const EventMarker = ({ label, year, color, icon }) => (
  <div style={{
    display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px",
    background: `${color}15`, border: `1px solid ${color}40`, borderRadius: 20,
    fontSize: 11, color, fontFamily: MONO, whiteSpace: "nowrap"
  }}>
    <span style={{ fontSize: 14 }}>{icon}</span>
    <span>{label}</span>
    <span style={{ fontWeight: 700 }}>Y{year.toFixed(1)}</span>
  </div>
);

const SignCard = ({ sign, value }) => (
  <div style={{
    padding: "8px 10px", background: `${sign.color}10`, border: `1px solid ${sign.color}25`,
    borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center"
  }}>
    <div>
      <div style={{ fontSize: 11, color: sign.color, fontWeight: 600, fontFamily: MONO }}>{sign.short}</div>
      <div style={{ fontSize: 8, color: palette.textFaint, marginTop: 1 }}>{sign.sources}</div>
    </div>
    <div style={{
      fontSize: 16, fontWeight: 800, color: sign.color, fontFamily: MONO,
      minWidth: 36, textAlign: "right"
    }}>
      {value.toFixed(1)}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#1a1f2e", border: `1px solid ${palette.cardBorder}`, borderRadius: 8,
      padding: "10px 14px", boxShadow: "0 8px 32px rgba(0,0,0,0.5)", maxWidth: 260
    }}>
      <div style={{ fontSize: 12, color: palette.gold, fontFamily: MONO, marginBottom: 6 }}>
        Symbolic Year {label}
      </div>
      {payload.map((entry, i) => (
        <div key={i} style={{
          display: "flex", justifyContent: "space-between", gap: 12,
          fontSize: 10, color: entry.color, fontFamily: MONO, padding: "1px 0"
        }}>
          <span style={{ opacity: 0.8 }}>{entry.name}</span>
          <span style={{ fontWeight: 700 }}>{entry.value?.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════

export default function IslamicEschatologyModel() {
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const [activeTab, setActiveTab] = useState("main");
  const [showPanel, setShowPanel] = useState(true);

  const updateParam = useCallback((key, val) => {
    setParams(prev => ({ ...prev, [key]: val }));
  }, []);

  const { data, events } = useMemo(() => generateTimeline(params), [params]);

  const lastPoint = data[data.length - 1];
  const peakDajjal = Math.max(...data.map(d => d.dajjalInfluence));
  const peakDPI = Math.max(...data.map(d => d.dpi));

  const tabs = [
    { id: "main", label: "DPI + Entities" },
    { id: "signs", label: "8 Sign Indices" },
    { id: "dajjal", label: "Dajjal Detail" },
    { id: "table", label: "Data Table" },
  ];

  return (
    <div style={{
      fontFamily: FONT, background: palette.bg, color: palette.text,
      minHeight: "100vh", display: "flex", flexDirection: "column"
    }}>
      {/* HEADER */}
      <div style={{
        padding: "16px 20px", borderBottom: `1px solid ${palette.cardBorder}`,
        background: "linear-gradient(180deg, #111827 0%, #0A0E17 100%)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
          <div>
            <h1 style={{
              fontSize: 18, fontWeight: 700, color: palette.gold, margin: 0,
              letterSpacing: 0.5, fontFamily: FONT
            }}>
              ﷽ Symbolic Eschatological Model
            </h1>
            <p style={{ fontSize: 10, color: palette.textFaint, margin: "4px 0 0", fontFamily: MONO, maxWidth: 500 }}>
              Conceptual simulation based on Qur'an & Hadith. All values symbolic (0–10). Not for predicting real dates.
            </p>
          </div>
          <button
            onClick={() => setShowPanel(!showPanel)}
            style={{
              padding: "6px 14px", background: palette.card, border: `1px solid ${palette.cardBorder}`,
              color: palette.gold, borderRadius: 6, cursor: "pointer", fontSize: 11, fontFamily: MONO
            }}
          >
            {showPanel ? "Hide" : "Show"} Controls
          </button>
        </div>

        {/* EVENT TIMELINE */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
          <EventMarker label="Mahdi Appears" year={events.mahdiAppear} color={palette.mahdiGreen} icon="☪" />
          <EventMarker label="Mahdi Rule Ends" year={events.mahdiEnd} color={palette.green} icon="⏳" />
          <EventMarker label="Dajjal Emerges" year={events.dajjalAppear} color={palette.dajjalRed} icon="👁" />
          <EventMarker label="ʿĪsā Descends" year={events.isaDescend} color={palette.isaBlue} icon="✝" />
          <EventMarker label="Dajjal Defeated" year={events.dajjalDefeated} color={palette.cyan} icon="⚔" />
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* SIDE PANEL */}
        {showPanel && (
          <div style={{
            width: 260, minWidth: 260, borderRight: `1px solid ${palette.cardBorder}`,
            background: palette.card, overflowY: "auto", padding: 14
          }}>
            <h3 style={{ fontSize: 11, color: palette.gold, fontFamily: MONO, margin: "0 0 10px", letterSpacing: 1 }}>
              GROWTH RATES
            </h3>
            <SliderParam label="Moral Decay" value={params.moralDecayRate} onChange={v => updateParam("moralDecayRate", v)} min={0.05} max={0.5} step={0.01} info="Bukhari 81, Muslim 2671" />
            <SliderParam label="Oppression" value={params.oppressionRate} onChange={v => updateParam("oppressionRate", v)} min={0.05} max={0.5} step={0.01} info="Abu Dawud 4283" />
            <SliderParam label="Global Conflict" value={params.conflictRate} onChange={v => updateParam("conflictRate", v)} min={0.05} max={0.5} step={0.01} info="Muslim 157, Bukhari 7062" />
            <SliderParam label="Deception" value={params.deceptionRate} onChange={v => updateParam("deceptionRate", v)} min={0.05} max={0.5} step={0.01} info="Ibn Majah 4036" />
            <SliderParam label="Natural Disasters" value={params.disasterRate} onChange={v => updateParam("disasterRate", v)} min={0.05} max={0.5} step={0.01} info="Bukhari 7121" />
            <SliderParam label="Religious Decline" value={params.religiousDeclineRate} onChange={v => updateParam("religiousDeclineRate", v)} min={0.05} max={0.5} step={0.01} info="Bukhari 100, Muslim 145" />
            <SliderParam label="Social Confusion" value={params.confusionRate} onChange={v => updateParam("confusionRate", v)} min={0.05} max={0.5} step={0.01} info="Bukhari 7094, Ahmad 10560" />

            <div style={{ height: 1, background: palette.cardBorder, margin: "14px 0" }} />

            <h3 style={{ fontSize: 11, color: palette.mahdiGreen, fontFamily: MONO, margin: "0 0 10px", letterSpacing: 1 }}>
              ☪ IMAM MAHDI
            </h3>
            <SliderParam label="Appearance Year" value={params.mahdiAppearYear} onChange={v => updateParam("mahdiAppearYear", v)} min={5} max={35} step={1} info="Appears when earth is filled with oppression" />
            <SliderParam label="Stabilization Power" value={params.mahdiStabilizeStrength} onChange={v => updateParam("mahdiStabilizeStrength", v)} min={0.1} max={0.8} step={0.05} info="How much he reduces decay indices" />
            <SliderParam label="Rule Duration (years)" value={params.mahdiStabilizeDuration} onChange={v => updateParam("mahdiStabilizeDuration", v)} min={5} max={9} step={1} info="Abu Dawud 4285: rules for 7 years" />

            <div style={{ height: 1, background: palette.cardBorder, margin: "14px 0" }} />

            <h3 style={{ fontSize: 11, color: palette.dajjalRed, fontFamily: MONO, margin: "0 0 10px", letterSpacing: 1 }}>
              👁 DAJJAL
            </h3>
            <SliderParam label="DPI Threshold" value={params.dajjalThreshold} onChange={v => updateParam("dajjalThreshold", v)} min={4} max={9} step={0.5} info="DPI level that triggers emergence" />
            <SliderParam label="Peak Intensity" value={params.dajjalPeakIntensity} onChange={v => updateParam("dajjalPeakIntensity", v)} min={7} max={10} step={0.1} info="Maximum deception power" />
            <SliderParam label="Year-Long Day Effect" value={params.dajjalYearLongDay} onChange={v => updateParam("dajjalYearLongDay", v)} info="Muslim 2937a: 40 days, first like a year" />
            <SliderParam label="ʿĪsā Descent Delay" value={params.isaDescentDelay} onChange={v => updateParam("isaDescentDelay", v)} min={0.5} max={5} step={0.5} unit=" yrs" info="Time from Dajjal to ʿĪsā's descent" />

            <div style={{ height: 1, background: palette.cardBorder, margin: "14px 0" }} />

            <SliderParam label="Symbolic Horizon" value={params.horizonYears} onChange={v => updateParam("horizonYears", v)} min={20} max={60} step={5} unit=" yrs" />

            <button
              onClick={() => setParams(DEFAULT_PARAMS)}
              style={{
                width: "100%", padding: "8px 0", marginTop: 10,
                background: "transparent", border: `1px solid ${palette.cardBorder}`,
                color: palette.textDim, borderRadius: 6, cursor: "pointer", fontSize: 10, fontFamily: MONO
              }}
            >
              ↺ Reset All Parameters
            </button>
          </div>
        )}

        {/* MAIN CONTENT */}
        <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
          {/* STATS BAR */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8, marginBottom: 14 }}>
            {[
              { label: "Peak DPI", value: peakDPI.toFixed(1), color: palette.gold },
              { label: "Peak Dajjal", value: peakDajjal.toFixed(1), color: palette.dajjalRed },
              { label: "Mahdi Duration", value: `${params.mahdiStabilizeDuration}y`, color: palette.mahdiGreen },
              { label: "DPI @ Dajjal", value: data.find(d => d.year >= events.dajjalAppear)?.dpi.toFixed(1) || "—", color: palette.purple },
            ].map((s, i) => (
              <div key={i} style={{
                padding: "10px 12px", background: palette.card, border: `1px solid ${palette.cardBorder}`,
                borderRadius: 8, textAlign: "center"
              }}>
                <div style={{ fontSize: 9, color: palette.textFaint, fontFamily: MONO, marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: s.color, fontFamily: MONO }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* TABS */}
          <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "6px 14px", border: `1px solid ${activeTab === tab.id ? palette.gold : palette.cardBorder}`,
                  background: activeTab === tab.id ? `${palette.gold}15` : "transparent",
                  color: activeTab === tab.id ? palette.gold : palette.textDim,
                  borderRadius: 6, cursor: "pointer", fontSize: 11, fontFamily: MONO, transition: "all 0.2s"
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* CHART: MAIN DPI + ENTITIES */}
          {activeTab === "main" && (
            <div style={{ background: palette.card, border: `1px solid ${palette.cardBorder}`, borderRadius: 10, padding: 14 }}>
              <h3 style={{ fontSize: 12, color: palette.gold, fontFamily: MONO, margin: "0 0 10px" }}>
                Dajjal Probability Index (DPI) + Entity Influence Over Time
              </h3>
              <ResponsiveContainer width="100%" height={380}>
                <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dpiGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={palette.gold} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={palette.gold} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="dajjalGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={palette.dajjalRed} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={palette.dajjalRed} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="year" tick={{ fontSize: 10, fill: palette.textFaint, fontFamily: MONO }} label={{ value: "Symbolic Year", position: "insideBottom", offset: -2, fontSize: 10, fill: palette.textDim }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: palette.textFaint, fontFamily: MONO }} />
                  <Tooltip content={<CustomTooltip />} />

                  <ReferenceArea x1={events.mahdiAppear} x2={events.mahdiEnd} fill={palette.mahdiGreen} fillOpacity={0.06} />
                  <ReferenceArea x1={events.dajjalAppear} x2={events.dajjalDefeated} fill={palette.dajjalRed} fillOpacity={0.06} />

                  <ReferenceLine x={events.mahdiAppear} stroke={palette.mahdiGreen} strokeDasharray="5 3" label={{ value: "☪ Mahdi", position: "top", fontSize: 9, fill: palette.mahdiGreen }} />
                  <ReferenceLine x={events.dajjalAppear} stroke={palette.dajjalRed} strokeDasharray="5 3" label={{ value: "👁 Dajjal", position: "top", fontSize: 9, fill: palette.dajjalRed }} />
                  <ReferenceLine x={events.isaDescend} stroke={palette.isaBlue} strokeDasharray="5 3" label={{ value: "ʿĪsā ﷺ", position: "top", fontSize: 9, fill: palette.isaBlue }} />
                  <ReferenceLine y={params.dajjalThreshold} stroke={palette.dajjalRed} strokeDasharray="8 4" strokeOpacity={0.4} label={{ value: `DPI Threshold (${params.dajjalThreshold})`, position: "right", fontSize: 9, fill: palette.textFaint }} />

                  <Area type="monotone" dataKey="dpi" name="DPI (weighted)" stroke={palette.gold} fill="url(#dpiGrad)" strokeWidth={2.5} dot={false} />
                  <Area type="monotone" dataKey="dajjalInfluence" name="Dajjal Influence" stroke={palette.dajjalRed} fill="url(#dajjalGrad)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="mahdiIndex" name="Mahdi Stabilization" stroke={palette.mahdiGreen} strokeWidth={2} dot={false} strokeDasharray="6 3" />
                  <Line type="monotone" dataKey="isaInfluence" name="ʿĪsā Peace Effect" stroke={palette.isaBlue} strokeWidth={2} dot={false} strokeDasharray="4 2" />

                  <Legend wrapperStyle={{ fontSize: 10, fontFamily: MONO }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* CHART: 8 SIGN INDICES */}
          {activeTab === "signs" && (
            <div style={{ background: palette.card, border: `1px solid ${palette.cardBorder}`, borderRadius: 10, padding: 14 }}>
              <h3 style={{ fontSize: 12, color: palette.gold, fontFamily: MONO, margin: "0 0 10px" }}>
                All 8 Sign Indices Over Time (with Mahdi & Dajjal Effects)
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="year" tick={{ fontSize: 10, fill: palette.textFaint, fontFamily: MONO }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: palette.textFaint, fontFamily: MONO }} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine x={events.mahdiAppear} stroke={palette.mahdiGreen} strokeDasharray="5 3" />
                  <ReferenceLine x={events.dajjalAppear} stroke={palette.dajjalRed} strokeDasharray="5 3" />
                  <ReferenceLine x={events.dajjalDefeated} stroke={palette.isaBlue} strokeDasharray="5 3" />

                  <Line type="monotone" dataKey="moralDecay" name="Moral Decay" stroke={SIGN_DESCRIPTIONS.moralDecay.color} strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="oppression" name="Oppression" stroke={SIGN_DESCRIPTIONS.oppressionTyranny.color} strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="conflict" name="Wars/Conflict" stroke={SIGN_DESCRIPTIONS.globalConflict.color} strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="deception" name="Deception" stroke={SIGN_DESCRIPTIONS.deceptionLies.color} strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="disasters" name="Disasters" stroke={SIGN_DESCRIPTIONS.naturalDisasters.color} strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="religiousDecline" name="Religious Decline" stroke={SIGN_DESCRIPTIONS.religiousDecline.color} strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="cosmicSigns" name="Cosmic Signs" stroke={SIGN_DESCRIPTIONS.cosmicPhenomena.color} strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="confusion" name="Confusion" stroke={SIGN_DESCRIPTIONS.socialConfusion.color} strokeWidth={1.5} dot={false} />
                  <Legend wrapperStyle={{ fontSize: 9, fontFamily: MONO }} />
                </LineChart>
              </ResponsiveContainer>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 6, marginTop: 12 }}>
                <SignCard sign={SIGN_DESCRIPTIONS.moralDecay} value={lastPoint.moralDecay} />
                <SignCard sign={SIGN_DESCRIPTIONS.oppressionTyranny} value={lastPoint.oppression} />
                <SignCard sign={SIGN_DESCRIPTIONS.globalConflict} value={lastPoint.conflict} />
                <SignCard sign={SIGN_DESCRIPTIONS.deceptionLies} value={lastPoint.deception} />
                <SignCard sign={SIGN_DESCRIPTIONS.naturalDisasters} value={lastPoint.disasters} />
                <SignCard sign={SIGN_DESCRIPTIONS.religiousDecline} value={lastPoint.religiousDecline} />
                <SignCard sign={SIGN_DESCRIPTIONS.cosmicPhenomena} value={lastPoint.cosmicSigns} />
                <SignCard sign={SIGN_DESCRIPTIONS.socialConfusion} value={lastPoint.confusion} />
              </div>
            </div>
          )}

          {/* CHART: DAJJAL DETAIL */}
          {activeTab === "dajjal" && (
            <div style={{ background: palette.card, border: `1px solid ${palette.cardBorder}`, borderRadius: 10, padding: 14 }}>
              <h3 style={{ fontSize: 12, color: palette.dajjalRed, fontFamily: MONO, margin: "0 0 4px" }}>
                👁 Dajjal Influence Detail — Year-Long Day Model
              </h3>
              <p style={{ fontSize: 10, color: palette.textFaint, fontFamily: MONO, margin: "0 0 12px", lineHeight: 1.5 }}>
                Muslim 2937a: "40 days — one like a year, one like a month, one like a week, rest normal."
                Total ≈ 439 equivalent days. Modeled as stepped intensity phases.
              </p>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={data.filter(d => d.year >= events.dajjalAppear - 3 && d.year <= events.dajjalDefeated + 5)} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dajjalDetailGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={palette.dajjalRed} stopOpacity={0.5} />
                      <stop offset="100%" stopColor={palette.dajjalRed} stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="year" tick={{ fontSize: 10, fill: palette.textFaint, fontFamily: MONO }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: palette.textFaint, fontFamily: MONO }} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine x={events.dajjalAppear} stroke={palette.dajjalRed} strokeDasharray="5 3" label={{ value: "Emerges", position: "top", fontSize: 9, fill: palette.dajjalRed }} />
                  <ReferenceLine x={events.isaDescend} stroke={palette.isaBlue} strokeDasharray="5 3" label={{ value: "ʿĪsā", position: "top", fontSize: 9, fill: palette.isaBlue }} />
                  <ReferenceLine x={events.dajjalDefeated} stroke={palette.cyan} strokeDasharray="5 3" label={{ value: "Defeated at Ludd", position: "top", fontSize: 9, fill: palette.cyan }} />
                  <Area type="monotone" dataKey="dajjalInfluence" name="Dajjal Influence" stroke={palette.dajjalRed} fill="url(#dajjalDetailGrad)" strokeWidth={2.5} dot={false} />
                  <Area type="monotone" dataKey="deception" name="Deception Index" stroke={palette.gold} fill="none" strokeWidth={1.5} dot={false} />
                  <Area type="monotone" dataKey="confusion" name="Confusion Index" stroke={palette.purple} fill="none" strokeWidth={1.5} dot={false} />
                  <Legend wrapperStyle={{ fontSize: 10, fontFamily: MONO }} />
                </AreaChart>
              </ResponsiveContainer>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 6, marginTop: 12 }}>
                {[
                  { phase: "Day 1 (Year)", pct: "100%", desc: "365 equiv. days", color: "#DC2626" },
                  { phase: "Day 2 (Month)", pct: "85%", desc: "30 equiv. days", color: "#EA580C" },
                  { phase: "Day 3 (Week)", pct: "70%", desc: "7 equiv. days", color: "#D97706" },
                  { phase: "Days 4–40", pct: "50%", desc: "37 normal days", color: "#CA8A04" },
                ].map((p, i) => (
                  <div key={i} style={{
                    padding: 8, background: `${p.color}12`, border: `1px solid ${p.color}30`,
                    borderRadius: 6, textAlign: "center"
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: p.color, fontFamily: MONO }}>{p.phase}</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: p.color, fontFamily: MONO, margin: "2px 0" }}>{p.pct}</div>
                    <div style={{ fontSize: 8, color: palette.textFaint }}>{p.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DATA TABLE */}
          {activeTab === "table" && (
            <div style={{ background: palette.card, border: `1px solid ${palette.cardBorder}`, borderRadius: 10, padding: 14, overflowX: "auto" }}>
              <h3 style={{ fontSize: 12, color: palette.gold, fontFamily: MONO, margin: "0 0 10px" }}>
                Full Symbolic Timeline Data
              </h3>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10, fontFamily: MONO }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${palette.cardBorder}` }}>
                    {["Year", "Moral", "Oppress", "Conflict", "Decept", "Disast", "Relig↓", "Cosmic", "Confus", "DPI", "Mahdi", "Dajjal", "ʿĪsā"].map(h => (
                      <th key={h} style={{ padding: "6px 4px", color: palette.gold, textAlign: "right", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.filter((_, i) => i % 2 === 0).map((row, i) => {
                    const isMahdi = row.year >= events.mahdiAppear && row.year <= events.mahdiEnd;
                    const isDajjal = row.year >= events.dajjalAppear && row.year <= events.dajjalDefeated;
                    const bgColor = isDajjal ? "rgba(220,38,38,0.06)" : isMahdi ? "rgba(5,150,105,0.06)" : "transparent";
                    return (
                      <tr key={i} style={{ borderBottom: `1px solid ${palette.cardBorder}22`, background: bgColor }}>
                        <td style={{ padding: "4px", color: palette.textDim, textAlign: "right" }}>{row.year.toFixed(0)}</td>
                        <td style={{ padding: "4px", textAlign: "right", color: SIGN_DESCRIPTIONS.moralDecay.color }}>{row.moralDecay}</td>
                        <td style={{ padding: "4px", textAlign: "right", color: SIGN_DESCRIPTIONS.oppressionTyranny.color }}>{row.oppression}</td>
                        <td style={{ padding: "4px", textAlign: "right", color: SIGN_DESCRIPTIONS.globalConflict.color }}>{row.conflict}</td>
                        <td style={{ padding: "4px", textAlign: "right", color: SIGN_DESCRIPTIONS.deceptionLies.color }}>{row.deception}</td>
                        <td style={{ padding: "4px", textAlign: "right", color: SIGN_DESCRIPTIONS.naturalDisasters.color }}>{row.disasters}</td>
                        <td style={{ padding: "4px", textAlign: "right", color: SIGN_DESCRIPTIONS.religiousDecline.color }}>{row.religiousDecline}</td>
                        <td style={{ padding: "4px", textAlign: "right", color: SIGN_DESCRIPTIONS.cosmicPhenomena.color }}>{row.cosmicSigns}</td>
                        <td style={{ padding: "4px", textAlign: "right", color: SIGN_DESCRIPTIONS.socialConfusion.color }}>{row.confusion}</td>
                        <td style={{ padding: "4px", textAlign: "right", color: palette.gold, fontWeight: 700 }}>{row.dpi}</td>
                        <td style={{ padding: "4px", textAlign: "right", color: palette.mahdiGreen }}>{row.mahdiIndex}</td>
                        <td style={{ padding: "4px", textAlign: "right", color: palette.dajjalRed }}>{row.dajjalInfluence}</td>
                        <td style={{ padding: "4px", textAlign: "right", color: palette.isaBlue }}>{row.isaInfluence}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* MATHEMATICAL MODEL EXPLANATION */}
          <div style={{
            background: palette.card, border: `1px solid ${palette.cardBorder}`, borderRadius: 10,
            padding: 14, marginTop: 14
          }}>
            <h3 style={{ fontSize: 12, color: palette.gold, fontFamily: MONO, margin: "0 0 8px" }}>
              Mathematical Framework
            </h3>
            <div style={{ fontSize: 10, color: palette.textDim, fontFamily: MONO, lineHeight: 1.7 }}>
              <p style={{ margin: "0 0 6px" }}>
                <strong style={{ color: palette.text }}>Sign Indices:</strong> Each of the 8 signs follows a sigmoid (S-curve): S(t) = 10 / (1 + e<sup>-r(t - m)</sup>) where r = growth rate, m = midpoint year. This models gradual onset followed by rapid acceleration — matching the "broken necklace" hadith principle.
              </p>
              <p style={{ margin: "0 0 6px" }}>
                <strong style={{ color: palette.mahdiGreen }}>Mahdi Effect:</strong> Trapezoidal modifier M(t) ∈ [0, strength] applied as multiplicative reduction: Sign'(t) = Sign(t) × (1 - w<sub>i</sub> · M(t)). Oppression receives strongest reduction (w=1.3), disasters least (w=0.5).
              </p>
              <p style={{ margin: "0 0 6px" }}>
                <strong style={{ color: palette.dajjalRed }}>DPI (Dajjal Probability Index):</strong> Weighted composite: DPI = Σ(w<sub>i</sub> · Sign<sub>i</sub>). Weights: Oppression 0.20, Deception 0.20, Moral 0.15, Conflict 0.15, Disasters 0.10, Religious 0.10, Confusion 0.10. Dajjal emerges when DPI ≥ threshold AND t {">"} Mahdi appearance.
              </p>
              <p style={{ margin: "0 0 6px" }}>
                <strong style={{ color: palette.dajjalRed }}>Dajjal 40-Day Model:</strong> Stepped intensity: Phase 1 (0–30%): ramp to peak (year-day), Phase 2 (30–50%): sustained peak, Phase 3 (50–70%): 85% (month-day), Phase 4 (70–85%): 70% (week-day), Phase 5 (85–100%): 50% declining (normal days). Total ≈ 439 equivalent days.
              </p>
              <p style={{ margin: 0 }}>
                <strong style={{ color: palette.isaBlue }}>Post-ʿĪsā Peace:</strong> Exponential decay of all negative indices by up to 90% over ~5 symbolic years. Cosmic signs inversely increase, modeling the Phase 2 celestial cascade (Smoke, Sun, Beast, Fire).
              </p>
            </div>
          </div>

          {/* DPI WEIGHT TABLE */}
          <div style={{
            background: palette.card, border: `1px solid ${palette.cardBorder}`, borderRadius: 10,
            padding: 14, marginTop: 14
          }}>
            <h3 style={{ fontSize: 12, color: palette.gold, fontFamily: MONO, margin: "0 0 8px" }}>
              DPI Weight Justification (from Hadith)
            </h3>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10, fontFamily: MONO }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${palette.cardBorder}` }}>
                  <th style={{ padding: 6, textAlign: "left", color: palette.gold }}>Index</th>
                  <th style={{ padding: 6, textAlign: "center", color: palette.gold }}>Weight</th>
                  <th style={{ padding: 6, textAlign: "left", color: palette.gold }}>Rationale</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Oppression", "20%", "Direct prerequisite: Mahdi appears to fill earth with justice (Abu Dawud 4283)"],
                  ["Deception", "20%", "Dajjal = 'the deceiver'; Ruwaybidah precede him (Ibn Majah 4036)"],
                  ["Moral Decay", "15%", "Widespread immorality makes people susceptible (Bukhari 81)"],
                  ["Conflict", "15%", "Malhama precedes Dajjal within 7 months (Abu Dawud 4296)"],
                  ["Disasters", "10%", "3-year famine precedes Dajjal (Ibn Majah 4077)"],
                  ["Religious Decline", "10%", "Knowledge lifted = vulnerability to false claims (Bukhari 100)"],
                  ["Confusion", "10%", "Fitnah in every home creates spiritual chaos (Bukhari 7094)"],
                ].map(([idx, wt, reason], i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${palette.cardBorder}22` }}>
                    <td style={{ padding: "5px 6px", color: palette.text }}>{idx}</td>
                    <td style={{ padding: "5px 6px", textAlign: "center", color: palette.gold, fontWeight: 700 }}>{wt}</td>
                    <td style={{ padding: "5px 6px", color: palette.textDim, lineHeight: 1.4 }}>{reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
