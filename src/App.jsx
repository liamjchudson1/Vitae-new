import React, { useMemo, useState } from "react";

/**
 * Vitae — Luxury MVP Concierge (single-file React)
 *
 * What this includes:
 * - Member View: luxury-styled request flow (cards, quiet copy)
 * - Concierge Dashboard: triage, assign provider, arrange transport/restock, status timeline
 * - Discreet preference ledger on completed services (Preferred / Not a Fit)
 *
 * Notes: In-memory only. Tailwind classes assumed by the runtime.
 */

const SERVICE_CATEGORIES = [
  { id: "iv", label: "IV Therapy" },
  { id: "trainer", label: "Personal Trainer" },
  { id: "chef", label: "Private Chef" },
  { id: "yoga", label: "Yoga/Pilates" },
  { id: "physio", label: "Physiotherapist" },
  { id: "other", label: "Other" },
];

const CITIES = ["London", "New York", "Dubai", "Monaco", "Singapore", "Tokyo"];

// Minimal vetted providers catalogue
const PROVIDERS = [
  { id: "p1", name: "Nurse A. Lin", city: "New York", services: ["iv"], rating: 4.9, price: 550 },
  { id: "p2", name: "Nurse J. Alvarez", city: "New York", services: ["iv"], rating: 4.8, price: 525 },
  { id: "p3", name: "Coach R. Vance", city: "London", services: ["trainer"], rating: 4.9, price: 300 },
  { id: "p4", name: "Chef M. Valmont", city: "Monaco", services: ["chef"], rating: 5.0, price: 1200 },
  { id: "p5", name: "Yogi S. Kapoor", city: "Dubai", services: ["yoga"], rating: 4.7, price: 280 },
  { id: "p6", name: "Physio T. Okada", city: "Tokyo", services: ["physio"], rating: 4.9, price: 450 },
  { id: "p7", name: "Chef A. Beaumont", city: "London", services: ["chef"], rating: 4.8, price: 800 },
  { id: "p8", name: "Nurse C. Rossi", city: "Monaco", services: ["iv"], rating: 4.9, price: 600 },
];

let REQUEST_SEQ = 1;

function classNames(...arr) {
  return arr.filter(Boolean).join(" ");
}

function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#C1A14F]/40 bg-white/5 px-3 py-1 text-xs font-medium text-[#EDEADE]">
      {children}
    </span>
  );
}
const ServiceCard = ({ id, label }) => (
  <button
    onClick={() => setService(id)}
    className={classNames(
      "rounded-2xl border border-[#C1A14F]/30 bg-white/5 px-4 py-3 text-left transition-all",
      service === id
        ? "ring-2 ring-[#C1A14F]"
        : "hover:border-[#C1A14F] hover:shadow-[0_0_10px_rgba(193,161,79,0.6)]"
    )}
  >
    <div className="text-sm font-semibold text-[#EDEADE]">{label}</div>
    <div className="text-xs text-[#C1A14F]/70">Tap to select</div>
  </button>
);

function Section({ title, children, actions }) {
  return (
    <div className="rounded-2xl border border-[#C1A14F]/30 bg-gradient-to-br from-[#1A223D] to-[#0A1429] 
                    shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_15px_rgba(193,161,79,0.25)] p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-serif font-semibold tracking-wide text-[#EDEADE]">{title}</h2>
        <div className="flex items-center gap-2">{actions}</div>
      </div>
      {children}
    </div>
  );
}

