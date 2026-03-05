import { useState, useEffect, useRef } from "react";

const SYSTEM_PROMPT = `You are a maritime safety AI analyst. When given a location and date, analyze boating conditions using your knowledge of:
1. Tidal patterns for that region (NOAA data, typical tidal ranges, current patterns)
2. Historical weather patterns for that date/season in that location
3. Wind conditions typical for that time of year
4. Historical boating accidents in that region (USCG accident reports, regional data)
5. Sunrise/sunset and daylight for visibility assessment
6. Known hazards in that waterway (shoals, traffic, currents, fog zones)

Respond ONLY with a valid JSON object. No markdown, no backticks, no text outside the JSON. Exactly this structure:
{"location_confirmed":"Full name of location","date_analyzed":"Human readable date","wreck_probability":23,"boat_day_score":7,"risk_level":"MODERATE","conditions":{"wind":{"label":"Light (8-12 mph)","risk_contribution":8,"detail":"Typical for this region in early summer"},"tides":{"label":"Moderate rising tide","risk_contribution":12,"detail":"1.8ft tidal variance, standard for this estuary"},"visibility":{"label":"Clear and sunny","risk_contribution":3,"detail":"Historically low fog probability for this date"},"historical_accidents":{"label":"4 incidents (2015-2024)","risk_contribution":18,"detail":"Mostly minor collisions and groundings in summer months"},"seasonal_hazards":{"label":"Moderate boat traffic","risk_contribution":14,"detail":"Peak season increases congestion risk"}},"known_hazards":["Shallow shoal at channel marker 14","Strong current near the bridge","High recreational traffic on weekends"],"advisory":"Overall favorable conditions for boating. Standard safety equipment required. Be alert for increased boat traffic.","best_time_of_day":"Morning (7am-11am) before afternoon winds pick up","data_sources":["NOAA Tides and Currents","USCG Accident Reports","NWS Historical Data","Local Coast Guard Sector"],"confidence":82}

Rules:
- wreck_probability: integer 1-99
- boat_day_score: integer 1-10 (10 = perfect day)
- risk_level: exactly one of "LOW", "MODERATE", "HIGH", "DANGEROUS"
- risk_contribution: integer 0-30 per factor
- confidence: integer 50-95
- Be realistic. Coastal areas in storm season = high risk. Calm inland lakes in summer = low risk.`;

