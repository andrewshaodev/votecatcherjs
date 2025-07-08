'use client';

import { useState, useEffect } from 'react';
import { uploadApiKey, getUserApiKeys, deleteApiKey, getUserCampaigns, createCampaign } from './actions';

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
  const [campaigns, setCampaigns] = useState<{ id: string, description: string }[]>([]);
  const [campaignLoading, setCampaignLoading] = useState(false);
  const [campaignDesc, setCampaignDesc] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);

  const fetchCampaigns = async () => {
    setCampaignLoading(true);
    try {
      const data = await getUserCampaigns();
      setCampaigns(data);
      if (data.length > 0) setSelectedCampaign(data[0].id);
    } catch {
      setCampaigns([]);
    } finally {
      setCampaignLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const data = await getUserApiKeys();
        setKeys(data);
      } catch {
        // Do nothing, just leave keys as []
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (keys.length > 0) {
      fetchCampaigns();
    }
  }, [keys.length]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    try {
      await uploadApiKey(provider, apiKey);
      setMessage('API key uploaded!');
      setApiKey('');
      // Refresh keys
      const data = await getUserApiKeys();
      setKeys(data);
    } catch {
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
      <div className="mt-8">
        <h4 className="font-semibold mb-2">Your API Keys</h4>
        {loading ? (
          <div>Loading...</div>
        ) : keys.length === 0 ? (
          <div>No API keys found.</div>
        ) : (
          <>
            <ul className="space-y-2">
              {keys.map(k => (
                <li key={k.provider} className="flex items-center gap-2">
                  <span className="flex-1">{PROVIDERS.find(p => p.value === k.provider)?.label || k.provider}</span>
                  <button
                    type="button"
                    aria-label={`Delete ${k.provider}`}
                    className="text-red-500 hover:text-red-700 text-lg"
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to delete this API key?')) {
                        try {
                          await deleteApiKey(k.provider);
                          setKeys(await getUserApiKeys());
                        } catch {
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
            {/* Campaign logic below */}
            {keys.length > 0 && (
              <div className="mt-8">
                <h4 className="font-semibold mb-2">Campaign</h4>
                {campaignLoading ? (
                  <div>Loading campaigns...</div>
                ) : campaigns.length === 0 ? (
                  <form
                    onSubmit={async e => {
                      e.preventDefault();
                      try {
                        const newCampaign = await createCampaign(campaignDesc);
                        setCampaigns([newCampaign]);
                        setSelectedCampaign(newCampaign.id);
                        setCampaignDesc('');
                      } catch {
                        setMessage('Error creating campaign');
                      }
                    }}
                    className="flex flex-col gap-2"
                  >
                    <label className="font-medium">Create a campaign description:</label>
                    <input
                      type="text"
                      value={campaignDesc}
                      onChange={e => setCampaignDesc(e.target.value)}
                      required
                      className="mt-1 px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button type="submit" className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition mt-2">
                      Create Campaign
                    </button>
                  </form>
                ) : (
                  <div>
                    <label className="font-medium">Select a campaign:</label>
                    <select
                      value={selectedCampaign ?? ''}
                      onChange={e => setSelectedCampaign(e.target.value)}
                      style={{ color: 'black', backgroundColor: 'white' }}
                    >
                      {campaigns.map(c => (
                        <option key={c.id} value={c.id}>{c.description}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 