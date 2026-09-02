import { supabase } from '../supabase';

export const financeService = {
  async fetchUserData(userId) {
    const { data, error } = await supabase
      .from('monthlydata')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data?.data || null;
  },

  async saveUserData(userId, payload) {
    const { error } = await supabase
      .from('monthlydata')
      .upsert({
        id: userId,
        user_id: userId,
        data: payload,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
  }
};