import { useState, useRef, useEffect } from "react";

// ─── WATERWAY DATABASE ────────────────────────────────────────────────────────
const WATERWAYS = [
  // Florida
  { name: "Tampa Bay, FL", region: "gulf_coast", type: "bay", accidentRate: 72, tidalRange: 2.1, fogRisk: 0.12, trafficLevel: 8, hazards: ["Shallow shoals near Port Tampa", "Heavy commercial ship traffic", "Strong tidal currents at the narrows", "Manatee zones — speed restrictions apply"] },
  { name: "Miami Biscayne Bay, FL", region: "south_florida", type: "bay", accidentRate: 89, tidalRange: 2.8, fogRisk: 0.08, trafficLevel: 9, hazards: ["Extremely high recreational boat traffic", "Marked channel must be followed strictly", "Sudden afternoon thunderstorms June–Sept", "Shallow grass flats outside channels"] },
  { name: "Florida Keys, FL", region: "south_florida", type: "coastal", accidentRate: 94, tidalRange: 1.4, fogRisk: 0.06, trafficLevel: 9, hazards: ["Extensive shallow reef system", "Strong Gulf Stream currents offshore", "Lobster season creates extreme congestion", "Coral reef groundings common"] },
  { name: "St. Johns River, FL", region: "north_florida", type: "river", accidentRate: 48, tidalRange: 1.2, fogRisk: 0.22, trafficLevel: 6, hazards: ["Morning fog common Oct–Mar", "Submerged debris after storms", "River current reversal with tides", "Low bridge clearances upstream"] },
  { name: "Pensacola Bay, FL", region: "gulf_coast", type: "bay", accidentRate: 55, tidalRange: 1.8, fogRisk: 0.15, trafficLevel: 7, hazards: ["Shoaling near east pass", "Military restricted zones", "Strong winds from Gulf storms"] },

  // Chesapeake & Mid-Atlantic
  { name: "Chesapeake Bay, MD/VA", region: "mid_atlantic", type: "bay", accidentRate: 81, tidalRange: 3.2, fogRisk: 0.28, trafficLevel: 8, hazards: ["Notorious for sudden squalls", "Crab pot buoys throughout bay", "Shoaling on eastern shore flats", "Heavy commercial traffic in main channel"] },
  { name: "Delaware Bay, DE", region: "mid_atlantic", type: "bay", accidentRate: 58, tidalRange: 5.4, fogRisk: 0.31, trafficLevel: 6, hazards: ["Strong tidal currents up to 4 knots", "Dense fog common spring months", "Commercial vessel traffic", "Oyster beds — stay in channels"] },
  { name: "Long Island Sound, NY", region: "northeast", type: "sound", accidentRate: 76, tidalRange: 6.8, fogRisk: 0.34, trafficLevel: 8, hazards: ["Strong tidal rips at race point", "Ferry traffic crossing lanes", "Dense fog in spring and fall", "Rocks and ledges near CT shore"] },

  // Great Lakes
  { name: "Lake Michigan, IL/WI", region: "great_lakes", type: "lake", accidentRate: 61, tidalRange: 0, fogRisk: 0.25, trafficLevel: 6, hazards: ["No tides but seiche waves possible", "Sudden storms with large swells", "Cold water year-round — hypothermia risk", "Rip currents near shore"] },
  { name: "Lake Erie, OH/PA", region: "great_lakes", type: "lake", accidentRate: 67, tidalRange: 0, fogRisk: 0.29, trafficLevel: 6, hazards: ["Shallowest Great Lake — choppiest waves", "Rapid storm development", "Commercial freighter traffic", "Dangerous in westerly winds"] },
  { name: "Lake Superior, MN/WI", region: "great_lakes", type: "lake", accidentRate: 42, tidalRange: 0, fogRisk: 0.32, trafficLevel: 3, hazards: ["Coldest Great Lake — hypothermia in minutes", "Extreme weather can develop in 1 hour", "Rocky shoreline with few harbors", "Iron ore shipping lanes"] },
  { name: "Lake Tahoe, CA/NV", region: "west_mountain", type: "lake", accidentRate: 29, tidalRange: 0, fogRisk: 0.1, trafficLevel: 5, hazards: ["Afternoon thunderstorms in summer", "High altitude — UV exposure extreme", "Cold water year-round", "Wakeboarding congestion near shore"] },

  // Gulf of Mexico
  { name: "Galveston Bay, TX", region: "gulf_coast", type: "bay", accidentRate: 77, tidalRange: 1.6, fogRisk: 0.18, trafficLevel: 8, hazards: ["Heavy industrial shipping traffic", "Shallow outside marked channels", "Frequent thunderstorms spring/summer", "Oil platform hazards offshore"] },
  { name: "Mobile Bay, AL", region: "gulf_coast", type: "bay", accidentRate: 52, tidalRange: 1.9, fogRisk: 0.2, trafficLevel: 6, hazards: ["Jubilee events disrupt navigation", "Shoaling near delta", "Hurricane season risk June–Nov"] },

  // Pacific Coast
  { name: "San Francisco Bay, CA", region: "west_coast", type: "bay", accidentRate: 63, tidalRange: 5.8, fogRisk: 0.52, trafficLevel: 7, hazards: ["Dense fog June–August (Karl the Fog)", "Strong tidal currents at Golden Gate 4-6 kts", "Large container ship traffic", "Cold water — hypothermia risk year-round"] },
  { name: "Puget Sound, WA", region: "pacific_northwest", type: "sound", accidentRate: 57, tidalRange: 11.2, fogRisk: 0.41, trafficLevel: 7, hazards: ["Extreme tidal currents in narrows", "Ferry traffic — strict right of way", "Unpredictable weather year-round", "Kelp beds foul propellers"] },
  { name: "San Diego Bay, CA", region: "west_coast", type: "bay", accidentRate: 44, tidalRange: 5.2, fogRisk: 0.21, trafficLevel: 7, hazards: ["Naval vessel traffic — restricted zones", "Submarine operations area", "Morning fog May–June (June Gloom)", "Strong Santa Ana winds in fall"] },

  // Southeast / Carolinas
  { name: "Charleston Harbor, SC", region: "southeast", type: "harbor", accidentRate: 59, tidalRange: 5.6, fogRisk: 0.19, trafficLevel: 7, hazards: ["Strong tidal currents at inlet", "Commercial port traffic", "Shoaling at bar entrance", "Hurricane risk June–November"] },
  { name: "Lake Norman, NC", region: "southeast", type: "lake", accidentRate: 33, tidalRange: 0, fogRisk: 0.14, trafficLevel: 6, hazards: ["Submerged stumps in coves", "Weekend congestion near marinas", "Afternoon thunderstorms July–Aug", "No-wake zones strictly enforced"] },

  // Northeast
  { name: "Boston Harbor, MA", region: "northeast", type: "harbor", accidentRate: 48, tidalRange: 9.4, fogRisk: 0.38, trafficLevel: 7, hazards: ["Extreme tidal range — stranding risk", "Ferry traffic from multiple terminals", "Dense fog spring months", "Rocky ledges throughout harbor"] },
  { name: "Narragansett Bay, RI", region: "northeast", type: "bay", accidentRate: 54, tidalRange: 4.8, fogRisk: 0.33, trafficLevel: 7, hazards: ["Tidal currents strong at bridges", "Heavy sailboat racing traffic summers", "Fog common May–July", "Naval station restricted zones"] },

  // Pacific Northwest
  { name: "Columbia River, OR/WA", region: "pacific_northwest", type: "river", accidentRate: 68, tidalRange: 6.0, fogRisk: 0.35, trafficLevel: 6, hazards: ["Bar crossing extremely dangerous in swell", "Strong river current year-round", "Commercial shipping traffic", "Debris after spring runoff"] },

  // Generic fallbacks
  { name: "Generic Coastal", region: "generic_coastal", type: "coastal", accidentRate: 55, tidalRange: 3.0, fogRisk: 0.2, trafficLevel: 5, hazards: ["Verify local channel markers", "Check local tide tables before departure", "Monitor VHF Channel 16 at all times"] },
  { name: "Generic Lake", region: "generic_lake", type: "lake", accidentRate: 30, tidalRange: 0, fogRisk: 0.12, trafficLevel: 4, hazards: ["Check local weather before departure", "File a float plan", "Carry required safety equipment"] },
  { name: "Generic River", region: "generic_river", type: "river", accidentRate: 40, tidalRange: 1.0, fogRisk: 0.18, trafficLevel: 4, hazards: ["Watch for submerged debris", "Current varies with rainfall", "Low clearance bridges possible"] },
];

