import React, { useState } from 'react';
import analysisData from '../data/phishing-analysis.json';

interface NodeData {
  id: string;
  label: string;
  type: string;
  category?: string;
  impact?: string;
  description?: string;
  code?: string;
  children?: NodeData[];
}

export default function PhishingGraph() {
  const [expandedNodes, setExpandedNodes] = useState<string[]>(['root']);
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);

  const toggleNode = (node: NodeData) => {
    if (node.children) {
      setExpandedNodes((prev) =>
        prev.includes(node.id) ? prev.filter((id) => id !== node.id) : [...prev, node.id]
      );
    } else {
      setSelectedNode(node);
    }
  };

  const renderTree = (node: NodeData) => {
    const isExpanded = expandedNodes.includes(node.id);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id} className="ml-6 my-2">
        <button
          onClick={() => toggleNode(node)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-mono transition-all duration-200 border ${
            node.type === 'root'
              ? 'bg-[#C93F14] text-white border-[#C93F14] shadow-lg shadow-[#C93F14]/20'
              : node.type === 'category'
              ? 'bg-[#1e1e1e] text-white border-[#333] hover:border-[#C93F14]'
              : 'bg-[#141414] text-[var(--white-icon)] border-[#262626] hover:text-white hover:border-[#C93F14]'
          }`}
        >
          <span className="text-xs">
            {hasChildren ? (isExpanded ? '▼' : '►') : '●'}
          </span>
          {node.label}
        </button>

        {hasChildren && isExpanded && (
          <div className="border-l border-[#262626] ml-4 pl-2">
            {node.children!.map((child) => renderTree(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative w-full min-h-[500px] bg-[#0d0d0d] border border-[#262626] rounded-2xl p-6 overflow-hidden flex flex-col md:flex-row gap-6">
      {/* Graph */}
      <div className="flex-1 overflow-auto">
        {renderTree(analysisData as NodeData)}
      </div>

      {/* Painel Lateral de Inspecção (Drawer) */}
      {selectedNode && (
        <div className="w-full md:w-96 bg-[#141414] border border-[#262626] rounded-xl p-5 flex flex-col gap-4 animate-in fade-in duration-300">
          <div className="flex justify-between items-center border-b border-[#262626] pb-3">
            <h4 className="font-semibold text-lg text-white">{selectedNode.label}</h4>
            <button
              onClick={() => setSelectedNode(null)}
              aria-label="Fechar painel"
              className="text-gray-400 hover:text-white text-sm"
            >
              ✕
            </button>
          </div>

          {selectedNode.category && (
            <div className="flex gap-2 text-xs font-mono">
              <span className="px-2 py-1 bg-[#1e1e1e] text-[#C93F14] rounded border border-[#333]">
                {selectedNode.category}
              </span>
              <span className={`px-2 py-1 rounded border ${
                selectedNode.impact === 'Critical' ? 'bg-red-950 text-red-400 border-red-800' : 'bg-orange-950 text-orange-400 border-orange-800'
              }`}>
                {selectedNode.impact} Impact
              </span>
            </div>
          )}

          <p className="text-sm text-gray-300 leading-relaxed">
            {selectedNode.description}
          </p>

          {selectedNode.code && (
            <div className="mt-2">
              <span className="text-xs font-mono text-gray-400 block mb-1">Deobfuscated Snippet:</span>
              <pre className="bg-[#080808] border border-[#262626] p-3 rounded-lg text-xs font-mono text-emerald-400 overflow-x-auto">
                <code>{selectedNode.code}</code>
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}