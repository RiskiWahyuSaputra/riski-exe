export type IconKind = "character" | "laptop" | "rocket" | "trophy" | "cube" | "crystal" | "glitch";

export type SaveSlot = {
  index: number;
  slot: string;
  /** File name shown in the browser. */
  file: string;
  /** Human title of the section. */
  title: string;
  /** URL hash, so a save can be linked to directly. */
  hash: string;
  icon: IconKind;
  saved: string;
  size: string;
  blurb: string;
  /** Atmosphere color while this save is open. Stays inside the blue family. */
  tint: string;
};

export const SAVES: SaveSlot[] = [
  {
    index: 0,
    slot: "01",
    file: "PROFILE_DATA",
    title: "Who Am I",
    hash: "profile",
    icon: "character",
    saved: "2026/08/01",
    size: "128 KB",
    blurb: "Player profile. Who is behind this memory card, and why they build things.",
    tint: "#1668c8",
  },
  {
    index: 1,
    slot: "02",
    file: "PROJECT_DATA",
    title: "Professional Work",
    hash: "projects",
    icon: "laptop",
    saved: "2026/11/06",
    size: "2,240 KB",
    blurb: "Enterprise systems running in production, plus products shipped in public.",
    tint: "#0d4fb4",
  },
  {
    index: 2,
    slot: "03",
    file: "JOURNEY_DATA",
    title: "Career Journey",
    hash: "journey",
    icon: "rocket",
    saved: "2026/08/15",
    size: "512 KB",
    blurb: "Every checkpoint so far, from a first internship to a full-time developer role.",
    tint: "#2a48c4",
  },
  {
    index: 3,
    slot: "04",
    file: "TROPHY_DATA",
    title: "Certificates",
    hash: "trophies",
    icon: "trophy",
    saved: "2026/10/20",
    size: "864 KB",
    blurb: "Fifteen credentials unlocked across web, cloud, and AI.",
    tint: "#0f6a9c",
  },
  {
    index: 4,
    slot: "05",
    file: "STATS_DATA",
    title: "Developer Stats",
    hash: "stats",
    icon: "cube",
    saved: "2026/11/06",
    size: "384 KB",
    blurb: "A year of commits, repositories, and languages from public GitHub data.",
    tint: "#0a7fa8",
  },
  {
    index: 5,
    slot: "06",
    file: "CONTACT_DATA",
    title: "Let's Work Together",
    hash: "contact",
    icon: "crystal",
    saved: "2026/11/07",
    size: "64 KB",
    blurb: "Open channel. Start a conversation about your next project.",
    tint: "#14a0c8",
  },
];

/** Hidden seventh save. Not on the card until the cheat is entered. */
export const SECRET_SAVE: SaveSlot = {
  index: 6,
  slot: "??",
  file: "UNKNOWN_DATA",
  title: "Dev Room",
  hash: "dev-room",
  icon: "glitch",
  saved: "????/??/??",
  size: "0 KB",
  blurb: "This file should not exist. Load at your own risk.",
  tint: "#3a2fb0",
};

export const ALL_SAVES = [...SAVES, SECRET_SAVE];

export const saveByHash = (hash: string) => ALL_SAVES.find((s) => s.hash === hash);
