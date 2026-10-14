import assert from "node:assert/strict";
import test from "node:test";
import { canAddOpportunity, planLimits } from "../lib/entitlements";
import { createSeed, sampleOpportunities } from "../lib/seed";
import { scoreOpportunity } from "../lib/scoring";
import { addLocalDays, localDateString } from "../lib/dates";
import type { AppData } from "../lib/types";

test("opportunity score is deterministic and exposes its evidence matches", () => {
  const data = createSeed("tech");
  const role = sampleOpportunities[0];
  const first = scoreOpportunity(role, data);
  const second = scoreOpportunity(role, data);

  assert.deepEqual(first, second);
  assert.ok(first.total >= 0 && first.total <= 100);
  assert.ok(first.matches.includes("TypeScript"));
  assert.ok(first.gaps.includes("Distributed systems"));
  assert.ok(first.confidence >= 0 && first.confidence <= 100);
});

test("unreviewed evidence does not create a score match", () => {
  const data = createSeed("tech");
  const unreviewed: AppData = {
    ...data,
    evidence: [...data.evidence, {
      id: "unreviewed", kind: "skill", title: "Distributed systems", detail: "User-entered, not yet reviewed.",
      source: "Draft note", provenance: "user-provided", verified: false, createdAt: "2026-10-13",
    }],
  };
  const role = sampleOpportunities[0];

  assert.ok(scoreOpportunity(role, unreviewed).gaps.includes("Distributed systems"));
});

test("each demo workspace seeds a role-aligned and isolated opportunity set", () => {
  for (const industry of ["tech", "finance", "healthcare", "public"] as const) {
    const workspace = createSeed(industry);
    assert.ok(workspace.opportunities.length > 0);
    assert.ok(workspace.opportunities.every((opportunity) => opportunity.industry === industry));
    assert.ok(workspace.targetRoles.length > 0);
    assert.ok(workspace.goalSummary.length > 0);
    assert.ok(workspace.contacts.length > 0);
  }
  assert.match(createSeed("finance").profileRole, /financial analyst/i);
  assert.match(createSeed("healthcare").profileRole, /clinical informatics/i);
  assert.match(createSeed("public").profileRole, /public-sector/i);
});

test("calendar dates use local day boundaries", () => {
  const afternoon = new Date(2026, 9, 13, 23, 30);
  assert.equal(localDateString(afternoon), "2026-10-13");
  assert.equal(addLocalDays(2, afternoon), "2026-10-15");
});

test("relationship access is included in the explainable weighted score", () => {
  const data = createSeed("tech");
  const role = sampleOpportunities[0];
  const withWarmPath = scoreOpportunity(role, data);
  const withoutWarmPath = scoreOpportunity(role, { ...data, contacts: [] });

  assert.equal(withWarmPath.access, 100);
  assert.equal(withoutWarmPath.access, 55);
  assert.ok(withWarmPath.total > withoutWarmPath.total);
});

test("Free and Paid opportunity limits are enforced by the entitlement helper", () => {
  const seed = createSeed("tech");
  const freeData: AppData = {
    ...seed,
    plan: "free",
    opportunities: Array.from({ length: planLimits.free.activeOpportunities }, (_, index) => ({ ...sampleOpportunities[0], id: `free-${index}`, status: "saved" as const })),
  };
  const paidData: AppData = {
    ...freeData,
    plan: "paid",
    opportunities: Array.from({ length: planLimits.free.activeOpportunities + 1 }, (_, index) => ({ ...sampleOpportunities[0], id: `paid-${index}`, status: "saved" as const })),
  };

  assert.equal(canAddOpportunity(freeData), false);
  assert.equal(canAddOpportunity(paidData), true);
});
