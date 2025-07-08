'use client';

import { useState, useEffect } from 'react';
import { getUserCampaigns, getVoterRecordsForCampaign } from '../start/actions';

const OCR_MODELS = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'mistral', label: 'Mistral' },
  { value: 'gemini', label: 'Gemini' },
];

const DEFAULT_PROMPT =
  "Using the written text in the image create a list of dictionaries where each dictionary consists of keys 'Name', 'Address', 'Date', and 'Ward'. Fill in the values of each dictionary with the correct entries for each key. Write all the values of the dictionary in full. Only output the list of dictionaries. No other intro text is necessary.";

export default function DesktopPage() {
  const [ocrModel, setOcrModel] = useState(OCR_MODELS[0].value);
  const [ocrPrompt, setOcrPrompt] = useState(DEFAULT_PROMPT);
  const [campaigns, setCampaigns] = useState<{ id: string, description: string }[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [voterRecords, setVoterRecords] = useState<any[]>([]);
  const [voterLoading, setVoterLoading] = useState(false);
  const [ballotSignatureFile, setBallotSignatureFile] = useState<File | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getUserCampaigns();
        setCampaigns(data);
        setSelectedCampaign(null); // Do not auto-select
      } catch {
        setCampaigns([]);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedCampaign) {
      setVoterRecords([]);
      return;
    }
    setVoterLoading(true);
    getVoterRecordsForCampaign(selectedCampaign)
      .then(setVoterRecords)
      .catch(() => setVoterRecords([]))
      .finally(() => setVoterLoading(false));
  }, [selectedCampaign]);

  const selectedCampaignObj = campaigns.find(c => c.id === selectedCampaign);

  return (
    <div style={{ minHeight: '100vh', width: '100vw', display: 'flex', background: '#101010', color: 'white', margin: 0, padding: 0 }}>
      {/* Sidebar */}
      <aside style={{ height: '100vh', width: 320, background: '#18181b', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: 32, boxShadow: '2px 0 8px 0 rgba(0,0,0,0.08)', margin: 0, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 16 }}>Campaign</h2>
          {campaigns.length === 0 ? (
            <div style={{ fontWeight: 500, fontSize: '1.1rem' }}>No campaigns found</div>
          ) : (
            <>
              <select
                value={selectedCampaign ?? ''}
                onChange={e => setSelectedCampaign(e.target.value || null)}
                style={{ color: 'black', backgroundColor: 'white', marginBottom: 8, padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc', width: '100%' }}
              >
                <option value="">Choose a Campaign</option>
                {campaigns.map(c => (
                  <option key={c.id} value={c.id}>{c.description}</option>
                ))}
              </select>
            </>
          )}
        </div>
        <div>
          <label style={{ fontWeight: 600, marginBottom: 8, display: 'block' }}>OCR Models</label>
          <select
            value={ocrModel}
            onChange={e => setOcrModel(e.target.value)}
            style={{ width: '100%', color: 'black', backgroundColor: 'white', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }}
          >
            {OCR_MODELS.filter(m => m.value).map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ fontWeight: 600, marginBottom: 8, display: 'block' }}>OCR Prompt</label>
          <textarea
            value={ocrPrompt}
            onChange={e => setOcrPrompt(e.target.value)}
            rows={7}
            style={{ width: '100%', padding: '0.75rem', borderRadius: 4, border: '1px solid #ccc', color: 'black', backgroundColor: 'white', fontSize: '1rem', resize: 'vertical' }}
          />
        </div>
        <div>
          <label style={{ fontWeight: 600, marginBottom: 8, display: 'block' }}>Ballot Signatures</label>
          <input
            type="file"
            id="ballot-signatures-upload"
            style={{ display: 'none' }}
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) setBallotSignatureFile(file);
            }}
          />
          <button
            type="button"
            style={{ width: '100%', padding: '0.5rem', borderRadius: 4, background: '#2563eb', color: 'white', border: 'none', fontWeight: 600, marginTop: 4 }}
            onClick={() => document.getElementById('ballot-signatures-upload')?.click()}
          >
            Upload Ballot Signatures
          </button>
          {ballotSignatureFile && (
            <div style={{ marginTop: 8, color: '#a3e635', fontSize: 14 }}>
              Selected: {ballotSignatureFile.name}
            </div>
          )}
        </div>
      </aside>
      {/* Main content placeholder */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 48 }}>
        <div style={{ width: '90%', maxWidth: 900 }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 16 }}>Voter Records</h2>
          {voterLoading ? (
            <div>Loading voter records...</div>
          ) : !selectedCampaign ? (
            <div>Choose a Campaign</div>
          ) : voterRecords.length === 0 ? (
            <div>No voter records found for this campaign.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: '#222', color: 'white' }}>
                <thead>
                  <tr>
                    {Object.keys(voterRecords[0])
                      .filter(key => !['id', 'created_at', 'campaign_id'].includes(key))
                      .map(key => {
                        const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                        return (
                          <th key={key} style={{ borderBottom: '1px solid #444', padding: '0.5rem', textAlign: 'left' }}>{label}</th>
                        );
                      })}
                  </tr>
                </thead>
                <tbody>
                  {voterRecords.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #333' }}>
                      {Object.entries(row)
                        .filter(([key]) => !['id', 'created_at', 'campaign_id'].includes(key))
                        .map(([key, val], j) => (
                          <td key={j} style={{ padding: '0.5rem', borderBottom: '1px solid #333' }}>{String(val)}</td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 