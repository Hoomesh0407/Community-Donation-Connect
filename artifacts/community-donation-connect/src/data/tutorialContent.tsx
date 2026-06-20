import React from "react";

export interface TutorialStep {
  title: string;
  titleTe: string;
  desc: string;
  descTe: string;
  visual: React.ReactNode;
  duration: number;
}

export interface Tutorial {
  id: string;
  title: string;
  titleTe: string;
  subtitle: string;
  subtitleTe: string;
  category: string;
  icon: string;
  color: string;
  steps: TutorialStep[];
}

/* ─── Reusable visual building blocks ──────────────────────────────────── */

function Screen({ children, bg = "bg-slate-50" }: { children: React.ReactNode; bg?: string }) {
  return (
    <div className={`${bg} rounded-xl border border-slate-200 overflow-hidden w-full max-w-[320px] mx-auto shadow-sm`}>
      <div className="flex items-center gap-1.5 px-3 py-2 bg-white border-b">
        <span className="w-2 h-2 rounded-full bg-red-400" />
        <span className="w-2 h-2 rounded-full bg-yellow-400" />
        <span className="w-2 h-2 rounded-full bg-green-400" />
        <div className="flex-1 mx-2 h-4 bg-slate-100 rounded-full" />
      </div>
      <div className="p-3 text-xs">{children}</div>
    </div>
  );
}

function NavBar() {
  return (
    <div className="flex items-center justify-between bg-white border-b px-3 py-2 mb-2 -mx-3 -mt-3 rounded-t-xl">
      <div className="flex items-center gap-1">
        <div className="w-5 h-5 bg-blue-700 rounded-md flex items-center justify-center">
          <span className="text-white text-xs font-bold">C</span>
        </div>
        <span className="font-bold text-blue-700 text-xs">CDC</span>
      </div>
      <div className="flex gap-2 text-xs text-slate-500">
        <span>Donations</span>
        <span>Requests</span>
      </div>
      <div className="flex gap-1">
        <div className="px-2 py-0.5 rounded text-xs text-blue-700 border border-blue-300">Login</div>
        <div className="px-2 py-0.5 rounded text-xs bg-blue-700 text-white">Register</div>
      </div>
    </div>
  );
}

function FormField({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="mb-2">
      <div className="text-xs text-slate-500 mb-0.5">{label}</div>
      <div className={`border rounded px-2 py-1 text-xs ${highlight ? "border-blue-500 bg-blue-50 shadow-sm" : "border-slate-200 bg-white"}`}>
        {value}<span className={`inline-block w-0.5 h-3 bg-blue-600 ml-0.5 ${highlight ? "animate-pulse" : "opacity-0"}`} />
      </div>
    </div>
  );
}

function Btn({ label, color = "bg-blue-700 text-white", pulse }: { label: string; color?: string; pulse?: boolean }) {
  return (
    <button className={`w-full py-1.5 px-3 rounded text-xs font-semibold ${color} ${pulse ? "animate-pulse" : ""} text-center`}>
      {label}
    </button>
  );
}

function Notification({ msg, type = "success" }: { msg: string; type?: "success" | "info" | "match" }) {
  const colors = {
    success: "bg-green-50 border-green-300 text-green-800",
    info: "bg-blue-50 border-blue-300 text-blue-800",
    match: "bg-amber-50 border-amber-300 text-amber-800",
  };
  const icons = { success: "✅", info: "ℹ️", match: "🔔" };
  return (
    <div className={`border rounded-lg px-2 py-1.5 text-xs flex items-start gap-1.5 ${colors[type]} shadow-sm animate-in slide-in-from-top-2 duration-300`}>
      <span>{icons[type]}</span>
      <span>{msg}</span>
    </div>
  );
}

function CategoryGrid({ selected }: { selected?: string }) {
  const cats = [
    { id: "Food", icon: "🍱" }, { id: "Clothing", icon: "👕" },
    { id: "Books", icon: "📚" }, { id: "Electronics", icon: "📱" },
    { id: "Furniture", icon: "🪑" }, { id: "Medical", icon: "💊" },
    { id: "Toys", icon: "🧸" }, { id: "Other", icon: "📦" },
  ];
  return (
    <div className="grid grid-cols-4 gap-1">
      {cats.map((c) => (
        <div key={c.id} className={`rounded-lg p-1.5 border text-center cursor-pointer ${c.id === selected ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 bg-white"}`}>
          <div className="text-base">{c.icon}</div>
          <div className="text-xs mt-0.5 font-medium leading-tight">{c.id}</div>
        </div>
      ))}
    </div>
  );
}

