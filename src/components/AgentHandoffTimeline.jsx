import { useHandoffs, deriveActorList } from '../hooks/useHandoffs';
import { useAgentRoster } from '../hooks/useAgentRoster';

/**
 * AgentHandoffTimeline — visual timeline of agents who touched a
 * proposal. Reads audit log via useHandoffs and shows each event
 * with the agent icon, op type, field changed, and timestamp.
 */
export function AgentHandoffTimeline({ proposalId }) {
  const { handoffs, loading, error } = useHandoffs(proposalId);
  const { agentById } = useAgentRoster();
  const actors = deriveActorList(handoffs);

  if (loading) {
    return <div className="text-sm text-gray-500">Loading handoff history…</div>;
  }
  if (error) {
    return (
      <div className="text-sm text-red-600">
        Error loading handoffs: {error.message}
      </div>
    );
  }
  if (handoffs.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        No handoff events recorded for {proposalId}.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-gray-500">Agents involved:</span>
        {actors.map(({ actor, events }) => {
          const ag = agentById(actor) || agentById(actor.toLowerCase());
          return (
            <span
              key={actor}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: (ag?.color || '#6b7280') + '22',
                color: ag?.color || '#6b7280',
              }}
              title={`${events} event(s)`}
            >
              <span>{ag?.icon || '👤'}</span>
              <span>{ag?.name || actor}</span>
              <span className="text-xs opacity-70">×{events}</span>
            </span>
          );
        })}
      </div>

      <ol className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-3 space-y-3">
        {handoffs.map((h, i) => {
          const ag = agentById(h.actor) || agentById((h.actor || '').toLowerCase());
          const color = ag?.color || '#6b7280';
          return (
            <li key={i} className="ml-4">
              <span
                className="absolute -left-2 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800"
                style={{ backgroundColor: color }}
              />
              <div className="text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium" style={{ color }}>
                    {ag?.icon || '👤'} {ag?.name || h.actor}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {formatTs(h.ts)}
                  </span>
                </div>
                <div className="text-gray-700 dark:text-gray-300">
                  <code className="text-xs bg-gray-100 dark:bg-gray-700 px-1 rounded">
                    {h.op}
                  </code>
                  {h.field && (
                    <span className="ml-1">
                      <span className="text-gray-500">{h.field}:</span>{' '}
                      <code className="text-xs bg-red-50 dark:bg-red-900/30 px-1 rounded line-through">
                        {h.old || '(empty)'}
                      </code>{' '}
                      →{' '}
                      <code className="text-xs bg-green-50 dark:bg-green-900/30 px-1 rounded">
                        {h.new || '(empty)'}
                      </code>
                    </span>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function formatTs(ts) {
  if (!ts) return '';
  try {
    const d = new Date(ts);
    return d.toLocaleString();
  } catch {
    return ts;
  }
}
