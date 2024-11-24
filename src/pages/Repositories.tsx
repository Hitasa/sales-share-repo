import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useDebounce } from "@/hooks/useDebounce";
import { CompanyList } from "@/components/company/CompanyList";
import { CompanySearch } from "@/components/company/CompanySearch";
import { AddCompanyDialog } from "@/components/company/AddCompanyDialog";
import { fetchCompanies, searchCompanies, addCompany } from "@/services/api";
import { useLicense } from "@/hooks/useLicense";

const Repositories = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { checkFeatureAccess } = useLicense();

  const { data: companies = [], isLoading, error } = useQuery({
    queryKey: ["companies", debouncedSearch],
    queryFn: async () => {
      if (!checkFeatureAccess('VIEW_COMPANIES')) {
        throw new Error('Feature not available');
      }
      return debouncedSearch ? await searchCompanies(debouncedSearch) : await fetchCompanies();
    },
  });

  const addCompanyMutation = useMutation({
    mutationFn: async (newCompany: any) => {
      if (!checkFeatureAccess('CREATE_COMPANY')) {
        throw new Error('Feature not available');
      }
      return addCompany(newCompany);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["userCompanyRepository"] });
      toast({
        title: "Success",
        description: "Company added successfully",
      });
    },
  });

  const handleAddCompany = (formData: {
    name: string;
    industry: string;
    salesVolume: string;
    growth: string;
  }) => {
    if (!user) return;
    
    const newCompany = {
      ...formData,
      createdBy: user.id,
      sharedWith: [],
    };
    
    addCompanyMutation.mutate(newCompany);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  if (error) {
    return (
      <div className="container mx-auto py-20 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Access Restricted</h2>
          <p className="mt-2 text-gray-600">
            Please upgrade your license to access this feature.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-20 px-4 animate-fadeIn">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Company Repositories</h1>
        <AddCompanyDialog onAddCompany={handleAddCompany} />
      </div>

      <CompanySearch 
        searchQuery={searchQuery}
        onSearch={handleSearch}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <CompanyList companies={companies} />
      )}
    </div>
  );
};

export default Repositories;