import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import Winks from '../Winks';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Winks Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children correctly', async () => {
    mockedAxios.get.mockResolvedValue({ data: { title: 'Test Title' } });
    
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
    mockedAxios.get.mockRejectedValue(new Error('network error'));
    
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