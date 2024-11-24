import { Company } from "@/services/types";

export const transformCompanyData = (company: any): Company => ({
  id: company.id,
  name: company.name,
  industry: company.industry || undefined,
  salesVolume: company.sales_volume || undefined,
  growth: company.growth || undefined,
  website: company.website || undefined,
  phoneNumber: company.phone_number || undefined,
  email: company.email || undefined,
  review: company.review || undefined,
  notes: company.notes || undefined,
  createdBy: company.created_by || "",
  team_id: company.team_id,
  sharedWith: [],
  reviews: company.reviews || [],
});