function TrustBadge({ score, level }: { score: number; level: string }) {
  const colors: Record<string, string> = {
    "New Donor": "bg-slate-100 text-slate-600",
    "Trusted": "bg-blue-100 text-blue-700",
    "Highly Trusted": "bg-purple-100 text-purple-700",
    "Champion": "bg-amber-100 text-amber-700",
  };
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg border bg-white">
      <div className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colors[level] || "bg-slate-100 text-slate-600"}`}>{level}</div>
      <div className="text-sm font-bold text-slate-800">{score} pts</div>
    </div>
  );
}

function ProfileCard({ name, score, level, badge }: { name: string; score: number; level: string; badge: string }) {
  return (
    <div className="bg-white rounded-xl border p-3 text-center shadow-sm">
      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl mx-auto mb-1">{badge}</div>
      <div className="font-semibold text-xs">{name}</div>
      <TrustBadge score={score} level={level} />
    </div>
  );
}

function StarRow({ stars }: { stars: number }) {
  return (
    <span className="text-sm">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < stars ? "text-amber-400" : "text-slate-200"}>★</span>
      ))}
    </span>
  );
}

function MatchCard({ donor, receiver, distance }: { donor: string; receiver: string; distance: string }) {
  return (
    <div className="bg-white rounded-xl border p-2 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs">R</div>
          <span className="text-xs font-medium">{donor}</span>
          <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full">Donor</span>
        </div>
      </div>
      <div className="flex items-center gap-2 py-1 justify-center">
        <div className="h-px flex-1 bg-dashed border-t border-dashed border-slate-300" />
        <div className="text-xs text-green-600 font-semibold px-2 py-0.5 bg-green-50 rounded-full">{distance}</div>
        <div className="h-px flex-1 border-t border-dashed border-slate-300" />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-xs">L</div>
          <span className="text-xs font-medium">{receiver}</span>
          <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full">Receiver</span>
        </div>
      </div>
    </div>
  );
}

/* ─── TUTORIAL 1: Register & Login ─────────────────────────────────────── */
const t1Steps: TutorialStep[] = [
  {
    title: "Welcome! Choose your language",
    titleTe: "స్వాగతం! మీ భాషను ఎంచుకోండి",
    desc: "When you first open the app, you'll see a language selection screen. Choose English or Telugu — the whole site changes instantly.",
    descTe: "మీరు మొదట యాప్ తెరిచినప్పుడు, భాష ఎంపిక స్క్రీన్ కనిపిస్తుంది. ఇంగ్లీష్ లేదా తెలుగు ఎంచుకోండి.",
    duration: 4500,
    visual: (
      <Screen bg="bg-blue-700">
        <div className="text-center py-4">
          <div className="text-white text-2xl font-bold mb-1">CDC</div>
          <div className="text-blue-100 text-xs mb-4">Community Donation Connect</div>
          <div className="space-y-2">
            <div className="bg-white text-blue-700 rounded-lg py-2 text-xs font-semibold shadow">English</div>
            <div className="bg-white/20 text-white rounded-lg py-2 text-xs font-semibold border border-white/40">తెలుగు</div>
          </div>
        </div>
      </Screen>
    ),
  },
  {
    title: "Click Register to create an account",
    titleTe: "ఖాతా సృష్టించడానికి Register క్లిక్ చేయండి",
    desc: "On the top-right corner of the home page, click 'Register' to begin. It only takes 2 minutes.",
    descTe: "హోమ్ పేజ్ యొక్క కుడి వైపు పైన 'Register' క్లిక్ చేయండి. ఇది కేవలం 2 నిమిషాలు పడుతుంది.",
    duration: 4000,
    visual: (
      <Screen>
        <NavBar />
        <div className="text-center py-6">
          <div className="text-lg font-bold mb-1">Donate Locally.</div>
          <div className="text-lg font-bold">Help Directly.</div>
          <div className="text-xs text-slate-500 mt-2">Join thousands of neighbors</div>
        </div>
        <div className="flex gap-2 mt-2">
          <Btn label="I Want To Donate" color="bg-blue-700 text-white" />
          <Btn label="I Need Help" color="bg-green-600 text-white" />
        </div>
      </Screen>
    ),
  },
  {
    title: "Fill in your name and email",
    titleTe: "మీ పేరు మరియు ఇమెయిల్ నమోదు చేయండి",
    desc: "Example: Name is Ramesh Kumar, age 28, a teacher from Hyderabad. Enter your real email — we'll use it to contact you when matched.",
    descTe: "ఉదాహరణ: పేరు రమేష్ కుమార్, వయసు 28, హైదరాబాద్ నుండి ఒక ఉపాధ్యాయుడు. మీ నిజమైన ఇమెయిల్ నమోదు చేయండి.",
    duration: 5000,
    visual: (
      <Screen>
        <div className="text-sm font-bold text-center mb-3 text-blue-700">Create Account</div>
        <FormField label="Full Name" value="Ramesh Kumar" highlight />
        <FormField label="Email" value="ramesh@example.com" />
        <FormField label="Phone" value="" />
        <Btn label="Continue →" color="bg-blue-700 text-white" />
      </Screen>
    ),
  },
  {
    title: "Set your location and password",
    titleTe: "మీ స్థానం మరియు పాస్‌వర్డ్ సెట్ చేయండి",
    desc: "Enter your village/district and create a strong password. Your location helps the matching engine find donors and receivers near you.",
    descTe: "మీ గ్రామం/జిల్లా నమోదు చేయండి మరియు బలమైన పాస్‌వర్డ్ సృష్టించండి. మీ స్థానం సమీప సహాయకులను కనుగొనడంలో సహాయపడుతుంది.",
    duration: 4500,
    visual: (
      <Screen>
        <div className="text-sm font-bold text-center mb-3 text-blue-700">Your Details</div>
        <FormField label="Village / Area" value="Kukatpally" />
        <FormField label="District" value="Hyderabad" highlight />
        <FormField label="Password" value="••••••••" />
        <Btn label="Create Account" color="bg-blue-700 text-white" pulse />
      </Screen>
    ),
  },
  {
    title: "Account created successfully!",
    titleTe: "ఖాతా విజయవంతంగా సృష్టించబడింది!",
    desc: "You'll see a success notification. Your account is active immediately — no waiting for email verification.",
    descTe: "మీకు విజయవంతమైన నోటిఫికేషన్ వస్తుంది. మీ ఖాతా వెంటనే సక్రియమవుతుంది — ఇమెయిల్ ధృవీకరణ కోసం వేచి ఉండాల్సిన అవసరం లేదు.",
    duration: 4000,
    visual: (
      <Screen>
        <div className="space-y-3">
          <Notification msg="Account created! Welcome to CDC, Ramesh." type="success" />
          <div className="bg-white rounded-xl border p-3 text-center">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl mx-auto mb-1">👨‍🏫</div>
            <div className="font-semibold text-sm">Ramesh Kumar</div>
            <div className="text-xs text-slate-500">ramesh@example.com</div>
            <TrustBadge score={0} level="New Donor" />
          </div>
        </div>
      </Screen>
    ),
  },
  {
    title: "Login anytime with your credentials",
    titleTe: "మీ వివరాలతో ఎప్పుడైనా లాగిన్ అవ్వండి",
    desc: "Click Login, enter your email and password, and you're in. Your session stays active as you navigate the site.",
    descTe: "Login క్లిక్ చేయండి, మీ ఇమెయిల్ మరియు పాస్‌వర్డ్ నమోదు చేయండి. మీరు సైట్‌లో తిరుగుతున్నప్పుడు మీ సెషన్ సక్రియంగా ఉంటుంది.",
    duration: 4000,
    visual: (
      <Screen>
        <div className="text-sm font-bold text-center mb-3 text-blue-700">Login</div>
        <FormField label="Email" value="ramesh@example.com" />
        <FormField label="Password" value="••••••••" highlight />
        <Btn label="Login" color="bg-blue-700 text-white" pulse />
        <div className="text-center text-xs text-slate-500 mt-2">Don't have an account? Register</div>
      </Screen>
    ),
  },
  {
    title: "Explore your Dashboard",
    titleTe: "మీ డ్యాష్‌బోర్డ్‌ను అన్వేషించండి",
    desc: "After login, visit your Profile to see your Trust Score, total donations, reviews received, and your community badge level.",
    descTe: "లాగిన్ తర్వాత, మీ ప్రొఫైల్‌ను సందర్శించి మీ ట్రస్ట్ స్కోర్, మొత్తం దానాలు మరియు సమీక్షలు చూడండి.",
    duration: 4500,
    visual: (
      <Screen>
        <ProfileCard name="Ramesh Kumar" score={0} level="New Donor" badge="👨‍🏫" />
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {[["0", "Donations"], ["0", "Reviews"], ["0", "Matches"], ["12", "Communities"]].map(([v, l]) => (
            <div key={l} className="bg-white rounded-lg border p-2 text-center">
              <div className="text-sm font-bold text-blue-700">{v}</div>
              <div className="text-xs text-slate-500">{l}</div>
            </div>
          ))}
        </div>
      </Screen>
    ),
  },
];

/* ─── TUTORIAL 2: Donate an Item ───────────────────────────────────────── */
const t2Steps: TutorialStep[] = [
  {
    title: "Click 'I Want To Donate'",
    titleTe: "'I Want To Donate' క్లిక్ చేయండి",
    desc: "Ramesh wants to donate a Dell laptop he no longer needs. From the home page, he clicks 'I Want To Donate'.",
    descTe: "రమేష్ తనకు అవసరం లేని Dell ల్యాప్‌టాప్‌ను దానం చేయాలనుకుంటున్నాడు. హోమ్ పేజ్ నుండి 'I Want To Donate' క్లిక్ చేస్తాడు.",
    duration: 4000,
    visual: (
      <Screen>
        <NavBar />
        <div className="text-center py-2">
          <div className="font-bold text-sm">Donate Locally. Help Directly.</div>
          <div className="text-xs text-slate-500 mt-1">Join thousands of neighbors</div>
        </div>
        <div className="space-y-2 mt-3">
          <Btn label="I Want To Donate" color="bg-blue-700 text-white" pulse />
          <Btn label="I Need Help" color="bg-green-600 text-white" />
        </div>
      </Screen>
    ),
  },
  {
    title: "Choose category: Electronics",
    titleTe: "వర్గం ఎంచుకోండి: Electronics",
    desc: "The donate form opens. Ramesh selects 'Electronics' because he's donating a laptop. The icon and name are clearly visible.",
    descTe: "దానం ఫారం తెరుచుకుంటుంది. రమేష్ ల్యాప్‌టాప్ దానం చేస్తున్నందున 'Electronics' ఎంచుకుంటాడు.",
    duration: 4500,
    visual: (
      <Screen>
        <div className="font-semibold text-xs mb-2">Select Category</div>
        <CategoryGrid selected="Electronics" />
        <div className="mt-2 text-xs text-blue-600 font-medium">Selected: Electronics</div>
      </Screen>
    ),
  },
  {
    title: "Enter item details",
    titleTe: "వస్తువు వివరాలు నమోదు చేయండి",
    desc: "Ramesh enters 'Dell Laptop', sets condition to 'Excellent', and quantity to 1. Be accurate — receivers will check this against photos.",
    descTe: "రమేష్ 'Dell Laptop' నమోదు చేస్తాడు, స్థితి 'Excellent' మరియు పరిమాణం 1 గా సెట్ చేస్తాడు.",
    duration: 4500,
    visual: (
      <Screen>
        <div className="font-semibold text-xs mb-2">Item Details</div>
        <FormField label="Item Name" value="Dell Laptop" highlight />
        <div className="text-xs text-slate-500 mb-1">Condition</div>
        <div className="flex gap-1 mb-2">
          {["Like New", "Excellent", "Good"].map((c) => (
            <div key={c} className={`text-xs px-2 py-1 rounded border ${c === "Excellent" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200"}`}>{c}</div>
          ))}
        </div>
        <FormField label="Quantity" value="1" />
      </Screen>
    ),
  },
  {
    title: "Upload photos as proof",
    titleTe: "రుజువుగా ఫోటోలు అప్‌లోడ్ చేయండి",
    desc: "Upload 2–3 clear photos of the item. Receivers can see the actual condition before accepting. Good photos build trust faster.",
    descTe: "వస్తువు యొక్క 2-3 స్పష్టమైన ఫోటోలు అప్‌లోడ్ చేయండి. మంచి ఫోటోలు నమ్మకాన్ని వేగంగా నిర్మిస్తాయి.",
    duration: 4500,
    visual: (
      <Screen>
        <div className="font-semibold text-xs mb-2">Upload Photos</div>
        <div className="grid grid-cols-3 gap-1">
          {["📸 Front", "📸 Side", "📸 Screen"].map((p) => (
            <div key={p} className="aspect-square bg-blue-50 border-2 border-dashed border-blue-200 rounded-lg flex flex-col items-center justify-center">
              <span className="text-base">🖼️</span>
              <span className="text-xs text-slate-500 mt-0.5">{p}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 text-xs text-green-600">3 photos uploaded</div>
      </Screen>
    ),
  },
  {
    title: "Set location using GPS",
    titleTe: "GPS ఉపయోగించి స్థానం సెట్ చేయండి",
    desc: "Tap 'Use Current Location (GPS)' to auto-detect your area. Ramesh is in Kukatpally, Hyderabad — this fills automatically.",
    descTe: "'Use Current Location (GPS)' నొక్కి మీ ప్రాంతాన్ని స్వయంచాలకంగా గుర్తించండి. స్థానం స్వయంచాలకంగా నింపుతుంది.",
    duration: 4500,
    visual: (
      <Screen>
        <div className="font-semibold text-xs mb-2">Location</div>
        <div className="border border-blue-300 rounded-lg py-2 text-center text-xs text-blue-700 bg-blue-50 mb-2 font-medium">
          📍 Use Current Location (GPS)
        </div>
        <div className="flex items-center gap-1 bg-green-50 border border-green-200 rounded px-2 py-1 text-xs text-green-800 mb-2">
          <span>📍</span> Kukatpally, Hyderabad
        </div>
        <div className="text-xs text-slate-500 mb-1">Pickup Radius: <span className="font-bold text-blue-700">10 km</span></div>
        <input type="range" min={1} max={50} defaultValue={10} className="w-full accent-blue-600" readOnly />
      </Screen>
    ),
  },
  {
    title: "Submit your donation",
    titleTe: "మీ దానాన్ని సమర్పించండి",
    desc: "Click 'Publish Donation'. The system instantly lists your laptop and begins scanning for receivers within 10 km.",
    descTe: "'Publish Donation' క్లిక్ చేయండి. సిస్టమ్ వెంటనే మీ ల్యాప్‌టాప్‌ను జాబితా చేస్తుంది.",
    duration: 4000,
    visual: (
      <Screen>
        <Notification msg="Donation Successfully Posted! Scanning for receivers..." type="success" />
        <div className="mt-2 bg-white rounded-xl border p-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">📱</span>
            <div>
              <div className="font-semibold text-xs">Dell Laptop</div>
              <div className="text-xs text-slate-500">Electronics · Excellent · 1 unit</div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <span>📍</span> Kukatpally · 10 km radius
          </div>
          <div className="mt-1 text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full w-fit font-medium">Active</div>
        </div>
      </Screen>
    ),
  },
  {
    title: "Accept your match and complete exchange",
    titleTe: "మీ మ్యాచ్‌ని అంగీకరించి మార్పిడి పూర్తి చేయండి",
    desc: "You receive a notification when matched with Lakshmi (3.2 km away). Accept the match — contact details are revealed only after both accept.",
    descTe: "లక్ష్మీ (3.2 కి.మీ దూరంలో) తో మ్యాచ్ అయినప్పుడు నోటిఫికేషన్ వస్తుంది. మ్యాచ్‌ని అంగీకరించిన తర్వాత సంప్రదింపు వివరాలు వెల్లడవుతాయి.",
    duration: 5000,
    visual: (
      <Screen>
        <Notification msg="Laptop request found nearby! Lakshmi, 3.2 km away." type="match" />
        <div className="mt-2">
          <MatchCard donor="Ramesh (You)" receiver="Lakshmi" distance="3.2 km" />
        </div>
        <div className="mt-2 flex gap-1">
          <Btn label="Accept Match" color="bg-green-600 text-white" pulse />
          <Btn label="Decline" color="bg-slate-100 text-slate-600" />
        </div>
      </Screen>
    ),
  },
  {
    title: "Earn trust points after exchange",
    titleTe: "మార్పిడి తర్వాత ట్రస్ట్ పాయింట్లు సంపాదించండి",
    desc: "After handing over the laptop, Lakshmi leaves a review. Each 5-star review earns Ramesh 20 trust points — his score grows with every donation.",
    descTe: "ల్యాప్‌టాప్ అందజేసిన తర్వాత, లక్ష్మీ సమీక్ష రాస్తుంది. ప్రతి 5-స్టార్ సమీక్ష రమేష్‌కు 20 ట్రస్ట్ పాయింట్లు ఇస్తుంది.",
    duration: 4500,
    visual: (
      <Screen>
        <div className="space-y-2">
          <div className="bg-white rounded-lg border p-2">
            <div className="text-xs font-semibold mb-1">Review from Lakshmi</div>
            <div className="flex items-center gap-2 text-xs mb-0.5">Item Quality <StarRow stars={5} /></div>
            <div className="flex items-center gap-2 text-xs mb-0.5">Condition Accuracy <StarRow stars={5} /></div>
            <div className="flex items-center gap-2 text-xs">Overall <StarRow stars={5} /></div>
            <div className="mt-1 text-xs text-slate-600 italic">"The laptop worked perfectly!"</div>
          </div>
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5">
            <span className="text-base">🏆</span>
            <div>
              <div className="text-xs font-semibold">Trust Score: 0 → 20</div>
              <div className="text-xs text-slate-500">+20 points earned</div>
            </div>
          </div>
        </div>
      </Screen>
    ),
  },
];

/* ─── TUTORIAL 3: Receive an Item ──────────────────────────────────────── */
const t3Steps: TutorialStep[] = [
  {
    title: "Click 'I Need Help'",
    titleTe: "'I Need Help' క్లిక్ చేయండి",
    desc: "Lakshmi is a student who needs a laptop for her studies. She logs in and clicks 'I Need Help' from the home page.",
    descTe: "లక్ష్మీ తన చదువుకు ల్యాప్‌టాప్ అవసరమైన విద్యార్థి. ఆమె లాగిన్ అయి హోమ్ పేజ్ నుండి 'I Need Help' క్లిక్ చేస్తుంది.",
    duration: 4000,
    visual: (
      <Screen>
        <div className="flex items-center gap-2 bg-white border-b px-2 py-1.5 mb-2 -mx-3 -mt-3 rounded-t-xl">
          <span className="text-xs font-bold text-blue-700">CDC</span>
          <span className="text-xs text-slate-400 ml-auto">Hi, Lakshmi</span>
          <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-xs">👩‍🎓</div>
        </div>
        <div className="space-y-2 mt-4">
          <Btn label="I Want To Donate" color="bg-blue-700 text-white" />
          <Btn label="I Need Help" color="bg-green-600 text-white" pulse />
        </div>
      </Screen>
    ),
  },
  {
    title: "Select category and describe your need",
    titleTe: "వర్గం ఎంచుకుని మీ అవసరాన్ని వివరించండి",
    desc: "Lakshmi selects 'Electronics', enters 'Laptop', and explains: 'I am a final-year student preparing for exams and need a laptop for studying.'",
    descTe: "లక్ష్మీ 'Electronics' ఎంచుకుంటుంది, 'Laptop' నమోదు చేస్తుంది మరియు తన అవసరాన్ని వివరిస్తుంది.",
    duration: 5000,
    visual: (
      <Screen>
        <CategoryGrid selected="Electronics" />
        <div className="mt-2 space-y-1.5">
          <FormField label="What do you need?" value="Laptop" />
          <div className="text-xs text-slate-500 mb-0.5">Why do you need it?</div>
          <div className="border rounded px-2 py-1.5 text-xs text-slate-700 bg-blue-50 border-blue-200">
            I am a final-year student preparing for exams...
            <span className="inline-block w-0.5 h-3 bg-blue-600 ml-0.5 animate-pulse" />
          </div>
        </div>
      </Screen>
    ),
  },
  {
    title: "Set urgency level",
    titleTe: "అత్యవసర స్థాయిని సెట్ చేయండి",
    desc: "Lakshmi marks urgency as 'High' — her exams are next month. Critical urgency requests are shown first to donors in the matching engine.",
    descTe: "లక్ష్మీ అత్యవసరతను 'High' గా గుర్తిస్తుంది. అత్యవసర అభ్యర్థనలు మ్యాచింగ్ ఇంజిన్‌లో మొదటగా చూపబడతాయి.",
    duration: 4500,
    visual: (
      <Screen>
        <div className="text-xs font-semibold mb-2">Urgency Level</div>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { u: "Low", c: "border-green-300 bg-green-50 text-green-700" },
            { u: "Medium", c: "border-yellow-300 bg-yellow-50 text-yellow-700" },
            { u: "High", c: "border-orange-400 bg-orange-50 text-orange-700" },
            { u: "Critical", c: "border-red-400 bg-red-50 text-red-700" },
          ].map(({ u, c }) => (
            <div key={u} className={`border-2 rounded-lg p-2 text-center text-xs font-semibold ${u === "High" ? c + " shadow-sm" : "border-slate-200 text-slate-400"}`}>{u}</div>
          ))}
        </div>
        <div className="mt-2 text-xs text-orange-600 font-medium">High urgency — shown to donors first</div>
      </Screen>
    ),
  },
  {
    title: "Use GPS to set your location",
    titleTe: "మీ స్థానాన్ని సెట్ చేయడానికి GPS ఉపయోగించండి",
    desc: "Lakshmi uses GPS to set her location to Kondapur (3.2 km from Ramesh). She sets search radius to 5 km.",
    descTe: "లక్ష్మీ GPS ఉపయోగించి తన స్థానాన్ని కొండాపూర్‌కు సెట్ చేస్తుంది. ఆమె శోధన వ్యాసార్థాన్ని 5 కి.మీ గా సెట్ చేస్తుంది.",
    duration: 4500,
    visual: (
      <Screen>
        <div className="font-semibold text-xs mb-2">Your Location</div>
        <div className="border border-blue-300 rounded-lg py-2 text-center text-xs text-blue-700 bg-blue-50 mb-2">
          📍 Use Current Location (GPS)
        </div>
        <div className="flex items-center gap-1 bg-green-50 border border-green-200 rounded px-2 py-1 text-xs text-green-800 mb-2">
          <span>📍</span> Kondapur, Hyderabad
        </div>
        <div className="text-xs text-slate-500 mb-1">Search Radius: <span className="font-bold text-blue-700">5 km</span></div>
        <input type="range" min={1} max={50} defaultValue={5} className="w-full accent-blue-600" readOnly />
      </Screen>
    ),
  },
  {
    title: "Request submitted — waiting for a match",
    titleTe: "అభ్యర్థన సమర్పించబడింది — మ్యాచ్ కోసం వేచి ఉంది",
    desc: "After submitting, Lakshmi waits. The smart matching engine runs automatically. High urgency items are given priority in search results.",
    descTe: "సమర్పించిన తర్వాత, లక్ష్మీ వేచి ఉంటుంది. స్మార్ట్ మ్యాచింగ్ ఇంజిన్ స్వయంచాలకంగా పని చేస్తుంది.",
    duration: 4000,
    visual: (
      <Screen>
        <Notification msg="Request Successfully Created! Scanning for donors..." type="success" />
        <div className="mt-2 bg-white rounded-xl border p-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">📱</span>
            <div>
              <div className="font-semibold text-xs">Laptop needed</div>
              <div className="text-xs text-slate-500">Electronics · High urgency</div>
            </div>
          </div>
          <div className="text-xs text-orange-600 font-medium px-2 py-0.5 bg-orange-50 rounded-full w-fit">High Priority</div>
        </div>
        <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          Matching engine searching...
        </div>
      </Screen>
    ),
  },
  {
    title: "Check the donor's trust score before accepting",
    titleTe: "అంగీకరించే ముందు దాత యొక్క ట్రస్ట్ స్కోర్ తనిఖీ చేయండి",
    desc: "Lakshmi sees Ramesh has 245 trust points — Highly Trusted. She can view his badge and past donations before accepting the match.",
    descTe: "లక్ష్మీ రమేష్‌కు 245 ట్రస్ట్ పాయింట్లు ఉన్నాయని చూస్తుంది — Highly Trusted. మ్యాచ్ అంగీకరించే ముందు అతని బ్యాడ్జ్ మరియు గత దానాలు చూడవచ్చు.",
    duration: 5000,
    visual: (
      <Screen>
        <Notification msg="Match found! Dell Laptop from Ramesh, 3.2 km away." type="match" />
        <div className="mt-2 bg-white rounded-xl border p-2">
          <div className="font-semibold text-xs mb-1.5">Donor Profile</div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">👨‍🏫</div>
            <div>
              <div className="text-xs font-medium">Ramesh Kumar</div>
              <div className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded-full w-fit">Highly Trusted</div>
            </div>
            <div className="ml-auto text-sm font-bold text-purple-700">245 pts</div>
          </div>
          <div className="text-xs text-slate-500 mt-1">12 donations completed · 4.9 avg rating</div>
        </div>
      </Screen>
    ),
  },
  {
    title: "Contact revealed — collect your item",
    titleTe: "సంప్రదింపు వెల్లడి — మీ వస్తువు సేకరించండి",
    desc: "Once both Ramesh and Lakshmi accept, their phone numbers are revealed. They arrange pickup. Lakshmi collects the laptop.",
    descTe: "రమేష్ మరియు లక్ష్మీ ఇద్దరూ అంగీకరించిన తర్వాత, వారి ఫోన్ నంబర్లు వెల్లడవుతాయి. వారు పికప్ ఏర్పాటు చేసుకుంటారు.",
    duration: 5000,
    visual: (
      <Screen>
        <div className="space-y-2">
          <Notification msg="Both accepted! Contact details revealed." type="success" />
          <div className="bg-white rounded-xl border p-2 space-y-1">
            <div className="text-xs font-semibold">Contact Information</div>
            <div className="flex items-center gap-2 text-xs">
              <span>📞</span>
              <span className="font-medium">+91 98765 43210</span>
              <span className="text-slate-500">(Ramesh)</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">🔒 Contact hidden until both accepted</div>
          </div>
          <Btn label="Confirm Exchange Done" color="bg-green-600 text-white" pulse />
        </div>
      </Screen>
    ),
  },
  {
    title: "Leave a review for the donor",
    titleTe: "దాతకు సమీక్ష రాయండి",
    desc: "After receiving the laptop, Lakshmi leaves a review — 5 stars on quality, condition, and satisfaction. This helps Ramesh earn trust points.",
    descTe: "ల్యాప్‌టాప్ అందుకున్న తర్వాత, లక్ష్మీ సమీక్ష రాస్తుంది. ఇది రమేష్ ట్రస్ట్ పాయింట్లు సంపాదించడంలో సహాయపడుతుంది.",
    duration: 5000,
    visual: (
      <Screen>
        <div className="text-xs font-semibold mb-2">Rate your experience</div>
        <div className="bg-white rounded-lg border p-2 space-y-2">
          {["Item Quality", "Condition Match", "Overall Satisfaction"].map((label) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-xs text-slate-600">{label}</span>
              <StarRow stars={5} />
            </div>
          ))}
          <div className="border-t pt-1">
            <div className="text-xs text-slate-600 italic">"The laptop worked perfectly and matched the uploaded photos!"</div>
          </div>
        </div>
        <Btn label="Submit Review" color="bg-blue-700 text-white" pulse />
      </Screen>
    ),
  },
];

