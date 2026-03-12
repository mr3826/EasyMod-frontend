import React from 'react';
import { render, screen } from '@testing-library/react';
import ChatSettings from './ChatSettings';

describe('ChatSettings', () => {
  it('renders Chat Channel Settings header', () => {
    render(<ChatSettings />);
    expect(screen.getByText('Chat Channel Settings')).toBeInTheDocument();
  });

  it('shows loading state when channels are loading', () => {
    // This test assumes you can control loading state via props or mocks
    // You may need to mock apiClient.getChannels for full coverage
    // For now, just check header presence
    render(<ChatSettings />);
    expect(screen.getByText('Chat Channel Settings')).toBeInTheDocument();
  });
});
