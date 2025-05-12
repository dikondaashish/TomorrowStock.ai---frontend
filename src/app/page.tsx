'use client';

import { useState } from 'react';

interface PredictionData {
  symbol: string;
  timestamp: string;
  direction: 'Up' | 'Down';
  confidence: number;
  features_used: number;
}

interface SentimentResult {
  title: string;
  url: string;
  publishedAt: string;
  score: number;
  label: string;
}

interface SentimentData {
  symbol: string;
  timestamp: string;
  results: SentimentResult[];
  avg_score: number;
  sentiment_summary: string;
}

export default function Home() {
  const [symbol, setSymbol] = useState('');
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [sentiment, setSentiment] = useState<SentimentData | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!symbol) {
      setError('Please enter a stock symbol');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Get prediction
      const predRes = await fetch(`http://localhost:8000/predict/${symbol}`);
      if (!predRes.ok) {
        throw new Error(`Prediction API error: ${predRes.status}`);
      }
      const predData = await predRes.json();
      setPrediction(predData);
      
      // Get sentiment
      const sentRes = await fetch(`http://localhost:8001/sentiment/${symbol}`);
      if (!sentRes.ok) {
        throw new Error(`Sentiment API error: ${sentRes.status}`);
      }
      const sentData = await sentRes.json();
      setSentiment(sentData);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Stock Prediction Dashboard</h1>
      
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              className="input flex-1"
              placeholder="Enter stock symbol (e.g., AAPL, MSFT)"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Predict'}
            </button>
          </div>
          {error && <p className="text-danger mt-2">{error}</p>}
        </form>

        {prediction && (
          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-3">Price Prediction</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-neutral-500">Symbol</p>
                <p className="font-medium">{prediction.symbol}</p>
              </div>
              <div>
                <p className="text-neutral-500">Direction</p>
                <p className={`font-medium ${prediction.direction === 'Up' ? 'text-success' : 'text-danger'}`}>
                  {prediction.direction}
                </p>
              </div>
              <div>
                <p className="text-neutral-500">Confidence</p>
                <p className="font-medium">{(prediction.confidence * 100).toFixed(2)}%</p>
              </div>
              <div>
                <p className="text-neutral-500">Timestamp</p>
                <p className="font-medium">{new Date(prediction.timestamp).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {sentiment && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-3">Sentiment Analysis</h2>
            <div className="mb-4">
              <p className="text-neutral-500">Average Sentiment</p>
              <p className={`font-medium ${sentiment.avg_score > 0 ? 'text-success' : 'text-danger'}`}>
                {sentiment.avg_score > 0 ? 'Positive' : 'Negative'} ({sentiment.avg_score.toFixed(2)})
              </p>
            </div>
            
            <h3 className="font-medium mb-2">Headlines</h3>
            <ul className="space-y-3">
              {sentiment.results.slice(0, 5).map((item, index) => (
                <li key={index} className="border-b border-neutral-200 dark:border-neutral-700 pb-2">
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {item.title}
                  </a>
                  <p className={`text-sm ${item.score > 0 ? 'text-success' : 'text-danger'}`}>
                    {item.label} ({item.score.toFixed(2)})
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
