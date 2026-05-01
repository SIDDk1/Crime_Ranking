import { useState } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { Lock } from "lucide-react";

const ACTIVE_STATE_SLUGS = new Set([
  "andhra-pradesh",
  "delhi",
  "goa",
  "gujarat",
  "haryana",
  "karnataka",
  "kerala",
  "maharashtra",
  "odisha",
  "puducherry",
  "punjab",
  "tamil-nadu",
  "telangana",
  "uttar-pradesh",
  "west-bengal"
]);

const GEO_NAME_TO_SLUG = {
  "Andaman and Nicobar": "andaman-nicobar",
  "Andaman & Nicobar Island": "andaman-nicobar",
  "Andhra Pradesh": "andhra-pradesh",
  "Arunachal Pradesh": "arunachal-pradesh",
  Assam: "assam",
  Bihar: "bihar",
  Chandigarh: "chandigarh",
  Chhattisgarh: "chhattisgarh",
  "Dadra and Nagar Haveli": "dadra-nagar-haveli",
  "Daman and Diu": "dadra-nagar-haveli",
  Delhi: "delhi",
  "NCT of Delhi": "delhi",
  Goa: "goa",
  Gujarat: "gujarat",
  Haryana: "haryana",
  "Himachal Pradesh": "himachal-pradesh",
  "Jammu & Kashmir": "jammu-kashmir",
  "Jammu and Kashmir": "jammu-kashmir",
  Jharkhand: "jharkhand",
  Karnataka: "karnataka",
  Kerala: "kerala",
  Ladakh: "ladakh",
  Lakshadweep: "lakshadweep",
  "Madhya Pradesh": "madhya-pradesh",
  Maharashtra: "maharashtra",
  Manipur: "manipur",
  Meghalaya: "meghalaya",
  Mizoram: "mizoram",
  Nagaland: "nagaland",
  Odisha: "odisha",
  Puducherry: "puducherry",
  Punjab: "punjab",
  Rajasthan: "rajasthan",
  Sikkim: "sikkim",
  "Tamil Nadu": "tamil-nadu",
  Telangana: "telangana",
  Tripura: "tripura",
  "Uttar Pradesh": "uttar-pradesh",
  Uttarakhand: "uttarakhand",
  "West Bengal": "west-bengal"
};

function titleFromSlug(slug) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function DrillDownMap({ onStateSelect, locale = "en" }) {
  const [tooltip, setTooltip] = useState(null);

  return (
    <div className="drilldown-map-shell">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ center: [82.5, 23], scale: 970 }}
        width={680}
        height={700}
        style={{ width: "100%", height: "100%", minHeight: 500 }}
      >
        <ZoomableGroup zoom={1} minZoom={1} maxZoom={4} center={[82.5, 23]}>
          <Geographies geography="/geo/india-states.json">
            {({ geographies }) =>
              [...geographies]
                .sort((a, b) => {
                  const aName = String(a.properties?.name ?? a.properties?.NAME_1 ?? "");
                  const bName = String(b.properties?.name ?? b.properties?.NAME_1 ?? "");
                  const aActive = ACTIVE_STATE_SLUGS.has(GEO_NAME_TO_SLUG[aName]);
                  const bActive = ACTIVE_STATE_SLUGS.has(GEO_NAME_TO_SLUG[bName]);
                  return Number(aActive) - Number(bActive);
                })
                .map((geo) => {
                  const geoName = String(geo.properties?.name ?? geo.properties?.NAME_1 ?? "Unknown");
                  const slug =
                    GEO_NAME_TO_SLUG[geoName] ??
                    geoName
                      .toLowerCase()
                      .replace(/&/g, "and")
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-|-$/g, "");

                  const isActive = ACTIVE_STATE_SLUGS.has(slug);
                  const displayName = geoName || titleFromSlug(slug);

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => onStateSelect?.({ slug, name: displayName, active: isActive, locale })}
                      onMouseEnter={(event) => {
                        const rect = event.currentTarget.closest("svg")?.getBoundingClientRect();
                        if (rect) {
                          setTooltip({
                            name: displayName,
                            active: isActive,
                            x: event.clientX - rect.left,
                            y: event.clientY - rect.top
                          });
                        }
                      }}
                      onMouseMove={(event) => {
                        const rect = event.currentTarget.closest("svg")?.getBoundingClientRect();
                        if (rect) {
                          setTooltip((current) =>
                            current
                              ? {
                                  ...current,
                                  x: event.clientX - rect.left,
                                  y: event.clientY - rect.top
                                }
                              : null
                          );
                        }
                      }}
                      onMouseLeave={() => setTooltip(null)}
                      style={{
                        default: {
                          fill: isActive ? "#10b981" : "#2a2f36",
                          stroke: isActive ? "#34d399" : "#434a53",
                          strokeWidth: isActive ? 0.85 : 0.55,
                          outline: "none",
                          cursor: isActive ? "pointer" : "default",
                          transition: "fill 180ms ease, stroke 180ms ease, filter 180ms ease"
                        },
                        hover: {
                          fill: isActive ? "#34d399" : "#3a4048",
                          stroke: isActive ? "#6ee7b7" : "#55606a",
                          strokeWidth: isActive ? 1.15 : 0.6,
                          outline: "none",
                          cursor: isActive ? "pointer" : "not-allowed",
                          filter: "brightness(1.12)"
                        },
                        pressed: {
                          fill: isActive ? "#059669" : "#3a4048",
                          outline: "none"
                        }
                      }}
                    />
                  );
                })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {tooltip && (
        <div
          className="map-tooltip"
          style={{
            left: Math.min(tooltip.x + 12, 420),
            top: Math.max(tooltip.y - 38, 8)
          }}
        >
          {!tooltip.active && <Lock size={11} className="tooltip-lock" />}
          <span>{tooltip.name}</span>
          <span className={tooltip.active ? "tooltip-active" : "tooltip-soon"}>
            {tooltip.active ? "Explore" : "Coming soon"}
          </span>
        </div>
      )}

      <div className="map-legend">
        <div className="legend-row">
          <span className="legend-swatch active" />
          <span>Active</span>
        </div>
        <div className="legend-row">
          <span className="legend-swatch soon" />
          <span>Coming Soon</span>
        </div>
      </div>

      <div className="map-hint">Click a state to explore</div>
    </div>
  );
}
