import { Console } from "@/ui/Console";
import { SAVES } from "@/data/saves";
import { PROFILE } from "@/data/profile";

export default function Home() {
  return (
    <>
      {/* Readable by crawlers and screen readers before any script runs. */}
      <div className="sr-only">
        <h1>{PROFILE.name}</h1>
        <p>{PROFILE.role}. {PROFILE.intro}</p>
        <ul>
          {SAVES.map((s) => (
            <li key={s.hash}>
              <a href={`#${s.hash}`}>{s.title}</a>: {s.blurb}
            </li>
          ))}
        </ul>
      </div>
      <Console />
    </>
  );
}
