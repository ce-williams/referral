import type { AppData, Opportunity } from "./types";

export type ScoreBreakdown = { capability: number; goals: number; growth: number; compensation: number; access: number; confidence: number; total: number; matches: string[]; gaps: string[] };

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9+# ]/g, " ").replace(/\s+/g, " ").trim();
}

export function scoreOpportunity(opportunity: Opportunity, data: AppData): ScoreBreakdown {
  const reviewedEvidence = data.evidence.filter((item) => item.verified);
  const roleAndEvidence = normalize(`${data.profileRole} ${data.targetRoles.join(" ")} ${reviewedEvidence.map((item) => `${item.title} ${item.detail}`).join(" ")}`);
  const requirements = opportunity.skills?.length ? opportunity.skills : opportunity.requirements;
  const matches = requirements.filter((item) => roleAndEvidence.includes(normalize(item)));
  const gaps = requirements.filter((item) => !roleAndEvidence.includes(normalize(item)));
  const capability = requirements.length ? Math.round((matches.length / requirements.length) * 100) : 50;
  const titleText = normalize(`${opportunity.title} ${opportunity.summary}`);
  const targetMatch = data.targetRoles.some((role) => {
    const tokens = normalize(role).split(" ").filter((token) => token.length > 3);
    return tokens.some((token) => titleText.includes(token));
  });
  const goals = targetMatch ? 88 : 68;
  const growth = opportunity.signal === "strong" ? 88 : opportunity.signal === "good" ? 76 : 62;
  const compensation = opportunity.salaryMin ? (opportunity.salaryMin >= 180000 ? 90 : opportunity.salaryMin >= 150000 ? 76 : 58) : 55;
  const access = data.contacts.some((contact) => normalize(contact.company) === normalize(opportunity.company)) ? 100 : 55;
  const weights = data.goalWeights;
  const totalWeight = weights.capability + weights.growth + weights.compensation + weights.mission + weights.access;
  const total = totalWeight === 0 ? 0 : Math.round((capability * weights.capability + goals * weights.growth + growth * weights.mission + compensation * weights.compensation + access * weights.access) / totalWeight);
  const confidence = Math.min(96, Math.max(38, 48 + matches.length * 8 + (opportunity.salaryMin ? 8 : 0) + (reviewedEvidence.length >= 2 ? 12 : 0)));
  return { capability, goals, growth, compensation, access, confidence, total, matches, gaps };
}

export function nextActionFor(opportunity: Opportunity, data: AppData): string {
  const score = scoreOpportunity(opportunity, data);
  if (score.gaps.length > 0) return `Check evidence for ${score.gaps[0]}`;
  if (!data.contacts.some((contact) => normalize(contact.company) === normalize(opportunity.company))) return "Find a warm path into the team";
  return "Ask your connection about team priorities";
}