export default function App() {
  // Global in-memory state
  const [requests, setRequests] = useState([]); // all service requests
  const [memberPrefs, setMemberPrefs] = useState({
    name: "Mr. Hudson",
    city: "London",
    diet: "Gluten-free, high-protein",
    supplements: ["Electrolytes", "Collagen", "Magnesium"],
    avoidProviders: new Set(),
    preferredProviders: new Set(),
  });

  const [activeTab, setActiveTab] = useState("member"); // member | concierge

  function createRequest(payload) {
    const req = {
      id: `R-${REQUEST_SEQ++}`,
      status: "new", // new → triaging → confirmed → enroute → in_service → complete
      createdAt: new Date().toISOString(),
      ...payload,
      transportBooked: false,
      roomRestock: false,
      assignedProviderId: null,
      timeline: [
        { t: Date.now(), text: `Instruction received — ${payload.serviceLabel}` },
      ],
    };
    setRequests((prev) => [req, ...prev]);
  }

  function logUpdate(id, updater) {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = typeof updater === "function" ? updater(r) : { ...r, ...updater };
        return {
          ...updated,
          timeline: [
            ...(updated.timeline || r.timeline),
            updater.__log ? { t: Date.now(), text: updater.__log } : null,
          ].filter(Boolean),
        };
      })
    );
  }

  return (
  <div className="min-h-screen bg-[#0A1429] bg-gradient-to-b from-[#0A1429] via-[#141B34] to-[#0A1429] relative">
  <div className="absolute inset-0 bg-[url('/noise-texture.png')] opacity-10"></div>
  <div className="relative z-10 p-4 md:p-8 text-[#EDEADE]">
    {/* existing header + content */}
  </div>
</div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("member")}
            className={classNames(
              "rounded-full px-4 py-2 text-sm border border-[#C1A14F]/40",
              activeTab === "member" ? "bg-[#C1A14F] text-black" : "bg-transparent text-[#EDEADE]"
            )}
          >
            Member View
          </button>
          <button
            onClick={() => setActiveTab("concierge")}
            className={classNames(
              "rounded-full px-4 py-2 text-sm border border-[#C1A14F]/40",
              activeTab === "concierge" ? "bg-[#C1A14F] text-black" : "bg-transparent text-[#EDEADE]"
            )}
          >
            Concierge Dashboard
          </button>
        </div>
      </header>

      {activeTab === "member" ? (
        <MemberView
          memberPrefs={memberPrefs}
          setMemberPrefs={setMemberPrefs}
          requests={requests}
          createRequest={createRequest}
        />
      ) : (
        <ConciergeView
          requests={requests}
          setRequests={setRequests}
          logUpdate={logUpdate}
          memberPrefs={memberPrefs}
        />
      )}

      <footer className="mt-10 text-center text-xs text-[#C1A14F]/70">
        Discreet prototype — for demonstration only.
      </footer>
    </div>
  );
}

