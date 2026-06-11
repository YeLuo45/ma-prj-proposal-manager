import { useState, useEffect, useCallback } from 'react';

/**
 * useAgentRoster — loads the agent roster from one of three sources
 * (in order of preference):
 *   1. localStorage('ma_agent_roster') — admin-edited roster
 *   2. /config/agents.yaml fetched at startup — bundled defaults
 *   3. Inline DEFAULT_ROSTER fallback
 *
 * The roster is a list of:
 *   { id, name, role, icon, color, description, scope[], initials }
 *
 * scope is the proposal stages this agent owns. Filter proposals by
 * current stage to find the agent responsible.
 */
const STORAGE_KEY = 'ma_agent_roster';

const DEFAULT_ROSTER = [
  {
    id: 'market_research', name: 'Research', role: 'market_research',
    icon: '🔍', color: '#06b6d4',
    description: 'Market research, competitor analysis, feasibility study',
    scope: ['research_direction_pending', 'research'],
    initials: 'MR',
  },
  {
    id: 'coordinator', name: 'Coordinator', role: 'coordinator',
    icon: '🧭', color: '#3b82f6',
    description: 'Receives user requests, drafts proposals, coordinates the workflow',
    scope: ['intake'],
    initials: 'C',
  },
  {
    id: 'designer', name: 'Designer', role: 'designer',
    icon: '💡', color: '#f97316',
    description: 'Brainstorming + solution design (ideation phase, before PRD)',
    scope: ['ideation'],
    initials: 'Ds',
  },
  {
    id: 'pm', name: 'PM', role: 'pm',
    icon: '📋', color: '#8b5cf6',
    description: 'Generates PRD + technical expectations',
    scope: ['clarifying', 'prd_pending_confirmation'],
    initials: 'P',
  },
  {
    id: 'dev', name: 'Dev', role: 'dev',
    icon: '🛠️', color: '#10b981',
    description: 'Implements features, writes code, opens PRs',
    scope: ['in_tdd_test', 'in_dev'],
    initials: 'D',
  },
  {
    id: 'test', name: 'Test', role: 'test',
    icon: '🧪', color: '#f59e0b',
    description: 'Acceptance testing, runs test suite',
    scope: ['in_test_acceptance', 'test_failed'],
    initials: 'T',
  },
  {
    id: 'boss', name: 'Boss', role: 'boss',
    icon: '👑', color: '#ef4444',
    description: 'Decision maker, final acceptance',
    scope: ['accepted', 'needs_revision', 'deployed', 'delivered'],
    initials: 'B',
  },
];

export function useAgentRoster() {
  const [roster, setRoster] = useState(DEFAULT_ROSTER);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [source, setSource] = useState('default');

  const loadRoster = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. localStorage override
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRoster(parsed);
          setSource('localStorage');
          setLoading(false);
          return;
        }
      }
      // 2. bundled YAML — try to fetch, fall back to inline default
      try {
        const res = await fetch('/config/agents.yaml');
        if (res.ok) {
          const text = await res.text();
          // Simple YAML list-of-maps parser (one level deep, no nested anchors)
          const parsed = parseSimpleYaml(text);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setRoster(parsed);
            setSource('yaml');
            setLoading(false);
            return;
          }
        }
      } catch (_) {
        // network failure → fall through to default
      }
      // 3. inline default
      setRoster(DEFAULT_ROSTER);
      setSource('default');
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoster();
  }, [loadRoster]);

  const saveRoster = useCallback((next) => {
    setRoster(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSource('localStorage');
  }, []);

  const resetRoster = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setRoster(DEFAULT_ROSTER);
    setSource('default');
  }, []);

  // Helper: get the agent responsible for a given stage
  const agentForStage = useCallback((stage) => {
    return roster.find(a => (a.scope || []).includes(stage)) || null;
  }, [roster]);

  // Helper: get the agent by id
  const agentById = useCallback((id) => {
    return roster.find(a => a.id === id) || null;
  }, [roster]);

  return {
    roster,
    loading,
    error,
    source,
    saveRoster,
    resetRoster,
    agentForStage,
    agentById,
    reload: loadRoster,
  };
}

// Tiny YAML list-of-maps parser — enough for agents.yaml
// Format: "- key: value" lines, list items start with "- "
// Strings only; "true"/"false" → bool; numbers → number;
// inline [a, b, c] → string[]; otherwise string.
function parseSimpleYaml(text) {
  const items = [];
  const lines = text.split('\n');
  let current = null;
  for (const raw of lines) {
    const line = raw.replace(/#.*$/, '').trimEnd();
    if (!line.trim()) continue;
    if (line.startsWith('- ')) {
      if (current) items.push(current);
      current = {};
      const inline = line.slice(2).trim();
      if (inline.includes(':')) {
        const [k, ...rest] = inline.split(':');
        current[k.trim()] = parseValue(rest.join(':').trim());
      }
    } else if (line.includes(':') && current) {
      const [k, ...rest] = line.split(':');
      current[k.trim()] = parseValue(rest.join(':').trim());
    }
  }
  if (current) items.push(current);
  return items;
}

function parseValue(v) {
  if (!v) return v;
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  if (v.startsWith('[') && v.endsWith(']')) {
    return v.slice(1, -1).split(',').map(s => s.trim()).filter(Boolean);
  }
  return v;
}
