import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMcp } from '../hooks/useMcp';
import { useAgentRoster } from '../hooks/useAgentRoster';
import { useHandoffs, deriveActorList } from '../hooks/useHandoffs';

/**
 * AgentDashboard — per-agent view of:
 *   1. The agent's own scope: proposals in stages this agent owns
 *   2. Recent handoffs: the last 5 audit-log events for any
 *      proposal where the agent is the current owner
 */
export function AgentDashboard() {
  const { agentId } = useParams();
  const mcp = useMcp();
  const { roster, agentById } = useAgentRoster();
  const agent = agentById(agentId);

  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!agent) return;
    let cancel = false;
    setLoading(true);
    (async () => {
      try {
        const res = await mcp.call('list_proposals', {});
        const all = parseMcpResult(res);
        // Filter: agent owns this proposal if its stage is in agent.scope
        // OR its owner field matches agent.name
        const owned = all.filter(p => {
          const stage = p.stage || p.status;
          const owner = (p.owner || '').toLowerCase();
          const nameMatch = owner === agent.name.toLowerCase()
            || owner === agent.id
            || (agent.name && owner.includes(agent.name.toLowerCase()));
          const stageMatch = (agent.scope || []).includes(stage);
          return stageMatch || nameMatch;
        });
        if (!cancel) {
          setProposals(owned);
          setError(null);
        }
      } catch (e) {
        if (!cancel) setError(e);
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [agent, mcp]);

  if (!agent) {
    return (
      <div className="p-6">
        <h1 className="text-xl">Agent not found: <code>{agentId}</code></h1>
        <Link to="/agents" className="text-blue-600 underline">← back to roster</Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-3xl"
          style={{ backgroundColor: agent.color + '22' }}
        >
          {agent.icon}
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: agent.color }}>
            {agent.name}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {agent.role} · scope: {(agent.scope || []).join(', ')}
          </p>
        </div>
        <div className="ml-auto text-right">
          <div className="text-3xl font-bold" style={{ color: agent.color }}>
            {proposals.length}
          </div>
          <div className="text-xs text-gray-500">in queue</div>
        </div>
      </div>

      <p className="text-gray-700 dark:text-gray-300 mb-6">
        {agent.description}
      </p>

      {loading && <div className="text-gray-500">Loading proposals…</div>}
      {error && (
        <div className="p-3 rounded bg-red-50 text-red-700 text-sm">
          Error: {error.message}
        </div>
      )}

      {!loading && !error && (
        <>
          {proposals.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-2">✨</div>
              <div>No proposals in {agent.name}'s queue right now.</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {proposals.map(p => (
                <ProposalRow key={p.id} proposal={p} agent={agent} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ProposalRow({ proposal, agent }) {
  return (
    <Link
      to={`/proposal/${proposal.id}`}
      className="block rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-3">
        <div className="text-xs font-mono text-gray-500 flex-shrink-0">
          {proposal.id}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
            {proposal.title || '(untitled)'}
          </h3>
          <div className="mt-1 flex flex-wrap gap-2 text-xs">
            <span
              className="px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: agent.color + '22', color: agent.color }}
            >
              {proposal.stage || proposal.status || 'unknown'}
            </span>
            {proposal.project_name && (
              <span className="text-gray-500">
                {proposal.project_name}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
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