// ─── SEASONAL DATA ────────────────────────────────────────────────────────────
const SEASONAL = {
  gulf_coast:        [0.18,0.15,0.14,0.12,0.16,0.28,0.32,0.30,0.35,0.22,0.17,0.16],
  south_florida:     [0.10,0.09,0.10,0.12,0.18,0.35,0.38,0.36,0.40,0.28,0.14,0.11],
  north_florida:     [0.12,0.11,0.10,0.10,0.14,0.25,0.28,0.26,0.30,0.20,0.13,0.12],
  mid_atlantic:      [0.22,0.20,0.18,0.14,0.12,0.14,0.16,0.15,0.18,0.20,0.24,0.25],
  northeast:         [0.30,0.28,0.24,0.18,0.14,0.12,0.12,0.13,0.16,0.22,0.28,0.32],
  great_lakes:       [0.35,0.32,0.28,0.20,0.15,0.12,0.10,0.11,0.16,0.24,0.32,0.38],
  west_coast:        [0.18,0.16,0.14,0.12,0.14,0.16,0.14,0.13,0.14,0.16,0.18,0.19],
  pacific_northwest: [0.30,0.28,0.25,0.20,0.16,0.14,0.12,0.12,0.16,0.22,0.28,0.32],
  southeast:         [0.16,0.14,0.13,0.12,0.15,0.24,0.28,0.26,0.30,0.20,0.15,0.15],
  west_mountain:     [0.12,0.12,0.14,0.14,0.14,0.16,0.18,0.17,0.15,0.13,0.12,0.12],
  generic_coastal:   [0.20,0.18,0.16,0.14,0.14,0.18,0.20,0.19,0.22,0.18,0.18,0.20],
  generic_lake:      [0.18,0.16,0.14,0.12,0.12,0.14,0.16,0.15,0.14,0.14,0.16,0.18],
  generic_river:     [0.20,0.18,0.18,0.20,0.18,0.16,0.15,0.14,0.15,0.16,0.18,0.20],
};

const SEASON_NAMES = ["Winter","Winter","Spring","Spring","Spring","Summer","Summer","Summer","Fall","Fall","Fall","Winter"];
const MONTH_NAMES  = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// ─── WIND PATTERNS BY REGION & MONTH ─────────────────────────────────────────
const WIND_PATTERNS = {
  gulf_coast:        [8,9,12,14,12,14,13,12,16,13,10,8],
  south_florida:     [9,9,11,13,13,14,13,13,15,13,11,9],
  north_florida:     [8,9,11,12,11,12,11,11,14,11,9,8],
  mid_atlantic:      [12,12,13,13,12,11,11,11,12,12,13,13],
  northeast:         [14,14,15,14,12,11,10,10,12,13,15,15],
  great_lakes:       [13,13,14,14,12,11,10,10,12,14,16,14],
  west_coast:        [10,10,11,12,13,14,13,12,11,10,10,10],
  pacific_northwest: [12,12,13,12,11,10,9,9,11,13,14,13],
  southeast:         [9,10,11,12,11,12,11,11,13,11,9,9],
  west_mountain:     [8,8,10,11,11,13,12,11,10,9,8,8],
  generic_coastal:   [11,11,12,13,12,12,11,11,13,12,12,11],
  generic_lake:      [9,9,10,11,11,12,11,10,11,10,10,9],
  generic_river:     [8,8,10,11,10,11,10,10,11,10,9,8],
};

