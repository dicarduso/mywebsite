import { useMemo, useState } from "react";
import analysisData from "../data/phishing-analysis.json";
import obfuscatedSource from "../data/obfuscated-phish.js?raw";
import deobfuscatedSource from "../data/deobfusvated-phish.js?raw";

type Impact = "Critical" | "High" | "Medium" | "Low";

interface NodeData {
  id: string;
  label: string;
  type: "root" | "category" | "leaf";
  category?: string;
  impact?: Impact;
  description?: string;
  mitigation?: string;
  code?: string;
  codeObfuscated?: string;
  codeDeobfuscated?: string;
  children?: NodeData[];
}

interface AnalysisBundle {
  htmlStructure: NodeData;
  obfuscated: NodeData;
}

type View = "root" | "obf-choose" | "html" | "full" | "functions";

const bundle = analysisData as AnalysisBundle;

const impactStyles: Record<Impact, string> = {
  Critical: "border-red-500/35 bg-red-500/10 text-red-300",
  High: "border-orange-500/35 bg-orange-500/10 text-orange-300",
  Medium: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  Low: "border-sky-400/30 bg-sky-400/10 text-sky-300",
};

const impactDots: Record<Impact, string> = {
  Critical: "bg-red-400",
  High: "bg-orange-400",
  Medium: "bg-amber-300",
  Low: "bg-sky-400",
};

function leaves(node: NodeData): NodeData[] {
  if (!node.children?.length) return node.type === "leaf" ? [node] : [];
  return node.children.flatMap(leaves);
}

const obfRoot = bundle.obfuscated;
const htmlRoot = bundle.htmlStructure;
const obfLeaves = leaves(obfRoot);
const htmlLeaves = leaves(htmlRoot);
const allLeaves = [...htmlLeaves, ...obfLeaves];

