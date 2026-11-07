import { JOURNEY } from "@/data/journey";
import { PROFILE } from "@/data/profile";
import { Chip, Label, Panel } from "./shared";

export function Journey() {
  return (
    <div className="mx-auto max-w-[900px]">
      <Panel className="mb-5">
        <Label>PROGRAMMING JOURNEY</Label>
        <p className="text-[15px] leading-relaxed text-ice/90">{PROFILE.background}</p>
      </Panel>

      <ol className="relative">
        <span
          aria-hidden
          className="absolute bottom-3 left-[11px] top-3 w-[3px] bg-gradient-to-b from-cyan via-ice to-azure sm:left-[15px]"
        />
        {JOURNEY.map((entry, i) => (
          <li key={`${entry.title}-${entry.period}`} className="relative pb-5 pl-9 last:pb-0 sm:pl-12">
            <span
              aria-hidden
              className={`absolute left-[3px] top-4 h-[19px] w-[19px] rotate-45 border-2 border-ice sm:left-[7px] ${
                entry.current ? "bg-cyan shadow-[0_0_14px_rgba(255,230,60,.9)]" : "bg-navy"
              }`}
            />
            <Panel>
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                <p className="t-sys text-[13px] text-cyan">
                  CHECKPOINT {String(JOURNEY.length - i).padStart(2, "0")} / {entry.period}
                </p>
                <p className="t-sys text-[12px] uppercase text-haze">
                  {entry.current ? <span className="blink text-snow">NOW PLAYING</span> : entry.type}
                </p>
              </div>
              <h2 className="t-title mt-2 text-[14px] leading-relaxed sm:text-[17px]">{entry.title}</h2>
              <p className="text-[15px] font-medium text-ice">
                {entry.org}
                {entry.orgNote && <span className="font-normal text-haze"> / {entry.orgNote}</span>}
              </p>
              <p className="t-sys mt-0.5 text-[12px] text-haze">{entry.location}</p>
              <ul className="mt-3 space-y-1.5 text-[14px] leading-relaxed text-ice/90">
                {entry.points.map((point) => (
                  <li key={point} className="flex gap-2">
                    <span className="text-cyan" aria-hidden>
                      ▸
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {entry.tags.map((tag) => (
                  <Chip key={tag}>{tag}</Chip>
                ))}
              </div>
            </Panel>
          </li>
        ))}
      </ol>
    </div>
  );
}
