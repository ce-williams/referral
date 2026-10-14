"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { canAddOpportunity, planLimits } from "@/lib/entitlements";
import { addLocalDays, localDateString } from "@/lib/dates";
import { industries, industryOrder } from "@/lib/industry";
import { nextActionFor, scoreOpportunity } from "@/lib/scoring";
import { createSeed } from "@/lib/seed";
import { loadData, loadWorkspace, resetForIndustry, saveData, SOURCE_STORAGE_PREFIX } from "@/lib/storage";
import type { AppData, Contact, EvidenceItem, IndustryId, Opportunity, OpportunityStatus } from "@/lib/types";

type Page = "home" | "opportunities" | "career" | "network" | "research";
type Modal = "opportunity" | "evidence" | "contact" | "upgrade" | null;

const navItems: { id: Page; label: string; icon: string }[] = [
  { id: "home", label: "Overview", icon: "home" },
  { id: "opportunities", label: "Opportunities", icon: "briefcase" },
  { id: "career", label: "Career profile", icon: "spark" },
  { id: "network", label: "Network", icon: "users" },
  { id: "research", label: "Research", icon: "search" },
];

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
  const paths: Record<string, React.ReactNode> = {
    home: <><path d="m3.5 10 8.5-7 8.5 7"/><path d="M5.5 9.5v10h13v-10M9.5 19.5v-6h5v6"/></>,
    briefcase: <><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V7M3 12h18M10 12v2h4v-2"/></>,
    spark: <><path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z"/><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z"/></>,
    users: <><circle cx="9" cy="8" r="3"/><path d="M3.5 20v-1.5A4.5 4.5 0 0 1 8 14h2a4.5 4.5 0 0 1 4.5 4.5V20M16 5.3a3 3 0 0 1 0 5.8m1 3h.5a3.5 3.5 0 0 1 3.5 3.5V20"/></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    arrow: <><path d="M5 12h14m-6-6 6 6-6 6"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    check: <><path d="m5 12 4 4L19 6"/></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.4"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    external: <><path d="M14 4h6v6M20 4l-9 9"/><path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5"/></>,
    chevron: <><path d="m7 10 5 5 5-5"/></>,
    file: <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z"/><path d="M14 3v6h6M8 13h8M8 17h6"/></>,
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/></>,
    sliders: <><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2" fill="white"/><circle cx="15" cy="12" r="2" fill="white"/><circle cx="8" cy="18" r="2" fill="white"/></>,
    sparkle: <><path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z"/></>,
  };
  return <svg {...common}>{paths[name] ?? paths.spark}</svg>;
}

function formatMoney(value?: number) {
  if (!value) return "Not listed";
  return `$${Math.round(value / 1000)}k`;
}

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
}

