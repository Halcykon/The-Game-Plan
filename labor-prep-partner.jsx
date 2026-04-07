import { useState, useEffect, useCallback, useRef } from "react";

const STAGES = [
  { id: "welcome", label: "Welcome", icon: "👋" },
  { id: "birth-plan", label: "Birth Plan", icon: "📋" },
  { id: "interventions", label: "Interventions", icon: "🏥" },
  { id: "comfort", label: "Comfort & Vibes", icon: "🎵" },
  { id: "food", label: "Food & Drinks", icon: "🍽" },
  { id: "bag", label: "Labor Bag", icon: "🎒" },
  { id: "partner-tips", label: "Partner Playbook", icon: "💪" },
  { id: "brain", label: "BRAIN Tool", icon: "🧠" },
  { id: "review", label: "Game Plan", icon: "✅" },
];

const BIRTH_PLAN_QUESTIONS = [
  { id: "bp1", q: "Who does she want present in the delivery room?", type: "text", placeholder: "e.g. Just us, her mom, a doula..." },
  { id: "bp2", q: "Does she want to be offered pain medication? If so, what type?", type: "text", placeholder: "e.g. Open to epidural after 6cm, laughing gas first..." },
  { id: "bp3", q: "Does she want to try a natural birth with alternative comfort measures?", type: "choice", options: ["Yes, strongly prefer", "Open to it, flexible", "No preference", "Prefers medication"] },
  { id: "bp4", q: "Does she want to move freely during labor?", type: "choice", options: ["Yes, very important", "If possible", "No strong preference"] },
  { id: "bp5", q: "Does she want to use hydrotherapy (tub/shower)?", type: "choice", options: ["Yes, wants water birth option", "Yes, for comfort", "Open to it", "Not interested"] },
  { id: "bp6", q: "Does she want the baby continuously monitored?", type: "choice", options: ["Only if medically needed", "Intermittent monitoring", "Continuous is fine"] },
  { id: "bp7", q: "Does she want delayed cord clamping?", type: "choice", options: ["Yes", "No preference", "Need to discuss"] },
  { id: "bp8", q: "Does she want immediate skin-to-skin?", type: "choice", options: ["Yes, very important", "If possible", "No preference"] },
  { id: "bp9", q: "Any special requests for a C-section if needed?", type: "text", placeholder: "e.g. Delayed cord clamping, skin to skin, dad holds baby..." },
];

const INTERVENTIONS = [
  { id: "int_cervix", name: "Cervix Checks", desc: "Routine cervical exams to check dilation", default_pref: "Decline unless medically necessary (admitted, before pushing, before epidural, stalled progress)" },
  { id: "int_water", name: "Water Breaking", desc: "Artificial rupture of membranes (AROM)", default_pref: "Open if 7cm+ dilated or labor significantly stalled" },
  { id: "int_iv", name: "IV / Saline Lock", desc: "Intravenous access for fluids and medication", default_pref: "Just get it" },
  { id: "int_monitor", name: "Continuous Monitoring", desc: "Ongoing electronic fetal monitoring", default_pref: "Only if medical reason; internal monitoring if needed" },
  { id: "int_epidural", name: "Epidural", desc: "Regional anesthesia for pain relief", default_pref: "Open after 6cm dilated or if labor significantly stalled" },
  { id: "int_narcotics", name: "IV Pain Meds (Narcotics)", desc: "Systemic pain relief through IV", default_pref: "OK for early labor if really need rest" },
  { id: "int_nitrous", name: "Laughing Gas (Nitrous)", desc: "Inhaled pain relief", default_pref: "Want to try before other pain meds if not coping well" },
  { id: "int_induction", name: "Induction", desc: "Medical methods to start/speed up labor", default_pref: "Only after 41 weeks; research exact timing" },
  { id: "int_pitocin", name: "Pitocin", desc: "Synthetic oxytocin to strengthen contractions", default_pref: "May have fewer endorphins — need extra support and love" },
  { id: "int_vacuum", name: "Vacuum / Forceps / Episiotomy", desc: "Assisted delivery tools", default_pref: "Only if medically necessary and alternative is C-section; prefer to keep pushing if possible" },
  { id: "int_csection", name: "C-Section", desc: "Surgical delivery", default_pref: "Discuss in detail why it's necessary" },
];

