function $(sel, root = document) {
  return root.querySelector(sel);
}

function showToast(message, type = "ok") {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.dataset.type = type;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => {
    toast.hidden = true;
  }, 2500);
}

function getKey() {
  const url = new URL(window.location.href);
  const q = url.searchParams.get("key");
  return q || localStorage.getItem("hvac_demo_key") || "";
}

function withKey(urlPath) {
  const key = getKey();
  // If opened via file://, window.location.origin is "null" and URL construction/fetch can be problematic.
  // Use a sensible default; if the API isn't running, we fall back to mock rows.
  const origin =
    window.location.origin && window.location.origin !== "null"
      ? window.location.origin
      : "http://127.0.0.1:4173";
  const url = new URL(urlPath, origin);
  if (key) url.searchParams.set("key", key);
  return url.toString();
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatTime(iso) {
  // Keep the table compact (video-friendly). Put full timestamp in the cell title.
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return String(iso || "");
  }
}

function formatTimeFull(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return String(iso || "");
  }
}

function formatTimeShort(iso) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return "";
  }
}

function formatSource(source) {
  const sourceMap = {
    simulator: { label: "Demo", color: "#6366f1" },
    landing_call_click: { label: "Call click", color: "#8b5cf6" },
    landing_form: { label: "Form submit", color: "#0ea5e9" },
    twilio: { label: "Inbound call", color: "#10b981" },
  };
  return sourceMap[source] || { label: source || "Unknown", color: "#94a3b8" };
}

function formatDuration(seconds) {
  const s = Number(seconds);
  if (!Number.isFinite(s)) return "—";
  const total = Math.max(0, Math.floor(s));
  const m = Math.floor(total / 60);
  const rem = total % 60;
  if (m <= 0) return `${rem}s`;
  if (rem === 0) return `${m}m`;
  return `${m}m ${rem}s`;
}

const OUTCOME_OPTIONS = [
  { value: "", label: "Set result…", displayLabel: "Set result…", color: "#94a3b8" },
  { value: "booked", label: "Booked", displayLabel: "✅ Booked", color: "#16a34a" },
  { value: "reached_no_booking", label: "Contacted (no booking)", displayLabel: "📞 Contacted", color: "#f59e0b" },
  { value: "no_answer", label: "No answer", displayLabel: "❌ No answer", color: "#94a3b8" },
  { value: "already_hired", label: "Already hired", displayLabel: "🚫 Already hired", color: "#dc2626" },
  { value: "wrong_number", label: "Wrong number/spam", displayLabel: "⚠️ Wrong number", color: "#dc2626" },
  { value: "call_back_later", label: "Call back later", displayLabel: "⏰ Call back", color: "#f59e0b" },
];

let autoRefreshIntervalId = null;
let resumeTimerId = null;
let inFlight = false;
let pausedUntil = 0;
let eventsCache = [];
let lastFetchAtMs = 0;
let agoTickerId = null;
let mutationEpoch = 0;
const mutatingIds = new Set();
let isInteracting = false;
let hideDemoRows = true;
const editingOutcomeIds = new Set();
let isMockMode = false;
let hasShownMockToast = false;

const HIDE_DEMO_ROWS_STORAGE_KEY = "hide_demo_rows";

function readHideDemoRowsFromStorage() {
  try {
    const raw = localStorage.getItem(HIDE_DEMO_ROWS_STORAGE_KEY);
    if (raw === null) return true; // default ON for demos
    if (raw === "true") return true;
    if (raw === "false") return false;
    if (raw === "1") return true;
    if (raw === "0") return false;
    return true;
  } catch {
    return true;
  }
}

function writeHideDemoRowsToStorage(val) {
  try {
    localStorage.setItem(HIDE_DEMO_ROWS_STORAGE_KEY, String(!!val));
  } catch {
    // ignore
  }
}

function applyDemoFilter(events) {
  const rows = Array.isArray(events) ? events : [];
  if (!hideDemoRows) return rows;
  return rows.filter((e) => e?.source !== "simulator");
}

function parseIsoMs(iso) {
  if (!iso) return null;
  const ms = Date.parse(String(iso));
  return Number.isFinite(ms) ? ms : null;
}