export default function ReferralApp() {
  const [data, setData] = useState<AppData>(() => createSeed());
  const [hydrated, setHydrated] = useState(false);
  const [page, setPage] = useState<Page>("home");
  const [modal, setModal] = useState<Modal>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | OpportunityStatus>("all");
  const [toast, setToast] = useState("");
  const [completedAction, setCompletedAction] = useState(false);

  useEffect(() => {
    setData(loadData());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveData(data);
  }, [data, hydrated]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!modal && !selected) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (modal) setModal(null);
      else setSelected(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [modal, selected]);

  useEffect(() => {
    const handlers: [string, Page][] = [["navigate-career", "career"], ["navigate-network", "network"], ["navigate-research", "research"]];
    const listeners = handlers.map(([eventName, destination]) => {
      const listener = () => setPage(destination);
      window.addEventListener(eventName, listener);
      return [eventName, listener] as const;
    });
    return () => listeners.forEach(([eventName, listener]) => window.removeEventListener(eventName, listener));
  }, []);

  const industry = industries[data.industry];
  const visibleOpportunities = useMemo(() => {
    const base = data.opportunities.filter((item) => item.industry === data.industry);
    return base.filter((item) => filter === "all" || item.status === filter).sort((a, b) => scoreOpportunity(b, data).total - scoreOpportunity(a, data).total);
  }, [data, filter]);
  const ranked = useMemo(() => data.opportunities.filter((item) => item.industry === data.industry).map((item) => ({ opportunity: item, score: scoreOpportunity(item, data) })).sort((a, b) => b.score.total - a.score.total), [data]);
  const selectedOpportunity = data.opportunities.find((item) => item.id === selected) ?? null;
  const limits = planLimits[data.plan];

  function update(patch: Partial<AppData>) {
    setData((current) => ({ ...current, ...patch }));
  }

  function changeIndustry(industryId: IndustryId) {
    if (industryId === data.industry) return;
    saveData(data);
    setData(loadWorkspace(industryId));
    setPage("home");
    setSelected(null);
    setCompletedAction(false);
    setToast(`${industries[industryId].label} profile selected`);
  }

  function addOpportunity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canAddOpportunity(data)) {
      setModal("upgrade");
      return;
    }
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") || "").trim();
    const company = String(form.get("company") || "").trim();
    const opportunity: Opportunity = {
      id: crypto.randomUUID(), industry: data.industry, title, company,
      location: String(form.get("location") || "Not specified"), arrangement: String(form.get("arrangement") || "Not specified"),
      salaryMin: Number(form.get("salaryMin")) || undefined, salaryMax: Number(form.get("salaryMax")) || undefined,
      summary: String(form.get("summary") || "Role added by you."),
      requirements: String(form.get("requirements") || "").split(",").map((item) => item.trim()).filter(Boolean),
      skills: String(form.get("requirements") || "").split(",").map((item) => item.trim()).filter(Boolean),
      sourceUrl: String(form.get("sourceUrl") || ""), sourceName: "User added", postedLabel: "Added just now", status: "saved", nextAction: "Review role fit", nextActionDate: localDateString(), signal: "explore",
    };
    update({ opportunities: [opportunity, ...data.opportunities] });
    setModal(null);
    setSelected(opportunity.id);
    setPage("opportunities");
    setToast("Opportunity added to your pipeline");
  }

  function addEvidence(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const item: EvidenceItem = {
      id: crypto.randomUUID(), kind: form.get("kind") as EvidenceItem["kind"], title: String(form.get("title") || "").trim(), detail: String(form.get("detail") || "").trim(), source: String(form.get("source") || "Career note"), provenance: "user-provided", verified: false, createdAt: localDateString(),
    };
    update({ evidence: [item, ...data.evidence] });
    setModal(null);
    setToast("Evidence saved as user-provided");
  }

  function addContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (data.contacts.length >= limits.contacts) {
      setModal("upgrade");
      return;
    }
    const form = new FormData(event.currentTarget);
    const contact: Contact = {
      id: crypto.randomUUID(), name: String(form.get("name") || "").trim(), role: String(form.get("role") || "").trim(), company: String(form.get("company") || "").trim(), context: String(form.get("context") || ""), source: "User added", lastInteraction: "Not yet connected",
    };
    update({ contacts: [contact, ...data.contacts] });
    setModal(null);
    setToast("Contact added to your network");
  }

  function updateStatus(id: string, status: OpportunityStatus) {
    update({ opportunities: data.opportunities.map((item) => item.id === id ? { ...item, status } : item) });
    setToast("Pipeline status updated");
  }

  function resetDemo() {
    const next = resetForIndustry(data.industry);
    setData(next);
    setModal(null);
    setPage("home");
    setSelected(null);
    setToast("Demo workspace restored");
  }

  if (!hydrated) return <div className="loading-shell"><span className="brand-mark">r</span><p>Opening your workspace…</p></div>;

  return (
    <div className="app-shell" style={{ "--accent": industry.accent, "--accent-soft": industry.soft } as React.CSSProperties}>
      <aside className="sidebar">
        <div className="brand-row"><span className="brand-mark">r</span><span className="brand-name">referral</span><span className="brand-beta">BETA</span></div>
        <div className="workspace-label">ACTIVE WORKSPACE</div>
        <div className="industry-picker-wrap">
          <label htmlFor="industry-picker" className="sr-only">Switch demo workspace</label>
          <select id="industry-picker" className="industry-picker" value={data.industry} onChange={(event) => changeIndustry(event.target.value as IndustryId)}>
            {industryOrder.map((id) => <option value={id} key={id}>{industries[id].label}</option>)}
          </select>
          <span className="picker-chevron"><Icon name="chevron" size={15}/></span>
        </div>
        <div className="sidebar-focus"><span className="focus-dot"/>{industry.focus}</div>
        <div className="nav-label">WORKSPACE</div>
        <nav className="main-nav" aria-label="Main navigation">
          {navItems.map((item) => <button key={item.id} className={`nav-item ${page === item.id ? "active" : ""}`} aria-label={item.label} title={item.label} onClick={() => { setPage(item.id); setSelected(null); }}><Icon name={item.icon}/><span>{item.label}</span>{item.id === "opportunities" && <span className="nav-count">{data.opportunities.filter((opp) => opp.industry === data.industry).length}</span>}</button>)}
        </nav>
        <div className="sidebar-spacer"/>
        <div className="sidebar-tip">
          <div className="tip-icon"><Icon name="spark" size={17}/></div>
          <div className="tip-title">Make the next move count.</div>
          <p>One thoughtful step beats ten rushed applications.</p>
        </div>
        <div className="sidebar-profile">
          <div className="avatar">{initials(data.profileName)}</div>
          <div className="profile-mini"><strong>{data.profileName}</strong><span>{data.profileRole}</span></div>
          <button className="icon-button small" aria-label="Open profile settings" onClick={() => setPage("career")}><Icon name="sliders" size={16}/></button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><span className="crumb-slash">/</span><strong>{pageTitle(page)}</strong></div>
          <label className="top-industry-wrap"><span className="sr-only">Active workspace</span><select className="top-industry-select" value={data.industry} onChange={(event) => changeIndustry(event.target.value as IndustryId)}>{industryOrder.map((id) => <option value={id} key={id}>{industries[id].label}</option>)}</select><span className="top-industry-dot"/></label>
          <div className="topbar-actions">
            <span className="local-badge" aria-label="Local demo, no login" title="Local-only demo. Changes stay in this browser; avoid entering sensitive career information."><span className="local-dot"/>Local demo · no login</span>
            <button className={`plan-pill ${data.plan}`} onClick={() => setModal("upgrade")}><span className="plan-star">✦</span>{limits.label}<Icon name="chevron" size={13}/></button>
            <button className="avatar top-avatar" aria-label="Open career profile" onClick={() => setPage("career")}>{initials(data.profileName)}</button>
          </div>
        </header>

        <div className="content-wrap">
          {page === "home" && <Dashboard data={data} ranked={ranked} onAdd={() => setModal("opportunity")} onOpen={(id) => { setSelected(id); setPage("opportunities"); }} completedAction={completedAction} onComplete={() => { setCompletedAction(true); setToast("Action marked complete"); }} />}
          {page === "opportunities" && <Opportunities data={data} opportunities={visibleOpportunities} filter={filter} setFilter={setFilter} onAdd={() => setModal("opportunity")} onOpen={setSelected} />}
          {page === "career" && <Career data={data} onAddEvidence={() => setModal("evidence")} onUpdate={(patch) => update(patch)} />}
          {page === "network" && <Network data={data} onAdd={() => setModal("contact")} />}
          {page === "research" && <Research industry={industry} data={data} onAddOpportunity={() => setModal("opportunity")} />}
        </div>
      </main>

      {selectedOpportunity && <OpportunityDrawer opportunity={selectedOpportunity} data={data} score={scoreOpportunity(selectedOpportunity, data)} onClose={() => setSelected(null)} onStatus={(status) => updateStatus(selectedOpportunity.id, status)} onContact={() => { setSelected(null); setPage("network"); }} />}
      {modal && <ModalLayer modal={modal} data={data} onClose={() => setModal(null)} onAddOpportunity={addOpportunity} onAddEvidence={addEvidence} onAddContact={addContact} onPlan={(plan) => { update({ plan }); setModal(null); setToast(`${plan === "paid" ? "Paid" : "Free"} demo plan selected`); }} onReset={resetDemo} />}
      {toast && <div className="toast" role="status"><span className="toast-check"><Icon name="check" size={15}/></span>{toast}</div>}
    </div>
  );
}

