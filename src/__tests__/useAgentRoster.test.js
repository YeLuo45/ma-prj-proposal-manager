import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAgentRoster } from '../hooks/useAgentRoster';

describe('useAgentRoster', () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = vi.fn();
  });

  it('returns default roster when localStorage is empty and fetch fails', async () => {
    global.fetch.mockRejectedValue(new Error('network down'));
    const { result } = renderHook(() => useAgentRoster());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.source).toBe('default');
    expect(result.current.roster.length).toBeGreaterThan(0);
    expect(result.current.roster[0]).toHaveProperty('id');
    expect(result.current.roster[0]).toHaveProperty('scope');
  });

  it('uses localStorage roster when present', async () => {
    const custom = [
      { id: 'bot', name: 'Bot', role: 'bot', icon: '🤖', color: '#000', initials: 'B', description: '', scope: [] },
    ];
    localStorage.setItem('ma_agent_roster', JSON.stringify(custom));
    const { result } = renderHook(() => useAgentRoster());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.source).toBe('localStorage');
    expect(result.current.roster).toEqual(custom);
  });

  it('agentForStage finds the agent that owns a given stage', async () => {
    global.fetch.mockRejectedValue(new Error('network'));
    const { result } = renderHook(() => useAgentRoster());
    await waitFor(() => expect(result.current.loading).toBe(false));
    const agent = result.current.agentForStage('in_dev');
    expect(agent).not.toBeNull();
    expect(agent.role).toBe('dev');
  });

  it('agentForStage routes research_direction_pending to market_research', async () => {
    global.fetch.mockRejectedValue(new Error('network'));
    const { result } = renderHook(() => useAgentRoster());
    await waitFor(() => expect(result.current.loading).toBe(false));
    const agent = result.current.agentForStage('research_direction_pending');
    expect(agent).not.toBeNull();
    expect(agent.role).toBe('market_research');
  });

  it('agentForStage routes ideation to designer', async () => {
    global.fetch.mockRejectedValue(new Error('network'));
    const { result } = renderHook(() => useAgentRoster());
    await waitFor(() => expect(result.current.loading).toBe(false));
    const agent = result.current.agentForStage('ideation');
    expect(agent).not.toBeNull();
    expect(agent.role).toBe('designer');
  });

  it('default roster has 7 agents covering all proposal stages', async () => {
    global.fetch.mockRejectedValue(new Error('network'));
    const { result } = renderHook(() => useAgentRoster());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.roster).toHaveLength(7);
    const coveredStages = new Set();
    result.current.roster.forEach(a => (a.scope || []).forEach(s => coveredStages.add(s)));
    // Verify each main stage has an owner
    for (const stage of [
      'research_direction_pending', 'intake', 'ideation', 'clarifying',
      'prd_pending_confirmation', 'in_dev', 'in_test_acceptance',
      'accepted', 'delivered',
    ]) {
      expect(coveredStages.has(stage)).toBe(true);
    }
  });

  it('agentById returns the matching agent', async () => {
    global.fetch.mockRejectedValue(new Error('network'));
    const { result } = renderHook(() => useAgentRoster());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.agentById('pm').name).toBe('PM');
    expect(result.current.agentById('nonexistent')).toBeNull();
  });

  it('saveRoster persists to localStorage and updates source', async () => {
    global.fetch.mockRejectedValue(new Error('network'));
    const { result } = renderHook(() => useAgentRoster());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const next = [{ id: 'x', name: 'X', role: 'x', icon: 'X', color: '#000', initials: 'X', description: '', scope: [] }];
    act(() => result.current.saveRoster(next));
    expect(JSON.parse(localStorage.getItem('ma_agent_roster'))).toEqual(next);
    expect(result.current.source).toBe('localStorage');
  });
});