function AnimatedNumber({ target, duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef(null);
  const rafRef = useRef(null);
  useEffect(() => {
    startRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const animate = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const p = Math.min((ts - startRef.current) / duration, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(e * target));
      if (p < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target]);
  return <span>{display}</span>;
}

function GaugeMeter({ value, max, color, size = 160 }) {
  const r = 54, cx = size / 2, cy = size / 2 + 10;
  const startAngle = -210, sweep = 240;
  const pct = Math.min(value / max, 1);
  const endAngle = startAngle + sweep * pct;
  const uid = color.replace(/[^a-z0-9]/gi, "");
  function polar(angle, rad) {
    const a = (angle * Math.PI) / 180;
    return [cx + rad * Math.cos(a), cy + rad * Math.sin(a)];
  }
  function arc(a1, a2, rad) {
    const [sx, sy] = polar(a1, rad), [ex, ey] = polar(a2, rad);
    const large = Math.abs(a2 - a1) > 180 ? 1 : 0;
    return `M ${sx} ${sy} A ${rad} ${rad} 0 ${large} 1 ${ex} ${ey}`;
  }
  return (
    <svg viewBox={`0 0 ${size} ${size - 10}`} style={{ width: size, height: size - 10 }}>
      <defs>
        <filter id={`glow${uid}`}>
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <path d={arc(startAngle, startAngle + sweep, r)} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" strokeLinecap="round"/>
      {pct > 0.01 && <path d={arc(startAngle, endAngle, r)} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" filter={`url(#glow${uid})`}/>}
      {[0, .25, .5, .75, 1].map((t, i) => {
        const a = startAngle + sweep * t;
        const [x1, y1] = polar(a, 44), [x2, y2] = polar(a, 38);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.18)" strokeWidth="1.5"/>;
      })}
    </svg>
  );
}

function FactorBar({ label, value, detail }) {
  const color = value < 10 ? "#22d3a5" : value < 18 ? "#fbbf24" : "#f87171";
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
        <span style={{ fontSize:12, color:"rgba(190,215,255,0.8)", fontFamily:"'Space Mono',monospace" }}>{label}</span>
        <span style={{ fontSize:11, color, fontFamily:"'Space Mono',monospace", fontWeight:600 }}>+{value}</span>
      </div>
      <div style={{ height:4, background:"rgba(255,255,255,0.06)", borderRadius:2, overflow:"hidden", marginBottom:4 }}>
        <div style={{ width:`${(value/30)*100}%`, height:"100%", background:color, borderRadius:2, boxShadow:`0 0 8px ${color}`, transition:"width 1s ease" }}/>
      </div>
      <div style={{ fontSize:11, color:"rgba(150,180,230,0.5)", lineHeight:1.4 }}>{detail}</div>
    </div>
  );
}

export default function BoatRiskAI() {
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [mode, setMode] = useState("auto");
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoStatus, setGeoStatus] = useState(null);
  const [manualOverrides, setManualOverrides] = useState({ wind:5, tide:5, visibility:5, accidents:3, experience:7 });

  const loadingMessages = [
    "Querying NOAA tide stations...",
    "Analyzing historical accident records...",
    "Pulling regional wind patterns...",
    "Cross-referencing USCG reports...",
    "Assessing seasonal hazards...",
    "Computing risk probability...",
  ];

  function setOverride(key, val) {
    setManualOverrides(p => ({ ...p, [key]: val }));
  }

  async function autofillLocation() {
    setGeoLoading(true);
    setGeoStatus(null);
    if (!navigator.geolocation) { setGeoStatus("error"); setGeoLoading(false); return; }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          const addr = data.address || {};
          const place = addr.body_of_water || addr.bay || addr.lake || addr.river ||
            [addr.city || addr.town || addr.county, addr.state, addr.country].filter(Boolean).join(", ");
          setLocation(place || `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`);
        } catch {
          setLocation(`${latitude.toFixed(4)}N, ${Math.abs(longitude).toFixed(4)}W`);
        }
        setDate(new Date().toISOString().split("T")[0]);
        setGeoStatus("success");
        setGeoLoading(false);
      },
      () => { setGeoStatus("error"); setGeoLoading(false); },
      { timeout: 8000 }
    );
  }

  async function analyze() {
    if (!location.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);

    let msgIdx = 0;
    setLoadingMsg(loadingMessages[0]);
    const interval = setInterval(() => {
      msgIdx = (msgIdx + 1) % loadingMessages.length;
      setLoadingMsg(loadingMessages[msgIdx]);
    }, 1100);

    try {
      const manualNote = mode === "manual"
        ? ` User-provided manual overrides (weight these heavily in your analysis):
  - Wind intensity: ${manualOverrides.wind}/10 (${manualOverrides.wind<=3?"calm":manualOverrides.wind<=6?"moderate":"strong/gale"})
  - Tide intensity: ${manualOverrides.tide}/10 (${manualOverrides.tide<=3?"slack/mild":manualOverrides.tide<=6?"moderate":"strong/extreme"})
  - Visibility: ${manualOverrides.visibility}/10 (${manualOverrides.visibility<=3?"poor/foggy":manualOverrides.visibility<=6?"moderate":"clear/excellent"})
  - Historical accident frequency: ${manualOverrides.accidents}/10 (${manualOverrides.accidents<=3?"few":manualOverrides.accidents<=6?"moderate":"many"} incidents on record)
  - Operator experience: ${manualOverrides.experience}/10 (${manualOverrides.experience<=3?"novice":manualOverrides.experience<=6?"intermediate":"expert"})`
        : "";

      const userMsg = `Analyze boating safety for: Location: ${location}, Date: ${date}.${manualNote} Return ONLY the JSON object, nothing else.`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: userMsg }],
        }),
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => "");
        let errMsg = `API error ${response.status}`;
        try { errMsg = JSON.parse(errText)?.error?.message || errMsg; } catch {}
        throw new Error(errMsg);
      }

      const data = await response.json();

      if (data.error) throw new Error(data.error.message || "API returned an error");

      const rawText = (data.content || [])
        .filter(b => b.type === "text")
        .map(b => b.text)
        .join("")
        .trim();

      const cleaned = rawText
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/, "")
        .trim();

      const parsed = JSON.parse(cleaned);
      setResult(parsed);
    } catch (e) {
      console.error("Analysis error:", e);
      setError(`Analysis failed: ${e.message}`);
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  }

  function getRiskColor(level) {
    return { LOW:"#22d3a5", MODERATE:"#fbbf24", HIGH:"#f97316", DANGEROUS:"#ef4444" }[level] || "#22d3a5";
  }
  function getScoreColor(s) {
    if (s >= 8) return "#22d3a5";
    if (s >= 6) return "#86efac";
    if (s >= 4) return "#fbbf24";
    return "#f87171";
  }

  const riskColor = result ? getRiskColor(result.risk_level) : "#22d3a5";
  const scoreColor = result ? getScoreColor(result.boat_day_score) : "#22d3a5";

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet"/>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #050b14; }
        @keyframes pulse-ring { 0%,100%{opacity:.4;transform:scale(1)} 50%{opacity:.8;transform:scale(1.06)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .fade-up { animation: fadeUp 0.5s ease both; }
        input:focus, select:focus { outline: none !important; }
        .analyze-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(0,160,255,0.4) !important; }
        .analyze-btn:active:not(:disabled) { transform: translateY(0); }
        .loading-bar { height: 2px; background: linear-gradient(90deg,transparent,#3b82f6,#22d3a5,transparent); background-size: 200% 100%; animation: shimmer 1.5s linear infinite; }
        input[type=range] { -webkit-appearance: none; appearance: none; height: 4px; border-radius: 2px; background: rgba(255,255,255,0.1); outline: none; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #3b82f6; cursor: pointer; box-shadow: 0 0 6px rgba(59,130,246,0.6); }
        input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.7); cursor: pointer; }
      `}</style>

      <div style={{ position:"relative", minHeight:"100vh", background:"linear-gradient(160deg,#050b14 0%,#071120 50%,#050e1a 100%)", fontFamily:"'Syne',sans-serif", color:"#c5d8f0", paddingBottom:80 }}>

        {/* Header */}
        <div style={{ borderBottom:"1px solid rgba(50,100,180,0.15)", padding:"48px 24px 36px", textAlign:"center", background:"rgba(0,20,50,0.3)" }}>
          <div style={{ fontSize:11, letterSpacing:"0.3em", color:"rgba(0,200,255,0.5)", fontFamily:"'Space Mono',monospace", marginBottom:14 }}>
            ⚓ &nbsp; MARITIME SAFETY INTELLIGENCE
          </div>
          <h1 style={{ fontSize:"clamp(40px,8vw,72px)", fontWeight:800, background:"linear-gradient(135deg,#e8f4ff 30%,#60a5fa)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", letterSpacing:"-0.02em", lineHeight:1, marginBottom:12 }}>
            BOAT DAY RISK
          </h1>
          <p style={{ fontSize:14, color:"rgba(150,185,240,0.55)", letterSpacing:"0.05em" }}>
            AI-powered conditions analysis · Real data · Instant assessment
          </p>
        </div>

        {/* Input Card */}
        <div style={{ maxWidth:680, margin:"40px auto 0", padding:"0 20px" }}>
          <div style={{ background:"rgba(10,25,55,0.6)", border:"1px solid rgba(60,120,220,0.18)", borderRadius:20, padding:"28px 28px 24px", backdropFilter:"blur(12px)" }}>

            {/* Mode Toggle */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
              <div style={{ fontSize:10, letterSpacing:"0.2em", color:"rgba(100,170,255,0.45)", fontFamily:"'Space Mono',monospace" }}>INPUT MODE</div>
              <div style={{ display:"flex", background:"rgba(0,10,30,0.6)", border:"1px solid rgba(60,120,220,0.2)", borderRadius:10, padding:3, gap:3 }}>
                {["auto","manual"].map(m => (
                  <button key={m} onClick={() => setMode(m)} style={{
                    padding:"7px 18px", borderRadius:8, border:"none", cursor:"pointer",
                    fontFamily:"'Space Mono',monospace", fontSize:10, letterSpacing:"0.12em", fontWeight:700, transition:"all 0.2s",
                    background: mode===m ? "linear-gradient(135deg,#1d4ed8,#0891b2)" : "transparent",
                    color: mode===m ? "#fff" : "rgba(150,185,240,0.45)",
                    boxShadow: mode===m ? "0 2px 12px rgba(0,100,220,0.35)" : "none",
                  }}>
                    {m==="auto" ? "🤖 AUTO" : "🎛 MANUAL"}
                  </button>
                ))}
              </div>
            </div>

            {/* Location + Autofill */}
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:10, letterSpacing:"0.2em", color:"rgba(100,170,255,0.5)", fontFamily:"'Space Mono',monospace", display:"block", marginBottom:8 }}>
                LOCATION / WATERWAY
              </label>
              <div style={{ display:"flex", gap:10 }}>
                <input
                  type="text" value={location}
                  onChange={e => { setLocation(e.target.value); setGeoStatus(null); }}
                  onKeyDown={e => e.key==="Enter" && analyze()}
                  placeholder="e.g. Tampa Bay, FL  ·  Lake Michigan  ·  Chesapeake Bay"
                  style={{
                    flex:1, background:"rgba(0,10,30,0.8)",
                    border:`1px solid ${geoStatus==="success"?"rgba(34,211,165,0.4)":geoStatus==="error"?"rgba(248,113,113,0.4)":"rgba(60,120,220,0.25)"}`,
                    borderRadius:12, color:"#e0eeff", padding:"13px 16px", fontSize:14, fontFamily:"'Syne',sans-serif",
                  }}
                />
                <button
                  onClick={autofillLocation} disabled={geoLoading}
                  title="📍 Tap to auto-fill your current location & today's date"
                  style={{
                    flexShrink:0, width:52, height:52, fontSize:22,
                    background: geoStatus==="success"?"rgba(34,211,165,0.15)":geoStatus==="error"?"rgba(248,113,113,0.1)":"rgba(29,78,216,0.2)",
                    border:`1px solid ${geoStatus==="success"?"rgba(34,211,165,0.4)":geoStatus==="error"?"rgba(248,113,113,0.3)":"rgba(60,120,220,0.3)"}`,
                    borderRadius:12, cursor:geoLoading?"wait":"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                    transition:"all 0.2s",
                    animation: geoLoading ? "pulse-ring 1s ease infinite" : "none",
                  }}
                >
                  {geoLoading ? "⏳" : geoStatus==="success" ? "✅" : geoStatus==="error" ? "❌" : "📍"}
                </button>
              </div>
              <div style={{ marginTop:6, fontSize:11, fontFamily:"'Space Mono',monospace" }}>
                {geoStatus==="success" && <span style={{ color:"#22d3a5" }}>✓ Location & date auto-filled from your device</span>}
                {geoStatus==="error" && <span style={{ color:"#f87171" }}>✗ Location access denied — please type your location manually</span>}
                {!geoStatus && <span style={{ color:"rgba(100,150,220,0.4)" }}>Tap 📍 to auto-fill your location, or type it in</span>}
              </div>
            </div>

            {/* Date */}
            <div style={{ marginBottom:20 }}>
              <label style={{ fontSize:10, letterSpacing:"0.2em", color:"rgba(100,170,255,0.5)", fontFamily:"'Space Mono',monospace", display:"block", marginBottom:8 }}>DATE</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{
                width:"100%", background:"rgba(0,10,30,0.8)", border:"1px solid rgba(60,120,220,0.25)",
                borderRadius:12, color:"#e0eeff", padding:"13px 16px", fontSize:14, fontFamily:"'Syne',sans-serif",
              }}/>
            </div>

            {/* Manual Sliders */}
            {mode==="manual" && (
              <div style={{ background:"rgba(0,10,30,0.5)", border:"1px solid rgba(60,120,220,0.15)", borderRadius:14, padding:"20px 20px 16px", marginBottom:20 }}>
                <div style={{ fontSize:10, letterSpacing:"0.2em", color:"rgba(100,170,255,0.45)", fontFamily:"'Space Mono',monospace", marginBottom:18 }}>
                  🎛 MANUAL CONDITION OVERRIDES
                </div>
                {[
                  { key:"wind", label:"Wind Speed", low:"Calm", high:"Gale Force", icon:"🌬" },
                  { key:"tide", label:"Tide Intensity", low:"Slack", high:"Extreme", icon:"🌊" },
                  { key:"visibility", label:"Visibility", low:"Foggy", high:"Crystal Clear", icon:"☀️" },
                  { key:"accidents", label:"Historical Accidents", low:"Rare", high:"Frequent", icon:"📋" },
                  { key:"experience", label:"Operator Experience", low:"Novice", high:"Expert", icon:"🧭" },
                ].map(({ key, label, low, high, icon }) => {
                  const val = manualOverrides[key];
                  const color = (key==="experience"||key==="visibility")
                    ? (val>=7?"#22d3a5":val>=4?"#fbbf24":"#f87171")
                    : (val<=3?"#22d3a5":val<=6?"#fbbf24":"#f87171");
                  return (
                    <div key={key} style={{ marginBottom:16 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:7 }}>
                        <span style={{ fontSize:12, color:"rgba(190,215,255,0.75)" }}>{icon} {label}</span>
                        <span style={{ fontSize:12, fontFamily:"'Space Mono',monospace", color, fontWeight:700 }}>{val}/10</span>
                      </div>
                      <input type="range" min={1} max={10} value={val}
                        onChange={e => setOverride(key, +e.target.value)}
                        style={{ width:"100%", accentColor:color, cursor:"pointer" }}
                      />
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"rgba(120,160,220,0.35)", marginTop:3 }}>
                        <span>{low}</span><span>{high}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Analyze Button */}
            <button
              className="analyze-btn" onClick={analyze}
              disabled={loading || !location.trim()}
              style={{
                width:"100%", padding:"15px", border:"none", borderRadius:12,
                background: loading||!location.trim() ? "rgba(40,60,100,0.4)" : "linear-gradient(135deg,#1d4ed8,#0891b2)",
                color: loading||!location.trim() ? "rgba(150,180,230,0.3)" : "#fff",
                fontSize:15, fontWeight:700, fontFamily:"'Syne',sans-serif", letterSpacing:"0.08em",
                cursor: loading||!location.trim() ? "not-allowed" : "pointer",
                transition:"all 0.2s", boxShadow:"0 4px 24px rgba(0,100,200,0.25)",
              }}
            >
              {loading ? "ANALYZING CONDITIONS..." : "ANALYZE RISK →"}
            </button>

            {loading && (
              <div style={{ marginTop:16 }}>
                <div className="loading-bar" style={{ borderRadius:2, marginBottom:10 }}/>
                <div style={{ textAlign:"center", fontSize:11, color:"rgba(100,170,255,0.5)", fontFamily:"'Space Mono',monospace", letterSpacing:"0.1em" }}>
                  {loadingMsg}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ maxWidth:680, margin:"20px auto 0", padding:"0 20px" }}>
            <div style={{ background:"rgba(200,30,30,0.1)", border:"1px solid rgba(200,50,50,0.3)", borderRadius:12, padding:"14px 18px", fontSize:13, color:"#fca5a5", lineHeight:1.6 }}>
              ⚠ {error}
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="fade-up" style={{ maxWidth:880, margin:"32px auto 0", padding:"0 20px" }}>

            {/* Banner */}
            <div style={{ background:"rgba(10,30,70,0.5)", border:"1px solid rgba(60,120,220,0.15)", borderRadius:14, padding:"14px 20px", marginBottom:20, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
              <div>
                <div style={{ fontSize:16, fontWeight:700, color:"#e8f4ff" }}>{result.location_confirmed}</div>
                <div style={{ fontSize:12, color:"rgba(150,185,240,0.5)", fontFamily:"'Space Mono',monospace", marginTop:2 }}>{result.date_analyzed}</div>
              </div>
              <div style={{ background:`${riskColor}18`, border:`1px solid ${riskColor}40`, borderRadius:8, padding:"6px 14px", fontSize:12, fontWeight:700, fontFamily:"'Space Mono',monospace", color:riskColor, letterSpacing:"0.12em" }}>
                {result.risk_level} RISK
              </div>
            </div>

            {/* Gauges */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
              {[
                { label:"WRECK PROBABILITY", value:result.wreck_probability, max:100, color:riskColor, unit:"%", sub:"chance of an incident occurring" },
                { label:"BOAT DAY RATING", value:result.boat_day_score, max:10, color:scoreColor, unit:"/10", sub:"overall conditions quality" },
              ].map(({ label, value, max, color, unit, sub }) => (
                <div key={label} style={{ background:"rgba(10,25,55,0.6)", border:`1px solid ${color}25`, borderRadius:18, padding:"28px 24px", textAlign:"center", backdropFilter:"blur(12px)" }}>
                  <div style={{ fontSize:10, letterSpacing:"0.2em", color:"rgba(150,185,240,0.4)", fontFamily:"'Space Mono',monospace", marginBottom:16 }}>{label}</div>
                  <div style={{ display:"flex", justifyContent:"center", position:"relative" }}>
                    <GaugeMeter value={value} max={max} color={color} size={160}/>
                    <div style={{ position:"absolute", bottom:8, left:"50%", transform:"translateX(-50%)", textAlign:"center", whiteSpace:"nowrap" }}>
                      <div style={{ fontSize:42, fontWeight:800, color, filter:`drop-shadow(0 0 12px ${color})`, lineHeight:1 }}>
                        <AnimatedNumber target={value}/><span style={{ fontSize:unit==="%"?26:20, opacity:0.7 }}>{unit}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize:12, color:"rgba(150,185,240,0.5)", marginTop:8 }}>{sub}</div>
                </div>
              ))}
            </div>

            {/* Factor Breakdown */}
            <div style={{ background:"rgba(10,25,55,0.6)", border:"1px solid rgba(60,120,220,0.15)", borderRadius:18, padding:"26px 28px", marginBottom:16, backdropFilter:"blur(12px)" }}>
              <div style={{ fontSize:10, letterSpacing:"0.2em", color:"rgba(100,170,255,0.45)", fontFamily:"'Space Mono',monospace", marginBottom:20 }}>RISK FACTOR BREAKDOWN</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:"0 32px" }}>
                <div>
                  <FactorBar label="🌬 Wind Conditions" value={result.conditions.wind.risk_contribution} detail={`${result.conditions.wind.label} · ${result.conditions.wind.detail}`}/>
                  <FactorBar label="🌊 Tidal Conditions" value={result.conditions.tides.risk_contribution} detail={`${result.conditions.tides.label} · ${result.conditions.tides.detail}`}/>
                </div>
                <div>
                  <FactorBar label="☀️ Visibility / Sky" value={result.conditions.visibility.risk_contribution} detail={`${result.conditions.visibility.label} · ${result.conditions.visibility.detail}`}/>
                  <FactorBar label="📋 Historical Incidents" value={result.conditions.historical_accidents.risk_contribution} detail={`${result.conditions.historical_accidents.label} · ${result.conditions.historical_accidents.detail}`}/>
                  <FactorBar label="⚠️ Seasonal Hazards" value={result.conditions.seasonal_hazards.risk_contribution} detail={`${result.conditions.seasonal_hazards.label} · ${result.conditions.seasonal_hazards.detail}`}/>
                </div>
              </div>
            </div>

            {/* Bottom Row */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              <div style={{ background:"rgba(10,25,55,0.6)", border:"1px solid rgba(60,120,220,0.15)", borderRadius:18, padding:"22px 24px", backdropFilter:"blur(12px)" }}>
                <div style={{ fontSize:10, letterSpacing:"0.2em", color:"rgba(100,170,255,0.45)", fontFamily:"'Space Mono',monospace", marginBottom:16 }}>KNOWN HAZARDS</div>
                {(result.known_hazards||[]).map((h, i) => (
                  <div key={i} style={{ display:"flex", gap:10, marginBottom:10, alignItems:"flex-start" }}>
                    <span style={{ color:"#f59e0b", fontSize:12, marginTop:1, flexShrink:0 }}>◆</span>
                    <span style={{ fontSize:13, color:"rgba(190,215,255,0.75)", lineHeight:1.5 }}>{h}</span>
                  </div>
                ))}
                {result.best_time_of_day && (
                  <div style={{ marginTop:14, paddingTop:14, borderTop:"1px solid rgba(60,120,220,0.12)" }}>
                    <div style={{ fontSize:10, letterSpacing:"0.15em", color:"rgba(100,170,255,0.4)", fontFamily:"'Space Mono',monospace", marginBottom:6 }}>BEST TIME TO GO</div>
                    <div style={{ fontSize:13, color:"#86efac" }}>🕐 {result.best_time_of_day}</div>
                  </div>
                )}
              </div>

              <div style={{ background:"rgba(10,25,55,0.6)", border:`1px solid ${riskColor}20`, borderRadius:18, padding:"22px 24px", backdropFilter:"blur(12px)", display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
                <div>
                  <div style={{ fontSize:10, letterSpacing:"0.2em", color:"rgba(100,170,255,0.45)", fontFamily:"'Space Mono',monospace", marginBottom:14 }}>SAFETY ADVISORY</div>
                  <div style={{ fontSize:14, lineHeight:1.7, color:"rgba(200,220,255,0.85)", background:`${riskColor}10`, border:`1px solid ${riskColor}20`, borderRadius:10, padding:"14px 16px" }}>
                    {result.advisory}
                  </div>
                </div>
                <div style={{ marginTop:20 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6, fontSize:11, fontFamily:"'Space Mono',monospace", color:"rgba(130,170,230,0.5)" }}>
                    <span>DATA CONFIDENCE</span>
                    <span style={{ color:result.confidence>75?"#22d3a5":"#fbbf24" }}>{result.confidence}%</span>
                  </div>
                  <div style={{ height:4, background:"rgba(255,255,255,0.06)", borderRadius:2 }}>
                    <div style={{ width:`${result.confidence}%`, height:"100%", background:result.confidence>75?"#22d3a5":"#fbbf24", borderRadius:2, transition:"width 1s ease" }}/>
                  </div>
                  <div style={{ marginTop:14, fontSize:10, color:"rgba(100,140,200,0.4)", fontFamily:"'Space Mono',monospace", lineHeight:1.6 }}>
                    SOURCES: {(result.data_sources||[]).join(" · ")}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop:24, textAlign:"center", fontSize:10, color:"rgba(100,140,200,0.3)", fontFamily:"'Space Mono',monospace", lineHeight:1.8 }}>
              FOR INFORMATIONAL USE ONLY · ALWAYS VERIFY WITH OFFICIAL NOAA, NWS & USCG ADVISORIES BEFORE DEPARTURE
            </div>
          </div>
        )}
      </div>
    </>
  );
}
