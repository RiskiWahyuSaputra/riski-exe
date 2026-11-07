import type { ReactNode } from "react";

/** Heading strip used inside every save file. */
export function Label({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3 border-b border-[var(--hairline)] pb-2">
      <h2 className="t-sys text-[13px] text-cyan">{children}</h2>
      {aside && <span className="t-sys text-[12px] text-haze">{aside}</span>}
    </div>
  );
}

export function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="t-sys inline-block border border-[var(--hairline)] bg-[rgba(10,50,120,.5)] px-2 py-0.5 text-[12px] text-ice">
      {children}
    </span>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`panel p-4 sm:p-5 ${className}`}>{children}</section>;
}
