"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { PROJECT_CATEGORIES, PROJECTS, type ProjectCategory } from "@/data/projects";
import { Chip, Label, Panel } from "./shared";

const shortTitle = (title: string) => title.split(" — ")[0];

export function Projects() {
  const [category, setCategory] = useState<ProjectCategory | "all">("all");
  const [activeId, setActiveId] = useState(PROJECTS[0].id);
  const detail = useRef<HTMLDivElement>(null);

  const list = PROJECTS.filter((p) => category === "all" || p.category === category);
  const project = list.find((p) => p.id === activeId) ?? list[0];

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
      e.preventDefault();
      const at = list.findIndex((p) => p.id === project.id);
      const next = list[(at + (e.key === "ArrowDown" ? 1 : -1) + list.length) % list.length];
      setActiveId(next.id);
      document.getElementById(`file-${next.id}`)?.scrollIntoView({ block: "nearest" });
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [list, project.id]);

  const choose = (id: string) => {
    setActiveId(id);
    if (window.innerWidth < 1024) detail.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:h-full lg:min-h-0 lg:grid-cols-[320px_minmax(0,1fr)]">
      <Panel className="flex min-h-0 flex-col lg:h-full">
        <div className="mb-3 flex flex-wrap gap-1.5" role="tablist" aria-label="Filter projects">
          {PROJECT_CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={category === c.id}
              data-on={category === c.id}
              className="btn !min-h-[34px] flex-1 !px-2 !text-[12px] uppercase"
              onClick={() => setCategory(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
        <Label aside={<span className="only-mouse">↑ ↓ BROWSE</span>}>{list.length} FILES</Label>
        <ul className="scroll-area -mr-2 max-h-[240px] overflow-y-auto pr-2 lg:max-h-none lg:min-h-0 lg:flex-1">
          {list.map((p, i) => {
            const on = p.id === project.id;
            return (
              <li key={p.id} id={`file-${p.id}`}>
                <button
                  type="button"
                  aria-current={on}
                  onClick={() => choose(p.id)}
                  onMouseEnter={() => setActiveId(p.id)}
                  className={`flex min-h-[44px] w-full items-center gap-2.5 border-l-2 px-2 py-1.5 text-left transition-colors ${
                    on ? "border-cyan bg-[rgba(255,255,255,.16)] text-snow" : "border-transparent text-ice/85"
                  }`}
                >
                  <span className="t-sys text-[12px] text-haze">{String(i + 1).padStart(2, "0")}</span>
                  <span className="min-w-0 flex-1 truncate text-[14px] font-medium">{shortTitle(p.title)}</span>
                  <span className="t-sys text-[11px] uppercase text-haze">{p.category.slice(0, 3)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </Panel>

      <div ref={detail} className="scroll-mt-2 lg:scroll-area min-w-0 lg:h-full lg:overflow-y-auto">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={project.id}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.14 }}
          >
            <Panel>
              <div className="relative aspect-[16/9] w-full overflow-hidden border border-[var(--hairline)] bg-abyss">
                <Image
                  src={project.image}
                  alt={`Screenshot of ${shortTitle(project.title)}`}
                  fill
                  sizes="(min-width: 1024px) 760px, 100vw"
                  className="object-cover object-top"
                />
              </div>
              <h2 className="t-title mt-4 text-[15px] leading-relaxed sm:text-[18px]">{project.title}</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-ice/90">{project.description}</p>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <Label>TECHNOLOGY STACK</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {project.tech.map((t) => (
                      <Chip key={t}>{t}</Chip>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>FEATURES</Label>
                  <ul className="space-y-1 text-[14px] leading-snug text-ice/90">
                    {project.features.map((f) => (
                      <li key={f} className="flex gap-2">
                        <span className="text-cyan" aria-hidden>
                          ▸
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {project.demo && (
                  <a className="btn" href={project.demo} target="_blank" rel="noreferrer">
                    LIVE DEMO
                  </a>
                )}
                {project.repo && (
                  <a className="btn" href={project.repo} target="_blank" rel="noreferrer">
                    GITHUB REPOSITORY
                  </a>
                )}
                {project.note && <p className="t-sys text-[13px] text-haze">{project.note}</p>}
              </div>
            </Panel>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
