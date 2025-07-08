'use client';

import { useState, useEffect } from 'react';
import { uploadApiKey, getUserApiKeys, deleteApiKey, getUserCampaigns, createCampaign, hasVoterRecords, uploadVoterRecords } from './actions';
import { useRouter } from 'next/navigation';

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
  // Add a constant for the create new campaign option
  const CREATE_NEW_OPTION = '__CREATE_NEW__';
  const [hasVoters, setHasVoters] = useState<boolean | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploadingCsv, setUploadingCsv] = useState(false);

  const router = useRouter();

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

  useEffect(() => {
    const check = async () => {
      if (selectedCampaign && selectedCampaign !== CREATE_NEW_OPTION) {
        try {
          setHasVoters(await hasVoterRecords());
        } catch {
          setHasVoters(false);
        }
      }
    };
    check();
  }, [selectedCampaign, campaigns.length]);

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
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#101010' }}>
      <div style={{ width: '100%', maxWidth: 420, background: '#18181b', color: 'white', borderRadius: 12, boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)', padding: '2.5rem 2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', textAlign: 'center' }}>Get Started</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label style={{ fontWeight: 500 }}>OCR Provider:
            <select
              value={provider}
              onChange={e => setProvider(e.target.value)}
              style={{ color: 'black', backgroundColor: 'white', marginTop: 4, padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc', width: '100%' }}
            >
              {PROVIDERS.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </label>
          <label style={{ fontWeight: 500 }}>API Key:
            <input
              type="text"
              placeholder="Enter your API key"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              required
              style={{ marginTop: 4, padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc', width: '100%', color: 'black', backgroundColor: 'white' }}
            />
          </label>
          <button type="submit" style={{ marginTop: '1rem', padding: '0.5rem', borderRadius: 4, background: '#2563eb', color: 'white', border: 'none', fontWeight: 600 }}>Upload</button>
        </form>
        {message && <div style={{ marginTop: 12, textAlign: 'center', color: 'green' }}>{message}</div>}
        <div style={{ marginTop: 32 }}>
          <h4 style={{ fontWeight: 600, marginBottom: 8 }}>Your API Keys</h4>
          {loading ? (
            <div>Loading...</div>
          ) : keys.length === 0 ? (
            <div>No API keys found.</div>
          ) : (
            <>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {keys.map(k => (
                  <li key={k.provider} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ flex: 1 }}>{PROVIDERS.find(p => p.value === k.provider)?.label || k.provider}</span>
                    <button
                      type="button"
                      aria-label={`Delete ${k.provider}`}
                      style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', fontSize: 18 }}
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
                <div style={{ marginTop: 32 }}>
                  <h4 style={{ fontWeight: 600, marginBottom: 8 }}>Campaign</h4>
                  {campaignLoading ? (
                    <div>Loading campaigns...</div>
                  ) : (
                    <>
                      <label style={{ fontWeight: 500 }}>Select or create a campaign:</label>
                      <select
                        value={selectedCampaign ?? ''}
                        onChange={e => {
                          const val = e.target.value;
                          setSelectedCampaign(val);
                          if (val !== CREATE_NEW_OPTION) setCampaignDesc('');
                        }}
                        style={{ color: 'black', backgroundColor: 'white', marginTop: 4, padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc', width: '100%' }}
                      >
                        {campaigns.map(c => (
                          <option key={c.id} value={c.id}>{c.description}</option>
                        ))}
                        <option value={CREATE_NEW_OPTION}>Create new campaign...</option>
                      </select>
                      {selectedCampaign === CREATE_NEW_OPTION && (
                        <form
                          onSubmit={async e => {
                            e.preventDefault();
                            try {
                              const newCampaign = await createCampaign(campaignDesc);
                              setCampaigns([...campaigns, newCampaign]);
                              setSelectedCampaign(newCampaign.id);
                              setCampaignDesc('');
                            } catch {
                              setMessage('Error creating campaign');
                            }
                          }}
                          style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}
                        >
                          <input
                            type="text"
                            value={campaignDesc}
                            onChange={e => setCampaignDesc(e.target.value)}
                            required
                            placeholder="Campaign description"
                            style={{ padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc', width: '100%', color: 'black', backgroundColor: 'white' }}
                          />
                          <button type="submit" style={{ padding: '0.5rem', borderRadius: 4, background: '#2563eb', color: 'white', border: 'none', fontWeight: 600 }}>
                            Create Campaign
                          </button>
                        </form>
                      )}
                      {selectedCampaign && selectedCampaign !== CREATE_NEW_OPTION && hasVoters === false && (
                        <form
                          onSubmit={async e => {
                            e.preventDefault();
                            if (!csvFile) return;
                            setUploadingCsv(true);
                            try {
                              const text = await csvFile.text();
                              await uploadVoterRecords(text, selectedCampaign);
                              setHasVoters(true);
                              setMessage('Voter records uploaded!');
                              router.push('/app/desktop');
                            } catch (err) {
                              setMessage('Error uploading voter records');
                            } finally {
                              setUploadingCsv(false);
                            }
                          }}
                          style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}
                        >
                          <label style={{ fontWeight: 500 }}>Upload voter records CSV:</label>
                          <input
                            type="file"
                            accept=".csv"
                            onChange={e => setCsvFile(e.target.files?.[0] ?? null)}
                            style={{ color: 'white' }}
                          />
                          <button type="submit" disabled={!csvFile || uploadingCsv} style={{ padding: '0.5rem', borderRadius: 4, background: '#2563eb', color: 'white', border: 'none', fontWeight: 600 }}>
                            {uploadingCsv ? 'Uploading...' : 'Upload'}
                          </button>
                        </form>
                      )}
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 