function pageTitle(page: Page) {
  return ({ home: "Overview", opportunities: "Opportunities", career: "Career profile", network: "Network", research: "Research" })[page];
}

function Dashboard({ data, ranked, onAdd, onOpen, completedAction, onComplete }: { data: AppData; ranked: { opportunity: Opportunity; score: ReturnType<typeof scoreOpportunity> }[]; onAdd: () => void; onOpen: (id: string) => void; completedAction: boolean; onComplete: () => void }) {
  const best = ranked[0];
  const active = ranked.filter(({ opportunity }) => !["offer"].includes(opportunity.status)).length;
  const upcoming = ranked.filter(({ opportunity }) => opportunity.nextActionDate && opportunity.nextActionDate <= addLocalDays(2)).length;
  return <>
    <div className="welcome-row">
      <div><div className="eyebrow"><span className="eyebrow-dot"/>YOUR CAREER, IN FOCUS</div><h1>Good morning, {data.profileName.split(" ")[0]}.</h1><p className="welcome-sub">A considered next step starts with seeing what matters.</p></div>
      <button className="button button-primary" onClick={onAdd}><Icon name="plus" size={17}/> Add opportunity</button>
    </div>
    <div className="stat-grid">
      <div className="stat-card"><div className="stat-label">In your pipeline <span className="stat-icon"><Icon name="briefcase" size={16}/></span></div><div className="stat-value">{active}<span className="stat-unit"> opportunities</span></div><div className="stat-foot"><span className="positive-dot"/>Across {new Set(ranked.map(({ opportunity }) => opportunity.company)).size} organizations</div></div>
      <div className="stat-card"><div className="stat-label">Strong alignment <span className="stat-icon"><Icon name="spark" size={16}/></span></div><div className="stat-value">{ranked.filter(({ score }) => score.total >= 75).length}<span className="stat-unit"> to explore</span></div><div className="stat-foot">Based on your goals and evidence</div></div>
      <div className="stat-card"><div className="stat-label">Needs your attention <span className="stat-icon"><Icon name="clock" size={16}/></span></div><div className="stat-value">{upcoming}<span className="stat-unit"> next steps</span></div><div className="stat-foot">The next two days</div></div>
    </div>
    <div className="dashboard-grid">
      <section className="panel opportunity-panel">
        <div className="section-heading"><div><div className="section-kicker">A SHORTLIST, NOT A FIREHOSE</div><h2>Worth a closer look</h2></div><button className="text-button" onClick={() => onOpen("__all__")}>See all <Icon name="arrow" size={15}/></button></div>
        <div className="shortlist">
          {ranked.slice(0, 3).map(({ opportunity, score }, index) => <button className="shortlist-row" key={opportunity.id} onClick={() => onOpen(opportunity.id)}>
            <div className={`company-monogram mono-${index}`}>{initials(opportunity.company)}</div>
            <div className="shortlist-main"><div className="shortlist-title">{opportunity.title}</div><div className="shortlist-meta">{opportunity.company}<span>·</span>{opportunity.location}</div><div className="fit-note"><span className="fit-check"><Icon name="check" size={12}/></span>{score.matches.length ? `${score.matches[0]} connects to your experience` : "A possible next step for your goals"}</div></div>
            <div className="fit-score"><strong>{score.total}</strong><span>fit</span></div><Icon name="arrow" size={16}/>
          </button>)}
          {ranked.length === 0 && <EmptyState title="Start with one opportunity" body="Add a role you’re considering. Referral will connect it to your goals and evidence." action="Add opportunity" onAction={onAdd}/>}
        </div>
        <div className="panel-footer-note"><Icon name="shield" size={15}/> Scores are decision support, not a prediction of hiring outcomes.</div>
      </section>
      <aside className="side-stack">
        <section className="action-card">
          <div className="action-card-top"><span className="action-label"><span className="action-live"/>YOUR MOST VALUABLE NEXT STEP</span><span className="action-number">01</span></div>
          {best ? <><h3>{completedAction ? "Nice work. Your next step is clear." : nextActionFor(best.opportunity, data)}</h3><p>{completedAction ? `You’ve recorded progress on ${best.opportunity.company}.` : `For ${best.opportunity.company} · ${best.opportunity.title}`}</p><div className="action-reason"><span className="reason-icon"><Icon name="spark" size={15}/></span><span>{best.score.matches.length ? `Your ${best.score.matches.slice(0, 2).join(" and ")} experience gives you a credible place to start.` : "Learn a little more about the role before deciding."}</span></div><button className="button button-light" onClick={onComplete} disabled={completedAction}><Icon name={completedAction ? "check" : "arrow"} size={15}/>{completedAction ? "Completed" : "Mark step complete"}</button></> : <><h3>Build your first opportunity shortlist.</h3><p>Add one role to get a focused next step.</p><button className="button button-light" onClick={onAdd}><Icon name="plus" size={15}/> Add role</button></>}
        </section>
        <section className="goal-card"><div className="goal-card-heading"><span className="goal-mark"><Icon name="spark" size={15}/></span><span>YOUR NORTH STAR</span><button className="icon-button small" aria-label="Edit your goals" onClick={() => { window.dispatchEvent(new CustomEvent("open-career-goals")); }}><Icon name="arrow" size={15}/></button></div><p>“{data.goalSummary}”</p><button className="goal-link" onClick={() => window.dispatchEvent(new CustomEvent("navigate-career"))}>View career goals <Icon name="arrow" size={14}/></button></section>
      </aside>
    </div>
    <div className="bottom-row"><div className="bottom-heading"><div><div className="section-kicker">KEEP YOUR MOMENTUM</div><h2>Small steps add up</h2></div><span className="streak-note">A little progress, thoughtfully made.</span></div>
      <div className="momentum-grid"><div className="momentum-item"><div className="momentum-check"><Icon name="check" size={14}/></div><div><strong>Ground your story</strong><span>{data.evidence.length} evidence items saved</span></div><button className="momentum-arrow" onClick={() => window.dispatchEvent(new CustomEvent("navigate-career"))}><Icon name="arrow" size={16}/></button></div><div className="momentum-item"><div className="momentum-check muted"><Icon name="users" size={14}/></div><div><strong>Keep relationships warm</strong><span>{data.contacts.length} people in your network</span></div><button className="momentum-arrow" onClick={() => window.dispatchEvent(new CustomEvent("navigate-network"))}><Icon name="arrow" size={16}/></button></div><div className="momentum-item"><div className="momentum-check muted"><Icon name="search" size={14}/></div><div><strong>Stay curious about your field</strong><span>Save a source for a useful research brief</span></div><button className="momentum-arrow" onClick={() => window.dispatchEvent(new CustomEvent("navigate-research"))}><Icon name="arrow" size={16}/></button></div></div>
    </div>
  </>;
}

