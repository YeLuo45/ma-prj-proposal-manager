import { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * AgentRoster — visual grid of all agents in the configured roster.
 * Each card shows the agent's icon, name, role, current queue count,
 * and a link to its dashboard.
 */
export function AgentRoster({ roster, stats = {} }) {
  if (!roster || roster.length === 0) {
    return <div className="text-gray-500 text-sm">No agents configured.</div>;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {roster.map(agent => (
        <AgentCard key={agent.id} agent={agent} stats={stats[agent.id] || {}} />
      ))}
    </div>
  );
}

function AgentCard({ agent, stats }) {
  return (
    <Link
      to={`/agents/${agent.id}`}
      className="block rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 hover:shadow-md transition-shadow"
      style={{ borderLeft: `4px solid ${agent.color}` }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl"
          style={{ backgroundColor: agent.color + '22' }}
        >
          {agent.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
            {agent.name}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {agent.role} · {agent.initials}
          </p>
        </div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
        {agent.description}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
        {(agent.scope || []).map(stage => (
          <span
            key={stage}
            className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          >
            {stage}
          </span>
        ))}
      </div>
      {stats.queue !== undefined && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between text-sm">
          <span className="text-gray-500">Queue</span>
          <span className="font-semibold" style={{ color: agent.color }}>
            {stats.queue}
          </span>
        </div>
      )}
    </Link>
  );
}
