import { useMemo, useState } from "react";
import { ArrowRight, MapPin, Search } from "lucide-react";
import DrillDownMap from "./DrillDownMap";

const activeDistricts = [
  {
    slug: "bengaluru-urban",
    name: "Bengaluru Urban",
    nameLocal: "Bengaluru Nagara",
    tagline: "Silicon Valley of India",
    state: "Karnataka",
    stateSlug: "karnataka",
    active: true,
    badges: [
      { emoji: "IT", label: "Startup Capital" },
      { emoji: "AI", label: "Smart City" },
      { emoji: "HQ", label: "ISRO & HAL" }
    ],
    healthGrade: "A",
    temp: 34,
    goLiveDate: "2026-04-10"
  },
  {
    slug: "mumbai",
    name: "Mumbai",
    nameLocal: "Mumbai",
    tagline: "Financial Capital of India",
    state: "Maharashtra",
    stateSlug: "maharashtra",
    active: true,
    badges: [
      { emoji: "INR", label: "Finance" },
      { emoji: "Film", label: "Bollywood" },
      { emoji: "Sea", label: "Coastal" }
    ],
    healthGrade: "B+",
    temp: 35,
    goLiveDate: "2026-04-25"
  },
  {
    slug: "new-delhi",
    name: "New Delhi",
    nameLocal: "Nai Dilli",
    tagline: "Capital of India",
    state: "Delhi",
    stateSlug: "delhi",
    active: true,
    badges: [
      { emoji: "Gov", label: "National Capital" },
      { emoji: "Her", label: "Heritage" },
      { emoji: "Civic", label: "Civic Core" }
    ],
    healthGrade: "B",
    temp: 38,
    goLiveDate: "2026-04-15"
  },
  {
    slug: "chennai",
    name: "Chennai",
    nameLocal: "Chennai",
    tagline: "Gateway to South India",
    state: "Tamil Nadu",
    stateSlug: "tamil-nadu",
    active: true,
    badges: [
      { emoji: "Auto", label: "Detroit of India" },
      { emoji: "Sea", label: "Marina" },
      { emoji: "Med", label: "Health Capital" }
    ],
    healthGrade: "A",
    temp: 35,
    goLiveDate: "2026-04-12"
  },
  {
    slug: "kolkata",
    name: "Kolkata",
    nameLocal: "Kolkata",
    tagline: "Cultural Capital of India",
    state: "West Bengal",
    stateSlug: "west-bengal",
    active: true,
    badges: [
      { emoji: "Art", label: "Culture" },
      { emoji: "UN", label: "UNESCO" },
      { emoji: "Port", label: "River Port" }
    ],
    healthGrade: "B+",
    temp: 35,
    goLiveDate: "2026-04-18"
  },
  {
    slug: "hyderabad",
    name: "Hyderabad",
    nameLocal: "Hyderabad",
    tagline: "City of Pearls",
    state: "Telangana",
    stateSlug: "telangana",
    active: true,
    badges: [
      { emoji: "Bio", label: "Genome Valley" },
      { emoji: "IT", label: "Tech Hub" },
      { emoji: "Her", label: "Nizam Heritage" }
    ],
    healthGrade: "A",
    temp: 37,
    goLiveDate: "2026-04-10"
  },
  {
    slug: "lucknow",
    name: "Lucknow",
    nameLocal: "Lucknow",
    tagline: "City of Nawabs",
    state: "Uttar Pradesh",
    stateSlug: "uttar-pradesh",
    active: true,
    badges: [
      { emoji: "Food", label: "Kebab Capital" },
      { emoji: "Craft", label: "Chikankari" },
      { emoji: "Her", label: "Heritage" }
    ],
    healthGrade: "B",
    temp: 41,
    goLiveDate: "2026-04-15"
  },
  {
    slug: "pune",
    name: "Pune",
    nameLocal: "Pune",
    tagline: "Oxford of the East",
    state: "Maharashtra",
    stateSlug: "maharashtra",
    active: true,
    badges: [
      { emoji: "Edu", label: "Education" },
      { emoji: "Auto", label: "Auto + IT" },
      { emoji: "Dam", label: "Khadakwasla" }
    ],
    healthGrade: "A",
    temp: 34,
    goLiveDate: "2026-04-25"
  },
  {
    slug: "mysuru",
    name: "Mysuru",
    nameLocal: "Mysuru",
    tagline: "City of Palaces",
    state: "Karnataka",
    stateSlug: "karnataka",
    active: true,
    badges: [
      { emoji: "Pal", label: "Palaces" },
      { emoji: "Clean", label: "Clean City" },
      { emoji: "Fest", label: "Dasara" }
    ],
    healthGrade: "A+",
    temp: 34,
    goLiveDate: "2026-04-11"
  },
  {
    slug: "mandya",
    name: "Mandya",
    nameLocal: "Mandya",
    tagline: "Sugar Capital of Karnataka",
    state: "Karnataka",
    stateSlug: "karnataka",
    active: true,
    badges: [
      { emoji: "Farm", label: "Sugar Capital" },
      { emoji: "Dam", label: "KRS Dam" },
      { emoji: "River", label: "Kaveri Basin" }
    ],
    healthGrade: "A",
    temp: 38,
    goLiveDate: "2026-04-19"
  }
];

