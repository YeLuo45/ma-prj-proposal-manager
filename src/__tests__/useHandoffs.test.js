import { describe, it, expect } from 'vitest';
import { deriveActorList } from '../hooks/useHandoffs';

describe('deriveActorList', () => {
  it('returns empty list for empty handoffs', () => {
    expect(deriveActorList([])).toEqual([]);
  });

  it('collapses handoffs into unique actors with event counts', () => {
    const handoffs = [
      { ts: '2026-06-10T10:00:00Z', actor: 'coordinator' },
      { ts: '2026-06-10T11:00:00Z', actor: 'pm' },
      { ts: '2026-06-10T12:00:00Z', actor: 'coordinator' },
      { ts: '2026-06-10T13:00:00Z', actor: 'pm' },
      { ts: '2026-06-10T14:00:00Z', actor: 'pm' },
    ];
    const actors = deriveActorList(handoffs);
    expect(actors).toHaveLength(2);

    const coord = actors.find(a => a.actor === 'coordinator');
    expect(coord.events).toBe(2);
    expect(coord.firstSeen).toBe('2026-06-10T10:00:00Z');

    const pm = actors.find(a => a.actor === 'pm');
    expect(pm.events).toBe(3);
  });

  it('handles missing actor field', () => {
    const handoffs = [
      { ts: '2026-06-10T10:00:00Z' }, // no actor
    ];
    const actors = deriveActorList(handoffs);
    expect(actors).toHaveLength(1);
    expect(actors[0].actor).toBe('unknown');
  });
});
