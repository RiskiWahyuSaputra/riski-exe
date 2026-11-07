"use client";

import { useEffect, useRef, useState } from "react";
import github from "@/data/github.json";
import { PROFILE } from "@/data/profile";
import { Label, Panel } from "./shared";

/** One hue from dark to light, read against the navy panel. */
const LEVELS = ["rgba(150,200,255,.09)", "#1a5cb0", "#2f8fe6", "#6fdcff", "#eafaff"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type Day = { date: string; count: number; level: number };

const longDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
};

function Tile({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="panel p-3 sm:p-4">
      <p className="t-sys text-[12px] uppercase text-haze">{label}</p>
      <p className="t-title mt-1 text-[20px] sm:text-[26px]">{value}</p>
      {note && <p className="t-sys mt-0.5 text-[12px] text-ice/80">{note}</p>}
    </div>
  );
}

function Calendar() {
  const [hover, setHover] = useState<Day | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  // On a narrow screen the latest weeks are the interesting ones.
  useEffect(() => {
    if (scroller.current) scroller.current.scrollLeft = scroller.current.scrollWidth;
  }, []);

  const weeks = github.weeks as Day[][];
  const labels = weeks.map((week, i) => {
    const month = Number(week[0].date.slice(5, 7));
    const previous = i > 0 ? Number(weeks[i - 1][0].date.slice(5, 7)) : 0;
    return month !== previous && i < weeks.length - 2 ? MONTHS[month - 1] : "";
  });

  return (
    <Panel>
      <Label
        aside={
          hover
            ? `${hover.count} contribution${hover.count === 1 ? "" : "s"} on ${longDate(hover.date)}`
            : `${github.totalContributions.toLocaleString("en-US")} in the last year`
        }
      >
        CONTRIBUTION GRAPH
      </Label>
      <div ref={scroller} className="scroll-area overflow-x-auto pb-2">
        <div
          role="img"
          aria-label={`Contribution calendar: ${github.totalContributions} contributions over ${github.activeDays} active days in the last year.`}
          className="grid min-w-[760px] gap-[3px]"
          style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}
          onMouseLeave={() => setHover(null)}
        >
          {labels.map((label, i) => (
            <span key={i} className="t-sys h-4 overflow-visible whitespace-nowrap text-[11px] text-haze">
              {label}
            </span>
          ))}
          {weeks.map((week, x) =>
            week.map((day) => (
              <span
                key={day.date}
                className="aspect-square hover:outline hover:outline-1 hover:outline-snow"
                style={{
                  gridColumn: x + 1,
                  gridRow: new Date(`${day.date}T00:00:00Z`).getUTCDay() + 2,
                  background: LEVELS[day.level],
                }}
                onMouseEnter={() => setHover(day)}
                onClick={() => setHover(day)}
              />
            )),
          )}
        </div>
      </div>
      <div className="t-sys mt-2 flex items-center justify-end gap-1 text-[11px] text-haze">
        LESS
        {LEVELS.map((color) => (
          <i key={color} className="block h-3 w-3" style={{ background: color }} />
        ))}
        MORE
      </div>
    </Panel>
  );
}

export function Stats() {
  const top = github.languages[0].share;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile label="Contributions" value={github.totalContributions.toLocaleString("en-US")} note="last 12 months" />
        <Tile label="Public commits" value={github.commits.toLocaleString("en-US")} note="default branches" />
        <Tile label="Public repos" value={String(github.publicRepos)} note="owned, non-fork" />
        <Tile label="Longest streak" value={`${github.longestStreak} days`} note={`${github.activeDays} active days`} />
      </div>

      <Calendar />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Panel>
          <Label aside="share of code in public repos">PROGRAMMING LANGUAGES</Label>
          <ul className="space-y-2">
            {github.languages.map((lang) => (
              <li key={lang.name} className="t-sys grid grid-cols-[92px_1fr_52px] items-center gap-2 text-[13px]">
                <span className="truncate text-ice">{lang.name}</span>
                <span className="block h-3 bg-[rgba(150,200,255,.09)]">
                  <span className="block h-full rounded-r-[3px] bg-cyan" style={{ width: `${(lang.share / top) * 100}%` }} />
                </span>
                <span className="text-right text-snow">{lang.share}%</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel>
          <Label>CODING ACTIVITY</Label>
          <dl className="t-sys text-[13px]">
            <div className="flex justify-between gap-3 py-1.5">
              <dt className="text-haze">BEST DAY</dt>
              <dd className="text-right text-snow">
                {github.bestDay.count} on {longDate(github.bestDay.date)}
              </dd>
            </div>
            <div className="flex justify-between gap-3 border-t border-[var(--hairline)] py-1.5">
              <dt className="text-haze">ON GITHUB SINCE</dt>
              <dd className="text-snow">{longDate(github.memberSince.slice(0, 10))}</dd>
            </div>
            <div className="flex justify-between gap-3 border-t border-[var(--hairline)] py-1.5">
              <dt className="text-haze">SNAPSHOT</dt>
              <dd className="text-snow">{longDate(github.generatedAt)}</dd>
            </div>
          </dl>
          <a className="btn mt-2 w-full" href={PROFILE.github} target="_blank" rel="noreferrer">
            VIEW GITHUB PROFILE
          </a>
        </Panel>
      </div>
    </div>
  );
}
