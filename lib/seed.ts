import type { AppData, Contact, IndustryId, Opportunity } from "./types";
import { addLocalDays } from "./dates";

const makeOpportunity = (value: Omit<Opportunity, "status" | "nextAction" | "nextActionDate">): Opportunity => ({
  ...value,
  status: "saved",
  nextAction: "Review role fit",
  nextActionDate: addLocalDays(2),
});

export const sampleOpportunities: Opportunity[] = [
  makeOpportunity({
    id: "opp-tech-1", industry: "tech", title: "Staff Software Engineer, Platform", company: "Northstar Labs", location: "Remote · US", arrangement: "Remote", salaryMin: 185000, salaryMax: 230000,
    summary: "Shape the platform foundations behind a product used by growing teams.", requirements: ["TypeScript", "Platform architecture", "Distributed systems", "Technical leadership"], skills: ["TypeScript", "Platform architecture", "Distributed systems", "Technical leadership"], sourceUrl: "", sourceName: "Synthetic demo", postedLabel: "Added for demo", signal: "strong",
  }),
  makeOpportunity({
    id: "opp-tech-2", industry: "tech", title: "Senior Product Engineer", company: "Fieldnote", location: "Denver, CO · Hybrid", arrangement: "Hybrid", salaryMin: 160000, salaryMax: 198000,
    summary: "Work across product and engineering to help small businesses understand their customers.", requirements: ["React", "TypeScript", "Product discovery", "Cross-functional collaboration"], skills: ["React", "TypeScript", "Product discovery"], sourceUrl: "", sourceName: "Synthetic demo", postedLabel: "Added for demo", signal: "good",
  }),
  makeOpportunity({
    id: "opp-finance-1", industry: "finance", title: "Senior Financial Analyst, Planning & Analysis", company: "Cedar Financial", location: "Denver, CO · Hybrid", arrangement: "Hybrid", salaryMin: 125000, salaryMax: 158000,
    summary: "Turn planning, forecast, and performance data into clear decisions for business leaders.", requirements: ["Financial modeling", "Forecasting", "Variance analysis", "Executive reporting"], skills: ["Financial modeling", "Forecasting", "Executive reporting"], sourceUrl: "", sourceName: "Synthetic demo", postedLabel: "Added for demo", signal: "good",
  }),
  makeOpportunity({
    id: "opp-health-1", industry: "healthcare", title: "Clinical Informatics Specialist", company: "Harbor Health", location: "Denver, CO · Hybrid", arrangement: "Hybrid", salaryMin: 108000, salaryMax: 142000,
    summary: "Partner with care teams to improve clinical workflows, documentation quality, and safe technology adoption.", requirements: ["Clinical informatics", "Care-team workflows", "Clinical systems", "Privacy-minded practice"], skills: ["Clinical informatics", "Care-team workflows", "Clinical systems"], sourceUrl: "", sourceName: "Synthetic demo", postedLabel: "Added for demo", signal: "good",
  }),
  makeOpportunity({
    id: "opp-public-1", industry: "public", title: "Digital Services Product Manager", company: "Civic Works", location: "Denver, CO · Hybrid", arrangement: "Hybrid", salaryMin: 118000, salaryMax: 152000,
    summary: "Improve high-use public services with a small, multidisciplinary digital team.", requirements: ["Accessible service design", "Program delivery", "Stakeholder facilitation", "Public service"], skills: ["Accessible service design", "Program delivery", "Stakeholder facilitation"], sourceUrl: "", sourceName: "Synthetic demo", postedLabel: "Added for demo", signal: "good",
  }),
];