const BAG_CATEGORIES = [
  {
    id: "car", name: "In the Car", emoji: "🚗",
    items: [
      { name: "Route planned (+ backup with fewest bumps)", packed: false },
      { name: "Full gas tank", packed: false },
      { name: "Plastic bags for vomiting", packed: false },
      { name: "Big pillow to hug (forward leaning)", packed: false },
      { name: "Water bottle with straw", packed: false },
      { name: "Headphones", packed: false },
    ]
  },
  {
    id: "her-clothing", name: "Her Clothing", emoji: "👗",
    items: [
      { name: "Biker shorts / leggings", packed: false },
      { name: "Comfortable PJs", packed: false },
      { name: "Loose nightgown (sleeveless/short sleeves)", packed: false },
      { name: "Robe", packed: false },
      { name: "Grippy socks", packed: false },
      { name: "Nursing bras x3", packed: false },
      { name: "Nursing tanks x2", packed: false },
      { name: "Slippers", packed: false },
      { name: "Going-home outfit (loose, comfortable)", packed: false },
    ]
  },
  {
    id: "room-vibes", name: "Room Vibes", emoji: "✨",
    items: [
      { name: "Star/aurora projector + remote", packed: false },
      { name: "Bluetooth speaker", packed: false },
      { name: "Fairy lights (battery + adhesives)", packed: false },
      { name: "Portable sound machine", packed: false },
      { name: "Playlist loaded (Spotify/downloaded)", packed: false },
      { name: "The Office episodes on hard drive", packed: false },
      { name: "Extension cord", packed: false },
    ]
  },
  {
    id: "comfort", name: "Comfort & Toiletries", emoji: "🧴",
    items: [
      { name: "Portable fan", packed: false },
      { name: "TENS machine", packed: false },
      { name: "Eye mask", packed: false },
      { name: "Compression socks", packed: false },
      { name: "Pillow (distinctive pillowcase)", packed: false },
      { name: "Blanket", packed: false },
      { name: "Lip balm", packed: false },
      { name: "Hair ties + barrettes", packed: false },
      { name: "Deodorant", packed: false },
      { name: "Body/face wash", packed: false },
      { name: "Hydrogel cream", packed: false },
      { name: "Hand cream + body oil", packed: false },
      { name: "Stretch marks lotion", packed: false },
      { name: "Body wipes x5", packed: false },
      { name: "Combs for pain", packed: false },
      { name: "Microfiber towel", packed: false },
    ]
  },
  {
    id: "snacks", name: "Snacks & Drinks", emoji: "🥤",
    items: [
      { name: "Electrolyte powder (variety + grape)", packed: false },
      { name: "Cooler: colostrum, sandwiches, champagne", packed: false },
      { name: "Ice water bottles (from freezer)", packed: false },
      { name: "Jocko premade chocolate", packed: false },
      { name: "Labor snacks (soft, low fragrance)", packed: false },
      { name: "Post-birth snacks", packed: false },
    ]
  },
  {
    id: "postpartum", name: "Postpartum", emoji: "🤱",
    items: [
      { name: "Peri bottle (nice one)", packed: false },
      { name: "Peri cold pack", packed: false },
      { name: "Nipple pads", packed: false },
      { name: "Instant ice maxi pads x2", packed: false },
      { name: "Silverettes", packed: false },
      { name: "Breast pump / Haakaa", packed: false },
      { name: "Breastfeeding pillow", packed: false },
      { name: "Nipple cream", packed: false },
      { name: "Prenatal vitamins + Tums", packed: false },
    ]
  },
  {
    id: "baby", name: "Baby", emoji: "👶",
    items: [
      { name: "Car seat INSTALLED", packed: false },
      { name: "Going-home outfit (socks, booties, hat)", packed: false },
      { name: "Receiving blanket", packed: false },
      { name: "Baby nail kit", packed: false },
      { name: "Water wipes sample", packed: false },
      { name: "Aquaphor sample", packed: false },
    ]
  },
  {
    id: "partner", name: "For You (Partner)", emoji: "🧔",
    items: [
      { name: "Phone + laptop + chargers", packed: false },
      { name: "Power bank + cables (USB-C, micro USB)", packed: false },
      { name: "Change of clothes", packed: false },
      { name: "Swim shorts + light tub shirt", packed: false },
      { name: "Button-down/zip hoodie (skin-to-skin)", packed: false },
      { name: "Pillow + blanket", packed: false },
      { name: "Kindle", packed: false },
      { name: "Shaver", packed: false },
      { name: "Mints/gum", packed: false },
      { name: "Closed-toe shoes", packed: false },
      { name: "Sweater", packed: false },
      { name: "Notepad + pen", packed: false },
      { name: "Snacks + water (low fragrance!)", packed: false },
    ]
  },
  {
    id: "admin", name: "Admin & Docs", emoji: "📁",
    items: [
      { name: "Both IDs (unexpired)", packed: false },
      { name: "Insurance card", packed: false },
      { name: "Birth plan (printed)", packed: false },
      { name: "Cash + ones for vending", packed: false },
      { name: "Credit card for parking", packed: false },
      { name: "Plastic folder for paperwork", packed: false },
      { name: "Wallet / spare wallet", packed: false },
    ]
  },
  {
    id: "nurse", name: "Nurse Gifts", emoji: "💝",
    items: [
      { name: "Thank you notes", packed: false },
      { name: "Snack packs for nurses", packed: false },
    ]
  },
];