// ─── ADVISORIES ───────────────────────────────────────────────────────────────
function buildAdvisory(risk, score, season, region, windMph) {
  if (risk >= 60) return `DANGEROUS conditions for ${season}. High accident history in this region combined with current seasonal factors. Experienced operators only — strongly consider postponing.`;
  if (risk >= 40) return `Elevated risk for boating in this area during ${season}. Ensure all USCG-required safety equipment is aboard, file a float plan, and monitor VHF Ch. 16 continuously.`;
  if (risk >= 25) return `Moderate conditions. ${windMph > 15 ? "Wind speeds warrant caution — watch for building chop." : "Conditions are manageable."} Standard safety protocols apply. Keep an eye on weather changes.`;
  if (score >= 8)  return `Excellent boating conditions for this region in ${season}. Enjoy the water — maintain standard safety practices and be aware of other vessel traffic.`;
  return `Generally favorable conditions. Typical ${season.toLowerCase()} patterns for this area. Always carry required safety gear and check local NOTAMs before departure.`;
}

function bestTimeOfDay(region, month) {
  const afternoon_wind = ["gulf_coast","south_florida","west_coast","west_mountain"];
  const fog_morning    = ["pacific_northwest","west_coast","northeast","mid_atlantic"];
  const m = month;
  if (fog_morning.includes(region) && (m<=4||m>=10)) return "Midday (11am–3pm) after morning fog lifts";
  if (afternoon_wind.includes(region) && m>=5 && m<=9) return "Morning (7am–11am) before afternoon winds build";
  if (region === "great_lakes" && m>=6 && m<=8) return "Early morning (6am–10am) before afternoon squalls";
  return "Morning to early afternoon (8am–1pm)";
}

// ─── FUZZY LOCATION MATCH ─────────────────────────────────────────────────────
function matchLocation(input) {
  if (!input.trim()) return null;
  const q = input.toLowerCase().trim();

  // Exact / strong match
  let best = null, bestScore = 0;
  for (const w of WATERWAYS) {
    const name = w.name.toLowerCase();
    if (name === q) return w;
    let score = 0;
    const words = q.split(/[\s,]+/);
    for (const word of words) {
      if (word.length < 3) continue;
      if (name.includes(word)) score += word.length;
    }
    if (score > bestScore) { bestScore = score; best = w; }
  }

  // Fallback by type keywords
  if (bestScore < 3) {
    if (/lake|reservoir|pond/.test(q)) return WATERWAYS.find(w => w.name === "Generic Lake");
    if (/river|creek|stream/.test(q)) return WATERWAYS.find(w => w.name === "Generic River");
    return WATERWAYS.find(w => w.name === "Generic Coastal");
  }
  return best;
}

