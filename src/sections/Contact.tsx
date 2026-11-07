"use client";

import { PROFILE } from "@/data/profile";
import { useSystem } from "@/lib/store";
import { Label, Panel } from "./shared";

function Channel({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
      className="flex min-h-[52px] items-center justify-between gap-4 border-b border-[var(--hairline)] px-1 py-2 transition-colors last:border-b-0 hover:bg-[rgba(111,220,255,.16)]"
    >
      <span className="t-sys text-[13px] text-cyan">{label}</span>
      <span className="min-w-0 truncate text-[15px] font-medium text-snow">{value}</span>
    </a>
  );
}

export function Contact() {
  const notify = useSystem((s) => s.notify);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
      notify("EMAIL COPIED TO CLIPBOARD");
    } catch {
      notify(`EMAIL: ${PROFILE.email}`);
    }
  };

  return (
    <div className="mx-auto grid max-w-[1000px] gap-4 md:grid-cols-[1.15fr_1fr]">
      <Panel className="flex flex-col justify-center">
        <p className="t-sys text-[13px] text-cyan">NEW GAME + / PLAYER 2 WANTED</p>
        <h2 className="t-title mt-3 text-[24px] leading-snug sm:text-[34px]">Let&apos;s Work Together</h2>
        <p className="mt-4 text-[16px] leading-relaxed text-ice/90">
          Have an internal system that needs building, a product idea, or a playful interface like this one? I&apos;m open to
          collaborating. Send a message and tell me what you&apos;re working on.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <a className="btn" href={`mailto:${PROFILE.email}?subject=Let's%20work%20together`}>
            SEND A MESSAGE
          </a>
          <button type="button" className="btn" onClick={copy}>
            COPY EMAIL
          </button>
        </div>
      </Panel>

      <Panel>
        <Label>CONTACT INFORMATION</Label>
        <Channel label="EMAIL" value={PROFILE.email} href={`mailto:${PROFILE.email}`} />
        <Channel label="GITHUB" value={PROFILE.githubHandle} href={PROFILE.github} />
        <Channel label="LINKEDIN" value={PROFILE.linkedinHandle} href={PROFILE.linkedin} />
        <Channel label="CV" value="Open PDF" href={PROFILE.cv} />
        <div className="t-sys flex min-h-[52px] items-center justify-between gap-4 px-1 text-[13px]">
          <span className="text-cyan">BASE</span>
          <span className="text-right text-snow">{PROFILE.location}</span>
        </div>
      </Panel>
    </div>
  );
}
