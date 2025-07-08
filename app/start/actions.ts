'use server';

import { createClient } from '@/utils/supabase/server';
import { encrypt } from '@/utils/encryption';

export async function uploadApiKey(provider: string, apiKey: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const encryptedKey = encrypt(apiKey);
  const { error } = await supabase
    .from('api_keys')
    .upsert(
      { user_id: user.id, provider, api_key: encryptedKey },
      { onConflict: 'user_id,provider' }
    );
  if (error) throw error;
  return { success: true };
}

export async function getUserApiKeys() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('api_keys')
    .select('provider, api_key');
  if (error) throw error;
  return data || [];
}

export async function deleteApiKey(provider: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { error } = await supabase
    .from('api_keys')
    .delete()
    .eq('user_id', user.id)
    .eq('provider', provider);
  if (error) throw error;
  return { success: true };
}

export async function getUserCampaigns() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('campaign')
    .select('id, description')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createCampaign(description: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('campaign')
    .insert({ user_id: user.id, description })
    .select('id, description')
    .single();
  if (error) throw error;
  return data;
}

export async function hasVoterRecords() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  // Find all campaigns for this user
  const { data: campaigns, error: campaignError } = await supabase
    .from('campaign')
    .select('id')
    .eq('user_id', user.id);
  if (campaignError) throw campaignError;
  if (!campaigns || campaigns.length === 0) return false;
  // Check if any voter_records exist for these campaigns
  const campaignIds = campaigns.map(c => c.id);
  const { count, error: voterError } = await supabase
    .from('voter_records')
    .select('id', { count: 'exact', head: true })
    .in('campaign_id', campaignIds);
  if (voterError) throw voterError;
  return (count ?? 0) > 0;
}

// CSV upload action (expects: csvText, campaignId)
export async function uploadVoterRecords(csvText: string, campaignId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  // Parse CSV
  const lines = csvText.trim().split(/\r?\n/);
  const headers = lines[0].split(',').map(h => h.trim());
  const expected = ['First_Name','Last_Name','Street_Number','Street_Name','Street_Type','Street_Dir_Suffix'];
  if (headers.join(',') !== expected.join(',')) {
    throw new Error('CSV headers do not match expected format.');
  }
  const records = lines.slice(1).map(line => {
    const [first_name, last_name, street_number, street_name, street_type, street_dir_suffix] = line.split(',').map(s => s.trim());
    return {
      campaign_id: campaignId,
      first_name,
      last_name,
      street_number,
      street_name,
      street_type,
      street_dir_suffix
    };
  });
  // Insert records
  const { error } = await supabase.from('voter_records').insert(records);
  if (error) throw error;
  return { success: true, count: records.length };
}

export async function getVoterRecordsForCampaign(campaignId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('voter_records')
    .select('*')
    .eq('campaign_id', campaignId)
    .limit(50);
  if (error) throw error;
  return data || [];
} 