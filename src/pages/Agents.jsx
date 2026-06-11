import { useEffect, useState } from 'react';
import { useMcp } from '../hooks/useMcp';
import { useAgentRoster } from '../hooks/useAgentRoster';
import { AgentRoster } from '../components/AgentRoster';

/**
 * Agents page — overview of all agents and their queue sizes.
 */
export function Agents() {
  const mcp = useMcp();
  const { roster, source, loading: rosterLoading } = useAgentRoster();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const res = await mcp.call('list_proposals', {});
        const all = parseMcpResult(res);
        const counts = {};
        for (const agent of roster) {
          counts[agent.id] = all.filter(p => {
            const stage = p.stage || p.status;
            return (agent.scope || []).includes(stage)
              || (p.owner || '').toLowerCase() === agent.name.toLowerCase()
              || (p.owner || '').toLowerCase() === agent.id;
          }).length;
        }
        if (!cancel) setStats(counts);
      } catch (e) {
        if (!cancel) setError(e);
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [roster, mcp]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">🤖 Agent Roster</h1>
          <p className="text-sm text-gray-500 mt-1">
            Multi-agent proposal workflow · source: <code>{source}</code>
          </p>
        </div>
        <a
          href="/agents/configure"
          className="text-sm text-blue-600 hover:underline"
        >
          ⚙ Configure
        </a>
      </div>

      {rosterLoading && <div className="text-gray-500">Loading roster…</div>}
      {error && (
        <div className="p-3 rounded bg-red-50 text-red-700 text-sm mb-4">
          {error.message}
        </div>
      )}
      {!rosterLoading && !error && (
        <>
          {loading ? (
            <div className="text-gray-500 text-sm">Computing queue sizes…</div>
          ) : (
            <AgentRoster roster={roster} stats={stats} />
          )}
        </>
      )}
    </div>
  );
}

function parseMcpResult(res) {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.content)) {
    return res.content.flatMap(c => {
      try {
        const data = JSON.parse(c.text);
        if (Array.isArray(data)) return data;
        if (Array.isArray(data.items)) return data.items;
        return [];
      } catch { return []; }
    });
  }
  if (Array.isArray(res.items)) return res.items;
  return [];
}
