import { PROFILE } from "@/data/profile";
import { Label, Panel } from "./shared";

const LOG = [
  "> CHEAT ACCEPTED",
  "> MOUNTING HIDDEN PARTITION...",
  "> WHO LEFT THIS HERE?",
  "",
  "You found the room behind the memory card.",
  "Every sound on this site is synthesized in the browser,",
  "and every 3D icon is built from code. Zero model files.",
  "",
  `> OPERATOR: ${PROFILE.name.toUpperCase()}`,
  "> DESKTOP:  ARCH LINUX + NIRI",
  `> MOTTO:    ${PROFILE.motto.toUpperCase()}`,
];

export function DevRoom() {
  return (
    <div className="mx-auto max-w-[760px]">
      <Panel>
        <Label aside="7/6 DATA AVAILABLE">UNKNOWN_DATA.LOG</Label>
        <pre className="t-sys whitespace-pre-wrap text-[14px] leading-7 text-ice">{LOG.join("\n")}</pre>
        <p className="t-sys blink mt-3 text-[14px] text-cyan">_</p>
      </Panel>
      <a className="btn mt-4 w-full" href={`mailto:${PROFILE.email}?subject=I%20found%20the%20dev%20room`}>
        TELL RISKI YOU FOUND IT
      </a>
    </div>
  );
}
