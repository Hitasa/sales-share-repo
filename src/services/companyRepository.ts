import { supabase } from '@/integrations/supabase/client';
import { Company } from './types';

export const fetchUserCompanyRepository = async (userId: string): Promise<Company[]> => {
  if (!userId) return [];

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .in('id', (
      await supabase
        .from('company_repositories')
        .select('company_id')
        .eq('user_id', userId)
    ).data?.map(row => row.company_id) || []);

  if (error) throw error;
  return data || [];
};

export const addToUserRepository = async (companyId: string, userId: string): Promise<void> => {
  const { error } = await supabase
    .from('company_repositories')
    .insert([{ company_id: companyId, user_id: userId }]);

  if (error) throw error;
};

export const removeFromUserRepository = async (companyId: string, userId: string): Promise<void> => {
  const { error } = await supabase
    .from('company_repositories')
    .delete()
    .eq('company_id', companyId)
    .eq('user_id', userId);

  if (error) throw error;
};