function computeResponseSeconds(ev) {
  if (typeof ev?.responseSeconds === "number" && Number.isFinite(ev.responseSeconds)) {
    return ev.responseSeconds;
  }
  const created = parseIsoMs(ev?.createdAt);
  const followed = parseIsoMs(ev?.followedUpAt);
  if (!Number.isFinite(created) || !Number.isFinite(followed)) return null;
  return Math.max(0, Math.floor((followed - created) / 1000));
}

function setLastFetch(date) {
  // Kept for compatibility (used to update lastFetchAtMs),
  // but we intentionally do not show a "Last fetch" timestamp in the UI.
  if (!date) {
    lastFetchAtMs = 0;
    return;
  }
  lastFetchAtMs = date.getTime();
}

function setUpdatedAgoText() {
  const el = $("#updatedAgo");
  if (!el) return;
  if (!lastFetchAtMs) {
    el.textContent = "—";
    return;
  }
  const s = Math.max(0, Math.floor((Date.now() - lastFetchAtMs) / 1000));
  if (s < 5) {
    el.textContent = "just now";
    return;
  }
  if (s < 60) {
    el.textContent = `${s}s ago`;
    return;
  }
  const m = Math.floor(s / 60);
  if (m < 60) {
    el.textContent = `${m} min ago`;
    return;
  }
  const h = Math.floor(m / 60);
  el.textContent = `${h} hr ago`;
}

function startAgoTicker() {
  if (agoTickerId) clearInterval(agoTickerId);
  agoTickerId = setInterval(setUpdatedAgoText, 1000);
  setUpdatedAgoText();
}

function stopAutoRefresh() {
  if (autoRefreshIntervalId) {
    clearInterval(autoRefreshIntervalId);
    autoRefreshIntervalId = null;
  }
}

function startAutoRefresh() {
  stopAutoRefresh();
  if (document.visibilityState !== "visible") return;

  autoRefreshIntervalId = setInterval(() => {
    // Avoid spamming if tab gets hidden without firing visibilitychange yet
    if (document.visibilityState !== "visible") return;
    // Respect temporary pause (e.g. during follow-up)
    if (Date.now() < pausedUntil) return;
    // Avoid overwriting UI while a mutation is being saved.
    if (mutatingIds.size > 0) return;
    // Avoid overwriting UI while user is interacting with controls
    if (isInteracting) return;
    loadCalls({ silent: true });
  }, 10_000);
}

function pauseAutoRefresh(ms) {
  const until = Date.now() + Number(ms || 0);
  pausedUntil = Math.max(pausedUntil, until);

  // Stop interval while paused to ensure no mid-action refresh; resume after delay if visible.
  stopAutoRefresh();
  if (resumeTimerId) clearTimeout(resumeTimerId);
  resumeTimerId = setTimeout(() => {
    resumeTimerId = null;
    if (document.visibilityState === "visible") startAutoRefresh();
  }, ms);
}

async function fetchCalls() {
  const key = getKey();
  let res;
  try {
    res = await fetch(withKey("/api/calls?limit=15"), {
      headers: { ...(key ? { "x-demo-key": key } : {}) },
    });
  } catch {
    isMockMode = true;
    return getMockCalls();
  }
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { message: text || "Unexpected response" };
  }

  if (!res.ok) throw new Error(json.message || "Failed to load calls");
  isMockMode = false;
  return json;
}

