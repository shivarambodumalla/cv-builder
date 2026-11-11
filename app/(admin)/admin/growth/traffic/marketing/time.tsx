import type { DayRow, HourRow } from "./types";

function MiniBarChart({
  data,
  label,
  xLabels,
}: {
  data: { label: string; sessions: number }[];
  label: string;
  xLabels: string[];
}) {
  const maxVal = Math.max(...data.map((d) => d.sessions), 1);
  return (
    <div className="rounded-xl border bg-card p-5">
      <h3 className="text-sm font-semibold mb-4">{label}</h3>
      <div className="flex items-end gap-0.5 h-20">
        {data.map((d) => {
          const h = Math.max(2, (d.sessions / maxVal) * 100);
          return (
            <div
              key={d.label}
              className="group relative flex-1"
              style={{ height: `${h}%` }}
            >
              <div className="w-full h-full rounded-t bg-primary opacity-60 group-hover:opacity-100 transition-opacity" />
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-popover border rounded px-1.5 py-0.5 text-[10px] whitespace-nowrap z-10 shadow-sm">
                {d.label}: {d.sessions.toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
        {xLabels.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
    </div>
  );
}

export function TimeIntelligence({ dayOfWeek, hourly }: { dayOfWeek: DayRow[]; hourly: HourRow[] }) {
  const dayData = dayOfWeek.map((d) => ({ label: d.day, sessions: d.sessions }));
  const hourData = hourly.map((h) => ({ label: String(h.hour), sessions: h.sessions }));

  const peakDay = dayOfWeek.reduce((a, b) => (a.sessions > b.sessions ? a : b), dayOfWeek[0]);
  const peakHour = hourly.reduce((a, b) => (a.sessions > b.sessions ? a : b), hourly[0]);
  const fmtHour = (h: number) => {
    if (h === 0) return "12am";
    if (h < 12) return `${h}am`;
    if (h === 12) return "12pm";
    return `${h - 12}pm`;
  };

  return (
    <div className="space-y-4">
      <MiniBarChart
        data={dayData}
        label="Traffic by day of week"
        xLabels={["Sun", "", "Tue", "", "Thu", "", "Sat"]}
      />
      <div className="rounded-xl border bg-card p-5">
        <h3 className="text-sm font-semibold mb-4">Traffic by hour of day</h3>
        <div className="flex items-end gap-px h-20">
          {hourData.map((d) => {
            const maxVal = Math.max(...hourData.map((h) => h.sessions), 1);
            const h = Math.max(2, (d.sessions / maxVal) * 100);
            return (
              <div key={d.label} className="group relative flex-1" style={{ height: `${h}%` }}>
                <div className="w-full h-full rounded-t bg-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-popover border rounded px-1.5 py-0.5 text-[10px] whitespace-nowrap z-10 shadow-sm">
                  {fmtHour(parseInt(d.label))}: {d.sessions.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
          <span>12am</span>
          <span>6am</span>
          <span>12pm</span>
          <span>6pm</span>
          <span>11pm</span>
        </div>
      </div>

      {peakDay && peakHour && (
        <div className="text-[11px] text-muted-foreground bg-muted/40 rounded-lg px-4 py-2.5 flex flex-wrap gap-4">
          <span>
            Peak day:{" "}
            <span className="font-medium text-foreground">{peakDay.day}</span>{" "}
            ({peakDay.sessions.toLocaleString()} sessions)
          </span>
          <span>
            Peak hour:{" "}
            <span className="font-medium text-foreground">{fmtHour(peakHour.hour)}</span>{" "}
            ({peakHour.sessions.toLocaleString()} sessions)
          </span>
        </div>
      )}
    </div>
  );
}
