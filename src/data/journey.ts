export type JourneyKind = "education" | "work";

export type JourneyEntry = {
  period: string;
  title: string;
  org: string;
  orgNote?: string;
  kind: JourneyKind;
  type: string;
  location: string;
  points: string[];
  tags: string[];
  current?: boolean;
};

/** Follows the CV, newest first. */
export const JOURNEY: JourneyEntry[] = [
  {
    period: "Aug 2026 - Present",
    title: "IT Developer",
    org: "BEST Corporation Syariah",
    orgNote: "PT Bandung Eco Sinergi Teknologi",
    kind: "work",
    type: "Full-time",
    location: "Bandung, West Java, Indonesia",
    points: [
      "Build and develop internal company web applications using Laravel, PHP, React, Next.js, and MySQL.",
      "Handle system maintenance, bug fixes, and operational service requests that come in through IT helpdesk tickets.",
      "Integrate WhatsApp notification automation, digital signatures (E-Sign), barcode/QR generation, and automated PDF/Excel reports.",
      "Apply root cause analysis, safe database migrations, and clean Git workflows to keep production systems stable.",
    ],
    tags: ["Laravel", "PHP", "React", "Next.js", "MySQL"],
    current: true,
  },
  {
    period: "Feb 2026 - Jul 2026",
    title: "IT Developer (Apprentice)",
    org: "BEST Corporation Syariah",
    orgNote: "PT Bandung Eco Sinergi Teknologi",
    kind: "work",
    type: "Apprenticeship",
    location: "Bandung, West Java, Indonesia",
    points: [
      "Contributed to internal web application development and day-to-day system maintenance before being hired full-time.",
      "Built RESTful API integrations between frontend and backend systems.",
      "Implemented responsive interfaces using React.js and Tailwind CSS.",
    ],
    tags: ["REST API", "React.js", "Tailwind CSS"],
  },
  {
    period: "Sep 2023 - Sep 2026",
    title: "D3 Informatics Management",
    org: "Politeknik Negeri Lampung",
    orgNote: "Department of Information Technology",
    kind: "education",
    type: "Diploma",
    location: "Bandar Lampung, Lampung, Indonesia",
    points: [
      "Studied software and web development fundamentals, including building a QRIS-based practicum payment application for the department.",
    ],
    tags: ["Software Engineering", "Web Programming", "Database"],
  },
  {
    period: "Feb 2022 - Jan 2022",
    title: "Junior Web Developer",
    org: "Telenergie Indonesia",
    kind: "work",
    type: "Internship (PKL)",
    location: "Bandar Lampung, Lampung, Indonesia",
    points: [
      "Designed and developed web applications using native PHP and MySQL.",
      "Built and maintained frontend interfaces with Bootstrap.",
    ],
    tags: ["PHP Native", "MySQL", "Bootstrap"],
  },
];