/* ─── TUTORIAL 4: Smart Matching System ────────────────────────────────── */
const t4Steps: TutorialStep[] = [
  {
    title: "What is the smart matching engine?",
    titleTe: "స్మార్ట్ మ్యాచింగ్ ఇంజిన్ అంటే ఏమిటి?",
    desc: "The matching engine automatically finds the best donor-receiver pairs in your area. It runs every time a new donation or request is posted.",
    descTe: "మ్యాచింగ్ ఇంజిన్ స్వయంచాలకంగా మీ ప్రాంతంలో ఉత్తమ దాత-గ్రహీత జంటలను కనుగొంటుంది.",
    duration: 4500,
    visual: (
      <Screen bg="bg-slate-50">
        <div className="text-center mb-3">
          <div className="text-2xl mb-1">🔍</div>
          <div className="text-xs font-bold text-blue-700">Smart Matching Engine</div>
          <div className="text-xs text-slate-500">Powered by location + trust + category</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {["Same Category", "Within Radius", "Trust Score", "Urgency Level"].map((f) => (
            <div key={f} className="bg-white rounded-lg border p-1.5 text-center text-xs font-medium flex flex-col items-center gap-1">
              <span>{f === "Same Category" ? "📦" : f === "Within Radius" ? "📍" : f === "Trust Score" ? "⭐" : "⚡"}</span>
              {f}
            </div>
          ))}
        </div>
      </Screen>
    ),
  },
  {
    title: "Step 1: Filter by same category",
    titleTe: "దశ 1: ఒకే వర్గం ద్వారా ఫిల్టర్ చేయండి",
    desc: "The engine first checks: does the donor's category match the receiver's request? Ramesh donated a laptop (Electronics) — Lakshmi requested Electronics. Match!",
    descTe: "ఇంజిన్ మొదట తనిఖీ చేస్తుంది: దాత వర్గం గ్రహీత అభ్యర్థనతో సరిపోలుతుందా? రమేష్ Electronics, లక్ష్మీ Electronics అభ్యర్థించింది — సరిపోలింది!",
    duration: 5000,
    visual: (
      <Screen>
        <div className="text-xs font-semibold mb-2">Category Match Check</div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-2 py-2">
            <div className="text-base">📱</div>
            <div>
              <div className="text-xs font-medium">Ramesh → Electronics</div>
              <div className="text-xs text-slate-500">Dell Laptop</div>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="text-lg text-green-500">↕</div>
          </div>
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-2 py-2">
            <div className="text-base">📱</div>
            <div>
              <div className="text-xs font-medium">Lakshmi → Electronics</div>
              <div className="text-xs text-slate-500">Laptop needed</div>
            </div>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-1 text-xs text-green-600 font-semibold">
          <span>✅</span> Category matches — proceed to distance check
        </div>
      </Screen>
    ),
  },
  {
    title: "Step 2: Calculate distance between them",
    titleTe: "దశ 2: వారి మధ్య దూరం లెక్కించండి",
    desc: "The engine calculates distance using GPS coordinates (Haversine formula). Ramesh: Kukatpally. Lakshmi: Kondapur. Distance: 3.2 km — within Lakshmi's 5 km radius!",
    descTe: "ఇంజిన్ GPS కోఆర్డినేట్‌లను ఉపయోగించి దూరం లెక్కిస్తుంది. రమేష్: కుకట్‌పల్లి. లక్ష్మీ: కొండాపూర్. దూరం: 3.2 కి.మీ — అందుబాటులో ఉంది!",
    duration: 5000,
    visual: (
      <Screen bg="bg-blue-50">
        <div className="text-xs font-semibold mb-2 text-center">Distance Calculation</div>
        <div className="relative bg-white rounded-xl border p-3">
          <div className="flex items-start justify-between mb-3">
            <div className="text-center">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm mx-auto">👨‍🏫</div>
              <div className="text-xs font-medium mt-1">Ramesh</div>
              <div className="text-xs text-slate-500">Kukatpally</div>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center pt-2">
              <div className="w-full h-px bg-dashed border-t-2 border-dashed border-green-400" />
              <div className="text-xs font-bold text-green-600 mt-1 bg-green-50 px-2 py-0.5 rounded-full">3.2 km</div>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-sm mx-auto">👩‍🎓</div>
              <div className="text-xs font-medium mt-1">Lakshmi</div>
              <div className="text-xs text-slate-500">Kondapur</div>
            </div>
          </div>
          <div className="text-xs text-green-600 text-center font-medium">✅ Within 5 km radius — Match!</div>
        </div>
      </Screen>
    ),
  },
  {
    title: "Step 3: Compare trust scores",
    titleTe: "దశ 3: ట్రస్ట్ స్కోర్లను పోల్చండి",
    desc: "Higher trust score donors are shown first. Ramesh has 245 points (Highly Trusted) — so he appears at the top of Lakshmi's match results.",
    descTe: "అధిక ట్రస్ట్ స్కోర్ కలిగిన దాతలు మొదట చూపబడతారు. రమేష్‌కు 245 పాయింట్లు ఉన్నాయి — కాబట్టి అతను లక్ష్మీ మ్యాచ్ ఫలితాల పైభాగంలో కనిపిస్తాడు.",
    duration: 4500,
    visual: (
      <Screen>
        <div className="text-xs font-semibold mb-2">Nearby Donors — Ranked by Trust</div>
        <div className="space-y-1.5">
          {[
            { name: "Ramesh Kumar", pts: 245, level: "Highly Trusted", dist: "3.2 km", color: "bg-purple-50 border-purple-200" },
            { name: "Suresh R.", pts: 120, level: "Trusted", dist: "4.8 km", color: "bg-blue-50 border-blue-200" },
            { name: "Anand M.", pts: 30, level: "New Donor", dist: "4.2 km", color: "bg-slate-50 border-slate-200" },
          ].map((d, i) => (
            <div key={d.name} className={`border rounded-lg px-2 py-1.5 ${d.color} flex items-center gap-2`}>
              <span className="text-xs font-bold text-slate-400">#{i + 1}</span>
              <div className="flex-1">
                <div className="text-xs font-medium">{d.name}</div>
                <div className="text-xs text-slate-500">{d.level} · {d.dist}</div>
              </div>
              <div className="text-xs font-bold text-purple-700">{d.pts}pts</div>
            </div>
          ))}
        </div>
      </Screen>
    ),
  },
  {
    title: "Real-time notifications sent to both",
    titleTe: "ఇద్దరికీ రియల్-టైమ్ నోటిఫికేషన్లు పంపబడ్డాయి",
    desc: "Both Ramesh and Lakshmi instantly receive notifications on their screens. The system shows first name and area only — phone and email remain hidden.",
    descTe: "రమేష్ మరియు లక్ష్మీ ఇద్దరూ వెంటనే నోటిఫికేషన్లు అందుకుంటారు. ఫోన్ మరియు ఇమెయిల్ దాచబడి ఉంటాయి.",
    duration: 5000,
    visual: (
      <Screen>
        <div className="space-y-2">
          <div className="text-xs font-semibold mb-1">Notifications Sent</div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
            <div className="text-xs font-medium text-blue-700 mb-0.5">To Ramesh (Donor)</div>
            <div className="text-xs text-slate-700">🔔 Laptop request found nearby. Lakshmi in Kondapur needs your item.</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-2">
            <div className="text-xs font-medium text-green-700 mb-0.5">To Lakshmi (Receiver)</div>
            <div className="text-xs text-slate-700">🔔 Laptop donor found nearby. Ramesh in Kukatpally can help you.</div>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <span>🔒</span> Phone &amp; email hidden until both accept
          </div>
        </div>
      </Screen>
    ),
  },
  {
    title: "Privacy: Contact revealed after both accept",
    titleTe: "గোপ్యత: ఇద్దరూ అంగీకరించిన తర్వాత సంప్రదింపు వెల్లడి",
    desc: "Only after BOTH Ramesh and Lakshmi click 'Accept' does the system reveal their contact information. This protects both parties.",
    descTe: "రమేష్ మరియు లక్ష్మీ ఇద్దరూ 'Accept' క్లిక్ చేసిన తర్వాత మాత్రమే సిస్టమ్ వారి సంప్రదింపు సమాచారాన్ని వెల్లడిస్తుంది.",
    duration: 5000,
    visual: (
      <Screen>
        <div className="space-y-2">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
            <div className="text-xs font-semibold text-amber-700 mb-1">Before acceptance</div>
            <div className="flex items-center gap-2 text-xs">
              <span>📞</span>
              <span className="bg-slate-200 text-slate-200 rounded px-8 text-xs select-none">hidden</span>
              <span className="text-slate-400">Phone number</span>
            </div>
          </div>
          <div className="flex justify-center text-lg">↓</div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-2">
            <div className="text-xs font-semibold text-green-700 mb-1">After both accept</div>
            <div className="flex items-center gap-2 text-xs">
              <span>📞</span>
              <span className="font-medium text-green-800">+91 98765 43210</span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Phone Number Revealed ✅</div>
          </div>
        </div>
      </Screen>
    ),
  },
];

