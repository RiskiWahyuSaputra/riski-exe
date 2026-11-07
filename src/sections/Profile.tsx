import Image from "next/image";
import { PROFILE } from "@/data/profile";
import { SKILLS } from "@/data/skills";
import { Chip, Label, Panel } from "./shared";

export function Profile() {
  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <div className="flex flex-col gap-4">
        <Panel>
          <div className="relative mx-auto aspect-square w-40 border border-[var(--hairline)] lg:w-full">
            <Image src={PROFILE.avatar} alt={`Portrait of ${PROFILE.name}`} fill sizes="320px" className="object-cover" priority />
            <span className="t-sys absolute left-0 top-0 bg-cyan px-2 py-0.5 text-[12px] text-abyss">PLAYER 1</span>
          </div>
          <h2 className="t-title mt-4 text-[15px] leading-relaxed">{PROFILE.name}</h2>
          <p className="mt-1 text-[14px] text-ice">
            {PROFILE.role} at {PROFILE.company}
          </p>
          <dl className="t-sys mt-3 text-[13px]">
            {PROFILE.stats.map((s) => (
              <div key={s.label} className="flex justify-between gap-3 border-t border-[var(--hairline)] py-1.5">
                <dt className="uppercase text-haze">{s.label}</dt>
                <dd className="text-right text-snow">{s.value}</dd>
              </div>
            ))}
          </dl>
          <a className="btn mt-3 w-full" href={PROFILE.cv} target="_blank" rel="noreferrer">
            OPEN CV (PDF)
          </a>
        </Panel>
      </div>

      <div className="flex min-w-0 flex-col gap-4">
        <Panel>
          <Label>WHO AM I</Label>
          <p className="text-[17px] leading-relaxed text-snow">{PROFILE.intro}</p>
          <p className="mt-3 text-[15px] leading-relaxed text-ice/90">{PROFILE.background}</p>
        </Panel>

        <div className="grid gap-4 xl:grid-cols-2">
          <Panel>
            <Label>DEVELOPER INTERESTS</Label>
            <ul className="space-y-3">
              {PROFILE.interests.map((item) => (
                <li key={item.label}>
                  <h3 className="text-[15px] font-bold text-snow">{item.label}</h3>
                  <p className="text-[14px] leading-relaxed text-ice/85">{item.detail}</p>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel>
            <Label aside={`"${PROFILE.motto}"`}>PHILOSOPHY</Label>
            <ul className="space-y-3">
              {PROFILE.philosophy.map((item) => (
                <li key={item.title}>
                  <h3 className="text-[15px] font-bold text-snow">{item.title}</h3>
                  <p className="text-[14px] leading-relaxed text-ice/85">{item.body}</p>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <Panel>
          <Label>EQUIPPED SKILLS</Label>
          <div className="space-y-2.5">
            {SKILLS.map((set) => (
              <div key={set.group} className="flex flex-wrap items-center gap-1.5">
                <span className="t-sys w-24 text-[12px] text-haze">{set.group}</span>
                {set.items.map((item) => (
                  <Chip key={item}>{item}</Chip>
                ))}
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
