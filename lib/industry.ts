import type { IndustryId } from "./types";

export const industries: Record<IndustryId, { label: string; adjective: string; accent: string; soft: string; focus: string; sourceHint: string; roleExamples: string[] }> = {
  tech: {
    label: "Technology",
    adjective: "tech",
    accent: "#5367d9",
    soft: "#eef0ff",
    focus: "Product engineering, platform, and developer tools",
    sourceHint: "Start with employer career pages and public ATS listings.",
    roleExamples: ["Staff Software Engineer", "Platform Engineer", "Product Engineer"],
  },
  finance: {
    label: "Finance",
    adjective: "finance",
    accent: "#2c6a53",
    soft: "#eaf4ef",
    focus: "Fintech, banking, risk, and investment operations",
    sourceHint: "Use employer career pages and public regulatory filings for company context.",
    roleExamples: ["Financial Analyst", "Finance Manager", "Risk Analyst"],
  },
  healthcare: {
    label: "Healthcare",
    adjective: "healthcare",
    accent: "#16858b",
    soft: "#e9f5f4",
    focus: "Digital health, care delivery, and health operations",
    sourceHint: "Use provider career pages and official health data for organization context.",
    roleExamples: ["Clinical Informatics Specialist", "Nurse", "Physical Therapist"],
  },
  public: {
    label: "Public Sector",
    adjective: "public sector",
    accent: "#5d648e",
    soft: "#eff0f6",
    focus: "Government technology, public service, and civic outcomes",
    sourceHint: "Start with agency career pages; federal listings may be available through USAJOBS.",
    roleExamples: ["Digital Services Product Manager", "IT Specialist", "Policy Analyst"],
  },
};

export const industryOrder: IndustryId[] = ["tech", "finance", "healthcare", "public"];
