import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import Winks from '../Winks';
import axios from 'axios';

jest.mock('axios', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

const mockedGet = axios.get as jest.Mock;

describe('Winks Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children correctly', async () => {
    mockedGet.mockResolvedValue({ data: { title: 'Test Title' } });
    
    render(
      <Winks apikey="test-key">
        <div>Test Content</div>
      </Winks>
    );
    
    // Wait for the loading state to be gone and content to appear
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('uses fallback data when provided', async () => {
    mockedGet.mockRejectedValue(new Error('network error'));
    
    const fallbackData = {
      title: 'Fallback Title',
      description: 'Fallback Description'
    };

    render(
      <Winks apikey="test-key" fallback={fallbackData}>
        <div>Test Content</div>
      </Winks>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});