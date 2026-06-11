import { useState, useEffect, useCallback } from 'react';
import { useMcp } from './useMcp';

/**
 * useHandoffs — given a proposal_id, fetches the audit log entries
 * for that proposal and reconstructs the chain of agents who
 * touched it (CREATE → UPDATE → status transitions).
 *
 * Each handoff record:
 *   { ts, op, field, old, new, actor }
 *
 * The current owner of a proposal is its `owner` field, but the
 * `actor` in audit log gives historical context.
 */
export function useHandoffs(proposalId) {
  const mcp = useMcp();
  const [handoffs, setHandoffs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!proposalId) {
      setHandoffs([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Use the new get_audit MCP tool, filter by proposal_id
      const res = await mcp.call('get_audit', { entity: 'proposal' });
      const all = Array.isArray(res?.content)
        ? res.content.map(c => {
            try { return JSON.parse(c.text); } catch { return null; }
          }).filter(Boolean)
        : [];
      const filtered = all.filter(e => e.id === proposalId);
      filtered.sort((a, b) => String(a.ts).localeCompare(String(b.ts)));
      setHandoffs(filtered);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [mcp, proposalId]);

  useEffect(() => { load(); }, [load]);

  return { handoffs, loading, error, reload: load };
}

/**
 * deriveActorList — collapse a handoff list into a unique ordered
 * list of actors (the agents who touched the proposal).
 */
export function deriveActorList(handoffs) {
  const seen = new Map();
  for (const h of handoffs) {
    const actor = h.actor || 'unknown';
    if (!seen.has(actor)) {
      seen.set(actor, { actor, firstSeen: h.ts, events: 0 });
    }
    seen.get(actor).events += 1;
  }
  return Array.from(seen.values());
}
