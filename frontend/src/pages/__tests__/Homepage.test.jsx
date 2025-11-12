import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Homepage from '../Homepage';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Homepage', () => {
  it('should render main heading', () => {
    render(
      <BrowserRouter>
        <Homepage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Apprenez à trader, simplement/i)).toBeInTheDocument();
  });

  it('should render tagline', () => {
    render(
      <BrowserRouter>
        <Homepage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Forex \+ Crypto\. Simulation\. Temps réel\. Zéro risque\./i)).toBeInTheDocument();
  });

  it('should have Commencer maintenant button', () => {
    render(
      <BrowserRouter>
        <Homepage />
      </BrowserRouter>
    );

    const startButton = screen.getByRole('button', { name: /commencer maintenant/i });
    expect(startButton).toBeInTheDocument();
  });

  it('should navigate to /learn when Commencer maintenant is clicked', () => {
    render(
      <BrowserRouter>
        <Homepage />
      </BrowserRouter>
    );

    const startButton = screen.getByRole('button', { name: /commencer maintenant/i });
    fireEvent.click(startButton);

    expect(mockNavigate).toHaveBeenCalledWith('/learn');
  });

  it('should have link to landing page', () => {
    render(
      <BrowserRouter>
        <Homepage />
      </BrowserRouter>
    );

    const learnMoreLink = screen.getByRole('link', { name: /en savoir plus/i });
    expect(learnMoreLink).toBeInTheDocument();
    expect(learnMoreLink).toHaveAttribute('href', '/landingpage');
  });

  it('should render video element', () => {
    render(
      <BrowserRouter>
        <Homepage />
      </BrowserRouter>
    );

    const video = document.querySelector('video');
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute('src', '/videoHomepage_faststart.mp4');
    expect(video).toHaveAttribute('autoplay');
    expect(video).toHaveProperty('muted', true);
    expect(video).toHaveAttribute('loop');
  });
});