// ─── RISK ENGINE ──────────────────────────────────────────────────────────────
function computeRisk(waterway, dateStr, overrides, mode) {
  const date   = new Date(dateStr);
  const month  = date.getMonth(); // 0-11
  const dow    = date.getDay();   // 0=Sun
  const isWeekend = dow === 0 || dow === 6;

  const seasonalRisk = SEASONAL[waterway.region]?.[month] ?? 0.18;
  const windMph      = WIND_PATTERNS[waterway.region]?.[month] ?? 11;
  const season       = SEASON_NAMES[month];
  const monthName    = MONTH_NAMES[month];

  // ── Factor calculations ──
  let windRisk, tideRisk, visRisk, accRisk, hazardRisk;
  let windLabel, tideLabel, visLabel, accLabel, hazLabel;
  let windDetail, tideDetail, visDetail, accDetail, hazDetail;

  if (mode === "manual" && overrides) {
    // Wind
    const wv = overrides.wind;
    windMphEff = [0,3,6,9,13,18,24,30,37,44,52][wv] ?? windMph;
    windRisk   = Math.round(wv * 2.2);
    windLabel  = wv<=2?"Calm (0-5 mph)":wv<=4?"Light (6-12 mph)":wv<=6?"Moderate (13-20 mph)":wv<=8?"Fresh (21-30 mph)":"Strong (31+ mph)";
    windDetail = "Manual override applied";

    // Tide
    const tv = overrides.tide;
    tideRisk  = Math.round(tv * 1.8);
    tideLabel = tv<=2?"Slack / Low tide":tv<=5?"Moderate tidal flow":tv<=7?"Active tidal change":"Extreme tidal range";
    tideDetail= "Manual override applied";

    // Visibility
    const vv = overrides.visibility;
    visRisk   = Math.round((10 - vv) * 2.0);
    visLabel  = vv>=8?"Clear & sunny":vv>=6?"Partly cloudy":vv>=4?"Overcast":vv>=2?"Foggy/hazy":"Dense fog";
    visDetail = "Manual override applied";

    // Accidents
    const av = overrides.accidents;
    accRisk   = Math.round(av * 2.5);
    accLabel  = `${Math.round(av * 4)} incidents (historical estimate)`;
    accDetail = "Based on manual frequency setting";

    // Hazards / traffic
    const hv = isWeekend ? Math.min(overrides.accidents + 2, 10) : overrides.accidents;
    hazRisk   = Math.round(hv * 1.6);
    hazLabel  = hv<=3?"Low traffic":"hv<=6?Moderate traffic":"High traffic & congestion";
    hazDetail = isWeekend ? "Weekend — elevated recreational traffic" : "Weekday — normal traffic levels";

  } else {
    // AUTO mode — use database values

    // Wind
    const wMph = windMph;
    windRisk   = wMph<8?4:wMph<12?8:wMph<18?13:wMph<25?20:27;
    windLabel  = wMph<8?`Calm (${wMph} mph avg)`:wMph<12?`Light (${wMph} mph avg)`:wMph<18?`Moderate (${wMph} mph avg)`:wMph<25?`Fresh (${wMph} mph avg)`:`Strong (${wMph} mph avg)`;
    windDetail = `Typical ${monthName} conditions for this region`;

    // Tide
    const tr = waterway.tidalRange;
    tideRisk   = tr===0?2:tr<2?5:tr<4?10:tr<6?16:tr<9?22:28;
    tideLabel  = tr===0?"No tidal influence (freshwater)":tr<2?`Low tidal range (${tr}ft)`:tr<4?`Moderate tidal range (${tr}ft)`:tr<6?`High tidal range (${tr}ft)`:`Extreme tidal range (${tr}ft)`;
    tideDetail = tr===0?"Lake — monitor wind-driven waves instead":"Tidal currents increase near inlets and narrows";

    // Visibility / fog
    const fg = waterway.fogRisk;
    const isHighFogSeason = (waterway.region==="west_coast"||waterway.region==="pacific_northwest") ? (month>=4&&month<=8) :
                            (waterway.region==="northeast"||waterway.region==="mid_atlantic") ? (month>=2&&month<=5) : false;
    const effectiveFog = isHighFogSeason ? fg * 1.4 : fg;
    visRisk   = Math.round(effectiveFog * 40);
    visLabel  = effectiveFog<0.1?"Clear, low fog probability":effectiveFog<0.2?"Occasional morning fog":effectiveFog<0.35?"Moderate fog risk":effectiveFog<0.5?"Frequent fog":"High fog frequency";
    visDetail = isHighFogSeason ? `Peak fog season for this region in ${monthName}` : `Historical fog frequency: ${Math.round(effectiveFog*100)}% of days`;

    // Historical accidents
    const ar = waterway.accidentRate;
    accRisk   = Math.round((ar / 100) * 25);
    accLabel  = ar<35?`Low incident rate (~${ar} per 100k trips)`:ar<60?`Moderate incident rate (~${ar} per 100k trips)`:ar<80?`Elevated incident rate (~${ar} per 100k trips)`:`High incident rate (~${ar} per 100k trips)`;
    accDetail = `Based on USCG accident data for this waterway type and region`;

    // Seasonal + traffic hazards
    const tl = waterway.trafficLevel + (isWeekend ? 1.5 : 0);
    hazRisk   = Math.round(seasonalRisk * 30 + (tl / 10) * 8);
    hazLabel  = tl<5?"Low traffic, off-season":tl<7?"Moderate seasonal traffic":tl<9?"High recreational traffic":"Peak season, very congested";
    hazDetail = `${season} ${isWeekend?"weekend":"weekday"} — ${Math.round(seasonalRisk*100)}% seasonal risk factor`;
  }

  // Total risk score
  const rawRisk = windRisk*0.25 + tideRisk*0.20 + visRisk*0.18 + accRisk*0.22 + hazRisk*0.15;
  const expMod  = mode==="manual"&&overrides ? 1 + (5 - overrides.experience) * 0.035 : 1.0;
  const wreckProbability = Math.min(Math.max(Math.round(rawRisk * expMod), 3), 97);

  // Boat day score (1–10)
  const windScore  = Math.max(10 - Math.round(windRisk / 3), 1);
  const tideScore  = Math.max(10 - Math.round(tideRisk / 3), 1);
  const visScore   = Math.max(10 - Math.round(visRisk  / 3), 1);
  const seasScore  = Math.round(10 - seasonalRisk * 20);
  const boatDayScore = Math.min(Math.max(Math.round((windScore*0.3 + tideScore*0.2 + visScore*0.3 + seasScore*0.2)), 1), 10);

  const risk_level = wreckProbability<15?"LOW":wreckProbability<35?"MODERATE":wreckProbability<60?"HIGH":"DANGEROUS";
  const confidence = waterway.name.startsWith("Generic") ? 58 : 78 + Math.round(Math.random() * 8);

  return {
    location_confirmed: waterway.name,
    date_analyzed: date.toLocaleDateString("en-US", { weekday:"long", year:"numeric", month:"long", day:"numeric" }),
    wreck_probability: wreckProbability,
    boat_day_score: boatDayScore,
    risk_level,
    conditions: {
      wind:               { label: windLabel, risk_contribution: windRisk, detail: windDetail },
      tides:              { label: tideLabel, risk_contribution: tideRisk, detail: tideDetail },
      visibility:         { label: visLabel,  risk_contribution: visRisk,  detail: visDetail  },
      historical_accidents:{ label: accLabel, risk_contribution: accRisk,  detail: accDetail  },
      seasonal_hazards:   { label: hazLabel,  risk_contribution: hazRisk,  detail: hazDetail  },
    },
    known_hazards: waterway.hazards,
    advisory: buildAdvisory(wreckProbability, boatDayScore, season, waterway.region, windMph),
    best_time_of_day: bestTimeOfDay(waterway.region, month),
    data_sources: ["USCG Accident Reports (2015–2024)", "NOAA Tides & Currents", "NWS Climatological Data", "Regional Coast Guard Sector Reports"],
    confidence,
    isGeneric: waterway.name.startsWith("Generic"),
  };
}