const PARTNER_TIPS = [
  { cat: "Advocacy", tips: [
    "Know the birth plan cold. She may not be able to speak for herself.",
    "Say: 'We'd like a few minutes to discuss this privately' before any big decision.",
    "Handle ALL texts and phone calls so she can focus.",
    "Ask her in advance who she wants updated and when.",
  ]},
  { cat: "Take Initiative", tips: [
    "Don't ask — just do. Ice running low? Get more. Rag warm? Rewet it.",
    "Know where EVERYTHING is in the bags. Practice finding items.",
    "Know where the puke bags are in the room.",
    "Order food on her behalf after delivery.",
    "Keep track of her water intake and snack timing discreetly.",
  ]},
  { cat: "Don't Take It Personally", tips: [
    "She may suddenly not want to be touched, then desperately need you. Follow her lead.",
    "Don't get frustrated — stress slows labor and hurts morale.",
    "Some contractions she'll need silence. Others she'll need you to hold her and breathe together.",
  ]},
  { cat: "Comfort Techniques", tips: [
    "Learn counter pressure BEFORE the due date. Don't YouTube it during labor.",
    "Have affirmations ready — ones SHE wrote, so you can't say the wrong thing.",
    "At 7cm/transition, she may say she can't do it. Remind her she's almost there.",
    "Remind her to breathe: in for 4, out for 7-8 counts.",
    "Watch that she's not tensing up, especially her face.",
    "Water bottle with a STRAW — critical during labor.",
  ]},
  { cat: "Food Rules", tips: [
    "No strong-smelling food for you.",
    "Don't eat in front of her after epidural (she can't eat).",
    "If she can't chew, squeeze fruit pouches into her mouth.",
  ]},
  { cat: "Capture & Memories", tips: [
    "Clear phone storage BEFORE. Don't delete cat photos while baby arrives.",
    "Video the first moments they lay baby on her. You won't get a redo.",
  ]},
  { cat: "Self-Care", tips: [
    "Sleep when she sleeps. Stay awake during contractions.",
    "Bring your own pillow and blanket — hospital chairs are brutal.",
    "Download a diaper/feeding tracker app (Huckleberry) on BOTH phones.",
    "Download a contraction timer and know how to use it.",
  ]},
];

const BRAIN_LETTERS = [
  { letter: "B", word: "Benefits", prompt: "What are the benefits? How might it positively impact mom and baby?" },
  { letter: "R", word: "Risks", prompt: "What are the risks? How might it negatively impact them?" },
  { letter: "A", word: "Alternatives", prompt: "What are the alternatives? Are there other options?" },
  { letter: "I", word: "Intuition", prompt: "What is her gut telling her?" },
  { letter: "N", word: "Nothing", prompt: "What happens if we do nothing and wait?" },
];

// Storage helpers
const STORAGE_KEY = "labor-prep-data";
const loadData = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
};

// Use in-memory state since localStorage isn't available
let memoryStore = {};

function usePersistedState(key, defaultVal) {
  const [val, setVal] = useState(() => {
    return memoryStore[key] !== undefined ? memoryStore[key] : defaultVal;
  });
  useEffect(() => {
    memoryStore[key] = val;
  }, [key, val]);
  return [val, setVal];
}

// Components
function ProgressBar({ stages, current, onNav }) {
  const idx = stages.findIndex(s => s.id === current);
  const pct = ((idx + 1) / stages.length) * 100;
  return (
    <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 8, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        {stages.map((s, i) => (
          <button key={s.id} onClick={() => onNav(s.id)}
            style={{
              flex: "0 0 auto", padding: "6px 10px", fontSize: 12, borderRadius: 20,
              border: i === idx ? "2px solid var(--accent)" : "1px solid var(--border)",
              background: i < idx ? "var(--done-bg)" : i === idx ? "var(--accent-bg)" : "transparent",
              color: i === idx ? "var(--accent)" : "var(--text-secondary)",
              cursor: "pointer", fontWeight: i === idx ? 700 : 400, whiteSpace: "nowrap",
              fontFamily: "var(--font-body)",
            }}>
            {s.icon} {s.label}
          </button>
        ))}
      </div>
      <div style={{ height: 3, background: "var(--border)", borderRadius: 2 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "var(--accent)", borderRadius: 2, transition: "width 0.4s ease" }} />
      </div>
    </div>
  );
}

function NavButtons({ onPrev, onNext, prevLabel = "Back", nextLabel = "Next" }) {
  return (
    <div style={{ display: "flex", gap: 12, padding: "24px 0" }}>
      {onPrev && <button onClick={onPrev} style={btnStyle("secondary")}>{prevLabel}</button>}
      {onNext && <button onClick={onNext} style={btnStyle("primary")}>{nextLabel}</button>}
    </div>
  );
}

function SectionTitle({ icon, title, subtitle }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 28, fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--text-primary)", margin: 0, lineHeight: 1.2 }}>
        {icon} {title}
      </h2>
      {subtitle && <p style={{ color: "var(--text-secondary)", marginTop: 6, fontSize: 15, lineHeight: 1.5 }}>{subtitle}</p>}
    </div>
  );
}

function Card({ children, style: s = {} }) {
  return <div style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, marginBottom: 16, ...s }}>{children}</div>;
}

// Pages
function WelcomePage({ onNext }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 0" }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🤝</div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 900, color: "var(--text-primary)", margin: "0 0 12px", lineHeight: 1.1 }}>
        Labor Prep Together
      </h1>
      <p style={{ color: "var(--text-secondary)", fontSize: 17, maxWidth: 500, margin: "0 auto 12px", lineHeight: 1.6 }}>
        This app helps you prepare to be the best partner during labor. You'll interview her about her preferences, build the labor bag together, and learn how to advocate for her.
      </p>
      <div style={{ background: "var(--accent-bg)", border: "1px solid var(--accent)", borderRadius: 12, padding: 20, maxWidth: 440, margin: "24px auto", textAlign: "left" }}>
        <p style={{ fontWeight: 700, color: "var(--accent)", margin: "0 0 8px", fontSize: 15 }}>How this works:</p>
        <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: 14, lineHeight: 1.7 }}>
          Sit down with her and go through each section together. Ask the questions out loud. Write down her answers. By the end, you'll have a complete game plan — birth preferences, bag checklist, comfort strategies, and a quick-reference decision tool for the delivery room.
        </p>
      </div>
      <button onClick={onNext} style={{ ...btnStyle("primary"), fontSize: 18, padding: "14px 48px", marginTop: 16 }}>
        Let's Start →
      </button>
    </div>
  );
}