function getMockCalls() {
  const now = Date.now();
  const iso = (ms) => new Date(ms).toISOString();
  return [
    {
      id: "mock-1",
      createdAt: iso(now - 7 * 60 * 1000),
      callerNumber: "+14438761983",
      status: "missed",
      source: "landing_call_click",
      note: "First: cody • City/ZIP: 21040 • Issue: System won’t turn on • Timeframe: ASAP (next 2–4 hours)",
      outcome: null,
      outcomeAt: null,
      followedUp: false,
      followedUpAt: null,
      dialCallDurationSec: null,
      callDurationSec: null,
    },
    {
      id: "mock-2",
      createdAt: iso(now - 52 * 60 * 1000),
      callerNumber: "+14433567359",
      status: "answered",
      source: "twilio",
      note: "",
      outcome: "reached_no_booking",
      outcomeAt: iso(now - 45 * 60 * 1000),
      followedUp: true,
      followedUpAt: iso(now - 45 * 60 * 1000),
      dialCallDurationSec: 27,
      callDurationSec: 27,
    },
    {
      id: "mock-3",
      createdAt: iso(now - 3 * 60 * 60 * 1000),
      callerNumber: "+14435555555",
      status: "missed",
      source: "twilio",
      note: "",
      outcome: "booked",
      outcomeAt: iso(now - 2.7 * 60 * 60 * 1000),
      followedUp: true,
      followedUpAt: iso(now - 2.7 * 60 * 60 * 1000),
      dialCallDurationSec: 0,
      callDurationSec: 0,
    },
    {
      id: "mock-4",
      createdAt: iso(now - 6 * 60 * 60 * 1000),
      callerNumber: "+14436660000",
      status: "missed",
      source: "landing_form",
      note: "Name: Jamie • City/ZIP: 21701 • Issue: No heat • Timeframe: Today",
      outcome: null,
      outcomeAt: null,
      followedUp: false,
      followedUpAt: null,
      dialCallDurationSec: null,
      callDurationSec: null,
    },
  ];
}

