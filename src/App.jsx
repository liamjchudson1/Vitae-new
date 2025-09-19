import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";

// -------------------------------------------------------
// CONFIG
// -------------------------------------------------------
const SERVICE_CATEGORIES = [
  { id: "iv", label: "IV Therapy" },
  { id: "trainer", label: "Personal Trainer" },
  { id: "chef", label: "Private Chef" },
  { id: "yoga", label: "Yoga/Pilates" },
  { id: "physio", label: "Physiotherapist" },
  { id: "other", label: "Other" },
];

const CITIES = ["London", "New York", "Dubai", "Monaco", "Singapore", "Tokyo"];

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

// -------------------------------------------------------
// HELPERS
// -------------------------------------------------------
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

function Section({ title, children, actions }) {
  return (
    <div className="rounded-2xl border border-[#C1A14F]/30 bg-gradient-to-br from-[#1A223D] to-[#0A1429] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_15px_rgba(193,161,79,0.25)] p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-serif font-semibold tracking-wide text-[#EDEADE]">{title}</h2>
        <div className="flex items-center gap-2">{actions}</div>
      </div>
      {children}
    </div>
  );
}

// -------------------------------------------------------
// SPLASH SCREEN
// -------------------------------------------------------
function Splash() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#0A1429] z-50">
      <h1 className="font-serif text-4xl tracking-[0.3em] text-[#C1A14F] animate-pulse">VITAE</h1>
    </div>
  );
}

// -------------------------------------------------------
// MAIN APP
// -------------------------------------------------------
export default function App() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [memberPrefs, setMemberPrefs] = useState({
    name: "Mr. Hudson",
    city: "London",
    diet: "Gluten-free, high-protein",
    supplements: ["Electrolytes", "Collagen", "Magnesium"],
    avoidProviders: new Set(),
    preferredProviders: new Set(),
  });
  const [activeTab, setActiveTab] = useState("member");

  useEffect(() => {
    setTimeout(() => setLoading(false), 1500);
  }, []);

  function createRequest(payload) {
    const req = {
      id: `R-${REQUEST_SEQ++}`,
      status: "new",
      createdAt: new Date().toISOString(),
      ...payload,
      transportBooked: false,
      roomRestock: false,
      assignedProviderId: null,
      timeline: [{ t: Date.now(), text: `Instruction received — ${payload.serviceLabel}` }],
    };
    setRequests((prev) => [req, ...prev]);
  }

  if (loading) return <Splash />;

  return (
    <div className="min-h-screen bg-[#0A1429] bg-gradient-to-b from-[#0A1429] via-[#141B34] to-[#0A1429] relative">
      <div className="absolute inset-0 bg-[url('/noise-texture.png')] opacity-10"></div>
      <div className="relative z-10 p-4 md:p-8 text-[#EDEADE]">
        {/* Header */}
        <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-widest text-[#C1A14F]">V I T A E</h1>
            <p className="text-sm text-[#C1A14F]/80">Global wellness without compromise</p>
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
          <MemberView memberPrefs={memberPrefs} setMemberPrefs={setMemberPrefs} requests={requests} createRequest={createRequest} />
        ) : (
          <ConciergeView requests={requests} setRequests={setRequests} memberPrefs={memberPrefs} />
        )}

        <footer className="mt-10 text-center text-xs text-[#C1A14F]/70">
          Discreet prototype — for demonstration only.
        </footer>
      </div>
    </div>
  );
}

// -------------------------------------------------------
// MEMBER VIEW
// -------------------------------------------------------
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
      "rounded-2xl",
      "border border-[#C1A14F]/30",
      "bg-gradient-to-br from-[#141B34] to-[#0A1429]",
      "px-4 py-3",
      "text-left",
      "transition-all duration-300",
      service === id
        ? "ring-2 ring-[#C1A14F]"
        : "hover:border-[#C1A14F] hover:shadow-[0_0_20px_rgba(193,161,79,0.45)] hover:scale-[1.02]"
    )}
  >
    <div className="text-sm font-semibold text-[#EDEADE]">{label}</div>
    <div className="text-xs text-[#C1A14F]/70">Tap to select</div>
  </button>
);

      )}
    >
      <div className="text-sm font-semibold text-[#EDEADE]">{label}</div>
      <div className="text-xs text-[#C1A14F]/70">Tap to select</div>
    </button>
  );

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {/* Ledger */}
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
          <div className="pt-2 text-xs text-[#C1A14F]/60">Preferences are noted discreetly. No ratings.</div>
        </div>
      </Section>

      {/* Issue an Instruction */}
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
            <label className="mb-1 block text-xs text-[#C1A14F]/70">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-[#C1A14F]/30 bg-white/5 px-3 py-2 text-sm"
              rows={3}
            />
          </div>

          {/* Luxe Button */}
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
            className="w-full rounded-xl bg-gradient-to-r from-[#C1A14F] via-[#d7b768] to-[#C1A14F] px-6 py-3 text-sm font-semibold text-black tracking-wide shadow-[0_4px_15px_rgba(193,161,79,0.4)] hover:shadow-[0_6px_25px_rgba(193,161,79,0.6)] transition-all duration-300 relative overflow-hidden"
          >
            <span className="relative z-10">Send to Concierge</span>
            <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-40 transition-opacity"></span>
          </button>
        </div>
      </Section>

      {/* In Motion */}
      <Section title="In Motion">
        <div className="space-y-3">
          {current.length === 0 && (
            <div className="rounded-xl border border-[#C1A14F]/30 bg-white/5 p-4 text-sm text-[#C1A14F]/70">
              No active instructions.
            </div>
          )}
          {current.map((r) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-[#C1A14F]/30 bg-white/5 p-4"
            >
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
            </motion.div>
          ))}
        </div>
      </Section>
    </div>
  );
}

// -------------------------------------------------------
// CONCIERGE VIEW (kept simple for now)
// -------------------------------------------------------
function ConciergeView({ requests }) {
  return (
    <div>
      <Section title="Concierge Dashboard">
        <div className="text-sm text-[#C1A14F]/70">Prototype only — concierge tools coming next.</div>
      </Section>
    </div>
  );
}