const matchesQuery = (node: NodeData, query: string) => {
  if (!query) return true;
  const haystack = [
    node.label,
    node.category,
    node.impact,
    node.description,
    node.mitigation,
    node.code,
    node.codeObfuscated,
    node.codeDeobfuscated,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
};

function filterTree(
  node: NodeData,
  query: string,
  impact: "All" | Impact,
): NodeData | null {
  if (node.type === "leaf") {
    const impactOk = impact === "All" || node.impact === impact;
    return impactOk && matchesQuery(node, query) ? node : null;
  }

  const children = (node.children ?? [])
    .map((child) => filterTree(child, query, impact))
    .filter((child): child is NodeData => Boolean(child));

  if (children.length) return { ...node, children };

  if (node.type === "category" && matchesQuery(node, query) && impact === "All") {
    return node;
  }

  return null;
}

function TreeToggle({
  expanded,
  onToggle,
  label,
}: {
  expanded: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      className="flex w-full items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 py-3 text-left transition-colors hover:border-[#D12B18]/40 hover:bg-white/[0.04]"
    >
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-white/10 bg-[#161616] text-[10px] text-[var(--white-icon)] transition-transform ${
          expanded ? "rotate-90" : ""
        }`}
        aria-hidden="true"
      >
        ▶
      </span>
      <span className="flex-1 text-sm font-medium text-white">{label}</span>
    </button>
  );
}

function EvidenceBlock({
  label,
  code,
  copied,
  onCopy,
  wrap = false,
}: {
  label: string;
  code: string;
  copied?: boolean;
  onCopy?: () => void;
  /** Wrap long lines instead of clipping them past the pane edge. */
  wrap?: boolean;
}) {
  return (
    <div className="flex min-h-0 flex-col">
      {onCopy ? (
        <div className="mb-1.5 flex items-center justify-between gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--white-icon)]">
            {label}
          </span>
          <button
            type="button"
            onClick={onCopy}
            className="shrink-0 rounded border border-white/10 px-2 py-1 font-mono text-[10px] text-[var(--white-icon)] transition-colors hover:border-[#D12B18]/40 hover:text-white"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      ) : null}
      <pre
        className={`min-h-0 flex-1 overflow-auto rounded-lg border border-white/10 bg-[#080808] p-3 text-[11px] leading-relaxed text-emerald-300 ${
          wrap ? "whitespace-pre-wrap [overflow-wrap:anywhere]" : ""
        }`}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}

function MenuBlock({
  tag,
  title,
  subtitle,
  onClick,
}: {
  tag: string;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex flex-1 flex-col items-start gap-2 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-[#D12B18]/50 hover:bg-white/[0.05] hover:shadow-[0_24px_70px_-36px_rgba(209,43,24,0.55)]"
    >
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D12B18]/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden="true"
      />
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#F3705F]">
        {tag}
      </span>
      <span className="text-lg font-medium text-white">{title}</span>
      <span className="text-sm leading-relaxed text-white/55">{subtitle}</span>
      <span className="mt-3 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--white-icon)] transition-colors group-hover:text-white">
        explore
        <span
          className="transition-transform duration-300 group-hover:translate-x-1"
          aria-hidden="true"
        >
          →
        </span>
      </span>
    </button>
  );
}

function BackButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-white/70 transition-colors hover:border-[#D12B18]/50 hover:text-white"
    >
      <span aria-hidden="true">←</span>
      {label}
    </button>
  );
}

function ViewHeader({ tag, title }: { tag: string; title: string }) {
  return (
    <div className="min-w-0">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#F3705F]">
        {tag}
      </p>
      <h3 className="mt-1 truncate text-base font-medium text-white">{title}</h3>
    </div>
  );
}

export default function PhishingGraph() {
  const [view, setView] = useState<View>("root");
  const [query, setQuery] = useState("");
  const [impact, setImpact] = useState<"All" | Impact>("All");
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(["root", "obfuscation-shell", "entry-point-helpers"]),
  );
  const [selected, setSelected] = useState<NodeData | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // The tree being explored in the current view.
  const activeTree: NodeData | null =
    view === "functions" ? obfRoot : view === "html" ? htmlRoot : null;
  const activeLeaves = useMemo(
    () => (activeTree ? leaves(activeTree) : []),
    [activeTree],
  );

  const normalizedQuery = query.trim().toLowerCase();
  const isFiltering = normalizedQuery.length > 0 || impact !== "All";

  const visibleTree = useMemo(
    () => (activeTree ? filterTree(activeTree, normalizedQuery, impact) : null),
    [activeTree, normalizedQuery, impact],
  );

  const visibleLeafCount = useMemo(
    () => (visibleTree ? leaves(visibleTree).length : 0),
    [visibleTree],
  );

  const criticalCount = useMemo(
    () => allLeaves.filter((leaf) => leaf.impact === "Critical").length,
    [],
  );

  // Switching views resets every filter/selection so no stale state leaks.
  const changeView = (next: View) => {
    setView(next);
    setSelected(null);
    setQuery("");
    setImpact("All");
    if (next === "functions") {
      setExpanded(
        new Set(["root", "obfuscation-shell", "entry-point-helpers"]),
      );
    } else if (next === "html") {
      setExpanded(new Set(["root", ...htmlRoot.children?.map((c) => c.id) ?? []]));
    }
  };

  const toggle = (id: string) => {
    setExpanded((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const copyCode = async (code: string, key: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(key);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      setCopied(null);
    }
  };

  const renderChildren = (node: NodeData, depth = 0) => (
    <ul className="space-y-1.5">
      {(node.children ?? []).map((child) => {
        const isCategory = child.type === "category";
        const isExpanded = isFiltering || expanded.has(child.id);
        const childLeaves = leaves(child);

        if (isCategory) {
          return (
            <li key={child.id}>
              <TreeToggle
                expanded={isExpanded}
                onToggle={() => {
                  // Collapsing a category also deselects any behaviour inside it.
                  if (
                    isExpanded &&
                    selected &&
                    leaves(child).some((leaf) => leaf.id === selected.id)
                  ) {
                    setSelected(null);
                  }
                  toggle(child.id);
                }}
                label={child.label}
              />
              <div className="ml-3 flex items-center gap-2 pb-1 pl-3 pt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--white-icon)]">
                <span>{childLeaves.length} nodes</span>
                {childLeaves.some((leaf) => leaf.impact === "Critical") && (
                  <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-red-300">
                    critical
                  </span>
                )}
              </div>
              {isExpanded && (
                <div className="ml-3 border-l border-white/[0.08] pl-3">
                  {renderChildren(child, depth + 1)}
                </div>
              )}
            </li>
          );
        }

        const isSelected = selected?.id === child.id;

        return (
          <li key={child.id}>
            <button
              type="button"
              onClick={() =>
                setSelected((current) =>
                  current?.id === child.id ? null : child,
                )
              }
              aria-pressed={isSelected}
              className={`group flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                isSelected
                  ? "border-[#D12B18]/50 bg-[#D12B18]/10"
                  : "border-transparent hover:border-white/10 hover:bg-white/[0.03]"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                  child.impact ? impactDots[child.impact] : "bg-[var(--white-icon)]"
                }`}
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-mono text-xs text-white/85 group-hover:text-white">
                  {child.label}
                </span>
                <span className="mt-0.5 block truncate text-[10px] text-[var(--white-icon)]">
                  {child.category}
                </span>
              </span>
              {child.impact && (
                <span
                  className={`hidden shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-medium sm:inline ${impactStyles[child.impact]}`}
                >
                  {child.impact}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );

  const renderTreeArea = () => {
    if (!visibleTree || activeLeaves.length === 0) {
      return (
        <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
          <p className="text-sm text-white/70">
            {activeLeaves.length === 0
              ? "This analysis is not populated yet."
              : "No matching behaviours."}
          </p>
          <p className="mt-1 max-w-md text-xs text-[var(--white-icon)]">
            {activeLeaves.length === 0
              ? 'Add entries under "htmlStructure" in src/data/phishing-analysis.json (HTTP headers, meta tags, form structure, injected scripts…). The graph then renders exactly like the obfuscated analysis.'
              : "Try a broader search or reset the impact filter."}
          </p>
          {activeLeaves.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setImpact("All");
              }}
              className="mt-4 rounded-full border border-white/15 px-4 py-2 text-xs text-white transition-colors hover:border-[#D12B18]/50"
            >
              Reset filters
            </button>
          )}
        </div>
      );
    }

    return (
      <>
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--white-icon)]">
            attack surface map
          </p>
          {isFiltering && (
            <span className="rounded-full border border-[#D12B18]/30 bg-[#D12B18]/10 px-2.5 py-0.5 font-mono text-[10px] text-[#F3705F]">
              {visibleLeafCount} match{visibleLeafCount === 1 ? "" : "es"}
            </span>
          )}
        </div>
        {renderChildren(visibleTree)}
      </>
    );
  };

  const renderImpactScale = () => (
    <div className="flex shrink-0 flex-row flex-wrap gap-2 lg:w-44 lg:flex-col lg:justify-center">
      <p className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--white-icon)] lg:mb-0.5 lg:block">
        impact scale
      </p>
      {(Object.keys(impactStyles) as Impact[]).map((level) => (
        <span
          key={level}
          className="flex items-center justify-between gap-2 rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2 font-mono text-[10px] text-white/70"
        >
          <span className="flex items-center gap-2">
            <span
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${impactDots[level]}`}
            />
            {level}
          </span>
          <span className="text-[var(--white-icon)]">
            {activeLeaves.filter((leaf) => leaf.impact === level).length}
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a]">
      <div className="grid gap-px bg-white/[0.06] sm:grid-cols-3">
        {[
          { label: "behaviours", value: String(allLeaves.length) },
          {
            label: "categories",
            value: String(
              (obfRoot.children?.length ?? 0) + (htmlRoot.children?.length ?? 0),
            ),
          },
          { label: "critical findings", value: String(criticalCount) },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#0a0a0a] px-4 py-3">
            <p className="font-mono text-lg font-medium text-white">
              {stat.value}
            </p>
            <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--white-icon)]">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* ROOT — the two analysis blocks */}
      {view === "root" && (
        <div className="flex flex-col gap-4 p-6 lg:flex-row lg:items-stretch">
          <MenuBlock
            tag="analysis 01"
            title="HTTP headers and HTML structure"
            subtitle="How the kit's landing page announces itself: response headers, meta tags, form structure, and the raw HTML skeleton of the phishing page."
            onClick={() => changeView("html")}
          />
          <MenuBlock
            tag="analysis 02"
            title="Obfuscated Analysis"
            subtitle="Inside the payload: the full obfuscated file versus its deobfuscated twin, plus a function-by-function breakdown of the kit's behaviour."
            onClick={() => changeView("obf-choose")}
          />
        </div>
      )}

      {/* OBFUSCATED — choose between the full files and the function tree */}
      {view === "obf-choose" && (
        <div className="flex flex-col gap-4 p-6">
          <div className="flex items-center justify-between gap-3">
            <ViewHeader
              tag="obfuscated analysis"
              title="Choose how you want to explore the payload"
            />
            <BackButton label="back" onClick={() => changeView("root")} />
          </div>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
            <MenuBlock
              tag="mode a"
              title="Full file comparison"
              subtitle="The complete obfuscated file and its deobfuscated counterpart, side by side in equal panes. Scroll through all of it, line by line."
              onClick={() => changeView("full")}
            />
            <MenuBlock
              tag="mode b"
              title="Functions"
              subtitle="A behaviour tree of every function the kit defines — pick one to inspect its obfuscated code with an explanation beside it."
              onClick={() => changeView("functions")}
            />
          </div>
        </div>
      )}

      {/* FULL FILE COMPARISON — equal-size side-by-side panes */}
      {view === "full" && (
        <div className="flex flex-col gap-4 p-6">
          <div className="flex items-center justify-between gap-3">
            <ViewHeader
              tag="full file comparison"
              title="Obfuscated vs deobfuscated — the complete files"
            />
            <BackButton
              label="back"
              onClick={() => changeView("obf-choose")}
            />
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="flex h-[70vh] min-h-[560px] flex-col">
              <EvidenceBlock
                label="obfuscated — full file"
                code={obfuscatedSource}
                copied={copied === "obf-file"}
                onCopy={() => copyCode(obfuscatedSource, "obf-file")}
              />
            </div>
            <div className="flex h-[70vh] min-h-[560px] flex-col">
              <EvidenceBlock
                label="deobfuscated — full file"
                code={deobfuscatedSource}
                copied={copied === "deobf-file"}
                onCopy={() => copyCode(deobfuscatedSource, "deobf-file")}
              />
            </div>
          </div>
        </div>
      )}

      {/* FUNCTIONS / HTML — tree with the impact scale beside the selection block */}
      {(view === "functions" || view === "html") && (
        <>
          <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-start">
            <div className="flex min-w-0 flex-1 flex-col items-start gap-3">
              <div className="flex w-full flex-wrap items-center justify-between gap-3">
                <ViewHeader
                  tag={
                    view === "functions"
                      ? "obfuscated analysis · functions"
                      : "html structure analysis"
                  }
                  title={
                    view === "functions"
                      ? obfRoot.label
                      : htmlRoot.label
                  }
                />
                <BackButton
                  label={view === "functions" ? "obfuscated analysis" : "back"}
                  onClick={() =>
                    changeView(view === "functions" ? "obf-choose" : "root")
                  }
                />
              </div>
              {activeLeaves.length > 0 && (
                <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center">
                  <label className="relative flex-1">
                    <span className="sr-only">Search analysis nodes</span>
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--white-icon)]"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search behaviours, categories, or code…"
                      className="w-full rounded-lg border border-white/10 bg-white/[0.03] py-2.5 pl-9 pr-9 text-sm text-white placeholder:text-white/25 focus:border-[#D12B18]/60 focus:outline-none focus:ring-2 focus:ring-[#D12B18]/20"
                    />
                    {query && (
                      <button
                        type="button"
                        onClick={() => setQuery("")}
                        aria-label="Clear search"
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[var(--white-icon)] hover:text-white"
                      >
                        ✕
                      </button>
                    )}
                  </label>
                  <select
                    value={impact}
                    onChange={(event) =>
                      setImpact(event.target.value as "All" | Impact)
                    }
                    className="shrink-0 rounded-lg border border-white/10 bg-[#0d0d0d] px-3 py-2.5 text-xs text-white/80 focus:border-[#D12B18]/60 focus:outline-none"
                  >
                    <option value="All">All impact levels</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Selection block + impact scale side by side */}
          <div className="flex flex-col gap-4 border-y border-white/[0.07] p-4 lg:flex-row lg:items-stretch">
            <div className="min-w-0 flex-1">
              <div className="max-h-[620px] overflow-y-auto">
                {renderTreeArea()}
              </div>
            </div>
            {activeLeaves.length > 0 && renderImpactScale()}
          </div>

          {/* Detail window: obfuscated code only, explanation beside it */}
          <div className="p-4">
            {selected ? (
              <div className="analysis-window flex flex-col rounded-2xl border border-white/10 bg-[#0d0d0d]">
                <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/[0.07] px-4 py-3">
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--white-icon)]">
                      selected function
                    </p>
                    <h3 className="mt-1 truncate font-mono text-sm text-white">
                      {selected.label}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    aria-label="Close details"
                    className="shrink-0 rounded-full p-1 text-[var(--white-icon)] transition-colors hover:bg-white/5 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex flex-col gap-3 p-4">
                  <div className="flex max-h-[70vh] min-h-0 flex-col">
                    {selected.codeObfuscated ? (
                      <EvidenceBlock
                        label="obfuscated (original)"
                        code={selected.codeObfuscated}
                        wrap
                        copied={copied === "obfuscated"}
                        onCopy={() =>
                          copyCode(selected.codeObfuscated ?? "", "obfuscated")
                        }
                      />
                    ) : (
                      <div className="flex min-h-[96px] flex-col items-center justify-center rounded-lg border border-dashed border-white/[0.08] px-4 text-center">
                        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--white-icon)]">
                          obfuscated snippet not added yet
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#F3705F]">
                      Analysis
                    </p>
                    <p className="mt-1.5 max-h-[40vh] overflow-y-auto text-xs leading-relaxed text-white/70">
                      {selected.description ||
                        "Explanation will be added here later."}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-[72px] items-center justify-center rounded-2xl border border-dashed border-white/[0.07] px-4 py-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--white-icon)]">
                  click a function to inspect its code — click it again to close
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
