import React from 'react';
import { render, screen } from '@testing-library/react';
import Winks from '../Winks';

// Mock axios
jest.mock('axios', () => ({
  get: jest.fn(),
}));
const axios = require('axios');

describe('Winks Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children correctly', async () => {
    axios.get.mockResolvedValue({ data: {} });
    render(
      <Winks apikey="test-key">
        <div>Test Content</div>
      </Winks>
    );
    await screen.findByText('Loading...');
    expect(await screen.findByText('Test Content')).toBeInTheDocument();
  });

  it('uses fallback data when provided', async () => {
    axios.get.mockRejectedValue(new Error('network'));
    const fallbackData = {
      title: 'Fallback Title',
      description: 'Fallback Description'
    };

    render(
      <Winks apikey="test-key" fallback={fallbackData}>
        <div>Test Content</div>
      </Winks>
    );

    expect(await screen.findByText('Test Content')).toBeInTheDocument();
  });
}); 