function MemberView({ memberPrefs, setMemberPrefs, requests, createRequest }) {
  const [service, setService] = useState("iv");
  const [city, setCity] = useState("New York");
  const [time, setTime] = useState("Tonight, 8:00 PM");
  const [notes, setNotes] = useState("Suite at The Peninsula. Quiet practitioner preferred.");

  const current = requests.filter((r) => r.status !== "complete");

  const ServiceCard = ({ id, label }) => (
    <button
      onClick={() => setService(id)}
      className={classNames(
        "rounded-2xl border border-[#C1A14F]/30 bg-white/5 px-4 py-3 text-left",
        service === id ? "ring-2 ring-[#C1A14F]" : "hover:bg-white/10"
      )}
    >
      <div className="text-sm font-semibold text-[#EDEADE]">{label}</div>
      <div className="text-xs text-[#C1A14F]/70">Tap to select</div>
    </button>
  );

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <Section title="Member Ledger">
        <div className="space-y-3 text-sm">
          <div>
            <div className="text-[#C1A14F]/70">Name</div>
            <div className="font-medium">{memberPrefs.name}</div>
          </div>
          <div>
            <div className="text-[#C1A14F]/70">Diet</div>
            <div className="font-medium">{memberPrefs.diet}</div>
          </div>
          <div>
            <div className="text-[#C1A14F]/70">Supplements</div>
            <div className="flex flex-wrap gap-2 pt-1">
              {memberPrefs.supplements.map((s) => (
                <Pill key={s}>{s}</Pill>
              ))}
            </div>
          </div>
          <div className="pt-2 text-xs text-[#C1A14F]/60">
            Preferences are noted discreetly. No ratings.
          </div>
        </div>
      </Section>

      <Section title="Issue an Instruction">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {SERVICE_CATEGORIES.slice(0, 4).map((s) => (
              <ServiceCard key={s.id} id={s.id} label={s.label} />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-[#C1A14F]/70">City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-xl border border-[#C1A14F]/30 bg-white/5 px-3 py-2 text-sm"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#C1A14F]/70">Time</label>
              <input
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-xl border border-[#C1A14F]/30 bg-white/5 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-[#C1A14F]/70">Notes for your concierge</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-[#C1A14F]/30 bg-white/5 px-3 py-2 text-sm"
              rows={3}
            />
          </div>
          <button
            onClick={() =>
              createRequest({
                memberName: memberPrefs.name,
                service,
                serviceLabel: SERVICE_CATEGORIES.find((s) => s.id === service)?.label,
                city,
                time,
                notes,
              })
            }
            className="w-full rounded-xl bg-[#C1A14F] px-4 py-3 text-sm font-semibold text-black tracking-wide"
          >
            Send to Concierge
          </button>
          <div className="text-xs text-[#C1A14F]/70">
            Your concierge has been notified. Arrangements are underway.
          </div>
        </div>
      </Section>

      <Section title="In Motion">
        <div className="space-y-3">
          {current.length === 0 && (
            <div className="rounded-xl border border-[#C1A14F]/30 bg-white/5 p-4 text-sm text-[#C1A14F]/70">
              No active instructions.
            </div>
          )}
          {current.map((r) => (
            <div key={r.id} className="rounded-xl border border-[#C1A14F]/30 bg-white/5 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-semibold">{r.serviceLabel}</div>
                  <div className="text-xs text-[#C1A14F]/70">
                    {r.city} · {r.time} · #{r.id}
                  </div>
                </div>
                <Pill>{r.status.toUpperCase()}</Pill>
              </div>
              <ul className="mt-3 space-y-1 text-xs text-[#EDEADE]">
                {r.timeline.map((ev, idx) => (
                  <li key={idx}>• {ev.text}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <div className="md:col-span-3">
        <Section title="Ledger">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {requests
              .filter((r) => r.status === "complete")
              .map((r) => (
                <CompletedCard key={r.id} r={r} memberPrefs={memberPrefs} setMemberPrefs={setMemberPrefs} />
              ))}
            {requests.filter((r) => r.status === "complete").length === 0 && (
              <div className="rounded-xl border border-[#C1A14F]/30 bg-white/5 p-4 text-sm text-[#C1A14F]/70">No completed services yet.</div>
            )}
          </div>
        </Section>
      </div>
    </div>
  );
}

function CompletedCard({ r, memberPrefs, setMemberPrefs }) {
  const provider = PROVIDERS.find((p) => p.id === r.assignedProviderId);
  const isPreferred = provider && memberPrefs.preferredProviders.has(provider.id);
  const isAvoid = provider && memberPrefs.avoidProviders.has(provider.id);

  function markPreferred(val) {
    setMemberPrefs((prev) => {
      const nextPref = new Set(prev.preferredProviders);
      const nextAvoid = new Set(prev.avoidProviders);
      if (!provider) return prev;
      if (val) {
        nextPref.add(provider.id);
        nextAvoid.delete(provider.id);
      } else {
        nextPref.delete(provider.id);
      }
      return { ...prev, preferredProviders: nextPref, avoidProviders: nextAvoid };
    });
  }

  function markAvoid(val) {
    setMemberPrefs((prev) => {
      const nextPref = new Set(prev.preferredProviders);
      const nextAvoid = new Set(prev.avoidProviders);
      if (!provider) return prev;
      if (val) {
        nextAvoid.add(provider.id);
        nextPref.delete(provider.id);
      } else {
        nextAvoid.delete(provider.id);
      }
      return { ...prev, preferredProviders: nextPref, avoidProviders: nextAvoid };
    });
  }

  return (
    <div className="rounded-xl border border-[#C1A14F]/30 bg-white/5 p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-semibold">{r.serviceLabel}</div>
          <div className="text-xs text-[#C1A14F]/70">
            {r.city} · {r.time} · #{r.id}
          </div>
        </div>
        <Pill>COMPLETE</Pill>
      </div>
      <div className="mt-3 text-sm">
        <div className="text-[#C1A14F]/70">Provider</div>
        <div className="font-medium">{provider ? provider.name : "—"}</div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-sm">
        <button
          onClick={() => markPreferred(!isPreferred)}
          className={classNames(
            "rounded-full border border-[#C1A14F]/40 px-3 py-1",
            isPreferred ? "bg-[#C1A14F] text-black" : "bg-transparent text-[#EDEADE]"
          )}
        >
          {isPreferred ? "Preferred" : "Add to Preferred"}
        </button>
        <button
          onClick={() => markAvoid(!isAvoid)}
          className={classNames(
            "rounded-full border border-[#C1A14F]/40 px-3 py-1",
            isAvoid ? "bg-[#C1A14F] text-black" : "bg-transparent text-[#EDEADE]"
          )}
        >
          {isAvoid ? "Not a Fit" : "Mark Not a Fit"}
        </button>
      </div>
      <div className="mt-2 text-xs text-[#C1A14F]/70">
        Discreet preference ledger — no ratings or public reviews.
      </div>
    </div>
  );
}

function ConciergeView({ requests, setRequests, logUpdate, memberPrefs }) {
  const [selectedId, setSelectedId] = useState(null);
  const selected = requests.find((r) => r.id === selectedId) || null;

  function triage(req) {
    const shortlist = PROVIDERS.filter(
      (p) => p.city === req.city && p.services.includes(req.service)
    ).filter((p) => !memberPrefs.avoidProviders.has(p.id));

    // Prioritize preferred providers if available
    shortlist.sort((a, b) => {
      const aPref = memberPrefs.preferredProviders.has(a.id) ? 1 : 0;
      const bPref = memberPrefs.preferredProviders.has(b.id) ? 1 : 0;
      if (aPref !== bPref) return bPref - aPref;
      return b.rating - a.rating;
    });

    return shortlist.slice(0, 3);
  }

  function setStatus(id, status, note) {
    logUpdate(id, Object.assign({ status }, { __log: note }));
  }

  function assignProvider(id, pid) {
    logUpdate(
      id,
      Object.assign(
        (r) => ({ ...r, assignedProviderId: pid, status: "confirmed" }),
        { __log: `Provider assigned: ${PROVIDERS.find((p) => p.id === pid)?.name}` }
      )
    );
  }

  function toggleTransport(id) {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              transportBooked: !r.transportBooked,
              timeline: [
                ...r.timeline,
                { t: Date.now(), text: !r.transportBooked ? "Black car arranged" : "Transport updated" },
              ],
            }
          : r
      )
    );
  }

  function toggleRestock(id) {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              roomRestock: !r.roomRestock,
              timeline: [
                ...r.timeline,
                { t: Date.now(), text: !r.roomRestock ? "Room restock ordered (supplements)" : "Room restock updated" },
              ],
            }
          : r
      )
    );
  }

  function markComplete(id) {
    setStatus(id, "complete", "Service completed — preference ready to record");
  }

  const queue = requests.filter((r) => r.status === "new");
  const active = requests.filter((r) => ["triaging", "confirmed", "enroute", "in_service"].includes(r.status));

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Section title="Queue (New Instructions)">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {queue.length === 0 && (
              <div className="rounded-xl border border-[#C1A14F]/30 bg-white/5 p-4 text-sm text-[#C1A14F]/70">No new instructions.</div>
            )}
            {queue.map((r) => (
              <RequestCard key={r.id} r={r} onSelect={() => setSelectedId(r.id)} />
            ))}
          </div>
        </Section>

        <Section title="Active">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {active.length === 0 && (
              <div className="rounded-xl border border-[#C1A14F]/30 bg-white/5 p-4 text-sm text-[#C1A14F]/70">No active items.</div>
            )}
            {active.map((r) => (
              <RequestCard key={r.id} r={r} onSelect={() => setSelectedId(r.id)} />)
            )}
          </div>
        </Section>
      </div>

      <div className="space-y-6">
        <Section title="Triage & Actions" actions={selected && <Pill>#{selected.id}</Pill>}>
          {!selected && (
            <div className="rounded-xl border border-[#C1A14F]/30 bg-white/5 p-4 text-sm text-[#C1A14F]/70">Select an item to manage.</div>
          )}
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="rounded-2xl border border-[#C1A14F]/30 bg-white/5 p-3">
                <div className="font-semibold text-[#EDEADE]">{selected.serviceLabel}</div>
                <div className="text-xs text-[#C1A14F]/70">
                  {selected.city} · {selected.time}
                </div>
                <div className="mt-2 text-[#EDEADE]">{selected.notes}</div>
              </div>

              <div className="rounded-2xl border border-[#C1A14F]/30 bg-white/5 p-3">
                <div className="mb-2 text-xs font-semibold text-[#C1A14F]">Suggested Providers</div>
                <div className="space-y-2">
                  {triage(selected).map((p) => (
                    <div key={p.id} className="flex items-center justify-between rounded-lg border border-[#C1A14F]/30 bg-white/5 p-2">
                      <div>
                        <div className="font-medium text-[#EDEADE]">{p.name}</div>
                        <div className="text-xs text-[#C1A14F]/70">
                          {p.city} · Rated {p.rating} · ${p.price}
                        </div>
                      </div>
                      <button
                        onClick={() => assignProvider(selected.id, p.id)}
                        className="rounded-full bg-[#C1A14F] px-3 py-1 text-xs font-semibold text-black"
                      >
                        Assign
                      </button>
                    </div>
                  ))}
                  {triage(selected).length === 0 && (
                    <div className="rounded-lg border border-[#C1A14F]/30 bg-white/5 p-2 text-xs text-[#C1A14F]/70">No vetted matches in this city yet.</div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setStatus(selected.id, "triaging", "Concierge reviewing options");
                    toggleTransport(selected.id);
                  }}
                  className="rounded-xl border border-[#C1A14F]/30 bg-white/5 px-3 py-2 text-[#EDEADE]"
                >
                  {selected.transportBooked ? "Update Transport" : "Arrange Transport"}
                </button>
                <button onClick={() => toggleRestock(selected.id)} className="rounded-xl border border-[#C1A14F]/30 bg-white/5 px-3 py-2 text-[#EDEADE]">
                  {selected.roomRestock ? "Update Restock" : "Room Restock"}
                </button>
                <button
                  onClick={() => setStatus(selected.id, "enroute", "Provider en route")}
                  className="rounded-xl border border-[#C1A14F]/30 bg-white/5 px-3 py-2 text-[#EDEADE]"
                >
                  Mark En Route
                </button>
                <button
                  onClick={() => setStatus(selected.id, "in_service", "Service in progress")}
                  className="rounded-xl border border-[#C1A14F]/30 bg-white/5 px-3 py-2 text-[#EDEADE]"
                >
                  Mark In Service
                </button>
                <button onClick={() => markComplete(selected.id)} className="rounded-xl border border-[#C1A14F]/30 bg-white/5 px-3 py-2 text-[#EDEADE]">
                  Mark Complete
                </button>
              </div>

              <div className="rounded-2xl border border-[#C1A14F]/30 bg-white/5 p-3">
                <div className="mb-1 text-xs font-semibold text-[#C1A14F]">Timeline</div>
                <ul className="space-y-1 text-xs text-[#EDEADE]">
                  {selected.timeline.map((ev, idx) => (
                    <li key={idx}>• {ev.text}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}

function RequestCard({ r, onSelect }) {
  return (
    <button onClick={onSelect} className="w-full rounded-xl border border-[#C1A14F]/30 bg-white/5 p-4 text-left hover:bg-white/10">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-semibold text-[#EDEADE]">{r.serviceLabel}</div>
          <div className="text-xs text-[#C1A14F]/70">
            {r.city} · {r.time} · #{r.id}
          </div>
        </div>
        <Pill>{r.status.toUpperCase()}</Pill>
      </div>
      <ul className="mt-2 space-y-1 text-xs text-[#EDEADE]">
        {r.timeline.map((ev, idx) => (
          <li key={idx}>• {ev.text}</li>
        ))}
      </ul>
    </button>
  );
}
