/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";

const API = import.meta.env.VITE_API_BASE_URL;

function dig(obj, ...keys) {
  if (obj == null) return undefined;
  for (const k of keys) if (obj[k] != null) return obj[k];
  return undefined;
}

function arr(x) {
  return Array.isArray(x) ? x : [];
}

async function get(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

function readLS(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

function writeLS(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* empty */
  }
}

function pushHistory(key, item, max = 6) {
  const prev = readLS(key, []);
  const id = JSON.stringify(item);
  const filtered = prev.filter((x) => JSON.stringify(x) !== id);
  const next = [item, ...filtered].slice(0, max);
  writeLS(key, next);
  return next;
}

// ── styles ───────────────────────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Sora',sans-serif;background:#FDF6EE;color:#1A1410}
input,
textarea,
select {
  font-size: 16px;
}
.app{max-width:480px;margin:0 auto;min-height:100vh;display:flex;flex-direction:column}
/* header */
.hdr{background:#E8521A;padding:18px 20px 14px;position:sticky;top:0;z-index:200}
.hdr-t{color:#fff;font-size:19px;font-weight:700;letter-spacing:-.3px}
.hdr-s{color:rgba(255,255,255,.7);font-size:10px;letter-spacing:.8px;text-transform:uppercase;margin-top:1px}
/* nav */
.nav{display:flex;background:#fff;border-bottom:1px solid #E8D5C4;position:sticky;top:58px;z-index:100}
.tab{flex:1;padding:10px 4px 8px;text-align:center;font-size:10px;font-weight:500;color:#8B7355;cursor:pointer;border-bottom:2.5px solid transparent;text-transform:uppercase;letter-spacing:.5px;transition:all .15s}
.tab.on{color:#E8521A;border-bottom-color:#E8521A}
/* page */
.pg{flex:1;padding:16px;padding-bottom:40px}
/* section label */
.sec{font-size:11px;font-weight:600;color:#8B7355;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;margin-top:2px}
/* station autocomplete */
.wrap{position:relative;margin-bottom:8px}
.ig{background:#fff;border:1.5px solid #E8D5C4;border-radius:12px;padding:11px 13px;display:flex;align-items:center;gap:9px;transition:border-color .2s}
.ig:focus-within{border-color:#E8521A}
.ig input{flex:1;border:none;outline:none;font-family:'Sora',sans-serif;font-size:14px;color:#1A1410;background:transparent;min-width:0}
.ig input::placeholder{color:#C4B09A}
.ico{font-size:15px;min-width:18px;text-align:center;flex-shrink:0}
.ddrop{position:absolute;top:calc(100% + 3px);left:0;right:0;background:#fff;border:1.5px solid #E8D5C4;border-radius:12px;z-index:400;max-height:220px;overflow-y:auto;box-shadow:0 8px 24px rgba(0,0,0,.1)}
.si{padding:10px 13px;cursor:pointer;border-bottom:1px solid #F0E8DE;display:flex;flex-direction:column;gap:1px}
.si:last-child{border-bottom:none}
.si:hover,.si:active{background:#FFF0E5}
.si-name{font-size:13px;font-weight:500;color:#1A1410}
.si-code{font-size:11px;color:#8B7355;font-family:'Space Mono',monospace}
/* buttons */
.btn{width:100%;padding:13px;background:#E8521A;color:#fff;border:none;border-radius:12px;font-family:'Sora',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:all .15s;margin-top:4px}
.btn:hover:not(:disabled){background:#cf4715}
.btn:active:not(:disabled){transform:scale(.98)}
.btn:disabled{background:#D4B89A;cursor:not-allowed}
.btn-sm{padding:8px 14px;font-size:12px;width:auto;margin-top:0;border-radius:9px}
.btn-outline{background:#fff;color:#E8521A;border:1.5px solid #E8521A}
.btn-outline:hover:not(:disabled){background:#FFF0E5}
/* train card */
.card{background:#fff;border:1.5px solid #E8D5C4;border-radius:14px;padding:13px;margin-bottom:9px;cursor:pointer;transition:all .18s}
.card:hover{border-color:#E8521A;transform:translateY(-1px);box-shadow:0 4px 12px rgba(232,82,26,.08)}
.tnum{font-family:'Space Mono',monospace;font-size:11px;color:#8B7355}
.tname{font-size:15px;font-weight:600;margin:3px 0 6px;color:#1A1410}
.route-row{display:flex;align-items:center;gap:6px;font-size:12px;color:#8B7355}
.rdot{width:6px;height:6px;border-radius:50%;background:#E8521A;flex-shrink:0}
.rline{flex:1;height:1px;background:#E8D5C4}
/* badges */
.bdg{display:inline-block;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:500}
.bdg-g{background:#E6F5ED;color:#1D7A4A}
.bdg-o{background:#FFF0E5;color:#B85C0A}
.bdg-gr{background:#F5F0EA;color:#8B7355}
.bdg-b{background:#EBF2FB;color:#1A56A0}
/* back */
.back{display:inline-flex;align-items:center;gap:5px;font-size:13px;color:#E8521A;cursor:pointer;margin-bottom:14px;font-weight:500}
/* detail header */
.dhdr{background:#E8521A;border-radius:14px;padding:16px;margin-bottom:14px;color:#fff}
.dnum{font-family:'Space Mono',monospace;font-size:11px;opacity:.75}
.dname{font-size:18px;font-weight:700;margin:3px 0 2px}
.dsub{font-size:12px;opacity:.8;margin-bottom:8px}
/* info grid */
.igrid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px}
.ic{background:#fff;border:1.5px solid #E8D5C4;border-radius:11px;padding:11px 12px}
.ic-l{font-size:10px;text-transform:uppercase;letter-spacing:.6px;color:#8B7355;font-weight:500;margin-bottom:3px}
.ic-v{font-size:14px;font-weight:600;color:#1A1410}
.ic-full{grid-column:1/-1}
/* running days chips */
.days-row{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:14px}
.day-chip{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;background:#F5F0EA;color:#8B7355}
.day-chip.on{background:#E8521A;color:#fff}
/* route timeline */
.tl-row{display:flex;gap:11px;align-items:flex-start}
.tl-col{display:flex;flex-direction:column;align-items:center;width:18px;flex-shrink:0;padding-top:3px}
.tl-dot{width:10px;height:10px;border-radius:50%;background:#E8D5C4;border:2px solid #fff;box-shadow:0 0 0 2px #E8D5C4;z-index:1;flex-shrink:0}
.tl-dot.cur{background:#E8521A;box-shadow:0 0 0 2px #E8521A}
.tl-dot.done{background:#1D7A4A;box-shadow:0 0 0 2px #1D7A4A}
.tl-dot.first,.tl-dot.last{background:#1A1410;box-shadow:0 0 0 2px #1A1410}
.tl-line{width:2px;background:#E8D5C4;flex:1;min-height:22px;margin:2px 0}
.tl-line.done{background:#1D7A4A}
.st-info{flex:1;padding-bottom:14px}
.st-name{font-size:13px;font-weight:500;color:#1A1410}
.st-code{font-size:11px;color:#8B7355;font-family:'Space Mono',monospace;margin-top:1px}
.st-times{display:flex;gap:12px;margin-top:3px;flex-wrap:wrap}
.st-t{font-size:11px;font-family:'Space Mono',monospace;color:#8B7355}
.st-t span{color:#1A1410;font-weight:500}
/* live status */
.live-hdr{background:linear-gradient(135deg,#1A1410 0%,#2D2018 100%);border-radius:14px;padding:16px;margin-bottom:14px;color:#fff}
.live-badge{display:inline-flex;align-items:center;gap:5px;background:rgba(255,255,255,.12);padding:3px 9px;border-radius:20px;font-size:11px;font-weight:500;margin-bottom:10px}
.ldot{width:7px;height:7px;border-radius:50%;background:#4ADE80;animation:pulse 1.4s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
/* station live cards */
.sat{background:#fff;border:1.5px solid #E8D5C4;border-radius:12px;padding:11px 13px;margin-bottom:7px;display:flex;justify-content:space-between;align-items:center}
.sat-l{flex:1;min-width:0}
/* chip */
.chip{padding:3px 9px;border-radius:20px;font-size:11px;font-weight:500;font-family:'Space Mono',monospace;background:#FFF0E5;color:#B85C0A}
/* divider */
.div{height:1px;background:#E8D5C4;margin:12px 0}
/* loader */
.ldr{display:flex;flex-direction:column;align-items:center;padding:44px 20px;gap:10px}
.spin{width:40px;height:40px;border:3px solid #E8D5C4;border-top-color:#E8521A;border-radius:50%;animation:spin .7s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.ldr-t{font-size:13px;color:#8B7355}
/* empty & error */
.empty{text-align:center;padding:44px 20px;color:#8B7355}
.empty-i{font-size:36px;margin-bottom:10px}
.err{background:#FFF5F5;border:1px solid #FFCDD2;border-radius:10px;padding:11px 13px;margin:10px 0;font-size:13px;color:#B71C1C}
/* sel tag */
.sel-tag{font-size:12px;color:#1D7A4A;padding:4px 10px;background:#E6F5ED;border-radius:8px;display:inline-block;margin-bottom:4px;margin-right:4px}
/* pnr */
.prow{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #F0E8DE;font-size:13px}
.prow:last-child{border-bottom:none}
.pl{color:#8B7355}
.pv{font-weight:500;text-align:right;max-width:60%}
.pcrd{background:#fff;border:1.5px solid #E8D5C4;border-radius:12px;padding:13px;margin-bottom:10px}
.pax{background:#F9F5F0;border-radius:8px;padding:9px 11px;margin-bottom:5px;display:flex;justify-content:space-between;align-items:center}
`;

// ── shared components ────────────────────────────────────────────────────────
function Loader({ t = "Loading…" }) {
  return (
    <div className="ldr">
      <div className="spin" />
      <span className="ldr-t">{t}</span>
    </div>
  );
}
function Empty({ icon = "🚂", msg }) {
  return (
    <div className="empty">
      <div className="empty-i">{icon}</div>
      <div style={{ fontSize: 14 }}>{msg}</div>
    </div>
  );
}
function Back({ onClick }) {
  return (
    <div className="back" onClick={onClick}>
      ← Back
    </div>
  );
}

// Station autocomplete
function StationInput({ icon, placeholder, onSelect }) {
  const [q, setQ] = useState("");
  const [sugg, setSugg] = useState([]);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const timer = useRef(null);

  function handleChange(e) {
    const v = e.target.value;
    setQ(v);
    setOpen(true);
    clearTimeout(timer.current);
    if (v.trim().length < 2) {
      setSugg([]);
      return;
    }
    timer.current = setTimeout(async () => {
      setBusy(true);
      try {
        const raw = await get(
          `${API}/station?query=${encodeURIComponent(v.trim())}`,
        );
        let list = Array.isArray(raw)
          ? raw
          : Array.isArray(raw.data)
            ? raw.data
            : Array.isArray(raw.stations)
              ? raw.stations
              : Object.values(raw || {}).find(Array.isArray) || [];
        setSugg(list.slice(0, 8));
      } catch {
        setSugg([]);
      }
      setBusy(false);
    }, 380);
  }

  function pick(s) {
    const name = dig(s, "name", "station_name", "stationName") || "";
    const code = dig(s, "code", "station_code", "stationCode") || "";
    setQ(code ? `${name} (${code})` : name);
    setSugg([]);
    setOpen(false);
    onSelect({ name, code });
  }

  return (
    <div className="wrap">
      <div className="ig">
        <span className="ico">{icon}</span>
        <input
          value={q}
          onChange={handleChange}
          placeholder={placeholder}
          onFocus={() => sugg.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          autoComplete="off"
          spellCheck={false}
        />
        {busy && <span style={{ fontSize: 12, color: "#8B7355" }}>…</span>}
      </div>
      {open && sugg.length > 0 && (
        <div className="ddrop">
          {sugg.map((s, i) => {
            const name = dig(s, "name", "station_name", "stationName") || "";
            const code = dig(s, "code", "station_code", "stationCode") || "";
            const state = dig(s, "state", "stateName", "state_name") || "";
            return (
              <div key={i} className="si" onMouseDown={() => pick(s)}>
                <span className="si-name">
                  {name}
                  {state ? `, ${state}` : ""}
                </span>
                {code && <span className="si-code">{code}</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── SCREEN: Train Info (from train number search) ────────────────────────────
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function TrainInfoScreen({ trainNo, onBack, onLiveStatus }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr("");
    setData(null);
    get(`${API}/train/${trainNo}/info`)
      .then((raw) => {
        if (alive) {
          setData(raw?.data ?? raw);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (alive) {
          setErr(e.message);
          setLoading(false);
        }
      });
    return () => {
      alive = false;
    };
  }, [trainNo]);

  const StickyBack = () => (
    <div
      style={{
        position: "sticky",
        top: 70,
        background: "#FDF6EE",
        zIndex: 50,
        paddingTop: 8,
      }}
    >
      <Back onClick={onBack} />
    </div>
  );

  if (loading)
    return (
      <>
        <StickyBack />
        <Loader t="Fetching train info…" />
      </>
    );
  if (err)
    return (
      <>
        <StickyBack />
        <div className="err">Error: {err}</div>
      </>
    );
  if (!data)
    return (
      <>
        <StickyBack />
        <Empty icon="❓" msg="No data found" />
      </>
    );

  // map all your specified fields + fallbacks
  const num =
    dig(data, "trainNo", "train_number", "trainNumber", "number") || trainNo;
  const name = dig(data, "trainName", "train_name", "name") || "—";
  const fromCode =
    dig(data, "fromStnCode", "from_stn_code", "source_stn_code", "from") || "—";
  const toCode =
    dig(data, "toStnCode", "to_stn_code", "dest_stn_code", "to") || "—";
  const fromName =
    dig(
      data,
      "fromStnName",
      "from_stn_name",
      "source_stn_name",
      "from_station_name",
    ) || fromCode;
  const toName =
    dig(data, "toStnName", "to_stn_name", "dest_stn_name", "to_station_name") ||
    toCode;
  const distance = dig(data, "distance", "total_distance", "totalDistance");
  const fromTime = dig(data, "fromTime", "from_time", "departure", "dep_time");
  const toTime = dig(data, "toTime", "to_time", "arrival", "arr_time");
  const trainType = dig(data, "trainType", "train_type", "type");
  const travelTime = dig(data, "travelTime", "travel_time", "duration");

  // running days — could be array of booleans indexed Mon-Sun, or array of strings, or object
  const runsRaw = dig(data, "runningDays", "running_days", "runs_on", "runsOn");
  let runDays = [false, false, false, false, false, false, false]; // Mon..Sun
  if (Array.isArray(runsRaw)) {
    if (typeof runsRaw[0] === "boolean") runDays = runsRaw.slice(0, 7);
    else if (typeof runsRaw[0] === "string") {
      runDays = DAYS.map((d) =>
        runsRaw.some((r) => r.toLowerCase().startsWith(d.toLowerCase())),
      );
    } else if (typeof runsRaw[0] === "number") {
      // 1-indexed day numbers: 1=Mon ... 7=Sun
      runDays = DAYS.map((_, i) => runsRaw.includes(i + 1));
    }
  } else if (typeof runsRaw === "string") {
    // e.g. "1111111" or "Mon,Wed,Fri"
    if (/^[01]{7}$/.test(runsRaw))
      runDays = runsRaw.split("").map((c) => c === "1");
    else
      runDays = DAYS.map((d) =>
        runsRaw.toLowerCase().includes(d.toLowerCase()),
      );
  }

  // route — your specified keys: stationName, stationCode, distance, platform, arrival, departure, day
  const route = arr(
    dig(data, "route", "schedule", "stations", "stoppages", "stoppage_details"),
  ).map((s) => ({
    stationName: dig(s, "stationName", "station_name", "name", "station"),
    stationCode: dig(s, "stationCode", "station_code", "code"),
    distance: dig(s, "distance", "km"),
    platform: dig(s, "platform", "platform_number", "pf"),
    arrival: dig(s, "arrival", "arr", "arrivalTime", "arrival_time"),
    departure: dig(s, "departure", "dep", "departureTime", "departure_time"),
    day: dig(s, "day", "arrive_day", "arrDay"),
  }));

  return (
    <div>
      <StickyBack />

      {/* header */}
      <div className="dhdr">
        <div className="dnum">{num}</div>
        <div className="dname">{name}</div>
        <div className="dsub">
          {fromName} → {toName}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {trainType && (
            <span
              className="bdg"
              style={{ background: "rgba(255,255,255,.18)", color: "#fff" }}
            >
              {trainType}
            </span>
          )}
          {travelTime && (
            <span
              className="bdg"
              style={{ background: "rgba(255,255,255,.18)", color: "#fff" }}
            >
              ⏱ {travelTime}
            </span>
          )}
        </div>
      </div>

      {/* live status CTA */}
      <button
        className="btn btn-outline"
        style={{ marginBottom: 14 }}
        onClick={() => onLiveStatus(num, name)}
      >
        🔴 View Live Running Status
      </button>

      {/* key info grid */}
      <p className="sec">Train Details</p>
      <div className="igrid">
        <div className="ic">
          <div className="ic-l">From</div>
          <div className="ic-v">{fromCode}</div>
          <div style={{ fontSize: 11, color: "#8B7355", marginTop: 2 }}>
            {fromName}
          </div>
        </div>
        <div className="ic">
          <div className="ic-l">To</div>
          <div className="ic-v">{toCode}</div>
          <div style={{ fontSize: 11, color: "#8B7355", marginTop: 2 }}>
            {toName}
          </div>
        </div>
        {fromTime && (
          <div className="ic">
            <div className="ic-l">Departs</div>
            <div
              className="ic-v"
              style={{ fontFamily: "'Space Mono',monospace" }}
            >
              {fromTime}
            </div>
          </div>
        )}
        {toTime && (
          <div className="ic">
            <div className="ic-l">Arrives</div>
            <div
              className="ic-v"
              style={{ fontFamily: "'Space Mono',monospace" }}
            >
              {toTime}
            </div>
          </div>
        )}
        {distance && (
          <div className="ic">
            <div className="ic-l">Distance</div>
            <div className="ic-v">{distance} km</div>
          </div>
        )}
        {travelTime && (
          <div className="ic">
            <div className="ic-l">Travel Time</div>
            <div className="ic-v">{travelTime}</div>
          </div>
        )}
        {trainType && (
          <div className="ic ic-full">
            <div className="ic-l">Train Type</div>
            <div className="ic-v">{trainType}</div>
          </div>
        )}
      </div>

      {/* running days */}
      <p className="sec">Running Days</p>
      <div className="days-row" style={{ justifyContent: "space-between" }}>
        {DAYS.map((d, i) => (
          <div
            key={d}
            className={`day-chip${runDays[i] ? " on" : ""}`}
            title={d}
          >
            {d[0]}
          </div>
        ))}
      </div>

      {/* route */}
      {route.length > 0 && (
        <>
          <p className="sec">Route · {route.length} stations</p>
          {route.map((s, i) => {
            const isFirst = i === 0;
            const isLast = i === route.length - 1;
            return (
              <div key={i} className="tl-row">
                <div className="tl-col">
                  <div
                    className={`tl-dot${isFirst ? " first" : isLast ? " last" : ""}`}
                  />
                  {!isLast && <div className="tl-line" />}
                </div>
                <div className="st-info">
                  <div className="st-name">
                    {s.stationName || s.stationCode || "—"}
                  </div>
                  <div className="st-code">
                    {s.stationCode}
                    {s.distance != null ? ` · ${s.distance} km` : ""}
                    {s.platform != null ? ` · Pf ${s.platform}` : ""}
                    {s.day != null ? ` · Day ${s.day}` : ""}
                  </div>
                  <div className="st-times">
                    {s.arrival && s.arrival !== "–" && s.arrival !== "--" && (
                      <span className="st-t">
                        Arr <span>{s.arrival}</span>
                      </span>
                    )}
                    {s.departure &&
                      s.departure !== "–" &&
                      s.departure !== "--" && (
                        <span className="st-t">
                          Dep <span>{s.departure}</span>
                        </span>
                      )}
                  </div>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

// ── SCREEN: Live Running Status (shared, used from multiple tabs) ─────────────
function LiveStatusScreen({ trainNo, trainName, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [tick, setTick] = useState(0);
  const [dayOffset, setDayOffset] = useState(0);
  const [stnOpen, setStnOpen] = useState("");

  const curRef = useRef(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr("");
    if (tick === 0) {
      setData(null);
    }
    get(`${API}/train/liveStatus?trainNo=${trainNo}&startDay=${dayOffset}`)
      .then((raw) => {
        if (alive) {
          setData(raw?.data ?? raw);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (alive) {
          setErr(e.message);
          setLoading(false);
        }
      });
    return () => {
      alive = false;
    };
  }, [trainNo, tick, dayOffset]);

  useEffect(() => {
    if (!loading && data && curRef.current) {
      curRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [data, loading]);

  const StickyBack = () => (
    <div
      style={{
        position: "sticky",
        top: 70,
        background: "#FDF6EE",
        zIndex: 50,
        paddingTop: 8,
      }}
    >
      <Back onClick={onBack} />
    </div>
  );

  if (loading && tick === 0)
    return (
      <>
        <StickyBack />
        <Loader t="Fetching live status…" />
      </>
    );

  const d = data ?? {};
  const name =
    trainName || dig(d, "trainName", "train_name", "name") || trainNo;
  const currentCode = dig(d, "current_station_code");
  const currentName = dig(d, "currentStationName", "current_station_name");
  const delay = dig(d, "delay", "delayMinutes", "delay_minutes");
  const status = dig(d, "status", "running_status", "runningStatus");
  const lastUpdated = dig(
    d,
    "lastUpdateIsoDate",
    "last_updated",
    "update_time",
  );

  const nextStoppage = d?.next_stoppage_info?.next_stoppage ?? "";

  const stations = [
    ...arr(dig(d, "previous_stations")),
    ...arr(dig(d, "upcoming_stations")),
  ].filter((s) => s.station_code !== "");

  const curIdx = currentCode
    ? stations.findIndex((s) => {
        const c = dig(s, "stationCode", "station_code", "code") || "";
        return (
          c.toUpperCase() === currentCode.toUpperCase() ||
          s.non_stops.find((n) => n.station_code === currentCode)
        );
      })
    : -1;

  return (
    <div>
      <StickyBack />

      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {[
          ["Today", 0],
          ["Yesterday", 1],
          ["2 days ago", 2],
        ].map(([label, offset]) => (
          <button
            key={offset}
            onClick={() => {
              setDayOffset(offset);
              setTick((t) => t + 1);
            }}
            style={{
              flex: 1,
              padding: "8px 4px",
              border: `1.5px solid ${dayOffset === offset ? "#E8521A" : "#E8D5C4"}`,
              borderRadius: 10,
              background: dayOffset === offset ? "#FFF0E5" : "#fff",
              color: dayOffset === offset ? "#E8521A" : "#8B7355",
              fontSize: 12,
              fontWeight: dayOffset === offset ? 600 : 400,
              cursor: "pointer",
              fontFamily: "'Sora',sans-serif",
              transition: "all .15s",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* floating refresh button */}
      <button
        onClick={() => setTick((t) => t + 1)}
        disabled={loading}
        style={{
          position: "fixed",
          bottom: 28,
          right: 24,
          zIndex: 999,
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "12px",
          borderRadius: 50,
          border: "none",
          background: loading ? "#D4B89A" : "#E8521A",
          color: "#fff",
          fontSize: 13,
          fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
          fontFamily: "'Sora',sans-serif",
          boxShadow: "0 4px 16px rgba(232,82,26,.35)",
        }}
      >
        <span
          style={{
            display: "inline-block",
            animation: loading ? "spin .7s linear infinite" : "none",
            fontSize: 16,
            lineHeight: 1,
          }}
        >
          ⟳
        </span>
      </button>

      {/* live header */}
      <div className="live-hdr">
        <div className="live-badge">
          <span className="ldot" /> Live
        </div>
        <div
          style={{
            fontFamily: "'Space Mono',monospace",
            fontSize: 11,
            opacity: 0.6,
            marginBottom: 2,
          }}
        >
          {trainNo}
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>
          {name}
        </div>

        {(currentCode || currentName) && (
          <div
            style={{
              background: "rgba(255,255,255,.1)",
              borderRadius: 10,
              padding: "10px 12px",
              marginBottom: 8,
            }}
          >
            <div
              style={{
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: 0.8,
                opacity: 0.65,
                marginBottom: 3,
              }}
            >
              Currently at / near
            </div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>
              {currentName.replace("~", "") || currentCode}
            </div>
            {currentName && currentCode && (
              <div
                style={{
                  fontSize: 11,
                  fontFamily: "'Space Mono',monospace",
                  opacity: 0.7,
                  marginTop: 1,
                }}
              >
                {currentCode}
              </div>
            )}
          </div>
        )}

        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          {delay != null && (
            <span
              className="bdg"
              style={{ background: "rgba(255,255,255,.15)", color: "#fff" }}
            >
              {+delay > 0
                ? `${delay} min late`
                : +delay < 0
                  ? `${Math.abs(delay)} min early`
                  : "On time ✓"}
            </span>
          )}
          {status && (
            <span
              className="bdg"
              style={{ background: "rgba(255,255,255,.15)", color: "#fff" }}
            >
              {status}
            </span>
          )}
          {lastUpdated && (
            <span
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,.55)",
                alignSelf: "center",
              }}
            >
              Updated{" "}
              {`${new Date(lastUpdated).toDateString()} at ${new Date(lastUpdated).toLocaleTimeString()}`}
            </span>
          )}
          <p style={{ marginTop: "5px", fontSize: "14px" }}>{d.new_message}</p>
        </div>
      </div>

      {err && <div className="err">Could not fetch live data: {err}</div>}

      {stations.length > 0 ? (
        <>
          <p className="sec">Live Route · {stations.length} stations</p>
          {stations.map((s, i) => {
            const sName = dig(
              s,
              "stationName",
              "station_name",
              "name",
              "station",
            );
            const sCode = dig(s, "stationCode", "station_code", "code") || "";
            const arr_t = dig(s, "sta");
            const dep_t = dig(s, "std");
            const sDelay = dig(s, "arrival_delay");
            const dist = dig(s, "distance_from_source");
            const pf = dig(s, "platform_number");
            const day = s.a_day + 1;
            const isCur = i === curIdx;
            const isDone = s.distance_from_source < d.distance_from_source;
            const isLast = i === stations.length - 1;
            return (
              <>
                {nextStoppage === s.station_name && (
                  <div
                    key={i + Math.random()}
                    className="tl-row"
                    ref={isCur ? curRef : null}
                    style={{ marginBlock: "12px" }}
                  >
                    <div className="tl-col">
                      <div className={`tl-dot cur`} />
                    </div>
                    <div className="st-info">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          className="st-name"
                          style={{ color: "#E8521A", fontWeight: 600 }}
                        >
                          {`${d.bubble_message.message_type} ${d.bubble_message.station_name} (${d.current_location_info[0].message})`}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <div
                  key={s.station_code || i}
                  className="tl-row"
                  ref={nextStoppage === s.station_name ? curRef : null}
                  onClick={() =>
                    setStnOpen(s.station_code === stnOpen ? "" : s.station_code)
                  }
                >
                  <div className="tl-col">
                    <div
                      className={`tl-dot${isCur ? " cur" : isDone ? " done" : ""}`}
                    />
                    {!isLast && (
                      <div
                        className={`tl-line${isCur ? " cur" : isDone ? " done" : ""}`}
                      />
                    )}
                  </div>
                  <div className="st-info">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        className="st-name"
                        style={
                          isCur
                            ? {
                                color: "#E8521A",
                                fontWeight: 600,
                                textTransform: "capitalize",
                              }
                            : { textTransform: "capitalize" }
                        }
                      >
                        {sName || currentCode}
                      </span>
                      {isCur && (
                        <span
                          className="bdg bdg-o"
                          style={{ fontSize: 10, padding: "1px 6px" }}
                        >
                          ● Here
                        </span>
                      )}
                      {isDone && s.station_name && (
                        <span
                          className="bdg bdg-g"
                          style={{ fontSize: 10, padding: "1px 6px" }}
                        >
                          Passed
                        </span>
                      )}
                    </div>
                    <div className="st-code">
                      {sCode}
                      {dist != null ? ` · ${dist} km` : ""}
                      {pf != null ? ` · Pf ${pf}` : ""}
                      {day != null ? ` · Day ${day}` : ""}
                    </div>
                    <div className="st-times">
                      {arr_t && arr_t !== "--" && arr_t !== "–" && (
                        <span className="st-t">
                          {arr_t}{" "}
                          <span style={{ color: sDelay ? "red" : "" }}>
                            ({sDelay ? s.eta : arr_t})
                          </span>
                        </span>
                      )}
                      {dep_t && dep_t !== "--" && dep_t !== "–" && (
                        <span className="st-t">
                          {dep_t}{" "}
                          <span style={{ color: sDelay ? "red" : "" }}>
                            ({sDelay ? s.etd : dep_t})
                          </span>
                        </span>
                      )}
                      {sDelay > 0 && (
                        <span
                          className="bdg bdg-o"
                          style={{ fontSize: 10, padding: "1px 6px" }}
                        >
                          Delay {sDelay}m
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {stnOpen === s.station_code &&
                  s.non_stops.map((ns, id) => {
                    return (
                      <div
                        key={ns.station_code || id}
                        className="tl-row"
                        style={{ marginLeft: "10px" }}
                      >
                        <div className="tl-col">
                          <div
                            className={`tl-dot ${isDone ? "done" : ""}`}
                            style={{
                              backgroundColor: !isDone ? "gray" : undefined,
                              boxShadow: !isDone ? "0 0 0 2px gray" : undefined,
                            }}
                          />
                          {!isLast && (
                            <div
                              className={`tl-line ${isDone ? "done" : ""}`}
                              style={{
                                backgroundColor: !isDone ? "gray" : undefined,
                              }}
                            />
                          )}
                        </div>
                        <div className="st-info">
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              flexWrap: "wrap",
                            }}
                          >
                            <span
                              className="st-name"
                              style={
                                isCur && !stations[curIdx]?.departed
                                  ? {
                                      color: "#E8521A",
                                      fontWeight: 600,
                                      textTransform: "capitalize",
                                    }
                                  : { textTransform: "capitalize" }
                              }
                            >
                              {ns.station_name}
                            </span>
                          </div>
                          <div className="st-code">
                            {ns.station_code}
                            {` · ${ns.distance_from_source} km`}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </>
            );
          })}
        </>
      ) : (
        !err && (
          <Empty
            icon="📡"
            msg="Live position data not available for this train right now"
          />
        )
      )}
    </div>
  );
}

// ── TAB: Trains Between Stations ─────────────────────────────────────────────
function TabTrains({ navigate, state, onState }) {
  const { from, to, trains, err } = state;

  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState(() => readLS("recent_trains", []));

  async function search() {
    if (!from?.code || !to?.code) {
      onState({ ...state, err: "Select both stations from the dropdown." });
      return;
    }
    onState({ ...state, err: "", trains: null });
    setLoading(true);
    try {
      const raw = await get(
        `${API}/train/trainsBetweenStations?from=${from.code}&to=${to.code}`,
      );
      const list = Array.isArray(raw)
        ? raw
        : arr(raw.data ?? raw.trains ?? raw.trainList ?? []);
      onState({ ...state, trains: list });
    } catch (e) {
      onState({ ...state, err: e.message, trains: null });
    }
    setLoading(false);
  }

  function handleTrainClick(t, num, name) {
    const item = {
      trainNo: num,
      trainName: name,
      fromCode: from.code,
      fromName: from.name,
      toCode: to.code,
      toName: to.name,
    };
    const next = pushHistory("recent_trains", item, 6);
    setRecent(next);
    navigate("live", { trainNo: num, trainName: name });
  }

  return (
    <div>
      <p className="sec">Find Trains</p>
      <StationInput
        icon="🚉"
        placeholder="From — type station name"
        onSelect={(s) => {
          onState({ ...state, err: "", from: s });
        }}
      />
      <StationInput
        icon="📍"
        placeholder="To — type station name"
        onSelect={(s) => {
          onState({ ...state, err: "", to: s });
        }}
      />
      {err && <div className="err">{err}</div>}
      <button
        className="btn"
        onClick={search}
        disabled={loading || !from?.code || !to?.code}
      >
        {loading ? "Searching…" : "Search Trains"}
      </button>
      {loading && <Loader t="Finding trains…" />}
      {trains !== null && !loading && (
        <>
          <div className="div" />
          <p className="sec">
            {trains.length} train{trains.length !== 1 ? "s" : ""} found
          </p>
          {trains.length === 0 ? (
            <Empty icon="🚂" msg="No trains found between these stations" />
          ) : (
            trains.map((t, i) => {
              const num = dig(t, "trainNo") || "—";
              const name = dig(t, "train_name", "trainName", "name") || "—";
              const dur = dig(t, "duration", "travelTime", "travelTime");
              return (
                <div
                  key={i}
                  className="card"
                  onClick={() => handleTrainClick(t, num, name)}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <span className="tnum">{num}</span>
                    <span className="bdg bdg-b" style={{ fontSize: 10 }}>
                      Tap for live ›
                    </span>
                  </div>
                  <div className="tname">{name}</div>
                  <div className="route-row">
                    <span>{`${from.code} (${t.fromTime})`}</span>
                    <div className="rdot" />
                    <div className="rline" />
                    <span>{dur}</span>
                    <div className="rline" />
                    <div className="rdot" />
                    <span>{`${to.code} (${t.toTime})`}</span>
                  </div>
                </div>
              );
            })
          )}
        </>
      )}

      {recent.length > 0 && trains === null && !loading && (
        <>
          <div className="div" />
          <p className="sec">Recently viewed</p>
          {recent.map((r, i) => (
            <div
              key={i}
              className="card"
              onClick={() =>
                navigate("live", { trainNo: r.trainNo, trainName: r.trainName })
              }
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <span className="tnum">{r.trainNo}</span>
                <span className="bdg bdg-gr" style={{ fontSize: 10 }}>
                  Recent
                </span>
              </div>
              <div className="tname">{r.trainName}</div>
              <div className="route-row">
                <span>{r.fromCode}</span>
                <div className="rdot" />
                <div className="rline" />
                <div className="rdot" />
                <span>{r.toCode}</span>
              </div>
              <div style={{ fontSize: 11, color: "#8B7355", marginTop: 4 }}>
                {r.fromName} → {r.toName}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ── TAB: Live at Station ──────────────────────────────────────────────────────
function TabStation({ navigate, state, onState }) {
  const { station, trains, err } = state;

  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState(() => readLS("recent_stations", []));

  async function search(stn) {
    const target = stn || station;
    if (!target?.code) {
      onState({ ...state, err: "Select a station from the dropdown." });
      return;
    }
    onState({ ...state, err: "", trains: null, station: target });
    setLoading(true);
    try {
      const raw = await get(`${API}/train/liveStationAt/${target.code}`);
      const list = Array.isArray(raw)
        ? raw
        : arr(raw.data ?? raw.trains ?? raw.trainList ?? []);
      onState({ station: target, err: "", trains: list });
      const next = pushHistory(
        "recent_stations",
        { name: target.name, code: target.code },
        6,
      );
      setRecent(next);
    } catch (e) {
      onState({ ...state, err: e.message, trains: null });
    }
    setLoading(false);
  }

  return (
    <div>
      <p className="sec">Live at Station</p>
      <StationInput
        icon="🏠"
        placeholder="Search station…"
        onSelect={(s) => {
          onState({ ...state, err: "", station: s });
        }}
      />
      <div style={{ marginTop: 6 }} />
      {err && <div className="err">{err}</div>}
      <button
        className="btn"
        onClick={() => search()}
        disabled={loading || !station?.code}
      >
        {loading ? "Fetching…" : "Get Live Board"}
      </button>
      {loading && <Loader t="Fetching live board…" />}
      {trains !== null && !loading && (
        <>
          <div className="div" />
          <p className="sec">
            {trains.length} train{trains.length !== 1 ? "s" : ""} at{" "}
            {station.name}
          </p>
          {trains.length === 0 ? (
            <Empty
              icon="🚉"
              msg="No trains currently tracked at this station"
            />
          ) : (
            trains.map((t, i) => {
              const num = dig(t, "trainNo");
              const name = dig(t, "train_name", "trainName", "name");
              const arr_t = dig(t, "timeAt");
              return (
                <div
                  key={i}
                  className="sat"
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    navigate("live", { trainNo: num, trainName: name })
                  }
                >
                  <div className="sat-l">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "'Space Mono',monospace",
                          fontSize: 14,
                          color: "#8B7355",
                        }}
                      >
                        {num}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#8B7355",
                          marginTop: 3,
                          display: "flex",
                          gap: 10,
                        }}
                      >
                        {arr_t && <span>{arr_t}</span>}
                      </div>
                    </div>
                    <div
                      style={{ fontWeight: 600, fontSize: 14, marginBlock: 6 }}
                    >
                      {name}
                    </div>
                    <div className="route-row">
                      <span>{t.source}</span>
                      <div className="rdot" />
                      <div className="rline" />
                      <div className="rdot" />
                      <span>{t.dest}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </>
      )}

      {recent.length > 0 && trains === null && !loading && (
        <>
          <div className="div" />
          <p className="sec">Recent stations</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {recent.map((r, i) => (
              <div
                key={i}
                onClick={() => {
                  onState({ ...state, err: "", station: r });
                  search(r);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 13px",
                  background: "#fff",
                  border: "1.5px solid #E8D5C4",
                  borderRadius: 10,
                  cursor: "pointer",
                  transition: "border-color .15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = "#E8521A")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = "#E8D5C4")
                }
              >
                <span style={{ fontSize: 13 }}>🏠</span>
                <div>
                  <div
                    style={{ fontSize: 13, fontWeight: 500, color: "#1A1410" }}
                  >
                    {r.name}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      fontFamily: "'Space Mono',monospace",
                      color: "#8B7355",
                    }}
                  >
                    {r.code}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── TAB: PNR Status ───────────────────────────────────────────────────────────
function TabPNR() {
  const [pnr, setPnr] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function check() {
    if (pnr.length !== 10) {
      setErr("Enter a valid 10-digit PNR.");
      return;
    }
    setErr("");
    setLoading(true);
    setData(null);
    try {
      const raw = await get(`${API}/train/pnr/${pnr}`);
      setData(raw?.data ?? raw);
    } catch (e) {
      setErr(e.message);
    }
    setLoading(false);
  }

  function sbdg(s = "") {
    const l = s.toLowerCase();
    if (l === "cnf" || l.includes("confirm")) return "bdg-g";
    if (l.startsWith("wl") || l.includes("wait") || l.startsWith("rac"))
      return "bdg-o";
    return "bdg-gr";
  }

  const d = data ?? {};
  const trainNo = dig(d, "train_number", "trainNumber") || "—";
  const trainName = dig(d, "train_name", "trainName") || "";
  const rows = [
    [
      "From",
      dig(d, "boarding_station_name", "from", "boardingStation", "source"),
    ],
    [
      "To",
      dig(
        d,
        "destination_station_name",
        "to",
        "destinationStation",
        "destination",
      ),
    ],
    ["Date", dig(d, "date_of_journey", "dateOfJourney", "journeyDate", "doj")],
    ["Class", dig(d, "class", "travel_class", "travelClass", "bookingClass")],
    [
      "Chart",
      d.chart_prepared != null
        ? d.chart_prepared
          ? "Prepared ✓"
          : "Not yet"
        : null,
    ],
  ].filter(([, v]) => v != null && v !== "");
  const passengers = arr(
    d.passengers ?? d.passengerList ?? d.passengerDetails ?? [],
  );

  return (
    <div>
      <p className="sec">PNR Status</p>
      <div className="ig" style={{ marginBottom: 8 }}>
        <span className="ico">🎫</span>
        <input
          placeholder="Enter 10-digit PNR"
          value={pnr}
          onChange={(e) =>
            setPnr(e.target.value.replace(/\D/g, "").slice(0, 10))
          }
          style={{ fontFamily: "'Space Mono',monospace", letterSpacing: 3 }}
          maxLength={10}
        />
        <span style={{ fontSize: 12, color: "#8B7355", flexShrink: 0 }}>
          {pnr.length}/10
        </span>
      </div>
      {err && <div className="err">{err}</div>}
      <button
        className="btn"
        onClick={check}
        disabled={loading || pnr.length !== 10}
      >
        {loading ? "Checking…" : "Check PNR Status"}
      </button>
      {loading && <Loader t="Checking PNR…" />}
      {data && !loading && (
        <div style={{ marginTop: 14 }}>
          <div className="dhdr">
            <div className="dnum">{trainNo}</div>
            <div className="dname">{trainName || "PNR Result"}</div>
          </div>
          {rows.length > 0 && (
            <div className="pcrd">
              {rows.map(([l, v]) => (
                <div key={l} className="prow">
                  <span className="pl">{l}</span>
                  <span className="pv">{String(v)}</span>
                </div>
              ))}
            </div>
          )}
          {passengers.length > 0 && (
            <>
              <p className="sec" style={{ marginTop: 10 }}>
                Passengers ({passengers.length})
              </p>
              {passengers.map((p, i) => {
                const seat =
                  dig(
                    p,
                    "current_status",
                    "currentStatus",
                    "booking_status",
                    "bookingStatus",
                    "status",
                  ) || "—";
                const berth = dig(p, "berth", "berth_no", "berthNo", "seat_no");
                const coach = dig(p, "coach", "coach_no");
                return (
                  <div key={i} className="pax">
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>
                        Passenger {p.number ?? p.serial ?? i + 1}
                      </div>
                      {berth && (
                        <div style={{ fontSize: 11, color: "#8B7355" }}>
                          Berth {berth}
                          {coach ? ` · Coach ${coach}` : ""}
                        </div>
                      )}
                    </div>
                    <span className={`bdg ${sbdg(seat)}`}>{seat}</span>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── TAB: Train Number ─────────────────────────────────────────────────────────
function TabTrainNo({ navigate, state, onState }) {
  const num = state.num || "";
  const setNum = (v) => onState((prev) => ({ ...prev, num: v }));

  const [recent, setRecent] = useState(() => readLS("recent_train_nos", []));

  function handleSearch(trainNo) {
    const next = pushHistory("recent_train_nos", { trainNo }, 6);
    setRecent(next);
    navigate("trainInfo", { trainNo });
  }

  return (
    <div>
      <p className="sec">Search by Train Number</p>
      <div className="ig" style={{ marginBottom: 8 }}>
        <span className="ico">🚂</span>
        <input
          placeholder="e.g. 12951"
          value={num}
          onChange={(e) =>
            setNum(e.target.value.replace(/\D/g, "").slice(0, 5))
          }
          style={{ fontFamily: "'Space Mono',monospace", letterSpacing: 3 }}
          maxLength={5}
        />
        <span style={{ fontSize: 12, color: "#8B7355", flexShrink: 0 }}>
          {num.length}/5
        </span>
      </div>
      <button
        className="btn"
        disabled={num.length < 4}
        onClick={() => handleSearch(num)}
      >
        Get Train Info
      </button>

      {recent.length > 0 && (
        <>
          <div className="div" />
          <p className="sec">Recent searches</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {recent.map((r, i) => (
              <div
                key={i}
                onClick={() => handleSearch(r.trainNo)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  background: "#fff",
                  border: "1.5px solid #E8D5C4",
                  borderRadius: 10,
                  cursor: "pointer",
                  transition: "border-color .15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = "#E8521A")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = "#E8D5C4")
                }
              >
                <span style={{ fontSize: 13 }}>🚂</span>
                <span
                  style={{
                    fontFamily: "'Space Mono',monospace",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#1A1410",
                  }}
                >
                  {r.trainNo}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Root App with stack navigation ───────────────────────────────────────────
const TABS = [
  { id: "trains", icon: "🚆", label: "Trains" },
  { id: "station", icon: "🏠", label: "Station" },
  { id: "pnr", icon: "🎫", label: "PNR" },
  { id: "number", icon: "🔢", label: "Train No" },
];

export default function App() {
  const [tab, setTab] = useState("trains");
  const [stack, setStack] = useState([]);
  const [trainsState, setTrainsState] = useState({
    from: null,
    to: null,
    trains: null,
    err: "",
  });
  const [stationState, setStationState] = useState({
    station: null,
    trains: null,
    err: "",
  });
  const [trainNoState, setTrainNoState] = useState({ num: "" });

  function navigate(screen, props = {}) {
    setStack((s) => [...s, { screen, props }]);
  }
  function goBack() {
    setStack((s) => s.slice(0, -1));
  }

  const top = stack[stack.length - 1];

  // full-screen overlays (no nav tabs shown)
  if (top?.screen === "live") {
    return (
      <>
        <style>{css}</style>
        <div className="app">
          <div className="hdr">
            <div className="hdr-t">🟢 Live Status</div>
            <div className="hdr-s">Real-time position</div>
          </div>
          <div className="pg">
            <LiveStatusScreen
              trainNo={top.props.trainNo}
              trainName={top.props.trainName}
              onBack={goBack}
            />
          </div>
        </div>
      </>
    );
  }

  if (top?.screen === "trainInfo") {
    return (
      <>
        <style>{css}</style>
        <div className="app">
          <div className="hdr">
            <div className="hdr-t">🚂 Train Info</div>
            <div className="hdr-s">Schedule &amp; Details</div>
          </div>
          <div className="pg">
            <TrainInfoScreen
              trainNo={top.props.trainNo}
              onBack={goBack}
              onLiveStatus={(no, name) =>
                navigate("live", { trainNo: no, trainName: name })
              }
            />
          </div>
        </div>
      </>
    );
  }

  // home tabs
  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="hdr">
          <div className="hdr-t">🚆 Where is your Train</div>
          <div className="hdr-s">Indian Railway Live Tracker</div>
        </div>
        <div className="nav">
          {TABS.map((t) => (
            <div
              key={t.id}
              className={`tab${tab === t.id ? " on" : ""}`}
              onClick={() => setTab(t.id)}
            >
              <div style={{ fontSize: 16, marginBottom: 2 }}>{t.icon}</div>
              {t.label}
            </div>
          ))}
        </div>
        <div className="pg">
          {tab === "trains" && (
            <TabTrains
              navigate={navigate}
              state={trainsState}
              onState={setTrainsState}
            />
          )}
          {tab === "station" && (
            <TabStation
              navigate={navigate}
              state={stationState}
              onState={setStationState}
            />
          )}
          {tab === "pnr" && <TabPNR />}
          {tab === "number" && (
            <TabTrainNo
              navigate={navigate}
              state={trainNoState}
              onState={setTrainNoState}
            />
          )}
        </div>
      </div>
    </>
  );
}