/* ─── TUTORIAL 5: Trust Score & Reviews ────────────────────────────────── */
const t5Steps: TutorialStep[] = [
  {
    title: "What is the Trust Score?",
    titleTe: "ట్రస్ట్ స్కోర్ అంటే ఏమిటి?",
    desc: "The trust score is your community reputation — it grows each time you complete a donation and receive a positive review from the receiver.",
    descTe: "ట్రస్ట్ స్కోర్ మీ సమాజ కీర్తి — మీరు దానం పూర్తి చేసి సానుకూల సమీక్ష పొందిన ప్రతిసారీ అది పెరుగుతుంది.",
    duration: 4500,
    visual: (
      <Screen>
        <div className="text-center mb-3">
          <div className="text-3xl mb-1">⭐</div>
          <div className="text-xs font-bold text-blue-700">Trust Score System</div>
          <div className="text-xs text-slate-500">Earn points by donating</div>
        </div>
        <div className="space-y-1.5">
          {[
            { level: "New Donor", range: "0 – 50 pts", color: "bg-slate-100 text-slate-600", icon: "🆕" },
            { level: "Trusted", range: "51 – 150 pts", color: "bg-blue-100 text-blue-700", icon: "⭐" },
            { level: "Highly Trusted", range: "151 – 300 pts", color: "bg-purple-100 text-purple-700", icon: "🏅" },
            { level: "Champion", range: "301+ pts", color: "bg-amber-100 text-amber-700", icon: "🏆" },
          ].map(({ level, range, color, icon }) => (
            <div key={level} className={`flex items-center gap-2 px-2 py-1 rounded-lg ${color}`}>
              <span>{icon}</span>
              <span className="text-xs font-semibold">{level}</span>
              <span className="text-xs ml-auto">{range}</span>
            </div>
          ))}
        </div>
      </Screen>
    ),
  },
  {
    title: "How points are calculated per review",
    titleTe: "ప్రతి సమీక్షకు పాయింట్లు ఎలా లెక్కించబడతాయి",
    desc: "After each completed donation, the receiver rates you on 3 criteria. The average rating × 4 = points earned. A 5-star review = 20 points!",
    descTe: "ప్రతి పూర్తయిన దానం తర్వాత, గ్రహీత 3 ప్రమాణాలపై మిమ్మల్ని రేట్ చేస్తారు. సగటు రేటింగ్ × 4 = సంపాదించిన పాయింట్లు.",
    duration: 5000,
    visual: (
      <Screen>
        <div className="text-xs font-semibold mb-2">Points Formula</div>
        <div className="bg-white rounded-lg border p-2 space-y-1.5">
          {[
            { label: "Item Quality", stars: 5 },
            { label: "Condition Match", stars: 5 },
            { label: "Overall Satisfaction", stars: 5 },
          ].map(({ label, stars }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-xs text-slate-600">{label}</span>
              <StarRow stars={stars} />
            </div>
          ))}
          <div className="border-t pt-1.5 flex items-center justify-between">
            <span className="text-xs font-semibold">Average: 5.0 × 4</span>
            <span className="text-xs font-bold text-green-600">= +20 pts</span>
          </div>
        </div>
        <div className="mt-2 text-xs text-slate-500 text-center">Each donation can earn up to 20 points</div>
      </Screen>
    ),
  },
  {
    title: "Donor profile example: Ramesh Kumar",
    titleTe: "దాత ప్రొఫైల్ ఉదాహరణ: రమేష్ కుమార్",
    desc: "After 12 donations with excellent reviews, Ramesh has 245 trust points. He's 'Highly Trusted' — receivers can see this before accepting a match.",
    descTe: "12 దానాలు మరియు అద్భుతమైన సమీక్షల తర్వాత, రమేష్‌కు 245 ట్రస్ట్ పాయింట్లు ఉన్నాయి. అతను 'Highly Trusted' — గ్రహీతలు మ్యాచ్ అంగీకరించే ముందు ఇది చూడవచ్చు.",
    duration: 5000,
    visual: (
      <Screen>
        <ProfileCard name="Ramesh Kumar" score={245} level="Highly Trusted" badge="👨‍🏫" />
        <div className="mt-2 grid grid-cols-3 gap-1">
          {[["12", "Donations"], ["4.9", "Avg Rating"], ["48", "Reviews"]].map(([v, l]) => (
            <div key={l} className="bg-white rounded-lg border p-1.5 text-center">
              <div className="text-sm font-bold text-blue-700">{v}</div>
              <div className="text-xs text-slate-500">{l}</div>
            </div>
          ))}
        </div>
        <div className="mt-2 bg-purple-50 border border-purple-200 rounded-lg px-2 py-1.5 text-xs text-purple-700">
          Highly Trusted Donor · 56 pts to Champion!
        </div>
      </Screen>
    ),
  },
  {
    title: "Live score update after donation",
    titleTe: "దానం తర్వాత స్కోర్ నవీకరణ",
    desc: "Watch Ramesh's score jump from 225 to 245 after Lakshmi's 5-star review. The leaderboard updates in real time.",
    descTe: "లక్ష్మీ 5-స్టార్ సమీక్ష తర్వాత రమేష్ స్కోర్ 225 నుండి 245 కు ఎలా వెళ్ళిందో చూడండి. లీడర్‌బోర్డ్ రియల్-టైమ్‌లో నవీకరించబడుతుంది.",
    duration: 5000,
    visual: (
      <Screen>
        <div className="space-y-2">
          <div className="text-xs font-semibold">Trust Score Update</div>
          <div className="bg-white rounded-xl border p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm">👨‍🏫</div>
              <div className="font-semibold text-xs">Ramesh Kumar</div>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <div className="text-center">
                <div className="text-lg font-bold text-slate-400 line-through">225</div>
                <div className="text-xs text-slate-400">Before</div>
              </div>
              <div className="text-xl text-green-500 font-bold">→</div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-700">245</div>
                <div className="text-xs text-slate-500">After</div>
              </div>
              <div className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">+20 pts</div>
            </div>
          </div>
          <Notification msg="Badge unlocked: Highly Trusted Donor!" type="success" />
        </div>
      </Screen>
    ),
  },
  {
    title: "Leaderboard — top community champions",
    titleTe: "లీడర్‌బోర్డ్ — అగ్ర సమాజ ఛాంపియన్లు",
    desc: "The Leaderboard shows the most active donors in your community. Earn Champion status (301+ pts) to appear at the top.",
    descTe: "లీడర్‌బోర్డ్ మీ సమాజంలో అత్యంత చురుకైన దాతలను చూపిస్తుంది. ఛాంపియన్ హోదా (301+ పాయింట్లు) పొందడానికి సంపాదించండి.",
    duration: 4500,
    visual: (
      <Screen>
        <div className="text-xs font-semibold mb-2 text-center">Community Leaderboard</div>
        <div className="space-y-1.5">
          {[
            { rank: 1, name: "Priya S.", pts: 420, level: "Champion", icon: "🏆" },
            { rank: 2, name: "Ramesh K.", pts: 245, level: "Highly Trusted", icon: "🏅" },
            { rank: 3, name: "Suresh R.", pts: 120, level: "Trusted", icon: "⭐" },
          ].map((d) => (
            <div key={d.rank} className="flex items-center gap-2 bg-white border rounded-lg px-2 py-1.5">
              <span className="text-base">{d.icon}</span>
              <span className="text-xs font-bold text-slate-400 w-4">#{d.rank}</span>
              <span className="text-xs font-medium flex-1">{d.name}</span>
              <div className="text-right">
                <div className="text-xs font-bold text-blue-700">{d.pts} pts</div>
                <div className="text-xs text-slate-400">{d.level}</div>
              </div>
            </div>
          ))}
        </div>
      </Screen>
    ),
  },
  {
    title: "Receiver ratings and history",
    titleTe: "గ్రహీత రేటింగ్‌లు మరియు చరిత్ర",
    desc: "Receivers also build a history of how many items they've received and reviews they've left for donors. A respectful community benefits everyone.",
    descTe: "గ్రహీతలు కూడా వారు పొందిన వస్తువుల సంఖ్య మరియు వారు దాతలకు రాసిన సమీక్షల చరిత్రను నిర్మిస్తారు.",
    duration: 4500,
    visual: (
      <Screen>
        <ProfileCard name="Lakshmi D." score={0} level="New Donor" badge="👩‍🎓" />
        <div className="mt-2 space-y-1.5">
          <div className="bg-white rounded-lg border p-2">
            <div className="text-xs font-semibold mb-1">Receiver History</div>
            <div className="space-y-1 text-xs text-slate-600">
              <div className="flex justify-between"><span>Items received</span><span className="font-bold">3</span></div>
              <div className="flex justify-between"><span>Reviews left for donors</span><span className="font-bold">3</span></div>
              <div className="flex justify-between"><span>Avg review given</span><span className="font-bold text-amber-500">5.0 ★</span></div>
            </div>
          </div>
          <div className="text-xs text-slate-500 text-center">Respectful participation builds a stronger community</div>
        </div>
      </Screen>
    ),
  },
];

