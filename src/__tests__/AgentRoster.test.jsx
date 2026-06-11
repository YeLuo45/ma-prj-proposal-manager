import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useAgentRoster } from '../hooks/useAgentRoster';
import { AgentRoster } from '../components/AgentRoster';

// Mock the hook so we don't actually fetch /config/agents.yaml
vi.mock('../hooks/useAgentRoster');

describe('AgentRoster', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders empty state when roster is empty', () => {
    useAgentRoster.mockReturnValue({ roster: [], loading: false });
    render(<MemoryRouter><AgentRoster roster={[]} /></MemoryRouter>);
    expect(screen.getByText(/no agents configured/i)).toBeInTheDocument();
  });

  it('renders a card for each agent with role and scope chips', () => {
    const roster = [
      {
        id: 'coordinator', name: 'Coordinator', role: 'coordinator',
        icon: '🧭', color: '#3b82f6', initials: 'C',
        description: 'Drafts proposals',
        scope: ['intake', 'clarifying'],
      },
      {
        id: 'pm', name: 'PM', role: 'pm',
        icon: '📋', color: '#8b5cf6', initials: 'P',
        description: 'Generates PRD',
        scope: ['prd_pending_confirmation'],
      },
    ];
    render(<MemoryRouter><AgentRoster roster={roster} /></MemoryRouter>);
    expect(screen.getByText('Coordinator')).toBeInTheDocument();
    expect(screen.getByText('PM')).toBeInTheDocument();
    expect(screen.getByText('coordinator · C')).toBeInTheDocument();
    expect(screen.getByText('intake')).toBeInTheDocument();
    expect(screen.getByText('clarifying')).toBeInTheDocument();
  });

  it('shows queue count when stats provided', () => {
    const roster = [{
      id: 'dev', name: 'Dev', role: 'dev', icon: '🛠️',
      color: '#10b981', initials: 'D', description: 'implements',
      scope: ['in_dev'],
    }];
    render(
      <MemoryRouter>
        <AgentRoster roster={roster} stats={{ dev: { queue: 7 } }} />
      </MemoryRouter>
    );
    expect(screen.getByText('7')).toBeInTheDocument();
  });
});
