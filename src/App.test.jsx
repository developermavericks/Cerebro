import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import App from './App';

describe('Cerebro Studio Architecture & Component Suite', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ user: { name: 'Maverick Test', email: 'test@themavericksindia.com' } })
    });
  });

  const loginToApp = async () => {
    render(<App />);
    const emailInput = screen.getByPlaceholderText('user@themavericksindia.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const signInBtn = screen.getByText(/Sign In to Cerebro/i);

    fireEvent.change(emailInput, { target: { value: 'test@themavericksindia.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(signInBtn);

    await waitFor(() => {
      expect(screen.getByText(/Report Analysis/i)).toBeDefined();
    }, { timeout: 3000 });
  };

  it('renders main application navigation and switches to Cerebro Studio tab', async () => {
    await loginToApp();
    
    const reportAnalysisTab = screen.getByText(/Report Analysis/i);
    fireEvent.click(reportAnalysisTab);

    const briefingCard = await screen.findByText(/Q2 Competitor Trajectory/i);
    fireEvent.click(briefingCard);

    expect(screen.getByText(/Present View/i)).toBeDefined();
    expect(screen.getByText(/History Log/i)).toBeDefined();
  });

  it('allows opening History Modal to track document audit logs', async () => {
    await loginToApp();
    const reportAnalysisTab = screen.getByText(/Report Analysis/i);
    fireEvent.click(reportAnalysisTab);

    const briefingCard = await screen.findByText(/Q2 Competitor Trajectory/i);
    fireEvent.click(briefingCard);

    const historyBtn = screen.getByText(/History Log \(/i);
    fireEvent.click(historyBtn);

    expect(screen.getByText(/Audit & Change History Log/i)).toBeDefined();
  });

  it('allows entering Present View / Reader Mode', async () => {
    await loginToApp();
    const reportAnalysisTab = screen.getByText(/Report Analysis/i);
    fireEvent.click(reportAnalysisTab);

    const briefingCard = await screen.findByText(/Q2 Competitor Trajectory/i);
    fireEvent.click(briefingCard);

    const presentBtn = screen.getByText(/Present View/i);
    fireEvent.click(presentBtn);

    expect(screen.getByText(/Present View/i)).toBeDefined();
  });

  it('allows creating a new report with custom topic and keywords and opening keyword charts tab', async () => {
    await loginToApp();
    const reportAnalysisTab = screen.getByText(/Report Analysis/i);
    fireEvent.click(reportAnalysisTab);

    // Click on "Create Report" button to open modal
    const createBtn = screen.getByText(/Create Report/i);
    fireEvent.click(createBtn);

    // Check that modal inputs are present
    const titleInput = screen.getByPlaceholderText(/e.g. Q3 APAC Generative/i);
    const keywordsInput = screen.getByPlaceholderText(/e.g. Nvidia, OpenAI/i);
    const submitBtn = screen.getByText(/Generate Assessment/i);

    fireEvent.change(titleInput, { target: { value: 'AI Strategy Report' } });
    fireEvent.change(keywordsInput, { target: { value: 'Google, Anthropic' } });

    // Submit report creation form
    fireEvent.click(submitBtn);

    // Verify report card is created (should show title)
    expect(await screen.findByText('AI Strategy Report')).toBeDefined();

    // Click "Insert Analytics Chart" (which is also "Add Chart") button
    const insertChartBtn = screen.getByText(/Insert Analytics Chart/i);
    fireEvent.click(insertChartBtn);

    // Verify right sidebar is open and tab headers exist
    expect(screen.getByText(/Keyword Charts/i)).toBeDefined();
    expect(screen.getByText(/Chart Builder/i)).toBeDefined();

    // Switch to Keyword Charts tab
    const keywordTabBtn = screen.getByText(/Keyword Charts/i);
    fireEvent.click(keywordTabBtn);

    // Should render active context info
    expect(screen.getByText(/Active Telemetry Context/i)).toBeDefined();
    expect(screen.getByText(/Google, Anthropic/i)).toBeDefined();
  });

  it('allows creating custom charts using Build with AI panel', async () => {
    await loginToApp();
    const reportAnalysisTab = screen.getByText(/Report Analysis/i);
    fireEvent.click(reportAnalysisTab);

    // Open existing report
    const briefingCard = await screen.findByText(/Q2 Competitor Trajectory/i);
    fireEvent.click(briefingCard);

    // Click "Insert Analytics Chart" to open Right Drawer
    const insertChartBtn = screen.getByText(/Insert Analytics Chart/i);
    fireEvent.click(insertChartBtn);

    // Verify "Build with AI" tab button exists
    const aiTabBtn = screen.getByText(/Build with AI/i);
    expect(aiTabBtn).toBeDefined();

    // Switch to Build with AI tab
    fireEvent.click(aiTabBtn);

    // Type a prompt
    const textarea = screen.getByPlaceholderText(/e.g. Create a donut/i);
    fireEvent.change(textarea, { target: { value: 'Create a bar chart for top publications' } });

    // Click "Build Chart with AI" button
    const buildBtn = screen.getByText(/Build Chart with AI/i);
    fireEvent.click(buildBtn);

    // Wait for simulated AI loader (1.5 seconds)
    await waitFor(() => {
      expect(screen.getByText(/AI Recommendation Spec/i)).toBeDefined();
    }, { timeout: 3500 });

    // Verify the mock suggestions
    expect(screen.getByText(/Bar Chart \(Publications\)/i)).toBeDefined();
    
    // Click "Embed Chart"
    const embedBtn = screen.getByText(/Embed Chart/i);
    fireEvent.click(embedBtn);
  });
});
