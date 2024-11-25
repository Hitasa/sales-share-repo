import { supabase } from '@/integrations/supabase/client';
import { Company } from './types';

export const fetchUserCompanyRepository = async (userId: string): Promise<Company[]> => {
  if (!userId) return [];

  // First, get the company IDs from the repository
  const { data: repositoryData, error: repositoryError } = await supabase
    .from('company_repositories')
    .select('company_id')
    .eq('user_id', userId);

  if (repositoryError) throw repositoryError;

  if (!repositoryData || repositoryData.length === 0) return [];

  // Then fetch the actual companies
  const { data: companies, error: companiesError } = await supabase
    .from('companies')
    .select('*')
    .in('id', repositoryData.map(row => row.company_id));

  if (companiesError) throw companiesError;
  return companies || [];
};

export const addToUserRepository = async (companyId: string, userId: string): Promise<void> => {
  try {
    // First check if the company exists and is accessible to the user
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .maybeSingle();

    if (companyError) throw companyError;
    
    if (!company) {
      throw new Error('Company not found or not accessible');
    }

    // Check if the company is already in the repository
    const { data: existingEntry, error: existingError } = await supabase
      .from('company_repositories')
      .select('id')
      .eq('company_id', companyId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existingError) throw existingError;

    if (existingEntry) {
      throw new Error('Company is already in your repository');
    }

    // Add to repository
    const { error: insertError } = await supabase
      .from('company_repositories')
      .insert([{ company_id: companyId, user_id: userId }]);

    if (insertError) {
      throw insertError;
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to add company to repository');
  }
};

export const removeFromUserRepository = async (companyId: string, userId: string): Promise<void> => {
  const { error } = await supabase
    .from('company_repositories')
    .delete()
    .eq('company_id', companyId)
    .eq('user_id', userId);

  if (error) throw error;
};