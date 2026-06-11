# Changelog

## v1.1.0 (2026-06-12) — Add market_research and designer agents

### Why

The initial v1.0.0 release had 5 agents but missed two important roles:

- **market_research** — the ai-superpower state machine has
  `research_direction_pending` and `research` as legitimate stages. Without
  an agent owning them, proposals in those stages had no clear owner.
- **designer** — the state machine has `ideation` between intake and
  clarifying. Without an agent, this design-brainstorming phase had no
  clear owner.

Boss flagged this omission (2026-06-12). v1.1.0 adds both agents and
splits the overloaded scopes:

### Changes

- **NEW agent**: `market_research` (🔍 cyan) — owns
  `research_direction_pending`, `research` stages
- **NEW agent**: `designer` (💡 orange) — owns `ideation` stage
- **coordinator** scope: `['intake', 'clarifying']` → `['intake']`
  (clarifying moved to pm)
- **pm** scope: `['prd_pending_confirmation']` →
  `['clarifying', 'prd_pending_confirmation']`
- **dev** scope: `['in_dev']` → `['in_tdd_test', 'in_dev']`
- **boss** scope: `['accepted', 'deployed', 'delivered']` →
  `['accepted', 'needs_revision', 'deployed', 'delivered']`
- **tests**: 3 new tests (28 total, was 25)
  - `agentForStage routes research_direction_pending to market_research`
  - `agentForStage routes ideation to designer`
  - `default roster has 7 agents covering all proposal stages`

### Migration from v1.0.0

If you have a `localStorage` override `ma_agent_roster` from v1.0.0,
add the two new agents or call `resetRoster()` to pick up the new defaults.
