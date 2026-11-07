export type ProjectCategory = "enterprise" | "ai" | "web";

export type Project = {
  id: string;
  title: string;
  category: ProjectCategory;
  image: string;
  description: string;
  tech: string[];
  features: string[];
  demo?: string;
  repo?: string;
  /** Shown instead of links for systems that cannot be public. */
  note?: string;
};

const GH = "https://github.com/RiskiWahyuSaputra";
const INTERNAL = "Internal company system, no public demo or repository.";
const NO_LINK = "No public demo or repository.";

export const PROJECT_CATEGORIES: { id: ProjectCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "enterprise", label: "Enterprise" },
  { id: "ai", label: "AI" },
  { id: "web", label: "Web" },
];

/** Enterprise and web entries mirror the previous portfolio, in the same order. */
export const PROJECTS: Project[] = [
  {
    id: "best-cso",
    title: "BEST CSO — Customer Service & Operational Platform",
    category: "enterprise",
    image: "/projects/best-cso.webp",
    description:
      "Enterprise operational & customer service portal for BEST CORPORATION SYARIAH. Manages partner handlings, power of attorney (surat kuasa), guest book check-ins, branch QR validations, interactive chatbot flows, and COA cash management mapping.",
    tech: ["Laravel 12", "PHP 8.2", "MySQL", "REST API", "AdminLTE", "Tailwind CSS"],
    features: [
      "Partner Handling & Power of Attorney (Surat Kuasa)",
      "Branch QR Code Check-in & Guest Book System",
      "Interactive Chatbot Flow Configuration",
      "COA Mapping & Cash CSO Reconciliation",
      "Granular Role-based Access Control",
    ],
    note: INTERNAL,
  },
  {
    id: "best-arsip",
    title: "Best Arsip — Archive Vault & Document Management",
    category: "enterprise",
    image: "/projects/best-arsip.webp",
    description:
      "Physical & digital document vault management system. Features visual hierarchy diagrams of archive cabinets and vault boxes, certificate and vehicle ownership (BPKB) tracking, local document migration tools, and rapid multi-filter live search.",
    tech: ["Laravel 12", "PHP 8.2", "MySQL", "Bootstrap", "REST API", "Local File Storage"],
    features: [
      "Visual Cabinet & Vault Box Hierarchy Diagram",
      "Certificate & Vehicle Ownership (BPKB) Archiving",
      "Instant Live Search & Multi-Filter Query Engine",
      "Automated Expiration Date & Document Alerts",
      "Import & Migration Tools from Legacy Archives",
    ],
    note: INTERNAL,
  },
  {
    id: "best-finance",
    title: "Best Finance — Financial Operations & Serial Reconciliation",
    category: "enterprise",
    image: "/projects/best-finance.webp",
    description:
      "Internal financial management and transaction processing engine. Handles serial code exchanges and recaps, routine departmental expense allocations, supervisor petty cash tracking, bank mutation syncing, and bonus disbursements.",
    tech: ["Laravel 12", "PHP 8.2", "MySQL", "REST API", "Payment Integration", "Storage"],
    features: [
      "Serial Number Exchange & Recap Tracking",
      "Departmental Routine Expense Approvals",
      "Petty Cash SPV & Transaction Ledger",
      "Bank Mutation Sync & Multi-Account Transfers",
      "Audit Trails & Account Balance Logging",
    ],
    note: INTERNAL,
  },
  {
    id: "best-warehouse",
    title: "Best Warehouse — Inventory Management & Supply Chain Platform",
    category: "enterprise",
    image: "/projects/best-warehouse.webp",
    description:
      "Enterprise warehouse & supply chain management system for BEST CORPORATION SYARIAH. Manages multi-warehouse inventory, goods receipt (QC & box numbering), internal requests, product outbounds, stock transfers, barcode & serial tracking, and stockist transactions.",
    tech: ["Laravel 12", "PHP 8.2", "MySQL", "REST API", "Barcode / QR", "DomPDF / FPDF"],
    features: [
      "Multi-Warehouse Stock Management & Stocktaking (SO)",
      "Goods Receipt with QC Inspection & Box Numbering",
      "Product Outbound & Inter-Warehouse Transfers",
      "Barcode Scanning & Serial Tracking Integration",
      "Stockist Transactions & CPM Operational Flow",
    ],
    note: INTERNAL,
  },
  {
    id: "sekretariat",
    title: "Sekretariat — Enterprise Document & Digital E-Signature",
    category: "enterprise",
    image: "/projects/sekretariat.webp",
    description:
      "Corporate secretarial and administration system. Integrates digital signatures (E-Sign) for official company documents, seminar attendee verification, consignment workflows, vendor submissions, and asset maintenance scheduling.",
    tech: ["Laravel", "PHP", "MySQL", "FPDF / Digital Signature", "AdminLTE", "REST API"],
    features: [
      "Digital Document E-Signature & Verification",
      "Official Letter Drafting & PDF Watermarking",
      "Consignment & Vendor Submission Workflows",
      "Corporate Asset Maintenance Scheduling",
      "Event & Seminar Attendance Verification",
    ],
    note: INTERNAL,
  },
  {
    id: "dkp",
    title: "DKP — Divisi Komunikasi dan Pemasaran",
    category: "enterprise",
    image: "/projects/dkp.webp",
    description:
      "Internal communication, marketing administration, and campaign management portal for BEST CORPORATION. Streamlines marketing workflows, divisional coordination, promotional assets, and internal reporting.",
    tech: ["Laravel", "PHP", "MySQL", "Tailwind CSS", "REST API"],
    features: [
      "Division Communications & Task Management",
      "Marketing Campaign Tracking & Assets",
      "Internal Divisional Reporting & Analytics",
      "Secure Role-Based Authentication System",
    ],
    note: INTERNAL,
  },
  {
    id: "stockflow",
    title: "StockFlow Commerce",
    category: "web",
    image: "/projects/stockflow.webp",
    description:
      "A full-featured E-Commerce platform with product catalog, shopping cart, Midtrans payment integration, admin dashboard, and real-time inventory tracking.",
    tech: ["Laravel", "MySQL", "Tailwind"],
    features: [
      "Product catalog",
      "Cart system",
      "Midtrans payment",
      "Admin dashboard",
      "Inventory tracking",
    ],
    repo: `${GH}/StockFlow-Commerce`,
  },
  {
    id: "warehouse-monitoring",
    title: "Warehouse Monitoring System — Inventory, Stock Management & Analytics Platform",
    category: "web",
    image: "/projects/warehouse-monitoring.webp",
    description:
      "A comprehensive full-stack warehouse management web application for real-time inventory tracking, stock movement management, demand forecasting, and automated reporting. Features include barcode/QR scanning, role-based dashboards with drag-and-drop widgets, automated email alerts for low stock and approval requests, data backup & restore, and AI-powered stockout predictions. Built with a dual-stack Laravel + React architecture for a modern, responsive, and scalable solution.",
    tech: ["Laravel 12", "PHP 8.2", "React 18", "Vite 6", "Tailwind CSS 3", "Laravel sanctum", "Laravel Mail", "Laravel Reverb", "Laravel Storage", "REST API", "MySQL", "Git"],
    features: [
      "Dashboard — Customizable drag-and-drop widgets, role-specific defaults (admin/manager/staff)",
      "Inventory Management — Full CRUD, categories, locations, suppliers, barcode/QR generation & scanning",
      "Stock Movements — In/out/transfer with approval workflow",
      "Demand Forecasting — AI-powered stockout predictions with confidence intervals",
      "Email Notifications — Low stock alerts, approval requests, daily/weekly summary reports",
      "Data Backup — One-click full backup (DB + storage as ZIP), scheduled daily backups",
      "Role-Based Access — Admin, Manager, Staff with granular permissions",
      "Dark Mode — Full theme support with Tailwind class-based switching",
      "Responsive — Mobile-first design, works on all screen sizes",
    ],
    repo: `${GH}/warehouse_monitoring`,
  },
  {
    id: "smart-resource",
    title: "Smart Resource Optimizer",
    category: "web",
    image: "/projects/smart-resource.webp",
    description:
      "A web-based platform that connects restaurants/businesses with surplus food to communities in need. This application facilitates efficient food sharing through a real-time claim and verification system.",
    tech: ["Laravel 11", "Laravel Reverb", "Next.js", "React", "TypeScript", "Tailwind CSS", "MySQL", "React leaflet", "Vite"],
    features: [
      "Manajemen user",
      "Food posting",
      "Food claiming",
      "Real-time updates",
      "Geolocation",
      "Admin dashboard",
    ],
    repo: `${GH}/smart-resource-optimizer`,
  },
  {
    id: "tokoq",
    title: "TokoQ - UMKM E-Commerce Platform",
    category: "web",
    image: "/projects/tokoq.webp",
    description:
      "TokoQ-UMKM is an e-commerce and digital store management platform specifically designed for MSMEs (Micro, Small, and Medium Enterprises) in Indonesia.",
    tech: ["Laravel", "Vite", "Tailwind CSS", "Vanilla JavaScript/ES Modules"],
    features: [
      "Barcode scanning",
      "Multi warehouse",
      "Stock alerts",
      "REST API",
    ],
    repo: `${GH}/TokoQ-UMKM`,
  },
  {
    id: "klinikq",
    title: "KlinikQ - Clinic Management System",
    category: "web",
    image: "/projects/klinikq.webp",
    description:
      "A complete clinic management application that allows clinic staff to manage patients, doctors, schedules, appointments, medical records, prescriptions, payments, and public content (articles/news). This system is built for internal clinic use with a Blade-based interface, structured API for integration, as well as notification and reporting functions.",
    tech: ["Laravel 12", "PHP 8.2", "Vite", "Tailwind CSS 4", "MySQL", "Git"],
    features: [
      "Patient Management: Patient CRUD, integrated medical records, visit history.",
      "Doctor & Service Management: Doctor profiles, specializations, service/fee configurations.",
      "Scheduling and Appointments: Doctor's schedule calendar, patient appointment booking, status (confirmed/cancelled).",
      "Medical Record & Prescription Form: Recording diagnosis, examination results, printing/generating prescriptions.",
      "Notifications: In-app notifications for appointment confirmations and reminders, as well as a notification system for staff.",
      "Content Management: Article/news module for publishing health information.",
      "Authentication & Authorization: Login, role/permission management (admin, receptionist, doctor).",
    ],
    repo: `${GH}/klinik`,
  },
  {
    id: "faste-coffee",
    title: "Faste Coffee Shop Landing Page",
    category: "web",
    image: "/projects/faste-coffee.webp",
    description:
      "A modern landing page for Faste Coffee Shop focused on brand storytelling, smooth scrolling interactions, and a polished mobile-first browsing experience.",
    tech: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Lenis"],
    features: [
      "Brand storytelling",
      "Smooth scrolling",
      "Responsive layout",
      "Interactive sections",
    ],
    demo: "https://faste-coffe.vercel.app",
    repo: `${GH}/FasteCoffe`,
  },
  {
    id: "qris-praktikum",
    title: "replacement practicum payment based on QRIS (POLINELA)",
    category: "web",
    image: "/projects/qris-praktikum.webp",
    description:
      "Development of a substitute practicum payment application using QRIS for the Information Technology Department of Lampung State Polytechnic.",
    tech: ["CodeIgniter", "PHP", "MySQL", "Bootstrap"],
    features: [
      "QRIS payment flow",
      "Practicum billing",
      "Payment verification",
      "Admin management",
    ],
    note: NO_LINK,
  },
  {
    id: "anemia",
    title: "Anemia Care — Informasi Kesehatan untuk Ibu Hamil",
    category: "web",
    image: "/projects/anemia.webp",
    description:
      "An educational site that provides a complete explanation about anemia in pregnant women, from causes, symptoms, complications, prevention, to ways to overcome it for the health of the mother and fetus.",
    tech: ["HTML", "CSS", "Bootstrap", "Font Awesome", "PHP", "MySQL"],
    features: [
      "Homepage with a hero section and a summary of anemia information",
      "Responsive navigation for quick access to main topics",
      "Structured educational content: causes, symptoms, complications, prevention, and ways to overcome",
      "Interactive navigation cards for easy exploration of topics",
      "Important information section with health explanations and quick facts",
      "Mobile-friendly design with modern layout and clean visuals",
    ],
    repo: `${GH}/landingpage-anemiaibuhamil`,
  },
  {
    id: "landing-home",
    title: "Interactive Landing Page Home",
    category: "web",
    image: "/projects/landing-home.webp",
    description:
      "Porto Homes is a modern property landing page for promoting homes for sale or rent. It highlights a hero visual, property gallery, interactive tour, and lead capture for prospective buyers and renters, with high performance and smooth navigation.",
    tech: ["Next.js", "Tailwind CSS", "Post CSS", "TypeScript", "custom sequence/scroll components"],
    features: [
      "Hero section with interactive call-to-action (view properties/contact)",
      "Property gallery with lightbox view",
      "Property showcase with interactive features (e.g., 360° view, floor plans)",
      "Virtual tour / embedded video or 3D viewer",
      "Lead capture form with validation and submission handling",
      "Performance optimizations for fast loading and smooth interactions",
      "Magnetic CTA and progress indicator on scroll sequence",
    ],
    demo: "https://landingpage-home.vercel.app",
    repo: `${GH}/landingpage-home`,
  },
  {
    id: "livechat",
    title: "Customer Support Chat System",
    category: "web",
    image: "/projects/livechat.webp",
    description:
      "Implementation of a customer support chat system with queue management, AI chatbot automation, real-time live chat, analytics dashboard, and WhatsApp integration.",
    tech: ["Laravel 12", "PHP 8.2", "Tailwind CSS 4", "Alpine.js", "Laravel Reverb", "MySQL", "Gemini API"],
    features: [
      "Queue management",
      "AI chatbot",
      "WhatsApp integration",
      "Realtime live chat",
      "Analytics dashboard",
    ],
    repo: `${GH}/livechat-laravel`,
  },
  {
    id: "school",
    title: "School Management System",
    category: "web",
    image: "/projects/school.webp",
    description:
      "Comprehensive school management solution handling student enrollment, attendance tracking, academic records, and a dedicated parent portal.",
    tech: ["CodeIgniter", "PHP", "MySQL", "Bootstrap"],
    features: [
      "Student system",
      "Attendance",
      "Academic records",
      "Parent portal",
    ],
    note: NO_LINK,
  },
  {
    id: "undangan",
    title: "Undangan Digital",
    category: "web",
    image: "/projects/undangan.webp",
    description:
      "An interactive digital wedding invitation that provides a scrollytelling experience: showcasing the couple's story, photo gallery, event schedule, location map, RSVP, and digital guestbook. Designed responsively for access via mobile and desktop, with smooth animations and a preloader.",
    tech: ["React", "TypeScript", "Tailwind CSS", "Next.js", "SequenceScroll", "Framer Motion"],
    features: [
      "Preloader animation and brief Save The Date.",
      "Couple's story timeline with photos and text",
      "Event schedule with time, location, and description",
      "Count down day",
      "Photo gallery with lightbox view",
      "Event details with location, time, dress code, and interactive map (Google Maps embed)",
      "RSVP form with guest name, attendance confirmation, and message",
      "Digital guestbook showing messages from guests with name and attendance status",
      "Responsive design with smooth scroll animations and a romantic color scheme",
      "Color/typography easily customizable for each couple.",
    ],
    demo: "https://undangan-pernikahan-orx5.vercel.app",
    repo: `${GH}/undangan-pernikahan`,
  },
  {
    id: "qbox",
    title: "Qbox - Photobox Pixel",
    category: "web",
    image: "/projects/qbox.webp",
    description:
      "PhotoBox is a simple website for creating and managing creative photos with a modern and user-friendly style. Users can choose templates, add filters, and download the resulting photos directly from the browser.",
    tech: ["HTML", "CSS", "JavaScript"],
    features: [
      "Photo template options or basic layout",
      "Visual effects and filters for photos",
      "Live preview before download",
      "Download button for result photos",
      "Responsive for desktop and mobile views",
    ],
    demo: "https://photobox-lime.vercel.app",
    repo: `${GH}/photobox`,
  },
  {
    id: "ai-office",
    title: "AI Stock Trading Office",
    category: "ai",
    image: "/projects/ai-office.webp",
    description:
      "A 3D virtual office where five AI analyst agents research a stock live. Every animation is driven by real workflow events, and the output is informational analysis only.",
    tech: ["Next.js", "TypeScript", "React Three Fiber", "Yahoo Finance"],
    features: ["Five-agent workflow", "NDJSON event streaming", "Entry Radar scanning", "Final signal report", "Telegram order tickets"],
    demo: "https://ai-stock-trading-office.vercel.app",
    repo: `${GH}/ai-stock-trading-office`,
  },
  {
    id: "qite",
    title: "Qite: Skripsi Scout AI",
    category: "ai",
    image: "/projects/qite.webp",
    description:
      "An AI research assistant for Indonesian students. It analyzes thesis titles and PDFs, then finds real journals from OpenAlex and Crossref instead of hallucinated references.",
    tech: ["Next.js 16", "TypeScript", "Tailwind CSS v4", "OpenAlex", "Crossref"],
    features: ["Thesis title scan", "PDF extraction", "DOI verification", "Per-chapter analysis", "APA, IEEE, BibTeX export"],
    demo: "https://qite.vercel.app",
    repo: `${GH}/qite`,
  },
  {
    id: "freshscan",
    title: "FreshScan AI",
    category: "ai",
    image: "/projects/freshscan.webp",
    description:
      "Inspects the visual freshness of produce through a live camera or upload, scoring it with Groq Vision and storing results locally in the browser.",
    tech: ["Next.js", "TypeScript", "Groq Vision", "IndexedDB", "Recharts"],
    features: ["Camera and upload input", "Freshness score 0-100", "Visual evidence detection", "Local scan history", "Analytics dashboard"],
    demo: "https://fresh-scan-ai-drab.vercel.app",
    repo: `${GH}/FreshScan-AI`,
  },
];