function BirthPlanPage({ onPrev, onNext }) {
  const [answers, setAnswers] = usePersistedState("birthPlan", {});
  const update = (id, val) => setAnswers(prev => ({ ...prev, [id]: val }));

  return (
    <div>
      <SectionTitle icon="📋" title="Birth Plan Interview"
        subtitle="Sit with her and ask these questions. Write down exactly what she says — this becomes your cheat sheet in the delivery room." />
      {BIRTH_PLAN_QUESTIONS.map(q => (
        <Card key={q.id}>
          <p style={{ fontWeight: 700, color: "var(--text-primary)", margin: "0 0 10px", fontSize: 15, lineHeight: 1.4 }}>
            Ask her: "{q.q}"
          </p>
          {q.type === "text" ? (
            <textarea value={answers[q.id] || ""} onChange={e => update(q.id, e.target.value)}
              placeholder={q.placeholder}
              style={inputStyle()} rows={2} />
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {q.options.map(opt => (
                <button key={opt} onClick={() => update(q.id, opt)}
                  style={{
                    padding: "8px 16px", borderRadius: 20, fontSize: 13,
                    border: answers[q.id] === opt ? "2px solid var(--accent)" : "1px solid var(--border)",
                    background: answers[q.id] === opt ? "var(--accent-bg)" : "transparent",
                    color: answers[q.id] === opt ? "var(--accent)" : "var(--text-secondary)",
                    cursor: "pointer", fontFamily: "var(--font-body)",
                  }}>
                  {opt}
                </button>
              ))}
            </div>
          )}
        </Card>
      ))}
      <NavButtons onPrev={onPrev} onNext={onNext} />
    </div>
  );
}

function InterventionsPage({ onPrev, onNext }) {
  const [prefs, setPrefs] = usePersistedState("interventions", {});
  const [expanded, setExpanded] = useState(null);

  const update = (id, val) => setPrefs(prev => ({ ...prev, [id]: val }));

  return (
    <div>
      <SectionTitle icon="🏥" title="Interventions Preferences"
        subtitle="Go through each intervention. Ask her how she feels. The grey text shows a common preference — edit to match her wishes." />
      <Card style={{ background: "var(--warn-bg)", border: "1px solid var(--warn-border)", marginBottom: 24 }}>
        <p style={{ margin: 0, fontWeight: 700, color: "var(--warn-text)", fontSize: 14 }}>
          💡 Use the BRAIN tool (later section) during labor to evaluate any intervention in real time.
        </p>
      </Card>
      {INTERVENTIONS.map(int => (
        <Card key={int.id}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, color: "var(--text-primary)", margin: 0, fontSize: 15 }}>{int.name}</p>
              <p style={{ color: "var(--text-tertiary)", margin: "2px 0 0", fontSize: 13 }}>{int.desc}</p>
            </div>
            <button onClick={() => setExpanded(expanded === int.id ? null : int.id)}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "var(--text-secondary)", padding: 4 }}>
              {expanded === int.id ? "▲" : "▼"}
            </button>
          </div>
          {expanded === int.id && (
            <div style={{ marginTop: 12 }}>
              <p style={{ fontSize: 12, color: "var(--text-tertiary)", margin: "0 0 6px" }}>Common preference:</p>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 10px", fontStyle: "italic" }}>{int.default_pref}</p>
              <textarea value={prefs[int.id] ?? int.default_pref} onChange={e => update(int.id, e.target.value)}
                placeholder="Her preference..."
                style={inputStyle()} rows={2} />
            </div>
          )}
        </Card>
      ))}
      <Card style={{ borderLeft: "4px solid var(--accent)" }}>
        <p style={{ margin: 0, fontWeight: 700, color: "var(--text-primary)", fontSize: 14 }}>
          Key Reminder for Transition (7cm+)
        </p>
        <p style={{ margin: "6px 0 0", color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.5 }}>
          Many women without pain meds feel like they can't continue at 7cm/transition. This is actually almost the end. Remind her she's almost there and suggest waiting before deciding on medication.
        </p>
      </Card>
      <NavButtons onPrev={onPrev} onNext={onNext} />
    </div>
  );
}

