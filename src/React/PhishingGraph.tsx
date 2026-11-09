import { useMemo, useState } from "react";
import analysisData from "../data/phishing-analysis.json";

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

const root = analysisData as NodeData;

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

const allLeaves = leaves(root);
const totalCategories = root.children?.length ?? 0;

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
}: {
  label: string;
  code: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="mt-4">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--white-icon)]">
          {label}
        </span>
        <button
          type="button"
          onClick={onCopy}
          className="rounded border border-white/10 px-2 py-1 font-mono text-[10px] text-[var(--white-icon)] transition-colors hover:border-[#D12B18]/40 hover:text-white"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="max-h-52 overflow-auto rounded-lg border border-white/10 bg-[#080808] p-3 text-[11px] leading-relaxed text-emerald-300">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function PhishingGraph() {
  const [query, setQuery] = useState("");
  const [impact, setImpact] = useState<"All" | Impact>("All");
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(["root", "obfuscation-shell", "entry-point-helpers"]),
  );
  const [selected, setSelected] = useState<NodeData | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const normalizedQuery = query.trim().toLowerCase();
  const isFiltering = normalizedQuery.length > 0 || impact !== "All";

  const visibleTree = useMemo(
    () => filterTree(root, normalizedQuery, impact),
    [normalizedQuery, impact],
  );

  const visibleLeafCount = useMemo(
    () => (visibleTree ? leaves(visibleTree).length : 0),
    [visibleTree],
  );

  const criticalCount = useMemo(
    () => allLeaves.filter((leaf) => leaf.impact === "Critical").length,
    [],
  );

  const toggle = (id: string) => {
    setExpanded((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    const next = new Set<string>();
    const walk = (node: NodeData) => {
      if (node.children?.length) {
        next.add(node.id);
        node.children.forEach(walk);
      }
    };
    walk(root);
    setExpanded(next);
  };

  const collapseAll = () => setExpanded(new Set(["root"]));

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
                onToggle={() => toggle(child.id)}
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
              onClick={() => setSelected(child)}
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

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a]">
      <div className="grid gap-px bg-white/[0.06] sm:grid-cols-3">
        {[
          { label: "behaviours", value: String(allLeaves.length) },
          { label: "categories", value: String(totalCategories) },
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

      <div className="flex flex-col gap-3 border-y border-white/[0.07] p-4 lg:flex-row lg:items-center">
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

        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="impact-filter">
            Filter by impact
          </label>
          <select
            id="impact-filter"
            value={impact}
            onChange={(event) =>
              setImpact(event.target.value as "All" | Impact)
            }
            className="rounded-lg border border-white/10 bg-[#0d0d0d] px-3 py-2.5 text-xs text-white/80 focus:border-[#D12B18]/60 focus:outline-none"
          >
            <option value="All">All impact levels</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <button
            type="button"
            onClick={expandAll}
            className="rounded-lg border border-white/10 px-3 py-2.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--white-icon)] transition-colors hover:border-[#D12B18]/40 hover:text-white"
          >
            Expand all
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="rounded-lg border border-white/10 px-3 py-2.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--white-icon)] transition-colors hover:border-[#D12B18]/40 hover:text-white"
          >
            Collapse
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px]">
        <div className="max-h-[620px] overflow-y-auto p-4">
          {visibleTree ? (
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
          ) : (
            <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
              <p className="text-sm text-white/70">No matching behaviours.</p>
              <p className="mt-1 text-xs text-[var(--white-icon)]">
                Try a broader search or reset the impact filter.
              </p>
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
            </div>
          )}
        </div>

        <aside className="border-t border-white/[0.07] bg-[#0d0d0d]/60 p-4 lg:border-l lg:border-t-0">
          {selected ? (
            <div className="flex h-full flex-col">
              <div className="flex items-start justify-between gap-3 border-b border-white/[0.07] pb-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--white-icon)]">
                    selected behaviour
                  </p>
                  <h3 className="mt-1 break-words font-mono text-sm text-white">
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

              <div className="mt-3 flex flex-wrap gap-1.5">
                {selected.category && (
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 font-mono text-[10px] text-white/70">
                    {selected.category}
                  </span>
                )}
                {selected.impact && (
                  <span
                    className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] ${impactStyles[selected.impact]}`}
                  >
                    {selected.impact} impact
                  </span>
                )}
              </div>

              {selected.description && (
                <p className="mt-4 text-[13px] leading-relaxed text-white/70">
                  {selected.description}
                </p>
              )}

              {selected.mitigation && (
                <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.06] p-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-emerald-300">
                    defensive angle
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-white/70">
                    {selected.mitigation}
                  </p>
                </div>
              )}

              {selected.codeDeobfuscated && (
                <EvidenceBlock
                  label="deobfuscated"
                  code={selected.codeDeobfuscated}
                  copied={copied === "deobfuscated"}
                  onCopy={() =>
                    copyCode(selected.codeDeobfuscated ?? "", "deobfuscated")
                  }
                />
              )}

              {selected.codeObfuscated && (
                <EvidenceBlock
                  label="obfuscated (original)"
                  code={selected.codeObfuscated}
                  copied={copied === "obfuscated"}
                  onCopy={() =>
                    copyCode(selected.codeObfuscated ?? "", "obfuscated")
                  }
                />
              )}

              {selected.code && (
                <EvidenceBlock
                  label="evidence / snippet"
                  code={selected.code}
                  copied={copied === "code"}
                  onCopy={() => copyCode(selected.code ?? "", "code")}
                />
              )}

              <p className="mt-auto pt-4 font-mono text-[10px] text-[var(--white-icon)]">
                source snippets from the analysed sample
              </p>
            </div>
          ) : (
            <div className="flex h-full flex-col">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--white-icon)]">
                inspector
              </p>
              <h3 className="mt-2 text-sm font-medium text-white">
                Select a behaviour
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-[var(--white-icon)]">
                Choose any leaf node in the tree to read the evidence and its
                impact.
              </p>

              <div className="mt-5 space-y-2">
                {(Object.keys(impactStyles) as Impact[]).map((level) => (
                  <div
                    key={level}
                    className="flex items-center justify-between rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2"
                  >
                    <span className="flex items-center gap-2 text-xs text-white/70">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${impactDots[level]}`}
                      />
                      {level}
                    </span>
                    <span className="font-mono text-[10px] text-[var(--white-icon)]">
                      {
                        allLeaves.filter((leaf) => leaf.impact === level)
                          .length
                      }
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-lg border border-[#D12B18]/20 bg-[#D12B18]/5 p-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#F3705F]">
                  tip
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-white/65">
                  Search for <code>AES</code>, <code>fetch</code>, or an
                  identifier such as <code>_0x4140</code> to jump straight to the
                  relevant behaviour.
                </p>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
