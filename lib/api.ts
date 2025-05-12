// Base API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const SENTIMENT_API_URL = process.env.NEXT_PUBLIC_SENTIMENT_API_URL || 'http://localhost:8001';

// Types
export interface PredictionResponse {
  symbol: string;
  timestamp: string;
  direction: 'Up' | 'Down';
  confidence: number;
  features_used: number;
}

export interface SentimentItem {
  title: string;
  url: string;
  publishedAt: string;
  score: number;
  label: string;
}

export interface SentimentResponse {
  symbol: string;
  timestamp: string;
  results: SentimentItem[];
  avg_score: number;
  sentiment_summary: string;
}

export interface HistoryItem {
  symbol: string;
  timestamp: string;
  prediction: string;
  actual: string;
  confidence: number;
}

export interface HistoryResponse {
  history: HistoryItem[];
  total: number;
  page: number;
  limit: number;
}

// Helper for making authenticated requests
async function fetchWithAuth(url: string, options: RequestInit = {}, token: string) {
  if (!token) {
    throw new Error('Authentication token is required');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `API error: ${response.status}`);
  }

  return response.json();
}

// API functions
export async function fetchPredict(symbol: string, token: string): Promise<PredictionResponse> {
  return fetchWithAuth(`${API_URL}/predict/${symbol}`, {
    method: 'GET',
  }, token);
}

export async function fetchSentiment(symbol: string): Promise<SentimentResponse> {
  const response = await fetch(`${SENTIMENT_API_URL}/sentiment/${symbol}`);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Sentiment API error: ${response.status}`);
  }
  
  return response.json();
}

export async function fetchHistory(token: string, page = 1, limit = 10): Promise<HistoryResponse> {
  return fetchWithAuth(`${API_URL}/history?page=${page}&limit=${limit}`, {
    method: 'GET',
  }, token);
}

export async function addToWatchlist(symbol: string, token: string): Promise<{ success: boolean }> {
  return fetchWithAuth(`${API_URL}/watchlist`, {
    method: 'POST',
    body: JSON.stringify({ symbol }),
  }, token);
}

export async function removeFromWatchlist(symbol: string, token: string): Promise<{ success: boolean }> {
  return fetchWithAuth(`${API_URL}/watchlist/${symbol}`, {
    method: 'DELETE',
  }, token);
}

export async function getWatchlist(token: string): Promise<{ symbols: string[] }> {
  return fetchWithAuth(`${API_URL}/watchlist`, {
    method: 'GET',
  }, token);
} 