function Opportunities({ data, opportunities, filter, setFilter, onAdd, onOpen }: { data: AppData; opportunities: Opportunity[]; filter: string; setFilter: (value: "all" | OpportunityStatus) => void; onAdd: () => void; onOpen: (id: string) => void }) {
  const filters: { id: "all" | OpportunityStatus; label: string }[] = [{ id: "all", label: "All roles" }, { id: "saved", label: "Saved" }, { id: "researching", label: "Researching" }, { id: "applied", label: "Applied" }, { id: "interview", label: "Interviewing" }];
  return <>
    <div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-dot"/>YOUR NEXT MOVE</div><h1>Opportunities</h1><p>Roles with a reason to be on your radar.</p></div><button className="button button-primary" onClick={onAdd}><Icon name="plus" size={17}/> Add opportunity</button></div>
    <div className="opportunity-summary"><div className="op-summary-copy"><strong>{opportunities.length} roles</strong><span>in your {industries[data.industry].label.toLowerCase()} workspace</span></div><div className="filter-row">{filters.map((item) => <button key={item.id} className={`filter-chip ${filter === item.id ? "selected" : ""}`} onClick={() => setFilter(item.id)}>{item.label}</button>)}</div></div>
    <div className="opportunity-list">{opportunities.map((opportunity) => {
      const score = scoreOpportunity(opportunity, data);
      return <button className="opportunity-card" key={opportunity.id} onClick={() => onOpen(opportunity.id)}>
        <div className="company-monogram opportunity-mono">{initials(opportunity.company)}</div><div className="op-card-content"><div className="op-card-top"><div><h3>{opportunity.title}</h3><div className="company-line">{opportunity.company}<span>·</span>{opportunity.location}</div></div><span className={`status-chip status-${opportunity.status}`}>{statusLabel(opportunity.status)}</span></div><p>{opportunity.summary}</p><div className="op-card-bottom"><div className="op-tags"><span><Icon name="pin" size={13}/>{opportunity.arrangement}</span><span><Icon name="clock" size={13}/>{opportunity.postedLabel}</span><span><Icon name="file" size={13}/>{opportunity.sourceName}</span></div><div className="card-score"><span className="score-ring">{score.total}</span><span>fit</span></div></div><div className="op-next"><span className="next-dot"/><span>Next: {nextActionFor(opportunity, data)}</span><span className="next-date">{opportunity.nextActionDate}</span></div></div>
      </button>;
    })}{opportunities.length === 0 && <EmptyState title="No roles in this view yet" body="Add an opportunity manually or switch to another status filter." action="Add opportunity" onAction={onAdd}/>}</div>
    <div className="source-footnote"><Icon name="shield" size={15}/><span>Free-first by design. Your entries are user-provided; external sources will be labeled when added.</span></div>
  </>;
}

