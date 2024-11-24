import { supabase } from "@/integrations/supabase/client";
import { transformCompanyData } from "@/utils/companyTransformations";
import { Company } from "@/services/types";

export const fetchProjects = async (userId: string) => {
  if (!userId) return [];

  const { data: teamMembers } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("user_id", userId);

  const teamIds = teamMembers?.map(tm => tm.team_id) || [];

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .or(`created_by.eq.${userId}${teamIds.length > 0 ? `,team_id.in.(${teamIds.join(',')})` : ''}`)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const fetchProjectCompanies = async (projectId: string): Promise<Company[]> => {
  if (!projectId) return [];
  
  const { data, error } = await supabase
    .from("project_companies")
    .select(`
      companies (
        id,
        name,
        industry,
        website,
        created_at,
        created_by,
        reviews,
        sales_volume,
        growth,
        phone_number,
        email,
        review,
        notes,
        team_id
      )
    `)
    .eq("project_id", projectId);

  if (error) throw error;

  return (data || []).map(item => transformCompanyData(item.companies));
};

export const fetchAvailableCompanies = async (projectId: string): Promise<Company[]> => {
  if (!projectId) return [];
  
  const { data: existingCompanies } = await supabase
    .from("project_companies")
    .select("company_id")
    .eq("project_id", projectId);
  
  const existingIds = existingCompanies?.map(c => c.company_id) || [];
  
  const query = supabase
    .from("companies")
    .select("*");

  if (existingIds.length > 0) {
    query.not('id', 'in', `(${existingIds.join(',')})`);
  }

  const { data, error } = await query;

  if (error) throw error;
  
  return (data || []).map(transformCompanyData);
};