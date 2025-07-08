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