function Career({ data, onAddEvidence, onUpdate }: { data: AppData; onAddEvidence: () => void; onUpdate: (patch: Partial<AppData>) => void }) {
  const [editGoals, setEditGoals] = useState(false);
  const [editProfile, setEditProfile] = useState(false);
  const [goalSummary, setGoalSummary] = useState(data.goalSummary);
  const [profileRole, setProfileRole] = useState(data.profileRole);
  const [targetRoles, setTargetRoles] = useState(data.targetRoles.join(", "));
  const [weights, setWeights] = useState(data.goalWeights);
  useEffect(() => {
    const goalsHandler = () => setEditGoals(true);
    window.addEventListener("open-career-goals", goalsHandler);
    return () => window.removeEventListener("open-career-goals", goalsHandler);
  }, []);
  return <>
    <div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-dot"/>YOUR FOUNDATION</div><h1>Career profile</h1><p>Keep the evidence behind your next chapter close at hand.</p></div><button className="button button-primary" onClick={onAddEvidence}><Icon name="plus" size={17}/> Add evidence</button></div>
    <section className="profile-hero panel"><div className="profile-hero-avatar">{initials(data.profileName)}</div><div className="profile-hero-copy">{editProfile ? <form className="inline-edit-form" onSubmit={(event) => { event.preventDefault(); onUpdate({ profileRole, targetRoles: targetRoles.split(",").map((item) => item.trim()).filter(Boolean) }); setEditProfile(false); }}><label>Your current role<input value={profileRole} onChange={(event) => setProfileRole(event.target.value)}/></label><label>Roles you’re targeting<input value={targetRoles} onChange={(event) => setTargetRoles(event.target.value)} placeholder="Separate roles with commas"/></label><button className="button button-primary button-small">Save profile</button></form> : <><div className="profile-name-row"><h2>{data.profileName}</h2><span className="verified-chip"><Icon name="check" size={12}/>Your profile</span></div><div className="profile-role-line">{data.profileRole} <span>·</span><Icon name="pin" size={14}/>{data.location}</div><div className="role-chips">{data.targetRoles.length ? data.targetRoles.map((role) => <span key={role}>{role}</span>) : <span className="empty-role-chip">Add a target role</span>}</div></>} </div><button className="text-button profile-edit" onClick={() => setEditProfile((value) => !value)}>{editProfile ? "Cancel" : "Edit profile"}</button></section>
    <div className="career-grid"><section className="panel evidence-panel"><div className="panel-heading"><div><div className="section-kicker">WHAT YOU CAN PROVE</div><h2>Evidence library <span className="count-pill">{data.evidence.length}</span></h2></div><button className="icon-button" aria-label="Add career evidence" onClick={onAddEvidence}><Icon name="plus"/></button></div><p className="panel-intro">Every claim starts with its source. New items are clearly marked until you verify them.</p><div className="evidence-list">{data.evidence.map((item) => <article className="evidence-item" key={item.id}><div className={`evidence-icon evidence-${item.kind}`}><Icon name={item.kind === "achievement" ? "spark" : item.kind === "credential" ? "shield" : "file"} size={16}/></div><div className="evidence-copy"><div className="evidence-title-row"><h3>{item.title}</h3><span className={`provenance ${item.verified ? "verified" : "unverified"}`}>{item.verified ? "Reviewed" : "Review needed"}</span></div><p>{item.detail}</p><div className="evidence-source"><Icon name="file" size={12}/>{item.source}<span>·</span>{item.provenance}</div></div></article>)}</div></section>
      <div className="career-side"><section className="panel goal-panel"><div className="panel-heading"><div><div className="section-kicker">DIRECTION, NOT A DESTINATION</div><h2>Career goals</h2></div><button className="icon-button" aria-label="Edit goals" onClick={() => setEditGoals((value) => !value)}><Icon name="sliders" size={17}/></button></div>{editGoals ? <form className="goal-edit-form" onSubmit={(event) => { event.preventDefault(); onUpdate({ goalSummary, targetRoles: targetRoles.split(",").map((item) => item.trim()).filter(Boolean), goalWeights: weights }); setEditGoals(false); }}><label>What are you working toward?<textarea rows={4} value={goalSummary} onChange={(event) => setGoalSummary(event.target.value)}/></label><label>Target roles<input value={targetRoles} onChange={(event) => setTargetRoles(event.target.value)}/></label><div className="weight-edit-title">What matters most? <small>Weights are normalized during scoring.</small></div>{(["capability", "growth", "compensation", "mission", "access"] as const).map((key) => <label className="weight-line" key={key}><span>{({ capability: "Experience fit", growth: "Goal alignment", compensation: "Compensation", mission: "Growth & learning", access: "Relationship access" })[key]}</span><input type="number" min="0" max="100" value={weights[key]} onChange={(event) => setWeights({ ...weights, [key]: Number(event.target.value) })}/><span>%</span></label>)}<button className="button button-primary button-small">Save goals</button></form> : <><p className="goal-quote">“{data.goalSummary}”</p><div className="goal-weight-list">{[["Experience fit", data.goalWeights.capability], ["Goal alignment", data.goalWeights.growth], ["Compensation", data.goalWeights.compensation], ["Growth & learning", data.goalWeights.mission], ["Relationship access", data.goalWeights.access]].map(([label, value]) => <div className="weight-row" key={label as string}><span>{label}</span><div className="weight-track"><i style={{ width: `${value}%` }}/></div><strong>{value}%</strong></div>)}</div><div className="goal-foot"><Icon name="spark" size={14}/>Adjust weights any time; scores update with them.</div></>}</section>
      <section className="trust-note"><span className="trust-icon"><Icon name="shield" size={17}/></span><div><strong>Grounded in what’s true</strong><p>AI suggestions will stay separate from your verified facts. You stay in control of every claim.</p></div></section></div></div>
  </>;
}