async function followUp(id) {
  if (isMockMode) {
    return { id, followedUp: true, followedUpAt: new Date().toISOString() };
  }
  const key = getKey();
  const res = await fetch(withKey(`/api/calls/${encodeURIComponent(id)}/follow-up`), {
    method: "POST",
    headers: { ...(key ? { "x-demo-key": key } : {}) },
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { message: text || "Unexpected response" };
  }

  if (!res.ok) throw new Error(json.message || "Failed to follow up");
  return json;
}

async function setOutcome(id, outcome) {
  if (isMockMode) {
    return { id, outcome, outcomeAt: outcome ? new Date().toISOString() : null };
  }
  const key = getKey();
  const res = await fetch(withKey(`/api/calls/${encodeURIComponent(id)}/outcome`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(key ? { "x-demo-key": key } : {}),
    },
    body: JSON.stringify({ outcome }),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { message: text || "Unexpected response" };
  }
  if (!res.ok) throw new Error(json.message || "Failed to set outcome");
  return json;
}

async function deleteCall(id) {
  if (isMockMode) {
    return { ok: true };
  }
  const key = getKey();
  const res = await fetch(withKey(`/api/calls/${encodeURIComponent(id)}`), {
    method: "DELETE",
    headers: { ...(key ? { "x-demo-key": key } : {}) },
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { message: text || "Unexpected response" };
  }
  if (!res.ok) throw new Error(json.message || "Failed to delete");
  return json;
}

async function clearAll() {
  if (isMockMode) {
    return { ok: true };
  }
  const key = getKey();
  const res = await fetch(withKey("/api/calls/clear"), {
    method: "POST",
    headers: { ...(key ? { "x-demo-key": key } : {}) },
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { message: text || "Unexpected response" };
  }
  if (!res.ok) throw new Error(json.message || "Failed to clear");
  return json;
}

function setSummary(events) {
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = String(val);
  };

  // "Unhandled" means we still need to take action.
  // - For calls: missed and not followed up
  // - For forms: treated as unhandled until followed up (status is stored as 'missed' for simplicity)
  const missed = events.filter((e) => e.status === "missed" && !e.followedUp).length;
  const followedUp = events.filter((e) => !!e.followedUp).length;
  const within5 = events.filter((e) => {
    if (!e.followedUp) return false;
    const rs = computeResponseSeconds(e);
    return Number.isFinite(rs) && rs <= 300;
  }).length;
  const booked = events.filter((e) => e.outcome === "booked").length;
  const lost = events.filter((e) => {
    if (e.outcome === "already_hired" || e.outcome === "wrong_number") return true;
    if (e.outcome === "no_answer" && e.followedUp) return true;
    return false;
  }).length;

  set("sumMissed", missed);
  set("sumFollowedUp", followedUp);
  set("sumWithin5", within5);
  set("sumBooked", booked);
  set("sumLost", lost);
}

function renderRows(events) {
  const tbody = $("#rows");
  if (!tbody) return;

  if (!Array.isArray(events) || events.length === 0) {
    const hasAny = Array.isArray(eventsCache) && eventsCache.length > 0;
    const hiddenOnlyDemo =
      hasAny && hideDemoRows && eventsCache.every((e) => e?.source === "simulator");
    const msg = hiddenOnlyDemo
      ? `No rows match the current filter. Uncheck “Hide Demo rows” to view demo data.`
      : `No events yet.`;
    tbody.innerHTML = `<tr><td colspan="7" class="muted">${escapeHtml(msg)}</td></tr>`;
    return;
  }

  tbody.innerHTML = events
    .map((ev) => {
      const isMissed = ev.status === "missed";
      // Follow-up is now driven by selecting a Result (Outcome).
      // We still compute responseSeconds from followedUpAt in the backend for metrics.

      const sourceInfo = formatSource(ev.source);

      const callLenSec =
        typeof ev?.dialCallDurationSec === "number"
          ? ev.dialCallDurationSec
          : typeof ev?.callDurationSec === "number"
            ? ev.callDurationSec
            : null;
      const callLenText = typeof callLenSec === "number" ? formatDuration(callLenSec) : "—";

      // Display status:
      // - Twilio calls: show answered/missed
      // - Form submits: show New lead / Followed up (instead of implying a missed phone call)
      const isFormLead = ev.source === "landing_form";
      const statusClass = isFormLead ? (ev.followedUp ? "answered" : "missed") : ev.status;
      const statusLabel = isFormLead ? (ev.followedUp ? "followed up" : "new lead") : ev.status;

      // Show captured details for form leads (stored in note)
      const detailsHtml =
        isFormLead && ev.note
          ? `<div class="caller-cell__details muted">${escapeHtml(ev.note)}</div>`
          : "";

      const currentOutcome = ev.outcome ? String(ev.outcome) : "";
      const outcomeOption = OUTCOME_OPTIONS.find((o) => o.value === currentOutcome) || OUTCOME_OPTIONS[0];
      
      const outcomeOptionsHtml = OUTCOME_OPTIONS.map((o) => {
        const selected = o.value === currentOutcome ? "selected" : "";
        return `<option value="${escapeHtml(o.value)}" ${selected}>${escapeHtml(o.displayLabel)}</option>`;
      }).join("");

      // Always show dropdown, but style the select based on current value
      let selectClass = "outcome-select js-outcome";
      if (currentOutcome === "booked") selectClass += " outcome-select--success";
      else if (currentOutcome === "already_hired" || currentOutcome === "wrong_number") selectClass += " outcome-select--danger";
      else if (currentOutcome === "call_back_later" || currentOutcome === "reached_no_booking") selectClass += " outcome-select--warning";
      else if (currentOutcome === "no_answer") selectClass += " outcome-select--muted";

      const resultDisplay = `
        <select class="${selectClass}" aria-label="Set Result">
          ${outcomeOptionsHtml}
        </select>
      `;

      // No colored bars — keep the table clean and scannable for owners
      const rowClass = "";

      return `
        <tr data-id="${escapeHtml(ev.id)}" class="${rowClass}">
          <td title="${escapeHtml(formatTimeFull(ev.createdAt))}">${escapeHtml(formatTime(ev.createdAt))}</td>
          <td class="caller-cell">
            <a class="caller-cell__num caller-link" href="tel:${escapeHtml(String(ev.callerNumber || '').replaceAll(' ', ''))}">${escapeHtml(ev.callerNumber)}</a>
            ${detailsHtml}
          </td>
          <td><span class="status-badge status-badge--${escapeHtml(statusClass)}">${escapeHtml(statusLabel)}</span></td>
          <td style="font-family:ui-monospace,monospace; font-size:12px; white-space:nowrap;">${escapeHtml(callLenText)}</td>
          <td>
            <span style="display:inline-flex; align-items:center; gap:4px; font-size:12px; font-weight:700; color:${sourceInfo.color}; white-space:nowrap;">
              ${sourceInfo.label}
            </span>
          </td>
          <td style="overflow:visible;">
            ${resultDisplay}
          </td>
          <td style="text-align:right; overflow:visible;">
            <div style="display:inline-flex; gap:8px; justify-content:flex-end; align-items:center;">
              <button class="icon-btn icon-btn--danger js-delete" type="button" title="Delete" aria-label="Delete">
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M9 3h6l1 2h5v2H3V5h5l1-2z" fill="currentColor"/>
                  <path d="M6 9h12l-1 12H7L6 9z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                  <path d="M10 12v6M14 12v6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

function upsertEvent(ev) {
  const id = String(ev.id);
  const idx = eventsCache.findIndex((x) => String(x.id) === id);
  if (idx >= 0) eventsCache[idx] = { ...eventsCache[idx], ...ev };
  else eventsCache.unshift(ev);
}

function removeEvent(id) {
  const sid = String(id);
  eventsCache = eventsCache.filter((e) => String(e.id) !== sid);
}

function getEventById(id) {
  const sid = String(id);
  return eventsCache.find((e) => String(e.id) === sid) || null;
}

async function loadCalls({ silent, force } = {}) {
  if (inFlight && !force) return;
  inFlight = true;
  const btn = $("#refreshBtn");
  if (btn && !silent) btn.disabled = true;
  const epochAtStart = mutationEpoch;
  try {
    const calls = await fetchCalls();

    // If a mutation started during this fetch, don't overwrite UI with stale data.
    if (!force && epochAtStart !== mutationEpoch) return;

    const fresh = Array.isArray(calls) ? calls : [];
    if (mutatingIds.size > 0 && !force) {
      // Keep local in-flight edits for those rows to prevent dropdown snap-back.
      const localById = new Map(eventsCache.map((e) => [String(e.id), e]));
      const merged = fresh.map((row) => {
        const id = String(row.id);
        if (mutatingIds.has(id)) return localById.get(id) || row;
        return row;
      });
      eventsCache = merged;
    } else {
      eventsCache = fresh;
    }
    const filtered = applyDemoFilter(eventsCache);
    renderRows(filtered);
    setSummary(filtered);
    setLastFetch(new Date());
    setUpdatedAgoText();
    if (isMockMode && !hasShownMockToast) {
      hasShownMockToast = true;
      showToast("Showing demo data (API not running)", "ok");
    }
  } catch (e) {
    if (!silent) showToast(e.message || "Refresh failed", "bad");
  } finally {
    if (btn && !silent) btn.disabled = false;
    inFlight = false;
  }
}

async function main() {
  console.log("🔧 Dashboard JS loaded");
  console.log("🔧 #rows element:", $("#rows"));
  
  // Keep simulator link keyed
  // Simulator link removed from UI (demo-only tooling).

  const hideToggle = $("#hideDemoRows");
  hideDemoRows = readHideDemoRowsFromStorage();
  if (hideToggle) {
    hideToggle.checked = !!hideDemoRows;
    hideToggle.addEventListener("change", () => {
      hideDemoRows = !!hideToggle.checked;
      writeHideDemoRowsToStorage(hideDemoRows);
      const filtered = applyDemoFilter(eventsCache);
      renderRows(filtered);
      setSummary(filtered);
    });
  }

  $("#refreshBtn")?.addEventListener("click", () => loadCalls({ silent: false }));
  $("#clearAllBtn")?.addEventListener("click", async () => {
    if (!confirm("Clear all call events? (demo cleanup)")) return;
    pauseAutoRefresh(3000);
    try {
      await clearAll();
      eventsCache = [];
      renderRows(eventsCache);
      setSummary(eventsCache);
      showToast("Cleared", "ok");
      setLastFetch(new Date());
    } catch (e) {
      showToast(e.message || "Failed to clear", "bad");
    }
  });

  $("#rows")?.addEventListener("click", async (e) => {
    const editOutcomeBtn = e.target.closest(".js-edit-outcome");
    if (editOutcomeBtn) {
      const tr = editOutcomeBtn.closest("tr");
      const id = tr?.dataset?.id;
      if (!id) return;
      if (editingOutcomeIds.has(String(id))) editingOutcomeIds.delete(String(id));
      else editingOutcomeIds.add(String(id));
      renderRows(applyDemoFilter(eventsCache));
      return;
    }

    const cancelOutcomeBtn = e.target.closest(".js-cancel-outcome");
    if (cancelOutcomeBtn) {
      const tr = cancelOutcomeBtn.closest("tr");
      const id = tr?.dataset?.id;
      if (!id) return;
      editingOutcomeIds.delete(String(id));
      renderRows(applyDemoFilter(eventsCache));
      return;
    }

    const deleteBtn = e.target.closest(".js-delete");
    if (deleteBtn) {
      const tr = deleteBtn.closest("tr");
      const id = tr?.dataset?.id;
      if (!id) return;

      console.log("Delete clicked:", { id });

      if (!confirm("Delete this call event?")) return;

      pauseAutoRefresh(3000);
      mutationEpoch += 1;
      mutatingIds.add(String(id));
      deleteBtn.disabled = true;
      try {
        removeEvent(id);
        {
          const filtered = applyDemoFilter(eventsCache);
          renderRows(filtered);
          setSummary(filtered);
        }

        await deleteCall(id);
        mutatingIds.delete(String(id));
        showToast("Deleted", "ok");
        setLastFetch(new Date());
      } catch (err) {
        mutatingIds.delete(String(id));
        console.error("Delete failed", err);
        showToast(err.message || "Failed to delete", "bad");
        await loadCalls({ silent: true, force: true });
      } finally {
        deleteBtn.disabled = false;
      }
    }
  });

  $("#rows")?.addEventListener("change", async (e) => {
    if (!e.target.matches || !e.target.matches(".js-outcome")) {
      return;
    }
    
    const sel = e.target;
    const tr = sel.closest("tr");
    const id = tr?.dataset?.id;
    if (!id) return;

    const raw = sel.value;
    const outcome = raw ? raw : null;
    const prev = getEventById(id)?.outcome ?? null;

    pauseAutoRefresh(3000);
    mutationEpoch += 1;
    mutatingIds.add(String(id));
    sel.disabled = true;
    try {
      // Optimistic update
      upsertEvent({
        id,
        outcome,
        outcomeAt: outcome ? new Date().toISOString() : null,
      });
      setSummary(applyDemoFilter(eventsCache));

      const updated = await setOutcome(id, outcome);
      upsertEvent(updated);

      // Make this useful for real ops: setting an outcome implies you followed up.
      // Auto-mark "Followed up" when user sets a non-null outcome.
      const afterOutcome = getEventById(id);
      if (outcome && afterOutcome && !afterOutcome.followedUp) {
        const fu = await followUp(id);
        upsertEvent(fu);
      }

      mutatingIds.delete(String(id));
      editingOutcomeIds.delete(String(id));
      {
        const filtered = applyDemoFilter(eventsCache);
        renderRows(filtered);
        setSummary(filtered);
      }
      showToast(
        outcome ? "Outcome saved (marked followed up)" : "Outcome cleared",
        "ok"
      );
    } catch (err) {
      mutatingIds.delete(String(id));
      console.error("Outcome save failed", err);
      showToast(err.message || "Failed to update", "bad");
      // Revert to previous value immediately (and keep selection stable)
      upsertEvent({
        id,
        outcome: prev,
        outcomeAt: null,
      });
      {
        const filtered = applyDemoFilter(eventsCache);
        renderRows(filtered);
        setSummary(filtered);
      }
    } finally {
      sel.disabled = false;
    }
  });

  // Interaction detection: pause auto-refresh while user is focused on controls
  const tbody = $("#rows");
  if (tbody) {
    tbody.addEventListener("focusin", (e) => {
      if (e.target.matches && e.target.matches(".js-outcome")) {
        isInteracting = true;
      }
    });
    tbody.addEventListener("focusout", (e) => {
      if (e.target.matches && e.target.matches(".js-outcome")) {
        // Use short timeout to allow click handlers to complete
        setTimeout(() => {
          isInteracting = false;
        }, 100);
      }
    });
  }

  setLastFetch(null);
  startAgoTicker();
  // First load should not be silent so auth/key issues are visible immediately.
  await loadCalls({ silent: false });

  // Auto-refresh every ~10s, but pause when tab is hidden.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      startAutoRefresh();
    } else {
      stopAutoRefresh();
    }
  });

  startAutoRefresh();
}

document.addEventListener("DOMContentLoaded", main);


