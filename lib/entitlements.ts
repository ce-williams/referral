import type { AppData, PlanId } from "./types";

export const planLimits: Record<PlanId, { activeOpportunities: number; contacts: number; resumeDraftsPerMonth: number; briefsPerMonth: number; label: string }> = {
  free: { activeOpportunities: 10, contacts: 25, resumeDraftsPerMonth: 3, briefsPerMonth: 3, label: "Free" },
  paid: { activeOpportunities: 100, contacts: 250, resumeDraftsPerMonth: 30, briefsPerMonth: 50, label: "Paid" },
};

export function canAddOpportunity(data: AppData) {
  return data.opportunities.filter((item) => !["offer"].includes(item.status)).length < planLimits[data.plan].activeOpportunities;
}