function Network({ data, onAdd }: { data: AppData; onAdd: () => void }) {
  return <>
    <div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-dot"/>RELATIONSHIPS, WITH CONTEXT</div><h1>Your network</h1><p>People matter more when you remember how you know them.</p></div><button className="button button-primary" onClick={onAdd}><Icon name="plus" size={17}/> Add contact</button></div>
    <div className="network-summary"><div className="network-stat"><strong>{data.contacts.length}</strong><span>people in your Rolodex</span></div><div className="network-stat"><strong>{new Set(data.contacts.map((contact) => contact.company)).size}</strong><span>organizations represented</span></div><div className="network-note"><Icon name="shield" size={17}/><span>Connections are only shown when you add them. Referral never assumes a relationship.</span></div></div>
    <div className="contact-list">{data.contacts.map((contact, index) => <article className="contact-card" key={contact.id}><div className={`contact-avatar contact-color-${index % 4}`}>{initials(contact.name)}</div><div className="contact-info"><h3>{contact.name}</h3><div className="contact-role">{contact.role}<span>·</span>{contact.company}</div><p>{contact.context}</p><div className="contact-metadata"><span><Icon name="file" size={12}/>{contact.source}</span><span><Icon name="clock" size={12}/>{contact.lastInteraction}</span></div></div><button className="button button-outline button-small" onClick={() => { navigator.clipboard?.writeText(`${contact.name} · ${contact.role} at ${contact.company}`); }}>Copy details</button></article>)}</div>
    <div className="source-footnote"><Icon name="shield" size={15}/><span>Contact details and relationship notes stay in this browser’s local demo data.</span></div>
  </>;
}

function Research({ industry, data, onAddOpportunity }: { industry: (typeof industries)[IndustryId]; data: AppData; onAddOpportunity: () => void }) {
  const [url, setUrl] = useState("");
  const [saved, setSaved] = useState<{ url: string; date: string }[]>([]);
  const [error, setError] = useState("");
  const sourceStorageKey = `${SOURCE_STORAGE_PREFIX}${data.industry}`;
  useEffect(() => {
    try { setSaved(JSON.parse(localStorage.getItem(sourceStorageKey) || "[]")); } catch { setSaved([]); }
  }, [sourceStorageKey]);
  function saveSource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") throw new Error("Use a web address beginning with https://");
      const next = [{ url: parsed.href, date: localDateString() }, ...saved];
      setSaved(next);
      localStorage.setItem(sourceStorageKey, JSON.stringify(next));
      setUrl(""); setError("");
    } catch { setError("Enter a valid http or https URL."); }
  }
  return <>
    <div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-dot"/>CONTEXT YOU CAN TRACE</div><h1>Research</h1><p>Keep useful sources close to the decision they inform.</p></div><button className="button button-outline" onClick={onAddOpportunity}><Icon name="plus" size={17}/> Add role to research</button></div>
    <div className="research-grid"><section className="panel source-panel"><div className="section-kicker">SOURCE REGISTRY</div><h2>Save a source</h2><p className="panel-intro">Add a public company, role, or industry page. This demo stores the link only; it does not fetch or summarize external content.</p><form className="source-form" onSubmit={saveSource}><label htmlFor="source-url">Source URL</label><div className="source-input-row"><input id="source-url" type="url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://company.com/news"/><button className="button button-primary">Save source</button></div>{error && <span className="field-error">{error}</span>}</form><div className="source-list-heading">Saved sources <span>{saved.length}</span></div>{saved.length ? saved.map((item) => <article className="saved-source" key={`${item.url}-${item.date}`}><span className="source-favicon"><Icon name="external" size={15}/></span><div><a href={item.url} target="_blank" rel="noreferrer">{new URL(item.url).hostname}<Icon name="external" size={12}/></a><span>{item.url}</span></div><time>{item.date}</time></article>) : <div className="source-empty"><Icon name="search" size={21}/><strong>No sources saved yet</strong><span>Links you save will appear here with the date you added them.</span></div>}</section>
      <aside className="research-side"><section className="industry-context"><div className="context-eyebrow">{industries[data.industry].label.toUpperCase()} LENS</div><h3>Research worth keeping current</h3><p>{industry.sourceHint}</p><div className="context-rule"/><div className="context-example"><span>START WITH</span><strong>{industries[data.industry].roleExamples[0]}</strong></div><div className="context-footer"><Icon name="shield" size={14}/> Sources will show provenance and freshness.</div></section><section className="panel research-note"><div className="note-icon"><Icon name="spark" size={17}/></div><h3>Why this source?</h3><p>Connect research to a specific opportunity or question. A saved URL alone isn’t evidence of hiring intent.</p><button className="text-button" onClick={onAddOpportunity}>Choose an opportunity <Icon name="arrow" size={14}/></button></section></aside></div>
  </>;
}