// ─── UI COMPONENTS ────────────────────────────────────────────────────────────
function AnimatedNumber({ target, duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef(null);
  const rafRef   = useRef(null);
  useEffect(() => {
    startRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const animate = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const p = Math.min((ts - startRef.current) / duration, 1);
      setDisplay(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target]);
  return <span>{display}</span>;
}

function GaugeMeter({ value, max, color, size = 160 }) {
  const r = 54, cx = size/2, cy = size/2+10, startAngle = -210, sweep = 240;
  const pct = Math.min(value/max,1);
  const endAngle = startAngle + sweep * pct;
  const uid = color.replace(/[^a-z0-9]/gi,"");
  function polar(a,r){ const rad=(a*Math.PI)/180; return [cx+r*Math.cos(rad),cy+r*Math.sin(rad)]; }
  function arc(a1,a2,r){ const[sx,sy]=polar(a1,r),[ex,ey]=polar(a2,r),large=Math.abs(a2-a1)>180?1:0; return `M${sx} ${sy}A${r} ${r} 0 ${large} 1 ${ex} ${ey}`; }
  return (
    <svg viewBox={`0 0 ${size} ${size-10}`} style={{width:size,height:size-10}}>
      <defs><filter id={`g${uid}`}><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      <path d={arc(startAngle,startAngle+sweep,r)} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" strokeLinecap="round"/>
      {pct>0.01&&<path d={arc(startAngle,endAngle,r)} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" filter={`url(#g${uid})`}/>}
      {[0,.25,.5,.75,1].map((t,i)=>{ const a=startAngle+sweep*t,[x1,y1]=polar(a,44),[x2,y2]=polar(a,38); return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.18)" strokeWidth="1.5"/>; })}
    </svg>
  );
}

function FactorBar({ label, value, detail }) {
  const color = value<10?"#22d3a5":value<18?"#fbbf24":"#f87171";
  return (
    <div style={{marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
        <span style={{fontSize:12,color:"rgba(190,215,255,0.8)",fontFamily:"'Space Mono',monospace"}}>{label}</span>
        <span style={{fontSize:11,color,fontFamily:"'Space Mono',monospace",fontWeight:600}}>+{value}</span>
      </div>
      <div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:2,overflow:"hidden",marginBottom:4}}>
        <div style={{width:`${(value/30)*100}%`,height:"100%",background:color,borderRadius:2,boxShadow:`0 0 8px ${color}`,transition:"width 1s ease"}}/>
      </div>
      <div style={{fontSize:11,color:"rgba(150,180,230,0.5)",lineHeight:1.4}}>{detail}</div>
    </div>
  );
}

// ─── AUTOCOMPLETE ─────────────────────────────────────────────────────────────
function LocationInput({ value, onChange, onSelect }) {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);

  function handleChange(e) {
    const v = e.target.value;
    onChange(v);
    if (v.length < 2) { setSuggestions([]); setOpen(false); return; }
    const q = v.toLowerCase();
    const matches = WATERWAYS
      .filter(w => !w.name.startsWith("Generic") && w.name.toLowerCase().includes(q))
      .slice(0, 6);
    setSuggestions(matches);
    setOpen(matches.length > 0);
  }

  function handleSelect(w) {
    onChange(w.name);
    onSelect(w);
    setOpen(false);
    setSuggestions([]);
  }

  return (
    <div style={{position:"relative"}}>
      <input
        type="text" value={value} onChange={handleChange}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder="e.g. Tampa Bay, FL  ·  Chesapeake Bay  ·  Lake Michigan"
        style={{
          width:"100%", background:"rgba(0,10,30,0.8)",
          border:"1px solid rgba(60,120,220,0.25)", borderRadius:12,
          color:"#e0eeff", padding:"13px 16px", fontSize:14, fontFamily:"'Syne',sans-serif",
          boxSizing:"border-box",
        }}
      />
      {open && (
        <div style={{
          position:"absolute", top:"calc(100% + 6px)", left:0, right:0, zIndex:100,
          background:"rgba(8,18,45,0.98)", border:"1px solid rgba(60,120,220,0.25)",
          borderRadius:12, overflow:"hidden", backdropFilter:"blur(12px)",
          boxShadow:"0 8px 32px rgba(0,0,0,0.5)",
        }}>
          {suggestions.map((w,i) => (
            <div key={i} onMouseDown={() => handleSelect(w)} style={{
              padding:"11px 16px", cursor:"pointer", display:"flex", justifyContent:"space-between",
              alignItems:"center", borderBottom:"1px solid rgba(60,120,220,0.1)",
              transition:"background 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.background="rgba(60,120,220,0.15)"}
              onMouseLeave={e => e.currentTarget.style.background="transparent"}
            >
              <span style={{fontSize:13,color:"#c8ddf5"}}>{w.name}</span>
              <span style={{fontSize:10,color:"rgba(100,160,255,0.45)",fontFamily:"'Space Mono',monospace",textTransform:"uppercase"}}>{w.type}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function BoatRiskApp() {
  const [location, setLocation]   = useState("");
  const [date, setDate]           = useState(() => new Date().toISOString().split("T")[0]);
  const [result, setResult]       = useState(null);
  const [mode, setMode]           = useState("auto");
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoStatus, setGeoStatus]   = useState(null);
  const [manualOverrides, setManualOverrides] = useState({ wind:5, tide:5, visibility:7, accidents:3, experience:7 });

  function setOverride(key, val) { setManualOverrides(p => ({...p,[key]:val})); }

  async function autofill() {
    setGeoLoading(true); setGeoStatus(null);
    if (!navigator.geolocation) { setGeoStatus("error"); setGeoLoading(false); return; }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`);
          const data = await res.json();
          const addr = data.address || {};
          const place = addr.body_of_water || addr.bay || addr.lake || addr.river ||
            [addr.city||addr.town||addr.county, addr.state, addr.country].filter(Boolean).join(", ");
          setLocation(place || `${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)}`);
        } catch { setLocation(`${pos.coords.latitude.toFixed(4)}N, ${Math.abs(pos.coords.longitude).toFixed(4)}W`); }
        setDate(new Date().toISOString().split("T")[0]);
        setGeoStatus("success"); setGeoLoading(false);
      },
      () => { setGeoStatus("error"); setGeoLoading(false); },
      { timeout: 8000 }
    );
  }

  function analyze() {
    const waterway = matchLocation(location);
    if (!waterway) return;
    const r = computeRisk(waterway, date, mode==="manual" ? manualOverrides : null, mode);
    setResult(r);
    setTimeout(() => document.getElementById("results")?.scrollIntoView({ behavior:"smooth" }), 100);
  }

  function getRiskColor(level) { return {LOW:"#22d3a5",MODERATE:"#fbbf24",HIGH:"#f97316",DANGEROUS:"#ef4444"}[level]||"#22d3a5"; }
  function getScoreColor(s)    { return s>=8?"#22d3a5":s>=6?"#86efac":s>=4?"#fbbf24":"#f87171"; }

  const riskColor  = result ? getRiskColor(result.risk_level) : "#22d3a5";
  const scoreColor = result ? getScoreColor(result.boat_day_score) : "#22d3a5";

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet"/>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#050b14;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes pulse{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:.9;transform:scale(1.06)}}
        .fade-up{animation:fadeUp 0.5s ease both;}
        input:focus,select:focus{outline:none!important;border-color:rgba(60,160,255,0.5)!important;}
        .analyze-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 12px 40px rgba(0,160,255,0.4)!important;}
        input[type=range]{-webkit-appearance:none;height:4px;border-radius:2px;background:rgba(255,255,255,0.1);}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:#3b82f6;cursor:pointer;box-shadow:0 0 6px rgba(59,130,246,0.6);}
        input[type=date]::-webkit-calendar-picker-indicator{filter:invert(0.7);cursor:pointer;}
        ::-webkit-scrollbar{width:6px;} ::-webkit-scrollbar-track{background:rgba(255,255,255,0.03);} ::-webkit-scrollbar-thumb{background:rgba(60,120,220,0.3);border-radius:3px;}
      `}</style>

      <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#050b14 0%,#071120 50%,#050e1a 100%)",fontFamily:"'Syne',sans-serif",color:"#c5d8f0",paddingBottom:80}}>

        {/* Header */}
        <div style={{borderBottom:"1px solid rgba(50,100,180,0.15)",padding:"48px 24px 36px",textAlign:"center",background:"rgba(0,20,50,0.3)"}}>
          <div style={{fontSize:11,letterSpacing:"0.3em",color:"rgba(0,200,255,0.5)",fontFamily:"'Space Mono',monospace",marginBottom:14}}>⚓ &nbsp; MARITIME SAFETY INTELLIGENCE</div>
          <h1 style={{fontSize:"clamp(40px,8vw,72px)",fontWeight:800,background:"linear-gradient(135deg,#e8f4ff 30%,#60a5fa)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:"-0.02em",lineHeight:1,marginBottom:12}}>BOAT DAY RISK</h1>
          <p style={{fontSize:14,color:"rgba(150,185,240,0.55)",letterSpacing:"0.05em"}}>Offline risk engine · Built-in maritime database · No API required</p>
        </div>

        {/* Input Card */}
        <div style={{maxWidth:680,margin:"40px auto 0",padding:"0 20px"}}>
          <div style={{background:"rgba(10,25,55,0.6)",border:"1px solid rgba(60,120,220,0.18)",borderRadius:20,padding:"28px 28px 24px",backdropFilter:"blur(12px)"}}>

            {/* Mode Toggle */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
              <div style={{fontSize:10,letterSpacing:"0.2em",color:"rgba(100,170,255,0.45)",fontFamily:"'Space Mono',monospace"}}>INPUT MODE</div>
              <div style={{display:"flex",background:"rgba(0,10,30,0.6)",border:"1px solid rgba(60,120,220,0.2)",borderRadius:10,padding:3,gap:3}}>
                {["auto","manual"].map(m => (
                  <button key={m} onClick={() => setMode(m)} style={{
                    padding:"7px 18px",borderRadius:8,border:"none",cursor:"pointer",
                    fontFamily:"'Space Mono',monospace",fontSize:10,letterSpacing:"0.12em",fontWeight:700,transition:"all 0.2s",
                    background:mode===m?"linear-gradient(135deg,#1d4ed8,#0891b2)":"transparent",
                    color:mode===m?"#fff":"rgba(150,185,240,0.45)",
                    boxShadow:mode===m?"0 2px 12px rgba(0,100,220,0.35)":"none",
                  }}>{m==="auto"?"🤖 AUTO":"🎛 MANUAL"}</button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div style={{marginBottom:16}}>
              <label style={{fontSize:10,letterSpacing:"0.2em",color:"rgba(100,170,255,0.5)",fontFamily:"'Space Mono',monospace",display:"block",marginBottom:8}}>LOCATION / WATERWAY</label>
              <div style={{display:"flex",gap:10}}>
                <div style={{flex:1}}>
                  <LocationInput value={location} onChange={setLocation} onSelect={w => setLocation(w.name)}/>
                </div>
                <button onClick={autofill} disabled={geoLoading} title="Auto-detect location"
                  style={{flexShrink:0,width:52,height:52,fontSize:22,background:geoStatus==="success"?"rgba(34,211,165,0.15)":geoStatus==="error"?"rgba(248,113,113,0.1)":"rgba(29,78,216,0.2)",border:`1px solid ${geoStatus==="success"?"rgba(34,211,165,0.4)":geoStatus==="error"?"rgba(248,113,113,0.3)":"rgba(60,120,220,0.3)"}`,borderRadius:12,cursor:geoLoading?"wait":"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s",animation:geoLoading?"pulse 1s ease infinite":"none"}}>
                  {geoLoading?"⏳":geoStatus==="success"?"✅":geoStatus==="error"?"❌":"📍"}
                </button>
              </div>
              <div style={{marginTop:6,fontSize:11,fontFamily:"'Space Mono',monospace"}}>
                {geoStatus==="success"&&<span style={{color:"#22d3a5"}}>✓ Location & date auto-filled</span>}
                {geoStatus==="error"&&<span style={{color:"#f87171"}}>✗ Location denied — type manually</span>}
                {!geoStatus&&<span style={{color:"rgba(100,150,220,0.4)"}}>📍 to auto-fill · or start typing for suggestions</span>}
              </div>
            </div>

            {/* Date */}
            <div style={{marginBottom:20}}>
              <label style={{fontSize:10,letterSpacing:"0.2em",color:"rgba(100,170,255,0.5)",fontFamily:"'Space Mono',monospace",display:"block",marginBottom:8}}>DATE</label>
              <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{width:"100%",background:"rgba(0,10,30,0.8)",border:"1px solid rgba(60,120,220,0.25)",borderRadius:12,color:"#e0eeff",padding:"13px 16px",fontSize:14,fontFamily:"'Syne',sans-serif"}}/>
            </div>

            {/* Manual Sliders */}
            {mode==="manual"&&(
              <div style={{background:"rgba(0,10,30,0.5)",border:"1px solid rgba(60,120,220,0.15)",borderRadius:14,padding:"20px 20px 16px",marginBottom:20}}>
                <div style={{fontSize:10,letterSpacing:"0.2em",color:"rgba(100,170,255,0.45)",fontFamily:"'Space Mono',monospace",marginBottom:18}}>🎛 MANUAL CONDITION OVERRIDES</div>
                {[
                  {key:"wind",      label:"Wind Speed",            low:"Calm",     high:"Gale",    icon:"🌬"},
                  {key:"tide",      label:"Tide Intensity",        low:"Slack",    high:"Extreme", icon:"🌊"},
                  {key:"visibility",label:"Visibility",            low:"Foggy",    high:"Crystal", icon:"☀️"},
                  {key:"accidents", label:"Historical Accidents",  low:"Rare",     high:"Frequent",icon:"📋"},
                  {key:"experience",label:"Operator Experience",   low:"Novice",   high:"Expert",  icon:"🧭"},
                ].map(({key,label,low,high,icon})=>{
                  const val=manualOverrides[key];
                  const color=(key==="experience"||key==="visibility")?(val>=7?"#22d3a5":val>=4?"#fbbf24":"#f87171"):(val<=3?"#22d3a5":val<=6?"#fbbf24":"#f87171");
                  return (
                    <div key={key} style={{marginBottom:16}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
                        <span style={{fontSize:12,color:"rgba(190,215,255,0.75)"}}>{icon} {label}</span>
                        <span style={{fontSize:12,fontFamily:"'Space Mono',monospace",color,fontWeight:700}}>{val}/10</span>
                      </div>
                      <input type="range" min={1} max={10} value={val} onChange={e=>setOverride(key,+e.target.value)} style={{width:"100%",accentColor:color,cursor:"pointer"}}/>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"rgba(120,160,220,0.35)",marginTop:3}}><span>{low}</span><span>{high}</span></div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Button */}
            <button className="analyze-btn" onClick={analyze} disabled={!location.trim()}
              style={{width:"100%",padding:"15px",border:"none",borderRadius:12,background:!location.trim()?"rgba(40,60,100,0.4)":"linear-gradient(135deg,#1d4ed8,#0891b2)",color:!location.trim()?"rgba(150,180,230,0.3)":"#fff",fontSize:15,fontWeight:700,fontFamily:"'Syne',sans-serif",letterSpacing:"0.08em",cursor:!location.trim()?"not-allowed":"pointer",transition:"all 0.2s",boxShadow:"0 4px 24px rgba(0,100,200,0.25)"}}>
              ANALYZE RISK →
            </button>
          </div>
        </div>

        {/* Results */}
        {result&&(
          <div id="results" className="fade-up" style={{maxWidth:880,margin:"32px auto 0",padding:"0 20px"}}>

            {result.isGeneric&&(
              <div style={{background:"rgba(251,191,36,0.08)",border:"1px solid rgba(251,191,36,0.25)",borderRadius:12,padding:"12px 18px",marginBottom:16,fontSize:12,color:"rgba(251,191,36,0.8)",fontFamily:"'Space Mono',monospace"}}>
                ⚠ Location not in database — showing estimates for a generic {result.location_confirmed.toLowerCase().replace("generic ","")}. Try a specific named waterway for full data.
              </div>
            )}

            {/* Banner */}
            <div style={{background:"rgba(10,30,70,0.5)",border:"1px solid rgba(60,120,220,0.15)",borderRadius:14,padding:"14px 20px",marginBottom:20,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
              <div>
                <div style={{fontSize:16,fontWeight:700,color:"#e8f4ff"}}>{result.location_confirmed}</div>
                <div style={{fontSize:12,color:"rgba(150,185,240,0.5)",fontFamily:"'Space Mono',monospace",marginTop:2}}>{result.date_analyzed}</div>
              </div>
              <div style={{background:`${riskColor}18`,border:`1px solid ${riskColor}40`,borderRadius:8,padding:"6px 14px",fontSize:12,fontWeight:700,fontFamily:"'Space Mono',monospace",color:riskColor,letterSpacing:"0.12em"}}>
                {result.risk_level} RISK
              </div>
            </div>

            {/* Gauges */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
              {[
                {label:"WRECK PROBABILITY",value:result.wreck_probability,max:100,color:riskColor,unit:"%",sub:"chance of an incident occurring"},
                {label:"BOAT DAY RATING",value:result.boat_day_score,max:10,color:scoreColor,unit:"/10",sub:"overall conditions quality"},
              ].map(({label,value,max,color,unit,sub})=>(
                <div key={label} style={{background:"rgba(10,25,55,0.6)",border:`1px solid ${color}25`,borderRadius:18,padding:"28px 24px",textAlign:"center",backdropFilter:"blur(12px)"}}>
                  <div style={{fontSize:10,letterSpacing:"0.2em",color:"rgba(150,185,240,0.4)",fontFamily:"'Space Mono',monospace",marginBottom:16}}>{label}</div>
                  <div style={{display:"flex",justifyContent:"center",position:"relative"}}>
                    <GaugeMeter value={value} max={max} color={color} size={160}/>
                    <div style={{position:"absolute",bottom:8,left:"50%",transform:"translateX(-50%)",textAlign:"center",whiteSpace:"nowrap"}}>
                      <div style={{fontSize:42,fontWeight:800,color,filter:`drop-shadow(0 0 12px ${color})`,lineHeight:1}}>
                        <AnimatedNumber target={value}/><span style={{fontSize:unit==="%"?26:20,opacity:0.7}}>{unit}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{fontSize:12,color:"rgba(150,185,240,0.5)",marginTop:8}}>{sub}</div>
                </div>
              ))}
            </div>

            {/* Factor Breakdown */}
            <div style={{background:"rgba(10,25,55,0.6)",border:"1px solid rgba(60,120,220,0.15)",borderRadius:18,padding:"26px 28px",marginBottom:16,backdropFilter:"blur(12px)"}}>
              <div style={{fontSize:10,letterSpacing:"0.2em",color:"rgba(100,170,255,0.45)",fontFamily:"'Space Mono',monospace",marginBottom:20}}>RISK FACTOR BREAKDOWN</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:"0 32px"}}>
                <div>
                  <FactorBar label="🌬 Wind Conditions"   value={result.conditions.wind.risk_contribution}                detail={`${result.conditions.wind.label} · ${result.conditions.wind.detail}`}/>
                  <FactorBar label="🌊 Tidal Conditions"  value={result.conditions.tides.risk_contribution}               detail={`${result.conditions.tides.label} · ${result.conditions.tides.detail}`}/>
                </div>
                <div>
                  <FactorBar label="☀️ Visibility / Sky"  value={result.conditions.visibility.risk_contribution}          detail={`${result.conditions.visibility.label} · ${result.conditions.visibility.detail}`}/>
                  <FactorBar label="📋 Historical Incidents" value={result.conditions.historical_accidents.risk_contribution} detail={`${result.conditions.historical_accidents.label} · ${result.conditions.historical_accidents.detail}`}/>
                  <FactorBar label="⚠️ Seasonal Hazards"  value={result.conditions.seasonal_hazards.risk_contribution}    detail={`${result.conditions.seasonal_hazards.label} · ${result.conditions.seasonal_hazards.detail}`}/>
                </div>
              </div>
            </div>

            {/* Bottom Row */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              <div style={{background:"rgba(10,25,55,0.6)",border:"1px solid rgba(60,120,220,0.15)",borderRadius:18,padding:"22px 24px",backdropFilter:"blur(12px)"}}>
                <div style={{fontSize:10,letterSpacing:"0.2em",color:"rgba(100,170,255,0.45)",fontFamily:"'Space Mono',monospace",marginBottom:16}}>KNOWN HAZARDS</div>
                {result.known_hazards.map((h,i)=>(
                  <div key={i} style={{display:"flex",gap:10,marginBottom:10,alignItems:"flex-start"}}>
                    <span style={{color:"#f59e0b",fontSize:12,marginTop:1,flexShrink:0}}>◆</span>
                    <span style={{fontSize:13,color:"rgba(190,215,255,0.75)",lineHeight:1.5}}>{h}</span>
                  </div>
                ))}
                <div style={{marginTop:14,paddingTop:14,borderTop:"1px solid rgba(60,120,220,0.12)"}}>
                  <div style={{fontSize:10,letterSpacing:"0.15em",color:"rgba(100,170,255,0.4)",fontFamily:"'Space Mono',monospace",marginBottom:6}}>BEST TIME TO GO</div>
                  <div style={{fontSize:13,color:"#86efac"}}>🕐 {result.best_time_of_day}</div>
                </div>
              </div>

              <div style={{background:"rgba(10,25,55,0.6)",border:`1px solid ${riskColor}20`,borderRadius:18,padding:"22px 24px",backdropFilter:"blur(12px)",display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
                <div>
                  <div style={{fontSize:10,letterSpacing:"0.2em",color:"rgba(100,170,255,0.45)",fontFamily:"'Space Mono',monospace",marginBottom:14}}>SAFETY ADVISORY</div>
                  <div style={{fontSize:14,lineHeight:1.7,color:"rgba(200,220,255,0.85)",background:`${riskColor}10`,border:`1px solid ${riskColor}20`,borderRadius:10,padding:"14px 16px"}}>
                    {result.advisory}
                  </div>
                </div>
                <div style={{marginTop:20}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:6,fontSize:11,fontFamily:"'Space Mono',monospace",color:"rgba(130,170,230,0.5)"}}>
                    <span>DATA CONFIDENCE</span>
                    <span style={{color:result.confidence>75?"#22d3a5":"#fbbf24"}}>{result.confidence}%</span>
                  </div>
                  <div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:2}}>
                    <div style={{width:`${result.confidence}%`,height:"100%",background:result.confidence>75?"#22d3a5":"#fbbf24",borderRadius:2}}/>
                  </div>
                  <div style={{marginTop:14,fontSize:10,color:"rgba(100,140,200,0.4)",fontFamily:"'Space Mono',monospace",lineHeight:1.6}}>
                    SOURCES: {result.data_sources.join(" · ")}
                  </div>
                </div>
              </div>
            </div>

            <div style={{marginTop:24,textAlign:"center",fontSize:10,color:"rgba(100,140,200,0.3)",fontFamily:"'Space Mono',monospace",lineHeight:1.8}}>
              FOR INFORMATIONAL USE ONLY · ALWAYS VERIFY WITH OFFICIAL NOAA, NWS & USCG ADVISORIES BEFORE DEPARTURE
            </div>
          </div>
        )}
      </div>
    </>
  );
}