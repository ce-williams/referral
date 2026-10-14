import type { AppData, IndustryId } from "./types";
import { createSeed } from "./seed";

const STORAGE_KEY = "referral-demo-v1";
const WORKSPACE_STORAGE_KEY = "referral-workspaces-v1";

type WorkspaceStore = {
  activeIndustry: IndustryId;
  workspaces: Partial<Record<IndustryId, AppData>>;
};

const industries: IndustryId[] = ["tech", "finance", "healthcare", "public"];

function isIndustryId(value: unknown): value is IndustryId {
  return typeof value === "string" && industries.includes(value as IndustryId);
}

function isAppData(value: unknown): value is AppData {
  if (!value || typeof value !== "object") return false;
  const data = value as Partial<AppData>;
  const weights = data.goalWeights as (AppData["goalWeights"] & { access?: number }) | undefined;
  return isIndustryId(data.industry)
    && (data.plan === "free" || data.plan === "paid")
    && typeof data.profileName === "string"
    && typeof data.profileRole === "string"
    && typeof data.goalSummary === "string"
    && Array.isArray(data.targetRoles)
    && Array.isArray(data.evidence)
    && Array.isArray(data.opportunities)
    && Array.isArray(data.contacts)
    && !!weights
    && [weights.capability, weights.growth, weights.compensation, weights.mission].every(Number.isFinite)
    && (weights.access === undefined || Number.isFinite(weights.access));
}

function isWorkspaceStore(value: unknown): value is WorkspaceStore {
  if (!value || typeof value !== "object") return false;
  const store = value as Partial<WorkspaceStore>;
  return isIndustryId(store.activeIndustry)
    && !!store.workspaces
    && typeof store.workspaces === "object"
    && Object.entries(store.workspaces).every(([industry, data]) => isIndustryId(industry) && isAppData(data) && data.industry === industry);
}

function refreshSeededWorkspace(data: AppData): AppData {
  const seed = createSeed(data.industry);
  const oldSeedRoles: Record<string, IndustryId> = {
    "Senior software engineer": "tech",
    "Finance and operations leader": "finance",
    "Healthcare operations leader": "healthcare",
    "Digital services professional": "public",
  };
  const oldSeedGoals = [
    "Grow into broader technical leadership while staying close to meaningful, user-centered work.",
  ];
  const savedSeedOpportunities = new Map(data.opportunities.filter((item) => item.sourceName === "Synthetic demo").map((item) => [item.id, item]));
  const currentSeedOpportunities = seed.opportunities.map((item) => {
    const previous = savedSeedOpportunities.get(item.id);
    return previous ? { ...item, status: previous.status, nextAction: previous.nextAction, nextActionDate: previous.nextActionDate } : item;
  });
  const customOpportunities = data.opportunities.filter((item) => item.industry === data.industry && item.sourceName !== "Synthetic demo");
  const oldProfileRole = oldSeedRoles[data.profileRole] === data.industry;
  const seededContactIds = new Set(seed.contacts.map((item) => item.id));
  const customContacts = data.contacts.filter((item) => !seededContactIds.has(item.id));
  return {
    ...data,
    profileRole: oldProfileRole ? seed.profileRole : data.profileRole,
    targetRoles: oldProfileRole || data.targetRoles.length === 0 ? seed.targetRoles : data.targetRoles,
    goalSummary: oldSeedGoals.includes(data.goalSummary) ? seed.goalSummary : data.goalSummary,
    goalWeights: { ...data.goalWeights, access: Number.isFinite(data.goalWeights.access) ? data.goalWeights.access : 5 },
    opportunities: [...customOpportunities, ...currentSeedOpportunities],
    contacts: [...customContacts, ...seed.contacts],
  };
}

function readStore(): WorkspaceStore {
  try {
    const stored = localStorage.getItem(WORKSPACE_STORAGE_KEY);
    if (stored) {
      const parsed: unknown = JSON.parse(stored);
      if (isWorkspaceStore(parsed)) {
        const workspaces = Object.fromEntries(Object.entries(parsed.workspaces).map(([industry, data]) => [industry, refreshSeededWorkspace(data)])) as WorkspaceStore["workspaces"];
        return { activeIndustry: parsed.activeIndustry, workspaces };
      }
    }
    const legacy = localStorage.getItem(STORAGE_KEY);
    if (legacy) {
      const parsed: unknown = JSON.parse(legacy);
      if (isAppData(parsed)) {
        const data = parsed;
        // Fix the old demo's known cross-industry state where the selector changed but profile content did not.
        const oldSeedRoles: Record<string, IndustryId> = {
          "Senior software engineer": "tech",
          "Finance and operations leader": "finance",
          "Healthcare operations leader": "healthcare",
          "Digital services professional": "public",
        };
        const expectedIndustry = oldSeedRoles[data.profileRole];
        if (expectedIndustry && expectedIndustry !== data.industry) {
          const clean = createSeed(data.industry);
          return { activeIndustry: data.industry, workspaces: { [data.industry]: clean } };
        }
        return { activeIndustry: data.industry, workspaces: { [data.industry]: refreshSeededWorkspace(data) } };
      }
    }
  } catch {
    // A corrupted local demo snapshot falls back to synthetic data.
  }
  return { activeIndustry: "tech", workspaces: {} };
}

function writeStore(store: WorkspaceStore) {
  localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(store));
}

export function loadData(): AppData {
  const store = readStore();
  return store.workspaces[store.activeIndustry] ?? createSeed(store.activeIndustry);
}

export function loadWorkspace(industry: IndustryId): AppData {
  const store = readStore();
  const data = store.workspaces[industry] ?? createSeed(industry);
  return refreshSeededWorkspace(data);
}

export function saveData(data: AppData) {
  const store = readStore();
  writeStore({ activeIndustry: data.industry, workspaces: { ...store.workspaces, [data.industry]: data } });
}

export function resetForIndustry(industry: IndustryId) {
  const next = createSeed(industry);
  const store = readStore();
  writeStore({ activeIndustry: industry, workspaces: { ...store.workspaces, [industry]: next } });
  localStorage.removeItem(`${SOURCE_STORAGE_PREFIX}${industry}`);
  return next;
}

export const SOURCE_STORAGE_PREFIX = "referral-sources-v1-";
