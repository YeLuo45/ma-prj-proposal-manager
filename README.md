# ma-prj-proposal-manager

**多智能体提案管理** — multi-agent proposal manager that adapts the `prj-proposals-manager` skill to Hermes profile multi-agent setups.

## What's different from `prj-proposals-manager`?

This is a **multi-agent (ma)** variant that adds three capabilities on top of the base skill:

| Feature | Description |
|---|---|
| **Agent Roster** (`/agents`) | Configurable list of agents (coordinator, pm, dev, test, boss). Each has icon, color, role, scope (stages they own), and initials. |
| **Per-Agent Dashboard** (`/agents/:id`) | Filtered view showing only the proposals in that agent's queue — matched by stage scope AND `owner` field. |
| **Handoff Timeline** | Reconstructs the chain of agents who touched each proposal from the audit log. Visual timeline per proposal showing each CREATE/UPDATE event with the actor. |

## Project Structure

```
ma-prj-proposal-manager/
├── config/agents.yaml             # Default agent roster (overridable)
├── public/config/agents.yaml      # Served at /config/agents.yaml
├── src/
│   ├── hooks/
│   │   ├── useAgentRoster.js     # Loads roster (localStorage > yaml > default)
│   │   ├── useHandoffs.js        # Audit log → handoff chain
│   │   └── useMcp.js             # ai-superpower MCP client (extended)
│   ├── components/
│   │   ├── AgentRoster.jsx       # Card grid view
│   │   └── AgentHandoffTimeline.jsx  # Per-proposal handoff history
│   ├── pages/
│   │   ├── Agents.jsx            # /agents page
│   │   └── AgentDashboard.jsx    # /agents/:id page
│   ├── App.jsx                   # Routes: /, /agents, /agents/:id, /project/:id
│   ├── components/Header.jsx     # + 智能体 nav link
│   └── __tests__/                # 25 vitest tests
├── package.json
├── vite.config.js
└── README.md
```

## Agent Roster

Default agents (config/agents.yaml):

| ID | Role | Scope (stages) | Color |
|---|---|---|---|
| coordinator | 协调员 | intake, clarifying | blue |
| pm | 提案经理 | prd_pending_confirmation | purple |
| dev | 开发 | in_dev | green |
| test | 测试 | in_test_acceptance, test_failed | amber |
| boss | 决策者 | accepted, deployed, delivered | red |

Edit `public/config/agents.yaml` to customize, or override in browser DevTools:
```js
localStorage.setItem('ma_agent_roster', JSON.stringify([...]))
```

## Setup

```bash
NODE_ENV=development npm install --include=dev
NODE_ENV=test npx vitest run        # 25 tests
npx vite build                      # production build
npx vite                            # dev server
```

## MCP Backend

Connects to `ai-superpower` MCP server at `http://127.0.0.1:8000/mcp/` (configurable in Settings).

New tools used (v5.0.0+):
- `list_proposals` — fetch all proposals for queue computation
- `get_audit` — fetch audit log entries for handoff timeline
- `scan_duplicate_projects` (planned) — for the dedup dashboard
- `merge_projects` (planned) — for the dedup dashboard

## Relationship to prj-proposals-manager

- **Same React/Vite stack** — drop-in compatible
- **Same MCP backend** — uses the same `ai-superpower` server
- **Additive features** — original `/` and `/project/:id` routes unchanged
- **Skill-aligned** — agent stages map 1:1 to the proposal state machine

## License

MIT