/* ─── Exported tutorials array ─────────────────────────────────────────── */
export const TUTORIALS: Tutorial[] = [
  {
    id: "register-login",
    title: "Account Registration & Login",
    titleTe: "ఖాతా నమోదు & లాగిన్",
    subtitle: "Getting started with Community Donation Connect",
    subtitleTe: "కమ్యూనిటీ డొనేషన్ కనెక్ట్‌తో ప్రారంభించడం",
    category: "Getting Started",
    icon: "👤",
    color: "from-blue-500 to-indigo-600",
    steps: t1Steps,
  },
  {
    id: "donate-item",
    title: "How to Donate an Item",
    titleTe: "వస్తువును ఎలా దానం చేయాలి",
    subtitle: "Full donation workflow with Ramesh's laptop example",
    subtitleTe: "రమేష్ ల్యాప్‌టాప్ ఉదాహరణతో పూర్తి దానం ప్రక్రియ",
    category: "Donating",
    icon: "🎁",
    color: "from-orange-500 to-amber-600",
    steps: t2Steps,
  },
  {
    id: "receive-item",
    title: "How to Receive an Item",
    titleTe: "వస్తువును ఎలా పొందాలి",
    subtitle: "Lakshmi's journey from request to receiving a laptop",
    subtitleTe: "అభ్యర్థన నుండి ల్యాప్‌టాప్ పొందడం వరకు లక్ష్మీ ప్రయాణం",
    category: "Receiving",
    icon: "🙏",
    color: "from-green-500 to-teal-600",
    steps: t3Steps,
  },
  {
    id: "smart-matching",
    title: "Smart Matching System",
    titleTe: "స్మార్ట్ మ్యాచింగ్ సిస్టమ్",
    subtitle: "How the engine connects donors and receivers",
    subtitleTe: "ఇంజిన్ దాతలు మరియు గ్రహీతలను ఎలా కనెక్ట్ చేస్తుంది",
    category: "Matching",
    icon: "🔍",
    color: "from-purple-500 to-violet-600",
    steps: t4Steps,
  },
  {
    id: "trust-reviews",
    title: "Trust Score & Reviews",
    titleTe: "ట్రస్ట్ స్కోర్ & సమీక్షలు",
    subtitle: "Build your community reputation through donations",
    subtitleTe: "దానాల ద్వారా మీ సమాజ కీర్తిని నిర్మించండి",
    category: "Trust",
    icon: "🏆",
    color: "from-amber-500 to-yellow-600",
    steps: t5Steps,
  },
];
