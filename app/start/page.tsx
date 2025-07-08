'use client';

import { useState, useEffect } from 'react';
import { uploadApiKey, getUserApiKeys, deleteApiKey } from './actions';

const PROVIDERS = [
  { value: 'OPENAI_API_KEY', label: 'OpenAI' },
  { value: 'MISTRAL_API_KEY', label: 'Mistral' },
  { value: 'GEMINI_API_KEY', label: 'Gemini' },
];

export default function StartPage() {
  const [provider, setProvider] = useState(PROVIDERS[0].value);
  const [apiKey, setApiKey] = useState('');
  const [message, setMessage] = useState('');
  const [keys, setKeys] = useState<{ provider: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getUserApiKeys();
        setKeys(data);
      } catch (e) {
        setMessage('Failed to load keys');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      await uploadApiKey(provider, apiKey);
      setMessage('API key uploaded!');
      setApiKey('');
      // Refresh keys
      const data = await getUserApiKeys();
      setKeys(data);
    } catch (err) {
      setMessage('Error uploading key');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', padding: 24, border: '1px solid #eee', borderRadius: 8 }}>
      <h2>API Key Manager</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label>
          Provider:
          <select value={provider} onChange={e => setProvider(e.target.value)} style={{ color: 'black' }}>
            {PROVIDERS.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </label>
        <label>
          API Key:
          <input
            type="text"
            placeholder="Enter your API key"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            required
          />
        </label>
        <button type="submit">Upload</button>
      </form>
      {message && <div style={{ marginTop: 12 }}>{message}</div>}
      <div style={{ marginTop: 24 }}>
        <h4>Your API Keys</h4>
        {loading ? (
          <div>Loading...</div>
        ) : keys.length === 0 ? (
          <div>No API keys found.</div>
        ) : (
          <ul>
            {keys.map(k => (
              <li key={k.provider} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {PROVIDERS.find(p => p.value === k.provider)?.label || k.provider}
                <button
                  type="button"
                  aria-label={`Delete ${k.provider}`}
                  style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', fontSize: 18 }}
                  onClick={async () => {
                    if (window.confirm('Are you sure you want to delete this API key?')) {
                      try {
                        await deleteApiKey(k.provider);
                        setKeys(await getUserApiKeys());
                      } catch (err) {
                        setMessage('Error deleting key');
                      }
                    }
                  }}
                >
                  ❌
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 