const evidenceByIndustry: Record<IndustryId, AppData["evidence"]> = {
  tech: [
    { id: "ev-1", kind: "achievement", title: "Cut deploy time by 42%", detail: "Led a platform migration that reduced the average release window from 50 minutes to 29 minutes.", source: "2025 performance review", provenance: "user-provided", verified: true, createdAt: "2026-04-12" },
    { id: "ev-2", kind: "skill", title: "TypeScript & React", detail: "Six years building and operating customer-facing web products.", source: "Resume · 2026", provenance: "document-derived", verified: true, createdAt: "2026-03-05" },
    { id: "ev-3", kind: "experience", title: "Platform architecture", detail: "Designed shared service boundaries and mentored a team of five engineers.", source: "Career notes", provenance: "user-provided", verified: true, createdAt: "2026-02-14" },
  ],
  finance: [
    { id: "ev-1", kind: "achievement", title: "Reduced close process by 3 days", detail: "Automated reconciliations across four reporting teams.", source: "2025 performance review", provenance: "user-provided", verified: true, createdAt: "2026-04-12" },
    { id: "ev-2", kind: "skill", title: "Financial modeling & controls", detail: "Six years in forecasting, reporting, and risk-aware operations.", source: "Resume · 2026", provenance: "document-derived", verified: true, createdAt: "2026-03-05" },
  ],
  healthcare: [
    { id: "ev-1", kind: "achievement", title: "Improved care-team handoff time by 28%", detail: "Coordinated a workflow redesign across three clinical teams.", source: "2025 performance review", provenance: "user-provided", verified: true, createdAt: "2026-04-12" },
    { id: "ev-2", kind: "credential", title: "Clinical Informatics Certificate", detail: "Completed continuing education in clinical systems and workflow design.", source: "Certificate upload", provenance: "document-derived", verified: true, createdAt: "2026-03-05" },
  ],
  public: [
    { id: "ev-1", kind: "achievement", title: "Moved a high-volume service online", detail: "Reduced average processing time by 35% while improving accessibility.", source: "Annual review", provenance: "user-provided", verified: true, createdAt: "2026-04-12" },
    { id: "ev-2", kind: "credential", title: "Public Trust Clearance", detail: "Current through 2027; confirm role-specific requirements before relying on it.", source: "Credential record", provenance: "user-provided", verified: true, createdAt: "2026-03-05" },
  ],
};

export function createSeed(industry: IndustryId = "tech"): AppData {
  const profile: Record<IndustryId, { role: string; targets: string[]; goal: string }> = {
    tech: { role: "Software developer", targets: ["Staff Software Engineer", "Platform Engineer"], goal: "Grow into broader technical leadership while staying close to meaningful, user-centered work." },
    finance: { role: "Financial analyst", targets: ["Senior Financial Analyst", "Finance Manager"], goal: "Build a stronger strategic finance practice and take on broader ownership of planning and decisions." },
    healthcare: { role: "Clinical informatics professional", targets: ["Clinical Informatics Specialist", "Care Operations Manager"], goal: "Improve care delivery by making clinical workflows safer, clearer, and easier for care teams." },
    public: { role: "Public-sector digital services professional", targets: ["Digital Services Product Manager", "IT Specialist"], goal: "Use technology and service design to make essential public services more accessible and effective." },
  };
  const contactsByIndustry: Record<IndustryId, Contact[]> = {
    tech: [
      { id: "contact-1", name: "Jordan Lee", role: "Engineering Director", company: "Northstar Labs", context: "Former teammate; worked together on platform reliability.", source: "User added", lastInteraction: "Apr 18, 2026" },
      { id: "contact-2", name: "Priya Shah", role: "Product Engineering Manager", company: "Fieldnote", context: "Met through the local product engineering community.", source: "User added", lastInteraction: "Mar 22, 2026" },
    ],
    finance: [
      { id: "contact-1", name: "Morgan Chen", role: "Finance Director", company: "Summit Credit Union", context: "Former colleague; partnered on planning and reporting work.", source: "User added", lastInteraction: "Apr 18, 2026" },
      { id: "contact-2", name: "Riley Brooks", role: "FP&A Manager", company: "Cedar Financial", context: "Met through a finance leadership group.", source: "User added", lastInteraction: "Mar 22, 2026" },
    ],
    healthcare: [
      { id: "contact-1", name: "Taylor Kim", role: "Clinical Informatics Lead", company: "Harbor Health", context: "Former teammate; collaborated on care-team workflow improvements.", source: "User added", lastInteraction: "Apr 18, 2026" },
      { id: "contact-2", name: "Casey Rivera", role: "Nurse Manager", company: "Front Range Medical", context: "Met through a professional care-improvement group.", source: "User added", lastInteraction: "Mar 22, 2026" },
    ],
    public: [
      { id: "contact-1", name: "Avery Johnson", role: "Digital Services Director", company: "Civic Works", context: "Former colleague; partnered on an accessible service launch.", source: "User added", lastInteraction: "Apr 18, 2026" },
      { id: "contact-2", name: "Sam Patel", role: "Program Analyst", company: "State Services Office", context: "Met through a public-service technology group.", source: "User added", lastInteraction: "Mar 22, 2026" },
    ],
  };
  return {
    industry,
    plan: "free",
    profileName: "Alex Morgan",
    profileRole: profile[industry].role,
    location: "Denver, CO",
    targetRoles: profile[industry].targets,
    goalSummary: profile[industry].goal,
    goalWeights: { capability: 30, growth: 25, compensation: 10, mission: 30, access: 5 },
    evidence: evidenceByIndustry[industry],
    opportunities: sampleOpportunities.filter((opportunity) => opportunity.industry === industry),
    contacts: contactsByIndustry[industry],
  };
}