function OpportunityDrawer({ opportunity, data, score, onClose, onStatus, onContact }: { opportunity: Opportunity; data: AppData; score: ReturnType<typeof scoreOpportunity>; onClose: () => void; onStatus: (status: OpportunityStatus) => void; onContact: () => void }) {
  return <div className="drawer-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><aside className="opportunity-drawer" aria-label={`${opportunity.company} opportunity details`}><div className="drawer-top"><span className="section-kicker">OPPORTUNITY REVIEW</span><button className="icon-button" onClick={onClose} aria-label="Close opportunity details"><Icon name="close"/></button></div><div className="drawer-company"><div className="company-monogram drawer-mono">{initials(opportunity.company)}</div><span>{opportunity.company}</span></div><h2>{opportunity.title}</h2><div className="drawer-meta"><span><Icon name="pin" size={14}/>{opportunity.location}</span><span><Icon name="clock" size={14}/>{opportunity.postedLabel}</span></div><p className="drawer-summary">{opportunity.summary}</p><div className="drawer-score-card"><div className="drawer-score-number">{score.total}<span>/100</span></div><div><strong>Role alignment</strong><span>Decision support · {score.confidence}% confidence</span></div><div className="score-label">{score.total >= 78 ? "Strong fit" : score.total >= 62 ? "Worth exploring" : "Needs a closer look"}</div></div>
    <section className="drawer-section"><div className="drawer-section-title"><h3>Why it surfaced</h3><span>From your profile</span></div><div className="breakdown-list">{[["Experience fit", score.capability], ["Goal alignment", score.goals], ["Growth potential", score.growth], ["Compensation", score.compensation], ["Relationship access", score.access]].map(([label, value]) => <div className="breakdown-row" key={label as string}><span>{label}</span><div className="breakdown-track"><i style={{ width: `${value}%` }}/></div><strong>{value}</strong></div>)}</div></section>
    <section className="drawer-section evidence-match-section"><div className="drawer-section-title"><h3>Evidence & gaps</h3><span>{score.matches.length} matched</span></div>{score.matches.length ? <div className="match-pills">{score.matches.map((match) => <span className="match-pill" key={match}><Icon name="check" size={12}/>{match}</span>)}</div> : <p className="muted-copy">No direct evidence match yet. Review the requirements and add career evidence where relevant.</p>}{score.gaps.length > 0 && <div className="gap-note"><span className="gap-mark">?</span><span>Evidence to check: <strong>{score.gaps.join(", ")}</strong></span></div>}</section>
    <section className="drawer-section"><div className="drawer-section-title"><h3>Pipeline</h3><span>Next: {opportunity.nextActionDate}</span></div><label className="drawer-select-label" htmlFor="op-status">Status</label><select id="op-status" className="drawer-select" value={opportunity.status} onChange={(event) => onStatus(event.target.value as OpportunityStatus)}>{(["saved", "researching", "applied", "interview", "offer"] as OpportunityStatus[]).map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}</select><p className="next-action-detail"><Icon name="spark" size={14}/>{nextActionFor(opportunity, data)}</p></section>
    <div className="drawer-actions"><button className="button button-primary" onClick={onContact}><Icon name="users" size={16}/> View network paths</button>{opportunity.sourceUrl && <a className="button button-outline" href={opportunity.sourceUrl} target="_blank" rel="noreferrer">Open source <Icon name="external" size={14}/></a>}</div>
    <div className="drawer-hint"><Icon name="shield" size={14}/>A strong fit score is not a prediction of hiring outcomes.</div></aside></div>;
}