function ComfortPage({ onPrev, onNext }) {
  const [affirmations, setAffirmations] = usePersistedState("affirmations", [
    "I am safe and I trust my body",
    "You can do anything for a minute",
    "Your body was made to do this",
  ]);
  const [newAff, setNewAff] = useState("");

  const addAffirmation = () => {
    if (newAff.trim()) {
      setAffirmations(prev => [...prev, newAff.trim()]);
      setNewAff("");
    }
  };

  const removeAff = (i) => setAffirmations(prev => prev.filter((_, j) => j !== i));

  const techniques = [
    { name: "Counter Pressure", desc: "Apply firm pressure to lower back/hips during contractions. Learn this BEFORE labor — don't YouTube it mid-contraction.", urgent: true },
    { name: "Breathing (Hypnobirthing)", desc: "In for 4, out for 7-8 counts. Help her count. Especially in early labor." },
    { name: "Acupressure (LI4)", desc: "Firm, continuous pressure between thumb and pointer finger during contractions." },
    { name: "Face Check", desc: "Watch for tension in her face — remind her to relax jaw and brow." },
    { name: "Water (Hydrotherapy)", desc: "Shower or tub can provide significant relief. You may need swim shorts + light shirt to be in tub with her." },
  ];

  return (
    <div>
      <SectionTitle icon="🎵" title="Comfort & Vibes"
        subtitle="Ask her what will help her feel calm, safe, and supported. Build the affirmation list together." />

      <h3 style={h3Style()}>Affirmations</h3>
      <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: -8, marginBottom: 12 }}>
        Ask her: "What do you want me to say to you when it gets really hard?" Write them down — if they come from her, you can't say the wrong thing.
      </p>
      {affirmations.map((a, i) => (
        <Card key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px" }}>
          <span style={{ fontSize: 20 }}>💬</span>
          <span style={{ flex: 1, color: "var(--text-primary)", fontSize: 15, fontStyle: "italic" }}>"{a}"</span>
          <button onClick={() => removeAff(i)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", fontSize: 18 }}>×</button>
        </Card>
      ))}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <input value={newAff} onChange={e => setNewAff(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addAffirmation()}
          placeholder="Add an affirmation she wants to hear..."
          style={{ ...inputStyle(), flex: 1, margin: 0 }} />
        <button onClick={addAffirmation} style={btnStyle("primary")}>Add</button>
      </div>

      <h3 style={h3Style()}>Comfort Techniques to Practice</h3>
      {techniques.map(t => (
        <Card key={t.name} style={t.urgent ? { borderLeft: "4px solid var(--warn-text)" } : {}}>
          <p style={{ fontWeight: 700, color: "var(--text-primary)", margin: 0, fontSize: 14 }}>
            {t.name} {t.urgent && <span style={{ color: "var(--warn-text)", fontSize: 12 }}>⚠ PRACTICE NOW</span>}
          </p>
          <p style={{ color: "var(--text-secondary)", margin: "4px 0 0", fontSize: 13, lineHeight: 1.5 }}>{t.desc}</p>
        </Card>
      ))}

      <h3 style={h3Style()}>Music & Vibes Plan</h3>
      <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: -8, marginBottom: 12 }}>
        Ask her: "What kind of vibe do you want at each stage?"
      </p>
      <Card>
        <div style={{ display: "grid", gap: 8 }}>
          {[
            ["Early Labor", "Upbeat, nostalgic — early 2010s, good vibes playlists"],
            ["Active Labor", "Lo-fi, rain sounds, soft lounge"],
            ["Transition", "Spa music, super soft — or silence"],
            ["If C-section", "Vitamin String Quartet or calming instrumentals"],
            ["Recovery", "The Office, funny Reddit compilations, Google Photos memories"],
          ].map(([stage, suggestion]) => (
            <div key={stage} style={{ display: "flex", gap: 12, padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontWeight: 700, color: "var(--accent)", fontSize: 13, minWidth: 100 }}>{stage}</span>
              <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>{suggestion}</span>
            </div>
          ))}
        </div>
      </Card>
      <NavButtons onPrev={onPrev} onNext={onNext} />
    </div>
  );
}