const lockedDistricts = [
  { slug: "agra", name: "Agra", nameLocal: "Agra", tagline: "Vote to unlock", state: "Uttar Pradesh", stateSlug: "uttar-pradesh", active: false, badges: [] },
  { slug: "ahmedabad", name: "Ahmedabad", nameLocal: "Ahmedabad", tagline: "Vote to unlock", state: "Gujarat", stateSlug: "gujarat", active: false, badges: [] },
  { slug: "visakhapatnam", name: "Visakhapatnam", nameLocal: "Visakhapatnam", tagline: "Vote to unlock", state: "Andhra Pradesh", stateSlug: "andhra-pradesh", active: false, badges: [] }
];

const DAYS_NEW = 45;
const FUTURE_GRACE_MS = 24 * 60 * 60 * 1000;

function isNewDistrict(goLiveDate) {
  if (!goLiveDate) return false;
  const ms = Date.now() - new Date(goLiveDate).getTime();
  return ms >= -FUTURE_GRACE_MS && ms < DAYS_NEW * 24 * 60 * 60 * 1000;
}

function gradeColor(grade) {
  if (grade === "A+" || grade === "A") return "grade-good";
  if (grade === "B+" || grade === "B") return "grade-medium";
  if (grade === "C+" || grade === "C") return "grade-low";
  return "grade-poor";
}

export default function HomeDrillDown({ locale = "en", heroShown = false, onNavigateToAuth }) {
  const [searchQuery, setSearchQuery] = useState("");
  const allDistricts = useMemo(() => [...activeDistricts, ...lockedDistricts], []);

  const filtered =
    searchQuery.trim().length >= 2
      ? allDistricts
          .filter(
            (district) =>
              district.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              district.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
              district.nameLocal.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .slice(0, 6)
      : [];

  const districtHref = (district) => `/${locale}/${district.stateSlug}/${district.slug}`;

  return (
    <div className="home-drilldown">
      {!heroShown && (
        <div className="drilldown-banner">
          Real-time district intelligence built from public data sources.
        </div>
      )}

      <div className="drilldown-grid">
        <div className="drilldown-map-column">
          <DrillDownMap
            locale={locale}
            onStateSelect={(state) => {
              if (state.active) {
                sessionStorage.setItem("crimeai_selected_state", state.slug);
                onNavigateToAuth?.(state);
              }
            }}
          />
        </div>

        <aside className="district-sidebar">
          <div className="district-search">
            <Search size={16} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your district..."
            />
          </div>

          {filtered.length > 0 && (
            <div className="district-search-results">
              {filtered.map((district) => (
                <a
                  key={`${district.stateSlug}-${district.slug}`}
                  href={district.active ? districtHref(district) : "#vote"}
                  className="district-search-item"
                >
                  <MapPin size={14} className={district.active ? "active-pin" : "inactive-pin"} />
                  <span>{district.name}</span>
                  <em>{district.state}</em>
                  <ArrowRight size={13} />
                </a>
              ))}
            </div>
          )}

          <div className="district-card-wrap">
            <div className="district-card-header">
              <span className="live-dot" />
              <span>LIVE</span>
              <span>{activeDistricts.length} districts</span>
            </div>

            <div className="district-card-list">
              {activeDistricts.map((district) => (
                <a
                  key={`${district.stateSlug}-${district.slug}`}
                  href={districtHref(district)}
                  className="district-card"
                >
                  <div className="district-card-row">
                    <div className="district-card-main">
                      <div className="district-title-row">
                        <strong>{district.name}</strong>
                        <span>{district.nameLocal}</span>
                        {district.healthGrade && (
                          <span className={`grade-pill ${gradeColor(district.healthGrade)}`}>{district.healthGrade}</span>
                        )}
                        {isNewDistrict(district.goLiveDate) && <span className="new-pill">NEW</span>}
                      </div>
                      <div className="district-tagline">{district.tagline}</div>
                      <div className="district-badges">
                        {district.badges.slice(0, 3).map((badge) => (
                          <span key={`${district.slug}-${badge.label}`} className="district-badge">
                            {badge.emoji} {badge.label}
                          </span>
                        ))}
                      </div>
                    </div>
                    {district.temp != null && <span className="district-temp">{district.temp}C</span>}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