function ModalLayer({ modal, data, onClose, onAddOpportunity, onAddEvidence, onAddContact, onPlan, onReset }: { modal: Exclude<Modal, null>; data: AppData; onClose: () => void; onAddOpportunity: (event: FormEvent<HTMLFormElement>) => void; onAddEvidence: (event: FormEvent<HTMLFormElement>) => void; onAddContact: (event: FormEvent<HTMLFormElement>) => void; onPlan: (plan: "free" | "paid") => void; onReset: () => void }) {
  const dialogRef = useRef<HTMLElement>(null);
  const title = modal === "opportunity" ? "Add an opportunity" : modal === "evidence" ? "Add career evidence" : modal === "contact" ? "Add a contact" : "Your Referral plan";
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    const selector = "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";
    const focusables = () => Array.from(dialog?.querySelectorAll<HTMLElement>(selector) ?? []);
    (dialog?.querySelector<HTMLElement>("[autofocus]") ?? focusables()[0])?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { onClose(); return; }
      if (event.key !== "Tab") return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section ref={dialogRef} className={`modal-card ${modal === "upgrade" ? "plan-modal" : ""}`} role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-header"><div><div className="section-kicker">{modal === "upgrade" ? "SIMPLE BY DESIGN" : "YOUR WORKSPACE"}</div><h2 id="modal-title">{title}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close dialog"><Icon name="close"/></button></div>
    {modal === "opportunity" && <form className="modal-form" onSubmit={onAddOpportunity}><p className="modal-intro">Capture a role you’re considering. You can add detail as you learn more.</p><div className="form-grid"><label className="span-2">Job title<input name="title" required placeholder="e.g. Staff Software Engineer" autoFocus/></label><label>Organization<input name="company" required placeholder="Company name"/></label><label>Location<input name="location" placeholder="Remote · US"/></label><label>Work arrangement<select name="arrangement"><option>Remote</option><option>Hybrid</option><option>On-site</option><option>Not specified</option></select></label><label>Source URL<input name="sourceUrl" type="url" placeholder="https://…"/></label><label>Salary minimum<input name="salaryMin" type="number" placeholder="160000"/></label><label>Salary maximum<input name="salaryMax" type="number" placeholder="200000"/></label><label className="span-2">What stands out?<textarea name="summary" rows={2} placeholder="One sentence about the role or why it caught your attention."/></label><label className="span-2">Requirements / skills <span className="label-note">Separate with commas</span><input name="requirements" placeholder="TypeScript, platform architecture, team leadership"/></label></div><div className="form-footer"><span><Icon name="shield" size={14}/>Added as user-provided information</span><button className="button button-primary"><Icon name="plus" size={15}/> Save opportunity</button></div></form>}
    {modal === "evidence" && <form className="modal-form" onSubmit={onAddEvidence}><p className="modal-intro">Save the specific work, skill, or credential you can stand behind.</p><div className="form-grid"><label>Evidence type<select name="kind"><option value="achievement">Achievement</option><option value="skill">Skill</option><option value="credential">Credential</option><option value="experience">Experience</option></select></label><label>Source<input name="source" placeholder="Resume, review, certificate…"/></label><label className="span-2">Title<input name="title" required placeholder="e.g. Led a migration that cut deploy time by 42%" autoFocus/></label><label className="span-2">Supporting detail<textarea name="detail" rows={3} placeholder="Add context and any measurable outcome." required/></label></div><div className="provenance-warning"><Icon name="shield" size={15}/><span>This will be marked <strong>user-provided</strong> and “Review needed” until verified.</span></div><div className="form-footer"><span>Only you can edit this item.</span><button className="button button-primary">Save evidence</button></div></form>}
    {modal === "contact" && <form className="modal-form" onSubmit={onAddContact}><p className="modal-intro">Add someone you know and how you know them. No connection is assumed.</p><div className="form-grid"><label>Name<input name="name" required placeholder="Full name" autoFocus/></label><label>Current role<input name="role" placeholder="Their role"/></label><label className="span-2">Organization<input name="company" placeholder="Where they work"/></label><label className="span-2">How do you know them?<textarea name="context" rows={3} placeholder="Shared project, former teammate, professional group…"/></label></div><div className="provenance-warning"><Icon name="shield" size={15}/><span>Contact relationship is recorded as <strong>user-provided</strong>.</span></div><div className="form-footer"><span>{data.contacts.length}/{planLimits[data.plan].contacts} contacts on {planLimits[data.plan].label}</span><button className="button button-primary">Add contact</button></div></form>}
    {modal === "upgrade" && <div className="plan-choice-wrap"><p className="modal-intro">A useful career workflow should work at every level. Choose a demo plan to explore the limits and features. This prototype does not collect payment.</p><div className="plan-choice-grid">{(["free", "paid"] as const).map((plan) => <article className={`plan-choice ${data.plan === plan ? "current" : ""}`} key={plan}><div className="plan-choice-top"><span className={`plan-mini ${plan}`}>{plan === "free" ? "FREE" : "PAID"}</span>{data.plan === plan && <span className="current-label">CURRENT</span>}</div><h3>{plan === "free" ? "Good foundations" : "More room to move"}</h3><p>{plan === "free" ? "A focused place to connect your profile, goals, and opportunities." : "More research and tailored career materials as your search deepens."}</p><ul>{plan === "free" ? <><li>10 active opportunities</li><li>25 people in your network</li><li>3 AI drafts and 3 briefs / month</li><li>Manual research and scoring</li></> : <><li>100 active opportunities</li><li>250 people in your network</li><li>30 AI drafts and 50 briefs / month</li><li>Advanced role and company briefs</li></>}</ul><button className={`button ${plan === data.plan ? "button-outline" : "button-primary"}`} onClick={() => onPlan(plan)}>{plan === data.plan ? "Selected" : `Preview ${plan === "free" ? "Free" : "Paid"}`}</button></article>)}</div><div className="plan-data-note"><Icon name="shield" size={15}/><span>Switching the demo plan does not change or delete your saved data. Pricing and billing aren’t connected.</span></div><button className="reset-demo" onClick={onReset}>Restore synthetic demo workspace</button></div>}
  </section></div>;
}

function EmptyState({ title, body, action, onAction }: { title: string; body: string; action: string; onAction: () => void }) {
  return <div className="empty-state"><div className="empty-icon"><Icon name="spark" size={19}/></div><h3>{title}</h3><p>{body}</p><button className="button button-outline button-small" onClick={onAction}>{action}<Icon name="arrow" size={14}/></button></div>;
}

function statusLabel(status: OpportunityStatus) {
  return ({ saved: "Saved", researching: "Researching", applied: "Applied", interview: "Interviewing", offer: "Offer" })[status];
}
