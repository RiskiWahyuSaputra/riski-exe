export type Certificate = {
  id: string;
  title: string;
  issuer: string;
  /** Issue year, as printed in the CV. */
  date: string;
  image: string;
  credentialUrl: string;
};

export const CERTIFICATES: Certificate[] = [
  { id: "01", title: "Programming Fundamental - Nasional", issuer: "Digital Talent Scholarship", date: "2026", image: "/certificates/cert-01.webp", credentialUrl: "https://digitalent.kominfo.go.id/cek-sertifikat" },
  { id: "02", title: "Front-End & Back-End Development", issuer: "Digital Talent Scholarship", date: "2026", image: "/certificates/cert-02.webp", credentialUrl: "https://digitalent.kominfo.go.id/cek-sertifikat" },
  { id: "03", title: "Full Stack Developer", issuer: "Digital Talent Scholarship", date: "2026", image: "/certificates/cert-03.webp", credentialUrl: "https://digitalent.kominfo.go.id/cek-sertifikat" },
  { id: "04", title: "Belajar Membuat Front-End Web untuk Pemula", issuer: "Dicoding Indonesia", date: "2026", image: "/certificates/cert-04.webp", credentialUrl: "https://www.dicoding.com/certificates/6RPN7Y388X2M" },
  { id: "05", title: "Belajar Membuat Aplikasi Web dengan React", issuer: "Dicoding Indonesia", date: "2026", image: "/certificates/cert-05.webp", credentialUrl: "https://www.dicoding.com/certificates/L4PQ95R22PO1" },
  { id: "06", title: "Belajar Dasar AI", issuer: "Dicoding Indonesia", date: "2026", image: "/certificates/cert-06.webp", credentialUrl: "https://www.dicoding.com/certificates/81P25VEVYPOY" },
  { id: "07", title: "Belajar Penggunaan Generative AI", issuer: "Dicoding Indonesia", date: "2026", image: "/certificates/cert-07.webp", credentialUrl: "https://www.dicoding.com/certificates/N9ZONNVO0XG5" },
  { id: "08", title: "Spec-Driven Development dengan Kiro", issuer: "Dicoding Indonesia", date: "2026", image: "/certificates/cert-08.webp", credentialUrl: "https://www.dicoding.com/certificates/RVZK002L4ZD5" },
  { id: "09", title: "Belajar Dasar Cloud dan Gen AI di AWS", issuer: "Dicoding Indonesia", date: "2026", image: "/certificates/cert-09.webp", credentialUrl: "https://www.dicoding.com/certificates/81P2OOY0JZOY" },
  { id: "10", title: "Memulai Pemrograman dengan Python", issuer: "Dicoding Indonesia", date: "2026", image: "/certificates/cert-10.webp", credentialUrl: "https://www.dicoding.com/certificates/2VX30VW2VXYQ" },
  { id: "11", title: "AI Praktis untuk Produktivitas", issuer: "Dicoding Indonesia", date: "2026", image: "/certificates/cert-12.webp", credentialUrl: "https://www.dicoding.com/certificates/4EXG11DN9PRL" },
  { id: "12", title: "Build an AI Agent", issuer: "IBM Skills", date: "2026", image: "/certificates/cert-11.webp", credentialUrl: "https://www.credly.com/badges/2f8fdadd-10a8-4c57-9695-5e19bb671af1/linked_in_profile" },
  { id: "13", title: "Applied AI Foundations", issuer: "OpenAI Academy", date: "2026", image: "/certificates/cert-13.webp", credentialUrl: "https://academy.openai.com/" },
  { id: "14", title: "Agents and Workflows", issuer: "OpenAI Academy", date: "2026", image: "/certificates/cert-14.webp", credentialUrl: "https://academy.openai.com/" },
  { id: "15", title: "Certificate of Completion — #JuaraVibeCoding", issuer: "Google Developer Groups", date: "2026", image: "/certificates/cert-15.webp", credentialUrl: "https://goo.gle/jvc-cert-verifier" },
];

export const ISSUERS = ["All", ...Array.from(new Set(CERTIFICATES.map((c) => c.issuer)))];