function FoodPage({ onPrev, onNext }) {
  const [likes, setLikes] = usePersistedState("foodLikes", [
    "Jocko premade chocolate", "Coconut water", "Mac and cheese", "Cream of wheat",
    "Fudge graham zone bar", "Popsicle/ice cream", "Smoothie (no seeds)",
    "PB (maybe with raisins)", "Crackers with spreadable cheese", "Soft ripe fruit",
    "Oatmeal with raisins + cinnamon", "PBJ sandwich", "Oatmeal raisin cookie (not too sweet)",
    "Banana bread (no nuts)", "Peanut M&Ms", "Hard candy to suck on",
    "Made Good granola bars", "Graham crackers", "Yogurt with honey",
    "Cereal", "Electrolytes", "Honey bee bar / granola",
  ]);
  const [dislikes, setDislikes] = usePersistedState("foodDislikes", [
    "Smoothies with seeds", "Anything really chewy", "Meat/fish",
    "Popcorn/chips/hard snacks", "Plain banana",
  ]);
  const [newLike, setNewLike] = useState("");
  const [newDislike, setNewDislike] = useState("");

  const addItem = (setter, val, setInput) => {
    if (val.trim()) { setter(prev => [...prev, val.trim()]); setInput(""); }
  };

  return (
    <div>
      <SectionTitle icon="🍽" title="Food & Drink Preferences"
        subtitle="Ask her what she'll want to eat during early labor and after delivery. Low fragrance is key." />

      <Card style={{ background: "var(--warn-bg)", border: "1px solid var(--warn-border)" }}>
        <p style={{ margin: 0, fontWeight: 700, color: "var(--warn-text)", fontSize: 14 }}>
          ⚠ After epidural, she cannot eat. Don't eat in front of her. Keep YOUR food low-fragrance.
        </p>
      </Card>

      <h3 style={h3Style()}>✅ Foods She Likes</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
        {likes.map((f, i) => (
          <span key={i} onClick={() => setLikes(prev => prev.filter((_, j) => j !== i))}
            style={{ padding: "6px 12px", background: "var(--done-bg)", borderRadius: 16, fontSize: 13, color: "var(--text-primary)", cursor: "pointer" }}>
            {f} ×
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <input value={newLike} onChange={e => setNewLike(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addItem(setLikes, newLike, setNewLike)}
          placeholder="Add a food..." style={{ ...inputStyle(), flex: 1, margin: 0 }} />
        <button onClick={() => addItem(setLikes, newLike, setNewLike)} style={btnStyle("secondary")}>Add</button>
      </div>

      <h3 style={h3Style()}>❌ Foods She Dislikes</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
        {dislikes.map((f, i) => (
          <span key={i} onClick={() => setDislikes(prev => prev.filter((_, j) => j !== i))}
            style={{ padding: "6px 12px", background: "var(--error-bg)", borderRadius: 16, fontSize: 13, color: "var(--text-primary)", cursor: "pointer" }}>
            {f} ×
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <input value={newDislike} onChange={e => setNewDislike(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addItem(setDislikes, newDislike, setNewDislike)}
          placeholder="Add a dislike..." style={{ ...inputStyle(), flex: 1, margin: 0 }} />
        <button onClick={() => addItem(setDislikes, newDislike, setNewDislike)} style={btnStyle("secondary")}>Add</button>
      </div>
      <NavButtons onPrev={onPrev} onNext={onNext} />
    </div>
  );
}

function BagPage({ onPrev, onNext }) {
  const [bags, setBags] = usePersistedState("bags", BAG_CATEGORIES);
  const [expandedCat, setExpandedCat] = useState(null);
  const [newItems, setNewItems] = useState({});

  const toggleItem = (catIdx, itemIdx) => {
    setBags(prev => {
      const next = prev.map((c, ci) => ci === catIdx ? {
        ...c, items: c.items.map((it, ii) => ii === itemIdx ? { ...it, packed: !it.packed } : it)
      } : c);
      return next;
    });
  };

  const addItem = (catIdx) => {
    const name = newItems[catIdx]?.trim();
    if (!name) return;
    setBags(prev => prev.map((c, ci) => ci === catIdx ? { ...c, items: [...c.items, { name, packed: false }] } : c));
    setNewItems(prev => ({ ...prev, [catIdx]: "" }));
  };

  const removeItem = (catIdx, itemIdx) => {
    setBags(prev => prev.map((c, ci) => ci === catIdx ? { ...c, items: c.items.filter((_, ii) => ii !== itemIdx) } : c));
  };

  const totalItems = bags.reduce((s, c) => s + c.items.length, 0);
  const packedItems = bags.reduce((s, c) => s + c.items.filter(i => i.packed).length, 0);

  return (
    <div>
      <SectionTitle icon="🎒" title="Labor Bag Builder"
        subtitle="Go through each category. Add or remove items based on what she actually wants. Check them off as you pack." />

      <Card style={{ textAlign: "center", padding: 16 }}>
        <div style={{ fontSize: 32, fontWeight: 900, color: "var(--accent)", fontFamily: "var(--font-display)" }}>
          {packedItems} / {totalItems}
        </div>
        <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>items packed</div>
        <div style={{ height: 6, background: "var(--border)", borderRadius: 3, marginTop: 8 }}>
          <div style={{ height: "100%", width: totalItems ? `${(packedItems / totalItems) * 100}%` : "0%", background: "var(--accent)", borderRadius: 3, transition: "width 0.3s" }} />
        </div>
      </Card>

      {bags.map((cat, catIdx) => {
        const catPacked = cat.items.filter(i => i.packed).length;
        const isExpanded = expandedCat === cat.id;
        return (
          <Card key={cat.id} style={{ padding: 0, overflow: "hidden" }}>
            <button onClick={() => setExpandedCat(isExpanded ? null : cat.id)}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 16px", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-body)",
              }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>
                {cat.emoji} {cat.name}
              </span>
              <span style={{
                fontSize: 12, padding: "2px 10px", borderRadius: 10,
                background: catPacked === cat.items.length && cat.items.length > 0 ? "var(--done-bg)" : "var(--border)",
                color: catPacked === cat.items.length && cat.items.length > 0 ? "var(--done-text)" : "var(--text-secondary)",
              }}>
                {catPacked}/{cat.items.length}
              </span>
            </button>
            {isExpanded && (
              <div style={{ padding: "0 16px 16px" }}>
                {cat.items.map((item, itemIdx) => (
                  <div key={itemIdx} style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "8px 0",
                    borderBottom: itemIdx < cat.items.length - 1 ? "1px solid var(--border)" : "none",
                  }}>
                    <input type="checkbox" checked={item.packed} onChange={() => toggleItem(catIdx, itemIdx)}
                      style={{ width: 18, height: 18, cursor: "pointer", accentColor: "var(--accent)" }} />
                    <span style={{
                      flex: 1, fontSize: 14, color: "var(--text-primary)",
                      textDecoration: item.packed ? "line-through" : "none",
                      opacity: item.packed ? 0.5 : 1,
                    }}>{item.name}</span>
                    <button onClick={() => removeItem(catIdx, itemIdx)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", fontSize: 16 }}>×</button>
                  </div>
                ))}
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <input value={newItems[catIdx] || ""} onChange={e => setNewItems(prev => ({ ...prev, [catIdx]: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && addItem(catIdx)}
                    placeholder="Add custom item..." style={{ ...inputStyle(), flex: 1, margin: 0, padding: "8px 12px" }} />
                  <button onClick={() => addItem(catIdx)} style={{ ...btnStyle("secondary"), padding: "8px 16px" }}>+</button>
                </div>
              </div>
            )}
          </Card>
        );
      })}
      <NavButtons onPrev={onPrev} onNext={onNext} />
    </div>
  );
}

function PartnerTipsPage({ onPrev, onNext }) {
  return (
    <div>
      <SectionTitle icon="💪" title="Partner Playbook"
        subtitle="Crowdsourced wisdom from partners and doulas. Read through these — ideally before the due date, not during labor." />
      {PARTNER_TIPS.map(section => (
        <div key={section.cat} style={{ marginBottom: 20 }}>
          <h3 style={h3Style()}>{section.cat}</h3>
          {section.tips.map((tip, i) => (
            <Card key={i} style={{ padding: "12px 16px", display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ color: "var(--accent)", fontWeight: 700, fontSize: 14, marginTop: 1 }}>•</span>
              <span style={{ color: "var(--text-primary)", fontSize: 14, lineHeight: 1.5 }}>{tip}</span>
            </Card>
          ))}
        </div>
      ))}
      <NavButtons onPrev={onPrev} onNext={onNext} />
    </div>
  );
}

function BrainPage({ onPrev, onNext }) {
  const [scenario, setScenario] = useState("");
  const [notes, setNotes] = usePersistedState("brainNotes", {});

  return (
    <div>
      <SectionTitle icon="🧠" title="BRAIN Decision Tool"
        subtitle="Use this during labor when a provider suggests an intervention. It helps you and her make informed decisions together without feeling pressured." />

      <Card style={{ borderLeft: "4px solid var(--accent)", marginBottom: 24 }}>
        <p style={{ margin: 0, color: "var(--text-primary)", fontSize: 14, lineHeight: 1.5 }}>
          <strong>How to use:</strong> When a provider recommends something, say: "Thank you — could we have a few minutes to discuss?" Then walk through each letter together.
        </p>
      </Card>

      <div style={{ marginBottom: 20 }}>
        <input value={scenario} onChange={e => setScenario(e.target.value)}
          placeholder="What's being proposed? e.g. 'Pitocin to speed up labor'"
          style={{ ...inputStyle(), fontWeight: 700, fontSize: 16 }} />
      </div>

      {BRAIN_LETTERS.map(({ letter, word, prompt }) => (
        <Card key={letter} style={{ borderLeft: `4px solid var(--accent)` }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{
              width: 40, height: 40, borderRadius: 8, background: "var(--accent-bg)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 900, fontSize: 22, color: "var(--accent)", fontFamily: "var(--font-display)",
              flexShrink: 0,
            }}>{letter}</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, color: "var(--text-primary)", margin: "0 0 2px", fontSize: 15 }}>{word}</p>
              <p style={{ color: "var(--text-secondary)", margin: "0 0 8px", fontSize: 13 }}>{prompt}</p>
              <textarea value={notes[letter] || ""} onChange={e => setNotes(prev => ({ ...prev, [letter]: e.target.value }))}
                placeholder="Notes..." style={inputStyle()} rows={2} />
            </div>
          </div>
        </Card>
      ))}
      <NavButtons onPrev={onPrev} onNext={onNext} />
    </div>
  );
}

function ReviewPage({ onPrev }) {
  const birthPlan = memoryStore["birthPlan"] || {};
  const interventions = memoryStore["interventions"] || {};
  const affirmations = memoryStore["affirmations"] || ["I am safe and I trust my body", "You can do anything for a minute", "Your body was made to do this"];
  const bags = memoryStore["bags"] || BAG_CATEGORIES;
  const foodLikes = memoryStore["foodLikes"] || [];

  const totalItems = bags.reduce((s, c) => s + c.items.length, 0);
  const packedItems = bags.reduce((s, c) => s + c.items.filter(i => i.packed).length, 0);
  const answeredQs = Object.keys(birthPlan).length;
  const customInterventions = Object.keys(interventions).length;

  return (
    <div>
      <SectionTitle icon="✅" title="Your Game Plan"
        subtitle="Here's a summary of everything you've prepared. Review it, keep it on your phone, and you're ready." />

      <Card style={{ textAlign: "center", padding: 24, background: "var(--accent-bg)", border: "2px solid var(--accent)" }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: "var(--accent)", fontFamily: "var(--font-display)" }}>
          Preparation Score
        </div>
        <div style={{ fontSize: 48, fontWeight: 900, color: "var(--accent)", fontFamily: "var(--font-display)", margin: "8px 0" }}>
          {Math.round(((answeredQs / BIRTH_PLAN_QUESTIONS.length) * 30 + (packedItems / Math.max(totalItems, 1)) * 40 + (customInterventions / INTERVENTIONS.length) * 30))}%
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, fontSize: 13, color: "var(--text-secondary)" }}>
          <span>📋 {answeredQs}/{BIRTH_PLAN_QUESTIONS.length} questions</span>
          <span>🎒 {packedItems}/{totalItems} packed</span>
          <span>🏥 {customInterventions}/{INTERVENTIONS.length} reviewed</span>
        </div>
      </Card>

      {answeredQs > 0 && (
        <>
          <h3 style={h3Style()}>Birth Plan Summary</h3>
          {BIRTH_PLAN_QUESTIONS.filter(q => birthPlan[q.id]).map(q => (
            <Card key={q.id} style={{ padding: "10px 16px" }}>
              <p style={{ fontSize: 12, color: "var(--text-tertiary)", margin: "0 0 4px" }}>{q.q}</p>
              <p style={{ fontSize: 14, color: "var(--text-primary)", margin: 0, fontWeight: 600 }}>{birthPlan[q.id]}</p>
            </Card>
          ))}
        </>
      )}

      <h3 style={h3Style()}>Affirmations to Say</h3>
      <Card>
        {affirmations.map((a, i) => (
          <p key={i} style={{ margin: i === 0 ? 0 : "8px 0 0", color: "var(--text-primary)", fontSize: 15, fontStyle: "italic" }}>
            💬 "{a}"
          </p>
        ))}
      </Card>

      <h3 style={h3Style()}>Quick BRAIN Reference</h3>
      <Card style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {BRAIN_LETTERS.map(({ letter, word }) => (
            <span key={letter} style={{
              padding: "4px 12px", background: "var(--accent-bg)", borderRadius: 8,
              fontSize: 13, fontWeight: 700, color: "var(--accent)",
            }}>
              {letter} = {word}
            </span>
          ))}
        </div>
      </Card>

      <h3 style={h3Style()}>Critical Reminders</h3>
      <Card>
        {[
          "Clear phone storage NOW",
          "Install contraction timer + Huckleberry app",
          "Practice counter pressure techniques",
          "Fill the gas tank the night before",
          "Put car seat in BEFORE labor starts",
          "Know the hospital route + backup route",
        ].map((r, i) => (
          <p key={i} style={{ margin: i === 0 ? 0 : "6px 0 0", fontSize: 14, color: "var(--text-primary)" }}>⚡ {r}</p>
        ))}
      </Card>

      <NavButtons onPrev={onPrev} />
    </div>
  );
}

// Style helpers
function btnStyle(variant) {
  const base = {
    padding: "10px 24px", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer",
    border: "none", fontFamily: "var(--font-body)", transition: "all 0.2s",
  };
  if (variant === "primary") return { ...base, background: "var(--accent)", color: "#fff" };
  return { ...base, background: "var(--card-bg)", color: "var(--text-primary)", border: "1px solid var(--border)" };
}

function inputStyle() {
  return {
    width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)",
    background: "var(--input-bg)", color: "var(--text-primary)", fontSize: 14,
    fontFamily: "var(--font-body)", resize: "vertical", outline: "none", boxSizing: "border-box",
  };
}

function h3Style() {
  return { fontSize: 18, fontWeight: 800, color: "var(--text-primary)", margin: "24px 0 12px", fontFamily: "var(--font-display)" };
}

// Main App
export default function LaborPrepApp() {
  const [currentStage, setCurrentStage] = useState("welcome");
  const contentRef = useRef(null);

  const navigate = useCallback((id) => {
    setCurrentStage(id);
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const stageIdx = STAGES.findIndex(s => s.id === currentStage);
  const goPrev = stageIdx > 0 ? () => navigate(STAGES[stageIdx - 1].id) : null;
  const goNext = stageIdx < STAGES.length - 1 ? () => navigate(STAGES[stageIdx + 1].id) : null;

  const renderPage = () => {
    switch (currentStage) {
      case "welcome": return <WelcomePage onNext={goNext} />;
      case "birth-plan": return <BirthPlanPage onPrev={goPrev} onNext={goNext} />;
      case "interventions": return <InterventionsPage onPrev={goPrev} onNext={goNext} />;
      case "comfort": return <ComfortPage onPrev={goPrev} onNext={goNext} />;
      case "food": return <FoodPage onPrev={goPrev} onNext={goNext} />;
      case "bag": return <BagPage onPrev={goPrev} onNext={goNext} />;
      case "partner-tips": return <PartnerTipsPage onPrev={goPrev} onNext={goNext} />;
      case "brain": return <BrainPage onPrev={goPrev} onNext={goNext} />;
      case "review": return <ReviewPage onPrev={goPrev} />;
      default: return null;
    }
  };

  return (
    <div style={{
      "--font-display": "'Fraunces', serif",
      "--font-body": "'Source Sans 3', sans-serif",
      "--accent": "#2563eb",
      "--accent-bg": "#eff6ff",
      "--text-primary": "#1e293b",
      "--text-secondary": "#64748b",
      "--text-tertiary": "#94a3b8",
      "--card-bg": "#ffffff",
      "--input-bg": "#f8fafc",
      "--border": "#e2e8f0",
      "--done-bg": "#dcfce7",
      "--done-text": "#166534",
      "--warn-bg": "#fef3c7",
      "--warn-border": "#fbbf24",
      "--warn-text": "#92400e",
      "--error-bg": "#fee2e2",
      height: "100vh", display: "flex", flexDirection: "column",
      background: "#f1f5f9", fontFamily: "var(--font-body)", color: "var(--text-primary)",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@400;700;800;900&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet" />

      <ProgressBar stages={STAGES} current={currentStage} onNav={navigate} />

      <div ref={contentRef} style={{ flex: 1, overflowY: "auto", padding: "24px 20px", maxWidth: 640, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        {renderPage()}
      </div>
    </div>
  );
}
