"use client";

import { useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { StatTile } from "@/components/admin/stat-tile";
import { countryFlag } from "./format";
import type { Channel, GeoRow } from "./types";

// Topojson uses longer country names; map to what GA4 returns
const TOPO_TO_GA4: Record<string, string> = {
  "United States of America": "United States",
  "Russian Federation": "Russia",
  "United Kingdom of Great Britain and Northern Ireland": "United Kingdom",
  "Korea, Republic of": "South Korea",
  "Democratic People's Republic of Korea": "North Korea",
  "Iran, Islamic Republic of": "Iran",
  "Viet Nam": "Vietnam",
  "Syrian Arab Republic": "Syria",
  "Congo, Democratic Republic of the": "DR Congo",
  "Tanzania, United Republic of": "Tanzania",
  "Bolivia, Plurinational State of": "Bolivia",
  "Venezuela, Bolivarian Republic of": "Venezuela",
  "Moldova, Republic of": "Moldova",
  "Lao People's Democratic Republic": "Laos",
  "Taiwan, Province of China": "Taiwan",
  "Palestine, State of": "Palestinian Territories",
  "Trinidad and Tobago": "Trinidad & Tobago",
};

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

function WorldMap({ geo }: { geo: GeoRow[] }) {
  const [tooltip, setTooltip] = useState<{
    name: string;
    sessions: number;
    newUsers: number;
    engagedSessions: number;
    x: number;
    y: number;
  } | null>(null);

  const sessionMap = new Map(geo.map((g) => [g.country, g]));
  const maxSessions = Math.max(...geo.map((g) => g.sessions), 1);

  function getColor(topoName: string): string {
    const ga4Name = TOPO_TO_GA4[topoName] ?? topoName;
    const data = sessionMap.get(ga4Name);
    if (!data || data.sessions === 0) return "#e5e7eb";
    const ratio = Math.log(data.sessions + 1) / Math.log(maxSessions + 1);
    const lightness = Math.round(88 - ratio * 60);
    return `hsl(173, 64%, ${lightness}%)`;
  }

  return (
    <div className="relative select-none">
      <ComposableMap
        projectionConfig={{ scale: 140, center: [0, 10] }}
        style={{ width: "100%", height: "auto" }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const ga4Name = TOPO_TO_GA4[geo.properties.name] ?? geo.properties.name;
              const data = sessionMap.get(ga4Name);
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={getColor(geo.properties.name)}
                  stroke="#ffffff"
                  strokeWidth={0.4}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "#1a7a6d", outline: "none", cursor: data ? "pointer" : "default" },
                    pressed: { fill: "#155f54", outline: "none" },
                  }}
                  onMouseEnter={(e: React.MouseEvent) => {
                    if (data) {
                      setTooltip({
                        name: ga4Name,
                        sessions: data.sessions,
                        newUsers: data.newUsers,
                        engagedSessions: data.engagedSessions,
                        x: e.clientX,
                        y: e.clientY,
                      });
                    }
                  }}
                  onMouseMove={(e: React.MouseEvent) => {
                    if (tooltip) setTooltip((t) => t && { ...t, x: e.clientX, y: e.clientY });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>

      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none bg-popover border rounded-lg px-3 py-2 text-xs shadow-lg"
          style={{ left: tooltip.x + 14, top: tooltip.y - 60 }}
        >
          <p className="font-semibold mb-1">{tooltip.name}</p>
          <div className="space-y-0.5 text-muted-foreground">
            <p>{tooltip.sessions.toLocaleString()} sessions</p>
            <p>{tooltip.newUsers.toLocaleString()} new users</p>
            <p>
              {tooltip.sessions > 0
                ? Math.round((tooltip.engagedSessions / tooltip.sessions) * 100)
                : 0}
              % engaged
            </p>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
        <span>Low</span>
        <div className="flex h-2 rounded overflow-hidden flex-1 max-w-[120px]">
          {Array.from({ length: 10 }, (_, i) => {
            const l = Math.round(88 - i * 6);
            return (
              <div key={i} className="flex-1" style={{ background: `hsl(173, 64%, ${l}%)` }} />
            );
          })}
        </div>
        <span>High</span>
        <span className="ml-2 inline-block w-3 h-2 rounded" style={{ background: "#e5e7eb" }} />
        <span>No data</span>
      </div>
    </div>
  );
}

function GeoTable({ geo }: { geo: GeoRow[] }) {
  const total = geo.reduce((s, g) => s + g.sessions, 0) || 1;
  return (
    <div className="rounded-xl border bg-card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Country</th>
            <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground w-20">Sessions</th>
            <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground w-16">Share</th>
            <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground w-20">New</th>
            <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground w-20">Engaged</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {geo.slice(0, 12).map((row) => (
            <tr key={row.country} className="hover:bg-muted/30 transition-colors">
              <td className="px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-base leading-none">{countryFlag(row.countryCode)}</span>
                  <span className="font-medium text-xs">{row.country}</span>
                </div>
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums text-xs">{row.sessions.toLocaleString()}</td>
              <td className="px-4 py-2.5 text-right text-xs text-muted-foreground">
                {Math.round((row.sessions / total) * 100)}%
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums text-xs text-muted-foreground">
                {row.newUsers.toLocaleString()}
              </td>
              <td className="px-4 py-2.5 text-right text-xs text-muted-foreground">
                {row.sessions > 0 ? Math.round((row.engagedSessions / row.sessions) * 100) : 0}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function GeographicIntelligence({ geo }: { geo: GeoRow[] }) {
  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <h3 className="text-sm font-semibold">Geographic Intelligence</h3>
      {geo.length === 0 ? (
        <p className="text-sm text-muted-foreground">No geographic data available.</p>
      ) : (
        <>
          <WorldMap geo={geo} />
          <GeoTable geo={geo} />
        </>
      )}
    </div>
  );
}

export function GeoStatCards({ geo, channels }: { geo: GeoRow[]; channels: Channel[] }) {
  const topCountry = geo[0];
  const totalCountries = geo.length;
  const totalSessions = geo.reduce((s, g) => s + g.sessions, 0);
  const organicChannel = channels.find((c) => c.channel === "Organic Search");
  const organicPct = totalSessions > 0 && organicChannel
    ? Math.round((organicChannel.sessions / totalSessions) * 100)
    : null;
  const topEngaged = [...geo].sort(
    (a, b) =>
      (b.engagedSessions / Math.max(b.sessions, 1)) - (a.engagedSessions / Math.max(a.sessions, 1))
  )[0];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {topCountry && (
        <StatTile
          label="Top market"
          value={`${countryFlag(topCountry.countryCode)} ${topCountry.country}`}
          note={`${topCountry.sessions.toLocaleString()} sessions · ${Math.round(
            (topCountry.sessions / Math.max(totalSessions, 1)) * 100
          )}% of traffic`}
        />
      )}
      <StatTile
        label="Geographic reach"
        value={totalCountries}
        note={`countries reached${organicPct !== null ? ` · ${organicPct}% organic` : ""}`}
      />
      {topEngaged && (
        <StatTile
          label="Highest engagement"
          value={`${countryFlag(topEngaged.countryCode)} ${topEngaged.country}`}
          note={`${
            topEngaged.sessions > 0 ? Math.round((topEngaged.engagedSessions / topEngaged.sessions) * 100) : 0
          }% engaged sessions`}
        />
      )}
    </div>
  );
}
