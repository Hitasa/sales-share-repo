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
    // Check if the company is already in the repository
    const { data: existingEntries, error: checkError } = await supabase
      .from('company_repositories')
      .select('id')
      .eq('company_id', companyId)
      .eq('user_id', userId);

    if (checkError) {
      console.error('Error checking repository:', checkError);
      throw checkError;
    }

    if (existingEntries && existingEntries.length > 0) {
      throw new Error('Company is already in your repository');
    }

    // Add to repository directly since we now have public access to companies
    const { error: insertError } = await supabase
      .from('company_repositories')
      .insert([{ 
        company_id: companyId, 
        user_id: userId 
      }]);

    if (insertError) {
      console.error('Error inserting into repository:', insertError);
      throw insertError;
    }
  } catch (error) {
    console.error('Error in addToUserRepository:', error);
    throw error instanceof Error 
      ? error 
      : new Error('Failed to add company to repository');
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