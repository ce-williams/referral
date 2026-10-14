export type IndustryId = "tech" | "finance" | "healthcare" | "public";
export type PlanId = "free" | "paid";
export type OpportunityStatus = "saved" | "researching" | "applied" | "interview" | "offer";
export type EvidenceKind = "achievement" | "skill" | "credential" | "experience";

export type EvidenceItem = {
  id: string;
  kind: EvidenceKind;
  title: string;
  detail: string;
  source: string;
  provenance: "user-provided" | "document-derived" | "externally observed";
  verified: boolean;
  createdAt: string;
};

export type Opportunity = {
  id: string;
  industry: IndustryId;
  title: string;
  company: string;
  location: string;
  arrangement: string;
  salaryMin?: number;
  salaryMax?: number;
  summary: string;
  requirements: string[];
  sourceUrl: string;
  sourceName: string;
  postedLabel: string;
  status: OpportunityStatus;
  nextAction: string;
  nextActionDate: string;
  signal: "strong" | "good" | "explore";
  skills?: string[];
};

export type Contact = {
  id: string;
  name: string;
  role: string;
  company: string;
  context: string;
  source: string;
  lastInteraction: string;
};

export type AppData = {
  industry: IndustryId;
  plan: PlanId;
  profileName: string;
  profileRole: string;
  location: string;
  targetRoles: string[];
  goalSummary: string;
  goalWeights: { capability: number; growth: number; compensation: number; mission: number; access: number };
  evidence: EvidenceItem[];
  opportunities: Opportunity[];
  contacts: Contact[];
};
